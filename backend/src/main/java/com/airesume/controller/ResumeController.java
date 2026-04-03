package com.airesume.controller;

import com.airesume.entity.AnalysisResult;
import com.airesume.entity.Resume;
import com.airesume.entity.User;
import com.airesume.repository.AnalysisResultRepository;
import com.airesume.repository.ResumeRepository;
import com.airesume.repository.UserRepository;
import com.airesume.service.AiAnalysisService;
import com.airesume.service.BackgroundJobService;
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
public class ResumeController {

    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    @org.springframework.beans.factory.annotation.Value("${app.free-scans.default:4}")
    private int defaultFreeScans;

    private final PdfParserService pdfParserService;
    private final AiAnalysisService aiAnalysisService;
    private final ResumeRepository resumeRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final com.airesume.service.PdfGeneratorService pdfGeneratorService;
    private final com.airesume.service.DocxGeneratorService docxGeneratorService;
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;
    private final BackgroundJobService backgroundJobService;

    public ResumeController(PdfParserService pdfParserService,
            AiAnalysisService aiAnalysisService,
            ResumeRepository resumeRepository,
            AnalysisResultRepository analysisResultRepository,
            com.airesume.service.PdfGeneratorService pdfGeneratorService,
            com.airesume.service.DocxGeneratorService docxGeneratorService,
            UserRepository userRepository,
            TemplateEngine templateEngine,
            BackgroundJobService backgroundJobService) {
        this.pdfParserService = pdfParserService;
        this.aiAnalysisService = aiAnalysisService;
        this.resumeRepository = resumeRepository;
        this.analysisResultRepository = analysisResultRepository;
        this.pdfGeneratorService = pdfGeneratorService;
        this.docxGeneratorService = docxGeneratorService;
        this.userRepository = userRepository;
        this.templateEngine = templateEngine;
        this.backgroundJobService = backgroundJobService;
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
            try {
                com.airesume.entity.ParsedResume parsedStructure = aiAnalysisService.parseStructuredResume(parsedText, isPro);
                if (parsedStructure != null) {
                    parsedStructure.setResume(resume);
                    resume.setParsedResume(parsedStructure);
                }
            } catch (Exception e) {
                logger.warn("AI Structure Parsing failed during upload. Resume text safely saved without parsed structure. Error: {}", e.getMessage());
                // We purposefully do not crash the upload. The user can retry analysis later.
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

            // TEMP DB RESET HOOK FOR TEST USER
            if ("knightking2905@gmail.com".equals(user.getEmail()) && user.getScansUsed() > 0) {
                user.setScansUsed(0);
                userRepository.save(user);
                System.out.println("====== SUCCESS: RESET QUOTA FOR TEST USER VIA HTTP GET ======");
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

    @PostMapping("/{resumeId}/clone")
    public ResponseEntity<?> cloneResume(@PathVariable Long resumeId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Resume original = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            // Verify ownership
            if (original.getUser() != null && !original.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not own this resume"));
            }

            Resume cloned = new Resume();
            cloned.setUser(user);
            cloned.setFileName(original.getFileName() != null ? original.getFileName() : "Resume");
            String originalLabel = original.getLabel() != null && !original.getLabel().isBlank() ? original.getLabel()
                    : "Unnamed Version";
            cloned.setLabel(originalLabel + " (Copy)");
            cloned.setExtractedText(original.getExtractedText());
            cloned.setUploadDate(java.time.LocalDateTime.now());

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

            // Clone ParsedResume
            if (original.getParsedResume() != null) {
                String parsedJson = mapper.writeValueAsString(original.getParsedResume());
                com.airesume.entity.ParsedResume clonedParsed = mapper.readValue(parsedJson,
                        com.airesume.entity.ParsedResume.class);
                clonedParsed.setId(null);
                clonedParsed.setResume(cloned);
                cloned.setParsedResume(clonedParsed);
            }

            Resume savedCloned = resumeRepository.save(cloned);

            // Clone AnalysisResult if exists
            java.util.Optional<AnalysisResult> optResult = analysisResultRepository.findByResumeId(resumeId);
            if (optResult.isPresent()) {
                String resultJson = mapper.writeValueAsString(optResult.get());
                AnalysisResult clonedResult = mapper.readValue(resultJson, AnalysisResult.class);
                clonedResult.setId(null);
                clonedResult.setResumeId(savedCloned.getId());
                analysisResultRepository.save(clonedResult);
            }

            return ResponseEntity
                    .ok(Map.of("message", "Resume cloned successfully", "newResumeId", savedCloned.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to clone resume: " + e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/analyze")
    public ResponseEntity<?> analyzeResume(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request,
            HttpSession session) {
        try {
            // ... (keep original logic) ...
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
                    if (!isProUser && user.getScansUsed() >= defaultFreeScans) {
                        return ResponseEntity.status(403).body(Map.of("error", "QuotaExceeded", "message",
                                "You have reached your free limit of " + defaultFreeScans
                                        + " AI scans. Please upgrade to Pro to continue."));
                    }
                }
            }

            // Treat users with remaining scans as "Pro" for this analysis to unlock full
            // features
            final boolean finalIsProUser = isProUser || (user != null && user.getScansUsed() < defaultFreeScans);
            final User finalUser = user;
            final String finalJobDescription = jobDescription;

            String jobId = backgroundJobService.submitJob(() -> {
                AnalysisResult result = aiAnalysisService.analyzeResume(resume.getExtractedText(), finalJobDescription,
                        finalIsProUser);
                result.setResumeId(resume.getId());

                AnalysisResult savedResult = analysisResultRepository.save(result);

                // Only increment quota if the AI returned a real result (not a fallback/error)
                boolean isValidResult = result.getAtsScore() > 0 ||
                        (result.getSummary() != null && !result.getSummary().toLowerCase().contains("error")
                                && !result.getSummary().toLowerCase().contains("api key"));
                if (finalUser != null && !finalIsProUser && isValidResult) {
                    finalUser.setScansUsed(finalUser.getScansUsed() + 1);
                    userRepository.save(finalUser);
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
                return responseMap;
            });

            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/resume/{resumeId}/result (Session Recovery) ───────────────
    @GetMapping("/{resumeId}/result")
    public ResponseEntity<?> getResumeResult(@PathVariable Long resumeId) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            AnalysisResult savedResult = analysisResultRepository.findByResumeId(resumeId)
                    .orElseThrow(() -> new RuntimeException(
                            "Analysis result not found for this resume. Please analyze it first."));

            // Build response map identical to /analyze, but without calling AI service
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
            String jobId = backgroundJobService.submitJob(() -> {
                String enhanced = aiAnalysisService.enhanceBulletPoint(bulletPoint, targetJob, tone);
                return Map.of("enhancedBulletPoint", enhanced);
            });
            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/cover-letter")
    public ResponseEntity<?> generateCoverLetter(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            boolean isProUser = false;
            int scansUsed = 0;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                User user = userRepository.findByEmail(auth.getName()).orElse(null);
                if (user != null) {
                    isProUser = user.isPro();
                    scansUsed = user.getScansUsed();
                }
            }
            if (!isProUser && scansUsed >= defaultFreeScans) {
                return ResponseEntity.status(403).body(Map.of("error", "QuotaExceeded", "message",
                        "Cover letter generation requires ElevateAI Pro. Please upgrade to continue."));
            }

            String extractedText = "";
            if (resumeId == 0) {
                extractedText = "Sample Resume content for the mocked frontend report.";
            } else {
                Resume resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));
                extractedText = resume.getExtractedText();
            }

            String jobDescription = request != null ? request.get("jobDescription") : "";

            final String finalExtractedText = extractedText;
            final String finalJobDescription = jobDescription;
            String jobId = backgroundJobService.submitJob(() -> {
                String coverLetter = aiAnalysisService.generateCoverLetter(finalExtractedText, finalJobDescription);
                return Map.of("coverLetter", coverLetter);
            });
            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/interview-questions")
    public ResponseEntity<?> generateInterviewQuestions(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            boolean isProUser = false;
            int scansUsed = 0;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                User user = userRepository.findByEmail(auth.getName()).orElse(null);
                if (user != null) {
                    isProUser = user.isPro();
                    scansUsed = user.getScansUsed();
                }
            }
            if (!isProUser && scansUsed >= defaultFreeScans) {
                return ResponseEntity.status(403).body(Map.of("error", "QuotaExceeded", "message",
                        "AI Interview Prep requires ElevateAI Pro. Please upgrade to continue."));
            }

            String extractedText = resumeRepository.findById(resumeId)
                    .map(Resume::getExtractedText)
                    .orElse("");
            String jobDescription = request != null ? request.get("jobDescription") : "";
            final String finalExtractedText = extractedText;
            final String finalJobDescription = jobDescription;
            String jobId = backgroundJobService.submitJob(() -> {
                String questionsJson = aiAnalysisService.generateInterviewQuestions(finalExtractedText,
                        finalJobDescription);

                // Clean up any markdown fences Gemini might add
                questionsJson = questionsJson.trim();
                if (questionsJson.startsWith("```json"))
                    questionsJson = questionsJson.substring(7);
                if (questionsJson.startsWith("```"))
                    questionsJson = questionsJson.substring(3);
                if (questionsJson.endsWith("```"))
                    questionsJson = questionsJson.substring(0, questionsJson.length() - 3);

                return Map.of("questions", questionsJson.trim());
            });

            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/match")
    public ResponseEntity<?> analyzeJobMatch(@PathVariable Long resumeId,
            @RequestBody Map<String, String> request) {
        try {
            boolean isProUser = false;
            int scansUsed = 0;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                User user = userRepository.findByEmail(auth.getName()).orElse(null);
                if (user != null) {
                    isProUser = user.isPro();
                    scansUsed = user.getScansUsed();
                }
            }
            if (!isProUser && scansUsed >= defaultFreeScans) {
                return ResponseEntity.status(403).body(Map.of("error", "QuotaExceeded", "message",
                        "Job Match Engine requires ElevateAI Pro. Please upgrade to continue."));
            }

            String extractedText = "";
            if (resumeId == 0) {
                extractedText = "Sample Resume";
            } else {
                Resume resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));
                extractedText = resume.getExtractedText();
            }

            String jobDescription = request.get("jobDescription");
            if (jobDescription == null || jobDescription.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "jobDescription is required"));
            }

            final String finalExtractedText = extractedText;
            final String finalJobDescription = jobDescription;
            String jobId = backgroundJobService.submitJob(() -> {
                String matchJson = aiAnalysisService.analyzeJobMatch(finalExtractedText, finalJobDescription);
                return Map.of("matchResult", matchJson);
            });

            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/{resumeId}/export-pdf", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    @ResponseBody
    public ResponseEntity<?> exportToPdf(
            @PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, Object> options) {
        try {
            // Determine if user is Pro
            boolean isPro = false;
            int scansUsed = 0;
            try {
                org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext()
                        .getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    String email = auth.getName();
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        isPro = user.isPro();
                        scansUsed = user.getScansUsed();
                    }
                }
            } catch (Exception ignored) {
            }

            String template = options != null && options.containsKey("template") ? (String) options.get("template")
                    : "basic";

            // Phase 3.1: Enforce Dynamic Paywall
            // Users cannot export a non-basic template unless they are Pro
            if (!isPro && scansUsed >= defaultFreeScans && !template.equals("basic") && !template.equals("classic")) {
                return ResponseEntity.status(403)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "QuotaExceeded", "message",
                                "Exporting Premium templates requires ElevateAI Pro after using all free scans."));
            }

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

            context.setVariable("isPro", isPro);

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

    // ── POST /api/resume/{resumeId}/export-docx ───────────────────────────────
    @PostMapping(value = "/{resumeId}/export-docx", produces = "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    @ResponseBody
    public ResponseEntity<?> exportToDocx(
            @PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, Object> options) {
        try {
            // Determine if user is Pro
            boolean isPro = false;
            int scansUsed = 0;
            try {
                org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext()
                        .getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                    String email = auth.getName();
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null) {
                        isPro = user.isPro();
                        scansUsed = user.getScansUsed();
                    }
                }
            } catch (Exception ignored) {
            }

            String template = options != null && options.containsKey("template") ? (String) options.get("template")
                    : "basic";

            // Phase 3.1: Enforce Dynamic Paywall
            // Users cannot export a non-basic DOCX template unless they are Pro
            if (!isPro && scansUsed >= defaultFreeScans && !template.equals("basic") && !template.equals("classic")) {
                return ResponseEntity.status(403)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "QuotaExceeded", "message",
                                "Exporting Premium DOCX templates requires ElevateAI Pro after using all free scans."));
            }

            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found for DOCX export"));

            if (resume.getParsedResume() == null) {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Parsed resume data is required to export to DOCX. Please ensure the resume is analyzed first."));
            }

            String font = options != null && options.containsKey("font") ? (String) options.get("font") : "Helvetica";

            byte[] docxBytes = docxGeneratorService.generateDocx(resume.getParsedResume(), template, font);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"ElevateAI_Resume.docx\"")
                    .body(docxBytes);

        } catch (Exception e) {
            logger.error("Failed to generate DOCX", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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

            final String finalJobDescription = jobDescription;
            String jobId = backgroundJobService.submitJob(() -> {
                com.airesume.entity.ParsedResume tailored = aiAnalysisService.tailorResumeToJob(
                        resume.getExtractedText(), finalJobDescription);
                if (tailored == null)
                    throw new RuntimeException("AI tailoring failed");

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
                return existing;
            });
            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
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
            String jobId = backgroundJobService.submitJob(() -> {
                return aiAnalysisService.detectGrammarAndCliches(resume.getExtractedText());
            });
            return ResponseEntity.accepted().body(Map.of("jobId", jobId));
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
