package com.airesume.service;

import com.airesume.entity.AnalysisResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AiAnalysisServiceTest {

    private AiAnalysisService aiAnalysisService;

    @BeforeEach
    void setUp() {
        // Test with mock behavior when API key is missing
        RestClient.Builder builder = RestClient.builder();
        ObjectMapper mapper = new ObjectMapper();
        aiAnalysisService = new AiAnalysisService(builder, "", mapper);
    }

    @Test
    void analyzeResume_WithMockKey_ReturnsMockResult() {
        String mockResumeText = "John Doe, Java Developer, 5 years of experience.";
        String mockJobDescription = "Looking for a Java Developer with Spring Boot experience.";

        AnalysisResult result = aiAnalysisService.analyzeResume(mockResumeText, mockJobDescription, true);

        assertNotNull(result);
        assertEquals(85, result.getAtsScore());
        assertNotNull(result.getStrengths());
        assertNotNull(result.getWeaknesses());
        assertNotNull(result.getSuggestedImprovements());
    }
}
