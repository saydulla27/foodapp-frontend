import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import {
  listOrders,
  listOrdersByStatus,
  getOrder,
  assignCourier,
  setOrderStatus,
} from "../api/adminOrders";

const STATUSES = ["NEW", "ASSIGNED", "ON_THE_WAY", "DELIVERED"];

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return "";
}

export default function AdminOrders() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [items, setItems] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [courierPhone, setCourierPhone] = useState("");

  async function load() {
    setLoading(true);
    setToast({ type: "info", text: "" });
    try {
      const data =
        status === "ALL" ? await listOrders() : await listOrdersByStatus(status);
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Orders yuklashda xato",
      });
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id) {
    setSelectedId(id);
    setDetail(null);
    setCourierPhone("");
    try {
      const d = await getOrder(id);
      setDetail(d);
      setCourierPhone(String(pick(d, ["courierPhone", "courier_phone", "courier"])) || "");
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Order detail xato",
      });
    }
  }

  async function doAssign() {
    if (!selectedId) return;
    try {
      await assignCourier(selectedId, courierPhone);
      setToast({ type: "success", text: "Courier assign qilindi" });
      await openDetail(selectedId);
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Assign xato",
      });
    }
  }

  async function doSetStatus(newStatus) {
    if (!selectedId) return;
    try {
      await setOrderStatus(selectedId, newStatus);
      setToast({ type: "success", text: `Status: ${newStatus}` });
      await openDetail(selectedId);
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Status update xato",
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const rows = useMemo(() => items.map((o) => {
    const id = pick(o, ["id", "orderId"]);
    const st = pick(o, ["status"]);
    const phone = pick(o, ["customerPhone", "phone", "customer_phone"]);
    const total = pick(o, ["total", "totalPrice", "amount"]);
    const created = pick(o, ["createdAt", "created_at", "time"]);
    return { raw: o, id, st, phone, total, created };
  }), [items]);

  return (
    <AdminLayout
      title="Orders"
      subtitle="Buyurtmalar ro'yxati, assign va status."
      actions={
        <div className="flex gap-2">
          <select
            className="rounded-2xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">ALL</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Refresh
          </button>
        </div>
      }
    >
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan="4">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan="4">
                    Hozircha order yo'q.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b last:border-b-0 cursor-pointer hover:bg-slate-50 ${
                      String(r.id) === String(selectedId) ? "bg-slate-50" : ""
                    }`}
                    onClick={() => openDetail(r.id)}
                  >
                    <td className="px-4 py-3 font-medium">{r.id}</td>
                    <td className="px-4 py-3">{r.st}</td>
                    <td className="px-4 py-3">{r.phone}</td>
                    <td className="px-4 py-3">{r.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border p-4">
          {!selectedId ? (
            <div className="text-sm text-slate-500">Chapdan order tanlang.</div>
          ) : !detail ? (
            <div className="text-sm text-slate-500">Loading detail...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Order #{pick(detail, ["id", "orderId"])}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Status: <span className="font-mono">{pick(detail, ["status"])}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedId(null); setDetail(null); }}
                  className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                  <div className="text-xs font-semibold text-slate-500">Customer</div>
                  <div className="mt-1 font-medium">
                    {pick(detail, ["customerPhone", "phone"])}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                  <div className="text-xs font-semibold text-slate-500">Total</div>
                  <div className="mt-1 font-medium">
                    {pick(detail, ["total", "totalPrice", "amount"])}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <FormField label="Assign courier (phone)">
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                      value={courierPhone}
                      onChange={(e) => setCourierPhone(e.target.value)}
                      placeholder="+998..."
                    />
                    <button
                      onClick={doAssign}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      type="button"
                    >
                      Assign
                    </button>
                  </div>
                </FormField>

                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => doSetStatus(s)}
                      className="rounded-2xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      type="button"
                    >
                      Set {s}
                    </button>
                  ))}
                </div>
              </div>

              <details className="rounded-2xl border bg-white p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Raw JSON
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-slate-700">
{JSON.stringify(detail, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
