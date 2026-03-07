package com.airesume.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String profilePictureUrl;

    @Column(nullable = false)
    private String provider; // e.g., "google", "linkedin"

    @Column(nullable = false, unique = true)
    private String providerId; // The user ID from the OAuth provider

    @Builder.Default
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isPro = false;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int scansUsed = 0;

    @Column(unique = true, length = 8)
    private String referralCode;

    private String referredBy;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int referralCount = 0;

    private LocalDateTime proEndDate;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int publicProfileViews = 0;

    // Custom getter to consider temporary Pro access
    public boolean isPro() {
        if (this.isPro)
            return true;
        if (this.proEndDate != null && this.proEndDate.isAfter(LocalDateTime.now()))
            return true;
        return false;
    }

    public enum Role {
        ROLE_USER,
        ROLE_ADMIN
    }

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'ROLE_USER'")
    private Role role = Role.ROLE_USER;
}
