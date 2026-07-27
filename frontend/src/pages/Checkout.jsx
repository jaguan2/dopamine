import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useCart } from "../contexts/CartContext.jsx";
import { fmt } from "../lib/money.js";
import CartLine from "../components/CartLine.jsx";

const TAX_RATE = 0.07;            // display estimate; server recomputes
const DELIVERY_MIN_CENTS = 1500;  // $15.00 pre-tax

export default function Checkout() {
  const { lines, subtotalCents, clear } = useCart();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [fulfillment, setFulfillment] = useState("pickup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/locations")
      .then((res) => setLocation(res.data[0] || null))
      .catch(() => {});
  }, []);

  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;
  const deliveryBlocked =
    fulfillment === "delivery" && subtotalCents < DELIVERY_MIN_CENTS;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!lines.length) return;
    setSubmitting(true);
    try {
      const res = await api.post("/orders", {
        location_id: location?.id ?? 1,
        fulfillment,
        customer: { name, phone, email },
        address: fulfillment === "delivery" ? address : "",
        notes,
        items: lines.map((l) => ({
          price_option_id: l.price_option_id,
          quantity: l.quantity,
          instructions: l.instructions || "",
        })),
      });
      clear();
      navigate(`/order/${res.data.order_code}`);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong placing the order.");
      setSubmitting(false);
    }
  }

  if (!lines.length) {
    return (
      <main className="page-narrow">
        <div className="checkout-empty">
          <span className="jp" lang="ja">空</span>
          <h1>Your cart is empty</h1>
          <p>Add a few dishes from the menu first.</p>
          <Link className="btn btn-primary" to="/menu">Browse the Menu</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-narrow">
      <div className="page-head">
        <p className="section-kicker" lang="ja">お会計</p>
        <h1 className="section-title">Check Out</h1>
        <p className="section-sub">
          No payment online. Settle up when you collect your order.
        </p>
      </div>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={submit}>
          <fieldset>
            <legend>How would you like it?</legend>
            <div className="fulfillment-toggle" role="radiogroup">
              <label className={fulfillment === "pickup" ? "on" : ""}>
                <input
                  type="radio" name="fulfillment" value="pickup"
                  checked={fulfillment === "pickup"}
                  onChange={() => setFulfillment("pickup")}
                />
                Pickup
              </label>
              <label className={fulfillment === "delivery" ? "on" : ""}>
                <input
                  type="radio" name="fulfillment" value="delivery"
                  checked={fulfillment === "delivery"}
                  onChange={() => setFulfillment("delivery")}
                />
                Delivery
              </label>
            </div>
            {fulfillment === "pickup" && location && (
              <p className="field-note">
                Pick up at {location.street}, {location.city} ·{" "}
                <a href="tel:+17273454088">{location.phone}</a>
              </p>
            )}
            {fulfillment === "delivery" && (
              <p className="field-note">
                Delivery has a $15.00 minimum before tax.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend>Your details</legend>
            <label className="field">
              <span>Name *</span>
              <input value={name} required maxLength={120}
                onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span>Phone *</span>
              <input value={phone} required type="tel" maxLength={30}
                onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="field">
              <span>Email (optional)</span>
              <input value={email} type="email" maxLength={200}
                onChange={(e) => setEmail(e.target.value)} />
            </label>
            {fulfillment === "delivery" && (
              <label className="field">
                <span>Delivery address *</span>
                <textarea value={address} required rows={2} maxLength={300}
                  onChange={(e) => setAddress(e.target.value)} />
              </label>
            )}
            <label className="field">
              <span>Order notes / allergies (optional)</span>
              <textarea value={notes} rows={2} maxLength={500}
                onChange={(e) => setNotes(e.target.value)} />
            </label>
          </fieldset>

          {error && <p className="form-error" role="alert">{error}</p>}
          {deliveryBlocked && (
            <p className="form-error" role="alert">
              Delivery orders need a ${(DELIVERY_MIN_CENTS / 100).toFixed(2)}{" "}
              subtotal. Add {fmt(DELIVERY_MIN_CENTS - subtotalCents)} more, or
              switch to pickup.
            </p>
          )}

          <button
            className="btn btn-primary btn-block"
            disabled={submitting || deliveryBlocked}
          >
            {submitting ? "Placing order…" : `Place Order · ${fmt(totalCents)}`}
          </button>
        </form>

        <aside className="order-summary">
          <h2>Your Order <span className="jp" lang="ja">ご注文</span></h2>
          <ul className="cart-lines">
            {lines.map((l) => (
              <CartLine key={l.price_option_id} line={l} />
            ))}
          </ul>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>{fmt(subtotalCents)}</dd></div>
            <div><dt>Tax (7%)</dt><dd>{fmt(taxCents)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{fmt(totalCents)}</dd></div>
          </dl>
          <p className="cart-tax-note">Final total confirmed by the restaurant.</p>
        </aside>
      </div>
    </main>
  );
}
