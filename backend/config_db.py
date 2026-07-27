import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# ── 0) Load environment variables ─────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ── 1) Create the single Flask app ────────────────────────────────────────────
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

# ── 2) Configure SQLAlchemy / DB Config ───────────────────────────────────────
# Defaults to a local SQLite file so the project runs with zero setup;
# point SQLALCHEMY_DATABASE_URI at Postgres for a shared deployment.
_default_sqlite = "sqlite:///" + os.path.join(
    os.path.dirname(__file__), "oec.db"
).replace("\\", "/")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "SQLALCHEMY_DATABASE_URI", _default_sqlite
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# ── 3) Store-wide constants ───────────────────────────────────────────────────
# Florida state sales tax (6%) + Pinellas County surtax (1%).
TAX_RATE = float(os.getenv("TAX_RATE", "0.07"))
# Delivery minimum enforced by the restaurant (pre-tax).
DELIVERY_MINIMUM = float(os.getenv("DELIVERY_MINIMUM", "15.00"))
# Shared secret for the kitchen dashboard endpoints (no full auth system:
# staff enter this key once in the kitchen view).
KITCHEN_KEY = os.getenv("KITCHEN_KEY", "oec-kitchen")
