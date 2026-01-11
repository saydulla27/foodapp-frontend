import http from "./httpAdmin";

export async function listProducts(categoryId) {
  const res = await http.get("/admin/products", { params: categoryId ? { categoryId } : {} });
  return res.data;
}

export async function createProduct(payload) {
  const res = await http.post("/admin/products", payload);
  return res.data;
}

export async function updateProduct(id, payload) {
  const res = await http.patch(`/admin/products/${id}`, payload);
  return res.data;
}

export async function setProductStock(id, stockQty) {
  const res = await http.patch(`/admin/products/${id}/stock`, { stockQty });
  return res.data;
}
