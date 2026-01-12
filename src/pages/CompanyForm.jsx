import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { createCompany, getCompany, updateCompany, setCustomerBotWebhook } from "../api/companies";

const empty = {
  name: "",
  active: true,
  adminPhone: "",
  adminPassword: "",
  customerBotToken: "",
  courierBotToken: "",
  customerWebhookSecret: "",
  courierWebhookSecret: "",
  aboutText: "",
  branchLat: "",
  branchLng: "",
  webAppUrl: "",
  publicBaseUrl: "",
};

export default function CompanyForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [model, setModel] = useState(empty);

  // Ngrok / public base URL (webhook set qilish uchun).
  // 1) .env dagi VITE_PUBLIC_BASE_URL 2) localStorage dagi oxirgi qiymat
  useEffect(() => {
    const saved = localStorage.getItem("foodapp_public_base_url") || "";
    const env = import.meta.env.VITE_PUBLIC_BASE_URL || "";
    const v = (saved || env || "").trim();
    if (v) setModel((p) => ({ ...p, publicBaseUrl: v }));
  }, []);
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getCompany(id);
        setModel({
          ...empty,
          ...data,
          aboutText: data.aboutText || "",
          branchLat: data.branchLat == null ? "" : String(data.branchLat),
          branchLng: data.branchLng == null ? "" : String(data.branchLng),
          webAppUrl: data.webAppUrl || "",
          customerBotToken: "",
          courierBotToken: "",
          customerWebhookSecret: data.customerWebhookSecret || data.webhookSecret || "",
        });
      } catch (err) {
        setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Company load xato" });
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, id]);

  function setField(k, v) {
    setModel((p) => ({ ...p, [k]: v }));
  }

  async function save(e) {
    e.preventDefault();
    setToast({ type: "info", text: "" });
    setLoading(true);
    try {
      if (!model.name.trim()) throw new Error("Name majburiy");
      const payload = {
        name: model.name,
        active: Boolean(model.active),
        adminPhone: model.adminPhone || null,
        adminPassword: model.adminPassword || null,
        customerBotToken: model.customerBotToken || null,
        courierBotToken: model.courierBotToken || null,
        customerWebhookSecret: model.customerWebhookSecret || null,
        courierWebhookSecret: model.courierWebhookSecret || null,
        aboutText: model.aboutText || null,
        branchLat: model.branchLat === "" ? null : Number(model.branchLat),
        branchLng: model.branchLng === "" ? null : Number(model.branchLng),
        webAppUrl: model.webAppUrl || null,
      };
      const savedCompany = isEdit ? await updateCompany(id, payload) : await createCompany(payload);

      // Agar Customer Bot Token bor bo'lsa, webhook'ni avtomatik set qilamiz
      const companyId = isEdit ? id : savedCompany?.id;
      const publicBaseUrl = (model.publicBaseUrl || "").trim();

      if (publicBaseUrl) {
        localStorage.setItem("foodapp_public_base_url", publicBaseUrl);
      }

      if (payload.customerBotToken && companyId && publicBaseUrl) {
        await setCustomerBotWebhook(companyId, publicBaseUrl);
      }

      setToast({ type: "success", text: "Saved" });
      nav("/superadmin/companies");
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Save xato" });
    } finally {
      setLoading(false);
    }
  }

  async function setWebhook() {
    setToast({ type: "info", text: "" });
    setLoading(true);
    try {
      const fallback = (localStorage.getItem("foodapp_public_base_url") || import.meta.env.VITE_PUBLIC_BASE_URL || "").trim();
      const publicBaseUrl = (fallback || window.prompt("Ngrok public URL ni kiriting (https://xxxx.ngrok-free.app)", "") || "").trim();
      if (!publicBaseUrl) throw new Error("Public URL kerak (ngrok)");
      localStorage.setItem("foodapp_public_base_url", publicBaseUrl);
      const data = await setCustomerBotWebhook(id, publicBaseUrl);
      setToast({ type: "success", text: "Webhook set: " + data.webhookUrl });
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Webhook xato" });
    } finally {
      setLoading(false);
    }
  }


  return (
    <Layout>
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Company" : "New Company"}
          </div>
          <div className="text-sm text-slate-500">Bot tokenlar va webhook secret shu yerda.</div>
        </div>

        <Link
          to="/superadmin/companies"
          className="rounded-2xl border bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      <form onSubmit={save} className="mt-4 grid gap-4 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Name">
            <input className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={model.name} onChange={(e) => setField("name", e.target.value)} />
          </FormField>


          <FormField label="Admin Phone">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="+998901234567"
              value={model.adminPhone}
              onChange={(e) => setField("adminPhone", e.target.value)}
              required={!isEdit}
            />
          </FormField>

          <FormField label="Admin Password">
            <input
              type="password"
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={model.adminPassword}
              onChange={(e) => setField("adminPassword", e.target.value)}
              required={!isEdit}
            />
          </FormField>
<FormField label="Customer Bot Token">
            <input className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={model.customerBotToken} onChange={(e) => setField("customerBotToken", e.target.value)} />
          </FormField>

          <FormField label="Public Base URL (ngrok)">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="https://xxxx.ngrok-free.app"
              value={model.publicBaseUrl}
              onChange={(e) => setField("publicBaseUrl", e.target.value)}
            />
            <div className="mt-1 text-xs text-slate-500">
              Bot webhook avtomatik set bo'lishi uchun shu yerga ngrok URL kiriting.
            </div>
          </FormField>

          <FormField label="WebApp URL (Telegram Mini App)">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="https://example.com/foodapp"
              value={model.webAppUrl}
              onChange={(e) => setField("webAppUrl", e.target.value)}
            />
            <div className="mt-1 text-xs text-slate-500">
              Botdagi 🍟 Buyurtma / 🛒 Savat tugmalari shu URL orqali WebApp oynani ochadi.
            </div>
          </FormField>

          <FormField label="Courier Bot Token">
            <input className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={model.courierBotToken} onChange={(e) => setField("courierBotToken", e.target.value)} />
          </FormField>

          <FormField label="Customer Webhook Secret">
            <input className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={model.customerWebhookSecret} onChange={(e) => setField("customerWebhookSecret", e.target.value)} />
          </FormField>

          <FormField label="Courier Webhook Secret">
            <input className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={model.courierWebhookSecret} onChange={(e) => setField("courierWebhookSecret", e.target.value)} />
          </FormField>

          <FormField label="Active">
            <select className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={String(model.active)}
              onChange={(e) => setField("active", e.target.value === "true")}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </FormField>

          <FormField label="Biz haqimizda (About)">
            <textarea
              className="w-full min-h-28 rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Company haqida qisqa matn..."
              value={model.aboutText}
              onChange={(e) => setField("aboutText", e.target.value)}
            />
            <div className="mt-1 text-xs text-slate-500">
              Botdagi “ℹ️ Biz haqimizda” shu matnni chiqaradi.
            </div>
          </FormField>

          <FormField label="Filial lokatsiyasi (ixtiyoriy) - Latitude">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="41.311081"
              value={model.branchLat}
              onChange={(e) => setField("branchLat", e.target.value)}
            />
          </FormField>

          <FormField label="Filial lokatsiyasi (ixtiyoriy) - Longitude">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="69.240562"
              value={model.branchLng}
              onChange={(e) => setField("branchLng", e.target.value)}
            />
            <div className="mt-1 text-xs text-slate-500">
              Botdagi “🏠 Barcha filiallar” lokatsiya yuboradi.
            </div>
          </FormField>
        </div>

        {(model.customerBotToken && (isEdit || model.publicBaseUrl)) && (
        <button
          type="button"
          onClick={setWebhook}
          disabled={loading}
          className="rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
        >
          Set Customer Webhook
        </button>
      )}

        <button
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </Layout>
  );
}