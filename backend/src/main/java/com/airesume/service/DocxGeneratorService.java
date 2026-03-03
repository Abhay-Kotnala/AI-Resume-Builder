package com.airesume.service;

import com.airesume.entity.ParsedResume;
import com.airesume.entity.Experience;
import com.airesume.entity.Education;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class DocxGeneratorService {

    public byte[] generateDocx(ParsedResume resume, String template, String fontName) throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {

            // Map our frontend generic font names to Word-friendly fonts
            String actualFont = "Arial";
            if ("Times New Roman".equalsIgnoreCase(fontName))
                actualFont = "Times New Roman";
            if ("Georgia".equalsIgnoreCase(fontName))
                actualFont = "Georgia";
            if ("Courier New".equalsIgnoreCase(fontName))
                actualFont = "Courier New";
            if ("Helvetica".equalsIgnoreCase(fontName))
                actualFont = "Helvetica";

            // Title (Full Name)
            XWPFParagraph titlePr = document.createParagraph();
            titlePr.setAlignment(ParagraphAlignment.CENTER);
            titlePr.setSpacingAfter(100);
            XWPFRun titleRun = titlePr.createRun();
            titleRun.setText(resume.getFullName() != null ? resume.getFullName() : "Candidate Name");
            titleRun.setFontFamily(actualFont);
            titleRun.setFontSize(24);
            titleRun.setBold(true);

            // Contact Info
            XWPFParagraph contactPr = document.createParagraph();
            contactPr.setAlignment(ParagraphAlignment.CENTER);
            contactPr.setSpacingAfter(400);
            XWPFRun contactRun = contactPr.createRun();
            String contactStr = String.format("%s | %s | %s",
                    resume.getEmail() != null ? resume.getEmail() : "",
                    resume.getPhone() != null ? resume.getPhone() : "",
                    resume.getLocation() != null ? resume.getLocation() : "");
            contactRun.setText(contactStr);
            contactRun.setFontFamily(actualFont);
            contactRun.setFontSize(11);

            // Summary Section
            if (resume.getSummary() != null && !resume.getSummary().isBlank()) {
                createSectionHeader(document, "PROFESSIONAL SUMMARY", actualFont);
                XWPFParagraph p = document.createParagraph();
                p.setSpacingAfter(400);
                XWPFRun r = p.createRun();
                r.setText(resume.getSummary());
                r.setFontFamily(actualFont);
                r.setFontSize(11);
            }

            // Experience Section
            if (resume.getExperiences() != null && !resume.getExperiences().isEmpty()) {
                createSectionHeader(document, "EXPERIENCE", actualFont);
                for (Experience exp : resume.getExperiences()) {
                    XWPFParagraph p1 = document.createParagraph();
                    p1.setSpacingAfter(50);

                    XWPFRun rRole = p1.createRun();
                    rRole.setText((exp.getRole() != null ? exp.getRole() : "") + " | ");
                    rRole.setBold(true);
                    rRole.setFontFamily(actualFont);
                    rRole.setFontSize(12);

                    XWPFRun rCompany = p1.createRun();
                    rCompany.setText(exp.getCompany() != null ? exp.getCompany() : "");
                    rCompany.setBold(true);
                    rCompany.setFontFamily(actualFont);
                    rCompany.setFontSize(12);

                    // Add dates right-aligned via tab if possible, or just append
                    XWPFRun rDates = p1.createRun();
                    rDates.setText(" (" + (exp.getDates() != null ? exp.getDates() : "") + ")");
                    rDates.setItalic(true);
                    rDates.setFontFamily(actualFont);
                    rDates.setFontSize(11);

                    if (exp.getSummary() != null && !exp.getSummary().isBlank()) {
                        String[] bullets = exp.getSummary().split("\n");
                        for (String bullet : bullets) {
                            if (bullet.trim().isEmpty())
                                continue;
                            XWPFParagraph bp = document.createParagraph();
                            bp.setIndentationLeft(360); // 0.25 inch
                            bp.setSpacingAfter(100);
                            XWPFRun br = bp.createRun();
                            br.setText("• " + bullet.replace("•", "").trim());
                            br.setFontFamily(actualFont);
                            br.setFontSize(11);
                        }
                    }
                }
            }

            // Education Section
            if (resume.getEducations() != null && !resume.getEducations().isEmpty()) {
                createSectionHeader(document, "EDUCATION", actualFont);
                for (Education edu : resume.getEducations()) {
                    XWPFParagraph p = document.createParagraph();
                    p.setSpacingAfter(100);

                    XWPFRun rInst = p.createRun();
                    rInst.setText(edu.getInstitution() != null ? edu.getInstitution() : "");
                    rInst.setBold(true);
                    rInst.setFontFamily(actualFont);
                    rInst.setFontSize(12);

                    XWPFRun rDeg = p.createRun();
                    rDeg.setText(edu.getDegree() != null ? ", " + edu.getDegree() : "");
                    rDeg.setFontFamily(actualFont);
                    rDeg.setFontSize(11);

                    XWPFRun rDate = p.createRun();
                    rDate.setText(edu.getGraduationDate() != null ? " (" + edu.getGraduationDate() + ")" : "");
                    rDate.setItalic(true);
                    rDate.setFontFamily(actualFont);
                    rDate.setFontSize(11);
                }
            }

            // Skills Section
            if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
                createSectionHeader(document, "SKILLS", actualFont);
                XWPFParagraph p = document.createParagraph();
                XWPFRun r = p.createRun();
                r.setText(String.join(", ", resume.getSkills()));
                r.setFontFamily(actualFont);
                r.setFontSize(11);
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                document.write(out);
                return out.toByteArray();
            }
        }
    }

    private void createSectionHeader(XWPFDocument document, String title, String font) {
        XWPFParagraph pr = document.createParagraph();
        pr.setSpacingAfter(200);
        pr.setSpacingBefore(300);
        // Add a bottom border
        pr.setBorderBottom(Borders.SINGLE);
        XWPFRun r = pr.createRun();
        r.setText(title);
        r.setBold(true);
        r.setFontFamily(font);
        r.setFontSize(14);
    }
}
