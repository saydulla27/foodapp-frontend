import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import FormField from "../components/FormField";
import { listCompanies } from "../api/companies";
import { billingHistory, clickCreateInvoice, markPaid } from "../api/billing";

export default function Billing() {
  const [toast, setToast] = useState({ type: "info", text: "" });
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [plan, setPlan] = useState("BASIC");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listCompanies();
        const items = Array.isArray(data) ? data : (data?.items || []);
        setCompanies(items);
        if (items[0]?.id) setCompanyId(String(items[0].id));
      } catch (e) {
        setToast({ type: "error", text: "Companies yuklanmadi" });
      }
    })();
  }, []);

  async function loadHistory(cid) {
    if (!cid) return;
    try {
      const data = await billingHistory(cid);
      setHistory(Array.isArray(data) ? data : (data?.items || []));
    } catch (e) {
      setToast({ type: "error", text: "Billing history xato" });
    }
  }

  useEffect(() => {
    loadHistory(companyId);
  }, [companyId]);

  async function createInvoice() {
    try {
      await clickCreateInvoice({ companyId, plan, discountAmount: Number(discountAmount || 0) });
      setToast({ type: "success", text: "Invoice create qilindi" });
      loadHistory(companyId);
    } catch (e) {
      setToast({ type: "error", text: e?.response?.data?.message || "Create invoice xato" });
    }
  }

  async function doMarkPaid() {
    try {
      // backend qanday kutsa shunga moslab o‘zgartirasiz:
      await markPaid({ companyId });
      setToast({ type: "success", text: "Paid belgilandi" });
      loadHistory(companyId);
    } catch (e) {
      setToast({ type: "error", text: e?.response?.data?.message || "Mark paid xato" });
    }
  }

  return (
    <Layout>
      <Toast type={toast.type} text={toast.text} onClose={() => setToast({ type: "info", text: "" })} />

      <div className="text-lg font-semibold text-slate-900">Billing</div>
      <div className="text-sm text-slate-500">Click invoice create / paid mark / history.</div>

      <div className="mt-4 grid gap-4 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField label="Company">
            <select
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Plan">
            <select
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="BASIC">BASIC</option>
              <option value="PRO">PRO</option>
            </select>
          </FormField>

          <FormField label="Discount (UZS)">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
            />
          </FormField>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            type="button"
            onClick={createInvoice}
          >
            Click create invoice
          </button>

          <button
            className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={doMarkPaid}
          >
            Mark paid
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-900">History</div>
        {history.length === 0 ? (
          <div className="text-sm text-slate-500">Hozircha history yo‘q.</div>
        ) : (
          <div className="space-y-2">
            {history.map((h, idx) => (
              <div key={h.id ?? idx} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
                <div className="font-medium text-slate-900">{h.title || `Item #${idx + 1}`}</div>
                <div className="text-slate-600">{JSON.stringify(h)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
