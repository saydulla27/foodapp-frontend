import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { listCompanies } from "../api/companies";

export default function CompaniesList() {
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setToast({ type: "info", text: "" });
    try {
      const data = await listCompanies();
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Companies yuklashda xato";
      setToast({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout
      title="Companies"
      subtitle="Company create/edit, bot tokenlar, webhook secret."
      actions={
        <>
          <button
            onClick={load}
            className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Refresh
          </button>

          <Link
            to="/superadmin/companies/new"
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Add company
          </Link>
        </>
      }
    >
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Discount</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan="6">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan="6">
                  Hali company yo‘q.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-slate-700">{c.phone || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{c.plan || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{c.discount ?? c.discountAmount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        c.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/superadmin/companies/${c.id}/edit`}
                      className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
