import http from "./httpAdmin";

export async function listCouriers() {
  const res = await http.get("/admin/couriers");
  return res.data;
}

export async function upsertCourier(payload) {
  const res = await http.post("/admin/couriers", payload);
  return res.data;
}

export async function setCourierActive(id, active) {
  const res = await http.post(`/admin/couriers/${id}/active`, null, { params: { active } });
  return res.data;
}

export async function deleteCourier(id) {
  const res = await http.delete(`/admin/couriers/${id}`);
  return res.data;
}
