import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createWebAppOrder, getWebAppCompany, getWebAppMenu, getTgUser, tgExpand, tgReady } from "../api/webapp";

function cartKey(companyId) {
  return `fa_cart_${companyId}`;
}

function loadCart(companyId) {
  try {
    return JSON.parse(localStorage.getItem(cartKey(companyId)) || "{}") || {};
  } catch {
    return {};
  }
}

function saveCart(companyId, cart) {
  localStorage.setItem(cartKey(companyId), JSON.stringify(cart));
}

function sumQty(cart) {
  return Object.values(cart).reduce((a, b) => a + (Number(b) || 0), 0);
}

export default function WebApp() {
  const [sp] = useSearchParams();
  const companyId = Number(sp.get("companyId") || 0);
  const initialPage = sp.get("page") || "menu";

  const [page, setPage] = useState(initialPage);
  const [company, setCompany] = useState(null);
  const [menu, setMenu] = useState(null);
  const [catId, setCatId] = useState(null);
  const [cart, setCart] = useState(() => (companyId ? loadCart(companyId) : {}));

  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [pay, setPay] = useState("CASH");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    tgReady();
    tgExpand();
  }, []);

  useEffect(() => {
    if (!companyId) return;
    setCart(loadCart(companyId));
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const c = await getWebAppCompany(companyId);
        setCompany(c);
        const m = await getWebAppMenu(companyId);
        setMenu(m);
        const first = m?.categories?.[0]?.id;
        setCatId((prev) => prev ?? first ?? null);
      } catch (e) {
        setToast(e?.response?.data?.message || e?.message || "Xato");
      }
    })();
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    saveCart(companyId, cart);
  }, [companyId, cart]);

  const productsById = useMemo(() => {
    const map = {};
    (menu?.categories || []).forEach((c) => {
      (c.products || []).forEach((p) => (map[p.id] = p));
    });
    return map;
  }, [menu]);

  const cartItems = useMemo(() => {
    const items = [];
    for (const [pid, q] of Object.entries(cart)) {
      const qty = Number(q) || 0;
      if (qty <= 0) continue;
      const p = productsById[Number(pid)];
      if (!p) continue;
      items.push({ ...p, qty });
    }
    return items;
  }, [cart, productsById]);

  const totalSum = useMemo(() => cartItems.reduce((a, it) => a + (Number(it.price) || 0) * it.qty, 0), [cartItems]);
  const totalQty = useMemo(() => cartItems.reduce((a, it) => a + it.qty, 0), [cartItems]);

  function addQty(pid, delta) {
    setToast("");
    setCart((prev) => {
      const cur = Number(prev[pid] || 0);
      const next = Math.max(0, cur + delta);
      const p = productsById[Number(pid)];
      if (p && delta > 0 && p.stock != null && next > Number(p.stock)) {
        setToast("⛔️ Zaxira yetarli emas");
        return prev;
      }
      const copy = { ...prev };
      if (next === 0) delete copy[pid];
      else copy[pid] = next;
      return copy;
    });
  }

  async function getGeo() {
    setToast("");
    if (!navigator.geolocation) {
      setToast("Geolokatsiya qo‘llanmaydi");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {
        setBusy(false);
        setToast("Lokatsiya olinmadi. Ruxsat bering.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submitOrder() {
    setToast("");
    if (totalQty <= 0) {
      setToast("🛒 Savat bo‘sh");
      return;
    }
    if (!phone.trim()) {
      setToast("Telefon raqam kiriting");
      return;
    }
    if (lat == null || lng == null) {
      setToast("Lokatsiyani yuboring");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        companyId,
        phone: phone.trim(),
        deliveryLat: lat,
        deliveryLng: lng,
        paymentMethod: pay,
        items: cartItems.map((it) => ({ productId: it.id, qty: it.qty })),
      };
      const res = await createWebAppOrder(payload);
      setSuccess(res);
      setCart({});
      setPage("success");
    } catch (e) {
      setToast(e?.response?.data?.message || e?.message || "Buyurtma xato");
    } finally {
      setBusy(false);
    }
  }

  const tgUser = getTgUser();

  if (!companyId) {
    return (
      <div className="p-4 text-sm">
        <div className="font-semibold">CompanyId kerak</div>
        <div className="text-slate-500">Bot web_app URL ga companyId qo‘shib yuborishi shart.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-semibold">{company?.name || "..."}</div>
            <div className="text-xs text-slate-500">
              {tgUser ? `@${tgUser.username || tgUser.first_name || "mijoz"}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Savatda</div>
            <div className="font-semibold">{totalQty} ta</div>
          </div>
        </div>

        <div className="px-4 pb-3 flex gap-2">
          <button
            className={`flex-1 rounded-xl px-3 py-2 text-sm border ${page === "menu" ? "bg-slate-900 text-white" : "bg-white"}`}
            onClick={() => setPage("menu")}
          >
            🍟 Buyurtma
          </button>
          <button
            className={`flex-1 rounded-xl px-3 py-2 text-sm border ${page === "cart" ? "bg-slate-900 text-white" : "bg-white"}`}
            onClick={() => setPage("cart")}
          >
            🛒 Savat
          </button>
        </div>
      </div>

      {toast && <div className="px-4 pt-3 text-sm text-red-600">{toast}</div>}

      {page === "menu" && (
        <div className="p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(menu?.categories || []).map((c) => (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-sm border ${catId === c.id ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            {(menu?.categories || []).find((c) => c.id === catId)?.products?.map((p) => {
              const qty = Number(cart[p.id] || 0);
              const disabled = p.stock != null && Number(p.stock) <= 0;
              return (
                <div key={p.id} className="bg-white rounded-2xl border p-3">
                  <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{Number(p.price).toLocaleString()} so‘m</div>
                  <div className="text-xs text-slate-400">Zaxira: {p.stock ?? "-"}</div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      className="w-10 h-10 rounded-xl border bg-white"
                      onClick={() => addQty(p.id, -1)}
                      disabled={qty <= 0}
                    >
                      ➖
                    </button>
                    <div className="w-10 text-center font-semibold">{qty}</div>
                    <button
                      className={`w-10 h-10 rounded-xl border ${disabled ? "bg-slate-100 text-slate-400" : "bg-white"}`}
                      onClick={() => addQty(p.id, +1)}
                      disabled={disabled}
                    >
                      ➕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3">
            <button
              className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold"
              onClick={() => setPage("cart")}
            >
              🛒 Savatga o‘tish — {totalQty} ta | {totalSum.toLocaleString()} so‘m
            </button>
          </div>

          <div className="h-20" />
        </div>
      )}

      {page === "cart" && (
        <div className="p-4">
          {cartItems.length === 0 ? (
            <div className="text-sm text-slate-500">Savat bo‘sh</div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((it) => (
                <div key={it.id} className="bg-white rounded-2xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{it.name}</div>
                      <div className="text-xs text-slate-500">{Number(it.price).toLocaleString()} so‘m</div>
                    </div>
                    <div className="font-semibold text-sm">{(Number(it.price) * it.qty).toLocaleString()}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button className="w-10 h-10 rounded-xl border" onClick={() => addQty(it.id, -1)}>
                      ➖
                    </button>
                    <div className="w-10 text-center font-semibold">{it.qty}</div>
                    <button
                      className="w-10 h-10 rounded-xl border"
                      onClick={() => addQty(it.id, +1)}
                      disabled={it.stock != null && it.qty + 1 > Number(it.stock)}
                    >
                      ➕
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-2xl border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">Jami</div>
                  <div className="font-semibold">{totalSum.toLocaleString()} so‘m</div>
                </div>
              </div>

              <button
                className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold"
                onClick={() => setPage("checkout")}
              >
                ✅ Checkout
              </button>

              <button
                className="w-full rounded-2xl border py-3 text-sm"
                onClick={() => setCart({})}
              >
                🧹 Savatni tozalash
              </button>
            </div>
          )}
        </div>
      )}

      {page === "checkout" && (
        <div className="p-4 space-y-3">
          <div className="bg-white rounded-2xl border p-3">
            <div className="font-semibold text-sm">Telefon raqam</div>
            <input
              className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border p-3">
            <div className="font-semibold text-sm">Lokatsiya</div>
            <div className="text-xs text-slate-500 mt-1">"Lokatsiyani olish" tugmasini bosing</div>
            <button
              className="mt-2 w-full rounded-xl border py-2 text-sm"
              onClick={getGeo}
              disabled={busy}
            >
              📍 Lokatsiyani olish
            </button>
            <div className="text-xs text-slate-500 mt-2">
              {lat != null && lng != null ? `✅ Qabul qilindi: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : ""}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-3">
            <div className="font-semibold text-sm">To‘lov</div>
            <div className="mt-2 flex gap-2">
              <button
                className={`flex-1 rounded-xl border py-2 text-sm ${pay === "CASH" ? "bg-slate-900 text-white" : "bg-white"}`}
                onClick={() => setPay("CASH")}
              >
                💵 Naqd
              </button>
              <button
                className={`flex-1 rounded-xl border py-2 text-sm ${pay === "ONLINE" ? "bg-slate-900 text-white" : "bg-white"}`}
                onClick={() => setPay("ONLINE")}
              >
                💳 Online
              </button>
            </div>
          </div>

          <button
            className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold"
            onClick={submitOrder}
            disabled={busy}
          >
            ✅ Buyurtmani yuborish — {totalSum.toLocaleString()} so‘m
          </button>

          <button className="w-full rounded-2xl border py-3 text-sm" onClick={() => setPage("cart")}
            disabled={busy}
          >
            🔙 Orqaga
          </button>
        </div>
      )}

      {page === "success" && (
        <div className="p-4 space-y-3">
          <div className="bg-white rounded-2xl border p-4">
            <div className="text-lg font-semibold">✅ Buyurtma qabul qilindi</div>
            <div className="mt-2 text-sm text-slate-600">Buyurtma ID: <b>{success?.id}</b></div>
            <div className="mt-1 text-sm text-slate-600">Jami: <b>{Number(success?.totalAmount || 0).toLocaleString()} so‘m</b></div>
            {success?.paymentStatus === "PENDING" && (
              <div className="mt-3 text-sm text-slate-600">
                💳 Online to‘lov: hozircha MVP. Keyin Click/Payme integratsiya qilamiz.
              </div>
            )}
          </div>

          <button className="w-full rounded-2xl bg-slate-900 text-white py-3 text-sm font-semibold" onClick={() => setPage("menu")}
          >
            🍟 Yangi buyurtma
          </button>
        </div>
      )}
    </div>
  );
}
