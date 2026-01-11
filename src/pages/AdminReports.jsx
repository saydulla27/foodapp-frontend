import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import { listOrders } from "../api/adminOrders";

function toDate(v) {
  if (!v) return null;
  try {
    return typeof v === "number" ? new Date(v) : new Date(String(v));
  } catch {
    return null;
  }
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export default function AdminReports() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [range, setRange] = useState("last7");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setToast({ type: "info", text: "" });
      try {
        const data = await listOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || "Orders yuklashda xato";
        setToast({ type: "error", text: msg });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (range === "all") return orders;
    const now = new Date();
    let from = null;
    if (range === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === "last7") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === "last30") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return orders.filter((o) => {
      const d = toDate(o.createdAt);
      return d && from ? d >= from : true;
    });
  }, [orders, range]);

  const stats = useMemo(() => {
    const totalCount = filtered.length;
    const totalAmount = sum(filtered.map((o) => Number(o.totalAmount || 0)));
    const avg = totalCount ? Math.round(totalAmount / totalCount) : 0;

    const byStatus = {};
    for (const o of filtered) {
      const s = String(o.status || "UNKNOWN");
      byStatus[s] = (byStatus[s] || 0) + 1;
    }

    return { totalCount, totalAmount, avg, byStatus };
  }, [filtered]);

  const statusRows = useMemo(() => {
    const entries = Object.entries(stats.byStatus);
    entries.sort((a, b) => b[1] - a[1]);
    return entries;
  }, [stats.byStatus]);

  return (
    <AdminLayout
      title="Reports"
      subtitle="Orders bo‘yicha hisobot (backendga mos aggregatsiya)"
      actions={
        <select
          className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      }
    >
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      {loading ? (
        <div className="text-sm text-slate-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">Orders</div>
              <div className="mt-1 text-2xl font-semibold">{stats.totalCount}</div>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">Total amount</div>
              <div className="mt-1 text-2xl font-semibold">{stats.totalAmount}</div>
            </div>
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-500">Avg чек</div>
              <div className="mt-1 text-2xl font-semibold">{stats.avg}</div>
            </div>
          </div>

          <div className="rounded-2xl border">
            <div className="border-b bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Status breakdown
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {statusRows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={2}>
                        No data
                      </td>
                    </tr>
                  ) : (
                    statusRows.map(([s, c]) => (
                      <tr key={s} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-medium">{s}</td>
                        <td className="px-4 py-3">{c}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Hisobot backend endpointlarsiz ham ishlaydi: <span className="font-mono">GET /api/admin/orders</span> dan kelgan ma’lumot asosida frontend aggregatsiya qiladi.
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
