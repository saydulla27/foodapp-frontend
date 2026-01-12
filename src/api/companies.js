import http from "./http";

export async function listCompanies() {
  const res = await http.get("/api/super/companies");
  return res.data;
}

export async function getCompany(id) {
  const res = await http.get(`/api/super/companies/${id}`);
  return res.data;
}

export async function createCompany(payload) {
  const res = await http.post("/api/super/companies", payload);
  return res.data;
}

export async function updateCompany(id, payload) {
  const res = await http.patch(`/api/super/companies/${id}`, payload);
  return res.data;
}


export async function setCustomerBotWebhook(id) {
  const res = await http.post(`/api/super/companies/${id}/customer-bot/set-webhook`);
  return res.data;
}
