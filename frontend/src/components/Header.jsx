import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count, setDrawerOpen } = useCart();

  const navClass = ({ isActive }) => (isActive ? "active-link" : undefined);

  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" to="/">
          <img className="brand-seal" src="/assets/seal.svg" alt="O.E.C. seal" />
          <span className="brand-text">
            <span className="brand-name">O.E.C.</span><br />
            <span className="brand-sub">Japanese Express</span>
          </span>
        </Link>
        <div className="header-actions">
          <button
            className="cart-button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open cart, ${count} items`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h2l2.4 11.2a1 1 0 0 0 1 .8h7.9a1 1 0 0 0 1-.8L20 9H7" />
              <circle cx="10.5" cy="20.5" r="1.4" />
              <circle cx="17" cy="20.5" r="1.4" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M1 1h20M1 8h20M1 15h20" />
            </svg>
          </button>
        </div>
        <nav
          className={"site-nav" + (open ? " open" : "")}
          aria-label="Main"
          onClick={(e) => { if (e.target.tagName === "A") setOpen(false); }}
        >
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/menu" className={navClass}>Menu</NavLink>
          <Link to="/#location">Visit</Link>
          <Link className="nav-cta" to="/menu">Order Online</Link>
        </nav>
      </div>
    </header>
  );
}
