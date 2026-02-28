package com.airesume.repository;

import com.airesume.entity.Resume;
import com.airesume.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findAllByUserOrderByUploadDateDesc(User user);

    long countByUser(User user);
}
