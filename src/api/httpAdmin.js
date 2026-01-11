import axios from "axios";
import { getAdminToken, clearAdminToken } from "../auth/adminToken";

const httpAdmin = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 20000,
});

httpAdmin.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpAdmin.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearAdminToken();
    }
    return Promise.reject(err);
  }
);

export default httpAdmin;
