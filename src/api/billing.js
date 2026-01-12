import http from "./http";

export async function clickCreateInvoice(payload) {
  const res = await http.post("/super/billing/click/create", payload);
  return res.data;
}

export async function markPaid(payload) {
  const res = await http.post("/super/billing/mark-paid", payload);
  return res.data;
}

export async function billingHistory(companyId) {
  const res = await http.get("/super/billing/history", {
    params: { companyId },
  });
  return res.data;
}
