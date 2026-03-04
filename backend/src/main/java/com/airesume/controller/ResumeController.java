package com.airesume.controller;

import com.airesume.entity.AnalysisResult;
import com.airesume.entity.Resume;
import com.airesume.entity.User;
import com.airesume.repository.AnalysisResultRepository;
import com.airesume.repository.ResumeRepository;
import com.airesume.repository.UserRepository;
import com.airesume.service.AiAnalysisService;
import com.airesume.service.PdfParserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*") // Allow requests from our frontend
public class ResumeController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    private final PdfParserService pdfParserService;
    private final AiAnalysisService aiAnalysisService;
    private final ResumeRepository resumeRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final com.airesume.service.PdfGeneratorService pdfGeneratorService;
    private final com.airesume.service.DocxGeneratorService docxGeneratorService;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;

    public ResumeController(PdfParserService pdfParserService,
            AiAnalysisService aiAnalysisService,
            ResumeRepository resumeRepository,
            AnalysisResultRepository analysisResultRepository,
            com.airesume.service.PdfGeneratorService pdfGeneratorService,
            com.airesume.service.DocxGeneratorService docxGeneratorService,
            UserRepository userRepository,
            TemplateEngine templateEngine) {
        this.pdfParserService = pdfParserService;
        this.aiAnalysisService = aiAnalysisService;
        this.resumeRepository = resumeRepository;
        this.analysisResultRepository = analysisResultRepository;
        this.pdfGeneratorService = pdfGeneratorService;
        this.docxGeneratorService = docxGeneratorService;
        this.userRepository = userRepository;
        this.templateEngine = templateEngine;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            String parsedText = pdfParserService.extractTextFromPdf(file);

            Resume resume = new Resume();
            resume.setFileName(file.getOriginalFilename());
            resume.setExtractedText(parsedText);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isPro = false;
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                    resume.setUser(user);
                });

                isPro = userRepository.findByEmail(auth.getName())
                        .map(User::isPro).orElse(false);
            }

            // Immediately run phase 1 semantic document structure parsing!
            com.airesume.entity.ParsedResume parsedStructure = aiAnalysisService.parseStructuredResume(parsedText,
                    isPro);
            if (parsedStructure != null) {
                parsedStructure.setResume(resume);
                resume.setParsedResume(parsedStructure);
            }

            Resume savedResume = resumeRepository.save(resume);
            return ResponseEntity.ok(Map.of("resumeId", savedResume.getId(), "message", "Upload successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getResumeHistory() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByEmail(auth.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            java.util.List<Resume> resumes = resumeRepository.findAllByUserOrderByUploadDateDesc(user);

            java.util.List<Map<String, Object>> response = new java.util.ArrayList<>();
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy");

            for (Resume r : resumes) {
                int atsScore = analysisResultRepository.findByResumeId(r.getId())
                        .map(AnalysisResult::getAtsScore)
                        .orElse(0);

                String createdAt = r.getUploadDate() != null ? r.getUploadDate().format(formatter)
                        : "Recently analyzed";

                response.add(Map.of(
                        "id", r.getId(),
                        "fileName", r.getFileName() != null ? r.getFileName() : "Resume #" + r.getId(),
                        "label", r.getLabel() != null ? r.getLabel() : "",
                        "atsScore", atsScore,
                        "createdAt", createdAt));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch history: " + e.getMessage()));
        }
    }

    @PatchMapping("/{resumeId}/label")
    public ResponseEntity<?> updateResumeLabel(@PathVariable Long resumeId, @RequestBody Map<String, String> request) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));
            String newLabel = request.get("label");
            if (newLabel != null) {
                resume.setLabel(newLabel);
                resumeRepository.save(resume);
            }
            return ResponseEntity.ok(Map.of("message", "Label updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<?> deleteResume(@PathVariable Long resumeId) {
        try {
            if (!resumeRepository.existsById(resumeId)) {
                return ResponseEntity.status(404).body(Map.of("error", "Resume not found"));
            }
            resumeRepository.deleteById(resumeId);
            return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/analyze")
    public ResponseEntity<?> analyzeResume(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request,
            HttpSession session) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            String jobDescription = request != null ? request.get("jobDescription") : null;

            // Determine pro status and quota from user
            boolean isProUser = false;
            User user = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                String userEmail = auth.getName();
                user = userRepository.findByEmail(userEmail).orElse(null);

                if (user != null) {
                    isProUser = user.isPro();
                    // Intercept free users over limit
                    if (!isProUser && user.getScansUsed() >= 2) {
                        return ResponseEntity.status(403).body(Map.of("error", "QuotaExceeded", "message",
                                "You have reached your free limit of 2 AI scans. Please upgrade to Pro to continue."));
                    }
                }
            }

            AnalysisResult result = aiAnalysisService.analyzeResume(resume.getExtractedText(), jobDescription,
                    isProUser);
            result.setResumeId(resume.getId());

            AnalysisResult savedResult = analysisResultRepository.save(result);

            // Increment quota on successful processing if they are free
            if (user != null && !isProUser) {
                user.setScansUsed(user.getScansUsed() + 1);
                userRepository.save(user);
            }

            // Build response map: all AnalysisResult fields + parsedResume for the canvas
            java.util.Map<String, Object> responseMap = new java.util.LinkedHashMap<>();
            responseMap.put("id", savedResult.getId());
            responseMap.put("resumeId", savedResult.getResumeId());
            responseMap.put("atsScore", savedResult.getAtsScore());
            responseMap.put("impactScore", savedResult.getImpactScore());
            responseMap.put("formattingScore", savedResult.getFormattingScore());
            responseMap.put("keywordsScore", savedResult.getKeywordsScore());
            responseMap.put("summary", savedResult.getSummary());
            responseMap.put("strengths", savedResult.getStrengths());
            responseMap.put("weaknesses", savedResult.getWeaknesses());
            responseMap.put("suggestedImprovements", savedResult.getSuggestedImprovements());
            responseMap.put("foundKeywords", savedResult.getFoundKeywords());
            responseMap.put("missingKeywords", savedResult.getMissingKeywords());
            responseMap.put("isPartialAnalysis", savedResult.isPartialAnalysis());
            if (resume.getParsedResume() != null) {
                responseMap.put("parsedResume", resume.getParsedResume());
            }

            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/enhance")
    public ResponseEntity<?> enhanceBulletPoint(@RequestBody Map<String, String> request) {
        try {
            String bulletPoint = request.get("bulletPoint");
            String targetJob = request.get("targetJob");
            String tone = request.get("tone");
            if (bulletPoint == null || bulletPoint.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Bullet point is required"));
            }
            String enhanced = aiAnalysisService.enhanceBulletPoint(bulletPoint, targetJob, tone);
            return ResponseEntity.ok(Map.of("enhancedBulletPoint", enhanced));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/cover-letter")
    public ResponseEntity<?> generateCoverLetter(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String extractedText = "";
            if (resumeId == 0) {
                extractedText = "Sample Resume content for the mocked frontend report.";
            } else {
                Resume resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));
                extractedText = resume.getExtractedText();
            }

            String jobDescription = request != null ? request.get("jobDescription") : "";

            String coverLetter = aiAnalysisService.generateCoverLetter(extractedText, jobDescription);
            return ResponseEntity.ok(Map.of("coverLetter", coverLetter));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/interview-questions")
    public ResponseEntity<?> generateInterviewQuestions(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String extractedText = resumeRepository.findById(resumeId)
                    .map(Resume::getExtractedText)
                    .orElse("");
            String jobDescription = request != null ? request.get("jobDescription") : "";
            String questionsJson = aiAnalysisService.generateInterviewQuestions(extractedText, jobDescription);

            // Clean up any markdown fences Gemini might add
            questionsJson = questionsJson.trim();
            if (questionsJson.startsWith("```json"))
                questionsJson = questionsJson.substring(7);
            if (questionsJson.startsWith("```"))
                questionsJson = questionsJson.substring(3);
            if (questionsJson.endsWith("```"))
                questionsJson = questionsJson.substring(0, questionsJson.length() - 3);

            return ResponseEntity.ok(Map.of("questions", questionsJson.trim()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/{resumeId}/export-pdf", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    @ResponseBody
    public ResponseEntity<byte[]> exportToPdf(
            @PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, Object> options) {
        try {
            String fileName = "My Resume";
            String extractedText = "";
            Resume resume = null;

            if (resumeId == 0) {
                fileName = "Sample_Resume";
                extractedText = "Sample Resume Content\n\nExperience:\n- Software Engineer at Google\n- Built scalable microservices\n\nEducation:\n- B.S. Computer Science";
            } else {
                resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));
                fileName = resume.getFileName() != null ? resume.getFileName().replace(".pdf", "") : "My Resume";
                extractedText = resume.getExtractedText();
            }

            String template = options != null && options.containsKey("template") ? (String) options.get("template")
                    : "basic";
            String font = options != null && options.containsKey("font") ? (String) options.get("font") : "Helvetica";

            @SuppressWarnings("unchecked")
            java.util.List<Map<String, String>> appliedEdits = options != null && options.containsKey("appliedEdits")
                    ? (java.util.List<Map<String, String>>) options.get("appliedEdits")
                    : null;

            @SuppressWarnings("unchecked")
            java.util.List<String> sectionOrder = options != null && options.containsKey("sectionOrder")
                    ? (java.util.List<String>) options.get("sectionOrder")
                    : java.util.Arrays.asList("Summary", "Experience", "Education", "Skills");

            String templateFile = "resume-template";
            if ("modern".equals(template)) {
                templateFile = "resume-template-modern";
            } else if ("executive".equals(template)) {
                templateFile = "resume-template-executive";
            } else if ("tech-focused".equals(template)) {
                templateFile = "resume-template-tech-focused";
            } else if ("minimalist".equals(template)) {
                templateFile = "resume-template-minimalist";
            }

            org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
            context.setVariable("resumeName", escapeXml(fileName));
            context.setVariable("extractedText", escapeXml(extractedText));
            context.setVariable("fontFamily", font);
            if (resume != null && resume.getParsedResume() != null) {
                context.setVariable("parsedResume", resume.getParsedResume());
            }
            context.setVariable("sectionOrder", sectionOrder);

            String htmlContent = templateEngine.process(templateFile, context);

            if (appliedEdits != null) {
                for (Map<String, String> edit : appliedEdits) {
                    String original = edit.get("original");
                    String enhanced = edit.get("enhanced");
                    if (original != null && enhanced != null) {
                        htmlContent = htmlContent.replace(original, enhanced);
                    }
                }
            }

            byte[] pdfBytes = pdfGeneratorService.generatePdfFromRawHtml(htmlContent);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"ElevateAI_Resume.pdf\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            logger.error("Failed to generate PDF", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PATCH /api/resume/{resumeId}/parsed
     * Allows the frontend ResumeCanvas to save inline field edits directly to the
     * ParsedResume entity.
     * Body: { "field": "summary", "value": "new text", "expIndex": 0, "eduIndex": 0
     * }
     */
    @PatchMapping("/{resumeId}/parsed")
    public ResponseEntity<?> patchParsedResume(
            @PathVariable Long resumeId,
            @RequestBody Map<String, Object> body) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));
            com.airesume.entity.ParsedResume pr = resume.getParsedResume();
            if (pr == null) {
                return ResponseEntity.status(404).body(Map.of("error", "No parsed resume found for this upload"));
            }

            String field = (String) body.get("field");
            String rawValue = body.get("value") != null ? body.get("value").toString() : "";
            // Sanitize: strip all tags except the safe formatting subset
            String value = rawValue
                    .replaceAll("(?i)<(?!/?(?:b|strong|i|em|u|br)(?:\\s|/?>))[^>]+>", "");

            if (field == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "field is required"));
            }

            switch (field) {
                case "fullName" -> pr.setFullName(value);
                case "email" -> pr.setEmail(value);
                case "phone" -> pr.setPhone(value);
                case "location" -> pr.setLocation(value);
                case "summary" -> pr.setSummary(value);
                case "skills" -> {
                    // value is a comma-separated list of skills
                    java.util.List<String> skills = java.util.Arrays.stream(value.split(","))
                            .map(String::trim).filter(s -> !s.isEmpty())
                            .collect(java.util.stream.Collectors.toList());
                    pr.setSkills(skills);
                }
                case "expSummary" -> {
                    int idx = body.get("expIndex") != null ? ((Number) body.get("expIndex")).intValue() : -1;
                    if (idx >= 0 && pr.getExperiences() != null && idx < pr.getExperiences().size()) {
                        pr.getExperiences().get(idx).setSummary(value);
                    }
                }
                case "expRole" -> {
                    int idx = body.get("expIndex") != null ? ((Number) body.get("expIndex")).intValue() : -1;
                    if (idx >= 0 && pr.getExperiences() != null && idx < pr.getExperiences().size()) {
                        pr.getExperiences().get(idx).setRole(value);
                    }
                }
                case "expCompany" -> {
                    int idx = body.get("expIndex") != null ? ((Number) body.get("expIndex")).intValue() : -1;
                    if (idx >= 0 && pr.getExperiences() != null && idx < pr.getExperiences().size()) {
                        pr.getExperiences().get(idx).setCompany(value);
                    }
                }
                case "expDates" -> {
                    int idx = body.get("expIndex") != null ? ((Number) body.get("expIndex")).intValue() : -1;
                    if (idx >= 0 && pr.getExperiences() != null && idx < pr.getExperiences().size()) {
                        pr.getExperiences().get(idx).setDates(value);
                    }
                }
                case "eduDegree" -> {
                    int idx = body.get("eduIndex") != null ? ((Number) body.get("eduIndex")).intValue() : -1;
                    if (idx >= 0 && pr.getEducations() != null && idx < pr.getEducations().size()) {
                        pr.getEducations().get(idx).setDegree(value);
                    }
                }
                case "eduInstitution" -> {
                    int idx = body.get("eduIndex") != null ? ((Number) body.get("eduIndex")).intValue() : -1;
                    if (idx >= 0 && pr.getEducations() != null && idx < pr.getEducations().size()) {
                        pr.getEducations().get(idx).setInstitution(value);
                    }
                }
                default -> {
                    return ResponseEntity.badRequest().body(Map.of("error", "Unknown field: " + field));
                }
            }

            resumeRepository.save(resume);
            return ResponseEntity.ok(Map.of("status", "saved"));
        } catch (Exception e) {
            logger.error("Failed to patch parsed resume", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/resume/{resumeId}/tailor ────────────────────────────────────
    @org.springframework.web.bind.annotation.PostMapping("/{resumeId}/tailor")
    public ResponseEntity<?> tailorResume(
            @PathVariable Long resumeId,
            @RequestBody Map<String, String> request) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
            String jobDescription = request.getOrDefault("jobDescription", "");
            if (jobDescription.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "jobDescription is required"));

            com.airesume.entity.ParsedResume existing = resume.getParsedResume();
            if (existing == null)
                return ResponseEntity.badRequest().body(Map.of("error", "No parsed resume found. Upload first."));

            com.airesume.entity.ParsedResume tailored = aiAnalysisService.tailorResumeToJob(
                    resume.getExtractedText(), jobDescription);
            if (tailored == null)
                return ResponseEntity.status(500).body(Map.of("error", "AI tailoring failed"));

            // Merge: update summary and experience bullet summaries only
            if (tailored.getSummary() != null && !tailored.getSummary().isBlank())
                existing.setSummary(tailored.getSummary());
            if (tailored.getExperiences() != null) {
                java.util.List<com.airesume.entity.Experience> existExps = existing.getExperiences();
                java.util.List<com.airesume.entity.Experience> tailExps = tailored.getExperiences();
                if (existExps != null) {
                    for (int i = 0; i < Math.min(existExps.size(), tailExps.size()); i++) {
                        String s = tailExps.get(i).getSummary();
                        if (s != null && !s.isBlank())
                            existExps.get(i).setSummary(s);
                    }
                }
            }
            resumeRepository.save(resume);
            return ResponseEntity.ok(existing);
        } catch (Exception e) {
            logger.error("Failed to tailor resume", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/resume/{resumeId}/import-linkedin ───────────────────────────
    @org.springframework.web.bind.annotation.PostMapping("/{resumeId}/import-linkedin")
    public ResponseEntity<?> importLinkedIn(
            @PathVariable Long resumeId,
            @RequestBody Map<String, String> request) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
            String linkedInText = request.getOrDefault("linkedInText", "");
            if (linkedInText.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "linkedInText is required"));

            com.airesume.entity.ParsedResume parsed = aiAnalysisService.parseLinkedInText(linkedInText);
            com.airesume.entity.ParsedResume existing = resume.getParsedResume();
            if (existing == null) {
                parsed.setResume(resume);
                resume.setParsedResume(parsed);
            } else {
                // Additive merge — only fill in empty fields
                if (isBlank(existing.getFullName()))
                    existing.setFullName(parsed.getFullName());
                if (isBlank(existing.getEmail()))
                    existing.setEmail(parsed.getEmail());
                if (isBlank(existing.getPhone()))
                    existing.setPhone(parsed.getPhone());
                if (isBlank(existing.getLocation()))
                    existing.setLocation(parsed.getLocation());
                if (isBlank(existing.getSummary()))
                    existing.setSummary(parsed.getSummary());
                if ((existing.getSkills() == null || existing.getSkills().isEmpty()) && parsed.getSkills() != null)
                    existing.setSkills(parsed.getSkills());
                if ((existing.getExperiences() == null || existing.getExperiences().isEmpty())
                        && parsed.getExperiences() != null)
                    existing.setExperiences(parsed.getExperiences());
                if ((existing.getEducations() == null || existing.getEducations().isEmpty())
                        && parsed.getEducations() != null)
                    existing.setEducations(parsed.getEducations());
            }
            resumeRepository.save(resume);
            return ResponseEntity.ok(resume.getParsedResume());
        } catch (Exception e) {
            logger.error("Failed to import LinkedIn profile", e);
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/resume/{resumeId}/grammar-check ─────────────────────────────
    @org.springframework.web.bind.annotation.PostMapping("/{resumeId}/grammar-check")
    public ResponseEntity<?> grammarCheck(@PathVariable Long resumeId) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found: " + resumeId));
            String result = aiAnalysisService.detectGrammarAndCliches(resume.getExtractedText());
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(result);
        } catch (Exception e) {
            logger.error("Failed grammar check", e);
            return ResponseEntity.status(500).body("[]");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String escapeXml(String text) {
        if (text == null)
            return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    @GetMapping("/{id}/preview-html")
    public ResponseEntity<String> previewHtml(
            @PathVariable Long id,
            @RequestParam(defaultValue = "basic") String template,
            @RequestParam(defaultValue = "Helvetica") String font,
            HttpSession session) {
        try {
            AnalysisResult result = analysisResultRepository.findByResumeId(id)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            // Get extracted text from the Resume entity
            String extractedText = resumeRepository.findById(id)
                    .map(Resume::getExtractedText)
                    .orElse("");

            // Determine pro status from JWT-populated SecurityContext
            boolean isProUser = false;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                String userEmail = auth.getName();
                isProUser = userRepository.findByEmail(userEmail)
                        .map(User::isPro)
                        .orElse(false);
            }

            // NOTE: Free users can preview Pro templates (teaser/upsell).
            // The paywall is enforced on PDF download via watermark + export-pdf endpoint
            // restriction.

            // Generate HTML using Thymeleaf Context
            Context context = new Context();

            // Build context variables for the template
            context.setVariable("extractedText", escapeXml(extractedText));
            context.setVariable("atsScore", result.getAtsScore());
            context.setVariable("impactScore", result.getImpactScore());
            context.setVariable("formattingScore", result.getFormattingScore());
            context.setVariable("keywordsScore", result.getKeywordsScore());

            // Watermark flag based on pro status
            context.setVariable("isPro", isProUser);

            // Styling context
            context.setVariable("fontFamily", font);

            Resume resumeObj = resumeRepository.findById(id).orElse(null);
            if (resumeObj != null && resumeObj.getParsedResume() != null) {
                context.setVariable("parsedResume", resumeObj.getParsedResume());
            }

            String templateFile = "resume-template";
            if ("modern".equals(template)) {
                templateFile = "resume-template-modern";
            } else if ("executive".equals(template)) {
                templateFile = "resume-template-executive";
            } else if ("tech-focused".equals(template)) {
                templateFile = "resume-template-tech-focused";
            } else if ("minimalist".equals(template)) {
                templateFile = "resume-template-minimalist";
            }

            String htmlContent = templateEngine.process(templateFile, context);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.TEXT_HTML);
            return new ResponseEntity<>(htmlContent, headers, org.springframework.http.HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating preview: " + e.getMessage());
        }
    }
}
