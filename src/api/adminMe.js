import http from "./httpAdmin";

export async function getAdminMe() {
  const res = await http.get("/admin/me");
  return res.data;
}
