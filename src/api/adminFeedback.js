import http from "./httpAdmin";

export async function listFeedback() {
  const res = await http.get("/api/admin/feedback");
  return res.data;
}
