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
    private final AnalyticsService analyticsService;

    public AiAnalysisService(RestClient.Builder restClientBuilder,
            @Value("${gemini.api.key}") String apiKey,
            ObjectMapper objectMapper,
            AnalyticsService analyticsService) {
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.analyticsService = analyticsService;
    }

    public AnalysisResult analyzeResume(String resumeText, String jobDescription, boolean isPro) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Analyze Resume");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
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
                    .uri("/v1beta/models/gemini-1.5-flash:generateContent?key={key}", apiKey)
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

    public com.airesume.entity.ParsedResume parseStructuredResume(String resumeText, boolean isPro) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            return getMockParsedResume(resumeText);
        }

        try {
            String prompt = "You are an expert AI resume parser. I will provide you with unstructured text from a resume PDF. "
                    +
                    "Extract all information and organize it perfectly into the following ONLY valid JSON structure. " +
                    "DO NOT include markdown block tags like ```json. \n" +
                    "{\n" +
                    "  \"fullName\": \"\",\n" +
                    "  \"email\": \"\",\n" +
                    "  \"phone\": \"\",\n" +
                    "  \"location\": \"\",\n" +
                    "  \"summary\": \"\",\n" +
                    "  \"skills\": [\"\", \"\"],\n" +
                    "  \"experiences\": [\n" +
                    "    { \"company\": \"\", \"role\": \"\", \"dates\": \"\", \"summary\": \"\" }\n" +
                    "  ],\n" +
                    "  \"educations\": [\n" +
                    "    { \"institution\": \"\", \"degree\": \"\", \"graduationDate\": \"\", \"details\": \"\" }\n" +
                    "  ],\n" +
                    "  \"customSections\": {\n" +
                    "    \"Projects\": \"• Example Project 1\\n• Example Project 2\",\n" +
                    "    \"Languages\": \"English, Spanish\"\n" +
                    "  }\n" +
                    "}\n\n" +
                    "NOTE: Extract any additional resume sections (e.g., Projects, Certifications, Awards, Languages, Publications, Volunteering) into the customSections map. The keys must be the section header as a string, and the value must be the section text as a single string, using • for list items and \\n for newlines.\n\n"
                    +
                    "RESUME TEXT TO PARSE:\n" + resumeText;

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

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }

            return objectMapper.readValue(text, com.airesume.entity.ParsedResume.class);

        } catch (Exception e) {
            e.printStackTrace();
            return getMockParsedResume(resumeText);
        }
    }

    public String enhanceBulletPoint(String bulletPoint, String targetJob, String tone) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Magic Wand Enhance");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            return "Accomplished [X] as measured by [Y], by doing [Z]. (Mocked test feature with tone: " + tone + ")";
        }
        try {
            String prompt = "You are a professional resume writer who has drafted resumes for top-tier tech companies. "
                    +
                    "Your goal is to rewrite the following resume bullet point to make it extremely impactful, metric-driven, and active. ";

            if ("Quantified".equalsIgnoreCase(tone)) {
                prompt += "STRICTLY follow the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Maximize numerical metrics. ";
            } else if ("Leadership".equalsIgnoreCase(tone)) {
                prompt += "Focus heavily on leadership, mentoring, and cross-functional impact. Use strong leadership action verbs. ";
            } else if ("Concise".equalsIgnoreCase(tone)) {
                prompt += "Make it extremely brief and high-impact. Remove any fluff words or unnecessary details. ";
            } else {
                prompt += "STRICTLY follow the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. ";
            }

            prompt += "Never hallucinate generic metrics; if there are no metrics, focus on the scope of the accomplishment. ";
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
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Cover Letter Generation");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
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

    public String generateInterviewQuestions(String resumeText, String jobDescription) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)) {
            return "[{\"question\":\"Tell me about a challenging project you worked on and how you overcame the obstacles.\",\"tip\":\"Use the STAR method: Situation, Task, Action, Result.\",\"category\":\"Behavioural\"},{\"question\":\"How do you approach debugging a complex production issue?\",\"tip\":\"Mention systematic isolation, logging, and collaboration.\",\"category\":\"Technical\"},{\"question\":\"Describe a time when you disagreed with a technical decision. How did you handle it?\",\"tip\":\"Show maturity and ability to advocate constructively.\",\"category\":\"Behavioural\"},{\"question\":\"What is your approach to writing maintainable, scalable code?\",\"tip\":\"Mention SOLID principles, code reviews, tests.\",\"category\":\"Technical\"},{\"question\":\"Where do you see yourself professionally in 3 years?\",\"tip\":\"Align your growth with the company direction.\",\"category\":\"Career\"}]";
        }
        try {
            String prompt = "You are a senior engineering hiring manager at a top tech company conducting a technical interview. "
                    +
                    "Based on the candidate's resume and the job description provided, generate EXACTLY 5 highly targeted interview questions. "
                    +
                    "The questions should be a mix of: behavioural (2 questions), technical (2 questions), and career/motivation (1 question). "
                    +
                    "Each question must be specific to the candidate's actual experience and the role—do NOT use generic cookie-cutter questions. "
                    +
                    "Return ONLY a valid JSON array (no markdown, no explanation) in this exact format: " +
                    "[{\"question\": \"...\", \"tip\": \"Brief 1-sentence coaching tip for answering this question well.\", \"category\": \"Behavioural|Technical|Career\"}]\\n\\n";

            if (jobDescription != null && !jobDescription.isBlank()) {
                prompt += "TARGET ROLE / JOB DESCRIPTION:\\n" + jobDescription + "\\n\\n";
            }
            prompt += "CANDIDATE RESUME:\\n" + resumeText;

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
            return "[]";
        }
    }

    public String analyzeJobMatch(String resumeText, String jobDescription) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Job Match Engine");

        if (apiKey == null || apiKey.isEmpty() || "your_gemini_api_key_here".equals(apiKey)
                || "YOUR_KEY_HERE".equals(apiKey)) {
            return "{\"matchScore\": 85, \"missingKeywords\": [\"Docker\", \"Kubernetes\"], \"matchingKeywords\": [\"Java\", \"Spring Boot\", \"React\"], \"tailoredAdvice\": \"MOCK: You have a strong foundation but are missing some cloud deployment skills. Consider adding Docker experience if you have it.\"}";
        }
        try {
            String prompt = "You are an expert technical recruiter and ATS ranking algorithm. "
                    + "Analyze the candidate's resume against the provided job description and calculate a precise match score based on keyword intersection, semantic relevance, and experience level. "
                    + "Return ONLY a valid JSON object with the exact following structure. Do NOT include markdown tags like ```json:\n"
                    + "{\n"
                    + "  \"matchScore\": 85,\n"
                    + "  \"missingKeywords\": [\"keyword1\", \"keyword2\"],\n"
                    + "  \"matchingKeywords\": [\"keyword3\", \"keyword4\"],\n"
                    + "  \"tailoredAdvice\": \"A 2-3 sentence paragraph offering specific, actionable advice on how to improve the match rate for this specific job.\"\n"
                    + "}\n\n"
                    + "JOB DESCRIPTION:\n" + jobDescription + "\n\n"
                    + "CANDIDATE RESUME:\n" + resumeText;

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

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
            return text;
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"matchScore\": 0, \"missingKeywords\": [], \"matchingKeywords\": [], \"tailoredAdvice\": \"Error performing match analysis.\"}";
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
                "- 'formattingScore' (integer 0-100: penalizes walls of text, unconventional sections, bad formatting)\n"
                +
                "- 'keywordsScore' (integer 0-100: evaluates keyword matches, missing skills, relevance to job)\n"
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

        base += "CRITICAL RULE: If the resume text appears to be fake, gibberish, extremely short (e.g. just 'test'), or does not resemble a true resume, YOU MUST set all integer scores (atsScore, impactScore, formattingScore, keywordsScore) to 0. In the 'summary', explicitly state that the document does not appear to be a real resume.\n\n";

        base += "RESUME TEXT TO EVALUATE:\n" + resumeText;
        return base;
    }

    private AnalysisResult parseResponse(String rawResponse) {
        try {
            String text = extractTextFromGeminiResponse(rawResponse);
            // Extract the object boundaries
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
            // Sanitize: replace literal newlines/tabs inside JSON string values
            // This handles AI responses that include unescaped control characters
            text = sanitizeJsonString(text);
            return objectMapper.readValue(text, AnalysisResult.class);
        } catch (Exception e) {
            e.printStackTrace();
            return getMockResult(false);
        }
    }

    /**
     * Replaces unescaped control characters (newlines, carriage returns, tabs)
     * that appear inside JSON string values, which would otherwise cause
     * "Expected ':' after property name" parse errors.
     */
    private String sanitizeJsonString(String json) {
        StringBuilder out = new StringBuilder(json.length());
        boolean inString = false;
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '"' && (i == 0 || json.charAt(i - 1) != '\\')) {
                inString = !inString;
                out.append(c);
            } else if (inString) {
                switch (c) {
                    case '\n':
                        out.append("\\n");
                        break;
                    case '\r':
                        out.append("\\r");
                        break;
                    case '\t':
                        out.append("\\t");
                        break;
                    default:
                        out.append(c);
                        break;
                }
            } else {
                out.append(c);
            }
        }
        return out.toString();
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
        result.setAtsScore(0);
        result.setImpactScore(0);
        result.setFormattingScore(0);
        result.setKeywordsScore(0);
        result.setSummary(
                "API Key is missing or an error occurred during analysis. Could not score document. Please check the backend configuration or API limits.");
        result.setStrengths("- Not applicable");
        result.setWeaknesses(
                "- Backend needs valid gemini.api.key configuration to function properly.");
        result.setFoundKeywords("");

        if (isPro) {
            result.setPartialAnalysis(false);
            result.setMissingKeywords("System Error: No API available");
            result.setSuggestedImprovements(
                    "Configure the environment with a valid API key.");
        } else {
            result.setPartialAnalysis(true);
            result.setMissingKeywords(
                    "System Error: No API available");
            result.setSuggestedImprovements(
                    "Configure the environment with a valid API key.");
        }

        return result;
    }

    public com.airesume.entity.ParsedResume tailorResumeToJob(String resumeText, String jobDescription) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)) {
            return getMockParsedResume(resumeText);
        }
        try {
            String prompt = "You are an expert resume tailoring AI. Given the candidate's current resume and a target job description, "
                    +
                    "rewrite the resume to maximize ATS keyword matches and highlight the most relevant experience for that specific role. "
                    +
                    "Rules:\n" +
                    "1. Keep all factual information — do NOT invent new jobs, degrees, or companies.\n" +
                    "2. Rewrite the professional summary to mirror the JD's language and priorities.\n" +
                    "3. Rewrite each experience summary to highlight achievements most relevant to the JD.\n" +
                    "4. Add missing JD keywords naturally where truthfully applicable.\n" +
                    "5. Return ONLY valid JSON — no markdown, no code blocks.\n\n" +
                    "Return this exact JSON structure:\n" +
                    "{\n" +
                    "  \"summary\": \"Tailored professional summary...\",\n" +
                    "  \"experiences\": [\n" +
                    "    { \"company\": \"\", \"role\": \"\", \"dates\": \"\", \"summary\": \"Tailored bullet points...\" }\n"
                    +
                    "  ]\n" +
                    "}\n\n" +
                    "JOB DESCRIPTION:\n" + jobDescription + "\n\n" +
                    "CANDIDATE RESUME:\n" + resumeText;

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

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }

            // Parse the partial update and return it as a ParsedResume for merging
            com.airesume.entity.ParsedResume tailored = objectMapper.readValue(text,
                    com.airesume.entity.ParsedResume.class);
            return tailored;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String detectGrammarAndCliches(String resumeText) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)) {
            return "[{\"phrase\":\"responsible for\",\"type\":\"cliche\",\"suggestion\":\"Replace with an active verb: 'led', 'owned', 'drove'\"},{\"phrase\":\"team player\",\"type\":\"cliche\",\"suggestion\":\"Show don't tell — describe a specific collaboration achievement\"},{\"phrase\":\"was managed\",\"type\":\"passive\",\"suggestion\":\"Rewrite actively: 'managed' or 'led'\"},{\"phrase\":\"go-getter\",\"type\":\"vague\",\"suggestion\":\"Replace with quantified accomplishments\"},{\"phrase\":\"detail oriented\",\"type\":\"cliche\",\"suggestion\":\"Remove — use specific examples instead\"}]";
        }
        try {
            String prompt = "You are a professional resume editor and ATS optimization expert. " +
                    "Carefully review the following resume text and identify all issues across these categories:\n" +
                    "1. 'cliche' — overused buzz phrases like 'responsible for', 'team player', 'results-driven', 'go-getter', 'detail-oriented', 'hard worker', 'passionate'\n"
                    +
                    "2. 'passive' — passive voice constructions like 'was managed', 'were implemented', 'has been used'\n"
                    +
                    "3. 'vague' — weak, unquantified claims like 'improved performance', 'various clients', 'multiple projects'\n"
                    +
                    "4. 'typo' — obvious spelling or grammar errors\n\n" +
                    "Return ONLY a valid JSON array (no markdown, no explanation):\n" +
                    "[{\"phrase\": \"exact phrase from resume\", \"type\": \"cliche|passive|vague|typo\", \"suggestion\": \"one-sentence fix\"}]\n\n"
                    +
                    "If there are no issues, return an empty array: []\n\n" +
                    "RESUME TEXT:\n" + resumeText;

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

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('[');
            int endIndex = text.lastIndexOf(']');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
            return text;

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    private com.airesume.entity.ParsedResume getMockParsedResume(String rawText) {
        com.airesume.entity.ParsedResume mocked = new com.airesume.entity.ParsedResume();
        mocked.setFullName("Your Name");
        mocked.setEmail("email@example.com");
        mocked.setPhone("(555) 555-5555");
        mocked.setLocation("City, State");

        // If we have raw text, dump it into the summary so it's not lost
        if (rawText != null && !rawText.isEmpty()) {
            mocked.setSummary(
                    "System notice: AI parsing was unavailable. Here is your raw text to edit manually:\n\n" + rawText);
        } else {
            mocked.setSummary("System notice: AI parsing was unavailable. Please enter your summary manually.");
        }

        mocked.setSkills(java.util.Arrays.asList("Skill 1", "Skill 2"));

        com.airesume.entity.Experience exp = new com.airesume.entity.Experience();
        exp.setCompany("Company Name");
        exp.setRole("Job Title");
        exp.setDates("Dates");
        exp.setSummary("• Describe your achievements here.");
        mocked.setExperiences(java.util.Arrays.asList(exp));

        com.airesume.entity.Education edu = new com.airesume.entity.Education();
        edu.setInstitution("University Name");
        edu.setDegree("Degree Name");
        edu.setGraduationDate("Graduation Year");
        mocked.setEducations(java.util.Arrays.asList(edu));

        return mocked;
    }

    public com.airesume.entity.ParsedResume parseLinkedInText(String linkedInText) {
        // LinkedIn pasted text is structurally similar to a resume — reuse the same
        // parser
        return parseStructuredResume(linkedInText, true);
    }

}
