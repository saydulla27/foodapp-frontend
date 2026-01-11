import { NavLink } from "react-router-dom";

const base =
  "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition";
const normal = "text-slate-700 hover:bg-slate-100";
const active = "bg-slate-900 text-white";

export default function SideNav() {
  return (
    <aside className="w-64 shrink-0">
      <div className="rounded-3xl border bg-white p-4 shadow-sm">
        <div className="mb-5">
          <div className="text-xs font-semibold tracking-wide text-slate-500">FOODAPP</div>
          <div className="text-lg font-semibold text-slate-900">SuperAdmin</div>
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/superadmin/companies"
            className={({ isActive }) => `${base} ${isActive ? active : normal}`}
          >
            Companies
          </NavLink>

          <NavLink
            to="/superadmin/billing"
            className={({ isActive }) => `${base} ${isActive ? active : normal}`}
          >
            Billing
          </NavLink>

          <NavLink
            to="/superadmin/reports"
            className={({ isActive }) => `${base} ${isActive ? active : normal}`}
          >
            Reports
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}
