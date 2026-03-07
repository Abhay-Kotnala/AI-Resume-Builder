package com.airesume.controller;

import com.airesume.dto.FeedbackRequest;
import com.airesume.entity.Feedback;
import com.airesume.repository.FeedbackRepository;
import com.airesume.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final EmailService emailService;

    public FeedbackController(FeedbackRepository feedbackRepository, EmailService emailService) {
        this.feedbackRepository = feedbackRepository;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        // 1. Save to database
        Feedback feedback = Feedback.builder()
                .email(request.getEmail())
                .message(request.getMessage())
                .rating(request.getRating())
                .build();
        feedbackRepository.save(feedback);

        // 2. Send email to admin
        emailService.sendFeedbackEmail(request.getEmail(), request.getMessage(), request.getRating());

        return ResponseEntity.ok().build();
    }
}
