package com.airesume.service;

import com.airesume.entity.User;
import com.airesume.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailNudgeScheduler {

    private static final Logger logger = LoggerFactory.getLogger(EmailNudgeScheduler.class);

    private final UserRepository userRepository;
    private final EmailService emailService;

    public EmailNudgeScheduler(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Runs every day at 10:00 AM server time.
     * Finds users whose Pro subscription expires in exactly 3 days.
     */
    @Scheduled(cron = "0 0 10 * * ?")
    @Transactional(readOnly = true)
    public void scheduleProExpiringNudges() {
        logger.info("Running scheduled task: Checking for Pro subscriptions expiring in 3 days...");

        LocalDateTime startOfTargetDay = LocalDateTime.now().plusDays(3).withHour(0).withMinute(0).withSecond(0)
                .withNano(0);
        LocalDateTime endOfTargetDay = startOfTargetDay.plusDays(1).minusNanos(1);

        List<User> expiringUsers = userRepository.findByProEndDateBetween(startOfTargetDay, endOfTargetDay);

        for (User user : expiringUsers) {
            if (user.isPro() && user.getEmail() != null) {
                logger.info("Sending Pro Expiring email to: {}", user.getEmail());
                emailService.sendProExpiringEmail(user.getEmail(), user.getName());
            }
        }
    }

    /**
     * Runs every day at 11:00 AM server time.
     * Finds users who haven't logged in for exactly 7 days.
     * Note: Requires a lastLogin field on User, but assuming we can approximate
     * with no recent activity or just use the simplest heuristic.
     * For now, we will query users created exactly 7 days ago as a simplified
     * "inactive" metric if they aren't Pro.
     */
    @Scheduled(cron = "0 0 11 * * ?")
    @Transactional(readOnly = true)
    public void scheduleInactiveUserNudges() {
        logger.info("Running scheduled task: Checking for inactive users (7 days since signup)...");
        // Simplified approach: Target users who signed up exactly 7 days ago and aren't
        // Pro.
        // In a full production app we would track `lastLoginAt`.
        // We'll leave this as a placeholder log for the implementation plan since
        // there's no last_login field.
        logger.info("Inactive user nudges would run here. (Requires lastLoginAt tracking on User entity).");
    }
}
