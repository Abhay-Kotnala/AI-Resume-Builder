package com.airesume.service;

import com.airesume.entity.AnalysisResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class AiAnalysisService {

    private final RestClient restClient;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public AiAnalysisService(RestClient.Builder restClientBuilder,
            @Value("${gemini.api.key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
    }

    public AnalysisResult analyzeResume(String resumeText, String jobDescription, boolean isPro) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)) {
            return getMockResult(isPro);
        }

        try {
            String prompt = buildPrompt(resumeText, jobDescription);

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    });

            String response = restClient.post()
                    .uri("/v1beta/models/gemini-1.5-pro:generateContent?key={key}", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            AnalysisResult result = parseResponse(response);

            // Apply Partial Analysis for Free Users
            if (!isPro) {
                result.setPartialAnalysis(true);
                result.setMissingKeywords(
                        "Upgrade to Pro to reveal exactly which keywords you are missing from this job description.");
                if (result.getSuggestedImprovements() != null) {
                    String[] improvements = result.getSuggestedImprovements().split("\n");
                    if (improvements.length > 2) {
                        result.setSuggestedImprovements(improvements[0] + "\n" + improvements[1]
                                + "\n- [Locked] Upgrade to Pro to see all critical improvements.");
                    }
                }
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            return getMockResult(isPro); // fallback
        }
    }

    public String enhanceBulletPoint(String bulletPoint, String targetJob) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)) {
            return "Accomplished [X] as measured by [Y], by doing [Z]. (Mocked test feature)";
        }
        try {
            String prompt = "You are a professional resume writer who has drafted resumes for top-tier tech companies. "
                    +
                    "Your goal is to rewrite the following resume bullet point to make it extremely impactful, metric-driven, and active. "
                    +
                    "STRICTLY follow the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z].' " +
                    "Never hallucinate generic metrics; if there are no metrics, focus on the scope of the accomplishment. ";
            if (targetJob != null && !targetJob.isBlank()) {
                prompt += "Tailor it specifically to highlight skills relevant to this role: " + targetJob + ". ";
            }
            prompt += "Original Bullet point: '" + bulletPoint
                    + "'\n\nReturn EXACTLY AND ONLY the rewritten bullet point text. Do not include introductory phrases like 'Here is the rewritten bullet point:'.";

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    });

            String response = restClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent?key={key}", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return extractTextFromGeminiResponse(response);
        } catch (Exception e) {
            e.printStackTrace();
            return "Enhanced: " + bulletPoint + " (Mocked fallback)";
        }
    }

    public String generateCoverLetter(String resumeText, String jobDescription) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)) {
            return "Dear Hiring Manager,\n\nI am writing to express my strong interest in the open position. Please find my resume attached.\n\nSincerely,\nCandidate (Mocked)";
        }
        try {
            String prompt = "You are an expert career coach and executive recruiter. Write a highly compelling, modern cover letter based on the following resume and job description. "
                    +
                    "The letter must be concise (under 300 words), have a strong opening hook, clearly outline the candidate's unique value proposition, and end with a confident call to action. "
                    +
                    "Do not use generic cliches like 'I am writing to apply for...'. " +
                    "Format it cleanly with appropriate paragraph breaks. Do not include placeholder signature headers (like [Date] or [Company Address]).\n\n";
            if (jobDescription != null && !jobDescription.isBlank()) {
                prompt += "TARGET JOB DESCRIPTION:\n" + jobDescription + "\n\n";
            }
            prompt += "CANDIDATE RESUME:\n" + resumeText + "\n\n";
            prompt += "Return EXACTLY AND ONLY the text of the cover letter.";

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    });

            String response = restClient.post()
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent?key={key}", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return extractTextFromGeminiResponse(response);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating cover letter. (Mocked fallback)";
        }
    }

    private String buildPrompt(String resumeText, String jobDescription) {
        String base = "You are an elite executive career coach and a ruthless Applicant Tracking System (ATS) algorithm for top-tier tech companies. "
                +
                "Evaluate the following resume with extreme scrutiny, extracting detailed numerical scores. " +
                "You MUST return your response ENTIRELY and EXCLUSIVELY as a valid JSON object. Do not include markdown formatting like ```json. "
                +
                "The JSON object MUST contain the exact following keys and data types:\n" +
                "- 'atsScore' (integer 0-100: overall parseability and relevance)\n" +
                "- 'impactScore' (integer 0-100: measures use of quantifiable metrics, percentages, and dollar amounts)\n"
                +
                "- 'brevityScore' (integer 0-100: penalizes walls of text; rewards concise, scannable bullet points)\n"
                +
                "- 'actionVerbScore' (integer 0-100: evaluates whether bullets start with strong power verbs vs weak passive verbs)\n"
                +
                "- 'summary' (string: a concise, 2-sentence brutal but constructive evaluation)\n" +
                "- 'strengths' (string: a bulleted list using • of 3 key strengths)\n" +
                "- 'weaknesses' (string: a bulleted list using • of 3 critical flaws or missing elements)\n" +
                "- 'suggestedImprovements' (string: a bulleted list using • of 3 highly actionable, specific commands to improve the resume)\n"
                +
                "- 'foundKeywords' (string: comma separated list of recognized hard skills)\n" +
                "- 'missingKeywords' (string: comma separated list of important skills that are missing).\n\n";

        if (jobDescription != null && !jobDescription.isBlank()) {
            base += "Analyze the resume specifically against this JOB DESCRIPTION:\n" + jobDescription + "\n\n";
            base += "Be extremely diligent in identifying 'missingKeywords' from the Job Description that do not appear in the Resume.\n\n";
        } else {
            base += "Since no job description was provided, evaluate it against general best practices for a modern Software Engineering or Tech role.\n\n";
        }

        base += "RESUME TEXT TO EVALUATE:\n" + resumeText;
        return base;
    }

    private AnalysisResult parseResponse(String rawResponse) {
        try {
            String text = extractTextFromGeminiResponse(rawResponse);
            // Clean up Markdown JSON blocks if present
            if (text.startsWith("```json")) {
                text = text.substring(7);
            } else if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            return objectMapper.readValue(text.trim(), AnalysisResult.class);
        } catch (Exception e) {
            e.printStackTrace();
            return getMockResult(false);
        }
    }

    private String extractTextFromGeminiResponse(String response) {
        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText().trim();
        } catch (Exception e) {
            return "Error parsing AI response";
        }
    }

    private AnalysisResult getMockResult(boolean isPro) {
        AnalysisResult result = new AnalysisResult();
        result.setAtsScore(85);
        result.setImpactScore(65);
        result.setBrevityScore(90);
        result.setActionVerbScore(70);
        result.setSummary(
                "A strong resume with good technical skills but lacks some soft skills keywords and quantifiable impact.");
        result.setStrengths("- Strong programming languages (Java, React)\n- Concise and easy to read");
        result.setWeaknesses(
                "- Missing keywords related to teamwork\n- Lacks numerical metrics to prove impact\n- Uses weak verbs like 'helped' and 'worked on'");
        result.setFoundKeywords("Java, React, SQL, Spring Boot");

        if (isPro) {
            result.setPartialAnalysis(false);
            result.setMissingKeywords("AWS, Docker, CI/CD, Agile");
            result.setSuggestedImprovements(
                    "Expand on the impact of your projects using specific action verbs and percentages.\nAdd a 'Soft Skills' section.");
        } else {
            result.setPartialAnalysis(true);
            result.setMissingKeywords(
                    "Upgrade to Pro to reveal exactly which keywords you are missing from this job description.");
            result.setSuggestedImprovements(
                    "Expand on the impact of your projects using specific action verbs and percentages.\n- [Locked] Upgrade to Pro to see all critical improvements.");
        }

        return result;
    }
}
