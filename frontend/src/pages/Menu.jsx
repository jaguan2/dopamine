import { useEffect, useMemo, useRef, useState } from "react";
import api from "../lib/api.js";
import { useCart } from "../contexts/CartContext.jsx";
import { fmt } from "../lib/money.js";

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function AddButton({ item, price }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handle() {
    add(price.id, item.name, price.label, price.price_cents);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <button
      className={"add-btn" + (added ? " added" : "")}
      onClick={handle}
      aria-label={`Add ${item.name}${price.label ? ` (${price.label})` : ""} to cart`}
    >
      {added ? "✓" : "+"}{" "}
      {price.label && <span className="plabel">({price.label})</span>}{" "}
      {fmt(price.price_cents)}
    </button>
  );
}

function MenuItemRow({ item }) {
  return (
    <div className="menu-item">
      <div className="menu-item-row">
        <span className="menu-item-name">
          {item.name}
          {item.spicy && (
            <span className="spicy" title="Spicy" aria-label="Spicy">🌶</span>
          )}
        </span>
        <span className="leader" aria-hidden="true" />
        <span className="menu-item-actions">
          {item.prices.map((p) => (
            <AddButton key={p.id} item={item} price={p} />
          ))}
        </span>
      </div>
      {item.desc && <p className="menu-item-desc">{item.desc}</p>}
    </div>
  );
}

export default function Menu() {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    api.get("/menu")
      .then((res) => setMenu(res.data))
      .catch(() => setError(true));
  }, []);

  // Group categories preserving server order.
  const groups = useMemo(() => {
    if (!menu) return [];
    const out = [];
    const byName = {};
    for (const cat of menu) {
      if (!byName[cat.group]) {
        byName[cat.group] = { name: cat.group, jp: cat.group_jp, cats: [] };
        out.push(byName[cat.group]);
      }
      byName[cat.group].cats.push(cat);
    }
    return out;
  }, [menu]);

  // Search filter: keep an item if name/desc/category matches.
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        cats: g.cats
          .map((c) => ({
            ...c,
            items: c.items.filter((i) =>
              (i.name + " " + i.desc + " " + c.name).toLowerCase().includes(q)
            ),
          }))
          .filter((c) => c.items.length),
      }))
      .filter((g) => g.cats.length);
  }, [groups, q]);

  // Scrollspy for the rail.
  useEffect(() => {
    if (!menu) return;
    const sections = contentRef.current?.querySelectorAll(".menu-category");
    if (!sections?.length) return;
    const spy = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setActiveCat(en.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, [menu, q]);

  // Honor a #hash target once the menu has rendered.
  useEffect(() => {
    if (!menu) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const jump = () => document.getElementById(hash)?.scrollIntoView();
    jump();
    // Display fonts land after first paint and reflow the list, which drags
    // the target out from under the viewport — re-anchor once they're in.
    document.fonts?.ready.then(jump);
  }, [menu]);

  const totalItems = menu ? menu.reduce((n, c) => n + c.items.length, 0) : 0;

  // The rail tracks the visible category; the chips track its parent group.
  const activeGroup = useMemo(() => {
    if (!activeCat || !menu) return null;
    const cat = menu.find((c) => `cat-${slug(c.name)}` === activeCat);
    return cat ? cat.group : null;
  }, [activeCat, menu]);

  return (
    <main>
      <section className="menu-hero">
        <div className="wrap">
          <p className="jp-title" lang="ja">お品書き</p>
          <h1>The Menu</h1>
          <p>
            {totalItems || "Over 280"} dishes, one standard: made when you
            order it. Add to your cart and pay at pickup or delivery — no card
            needed online.
          </p>
        </div>
        <div
          className="seigaiha-band"
          style={{ backgroundImage: "url('/assets/seigaiha.svg')" }}
          aria-hidden="true"
        />
      </section>

      <div className="menu-toolbar">
        <div className="wrap">
          <div className="menu-search">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
              stroke="currentColor" strokeWidth="1.8">
              <circle cx="6.5" cy="6.5" r="5" />
              <path d="M10.5 10.5 L14 14" />
            </svg>
            <input
              type="search"
              placeholder={`Search ${totalItems || ""} dishes… (e.g. dragon, katsu, eel)`}
              aria-label="Search the menu"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <nav className="group-chips" aria-label="Menu sections">
            {groups.map((g) => (
              <a
                key={g.name}
                href={`#group-${slug(g.name)}`}
                className={activeGroup === g.name ? "active" : undefined}
                aria-current={activeGroup === g.name ? "true" : undefined}
              >
                {g.name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="wrap menu-layout">
        <nav className="menu-rail" aria-label="Menu categories">
          {groups.map((g) => (
            <div key={g.name}>
              <h3>{g.name}</h3>
              {g.cats.map((c) => {
                const id = `cat-${slug(c.name)}`;
                return (
                  <a
                    key={c.id}
                    href={`#${id}`}
                    className={activeCat === id ? "active" : undefined}
                  >
                    {c.name}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <div ref={contentRef}>
          {error && (
            <div className="menu-empty" style={{ display: "block" }}>
              <span className="jp" lang="ja">申し訳ありません</span>
              The menu could not be loaded. Is the kitchen (API) running?
            </div>
          )}
          {!menu && !error && (
            <div className="menu-empty" style={{ display: "block" }}>
              <span className="jp" lang="ja">少々お待ちください</span>
              Setting the table…
            </div>
          )}

          {filtered.map((g) => (
            <div key={g.name}>
              <h2 className="menu-group-title" id={`group-${slug(g.name)}`}>
                {g.name}
                <span className="jp" lang="ja">{g.jp}</span>
              </h2>
              {g.cats.map((c) => (
                <section
                  key={c.id}
                  className="menu-category"
                  id={`cat-${slug(c.name)}`}
                >
                  <div className="menu-category-head">
                    <h3>{c.name}</h3>
                    <span className="jp" lang="ja">{c.jp}</span>
                  </div>
                  {c.note && <p className="menu-category-note">{c.note}</p>}
                  <div className="menu-items">
                    {c.items.map((i) => (
                      <MenuItemRow key={i.id} item={i} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ))}

          {menu && q && filtered.length === 0 && (
            <div className="menu-empty" style={{ display: "block" }}>
              <span className="jp" lang="ja">見つかりません</span>
              No dishes match your search — try another word, or clear the search.
            </div>
          )}

          {menu && (
            <p className="menu-disclaimer">
              Prices shown are current online-menu prices. Consuming raw or
              undercooked meats, poultry, seafood, shellfish or eggs may
              increase your risk of foodborne illness. Please tell us about
              any food allergies in the order notes.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
