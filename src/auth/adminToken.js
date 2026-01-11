const KEY = "foodapp_admin_token";

export function getAdminToken() {
  return localStorage.getItem(KEY) || "";
}

export function setAdminToken(token) {
  localStorage.setItem(KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
}
