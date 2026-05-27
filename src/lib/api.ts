import axios from "axios";

const BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://localhost:5000";
const LS_TOKEN = "ss_token";
const LS_USER = "ss_user";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(LS_TOKEN);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
