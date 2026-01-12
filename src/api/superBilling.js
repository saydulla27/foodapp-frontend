import http from "./http";

export async function getCompanyBilling(companyId) {
  const res = await http.get(`/super/billing/company/${companyId}`);
  return res.data;
}
