package com.airesume.entity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
public class ParsedResume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "resume_id")
    private Resume resume;

    private String fullName;
    private String email;
    private String phone;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ElementCollection
    @Column(columnDefinition = "TEXT")
    private List<String> skills;

    @ElementCollection
    private List<Experience> experiences;

    @ElementCollection
    private List<Education> educations;
}
