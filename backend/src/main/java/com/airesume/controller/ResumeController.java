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
    private final UserRepository userRepository;
    private final TemplateEngine templateEngine;

    public ResumeController(PdfParserService pdfParserService,
            AiAnalysisService aiAnalysisService,
            ResumeRepository resumeRepository,
            AnalysisResultRepository analysisResultRepository,
            com.airesume.service.PdfGeneratorService pdfGeneratorService,
            UserRepository userRepository,
            TemplateEngine templateEngine) {
        this.pdfParserService = pdfParserService;
        this.aiAnalysisService = aiAnalysisService;
        this.resumeRepository = resumeRepository;
        this.analysisResultRepository = analysisResultRepository;
        this.pdfGeneratorService = pdfGeneratorService;
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
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                userRepository.findByEmail(auth.getName()).ifPresent(resume::setUser);
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
                        "atsScore", atsScore,
                        "createdAt", createdAt));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch history: " + e.getMessage()));
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

            // Determine pro status from JWT-populated SecurityContext
            boolean isProUser = false;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                String userEmail = auth.getName();
                isProUser = userRepository.findByEmail(userEmail)
                        .map(User::isPro)
                        .orElse(false);
            }

            AnalysisResult result = aiAnalysisService.analyzeResume(resume.getExtractedText(), jobDescription,
                    isProUser);
            result.setResumeId(resume.getId());

            AnalysisResult savedResult = analysisResultRepository.save(result);
            return ResponseEntity.ok(savedResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/enhance")
    public ResponseEntity<?> enhanceBulletPoint(@RequestBody Map<String, String> request) {
        try {
            String bulletPoint = request.get("bulletPoint");
            String targetJob = request.get("targetJob");
            if (bulletPoint == null || bulletPoint.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Bullet point is required"));
            }
            String enhanced = aiAnalysisService.enhanceBulletPoint(bulletPoint, targetJob);
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

    @PostMapping(value = "/{resumeId}/export-pdf", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    @ResponseBody
    public ResponseEntity<byte[]> exportToPdf(
            @PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> options) {
        try {
            String fileName = "My Resume";
            String extractedText = "";

            if (resumeId == 0) {
                fileName = "Sample_Resume";
                extractedText = "Sample Resume Content\n\nExperience:\n- Software Engineer at Google\n- Built scalable microservices\n\nEducation:\n- B.S. Computer Science";
            } else {
                Resume resume = resumeRepository.findById(resumeId)
                        .orElseThrow(() -> new RuntimeException("Resume not found"));
                fileName = resume.getFileName() != null ? resume.getFileName().replace(".pdf", "") : "My Resume";
                extractedText = resume.getExtractedText();
            }

            String template = options != null && options.containsKey("template") ? options.get("template") : "basic";
            String font = options != null && options.containsKey("font") ? options.get("font") : "Helvetica";

            String templateFile = "resume-template";
            if ("modern".equals(template)) {
                templateFile = "resume-template-modern";
            } else if ("executive".equals(template)) {
                templateFile = "resume-template-executive";
            }

            org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
            context.setVariable("resumeName", escapeXml(fileName));
            context.setVariable("extractedText", escapeXml(extractedText));
            context.setVariable("fontFamily", font);

            byte[] pdfBytes = pdfGeneratorService.generatePdfFromHtml(templateFile, context);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"ElevateAI_Resume.pdf\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            logger.error("Failed to generate PDF", e);
            return ResponseEntity.badRequest().build();
        }
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

            // Enforce template restriction for preview too
            if (!isProUser && ("modern".equals(template) || "executive".equals(template))) {
                template = "basic";
            }

            // Generate HTML using Thymeleaf Context
            Context context = new Context();

            // Build context variables for the template
            context.setVariable("extractedText", escapeXml(extractedText));
            context.setVariable("atsScore", result.getAtsScore());
            context.setVariable("impactScore", result.getImpactScore());
            context.setVariable("brevityScore", result.getBrevityScore());
            context.setVariable("actionVerbScore", result.getActionVerbScore());

            // Watermark flag based on pro status
            context.setVariable("isPro", isProUser);

            // Styling context
            context.setVariable("fontFamily", font);

            String templateFile = "resume-template";
            if ("modern".equals(template)) {
                templateFile = "resume-template-modern";
            } else if ("executive".equals(template)) {
                templateFile = "resume-template-executive";
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
