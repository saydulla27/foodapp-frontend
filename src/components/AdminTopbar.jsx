import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAdminToken } from "../auth/adminToken";
import { getAdminMe } from "../api/adminMe";

export default function AdminTopbar() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminMe();
        setMe(data);
      } catch {
        // ignore
      }
    })();
  }, []);

  function logout() {
    clearAdminToken();
    nav("/admin/login");
  }

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm text-slate-500">Admin Panel</div>
        <div className="text-2xl font-semibold text-slate-900">Company</div>
        {me ? (
          <div className="mt-1 text-xs text-slate-500 font-mono">
            companyId: {me.companyId ?? "-"} • role: {me.role ?? "-"}
          </div>
        ) : null}
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
