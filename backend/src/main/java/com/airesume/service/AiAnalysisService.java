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
    private final String apiModel;
    private final ObjectMapper objectMapper;
    private final AnalyticsService analyticsService;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AiAnalysisService.class);
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 15000;

    public AiAnalysisService(RestClient.Builder restClientBuilder,
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.model:gemini-2.0-flash}") String apiModel,
            ObjectMapper objectMapper,
            AnalyticsService analyticsService) {
        this.restClient = restClientBuilder.baseUrl("https://generativelanguage.googleapis.com").build();
        this.apiKey = apiKey;
        this.apiModel = apiModel;
        this.objectMapper = objectMapper;
        this.analyticsService = analyticsService;
    }

    /**
     * Calls the Gemini API with automatic retry and exponential backoff for 429 (rate limit) errors.
     * The free tier limits input tokens per minute, so we need to wait long enough for the window to reset.
     * Google typically suggests retryDelay of ~30s, so our backoffs are: 15s, 30s, 60s.
     */
    private String callGeminiWithRetry(Map<String, Object> requestBody) {
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                return restClient.post()
                        .uri("/v1beta/models/{model}:generateContent?key={key}", apiModel, apiKey)
                        .body(requestBody)
                        .retrieve()
                        .body(String.class);
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                if (e.getStatusCode().value() == 429 && attempt < MAX_RETRIES) {
                    // Parse Google's suggested retry delay from the error response
                    long waitMs = extractRetryDelay(e.getResponseBodyAsString());
                    if (waitMs <= 0) {
                        // Fallback: 15s, 30s, 60s
                        waitMs = INITIAL_BACKOFF_MS * (long) Math.pow(2, attempt);
                    }
                    logger.warn("Gemini API rate limited (429). Waiting {}s before retry (attempt {}/{})",
                            waitMs / 1000, attempt + 1, MAX_RETRIES);
                    try {
                        Thread.sleep(waitMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new com.airesume.exception.AiServiceUnavailableException("Interrupted during retry backoff.", ie);
                    }
                } else {
                    throw e; // Re-throw non-429 errors or final attempt
                }
            }
        }
        throw new com.airesume.exception.AiServiceUnavailableException("Gemini API rate limit exceeded after all retries.");
    }

    /**
     * Extracts the retryDelay value from a Gemini 429 error response JSON.
     * Returns delay in milliseconds, or -1 if parsing fails.
     */
    private long extractRetryDelay(String errorBody) {
        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(errorBody);
            com.fasterxml.jackson.databind.JsonNode details = root.path("error").path("details");
            for (com.fasterxml.jackson.databind.JsonNode detail : details) {
                if (detail.has("retryDelay")) {
                    String delayStr = detail.get("retryDelay").asText(); // e.g. "28s" or "45.123s"
                    delayStr = delayStr.replace("s", "").trim();
                    double seconds = Double.parseDouble(delayStr);
                    return (long) (seconds * 1000) + 2000; // Add 2s buffer
                }
            }
        } catch (Exception ignored) {
            // Fall through to default backoff
        }
        return -1;
    }

    public AnalysisResult analyzeResume(String resumeText, String jobDescription, boolean isPro) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Analyze Resume");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
        }

        try {
            String prompt = buildPrompt(resumeText, jobDescription);

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    },
                    "generationConfig", Map.of(
                            "responseMimeType", "application/json"
                    )
            );

            String response = callGeminiWithRetry(requestBody);

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

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to analyze resume with AI.", e);
        }
    }

    public com.airesume.entity.ParsedResume parseStructuredResume(String resumeText, boolean isPro) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
        }

        try {
            String prompt = "You are an expert data extraction AI for resume parsing. I will provide you with unstructured text from a resume PDF. "
                    +
                    "Your single goal is to extract literally ALL information provided without summarizing, omitting, or truncating anything. " +
                    "Copy bullet points and descriptions verbatim. Everything in the input MUST be captured in the output JSON. " +
                    "Organize the extracted data perfectly into the following ONLY valid JSON structure. " +
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
                    "CRITICAL INSTRUCTIONS:\n" +
                    "1. For the 'summary' fields in experiences, include EXACTLY all bullet points from the source. Do NOT drop any bullet points. Separate them by newlines (\\n).\n" +
                    "2. Extract any additional resume sections (e.g., Projects, Certifications, Awards, Languages, Publications, Volunteering) into the customSections map. The keys must be the section header as a string, and the value must be the section text verbatim as a single string, using • for list items and \\n for newlines.\n" +
                    "3. DO NOT hallucinate info.\n\n"
                    +
                    "RESUME TEXT TO PARSE:\n" + resumeText;

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    },
                    "generationConfig", Map.of(
                            "maxOutputTokens", 8192,
                            "responseMimeType", "application/json"
                    )
            );

            String response = callGeminiWithRetry(requestBody);

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }

            // Sanitize JSON to prevent parser errors with literal newlines from the AI
            text = sanitizeJsonString(text);

            return objectMapper.readValue(text, com.airesume.entity.ParsedResume.class);

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to parse resume with AI.", e);
        }
    }

    public String enhanceBulletPoint(String bulletPoint, String targetJob, String tone) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Magic Wand Enhance");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
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
            
            prompt += "\n\n*** FEW-SHOT EXAMPLES OF ELITE TARGET BULLETS ***\n" +
                      "Bad: Managed a team of engineers to build a new feature.\n" +
                      "Elite: Directed a cross-functional team of 6 engineers to architect a scalable microservice, decreasing API latency by 45% and saving $12,000 annually in AWS costs.\n" +
                      "Bad: Handled customer support tickets.\n" +
                      "Elite: Resolved 40+ complex Tier-3 technical support tickets weekly, maintaining a 98% CSAT score and reducing average resolution time by 20%.\n" +
                      "*** END EXAMPLES ***\n\n";

            prompt += "Original Bullet point: '" + bulletPoint
                    + "'\n\nReturn EXACTLY AND ONLY the rewritten bullet point text. Do not include introductory phrases like 'Here is the rewritten bullet point:'.";

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    });

            String response = callGeminiWithRetry(requestBody);

            return extractTextFromGeminiResponse(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to enhance bullet point with AI.",
                    e);
        }
    }

    public String generateCoverLetter(String resumeText, String jobDescription) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Cover Letter Generation");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your_gemini_api_key_here")) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
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

            String response = callGeminiWithRetry(requestBody);

            return extractTextFromGeminiResponse(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to generate cover letter with AI.",
                    e);
        }
    }

    public String generateInterviewQuestions(String resumeText, String jobDescription) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)
                || "your_gemini_api_key_here".equals(apiKey)) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
        }
        try {
            String prompt = "You are a senior engineering hiring manager at a top tech company conducting a technical interview. "
                    +
                    "Based on the candidate's resume's skills and experience, generate EXACTLY 10 highly targeted interview questions. "
                    +
                    "The questions should be a mix of: behavioural, technical, and career/motivation. "
                    +
                    "Each question must be specific to the candidate's actual experience—do NOT use generic cookie-cutter questions. "
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

            String response = callGeminiWithRetry(requestBody);

            return extractTextFromGeminiResponse(response);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Failed to generate interview questions with AI.", e);
        }
    }

    public String analyzeJobMatch(String resumeText, String jobDescription) {
        // Log AI Action
        analyticsService.logEvent(null, "AI_ACTION", "Feature: Job Match Engine");

        if (apiKey == null || apiKey.isEmpty() || "your_gemini_api_key_here".equals(apiKey)
                || "YOUR_KEY_HERE".equals(apiKey)) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
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

            String response = callGeminiWithRetry(requestBody);

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
            return text;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to analyze job match with AI.", e);
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

        base += "CRITICAL RULE: If the resume text is empty, contains only gibberish, or is shorter than 20 words, YOU MUST set all integer scores to 0. Otherwise, you MUST provide realistic integer scores between 1 and 100 based on the quality of the resume.\n\n";

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
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Failed to parse AI response: " + e.getMessage(), e);
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

    public com.airesume.entity.ParsedResume tailorResumeToJob(String resumeText, String jobDescription) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)
                || "your_gemini_api_key_here".equals(apiKey)) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
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

            String response = callGeminiWithRetry(requestBody);

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }

            text = sanitizeJsonString(text);

            // Parse the partial update and return it as a ParsedResume for merging
            com.airesume.entity.ParsedResume tailored = objectMapper.readValue(text,
                    com.airesume.entity.ParsedResume.class);
            return tailored;

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to tailor resume with AI.", e);
        }
    }

    public String detectGrammarAndCliches(String resumeText) {
        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)
                || "your_gemini_api_key_here".equals(apiKey)) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
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

            String response = callGeminiWithRetry(requestBody);

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('[');
            int endIndex = text.lastIndexOf(']');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
            return text;

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to detect grammar with AI.", e);
        }
    }

    public com.airesume.entity.ParsedResume parseLinkedInText(String linkedInText) {
        // LinkedIn pasted text is structurally similar to a resume — reuse the same
        // parser
        return parseStructuredResume(linkedInText, true);
    }

    public String generateLinkedInProfile(String resumeText) {
        analyticsService.logEvent(null, "AI_ACTION", "Feature: LinkedIn Profile Optimizer");

        if (apiKey == null || apiKey.isEmpty() || "YOUR_KEY_HERE".equals(apiKey)
                || "your_gemini_api_key_here".equals(apiKey)) {
            throw new com.airesume.exception.AiServiceUnavailableException(
                    "Gemini API Key is missing or invalid. Please check backend configuration.");
        }
        try {
            String prompt = "You are an expert personal branding coach and LinkedIn optimization specialist. "
                    + "Using the data from the provided resume, automatically write a highly optimized LinkedIn Headline and an About section that the user can directly copy and paste. "
                    + "The headline should be catchy and highlight their core expertise and value proposition (max 120 characters). "
                    + "The About section should be a compelling, first-person narrative that summarizes their career journey, key skills, and greatest achievements. "
                    + "Return ONLY a valid JSON object in this exact format (no markdown, no explanation):\n"
                    + "{\n"
                    + "  \"headline\": \"Your optimized LinkedIn headline here...\",\n"
                    + "  \"about\": \"Your tailored, compelling About section here...\"\n"
                    + "}\n\n"
                    + "CANDIDATE RESUME:\n" + resumeText;

            Map<String, Object> requestBody = Map.of(
                    "contents", new Object[] {
                            Map.of("parts", new Object[] {
                                    Map.of("text", prompt)
                            })
                    });

            String response = callGeminiWithRetry(requestBody);

            String text = extractTextFromGeminiResponse(response);
            int startIndex = text.indexOf('{');
            int endIndex = text.lastIndexOf('}');
            if (startIndex >= 0 && endIndex >= startIndex) {
                text = text.substring(startIndex, endIndex + 1);
            }
            return text;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            e.printStackTrace();
            if (e.getStatusCode().value() == 429) {
                throw new com.airesume.exception.AiServiceUnavailableException(
                        "High Demand: The AI service is currently receiving too many requests. Please try again in 60 seconds.",
                        e);
            }
            throw new com.airesume.exception.AiServiceUnavailableException("AI Service Error: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.airesume.exception.AiServiceUnavailableException("Failed to generate LinkedIn profile with AI.", e);
        }
    }
}
