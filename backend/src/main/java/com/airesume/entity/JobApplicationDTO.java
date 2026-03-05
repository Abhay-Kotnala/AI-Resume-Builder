package com.airesume.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobApplicationDTO {
    private Long id;
    private String companyName;
    private String jobTitle;
    private String jobUrl;
    private String status;
    private String salaryRange;
    private String notes;
    private LocalDateTime appliedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
