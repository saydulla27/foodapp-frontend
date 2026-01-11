import http from "./httpAdmin";

export async function listOrders() {
  const res = await http.get("/admin/orders");
  return res.data;
}

export async function getOrder(id) {
  const res = await http.get(`/admin/orders/${id}`);
  return res.data;
}

export async function listOrdersByStatus(status) {
  const res = await http.get("/admin/orders/by-status", { params: { status } });
  return res.data;
}

export async function setOrderStatus(id, status) {
  const res = await http.post(`/admin/orders/${id}/status`, null, { params: { status } });
  return res.data;
}

export async function assignCourier(id, phone) {
  const res = await http.post(`/admin/orders/${id}/assign`, { phone });
  return res.data;
}
