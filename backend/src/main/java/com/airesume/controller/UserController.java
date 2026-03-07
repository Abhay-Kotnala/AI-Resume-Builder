package com.airesume.controller;

import com.airesume.entity.User;
import com.airesume.repository.ResumeRepository;
import com.airesume.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    /**
     * Returns the profile of the currently authenticated user.
     * The user is identified by their email extracted from the JWT via
     * JwtAuthenticationFilter.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        long resumeCount = resumeRepository.countByUser(user);

        // Auto-generate referral code for existing users who don't have one yet
        if (user.getReferralCode() == null || user.getReferralCode().isEmpty()) {
            String newCode = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            user.setReferralCode(newCode);
            user = userRepository.save(user);
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("name", user.getName() != null ? user.getName() : "");
        response.put("email", user.getEmail());
        response.put("picture", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "");
        response.put("provider", user.getProvider() != null ? user.getProvider() : "google");
        response.put("isPro", user.isPro());
        response.put("scansUsed", user.getScansUsed());
        response.put("role", user.getRole().name());
        response.put("resumeCount", resumeCount);
        response.put("referralCode", user.getReferralCode() != null ? user.getReferralCode() : "");
        response.put("referralCount", user.getReferralCount());
        response.put("publicProfileViews", user.getPublicProfileViews());

        return ResponseEntity.ok(response);
    }

    /**
     * Temporary endpoint to escalate the current user to an admin and grant pro.
     * To be removed in production.
     */
    @org.springframework.web.bind.annotation.PostMapping("/escalate-to-admin")
    public ResponseEntity<?> escalateToAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        user.setRole(User.Role.ROLE_ADMIN);
        user.setPro(true);
        userRepository.save(user);
        return ResponseEntity.ok(
                "Successfully escalated to admin and granted Pro. Please log out and back in to refresh your token.");
    }

    /**
     * Temporary endpoint to grant pro to the current user.
     * To be removed in production.
     */
    @org.springframework.web.bind.annotation.PostMapping("/make-pro")
    public ResponseEntity<?> makePro() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        user.setPro(true);
        userRepository.save(user);
        return ResponseEntity.ok("Successfully granted Pro. Please refresh your profile or log out/in.");
    }
}
