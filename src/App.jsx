// Pie Orders - single-file React app
// Quick start:
// 1) Click "Open in editor", then Export > Download file as index.jsx. 
// 2) Create a new Vite React app (or paste into any React project) and replace App.jsx with this file.
//    npm create vite@latest pie-orders -- --template react
//    cd pie-orders && npm i && npm run dev
// 3) In the code below, set GOOGLE_APPS_SCRIPT_URL to your deployed Web App URL (see chat for the small script).
// 4) Deploy to Netlify/Vercel when ready. You'll get orders in your Google Sheet.

import React, { useMemo, useState } from "react";

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1zZKlpEXwR61m-r3BTJStFB9m--si4NvrTT-3GXlEcKEcLrCNmYm6R0lhSx54JDt6-w/exec"; // <-- live URL

// Payment handles
const VENMO_USERNAME = "Armando-Morell"; // <-- your actual Venmo username (no @ here)
const CASHAPP_USERNAME = "$aamorell"; // <-- your actual Cash App $Cashtag

function buildVenmoLinks(amount, note = "") {
  const amt = Number((amount || 0).toFixed(2));
  const encNote = encodeURIComponent(note);
  const app = `venmo://paycharge?txn=pay&recipients=${VENMO_USERNAME}&amount=${amt}&note=${encNote}`;
  const web = `https://venmo.com/u/${VENMO_USERNAME}?txn=pay&amount=${amt}&note=${encNote}`;
  return { app, web };
}

function buildCashAppLink(amount, note = "") {
  const amt = Number((amount || 0).toFixed(2));
  const encNote = encodeURIComponent(note);
  return `https://cash.app/${CASHAPP_USERNAME}?amount=${amt}&note=${encNote}`;
}

// --- Catalog (edit freely) ---
const CATALOG = [
  {
    category: "6\\" Pies (serves 3-4)",
    items: [
      { id: "pumpkin6", name: 'Pumpkin (6\\")", price: 10 },
      { id: "pecan6", name: 'Pecan (6\\")", price: 10 },
      { id: "applecrumb6", name: 'Apple Crumb (6\\")", price: 10 },
      { id: "sweetpotato6", name: 'Sweet Potato (6\\")", price: 10 },
      { id: "bean6", name: 'Bean (6\\")", price: 10 },
    ],
  },
  {
    category: "Small Pies",
    items: [
      { id: "pumpkinS", name: 'Pumpkin (Small)", price: 5 },
      { id: "sweetpotatoS", name: 'Sweet Potato (Small)", price: 5 },
      { id: "pecanS", name: 'Pecan (Small)", price: 5 },
      { id: "buttermilkS", name: 'Buttermilk Coconut (Small)", price: 5 },
      { id: "lemoncustardS", name: 'Lemon Custard (Small)", price: 5 },
      { id: "beanS", name: 'Bean (Small)", price: 5 },
    ],
  },
  {
    category: "Cobblers · Cakes · Pudding · Cheesecake",
    items: [
      { id: "applecobbler", name: 'Apple Cobbler", price: 5 },
      { id: "peachcobbler", name: 'Peach Cobbler", price: 5 },
      { id: "chocfudge", name: 'Chocolate Fudge Cake", price: 5 },
      { id: "carrot", name: 'Carrot Cake (w/ nuts)", price: 5 },
      { id: "redvelvet", name: 'Red Velvet Cake", price: 5 },
      { id: "creamcheese", name: 'Cream Cheese Frosting (cup)", price: 5 },
      { id: "cookiesCream", name: 'Cookies & Cream Cheesecake", price: 5 },
      { id: "strawberryCC", name: 'Strawberry Cheesecake", price: 5 },
      { id: "bananaPudding", name: 'Banana Pudding (pt)", price: 5 },
    ],
  },
];

function Currency({ value }) {
  return <span>{value.toLocaleString(undefined, { style: "currency", currency: "USD" })}</span>;
}

export default function App() {
  const [cart, setCart] = useState({});
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    email: "",
    notes: "",
    payMethod: "Pay now with Venmo",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const itemsFlat = useMemo(() => CATALOG.flatMap(c => c.items), []);

  const total = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = itemsFlat.find(i => i.id === id);
      return item ? sum + qty * item.price : sum;
    }, 0);
  }, [cart, itemsFlat]);

  function changeQty(id, delta) {
    setCart(prev => {
      const next = { ...prev };
      const cur = next[id] || 0;
      const val = Math.max(0, cur + delta);
      if (val === 0) delete next[id]; else next[id] = val;
      return next;
    });
  }

  function setQty(id, val) {
    const num = Math.max(0, Number(val || 0));
    setCart(prev => ({ ...prev, [id]: num }));
  }

  function handleForm(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function submitOrder(e) {
    e.preventDefault();
    setError("");
    if (!form.customer || !form.phone || !form.email) {
      setError("Please fill name, phone, and email.");
      return;
    }
    if (Object.keys(cart).length === 0) {
      setError("Add at least one item.");
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = Object.entries(cart).map(([id, qty]) => {
        const item = itemsFlat.find(i => i.id === id);
        return { id, name: item?.name || id, price: item?.price || 0, qty };
      });
      const ref = Date.now().toString(36).slice(-6).toUpperCase();
      setOrderRef(ref);
      const payload = {
        ...form,
        total,
        items: orderItems,
        orderRef: ref,
        createdAt: new Date().toISOString(),
      };

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
      setCart({});
    } catch (err) {
      console.error(err);
      setError("Submission failed. Try again or contact us.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold mb-2">Thanks! Your order was received.</h1>
          <p className="mb-3">Order reference: <span className="font-mono">{orderRef}</span></p>
          {((() => { 
            const note = `Pie Order ${orderRef} - ${form.customer}`;
            const v = buildVenmoLinks(total, note);
            const c = buildCashAppLink(total, note);
            return (
              <div className="mb-6 border rounded-2xl p-4">
                <div className="font-semibold mb-1">Pay with Venmo or Cash App</div>
                <p className="text-sm text-gray-600 mb-3">Amount: <strong><Currency value={total} /></strong></p>
                <div className="flex flex-wrap gap-3">
                  <a className="rounded-xl px-4 py-2 bg-gray-900 text-white" href={v.app}>Open Venmo</a>
                  <a className="rounded-xl px-4 py-2 border" href={v.web} target="_blank" rel="noreferrer">Venmo (Web)</a>
                  <a className="rounded-xl px-4 py-2 bg-green-600 text-white" href={c} target="_blank" rel="noreferrer">Pay with Cash App</a>
                </div>
                <p className="text-xs text-gray-500 mt-2">Note used: "{note}".</p>
              </div>
            ); 
          })())}
          <p className="mb-6">You'll get a confirmation shortly.</p>
          <button className="rounded-2xl px-4 py-2 bg-gray-900 text-white" onClick={() => setSubmitted(false)}>Place another order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="bg-white rounded-2xl shadow p-6">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">Sweet Potato Pie Fundraiser</h1>
            <p className="text-sm text-gray-600">Thank you for supporting the Saddle Brook MS/HS Music Association!</p>
          </header>

          {CATALOG.map(section => (
            <section key={section.category} className="mb-6">
              <h2 className="text-xl font-bold mb-3">{section.category}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {section.items.map(item => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div key={item.id} className="border rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600"><Currency value={item.price} /></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 rounded-xl border" onClick={() => changeQty(item.id, -1)}>-</button>
                        <input type="number" min="0" value={qty} onChange={(e) => setQty(item.id, e.target.value)} className="w-16 text-center border rounded-xl py-1" />
                        <button className="px-3 py-1 rounded-xl border" onClick={() => changeQty(item.id, +1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="bg-white rounded-2xl shadow p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">Your Order</h2>
          <div className="space-y-2 mb-4">
            {Object.keys(cart).length === 0 && (
              <div className="text-gray-500">No items yet. Add pies to your cart 👉</div>
            )}
            {Object.entries(cart).map(([id, qty]) => {
              const item = itemsFlat.find(i => i.id === id);
              if (!item) return null;
              return (
                <div key={id} className="flex justify-between text-sm">
                  <div>{item.name} × {qty}</div>
                  <div><Currency value={qty * item.price} /></div>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-3 mb-4 flex justify-between font-bold">
            <span>Total</span>
            <span><Currency value={total} /></span>
          </div>

          <form onSubmit={submitOrder} className="space-y-3">
            <input name="customer" placeholder="Your name" className="w-full border rounded-xl px-3 py-2" value={form.customer} onChange={handleForm} />
            <input name="phone" placeholder="Phone" className="w-full border rounded-xl px-3 py-2" value={form.phone} onChange={handleForm} />
            <input name="email" placeholder="Email" className="w-full border rounded-xl px-3 py-2" value={form.email} onChange={handleForm} />
            <select name="payMethod" className="w-full border rounded-xl px-3 py-2" value={form.payMethod} onChange={handleForm}>
              <option>Pay now with Venmo</option>
              <option>Pay now with Cash App</option>
            </select>
            <textarea name="notes" placeholder="Notes (allergies, etc.)" rows={3} className="w-full border rounded-xl px-3 py-2" value={form.notes} onChange={handleForm} />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button disabled={submitting} className="w-full rounded-2xl bg-gray-900 text-white py-2 disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Order"}
            </button>
          </form>
        </aside>
      </div>
      <footer className="max-w-5xl mx-auto text-center text-xs text-gray-500 mt-8">
        Prices and availability subject to change. All proceeds support the Saddle Brook MS/HS Music Association.
      </footer>
    </div>
  );
}
