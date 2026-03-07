package com.airesume.repository;

import com.airesume.entity.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {
    long countByEventType(String eventType);

    @Query("SELECT FUNCTION('DATE', e.timestamp) as date, COUNT(e) as count " +
            "FROM AnalyticsEvent e " +
            "WHERE e.eventType = :eventType AND e.timestamp >= :startDate " +
            "GROUP BY FUNCTION('DATE', e.timestamp) " +
            "ORDER BY FUNCTION('DATE', e.timestamp) ASC")
    List<Object[]> countEventsPerDay(@Param("eventType") String eventType, @Param("startDate") LocalDateTime startDate);
}
