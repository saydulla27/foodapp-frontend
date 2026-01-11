import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { adminLogin } from "../api/adminAuth";

export default function AdminLogin() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setToast({ type: "info", text: "" });
    setLoading(true);
    try {
      const data = await adminLogin(phone, password);
      if (!data?.token) throw new Error("Token kelmadi");
      nav("/admin/orders");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Login xato";
      setToast({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <Toast
        type={toast.type}
        text={toast.text}
        onClose={() => setToast({ type: "info", text: "" })}
      />

      <div className="mx-auto flex min-h-full max-w-md items-center px-4 py-10">
        <div className="w-full rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-500">FOODAPP</div>
            <div className="text-2xl font-semibold text-slate-900">
              Company Admin Login
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Kompaniya admin login/parol bilan kiring.
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <FormField label="Phone">
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998..."
                autoComplete="username"
              />
            </FormField>

            <FormField label="Password">
              <input
                className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
            </FormField>

            <button
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Kutilmoqda..." : "Kirish"}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div>
                API base: <span className="font-mono">{import.meta.env.VITE_API_BASE}</span>
              </div>
              <Link className="text-slate-700 hover:text-slate-900" to="/superadmin/login">
                SuperAdmin
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
