import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { fmt } from "../lib/money.js";
import CartLine from "./CartLine.jsx";

export default function CartDrawer() {
  const { lines, subtotalCents, drawerOpen, setDrawerOpen } = useCart();
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
            <p>Your cart is empty. The menu awaits.</p>
            <button className="btn btn-ghost" onClick={() => { setDrawerOpen(false); navigate("/menu"); }}>
              Browse the Menu
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((l) => (
                <CartLine key={l.price_option_id} line={l} />
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
