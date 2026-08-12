package com.example.fitness_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class GoalRequest {
    @NotNull(message = "Weekly goal is required")
    @Min(value = 0, message = "Weekly goal cannot be negative")
    private Integer weeklyGoal;

    public GoalRequest() {
    }

    public GoalRequest(Integer weeklyGoal) {
        this.weeklyGoal = weeklyGoal;
    }

    public Integer getWeeklyGoal() {
        return weeklyGoal;
    }

    public void setWeeklyGoal(Integer weeklyGoal) {
        this.weeklyGoal = weeklyGoal;
    }
}
