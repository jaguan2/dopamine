import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api.js";
import { fmt } from "../lib/money.js";

const STEPS = ["received", "confirmed", "ready", "completed"];
const STEP_LABELS = {
  received: "Received",
  confirmed: "In the kitchen",
  ready: "Ready",
  completed: "Picked up",
};

export default function OrderStatus() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let timer;
    async function load() {
      try {
        const res = await api.get(`/orders/${code}`);
        setOrder(res.data);
        // Stop polling once the order reaches a terminal state.
        if (!["completed", "cancelled"].includes(res.data.status)) {
          timer = setTimeout(load, 10000);
        }
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
        else timer = setTimeout(load, 15000);
      }
    }
    load();
    return () => clearTimeout(timer);
  }, [code]);

  if (notFound) {
    return (
      <main className="page-narrow">
        <div className="checkout-empty">
          <span className="jp" lang="ja">見つかりません</span>
          <h1>Order not found</h1>
          <p>We couldn't find an order with code {code}.</p>
          <Link className="btn btn-primary" to="/menu">Back to the Menu</Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="page-narrow">
        <div className="checkout-empty">
          <span className="jp" lang="ja">少々お待ちください</span>
          <p>Looking up your order…</p>
        </div>
      </main>
    );
  }

  const stepIndex = STEPS.indexOf(order.status);
  const cancelled = order.status === "cancelled";

  return (
    <main className="page-narrow">
      <div className="page-head">
        <p className="section-kicker" lang="ja">ご注文承りました</p>
        <h1 className="section-title">
          {cancelled ? "Order cancelled" : "Thank you!"}
        </h1>
        <p className="section-sub">
          Order <strong>{order.order_code}</strong> ·{" "}
          {order.fulfillment === "delivery" ? "Delivery" : "Pickup"} at{" "}
          {order.location} · placed{" "}
          {new Date(order.created_at).toLocaleTimeString([], {
            hour: "numeric", minute: "2-digit",
          })}
          . Keep this page; it updates as the kitchen works.
        </p>
      </div>

      {!cancelled && (
        <ol className="status-steps">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={
                i < stepIndex ? "done" : i === stepIndex ? "current" : undefined
              }
            >
              <span className="dot" aria-hidden="true" />
              {STEP_LABELS[s]}
            </li>
          ))}
        </ol>
      )}

      <div className="order-summary standalone">
        <h2>Order Summary <span className="jp" lang="ja">明細</span></h2>
        <ul className="cart-lines">
          {order.items.map((it, idx) => (
            <li key={idx} className="cart-line">
              <div className="cart-line-info">
                <span className="cart-line-name">
                  {it.quantity} × {it.item_name}
                  {it.price_label && <span className="plabel"> ({it.price_label})</span>}
                  {it.instructions && (
                    <span className="line-instructions"> ({it.instructions})</span>
                  )}
                </span>
                <span className="cart-line-price">{fmt(it.line_total_cents)}</span>
              </div>
            </li>
          ))}
        </ul>
        <dl className="totals">
          <div><dt>Subtotal</dt><dd>{fmt(order.subtotal_cents)}</dd></div>
          <div><dt>Tax</dt><dd>{fmt(order.tax_cents)}</dd></div>
          <div className="grand"><dt>Total due</dt><dd>{fmt(order.total_cents)}</dd></div>
        </dl>
        <p className="cart-tax-note">
          Pay at {order.fulfillment === "delivery" ? "the door" : "pickup"},
          cash or card. Questions? Call{" "}
          <a href="tel:+17273454088">727-345-4088</a>.
        </p>
      </div>
    </main>
  );
}
