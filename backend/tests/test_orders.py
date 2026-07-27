# API contract tests for the ordering flow.
# Run from backend/:  venv/Scripts/python -m pytest

KEY = {"X-Kitchen-Key": "test-key"}


def _order_payload(**over):
    base = {
        "location_id": 1,
        "fulfillment": "pickup",
        "customer": {"name": "Test Customer", "phone": "727-555-0101"},
        "items": [{"price_option_id": 1, "quantity": 2}],
    }
    base.update(over)
    return base


def test_health(client):
    assert client.get("/api/health").json == {"status": "ok"}


def test_menu_and_locations(client):
    menu = client.get("/api/menu").json
    assert menu[0]["name"] == "Appetizer"
    names = [i["name"] for i in menu[0]["items"]]
    assert "Edamame" in names
    locs = client.get("/api/locations").json
    assert locs[0]["slug"] == "st-pete"


def test_create_order_prices_come_from_server(client):
    res = client.post("/api/orders", json=_order_payload())
    assert res.status_code == 201
    body = res.json
    assert body["order_code"].startswith("OEC-")
    assert body["subtotal_cents"] == 2 * 575
    assert body["tax_cents"] == round(2 * 575 * 0.07)
    assert body["total_cents"] == body["subtotal_cents"] + body["tax_cents"]
    assert body["status"] == "received"
    # snapshot fields present
    assert body["items"][0]["item_name"] == "Edamame"
    assert body["items"][0]["unit_price_cents"] == 575


def test_size_variant_is_priced_by_option(client):
    res = client.post("/api/orders", json=_order_payload(
        items=[{"price_option_id": 3, "quantity": 1}]))  # Steamed Rice (L)
    assert res.status_code == 201
    item = res.json["items"][0]
    assert item["price_label"] == "L"
    assert item["unit_price_cents"] == 375


def test_delivery_below_minimum_rejected(client):
    res = client.post("/api/orders", json=_order_payload(
        fulfillment="delivery", address="1 Main St"))
    assert res.status_code == 400
    assert "minimum" in res.json["error"]


def test_delivery_needs_address(client):
    res = client.post("/api/orders", json=_order_payload(
        fulfillment="delivery",
        items=[{"price_option_id": 1, "quantity": 5}]))
    assert res.status_code == 400
    assert "address" in res.json["error"].lower()


def test_invalid_quantity_rejected(client):
    for qty in (0, -1, 21, "2"):
        res = client.post("/api/orders", json=_order_payload(
            items=[{"price_option_id": 1, "quantity": qty}]))
        assert res.status_code == 400


def test_unknown_price_option_rejected(client):
    res = client.post("/api/orders", json=_order_payload(
        items=[{"price_option_id": 9999, "quantity": 1}]))
    assert res.status_code == 400


def test_unavailable_item_rejected(client):
    res = client.post("/api/orders", json=_order_payload(
        items=[{"price_option_id": 4, "quantity": 1}]))  # Seasonal Special
    assert res.status_code == 400


def test_public_lookup_hides_contact_details(client):
    code = client.post("/api/orders", json=_order_payload()).json["order_code"]
    body = client.get(f"/api/orders/{code}").json
    assert body["order_code"] == code
    for private in ("customer_name", "phone", "email", "address", "id"):
        assert private not in body


def test_kitchen_requires_key(client):
    assert client.get("/api/kitchen/orders").status_code == 401
    assert client.get("/api/kitchen/orders", headers=KEY).status_code == 200


def _place(client, **over):
    """Place an order and return its kitchen-side id."""
    code = client.post("/api/orders", json=_order_payload(**over)).json["order_code"]
    orders = client.get("/api/kitchen/orders?all=1", headers=KEY).json
    return next(o["id"] for o in orders if o["order_code"] == code)


def test_kitchen_status_flow(client):
    oid = _place(client)
    for step in ("confirmed", "ready", "completed"):
        res = client.patch(f"/api/kitchen/orders/{oid}/status",
                           json={"status": step}, headers=KEY)
        assert res.status_code == 200, res.json
        assert res.json["status"] == step

    open_ids = [o["id"] for o in
                client.get("/api/kitchen/orders", headers=KEY).json]
    assert oid not in open_ids  # completed orders leave the open queue


def test_unknown_status_rejected(client):
    oid = _place(client)
    res = client.patch(f"/api/kitchen/orders/{oid}/status",
                       json={"status": "nonsense"}, headers=KEY)
    assert res.status_code == 400


def test_status_cannot_skip_a_step(client):
    oid = _place(client)
    res = client.patch(f"/api/kitchen/orders/{oid}/status",
                       json={"status": "completed"}, headers=KEY)
    assert res.status_code == 409
    assert "received" in res.json["error"]


def test_status_cannot_reverse_once_terminal(client):
    oid = _place(client)
    for step in ("confirmed", "ready", "completed"):
        client.patch(f"/api/kitchen/orders/{oid}/status",
                     json={"status": step}, headers=KEY)
    res = client.patch(f"/api/kitchen/orders/{oid}/status",
                       json={"status": "received"}, headers=KEY)
    assert res.status_code == 409


def test_order_can_be_cancelled_midway(client):
    oid = _place(client)
    client.patch(f"/api/kitchen/orders/{oid}/status",
                 json={"status": "confirmed"}, headers=KEY)
    res = client.patch(f"/api/kitchen/orders/{oid}/status",
                       json={"status": "cancelled"}, headers=KEY)
    assert res.status_code == 200
    assert res.json["status"] == "cancelled"


def test_repeating_current_status_is_a_noop(client):
    oid = _place(client)
    res = client.patch(f"/api/kitchen/orders/{oid}/status",
                       json={"status": "received"}, headers=KEY)
    assert res.status_code == 200


def test_per_item_instructions_are_stored(client):
    res = client.post("/api/orders", json=_order_payload(
        items=[{"price_option_id": 1, "quantity": 1,
                "instructions": "no salt please"}]))
    assert res.json["items"][0]["instructions"] == "no salt please"


def test_order_codes_are_unique_across_a_burst(client):
    codes = {client.post("/api/orders", json=_order_payload()).json["order_code"]
             for _ in range(8)}
    assert len(codes) == 8


def test_rate_limit_blocks_a_flood(client):
    # The limiter allows 10 orders per minute per client.
    statuses = [client.post("/api/orders", json=_order_payload()).status_code
                for _ in range(12)]
    assert statuses.count(201) == 10
    assert statuses[-1] == 429
