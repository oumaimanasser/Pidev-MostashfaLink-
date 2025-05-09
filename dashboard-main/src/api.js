// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3002/api", // ✅ Bon port : là où ton backend tourne
});

export default api;