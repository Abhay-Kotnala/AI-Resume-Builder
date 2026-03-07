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

    @ElementCollection
    @jakarta.persistence.CollectionTable(name = "parsed_resume_custom_sections", joinColumns = @JoinColumn(name = "parsed_resume_id"))
    @jakarta.persistence.MapKeyColumn(name = "section_name")
    @Column(columnDefinition = "TEXT", name = "section_content")
    private Map<String, String> customSections = new java.util.HashMap<>();
}
