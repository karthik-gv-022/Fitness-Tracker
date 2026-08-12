package com.example.fitness_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.fitness_backend.entity.Goal;
import com.example.fitness_backend.entity.User;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    Optional<Goal> findByUser(User user);
}
