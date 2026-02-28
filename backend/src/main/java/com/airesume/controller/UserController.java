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
        return ResponseEntity.ok(Map.of(
                "name", user.getName() != null ? user.getName() : "",
                "email", user.getEmail(),
                "picture", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "",
                "provider", user.getProvider() != null ? user.getProvider() : "google",
                "isPro", user.isPro(),
                "scansUsed", user.getScansUsed(),
                "resumeCount", resumeCount));
    }
}
