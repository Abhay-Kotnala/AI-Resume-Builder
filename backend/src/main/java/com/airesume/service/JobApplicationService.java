package com.airesume.service;

import com.airesume.entity.JobApplication;
import com.airesume.entity.JobApplicationDTO;
import com.airesume.entity.User;
import com.airesume.repository.JobApplicationRepository;
import com.airesume.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final UserRepository userRepository;

    public List<JobApplicationDTO> getUserApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return repository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public JobApplicationDTO createApplication(String email, JobApplicationDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication app = new JobApplication();
        app.setUser(user);
        updateEntityFromDTO(app, dto);

        return mapToDTO(repository.save(app));
    }

    public JobApplicationDTO updateApplication(String email, Long id, JobApplicationDTO dto) {
        JobApplication app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!app.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        updateEntityFromDTO(app, dto);
        return mapToDTO(repository.save(app));
    }

    public void deleteApplication(String email, Long id) {
        JobApplication app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!app.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        repository.delete(app);
    }

    private JobApplicationDTO mapToDTO(JobApplication app) {
        JobApplicationDTO dto = new JobApplicationDTO();
        dto.setId(app.getId());
        dto.setCompanyName(app.getCompanyName());
        dto.setJobTitle(app.getJobTitle());
        dto.setJobUrl(app.getJobUrl());
        dto.setStatus(app.getStatus());
        dto.setSalaryRange(app.getSalaryRange());
        dto.setNotes(app.getNotes());
        dto.setAppliedDate(app.getAppliedDate());
        dto.setCreatedAt(app.getCreatedAt());
        dto.setUpdatedAt(app.getUpdatedAt());
        return dto;
    }

    private void updateEntityFromDTO(JobApplication app, JobApplicationDTO dto) {
        app.setCompanyName(dto.getCompanyName());
        app.setJobTitle(dto.getJobTitle());
        app.setJobUrl(dto.getJobUrl());
        app.setStatus(dto.getStatus());
        app.setSalaryRange(dto.getSalaryRange());
        app.setNotes(dto.getNotes());
        app.setAppliedDate(dto.getAppliedDate());
    }
}
