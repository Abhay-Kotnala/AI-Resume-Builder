package com.airesume.repository;

import com.airesume.entity.StripeEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StripeEventLogRepository extends JpaRepository<StripeEventLog, String> {
}
