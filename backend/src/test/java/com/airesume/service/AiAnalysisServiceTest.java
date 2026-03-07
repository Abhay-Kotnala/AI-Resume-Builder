package com.airesume.service;

import com.airesume.entity.AnalysisResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AiAnalysisServiceTest {

    private AiAnalysisService aiAnalysisService;

    @Mock
    private RestClient.Builder restClientBuilder;

    @Mock
    private RestClient restClient;

    @Mock
    private com.airesume.service.AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // We use a mock RestClient builder that just returns a mock
        // Since we are testing with mock APIs anyway, the exact setup isn't critical
        // for these tests
        org.mockito.Mockito.when(restClientBuilder.baseUrl(org.mockito.Mockito.anyString()))
                .thenReturn(restClientBuilder);
        org.mockito.Mockito.when(restClientBuilder.build()).thenReturn(restClient);

        // Pass the mock analytics service
        aiAnalysisService = new AiAnalysisService(restClientBuilder, "TEST_API_KEY", new ObjectMapper(),
                analyticsService);
    }

    @Test
    void analyzeResume_WithMockKey_ReturnsMockResult() {
        String mockResumeText = "John Doe, Java Developer, 5 years of experience.";
        String mockJobDescription = "Looking for a Java Developer with Spring Boot experience.";

        AnalysisResult result = aiAnalysisService.analyzeResume(mockResumeText, mockJobDescription, true);

        assertNotNull(result);
        assertEquals(0, result.getAtsScore());
        assertNotNull(result.getStrengths());
        assertNotNull(result.getWeaknesses());
        assertNotNull(result.getSuggestedImprovements());
    }
}
