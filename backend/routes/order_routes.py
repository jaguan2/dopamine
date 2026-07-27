import random
import string

from flask import Blueprint, jsonify, request, current_app
from sqlalchemy.exc import IntegrityError

from config_db import db, TAX_RATE, DELIVERY_MINIMUM, KITCHEN_KEY
from models.location import Location
from models.menu import PriceOption
from models.order import Order, OrderItem, ORDER_STATUSES, can_transition
from utils.rate_limit import rate_limit

order_bp = Blueprint("orders", __name__, url_prefix="/api")

MAX_QTY_PER_LINE = 20
MAX_LINES = 60
CODE_ATTEMPTS = 5


def _new_order_code():
    """Short, unambiguous public code like OEC-7F3K9Q (no 0/O/1/I)."""
    alphabet = "".join(c for c in string.ascii_uppercase + string.digits
                       if c not in "0O1I")
    return "OEC-" + "".join(random.choices(alphabet, k=6))


def _commit_with_unique_code(build_order):
    """
    Persist an order, regenerating its public code if one collides.

    The uniqueness check has to be the database constraint, not a prior
    SELECT: two concurrent orders can both find a code free and then race to
    insert it. `build_order(code)` re-creates the ORM objects each attempt
    because a rolled-back session detaches them.
    """
    for _ in range(CODE_ATTEMPTS):
        order = build_order(_new_order_code())
        db.session.add(order)
        try:
            db.session.commit()
            return order
        except IntegrityError:
            db.session.rollback()
    raise RuntimeError("could not allocate a unique order code")


def _kitchen_authorized():
    return request.headers.get("X-Kitchen-Key") == KITCHEN_KEY


@order_bp.route("/orders", methods=["POST"])
@rate_limit(10, 60, "create_order",
            message="Too many orders from this device — please wait a minute "
                    "or call us at 727-345-4088.")
def create_order():
    """
    Place an order (no payment — settled at pickup/delivery).
    POST /api/orders
    {
      "location_id": 1,
      "fulfillment": "pickup" | "delivery",
      "customer": {"name": "...", "phone": "...", "email": "..."},
      "address": "...",            # required for delivery
      "notes": "...",
      "items": [{"price_option_id": 12, "quantity": 2, "instructions": ""}]
    }

    All prices come from PRICE_OPTION rows server-side; the client's
    displayed prices are never trusted. Returns 201 with the public order.
    """
    data = request.get_json(silent=True) or {}
    try:
        location = db.session.get(Location, data.get("location_id"))
        if not location:
            return jsonify(error="Choose a valid location."), 400

        fulfillment = data.get("fulfillment")
        if fulfillment not in ("pickup", "delivery"):
            return jsonify(error="Fulfillment must be pickup or delivery."), 400
        if fulfillment == "delivery" and not location.accepts_delivery:
            return jsonify(error=f"{location.name} does not offer delivery."), 400

        customer = data.get("customer") or {}
        name = (customer.get("name") or "").strip()
        phone = (customer.get("phone") or "").strip()
        if not name or not phone:
            return jsonify(error="Name and phone number are required."), 400

        address = (data.get("address") or "").strip()
        if fulfillment == "delivery" and not address:
            return jsonify(error="Delivery orders need an address."), 400

        raw_items = data.get("items") or []
        if not raw_items:
            return jsonify(error="Your cart is empty."), 400
        if len(raw_items) > MAX_LINES:
            return jsonify(error="Too many lines in one order."), 400

        # Resolve every line against the database first — prices, names and
        # availability all come from PRICE_OPTION, never from the client.
        line_specs = []
        subtotal = 0
        for raw in raw_items:
            po = db.session.get(PriceOption, raw.get("price_option_id"))
            if not po or not po.item.available:
                return jsonify(error="An item in your cart is no longer available."), 400
            qty = raw.get("quantity")
            if not isinstance(qty, int) or qty < 1 or qty > MAX_QTY_PER_LINE:
                return jsonify(error="Invalid quantity."), 400
            subtotal += po.price_cents * qty
            line_specs.append(dict(
                price_option_id=po.id,
                item_name=po.item.name,
                price_label=po.label or "",
                unit_price_cents=po.price_cents,
                quantity=qty,
                instructions=(raw.get("instructions") or "").strip()[:300] or None,
            ))

        if fulfillment == "delivery" and subtotal < int(DELIVERY_MINIMUM * 100):
            return jsonify(
                error=f"Delivery orders have a ${DELIVERY_MINIMUM:.2f} minimum (before tax)."
            ), 400

        tax = round(subtotal * TAX_RATE)

        def build_order(code):
            return Order(
                order_code=code,
                location_id=location.id,
                customer_name=name[:120],
                phone=phone[:30],
                email=(customer.get("email") or "").strip()[:200] or None,
                fulfillment=fulfillment,
                address=address or None,
                notes=(data.get("notes") or "").strip()[:500] or None,
                subtotal_cents=subtotal,
                tax_cents=tax,
                total_cents=subtotal + tax,
                items=[OrderItem(**spec) for spec in line_specs],
            )

        order = _commit_with_unique_code(build_order)
        return jsonify(order.to_json()), 201
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to create order")
        return jsonify(error="Failed to place the order."), 500


@order_bp.route("/orders/<order_code>", methods=["GET"])
def get_order(order_code):
    """
    Public order status lookup by code (no contact details in response).
    GET /api/orders/OEC-XXXXXX
    """
    try:
        order = Order.query.filter_by(order_code=order_code.upper()).first()
        if not order:
            return jsonify(error="Order not found."), 404
        return jsonify(order.to_json()), 200
    except Exception:
        current_app.logger.exception("Failed to load order")
        return jsonify(error="Failed to load order."), 500


@order_bp.route("/kitchen/orders", methods=["GET"])
def kitchen_orders():
    """
    Kitchen dashboard: all open (non-completed) orders, oldest first,
    with customer contact details. Requires X-Kitchen-Key header.
    GET /api/kitchen/orders?all=1 to include completed/cancelled.
    """
    if not _kitchen_authorized():
        return jsonify(error="Unauthorized."), 401
    try:
        q = Order.query
        if request.args.get("all") != "1":
            q = q.filter(Order.status.in_(["received", "confirmed", "ready"]))
        orders = q.order_by(Order.created_at.asc()).all()
        return jsonify([o.to_json(include_contact=True) for o in orders]), 200
    except Exception:
        current_app.logger.exception("Failed to load kitchen orders")
        return jsonify(error="Failed to load orders."), 500


@order_bp.route("/kitchen/orders/<int:order_id>/status", methods=["PATCH"])
def update_status(order_id):
    """
    Kitchen dashboard: advance/cancel an order.
    PATCH /api/kitchen/orders/<id>/status  {"status": "confirmed"}
    Requires X-Kitchen-Key header.
    """
    if not _kitchen_authorized():
        return jsonify(error="Unauthorized."), 401
    try:
        order = db.session.get(Order, order_id)
        if not order:
            return jsonify(error="Order not found."), 404
        status = (request.get_json(silent=True) or {}).get("status")
        if status not in ORDER_STATUSES:
            return jsonify(error="Invalid status."), 400
        if status == order.status:
            return jsonify(order.to_json(include_contact=True)), 200
        if not can_transition(order.status, status):
            return jsonify(
                error=f"Cannot move a {order.status} order to {status}."
            ), 409
        order.status = status
        db.session.commit()
        return jsonify(order.to_json(include_contact=True)), 200
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to update order status")
        return jsonify(error="Failed to update status."), 500
