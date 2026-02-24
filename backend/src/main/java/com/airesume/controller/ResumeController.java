package com.airesume.controller;

import com.airesume.entity.AnalysisResult;
import com.airesume.entity.Resume;
import com.airesume.repository.AnalysisResultRepository;
import com.airesume.repository.ResumeRepository;
import com.airesume.service.AiAnalysisService;
import com.airesume.service.PdfParserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    public ResumeController(PdfParserService pdfParserService,
            AiAnalysisService aiAnalysisService,
            ResumeRepository resumeRepository,
            AnalysisResultRepository analysisResultRepository,
            com.airesume.service.PdfGeneratorService pdfGeneratorService) {
        this.pdfParserService = pdfParserService;
        this.aiAnalysisService = aiAnalysisService;
        this.resumeRepository = resumeRepository;
        this.analysisResultRepository = analysisResultRepository;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            String parsedText = pdfParserService.extractTextFromPdf(file);

            Resume resume = new Resume();
            resume.setFileName(file.getOriginalFilename());
            resume.setExtractedText(parsedText);

            Resume savedResume = resumeRepository.save(resume);
            return ResponseEntity.ok(Map.of("resumeId", savedResume.getId(), "message", "Upload successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{resumeId}/analyze")
    public ResponseEntity<?> analyzeResume(@PathVariable Long resumeId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new RuntimeException("Resume not found"));

            String jobDescription = request != null ? request.get("jobDescription") : null;

            AnalysisResult result = aiAnalysisService.analyzeResume(resume.getExtractedText(), jobDescription);
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

    @GetMapping(value = "/{resumeId}/export-pdf", produces = org.springframework.http.MediaType.APPLICATION_PDF_VALUE)
    @ResponseBody
    public ResponseEntity<byte[]> exportToPdf(@PathVariable Long resumeId) {
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

            org.thymeleaf.context.Context context = new org.thymeleaf.context.Context();
            context.setVariable("resumeName", escapeXml(fileName));
            context.setVariable("extractedText", escapeXml(extractedText));

            byte[] pdfBytes = pdfGeneratorService.generatePdfFromHtml("resume-template", context);

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
}
