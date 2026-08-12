package com.example.fitness_backend.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fitness_backend.dto.GoalRequest;
import com.example.fitness_backend.entity.Goal;
import com.example.fitness_backend.entity.User;
import com.example.fitness_backend.repository.GoalRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goals")
public class GoalsController {

    private static final int DEFAULT_GOAL = 2500;

    private final GoalRepository goalRepository;

    public GoalsController(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    @GetMapping
    public ResponseEntity<?> getGoal(HttpServletRequest request) {
        User user = currentUser(request);
        Goal goal = goalRepository.findByUser(user).orElse(null);
        int value = goal == null ? DEFAULT_GOAL : goal.getWeeklyGoal();
        return ResponseEntity.ok().body(java.util.Map.of("weeklyGoal", value));
    }

    @PutMapping
    public ResponseEntity<?> setGoal(@Valid @RequestBody GoalRequest body, HttpServletRequest request) {
        User user = currentUser(request);
        Goal goal = goalRepository.findByUser(user).orElse(null);
        if (goal == null) {
            goal = new Goal(user, body.getWeeklyGoal());
        } else {
            goal.setWeeklyGoal(body.getWeeklyGoal());
        }
        try {
            goalRepository.save(goal);
        } catch (DataIntegrityViolationException e) {
            goal = goalRepository.findByUser(user).orElseThrow();
            goal.setWeeklyGoal(body.getWeeklyGoal());
            goalRepository.save(goal);
        }
        return ResponseEntity.ok().body(java.util.Map.of("weeklyGoal", goal.getWeeklyGoal()));
    }

    private User currentUser(HttpServletRequest request) {
        return (User) request.getAttribute("currentUser");
    }
}
