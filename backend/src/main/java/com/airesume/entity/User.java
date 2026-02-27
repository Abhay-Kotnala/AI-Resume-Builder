package com.airesume.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
