# ── Imports ─────────────────────────────────────────────────────
import os
import logging

from config_db import app, db
import models  # noqa: F401  (registers all tables on the metadata)
from routes.menu_routes import menu_bp
from routes.order_routes import order_bp

# ── Blueprints ──────────────────────────────────────────────────
app.register_blueprint(menu_bp)
app.register_blueprint(order_bp)

# ── Logging ─────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)


@app.route("/api/health")
def health():
    return {"status": "ok"}


# ── Entrypoint ──────────────────────────────────────────────────
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )
