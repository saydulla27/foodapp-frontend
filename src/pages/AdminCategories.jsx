import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { createCategory, listCategories, updateCategory } from "../api/adminCategories";

export default function AdminCategories() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  async function load() {
    setLoading(true);
    setToast({ type: "info", text: "" });
    try {
      const data = await listCategories();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Categories yuklashda xato";
      setToast({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    setToast({ type: "info", text: "" });
    try {
      if (!name.trim()) throw new Error("Name majburiy");
      await createCategory({ name: name.trim(), sortOrder: Number(sortOrder || 0) });
      setName("");
      setSortOrder(0);
      await load();
      setToast({ type: "success", text: "Category qo‘shildi" });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Create xato";
      setToast({ type: "error", text: msg });
    }
  }

  async function toggleActive(c) {
    try {
      await updateCategory(c.id, { active: !c.active });
      await load();
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Update xato" });
    }
  }

  async function rename(c) {
    const next = prompt("New name", c.name);
    if (next == null) return;
    try {
      await updateCategory(c.id, { name: next.trim() });
      await load();
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Update xato" });
    }
  }

  async function changeSort(c) {
    const next = prompt("Sort order", String(c.sortOrder ?? 0));
    if (next == null) return;
    const v = Number(next);
    if (Number.isNaN(v)) return;
    try {
      await updateCategory(c.id, { sortOrder: v });
      await load();
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Update xato" });
    }
  }

  return (
    <AdminLayout
      title="Categories"
      subtitle="Products uchun category boshqaruvi."
      actions={
        <button
          className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={load}
          type="button"
        >
          Refresh
        </button>
      }
    >
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="grid gap-4 rounded-3xl border bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField label="Name">
            <input
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Fast Food"
            />
          </FormField>

          <FormField label="Sort order">
            <input
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </FormField>

          <div className="flex items-end">
            <button
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={add}
              type="button"
            >
              Add category
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-white text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Sort</th>
              <th className="px-4 py-3 font-semibold">Active</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
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
                  Hali category yo‘q.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.sortOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.active
                          ? "inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                          : "inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                      }
                    >
                      {c.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => rename(c)}
                        type="button"
                      >
                        Rename
                      </button>
                      <button
                        className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => changeSort(c)}
                        type="button"
                      >
                        Sort
                      </button>
                      <button
                        className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => toggleActive(c)}
                        type="button"
                      >
                        Toggle
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
