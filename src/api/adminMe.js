import http from "./httpAdmin";

export async function getAdminMe() {
  const res = await http.get("/api/admin/me");
  return res.data;
}
