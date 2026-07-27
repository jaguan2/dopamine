import os
import tempfile

import pytest

# Point the app at a throwaway database BEFORE config_db is imported.
_tmpdir = tempfile.mkdtemp(prefix="oec-test-")
os.environ["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
    _tmpdir, "test.db"
).replace("\\", "/")
os.environ["KITCHEN_KEY"] = "test-key"

from config_db import app, db          # noqa: E402
import models                          # noqa: E402, F401
import main                            # noqa: E402, F401  (registers blueprints)
from models.location import Location   # noqa: E402
from models.menu import Category, MenuItem, PriceOption  # noqa: E402


@pytest.fixture(autouse=True)
def _clear_rate_limits():
    """Rate-limit counters are process-global; don't let tests bleed together."""
    from utils.rate_limit import limiter
    limiter.reset()
    yield


@pytest.fixture(scope="session")
def client():
    app.config["TESTING"] = True
    with app.app_context():
        db.create_all()
        loc = Location(
            slug="st-pete", name="O.E.C. Japanese Express",
            street="2438 66th St North", city="St. Petersburg",
            state="FL", postal_code="33710", phone="727-345-4088",
            hours_json="[]", accepts_delivery=True,
        )
        cat = Category(name="Appetizer", jp_label="前菜",
                       group_name="Starters & Soups", group_jp="前菜・汁物",
                       sort_order=0)
        edamame = MenuItem(category=cat, name="Edamame", sort_order=0)
        rice = MenuItem(category=cat, name="Steamed Rice", sort_order=1)
        gone = MenuItem(category=cat, name="Seasonal Special",
                        available=False, sort_order=2)
        db.session.add_all([
            loc, cat, edamame, rice, gone,
            PriceOption(item=edamame, label="", price_cents=575),
            PriceOption(item=rice, label="S", price_cents=250),
            PriceOption(item=rice, label="L", price_cents=375),
            PriceOption(item=gone, label="", price_cents=999),
        ])
        db.session.commit()
    with app.test_client() as c:
        yield c
