# Dopamine: O.E.C. Japanese restaurant site (full-stack)

Website and online ordering (everything but payment) for **O.E.C. Japanese
Express**, 2438 66th St North, St. Petersburg, FL 33710 · 727-345-4088.
Single location. Do not add or reference the former Largo location.

The project name comes from the Korean *dopamine site* idea: a storefront
people browse and fill a cart on without ever checking out. Omitting payment
is the concept, not an unfinished feature. Keep the rest of the flow real.

**Never use em dashes** in code, comments, docs or UI copy. Use a colon,
semicolon, comma, period or parentheses instead. En dashes are fine in ranges
(`Sun – Thu`, `Mon–Sat`).

## Stack

- `backend/`: Flask + SQLAlchemy (mirrors the DTL/deftechdash conventions).
  `config_db.py` builds the app/db, `main.py` registers blueprints,
  one model per file in `models/`, blueprints named `*_bp` in
  `routes/*_routes.py` under the `/api` prefix, `to_json()` on models.
  SQLite by default (`backend/oec.db`); set `SQLALCHEMY_DATABASE_URI` for
  Postgres.
- `frontend/`: Vite + React 19 (JSX, not TS), react-router-dom v7, axios.
  **No MUI.** The hand-rolled design system in `src/styles/site.css` is the
  point of the site; extend it, don't replace it.

## Design and voice

Reference point: sushi-masaki-saito style restraint. Washi paper, sumi ink,
hairline rules, Mincho display type, wide negative space.

- **Restraint over decoration.** Vermilion (`--shu`) is an accent for small
  marks only, never a large fill. No pattern bands, no drop shadows on type,
  no boxed cards; separate things with 1px hairlines instead.
- Nav and chips are **lowercase with wide tracking**. Display type is
  weight 500, not bold. Prefer smaller type and more space.
- Grids draw hairlines **on the cells** (`border-right`/`border-bottom`), not
  as a coloured backdrop behind `gap: 1px`. A backdrop turns the empty cell
  of a short final row into a filled block.
- **Copy is factual and plain.** State what a thing is, what it costs, and
  when it is available. No sales adjectives ("sizzling", "hot off the
  hibachi"), no slogans ("Come hungry, leave happy"), no jokes in error
  states. Jason rejected that register explicitly.

## Commands

- Backend: `cd backend && venv/Scripts/python main.py` (port 5000);
  seed with `venv/Scripts/python scripts/seed.py` (idempotent and safe to
  rerun: orders survive, menu is wiped and reloaded from
  `scripts/menu_seed.json`).
- Tests: `cd backend && venv/Scripts/python -m pytest` (20 API-contract tests
  in `tests/`; uses a throwaway SQLite DB, never touches `oec.db`).
- Frontend: `cd frontend && npm run dev` (port 5173, proxies `/api` to 5000).

## Domain rules

- All money is **cents (int)** end to end; format only at render time.
- Order totals are computed server-side from `PRICE_OPTION` rows. Never
  trust client prices. Orders snapshot item name/price at purchase time.
- Order status flow: received → confirmed → ready → completed, or cancelled
  from any non-terminal state. Enforced by `ALLOWED_TRANSITIONS` in
  `models/order.py`; an illegal jump returns 409, not 400.
- Order codes rely on the DB unique constraint, not a pre-check, because a
  prior SELECT races. `_commit_with_unique_code()` retries on IntegrityError.
- `POST /api/orders` is rate limited (10/min per IP) by `utils/rate_limit.py`,
  an in-process limiter. Move it to Redis if the app ever runs multi-worker,
  and add werkzeug's ProxyFix if it sits behind a proxy.
- React Router needs a catch-all `*` route: the dev server and any static host
  serve index.html for every path, so a missing route renders a bare
  header + footer with an empty `<main>`.
- Delivery: $15.00 minimum pre-tax; tax = 7% (FL 6% + Pinellas 1%).
- Kitchen dashboard auth is a shared key (`KITCHEN_KEY`, header
  `X-Kitchen-Key`), deliberately simple, with no user accounts.
- Menu data source of truth is `backend/scripts/menupages_menu.json`, OEC's
  official online-ordering feed (Grubhub id 560075), captured July 2026.
  `scripts/build_seed.py` maps it into `menu_seed.json` (groups, JP labels,
  name cleanup, spicy flags) and appends two in-store-only categories (Poke
  Bowl, Sake). Online prices intentionally sit slightly above the printed
  in-store menu. Edit build_seed.py, then rerun it and seed.py to change
  menu data.
- The site is deliberately **photo-free** (typographic washi/sumi design) at
  Jason's request. No third-party photos. Only owner-provided originals
  should ever be added.
