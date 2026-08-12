package com.example.fitness_backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void workout_requiresToken() throws Exception {
        mockMvc.perform(get("/api/workouts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void workout_invalidToken_returns401() throws Exception {
        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", "Bearer garbage-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logWorkout_appearsInList() throws Exception {
        String token = register("hugh");

        postWorkout(token, "Running", "2026-08-12", 30, 300, "moderate")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Running"))
                .andExpect(jsonPath("$.id").isNumber());

        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Running"));
    }

    @Test
    void logWorkout_negativeDuration_returns400() throws Exception {
        String token = register("inez");

        postWorkout(token, "Bad", "2026-08-12", -5, 100, "low")
                .andExpect(status().isBadRequest());
    }

    @Test
    void logWorkout_missingTitle_returns400() throws Exception {
        String token = register("jack");

        String body = """
                {"date":"2026-08-12","duration":30,"calories":100,"intensity":"low","notes":""}
                """;

        mockMvc.perform(post("/api/workouts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteWorkout_removesOwnWorkout() throws Exception {
        String token = register("kim");
        long id = workoutId(postWorkout(token, "Yoga", "2026-08-12", 45, 150, "low"));

        mockMvc.perform(delete("/api/workouts/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void updateWorkout_editsOwnWorkout() throws Exception {
        String token = register("leo");
        long id = workoutId(postWorkout(token, "Swim", "2026-08-12", 30, 200, "moderate"));

        String body = """
                {"title":"Swim Sprint","date":"2026-08-12","duration":40,"calories":280,"intensity":"high","notes":"faster"}
                """;

        mockMvc.perform(put("/api/workouts/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Swim Sprint"))
                .andExpect(jsonPath("$.duration").value(40));
    }

    @Test
    void deleteMissingWorkout_returns404() throws Exception {
        String token = register("max");

        mockMvc.perform(delete("/api/workouts/999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void crossUserAccess_returns403Or404() throws Exception {
        String tokenA = register("nala");
        String tokenB = register("omar");
        long id = workoutId(postWorkout(tokenA, "Run", "2026-08-12", 30, 300, "high"));

        // B cannot edit or delete A's workout
        String body = """
                {"title":"Stolen","date":"2026-08-12","duration":10,"calories":10,"intensity":"low","notes":""}
                """;
        mockMvc.perform(put("/api/workouts/" + id)
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/workouts/" + id)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden());

        // A's list still shows the workout
        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Run"));
    }

    @Test
    void workoutResponse_neverContainsPassword() throws Exception {
        String token = register("penny");
        postWorkout(token, "Run", "2026-08-12", 30, 300, "high");

        String response = mockMvc.perform(get("/api/workouts")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(response).doesNotContain("password");
    }

    @Test
    void workoutResponse_neverContainsUserObject() throws Exception {
        String token = register("quincy");
        postWorkout(token, "Run", "2026-08-12", 30, 300, "high");

        mockMvc.perform(get("/api/workouts")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].user").doesNotExist());
    }

    private org.springframework.test.web.servlet.ResultActions postWorkout(String token, String title,
            String date, int duration, int calories, String intensity) throws Exception {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "title", title, "date", date, "duration", duration,
                "calories", calories, "intensity", intensity, "notes", ""));

        return mockMvc.perform(post("/api/workouts")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private long workoutId(org.springframework.test.web.servlet.ResultActions result) throws Exception {
        String response = result.andReturn().getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(response);
        return node.get("id").asLong();
    }

    private String register(String username) throws Exception {
        String body = objectMapper.writeValueAsString(
                java.util.Map.of("username", username, "password", "secret123"));

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }
}