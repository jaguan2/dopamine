# scripts/seed.py
#
# Seed the database from menu_seed.json (parsed from the restaurant's live
# online menu, July 2026) plus the two location records.
#
# Idempotent: wipes and reloads menu + location tables. Orders are preserved
# (order items snapshot their name/price, so reseeding the menu never
# corrupts an existing order).
#
# Run from backend/:  python scripts/seed.py
#
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config_db import app, db          # noqa: E402
import models                          # noqa: E402, F401
from models.location import Location   # noqa: E402
from models.menu import Category, MenuItem, PriceOption  # noqa: E402

GROUP_JP = {
    "Starters & Soups": "前菜・汁物",
    "Sushi Bar": "寿司",
    "Hibachi & Kitchen": "鉄板・台所",
    "Bento & Lunch": "弁当・ランチ",
    "Drinks & Sides": "飲物・お供",
}

LOCATIONS = [
    dict(
        slug="st-pete",
        name="O.E.C. Japanese Express",
        tagline="St. Petersburg — call in · take out · dine in",
        street="2438 66th St North",
        city="St. Petersburg", state="FL", postal_code="33710",
        phone="727-345-4088",
        hours_json=json.dumps([
            {"days": "Sun – Thu", "hours": "10:30 am – 9:30 pm"},
            {"days": "Fri & Sat", "hours": "10:30 am – 10:30 pm"},
            {"days": "Tuesday", "hours": "Closed"},
        ]),
        accepts_delivery=True,
        legacy_order_url="https://oecjapaneseexpress.dine.online/locations/560075?fulfillment=pickup",
        note="We deliver — $15.00 minimum, pre-tax.",
    ),
]


def run():
    seed_path = os.path.join(os.path.dirname(__file__), "menu_seed.json")
    with open(seed_path, encoding="utf-8") as f:
        cats = json.load(f)

    with app.app_context():
        db.create_all()

        PriceOption.query.delete()
        MenuItem.query.delete()
        Category.query.delete()
        Location.query.delete()

        for loc in LOCATIONS:
            db.session.add(Location(**loc))

        n_items = n_prices = 0
        for order, cat in enumerate(cats):
            c = Category(
                name=cat["category"],
                jp_label=cat.get("jp"),
                group_name=cat["group"],
                group_jp=GROUP_JP.get(cat["group"], ""),
                note=cat.get("note") or None,
                sort_order=order,
            )
            db.session.add(c)
            for i_order, it in enumerate(cat["items"]):
                item = MenuItem(
                    category=c,
                    name=it["name"],
                    description=it.get("desc") or None,
                    spicy=bool(it.get("spicy")),
                    sort_order=i_order,
                )
                db.session.add(item)
                n_items += 1
                for p_order, p in enumerate(it["prices"]):
                    db.session.add(PriceOption(
                        item=item,
                        label=p.get("label") or "",
                        price_cents=round(float(p["amount"]) * 100),
                        sort_order=p_order,
                    ))
                    n_prices += 1

        db.session.commit()
        print(f"Seeded {len(LOCATIONS)} locations, {len(cats)} categories, "
              f"{n_items} items, {n_prices} price options.")


if __name__ == "__main__":
    run()
