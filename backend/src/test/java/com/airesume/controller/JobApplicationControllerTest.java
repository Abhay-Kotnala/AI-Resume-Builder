package com.airesume.controller;

import com.airesume.entity.JobApplicationDTO;
import com.airesume.service.JobApplicationService;
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

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class JobApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobApplicationService service;

    @Autowired
    private ObjectMapper objectMapper;

    private JobApplicationDTO testApp;

    @BeforeEach
    void setUp() {
        testApp = new JobApplicationDTO();
        testApp.setId(1L);
        testApp.setCompanyName("TestCorp");
        testApp.setJobTitle("Developer");
        testApp.setStatus("APPLIED");
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void getApplications_ShouldReturnList() throws Exception {
        when(service.getUserApplications("test@test.com")).thenReturn(Arrays.asList(testApp));

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].companyName").value("TestCorp"))
                .andExpect(jsonPath("$[0].status").value("APPLIED"));
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void createApplication_ShouldReturnCreatedApp() throws Exception {
        when(service.createApplication(eq("test@test.com"), any(JobApplicationDTO.class))).thenReturn(testApp);

        mockMvc.perform(post("/api/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testApp)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void updateApplication_ShouldReturnUpdatedApp() throws Exception {
        when(service.updateApplication(eq("test@test.com"), eq(1L), any(JobApplicationDTO.class))).thenReturn(testApp);

        mockMvc.perform(put("/api/applications/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testApp)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("TestCorp"));
    }

    @Test
    @WithMockUser(username = "test@test.com")
    void deleteApplication_ShouldReturnNoContent() throws Exception {
        doNothing().when(service).deleteApplication("test@test.com", 1L);

        mockMvc.perform(delete("/api/applications/1"))
                .andExpect(status().isNoContent());

        verify(service, times(1)).deleteApplication("test@test.com", 1L);
    }
}
