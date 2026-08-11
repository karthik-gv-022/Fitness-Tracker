import axios from "axios";

const API_URL = "http://localhost:8080/api/users"; // adjust if needed

// Get all users
export const getUsers = () => axios.get(API_URL);

// Create/Register a new user
export const createUser = (userData) => axios.post(API_URL, userData);

// Login user (backend must expose /login endpoint)
export const loginUser = (credentials) =>
  axios.post("http://localhost:8080/api/auth/login", credentials);
