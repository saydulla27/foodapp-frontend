import http from "./httpAdmin";

export async function listCategories() {
  const res = await http.get("/admin/categories");
  return res.data;
}

export async function createCategory(payload) {
  const res = await http.post("/admin/categories", payload);
  return res.data;
}

export async function updateCategory(id, payload) {
  const res = await http.patch(`/admin/categories/${id}`, payload);
  return res.data;
}
