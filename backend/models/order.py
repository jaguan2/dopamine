# models/order.py
#
# ORDER / ORDER_ITEM: customer orders (everything but payment).
#
# Design notes:
# - order_code is the short public handle (e.g. "OEC-7F3K9Q") customers use
#   to check status; the integer id stays internal.
# - Money amounts snapshot at order time (item_name, unit_price_cents) so
#   later menu edits never rewrite an existing order's history.
# - status flow: received -> confirmed -> ready -> completed, or cancelled.
# - All money is cents (Integer). Totals are computed server-side from
#   PRICE_OPTION rows; the client's displayed prices are never trusted.
#
from datetime import datetime, timezone
from config_db import db

ORDER_STATUSES = ["received", "confirmed", "ready", "completed", "cancelled"]

# The kitchen may only move an order forward one step, or cancel it before it
# is done. Without this a stray tap could send a completed order back to
# "received" and it would reappear in the open queue.
ALLOWED_TRANSITIONS = {
    "received":  {"confirmed", "cancelled"},
    "confirmed": {"ready", "cancelled"},
    "ready":     {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def can_transition(current, target):
    return target in ALLOWED_TRANSITIONS.get(current, set())


class Order(db.Model):
    __tablename__ = "ORDER"

    id             = db.Column(db.Integer, primary_key=True)
    order_code     = db.Column(db.String(20), unique=True, nullable=False)
    location_id    = db.Column(db.Integer, db.ForeignKey("LOCATION.id"), nullable=False)
    customer_name  = db.Column(db.String(120), nullable=False)
    phone          = db.Column(db.String(30), nullable=False)
    email          = db.Column(db.String(200))
    fulfillment    = db.Column(db.String(20), nullable=False)  # pickup | delivery
    address        = db.Column(db.Text)                        # delivery only
    notes          = db.Column(db.Text)
    status         = db.Column(db.String(20), default="received", nullable=False)
    subtotal_cents = db.Column(db.Integer, nullable=False)
    tax_cents      = db.Column(db.Integer, nullable=False)
    total_cents    = db.Column(db.Integer, nullable=False)
    created_at     = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    location = db.relationship("Location", back_populates="orders")
    items = db.relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )

    def to_json(self, include_contact=False):
        out = {
            "order_code": self.order_code,
            "location": self.location.name if self.location else None,
            "location_id": self.location_id,
            "fulfillment": self.fulfillment,
            "status": self.status,
            "notes": self.notes,
            "subtotal_cents": self.subtotal_cents,
            "tax_cents": self.tax_cents,
            "total_cents": self.total_cents,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "items": [i.to_json() for i in self.items],
        }
        # Contact details only go to the kitchen dashboard, not the public
        # status endpoint.
        if include_contact:
            out.update({
                "id": self.id,
                "customer_name": self.customer_name,
                "phone": self.phone,
                "email": self.email,
                "address": self.address,
            })
        return out


class OrderItem(db.Model):
    __tablename__ = "ORDER_ITEM"

    id               = db.Column(db.Integer, primary_key=True)
    order_id         = db.Column(db.Integer, db.ForeignKey("ORDER.id"), nullable=False)
    price_option_id  = db.Column(db.Integer, db.ForeignKey("PRICE_OPTION.id"))
    item_name        = db.Column(db.String(220), nullable=False)  # snapshot
    price_label      = db.Column(db.String(30), default="")       # snapshot ("L", "S", "")
    unit_price_cents = db.Column(db.Integer, nullable=False)      # snapshot
    quantity         = db.Column(db.Integer, nullable=False, default=1)
    instructions     = db.Column(db.Text)

    order = db.relationship("Order", back_populates="items")

    def to_json(self):
        return {
            "item_name": self.item_name,
            "price_label": self.price_label or "",
            "unit_price_cents": self.unit_price_cents,
            "quantity": self.quantity,
            "instructions": self.instructions or "",
            "line_total_cents": self.unit_price_cents * self.quantity,
        }
