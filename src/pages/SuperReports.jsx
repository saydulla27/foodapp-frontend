import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { listCompanies } from "../api/companies";
import { getCompanyBilling } from "../api/superBilling";

function fmtDate(v) {
  if (!v) return "-";
  try {
    const d = typeof v === "number" ? new Date(v) : new Date(String(v));
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

function pill(ok) {
  return ok
    ? "inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
    : "inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600";
}

export default function SuperReports() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  async function load() {
    setLoading(true);
    setToast({ type: "info", text: "" });
    try {
      const companies = await listCompanies();
      const list = Array.isArray(companies) ? companies : (companies?.items || []);
      const bills = await Promise.all(
        list.map(async (c) => {
          try {
            const b = await getCompanyBilling(c.id);
            return { company: c, billing: b };
          } catch (e) {
            return { company: c, billing: { error: true, accessAllowed: false, accessReason: "BILLING_FETCH_ERROR" } };
          }
        })
      );
      setRows(bills);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Reports load xato";
      setToast({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((r) => r.company?.active).length;
    const allowed = rows.filter((r) => r.billing?.accessAllowed).length;
    const basic = rows.filter((r) => r.billing?.planCode === "BASIC").length;
    const pro = rows.filter((r) => r.billing?.planCode === "PRO").length;
    return { total, active, allowed, basic, pro };
  }, [rows]);

  return (
    <Layout
      title="Reports"
      subtitle="Company status + billing access summary (SuperAdmin)."
      actions={
        <button
          onClick={load}
          className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          type="button"
        >
          Refresh
        </button>
      }
    >
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Companies</div>
          <div className="mt-1 text-2xl font-semibold">{summary.total}</div>
        </div>
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-semibold">{summary.active}</div>
        </div>
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">Access Allowed</div>
          <div className="mt-1 text-2xl font-semibold">{summary.allowed}</div>
        </div>
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">BASIC</div>
          <div className="mt-1 text-2xl font-semibold">{summary.basic}</div>
        </div>
        <div className="rounded-2xl border bg-slate-50 p-4">
          <div className="text-xs text-slate-500">PRO</div>
          <div className="mt-1 text-2xl font-semibold">{summary.pro}</div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Access</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Paid Until</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-4 text-slate-500" colSpan={5}>Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-4 text-slate-500" colSpan={5}>No data</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.company.id} className="border-b last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{r.company.name}</td>
                  <td className="px-4 py-3">{r.billing.planCode || r.company.planCode || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={pill(Boolean(r.billing.accessAllowed))}>
                      {r.billing.accessAllowed ? "ALLOWED" : "BLOCKED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.billing.accessReason || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(r.billing.paidUntil || r.company.paidUntil)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
