import http from "./httpAdmin";
import { setAdminToken } from "../auth/adminToken";

export async function adminLogin(phone, password) {
  const res = await http.post("/admin/auth/login", {
    phone: String(phone || "").trim(),
    password,
  });
  const token = res.data?.token;
  if (token) setAdminToken(token);
  return res.data;
}
