import http from "./http";

export async function listCompanies() {
  const res = await http.get("/super/companies");
  return res.data;
}

export async function getCompany(id) {
  const res = await http.get(`/super/companies/${id}`);
  return res.data;
}

export async function createCompany(payload) {
  const res = await http.post("/super/companies", payload);
  return res.data;
}

export async function updateCompany(id, payload) {
  const res = await http.patch(`/super/companies/${id}`, payload);
  return res.data;
}


export async function setCustomerBotWebhook(id, publicBaseUrl) {
  const res = await http.post(`/super/companies/${id}/customer-bot/set-webhook`, { publicBaseUrl });
  return res.data;
}
