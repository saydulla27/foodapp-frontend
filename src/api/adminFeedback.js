import http from "./httpAdmin";

export async function listFeedback() {
  const res = await http.get("/admin/feedback");
  return res.data;
}
