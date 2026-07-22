import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { fmt } from "../lib/money.js";

export default function CartDrawer() {
  const { lines, setQty, subtotalCents, drawerOpen, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  function checkout() {
    setDrawerOpen(false);
    navigate("/checkout");
  }

  return (
    <>
      <div
        className={"drawer-scrim" + (drawerOpen ? " show" : "")}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={"cart-drawer" + (drawerOpen ? " open" : "")}
        aria-label="Cart"
        aria-hidden={!drawerOpen}
      >
        <div className="cart-drawer-head">
          <h2>
            Your Order <span className="jp" lang="ja">ご注文</span>
          </h2>
          <button
            className="drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="cart-empty">
            <span className="jp" lang="ja">空</span>
            <p>Your cart is empty — the menu awaits.</p>
            <button className="btn btn-ghost" onClick={() => { setDrawerOpen(false); navigate("/menu"); }}>
              Browse the Menu
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((l) => (
                <li key={l.price_option_id} className="cart-line">
                  <div className="cart-line-info">
                    <span className="cart-line-name">
                      {l.item_name}
                      {l.price_label && (
                        <span className="plabel"> ({l.price_label})</span>
                      )}
                    </span>
                    <span className="cart-line-price">
                      {fmt(l.unit_price_cents * l.quantity)}
                    </span>
                  </div>
                  <div className="qty-stepper">
                    <button
                      onClick={() => setQty(l.price_option_id, l.quantity - 1)}
                      aria-label={`Remove one ${l.item_name}`}
                    >
                      −
                    </button>
                    <span>{l.quantity}</span>
                    <button
                      onClick={() => setQty(l.price_option_id, l.quantity + 1)}
                      aria-label={`Add one ${l.item_name}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-drawer-foot">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{fmt(subtotalCents)}</strong>
              </div>
              <p className="cart-tax-note">Tax calculated at checkout · pay at pickup or delivery</p>
              <button className="btn btn-primary btn-block" onClick={checkout}>
                Check Out
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
