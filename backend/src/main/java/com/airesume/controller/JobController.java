package com.airesume.controller;

import com.airesume.model.JobResponse;
import com.airesume.service.BackgroundJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final BackgroundJobService backgroundJobService;

    @GetMapping("/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable String jobId) {
        JobResponse response = backgroundJobService.getJobStatus(jobId);

        if (response == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Job not found"));
        }

        return ResponseEntity.ok(response);
    }
}
