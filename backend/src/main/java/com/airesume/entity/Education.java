package com.airesume.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;

@Embeddable
@Data
@NoArgsConstructor
public class Education {
    @Column(columnDefinition = "TEXT")
    private String institution;
    @Column(columnDefinition = "TEXT")
    private String degree;
    private String graduationDate;
    @Column(columnDefinition = "TEXT")
    private String details;
}
