package com.airesume.service;

import com.airesume.entity.JobApplication;
import com.airesume.entity.JobApplicationDTO;
import com.airesume.entity.User;
import com.airesume.repository.JobApplicationRepository;
import com.airesume.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository repository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JobApplicationService service;

    private User testUser;
    private JobApplication testApp;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@test.com");

        testApp = new JobApplication();
        testApp.setId(10L);
        testApp.setCompanyName("Google");
        testApp.setJobTitle("Engineer");
        testApp.setStatus("WISHLIST");
        testApp.setUser(testUser);
    }

    @Test
    void getUserApplications_ShouldReturnList() {
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(repository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Arrays.asList(testApp));

        List<JobApplicationDTO> result = service.getUserApplications("test@test.com");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Google", result.get(0).getCompanyName());
    }

    @Test
    void createApplication_ShouldSaveAndReturnDTO() {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setCompanyName("Apple");
        dto.setJobTitle("Dev");
        dto.setStatus("APPLIED");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(testUser));
        when(repository.save(any(JobApplication.class))).thenAnswer(invocation -> {
            JobApplication saved = invocation.getArgument(0);
            saved.setId(20L);
            return saved;
        });

        JobApplicationDTO result = service.createApplication("test@test.com", dto);

        assertNotNull(result);
        assertEquals(20L, result.getId());
        assertEquals("Apple", result.getCompanyName());
    }

    @Test
    void updateApplication_ShouldUpdateAndReturnDTO() {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setCompanyName("Google");
        dto.setJobTitle("Senior Engineer");
        dto.setStatus("OFFER");

        when(repository.findById(10L)).thenReturn(Optional.of(testApp));
        when(repository.save(any(JobApplication.class))).thenReturn(testApp);

        JobApplicationDTO result = service.updateApplication("test@test.com", 10L, dto);

        assertNotNull(result);
        assertEquals("OFFER", result.getStatus());
        assertEquals("Senior Engineer", result.getJobTitle());
    }

    @Test
    void updateApplication_ShouldThrowIfUnauthorized() {
        JobApplicationDTO dto = new JobApplicationDTO();
        when(repository.findById(10L)).thenReturn(Optional.of(testApp));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.updateApplication("wrong@test.com", 10L, dto);
        });

        assertEquals("Unauthorized", exception.getMessage());
    }

    @Test
    void deleteApplication_ShouldDeleteIfAuthorized() {
        when(repository.findById(10L)).thenReturn(Optional.of(testApp));

        service.deleteApplication("test@test.com", 10L);

        verify(repository, times(1)).delete(testApp);
    }

    @Test
    void deleteApplication_ShouldThrowIfUnauthorized() {
        when(repository.findById(10L)).thenReturn(Optional.of(testApp));

        assertThrows(RuntimeException.class, () -> {
            service.deleteApplication("wrong@test.com", 10L);
        });

        verify(repository, never()).delete(any());
    }
}
