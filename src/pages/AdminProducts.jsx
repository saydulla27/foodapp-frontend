import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { listCategories, createCategory } from "../api/adminCategories";
import {
  listProducts,
  createProduct,
  updateProduct,
  setProductStock,
} from "../api/adminProducts";

const emptyProduct = {
  id: null,
  categoryId: "",
  name: "",
  description: "",
  price: "",
  photoUrl: "",
  stockQty: "",
  active: true,
};

function toNum(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function AdminProducts() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("ALL");
  const [items, setItems] = useState([]);

  const [editing, setEditing] = useState(false);
  const [model, setModel] = useState(emptyProduct);

  async function load() {
    setLoading(true);
    setToast({ type: "info", text: "" });
    try {
      const [cats, prods] = await Promise.all([
        listCategories(),
        listProducts(categoryId === "ALL" ? null : Number(categoryId)),
      ]);
      setCategories(Array.isArray(cats) ? cats : cats?.items || []);
      setItems(Array.isArray(prods) ? prods : prods?.items || []);
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Load xato",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }, [categories]);

  function startCreate() {
    setModel({ ...emptyProduct, active: true, categoryId: categoryId !== "ALL" ? categoryId : "" });
    setEditing(true);
  }

  function startEdit(p) {
    setModel({
      id: p.id,
      categoryId: String(p.categoryId ?? ""),
      name: p.name ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      photoUrl: p.photoUrl ?? "",
      stockQty: String(p.stockQty ?? ""),
      active: Boolean(p.active),
    });
    setEditing(true);
  }

  async function saveProduct(e) {
    e.preventDefault();
    setToast({ type: "info", text: "" });
    try {
      const payload = {
        categoryId: toNum(model.categoryId),
        name: model.name,
        description: model.description,
        price: toNum(model.price),
        photoUrl: model.photoUrl || null,
        active: Boolean(model.active),
      };

      if (!payload.name) throw new Error("Name majburiy");

      if (model.id) {
        await updateProduct(model.id, payload);
        // stock alohida endpointda
        const stockN = toNum(model.stockQty);
        if (stockN !== null) await setProductStock(model.id, stockN);
      } else {
        const createPayload = { ...payload, stockQty: toNum(model.stockQty) ?? 0 };
        await createProduct(createPayload);
      }

      setToast({ type: "success", text: "Saved" });
      setEditing(false);
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Save xato",
      });
    }
  }

  async function quickStock(p, newQty) {
    try {
      await setProductStock(p.id, toNum(newQty) ?? 0);
      setToast({ type: "success", text: "Stock updated" });
      await load();
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || err?.message || "Stock xato",
      });
    }
  }

  return (
    <AdminLayout
      title="Products"
      subtitle="Product CRUD + stock management."
      actions={
        <div className="flex gap-2">
          <select
            className="rounded-2xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="ALL">ALL categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

          <button
            onClick={startCreate}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            type="button"
          >
            + Add product
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
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan="5">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-500" colSpan="5">
                    Hozircha product yo'q.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.price}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          className="w-20 rounded-xl border px-2 py-1 text-xs"
                          defaultValue={p.stockQty ?? 0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              quickStock(p, e.currentTarget.value);
                            }
                          }}
                        />
                        <span className="text-xs text-slate-500">Enter</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          p.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        type="button"
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border p-4">
          {!editing ? (
            <div className="text-sm text-slate-500">
              Product yaratish yoki edit qilish uchun chapdan <b>Edit</b> yoki <b>+ Add product</b>.
            </div>
          ) : (
            <form onSubmit={saveProduct} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">
                    {model.id ? "Edit product" : "New product"}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Stock create paytida yuboriladi, editda stock alohida update qilinadi.
                  </div>
                </div>
                <button
                  className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={() => setEditing(false)}
                >
                  Close
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField label="Category">
                  <select
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    value={model.categoryId}
                    onChange={(e) => setModel((p) => ({ ...p, categoryId: e.target.value }))}
                  >
                    <option value="">Select...</option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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

                <FormField label="Name">
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    value={model.name}
                    onChange={(e) => setModel((p) => ({ ...p, name: e.target.value }))}
                  />
                </FormField>

                <FormField label="Price">
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    value={model.price}
                    onChange={(e) => setModel((p) => ({ ...p, price: e.target.value }))}
                    placeholder="10000"
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Description">
                    <textarea
                      className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                      value={model.description}
                      onChange={(e) => setModel((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                    />
                  </FormField>
                </div>

                <FormField label="Photo URL">
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    value={model.photoUrl}
                    onChange={(e) => setModel((p) => ({ ...p, photoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </FormField>

                <FormField label="Stock Qty">
                  <input
                    className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    value={model.stockQty}
                    onChange={(e) => setModel((p) => ({ ...p, stockQty: e.target.value }))}
                    placeholder="0"
                  />
                </FormField>
              </div>

              <button
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                type="submit"
              >
                Save
              </button>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
