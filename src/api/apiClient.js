// File: src/api/apiClient.js

import axios from "axios";

// The base URL for your new backend server
const API_URL = "http://localhost:5001/api";

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor to add the JWT token to every request if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This object mimics the structure of your backend routes for easy use
export const api = {
  // Auth
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),
  register: (email, password) =>
    apiClient.post("/auth/register", { email, password }),
  me: () => apiClient.get("/auth/me"),

  // Tasks
  getTasks: () => apiClient.get("/tasks"),
  createTask: (taskData) => apiClient.post("/tasks", taskData),

  // Contacts
  getContacts: () => apiClient.get("/contacts"),

  // Team
  getDirectors: () => apiClient.get("/team/directors"),
  getManagers: () => apiClient.get("/team/managers"),
  getAgents: () => apiClient.get("/team/agents"),

  // PowerUps
  getPowerUps: () => apiClient.get("/power-ups"),

  // Content Calendar
  getContentCalendar: () => apiClient.get("/content-calendar"),

  // LLM Orchestrator
  orchestrate: (prompt) => apiClient.post("/tasks", { user_request: prompt }),
};

export default apiClient;
