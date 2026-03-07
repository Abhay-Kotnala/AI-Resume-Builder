package com.airesume.controller;

import com.airesume.entity.ParsedResume;
import com.airesume.entity.Resume;
import com.airesume.entity.User;
import com.airesume.repository.AnalysisResultRepository;
import com.airesume.repository.ResumeRepository;
import com.airesume.repository.UserRepository;
import com.airesume.service.AiAnalysisService;
import com.airesume.service.BackgroundJobService;
import com.airesume.service.DocxGeneratorService;
import com.airesume.service.PdfGeneratorService;
import com.airesume.service.PdfParserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class ResumeControllerExportTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ResumeRepository resumeRepository;

    @MockBean
    private PdfGeneratorService pdfGeneratorService;

    @MockBean
    private DocxGeneratorService docxGeneratorService;

    // Remaining required mocks to satisfy context load
    @MockBean
    private PdfParserService pdfParserService;
    @MockBean
    private AiAnalysisService aiAnalysisService;
    @MockBean
    private AnalysisResultRepository analysisResultRepository;
    @MockBean
    private BackgroundJobService backgroundJobService;

    @Autowired
    private ObjectMapper objectMapper;

    private User freeUser;
    private User proUser;
    private Resume testResume;

    @BeforeEach
    void setUp() throws Exception {
        freeUser = new User();
        freeUser.setEmail("free@test.com");
        freeUser.setPro(false);

        proUser = new User();
        proUser.setEmail("pro@test.com");
        proUser.setPro(true);

        testResume = new Resume();
        testResume.setId(1L);
        testResume.setParsedResume(new ParsedResume());

        when(resumeRepository.findById(1L)).thenReturn(Optional.of(testResume));
        when(pdfGeneratorService.generatePdfFromRawHtml(anyString())).thenReturn(new byte[] { 1, 2, 3 });
        when(docxGeneratorService.generateDocx(any(), anyString(), anyString())).thenReturn(new byte[] { 1, 2, 3 });
    }

    // --- PDF EXPORT TESTS ---

    @Test
    @WithMockUser(username = "free@test.com")
    void testPdfExport_FreeUser_BasicTemplate_ShouldSucceed() throws Exception {
        when(userRepository.findByEmail("free@test.com")).thenReturn(Optional.of(freeUser));

        mockMvc.perform(post("/api/resume/1/export-pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("template", "basic"))))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "free@test.com")
    void testPdfExport_FreeUser_PremiumTemplate_ShouldFail403() throws Exception {
        when(userRepository.findByEmail("free@test.com")).thenReturn(Optional.of(freeUser));

        mockMvc.perform(post("/api/resume/1/export-pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("template", "modern"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("QuotaExceeded"));
    }

    @Test
    @WithMockUser(username = "pro@test.com")
    void testPdfExport_ProUser_PremiumTemplate_ShouldSucceed() throws Exception {
        when(userRepository.findByEmail("pro@test.com")).thenReturn(Optional.of(proUser));

        mockMvc.perform(post("/api/resume/1/export-pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("template", "modern"))))
                .andExpect(status().isOk());
    }

    // --- DOCX EXPORT TESTS ---

    @Test
    @WithMockUser(username = "free@test.com")
    void testDocxExport_FreeUser_BasicTemplate_ShouldSucceed() throws Exception {
        when(userRepository.findByEmail("free@test.com")).thenReturn(Optional.of(freeUser));

        mockMvc.perform(post("/api/resume/1/export-docx")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("template", "basic"))))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "free@test.com")
    void testDocxExport_FreeUser_PremiumTemplate_ShouldFail403() throws Exception {
        when(userRepository.findByEmail("free@test.com")).thenReturn(Optional.of(freeUser));

        mockMvc.perform(post("/api/resume/1/export-docx")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("template", "executive"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("QuotaExceeded"));
    }

    @Test
    @WithMockUser(username = "pro@test.com")
    void testDocxExport_ProUser_PremiumTemplate_ShouldSucceed() throws Exception {
        when(userRepository.findByEmail("pro@test.com")).thenReturn(Optional.of(proUser));

        mockMvc.perform(post("/api/resume/1/export-docx")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("template", "executive"))))
                .andExpect(status().isOk());
    }
}
