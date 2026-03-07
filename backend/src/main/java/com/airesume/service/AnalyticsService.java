package com.airesume.service;

import com.airesume.entity.AnalyticsEvent;
import com.airesume.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final AnalyticsEventRepository analyticsEventRepository;

    @Async
    public void logEvent(Long userId, String eventType, String details) {
        try {
            AnalyticsEvent event = AnalyticsEvent.builder()
                    .userId(userId)
                    .eventType(eventType)
                    .timestamp(LocalDateTime.now())
                    .details(details)
                    .build();
            analyticsEventRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to log analytics event: {}", eventType, e);
        }
    }
}
