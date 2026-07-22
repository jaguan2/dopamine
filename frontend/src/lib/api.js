import axios from "axios";

// Vite dev server proxies /api to the Flask backend (see vite.config.js).
// In production, serve the built frontend behind the same origin as Flask.
const api = axios.create({ baseURL: "/api" });

export default api;
