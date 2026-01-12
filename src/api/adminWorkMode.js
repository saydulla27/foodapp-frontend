import httpAdmin from "./httpAdmin";

// NOTE: httpAdmin.baseURL is already set to VITE_API_BASE ("/api" in local dev)
// so endpoint paths below must NOT start with "/api".

export async function getWorkMode() {
  const { data } = await httpAdmin.get("/api/admin/work-mode");
  return data;
}

export async function openShop() {
  const { data } = await httpAdmin.post("/api/admin/work-mode/open");
  return data;
}

export async function closeShop() {
  const { data } = await httpAdmin.post("/api/admin/work-mode/close");
  return data;
}

export async function setWorkHours(start, end) {
  const { data } = await httpAdmin.put("/api/admin/work-mode/hours", {
    start: start || null,
    end: end || null,
  });
  return data;
}
