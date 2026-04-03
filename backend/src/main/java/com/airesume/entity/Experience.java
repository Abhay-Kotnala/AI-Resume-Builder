package com.airesume.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;

@Embeddable
@Data
@NoArgsConstructor
public class Experience {
    @Column(columnDefinition = "TEXT")
    private String company;
    @Column(columnDefinition = "TEXT")
    private String role;
    private String dates;
    @Column(columnDefinition = "TEXT")
    private String summary;
}
