package com.airesume.repository;

import com.airesume.entity.ParsedResume;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParsedResumeRepository extends JpaRepository<ParsedResume, Long> {
}
