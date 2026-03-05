package com.airesume.controller;

import com.airesume.entity.JobApplicationDTO;
import com.airesume.service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService service;

    @GetMapping
    public ResponseEntity<List<JobApplicationDTO>> getApplications(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        return ResponseEntity.ok(service.getUserApplications(email));
    }

    @PostMapping
    public ResponseEntity<JobApplicationDTO> createApplication(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody JobApplicationDTO dto) {
        String email = principal.getAttribute("email");
        return ResponseEntity.ok(service.createApplication(email, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDTO> updateApplication(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long id,
            @RequestBody JobApplicationDTO dto) {
        String email = principal.getAttribute("email");
        return ResponseEntity.ok(service.updateApplication(email, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal OAuth2User principal,
            @PathVariable Long id) {
        String email = principal.getAttribute("email");
        service.deleteApplication(email, id);
        return ResponseEntity.noContent().build();
    }
}
