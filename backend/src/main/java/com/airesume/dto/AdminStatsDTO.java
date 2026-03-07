package com.airesume.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private long totalProUsers;
    private long totalResumesGenerated;
    private long totalAiActions;

    // Time-series data for Recharts
    private List<Map<String, Object>> signupsData;
}
