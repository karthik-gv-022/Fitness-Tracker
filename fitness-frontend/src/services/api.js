import axios from "axios";

const API_URL = "http://localhost:8080/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (credentials) => api.post("/auth/register", credentials);
export const login = (credentials) => api.post("/auth/login", credentials);
export const me = () => api.get("/auth/me");
export const logout = () => api.post("/auth/logout");

export const getWorkouts = () => api.get("/workouts");
export const logWorkout = (workout) => api.post("/workouts", workout);
export const updateWorkout = (id, workout) => api.put(`/workouts/${id}`, workout);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`);

export const getGoal = () => api.get("/goals");
export const setGoal = (weeklyGoal) => api.put("/goals", { weeklyGoal });

export default api;