import { useNavigate } from "react-router-dom";
import { clearToken } from "../auth/token";

export default function Topbar() {
  const nav = useNavigate();

  function logout() {
    clearToken();
    nav("/superadmin/login");
  }

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">Admin Panel</div>
        <div className="text-2xl font-semibold text-slate-900">Control Center</div>
      </div>

      <button
        onClick={logout}
        className="rounded-2xl border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        type="button"
      >
        Logout
      </button>
    </header>
  );
}
