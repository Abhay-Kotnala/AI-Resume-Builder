package com.airesume.repository;

import com.airesume.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isPro = true OR (u.proEndDate IS NOT NULL AND u.proEndDate > CURRENT_TIMESTAMP)")
    long countActiveProUsers();

    Optional<User> findByReferralCode(String referralCode);

    List<User> findByProEndDateBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
