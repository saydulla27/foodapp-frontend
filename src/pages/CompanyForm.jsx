import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { createCompany, getCompany, updateCompany, setCustomerBotWebhook } from "../api/companies";

const empty = {
  name: "",
  adminPhone: "",
  adminPassword: "",
  customerBotToken: "",
  courierBotToken: "",
  courierWebhookSecret: "",
  aboutText: "",
  branchLat: "",
  branchLng: "",
  active: true,
};

export default function CompanyForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [model, setModel] = useState(empty);
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
          // normalize optional fields
          aboutText: data.aboutText || data.about || "",
          branchLat: data.branchLat == null ? "" : String(data.branchLat),
          branchLng: data.branchLng == null ? "" : String(data.branchLng),
          courierWebhookSecret: data.courierWebhookSecret || "",
          customerBotToken: data.customerBotToken || "",
          courierBotToken: data.courierBotToken || "",
          adminPhone: data.adminPhone || "",
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

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: model.name?.trim(),
        adminPhone: model.adminPhone?.trim(),
        adminPassword: model.adminPassword,
        customerBotToken: (model.customerBotToken || "").trim(),
        courierBotToken: (model.courierBotToken || "").trim(),
        courierWebhookSecret: (model.courierWebhookSecret || "").trim(),
        aboutText: model.aboutText || "",
        branchLat: model.branchLat === "" ? null : Number(model.branchLat),
        branchLng: model.branchLng === "" ? null : Number(model.branchLng),
        active: Boolean(model.active),
      };

      if (!payload.name) throw new Error("Name required");
      if (!payload.adminPhone) throw new Error("Admin phone required");
      if (!payload.adminPassword) throw new Error("Admin password required");
      if (!payload.customerBotToken) throw new Error("Customer bot token required");

      if (isEdit) {
        await updateCompany(id, payload);
        // webhook doimiy URL/secret bilan avtomatik, lekin token o'zgarsa qayta set qilish kerak bo'lishi mumkin
        await setCustomerBotWebhook(id);
        setToast({ type: "success", text: "Updated + webhook set" });
      } else {
        const created = await createCompany(payload);
        if (created?.id) {
          await setCustomerBotWebhook(created.id);
        }
        setToast({ type: "success", text: "Created + webhook set" });
        nav("/superadmin/companies");
      }
    } catch (err) {
      setToast({ type: "error", text: err?.response?.data?.message || err?.message || "Save xato" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title={isEdit ? "Edit Company" : "New Company"} right={<Link className="btn" to="/superadmin/companies">Back</Link>}>
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <form onSubmit={onSubmit} className="space-y-5 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Name">
            <input className="input" value={model.name} onChange={(e) => setField("name", e.target.value)} />
          </FormField>

          <FormField label="Admin Phone" hint="Format: 998901234567">
            <input className="input" value={model.adminPhone} onChange={(e) => setField("adminPhone", e.target.value)} />
          </FormField>

          <FormField label="Admin Password">
            <input className="input" type="password" value={model.adminPassword} onChange={(e) => setField("adminPassword", e.target.value)} />
          </FormField>

          <FormField label="Customer Bot Token" hint="@BotFather token">
            <input className="input" value={model.customerBotToken} onChange={(e) => setField("customerBotToken", e.target.value)} />
          </FormField>

          <FormField label="Courier Bot Token (optional)">
            <input className="input" value={model.courierBotToken} onChange={(e) => setField("courierBotToken", e.target.value)} />
          </FormField>

          <FormField label="Courier Webhook Secret (optional)">
            <input className="input" value={model.courierWebhookSecret} onChange={(e) => setField("courierWebhookSecret", e.target.value)} />
          </FormField>

          <FormField label="Biz haqimizda (About)">
            <textarea className="input min-h-[120px]" value={model.aboutText} onChange={(e) => setField("aboutText", e.target.value)} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Filial lokatsiyasi (Latitude) (optional)">
              <input className="input" value={model.branchLat} onChange={(e) => setField("branchLat", e.target.value)} />
            </FormField>

            <FormField label="Filial lokatsiyasi (Longitude) (optional)">
              <input className="input" value={model.branchLng} onChange={(e) => setField("branchLng", e.target.value)} />
            </FormField>

            <FormField label="Active">
              <select className="input" value={String(model.active)} onChange={(e) => setField("active", e.target.value === "true")}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Layout>
  );
}
