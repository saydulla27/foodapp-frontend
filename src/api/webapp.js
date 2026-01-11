import axios from "axios";

const httpPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 20000,
});

function tgInitData() {
  return window?.Telegram?.WebApp?.initData || "";
}

export async function getWebAppCompany(companyId) {
  const res = await httpPublic.get(`/webapp/company/${companyId}`);
  return res.data;
}

export async function getWebAppMenu(companyId) {
  const res = await httpPublic.get(`/webapp/menu`, { params: { companyId } });
  return res.data;
}

export async function createWebAppOrder(payload) {
  const initData = tgInitData();
  const res = await httpPublic.post(`/webapp/order`, payload, {
    headers: initData ? { "X-TG-INIT-DATA": initData } : {},
  });
  return res.data;
}

export function getTgUser() {
  return window?.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

export function tgReady() {
  try {
    window?.Telegram?.WebApp?.ready?.();
  } catch {}
}

export function tgExpand() {
  try {
    window?.Telegram?.WebApp?.expand?.();
  } catch {}
}
