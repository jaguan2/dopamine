import { useEffect, useRef, useState } from "react";
import api from "../lib/api.js";
import { fmt } from "../lib/money.js";

// Staff-facing dashboard. Enter the kitchen key once (kept in
// sessionStorage); orders refresh automatically every 8 seconds.
const NEXT_STATUS = { received: "confirmed", confirmed: "ready", ready: "completed" };
const NEXT_LABEL = {
  received: "Confirm",
  confirmed: "Mark Ready",
  ready: "Complete",
};

export default function Kitchen() {
  const [key, setKey] = useState(() => sessionStorage.getItem("oec-kitchen-key") || "");
  const [entered, setEntered] = useState(Boolean(key));
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  async function load(currentKey) {
    try {
      const res = await api.get("/kitchen/orders", {
        headers: { "X-Kitchen-Key": currentKey },
      });
      setOrders(res.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Wrong key.");
        setEntered(false);
        sessionStorage.removeItem("oec-kitchen-key");
      } else {
        setError("Could not load orders.");
      }
    }
  }

  useEffect(() => {
    if (!entered) return;
    load(key);
    timerRef.current = setInterval(() => load(key), 8000);
    return () => clearInterval(timerRef.current);
  }, [entered]);  // eslint-disable-line react-hooks/exhaustive-deps

  async function advance(order) {
    const status = NEXT_STATUS[order.status];
    if (!status) return;
    await api.patch(`/kitchen/orders/${order.id}/status`, { status }, {
      headers: { "X-Kitchen-Key": key },
    });
    load(key);
  }

  async function cancel(order) {
    if (!window.confirm(`Cancel order ${order.order_code}?`)) return;
    await api.patch(`/kitchen/orders/${order.id}/status`, { status: "cancelled" }, {
      headers: { "X-Kitchen-Key": key },
    });
    load(key);
  }

  if (!entered) {
    return (
      <main className="page-narrow">
        <div className="page-head">
          <p className="section-kicker" lang="ja">台所</p>
          <h1 className="section-title">Kitchen</h1>
          <p className="section-sub">Staff only — enter the kitchen key.</p>
        </div>
        <form
          className="kitchen-key-form"
          onSubmit={(e) => {
            e.preventDefault();
            sessionStorage.setItem("oec-kitchen-key", key);
            setOrders(null);
            setEntered(true);
          }}
        >
          <input
            type="password"
            value={key}
            placeholder="Kitchen key"
            onChange={(e) => setKey(e.target.value)}
            aria-label="Kitchen key"
          />
          <button className="btn btn-primary">Enter</button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="kitchen-page">
      <div className="wrap">
        <div className="page-head">
          <p className="section-kicker" lang="ja">台所</p>
          <h1 className="section-title">Open Orders</h1>
          <p className="section-sub">
            Auto-refreshes every 8 seconds.{" "}
            {orders ? `${orders.length} open.` : ""}
          </p>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {orders && orders.length === 0 && (
          <div className="checkout-empty">
            <span className="jp" lang="ja">静か</span>
            <p>No open orders. Enjoy the calm.</p>
          </div>
        )}

        <div className="kitchen-grid">
          {(orders || []).map((o) => (
            <article key={o.id} className={`kitchen-card status-${o.status}`}>
              <header>
                <strong>{o.order_code}</strong>
                <span className={`status-pill ${o.status}`}>{o.status}</span>
              </header>
              <p className="kitchen-meta">
                {o.fulfillment === "delivery" ? "🛵 Delivery" : "🥡 Pickup"} ·{" "}
                {o.customer_name} · <a href={`tel:${o.phone}`}>{o.phone}</a>
                {o.address && <> · {o.address}</>}
              </p>
              <ul>
                {o.items.map((it, i) => (
                  <li key={i}>
                    {it.quantity} × {it.item_name}
                    {it.price_label && ` (${it.price_label})`}
                    {it.instructions && (
                      <em className="line-instructions"> — {it.instructions}</em>
                    )}
                  </li>
                ))}
              </ul>
              {o.notes && <p className="kitchen-notes">Note: {o.notes}</p>}
              <footer>
                <span className="kitchen-total">{fmt(o.total_cents)}</span>
                <div className="kitchen-actions">
                  {NEXT_STATUS[o.status] && (
                    <button className="btn btn-primary" onClick={() => advance(o)}>
                      {NEXT_LABEL[o.status]}
                    </button>
                  )}
                  <button className="btn btn-ghost" onClick={() => cancel(o)}>
                    Cancel
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
