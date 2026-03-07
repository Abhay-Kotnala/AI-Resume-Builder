package com.airesume.controller;

import com.airesume.entity.JobApplicationDTO;
import com.airesume.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService service;

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized");
        }
        return auth.getName();
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationDTO>> getApplications() {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(service.getUserApplications(email));
    }

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createApplication(@RequestBody JobApplicationDTO dto) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(service.createApplication(email, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> updateApplication(
            @PathVariable Long id,
            @RequestBody JobApplicationDTO dto) {
        String email = getAuthenticatedEmail();
        return ResponseEntity.ok(service.updateApplication(email, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        String email = getAuthenticatedEmail();
        service.deleteApplication(email, id);
        return ResponseEntity.noContent().build();
    }
}
