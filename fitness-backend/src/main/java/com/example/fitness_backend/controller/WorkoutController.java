package com.example.fitness_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.fitness_backend.entity.User;
import com.example.fitness_backend.entity.Workout;
import com.example.fitness_backend.repository.WorkoutRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutRepository workoutRepository;

    public WorkoutController(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    @GetMapping
    public List<Workout> getWorkouts(HttpServletRequest request) {
        User user = currentUser(request);
        return workoutRepository.findByUser(user);
    }

    @PostMapping
    public ResponseEntity<?> logWorkout(@Valid @RequestBody Workout workout, HttpServletRequest request) {
        User user = currentUser(request);
        workout.setId(null);
        workout.setUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutRepository.save(workout));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkout(@PathVariable Long id, @Valid @RequestBody Workout updates,
                                           HttpServletRequest request) {
        User user = currentUser(request);
        Workout existing = workoutRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Workout not found");
        }
        if (!existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only edit your own workouts");
        }

        updates.setId(id);
        updates.setUser(existing.getUser());
        return ResponseEntity.ok(workoutRepository.save(updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkout(@PathVariable Long id, HttpServletRequest request) {
        User user = currentUser(request);
        Workout existing = workoutRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Workout not found");
        }
        if (!existing.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own workouts");
        }

        workoutRepository.delete(existing);
        return ResponseEntity.ok("Workout deleted");
    }

    private User currentUser(HttpServletRequest request) {
        return (User) request.getAttribute("currentUser");
    }
}
