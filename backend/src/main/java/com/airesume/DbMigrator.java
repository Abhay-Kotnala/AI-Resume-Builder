package com.airesume;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbMigrator {

    private final JdbcTemplate jdbcTemplate;

    public DbMigrator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void migrate() {
        try {
            jdbcTemplate.execute("ALTER TABLE parsed_resume_experiences ALTER COLUMN summary TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE parsed_resume_experiences ALTER COLUMN role TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE parsed_resume_experiences ALTER COLUMN company TYPE TEXT");

            jdbcTemplate.execute("ALTER TABLE parsed_resume_educations ALTER COLUMN details TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE parsed_resume_educations ALTER COLUMN institution TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE parsed_resume_educations ALTER COLUMN degree TYPE TEXT");
            System.out.println("====== DB MIGRATION: WIDENED COLUMNS TO TEXT ======");
        } catch (Exception e) {
            System.out.println("====== DB MIGRATION FAILED/ALREADY DONE: " + e.getMessage() + " ======");
        }
    }
}
