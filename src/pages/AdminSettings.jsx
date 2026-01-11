import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import { closeShop, getWorkMode, openShop, setWorkHours } from "../api/adminWorkMode";

export default function AdminSettings() {
  const [mode, setMode] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  async function reload() {
    const m = await getWorkMode();
    setMode(m);
    setStart(m?.workStart || "");
    setEnd(m?.workEnd || "");
  }

  useEffect(() => {
    reload().catch((e) => {
      setToast({ type: "error", message: e?.response?.data?.error || e?.message || "Load failed" });
    });
  }, []);

  async function handleOpen() {
    try {
      setLoading(true);
      const m = await openShop();
      setMode(m);
      setToast({ type: "success", message: "✅ Shop opened" });
    } catch (e) {
      setToast({ type: "error", message: e?.response?.data?.error || e?.message || "Open failed" });
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    try {
      setLoading(true);
      const m = await closeShop();
      setMode(m);
      setToast({ type: "success", message: "⛔️ Shop closed (and stock reset)" });
    } catch (e) {
      setToast({ type: "error", message: e?.response?.data?.error || e?.message || "Close failed" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveHours() {
    try {
      setLoading(true);
      const m = await setWorkHours(start || null, end || null);
      setMode(m);
      setToast({ type: "success", message: "✅ Work hours saved" });
    } catch (e) {
      setToast({ type: "error", message: e?.response?.data?.error || e?.message || "Save failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
              <p className="mt-1 text-sm text-slate-600">
                Do‘konni ochish/yopish va ish vaqtlarini sozlang.
              </p>
            </div>
            <div className="text-sm">
              <span className="mr-2 text-slate-500">Status:</span>
              <span className={mode?.open ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                {mode?.open ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={loading}
              onClick={handleOpen}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              Open
            </button>
            <button
              disabled={loading}
              onClick={handleClose}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
            >
              Close & Reset Stock
            </button>
            <button
              disabled={loading}
              onClick={() => reload()}
              className="rounded-2xl border px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Work Hours</h2>
          <p className="mt-1 text-sm text-slate-600">
            Agar vaqt qo‘ymasangiz (bo‘sh qoldirsangiz), do‘kon vaqt bo‘yicha cheklanmaydi.
          </p>

          <div className="mt-4 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Open from</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Close at</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-2xl border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={loading}
              onClick={handleSaveHours}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
            >
              Save hours
            </button>
            <button
              disabled={loading}
              onClick={() => {
                setStart("");
                setEnd("");
              }}
              className="rounded-2xl border px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
