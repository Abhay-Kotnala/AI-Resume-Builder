package com.airesume.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
public class Education {
    private String institution;
    private String degree;
    private String graduationDate;
    private String details;
}
