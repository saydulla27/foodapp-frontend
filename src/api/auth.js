import http from "./http";

export async function superadminLogin(username, password) {
  const res = await http.post("/api/super/auth/login", {
    login: username,      // MUHIM: login bo‘lishi shart
    password: password,
  });
  return res.data; // { token }
}
