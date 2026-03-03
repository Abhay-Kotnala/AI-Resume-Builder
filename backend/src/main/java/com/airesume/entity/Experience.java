package com.airesume.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
public class Experience {
    private String company;
    private String role;
    private String dates;
    private String summary;
}
