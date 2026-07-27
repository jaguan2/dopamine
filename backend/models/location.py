# models/location.py
#
# LOCATION: restaurant location(s). Currently one row (St. Petersburg);
# kept as a table so a second location is a seed entry, not a migration.
#
# Design notes:
# - hours_json holds the display schedule as a JSON list of {days, hours}
#   rows rather than normalized columns; the site only ever renders it.
# - accepts_delivery: St. Pete delivers ($15 min, pre-tax).
# - legacy_order_url points at the location's existing third-party ordering
#   page (dine.online) so the site can fall back to it.
#
import json
from config_db import db


class Location(db.Model):
    __tablename__ = "LOCATION"

    id               = db.Column(db.Integer, primary_key=True)
    slug             = db.Column(db.String(50), unique=True, nullable=False)
    name             = db.Column(db.String(120), nullable=False)
    tagline          = db.Column(db.String(200))
    street           = db.Column(db.String(200))
    city             = db.Column(db.String(100))
    state            = db.Column(db.String(20))
    postal_code      = db.Column(db.String(20))
    phone            = db.Column(db.String(30))
    hours_json       = db.Column(db.Text)          # [{"days": "...", "hours": "..."}]
    accepts_delivery = db.Column(db.Boolean, default=False)
    legacy_order_url = db.Column(db.Text)
    note             = db.Column(db.Text)

    orders = db.relationship("Order", back_populates="location")

    def to_json(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "name": self.name,
            "tagline": self.tagline,
            "street": self.street,
            "city": self.city,
            "state": self.state,
            "postal_code": self.postal_code,
            "phone": self.phone,
            "hours": json.loads(self.hours_json) if self.hours_json else [],
            "accepts_delivery": self.accepts_delivery,
            "legacy_order_url": self.legacy_order_url,
            "note": self.note,
        }
