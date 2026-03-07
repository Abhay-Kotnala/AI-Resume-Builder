package com.airesume.service;

import com.airesume.model.JobResponse;
import com.airesume.model.JobStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BackgroundJobService {

    private final ConcurrentHashMap<String, JobResponse> jobRegistry = new ConcurrentHashMap<>();

    public String submitJob(Callable<?> task) {
        String jobId = UUID.randomUUID().toString();

        JobResponse initialStatus = JobResponse.builder()
                .jobId(jobId)
                .status(JobStatus.QUEUED)
                .build();
        jobRegistry.put(jobId, initialStatus);

        // Execute task asynchronously
        executeTask(jobId, task);

        return jobId;
    }

    @Async
    protected void executeTask(String jobId, Callable<?> task) {
        try {
            // Mark as processing
            JobResponse processingStatus = jobRegistry.get(jobId);
            processingStatus.setStatus(JobStatus.PROCESSING);
            jobRegistry.put(jobId, processingStatus);

            // Execute the heavily blocking task
            Object result = task.call();

            // Mark as completed
            JobResponse completedStatus = jobRegistry.get(jobId);
            completedStatus.setStatus(JobStatus.COMPLETED);
            completedStatus.setResult(result);
            jobRegistry.put(jobId, completedStatus);

        } catch (Exception e) {
            // Mark as failed
            JobResponse failedStatus = jobRegistry.get(jobId);
            failedStatus.setStatus(JobStatus.FAILED);
            failedStatus.setError(e.getMessage() != null ? e.getMessage() : "Unknown execution error");
            jobRegistry.put(jobId, failedStatus);
            e.printStackTrace();
        }
    }

    public JobResponse getJobStatus(String jobId) {
        return jobRegistry.get(jobId);
    }
}
