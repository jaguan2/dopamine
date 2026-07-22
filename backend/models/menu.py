# models/menu.py
#
# CATEGORY / MENU_ITEM / PRICE_OPTION — the menu itself.
#
# Design notes:
# - CATEGORY.group_name is the top-level menu-page grouping ("Sushi Bar",
#   "Hibachi & Kitchen", ...); jp_label is the Japanese subtitle shown
#   beside the English name.
# - An item's price lives in PRICE_OPTION, one row per size/variant.
#   Most items have exactly one option with an empty label; items like
#   "Steamed Rice (L)/(S)" have two. Orders reference a PRICE_OPTION so
#   the chosen size is unambiguous.
# - Prices are stored in cents (Integer) to avoid float drift.
#
from config_db import db


class Category(db.Model):
    __tablename__ = "CATEGORY"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    jp_label   = db.Column(db.String(120))
    group_name = db.Column(db.String(120), nullable=False)
    group_jp   = db.Column(db.String(120))
    note       = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)

    items = db.relationship(
        "MenuItem", back_populates="category",
        order_by="MenuItem.sort_order", cascade="all, delete-orphan"
    )

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "jp": self.jp_label,
            "group": self.group_name,
            "group_jp": self.group_jp,
            "note": self.note,
            "items": [i.to_json() for i in self.items],
        }


class MenuItem(db.Model):
    __tablename__ = "MENU_ITEM"

    id          = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("CATEGORY.id"), nullable=False)
    name        = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    spicy       = db.Column(db.Boolean, default=False)
    available   = db.Column(db.Boolean, default=True)
    sort_order  = db.Column(db.Integer, default=0)

    category = db.relationship("Category", back_populates="items")
    prices = db.relationship(
        "PriceOption", back_populates="item",
        order_by="PriceOption.sort_order", cascade="all, delete-orphan"
    )

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "desc": self.description or "",
            "spicy": self.spicy,
            "available": self.available,
            "prices": [p.to_json() for p in self.prices],
        }


class PriceOption(db.Model):
    __tablename__ = "PRICE_OPTION"

    id          = db.Column(db.Integer, primary_key=True)
    item_id     = db.Column(db.Integer, db.ForeignKey("MENU_ITEM.id"), nullable=False)
    label       = db.Column(db.String(30), default="")   # "", "L", "S", ...
    price_cents = db.Column(db.Integer, nullable=False)
    sort_order  = db.Column(db.Integer, default=0)

    item = db.relationship("MenuItem", back_populates="prices")

    def to_json(self):
        return {
            "id": self.id,
            "label": self.label or "",
            "price_cents": self.price_cents,
        }
