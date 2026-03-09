package com.airesume.controller;

import com.airesume.entity.AnalysisResult;
import com.airesume.entity.Resume;
import com.airesume.entity.User;
import com.airesume.repository.AnalysisResultRepository;
import com.airesume.repository.ResumeRepository;
import com.airesume.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
public class PublicProfileController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final AnalysisResultRepository analysisResultRepository;

    public PublicProfileController(UserRepository userRepository, ResumeRepository resumeRepository,
            AnalysisResultRepository analysisResultRepository) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.analysisResultRepository = analysisResultRepository;
    }

    @GetMapping("/{referralCode}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String referralCode) {
        try {
            User user = userRepository.findByReferralCode(referralCode)
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

            List<Resume> resumes = resumeRepository.findAllByUserOrderByUploadDateDesc(user);
            int bestScore = 0;

            for (Resume r : resumes) {
                Optional<AnalysisResult> res = analysisResultRepository.findByResumeId(r.getId());
                if (res.isPresent() && res.get().getAtsScore() > bestScore) {
                    bestScore = res.get().getAtsScore();
                }
            }

            // Increment profile views
            user.setPublicProfileViews(user.getPublicProfileViews() + 1);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "name", user.getName(),
                    "picture", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "",
                    "bestScore", bestScore,
                    "isPro", user.isPro(),
                    "referralCode", user.getReferralCode()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
