# OEC — Japanese restaurant site (full-stack)

Website + online ordering (everything but payment) for **O.E.C. Japanese
Express**, 2438 66th St North, St. Petersburg, FL 33710 · 727-345-4088.
Single location — do not add or reference the former Largo location.

## Stack

- `backend/` — Flask + SQLAlchemy (mirrors the DTL/deftechdash conventions):
  `config_db.py` builds the app/db, `main.py` registers blueprints,
  one model per file in `models/`, blueprints named `*_bp` in
  `routes/*_routes.py` under the `/api` prefix, `to_json()` on models.
  SQLite by default (`backend/oec.db`); set `SQLALCHEMY_DATABASE_URI` for
  Postgres.
- `frontend/` — Vite + React 19 (JSX, not TS), react-router-dom v7, axios.
  **No MUI** — the hand-rolled washi/sumi/vermilion design system in
  `src/styles/site.css` is the point of the site; extend it, don't replace it.

## Commands

- Backend: `cd backend && venv/Scripts/python main.py` (port 5000);
  seed with `venv/Scripts/python scripts/seed.py` (idempotent; safe to rerun —
  orders survive, menu is wiped and reloaded from `scripts/menu_seed.json`).
- Tests: `cd backend && venv/Scripts/python -m pytest` (12 API-contract tests
  in `tests/`; uses a throwaway SQLite DB, never touches `oec.db`).
- Frontend: `cd frontend && npm run dev` (port 5173, proxies `/api` to 5000).

## Domain rules

- All money is **cents (int)** end to end; format only at render time.
- Order totals are computed server-side from `PRICE_OPTION` rows — never
  trust client prices. Orders snapshot item name/price at purchase time.
- Order status flow: received → confirmed → ready → completed | cancelled.
- Delivery: $15.00 minimum pre-tax; tax = 7% (FL 6% + Pinellas 1%).
- Kitchen dashboard auth is a shared key (`KITCHEN_KEY`, header
  `X-Kitchen-Key`) — deliberately simple, no user accounts.
- Menu data source of truth is `backend/scripts/menupages_menu.json` — OEC's
  official online-ordering feed (Grubhub id 560075), captured July 2026.
  `scripts/build_seed.py` maps it into `menu_seed.json` (groups, JP labels,
  name cleanup, spicy flags) and appends two in-store-only categories (Poke
  Bowl, Sake). Online prices intentionally sit slightly above the printed
  in-store menu. Edit build_seed.py, rerun it + seed.py to change menu data.
- The site is deliberately **photo-free** (typographic washi/sumi design) at
  Jason's request — no third-party photos. Only owner-provided originals
  should ever be added.
