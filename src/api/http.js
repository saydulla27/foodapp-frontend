import axios from "axios";
import { getToken, clearToken } from "../auth/token";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

export default http;
