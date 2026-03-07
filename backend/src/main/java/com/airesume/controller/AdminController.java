package com.airesume.controller;

import com.airesume.dto.AdminStatsDTO;
import com.airesume.repository.AnalyticsEventRepository;
import com.airesume.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final AnalyticsEventRepository analyticsEventRepository;

    @GetMapping("/stats/overview")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminStatsDTO> getOverviewStats() {
        long totalUsers = userRepository.count();
        long totalProUsers = userRepository.countActiveProUsers();

        long totalResumes = analyticsEventRepository.countByEventType("RESUME_GENERATED");
        long totalAiActions = analyticsEventRepository.countByEventType("AI_ACTION");

        // Fetch signups over the last 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> signupsRaw = analyticsEventRepository.countEventsPerDay("SIGNUP", thirtyDaysAgo);

        List<Map<String, Object>> signupsData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (Object[] row : signupsRaw) {
            Map<String, Object> point = new HashMap<>();

            // PostgreSQL DATE mapping depends on Hibernate version. Usually java.sql.Date
            if (row[0] instanceof java.util.Date) {
                java.util.Date date = (java.util.Date) row[0];
                point.put("date", date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate().format(formatter));
            } else if (row[0] != null) {
                point.put("date", row[0].toString());
            }

            point.put("signups", ((Number) row[1]).longValue());
            signupsData.add(point);
        }

        AdminStatsDTO dto = AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalProUsers(totalProUsers)
                .totalResumesGenerated(totalResumes)
                .totalAiActions(totalAiActions)
                .signupsData(signupsData)
                .build();

        return ResponseEntity.ok(dto);
    }
}
