import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import { listFeedback } from "../api/adminFeedback";

function fmt(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "info", text: "" });

  async function load() {
    setLoading(true);
    try {
      const data = await listFeedback();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Feedback yuklashda xato" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminLayout
      title="Notifications / Feedback"
      subtitle="Botdan kelgan mijoz izohlari (kim, nima, vaqt)."
      actions={
        <button
          onClick={load}
          disabled={loading}
          className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Refresh
        </button>
      }
    >
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="rounded-3xl border bg-white p-4 shadow-sm">
        {loading && <div className="text-sm text-slate-500">Loading...</div>}

        {!loading && items.length === 0 && (
          <div className="text-sm text-slate-500">Hozircha izohlar yo‘q.</div>
        )}

        <div className="space-y-3">
          {items.map((x) => {
            const who =
              (x.firstName || x.lastName
                ? `${x.firstName || ""} ${x.lastName || ""}`.trim()
                : "") ||
              (x.username ? `@${x.username}` : "") ||
              (x.customerTelegramId ? `tg:${x.customerTelegramId}` : "Unknown");
            return (
              <div key={x.id} className="rounded-2xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">{who}</div>
                  <div className="text-xs text-slate-500">{fmt(x.createdAt)}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{x.messageText}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
