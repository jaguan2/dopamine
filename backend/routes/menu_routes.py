from flask import Blueprint, jsonify, current_app
from models.location import Location
from models.menu import Category

menu_bp = Blueprint("menu", __name__, url_prefix="/api")


@menu_bp.route("/locations", methods=["GET"])
def get_locations():
    """
    Get both restaurant locations with hours and contact info.
    GET /api/locations

    Public reference data — no authentication required.
    """
    try:
        locations = Location.query.order_by(Location.id).all()
        return jsonify([l.to_json() for l in locations]), 200
    except Exception:
        current_app.logger.exception("Failed to load locations")
        return jsonify(error="Failed to load locations."), 500


@menu_bp.route("/menu", methods=["GET"])
def get_menu():
    """
    Get the full menu in one payload: every category (with its group,
    Japanese labels and note) and every item with its price options.
    GET /api/menu

    The menu is small enough (~280 items) that one request beats
    per-category fetching; the frontend renders and filters client-side.
    """
    try:
        cats = Category.query.order_by(Category.sort_order).all()
        return jsonify([c.to_json() for c in cats]), 200
    except Exception:
        current_app.logger.exception("Failed to load menu")
        return jsonify(error="Failed to load menu."), 500
