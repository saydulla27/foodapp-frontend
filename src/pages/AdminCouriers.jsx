import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import {
  listCouriers,
  upsertCourier,
  setCourierActive,
  deleteCourier,
} from "../api/adminCouriers";

const empty = { phone: "", name: "", active: true };

export default function AdminCouriers() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [model, setModel] = useState(empty);

  async function load() {
    setLoading(true);
    setToast({ type: "info", text: "" });
    try {
      const data = await listCouriers();
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Couriers load xato",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    try {
      await upsertCourier({
        phone: String(model.phone || "").trim(),
        name: String(model.name || "").trim(),
        active: Boolean(model.active),
      });
      setToast({ type: "success", text: "Saved" });
      setModel(empty);
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Save xato",
      });
    }
  }

  async function toggle(c) {
    try {
      await setCourierActive(c.id, !c.active);
      setToast({ type: "success", text: "Updated" });
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Update xato",
      });
    }
  }

  async function del(c) {
    if (!confirm(`Delete courier ${c.phone}?`)) return;
    try {
      await deleteCourier(c.id);
      setToast({ type: "success", text: "Deleted" });
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Delete xato",
      });
    }
  }

  return (
    <AdminLayout
      title="Couriers"
      subtitle="Courier management (whitelist), active toggle, delete."
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="text-lg font-semibold">Add / Update courier</div>
          <div className="mt-1 text-sm text-slate-500">
            Phone bo‘yicha upsert (bor bo‘lsa update, yo‘q bo‘lsa create).
          </div>

          <form onSubmit={save} className="mt-4 space-y-4">
            <FormField label="Phone">
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={model.phone}
                onChange={(e) => setModel((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+998..."
                required
              />
            </FormField>

            <FormField label="Name">
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={model.name}
                onChange={(e) => setModel((p) => ({ ...p, name: e.target.value }))}
                placeholder="Courier name"
              />
            </FormField>

            <FormField label="Active">
              <select
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={String(model.active)}
                onChange={(e) => setModel((p) => ({ ...p, active: e.target.value === "true" }))}
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </FormField>

            <button
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              type="submit"
            >
              Save
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan="4">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan="4">
                    Courier yo‘q.
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{c.phone}</td>
                    <td className="px-4 py-3">{c.name || "-"}</td>
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
                      <div className="flex gap-2">
                        <button
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          type="button"
                          onClick={() =>
                            setModel({
                              phone: c.phone || "",
                              name: c.name || "",
                              active: Boolean(c.active),
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          type="button"
                          onClick={() => toggle(c)}
                        >
                          Toggle
                        </button>
                        <button
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                          type="button"
                          onClick={() => del(c)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
