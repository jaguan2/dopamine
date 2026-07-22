# scripts/build_seed.py
#
# Builds menu_seed.json from the CURRENT St. Petersburg printed menu,
# transcribed from customer photos of the menu (Yelp/Restaurantji, 2025-26).
#
# Categories marked REVIEW below could not be fully read from the photos
# (price column cut off) — they carry prices from the previous data set and
# a "prices under review" note until the owner confirms.
#
# Run from backend/:  python scripts/build_seed.py   (then scripts/seed.py)
#
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
# legacy_menu.json is the pre-2026 data set; only REVIEW categories read from it
OLD = os.path.join(HERE, "legacy_menu.json")

REVIEW_NOTE = "Prices under review — confirm with the restaurant."


def items(*rows):
    """rows of (name, price_or_[(label,price)...], desc='', spicy=False)"""
    out = []
    for row in rows:
        name, price = row[0], row[1]
        desc = row[2] if len(row) > 2 else ""
        spicy = row[3] if len(row) > 3 else False
        if isinstance(price, list):
            prices = [{"label": l, "amount": a} for l, a in price]
        else:
            prices = [{"label": "", "amount": price}]
        out.append({"name": name, "desc": desc, "prices": prices, "spicy": spicy})
    return out


cats = []
order = 0


def cat(name, jp, group, note, its):
    global order
    cats.append({"category": name, "jp": jp, "group": group, "order": order,
                 "note": note, "items": its})
    order += 1


# ── Starters & Soups ─────────────────────────────────────────────────────────

cat("Appetizer", "前菜", "Starters & Soups", "", items(
    ("Edamame", "5.50"),
    ("Kani Cheese (Krab Rangoon) (6 pcs)", "6.50"),
    ("Japanese Egg Roll (2 pcs)", "3.75"),
    ("Shrimp or Pork Egg Roll (2)", "3.99"),
    ("Krab Egg Roll", "4.95"),
    ("Shumai (Steamed Dumpling)", "5.95"),
    ("Age Tofu", "5.99", "Crispy tofu w. tempura sauce"),
    ("Soft Shell Krab", "7.99", "Crispy fried soft shell krab"),
    ("Rock Shrimp", "7.50", "Chopped tempura fried shrimp served w. sauce"),
    ("Fried Calamari", "6.99", "Lightly breaded deep fried squid ring w. spicy sauce"),
    ("Baby Octopus", "5.99"),
    ("Gyoza", "6.50", "Pan fried dumpling"),
    ("Fried Baby Shrimp", "6.50"),
    ("Fried Jumbo Shrimp", "6.99"),
    ("Tempura Vegetable", "6.99"),
    ("Tempura Chicken or Shrimp (4)", "7.99"),
    ("Fried Donut (10)", "5.50"),
    ("Fried Wonton (10)", "5.99"),
    ("Fried Pepper", "8.50",
     "Zesty Asian hot pepper stuffed with spicy tuna and cream cheese", True),
    ("B.B.Q. Squid", "9.99"),
    ("Beef Negimaki", "9.00", "Thinly sliced beef rolled w. scallion w. teriyaki sauce"),
    ("Sushi Pizza", "7.99", "", False),
))

cat("Sushi Bar Appetizers", "酒肴", "Starters & Soups",
    "Most items feature raw fish.", items(
    ("Sushi Appetizers (5 pcs)", "10.00"),
    ("Sashimi Appetizers (7 pcs)", "12.00"),
    ("Tuna Tataki", "12.45"),
    ("Salmon Tataki", "11.45"),
    ("Yellowtail Jalapeno", "12.45", "", True),
    ("Tuna Tartar", "10.00"),
    ("Salmon Tartar", "10.00"),
    ("Yellowtail Tartar", "10.00"),
    ("Tuna Sashimi (9 pcs)", "16.99"),
    ("Salmon Sashimi (9 pcs)", "15.99"),
))

cat("Soup", "汁物", "Starters & Soups", "", items(
    ("Miso Soup", [("S", "2.25"), ("L", "3.50")]),
    ("Onion Soup", [("S", "2.25"), ("L", "3.50")]),
    ("Seafood Soup", "9.50"),
    ("Wonton Soup", [("S", "3.75"), ("L", "4.95")]),
    ("Egg Drop Soup", [("S", "3.75"), ("L", "4.95")]),
    ("Wonton Egg Drop Soup", [("S", "3.75"), ("L", "4.95")]),
    ("Chicken Rice Soup", [("S", "3.75"), ("L", "4.95")]),
    ("Chicken Noodle Soup", [("S", "3.75"), ("L", "4.95")]),
    ("Vegetable Soup", [("S", "3.75"), ("L", "5.50")]),
))

cat("Salad", "サラダ", "Starters & Soups", "", items(
    ("House Salad", "2.50"),
    ("Cucumber Salad", "4.95"),
    ("Seaweed Salad", "5.95"),
    ("Squid Salad", "5.95"),
    ("Krab Salad", "5.95"),
    ("Kani Salad", "5.95", "Krab, caviar, cucumber mixed with mayonnaise"),
    ("Avocado Salad", "5.95"),
    ("Seafood Salad", "9.50", "Octopus, shrimp, white fish, krab and salmon"),
    ("Sashimi Salad", "9.99",
     "Salmon, tuna, whitefish, yellowtail, with scallion, masago and ponzu sauce"),
))

# ── Sushi Bar ────────────────────────────────────────────────────────────────

cat("Sushi or Sashimi", "握り・刺身", "Sushi Bar",
    "Sushi 2 pieces per order · Sashimi 3 pieces per order (add $1)", items(
    ("Krab", "4.75"),
    ("White Fish", "5.50"),
    ("Tamago (Egg Custard)", "4.75"),
    ("Shrimp", "5.50"),
    ("Masago (Fish Egg)", "5.95"),
    ("Escolar", "5.95"),
    ("Eel", "5.95"),
    ("Tuna", "5.95"),
    ("Salmon", "5.95"),
    ("Red Clam", "5.95"),
    ("Squid", "5.95"),
    ("Octopus", "5.95"),
    ("Scallop", "5.95"),
    ("Yellowtail", "5.95"),
    ("Ikura (Salmon Roe)", "6.99"),
))

# REVIEW: classic roll prices not readable in the menu photos — carried over.
_old = json.load(open(OLD, encoding="utf-8"))
_by_name = {c["category"]: c for c in _old}

_rolls = _by_name["Sushi or Hand Roll"]
cat("Sushi Rolls", "巻き寿司", "Sushi Bar",
    "Hand roll available for classic rolls · Brown rice extra $1. " + REVIEW_NOTE,
    _rolls["items"])

cat("Sushi Special Roll", "特製巻き寿司", "Sushi Bar",
    "★ Most special rolls feature raw fish.", items(
    ("Funky Monkey", "6.95", "Eel & banana, sauces on top"),
    ("Ninja", "7.99",
     "Spicy salmon, avocado & crunch topped w. black sesame seed, spicy mayo", True),
    ("Rock Roll", "11.95",
     "Tempura roll w. fish, krab sticks, shrimp, avocado. Served w. sauces"),
    ("Miracle", "12.95",
     "Tempura roll w. white fish & avocado, topped w. masago, spicy scallop, sauces, scallion", True),
    ("Tornado Roll", "11.95",
     "Tempura shrimp and cream cheese inside, top w. krab meat and eel sauce"),
    ("Hot Maki", "13.50",
     "Shrimp tempura & avocado inside, topped w. tuna, jalapeno, served w. spicy eel sauce", True),
    ("Crazy Tuna", "12.95",
     "Crunchy spicy tuna topped w. pepper red tuna & avocado, spicy sauce, masago", True),
    ("Japanese Bagel", "12.50",
     "Krab, cream cheese, cucumber, avocado w. salmon on top"),
    ("White Swan", "12.50",
     "Spicy salmon, tempura flakes, spicy mayo inside topped w. peppered escolar, masago", True),
    ("Sunshine", "12.50",
     "Spicy salmon with spicy mayo, crunch inside topped with salmon avocado and masago", True),
    ("Master Mind", "11.95",
     "Salmon, avocado, and crunch inside, topped with spicy krab", True),
    ("Angry Bird", "13.50",
     "Escolar, avocado and crunch inside, topped with pepper tuna served with sauce"),
    ("Mars", "13.50", "Spicy crawfish inside. Topped w. tuna & salmon", True),
    ("Titanic Roll (8 pcs)", "12.95",
     "Tempura shrimp and cream cheese inside, krab meat and avocado in soy wrap, top w. sauces"),
    ("Pink Lady", "13.95",
     "Spicy tuna, shrimp tempura, and avocado wrapped with soy paper served with sauces", True),
    ("Golden Dream", "13.95",
     "Salmon, cream cheese & avocado topped tempura shrimp & avocado with sauces"),
    ("Tiger", "14.95",
     "Tuna, krab, avocado, masago inside, topped with salmon, eel, crunch and scallion, served with sauces"),
    ("Out of Control", "14.95",
     "Tuna, white fish & salmon, avocado & asparagus inside, topped tuna & salmon, served w. eel sauces, masago, crunch, scallion"),
    ("Eternal Love", "14.95",
     "Spicy tuna, tempura sweet potato inside. Topped w. tuna. Served w. crunch, masago, eel sauce & spicy mayo, scallion", True),
    ("Silent Scream", "14.50",
     "Eel tempura, cream cheese & cucumber inside, with spicy tuna & avocado, served with eel sauce", True),
    ("Vietnamese Sashimi Roll", "13.50",
     "Tuna, salmon, white fish, avocado, cucumber, jalapeno & lettuce wrapped in rice paper. Served w. grapefruit ponzu, shrimp sauce & kimchi sauce", True),
    ("Manhattan Roll", "12.95",
     "Shrimp tempura topped w. spicy tuna, masago, scallion & crunchy, sauces", True),
    ("New Orleans Roll", "12.50",
     "Spicy crawfish, avocado, crunch, topped w. spicy tuna & spicy krab, tobiko, served w. sauces", True),
    ("Rocky Two Roll", "13.95",
     "Shrimp tempura, krab, eel, masago, avocado, wrapped in soy paper, served w. sauces"),
    ("Spicy Girl Roll", "13.95",
     "Spicy salmon, crunch, avocado, topped w. tuna, escolar, w. spicy sauce, tobiko", True),
    ("Sandwich Roll", "15.00",
     "Spicy tuna, avocado & eel wrapped w. soy paper, topped w. black tobiko, wasabi tobiko, masago & sauces", True),
    ("Angel Roll", "14.95",
     "Tuna, escolar, avocado, asparagus, wrapped w. soy paper, topped w. salmon, tobiko, scallion, sauces"),
    ("Iron Roll", "13.95",
     "Spicy tuna, avocado, crunch, topped w. avocado, eel & wasabi tobiko & sauces", True),
    ("Staten Island Roll", "13.95",
     "Spicy krab & shrimp topped with seared tuna with spicy mayo & eel sauce & tobiko", True),
    ("Ichiban Roll", "13.95",
     "Spicy octopus, krab, avocado, masago topped with tobiko, seared salmon & spicy mayo, eel sauce", True),
    ("Ocean Roll", "13.50",
     "Shrimp tempura, avocado, topped w. spicy kani and seaweed salad w. house sauce", True),
    ("Phoenix Roll", "14.50",
     "Shrimp tempura, escolar, seaweed salad, topped w. tuna & salmon, wrapped w. soy paper w. house sauce"),
))

# REVIEW: naruto prices cut off in the photo — carried over.
_naruto_old = {i["name"]: i["prices"] for i in _by_name["Naruto"]["items"]}
cat("Naruto", "なると巻き", "Sushi Bar",
    "Wrapped with cucumber, with miso sauce. " + REVIEW_NOTE, items(
    ("Rainbow Naruto", _naruto_old.get("Rainbow Naruto", [{"label": "", "amount": "12.00"}])[0]["amount"],
     "Tuna, salmon, white fish, krab, avocado"),
    ("Spicy Tuna Naruto", _naruto_old.get("Spicy Tuna Naruto", [{"label": "", "amount": "10.00"}])[0]["amount"],
     "Spicy tuna & avocado, crunch and spicy mayo", True),
    ("Tuna & Avocado", "10.00"),
    ("Salmon & Avocado", "10.00"),
    ("Yellowtail & Avocado", "11.00"),
))

# REVIEW: platter names/prices partially cut off — carried over.
_special = _by_name["Sushi Bar Special"]
cat("Sushi Bar Special", "寿司盛り合わせ", "Sushi Bar",
    (_special["note"] + " " + REVIEW_NOTE).strip(), _special["items"])

cat("Sushi Combo", "寿司コンボ", "Sushi Bar",
    "Served w. soup or salad.", items(
    ("Maki Platter", "14.99", "Tuna roll, vegetable roll and shrimp tempura roll"),
    ("Sushi Regular", "18.99", "8 pcs of assorted sushi & California roll"),
    ("Sashimi Regular", "20.99", "10 pcs of assorted sliced fish & tuna roll"),
))

cat("Poke Bowl", "ポケ丼", "Sushi Bar",
    "All poke bowls come w. krab, cucumber, seaweed salad, sesame seeds. "
    "Choose your base (white rice / brown rice $1 extra / salad / half & half), "
    "fish (salmon, tuna, spicy salmon, spicy tuna, cooked shrimp; eel $1 extra, "
    "yellowtail $2 extra), sauce and toppings.", items(
    ("Poke Bowl — Two Scoop Fish", "10.99"),
    ("Poke Bowl — Three Scoop Fish", "12.99"),
))

# ── Hibachi & Kitchen ────────────────────────────────────────────────────────

_hib = [
    ("Vegetable", "8.45", "10.95"),
    ("Tofu (Mixed Vegetable)", "9.45", "11.95"),
    ("Chicken", "8.95", "11.95"),
    ("Steak", "9.45", "12.45"),
    ("O.E.C. Chicken (w. Curry Sauce)", "8.95", "11.95"),
    ("Shrimp", "8.95", "11.95"),
    ("Salmon or White Fish", "10.95", "13.45"),
    ("Scallops", "11.45", "13.75"),
    ("Chicken & Shrimp", "11.45", "14.45"),
    ("Chicken & Steak", "11.45", "14.45"),
    ("Chicken & Scallops", "11.45", "14.45"),
    ("Steak & Shrimp", "11.45", "14.45"),
    ("Steak & Scallops", "11.45", "14.45"),
    ("Shrimp & Scallops", "11.45", "14.45"),
    ("Jumbo Shrimp", "11.45", "14.45"),
]
cat("Hibachi", "鉄板焼", "Hibachi & Kitchen",
    "Lunch (Mon–Sun 11:00 am–3:00 pm) served with sweet carrots, fried rice or "
    "noodle. Dinner served with fried rice or noodle, sweet carrots & house salad.",
    items(*[(n, [("Lunch", l), ("Dinner", d)]) for n, l, d in _hib]))

cat("Teriyaki", "照り焼き", "Hibachi & Kitchen",
    "w. White rice, mixed vegetable, onion soup & house salad.", items(
    ("Shrimp, Steak, Scallop or Seafood (choose one)", "18.00"),
    ("Salmon or Chicken", "15.00"),
))

cat("Tempura", "天ぷら", "Hibachi & Kitchen", "Served w. white rice.", items(
    ("Vegetable Tempura", "10.99"),
    ("Chicken Tempura (8 pcs)", "12.50"),
    ("Shrimp Tempura (8 pcs)", "12.50"),
))

cat("Katsu", "カツ", "Hibachi & Kitchen",
    "Breaded & deep fried, served w. salad or soup, white rice.", items(
    ("Chicken Katsu", "14.00"),
    ("Pork Katsu", "14.00"),
))

cat("Yakimeshi", "焼き飯", "Hibachi & Kitchen", "Fried rice or noodle.", items(
    ("Chicken", "9.45"),
    ("Shrimp", "9.95"),
    ("Steak", "9.95"),
    ("Combo (Choose Two)", "12.95", "Chicken, shrimp and steak"),
    ("Chicken, Shrimp & Steak", "15.00"),
    ("Sweet & Sour Chicken (w. Egg Roll)", "10.50"),
    ("Orange Chicken (w. Egg Roll)", "11.50"),
    ("General Tso's Chicken (w. Egg Roll)", "11.50", "", True),
))

cat("Yaki Udon / Yaki Soba", "焼きうどん・そば", "Hibachi & Kitchen",
    "Stir-fried noodles. Served w. miso soup.", items(
    ("Chicken, Steak or Shrimp", "14.00"),
    ("Vegetable", "11.00"),
))

cat("Noodle Soup", "麺類", "Hibachi & Kitchen",
    "Udon or soba. Served w. house salad.", items(
    ("Chicken, Steak or Shrimp", "14.00"),
    ("Vegetable", "11.00"),
))

cat("Entrees From The Kitchen", "台所より", "Hibachi & Kitchen",
    "w. White rice.", items(
    ("Sweet & Sour Chicken", [("S", "7.50"), ("L", "9.95")]),
    ("Sweet & Sour Pork", [("S", "7.50"), ("L", "9.95")]),
    ("Sweet & Sour Shrimp", [("S", "7.50"), ("L", "10.75")]),
    ("Orange Chicken", [("S", "8.99"), ("L", "11.95")]),
    ("General Tso's Chicken", [("S", "8.99"), ("L", "11.95")], "", True),
))

cat("Healthy Food", "蒸し料理", "Hibachi & Kitchen", "w. White rice.", items(
    ("Steamed Mixed Vegetable", "9.25"),
    ("Steamed Chicken w. Mixed Veg.", [("S", "6.95"), ("L", "10.50")]),
    ("Steamed Shrimp w. Mixed Veg.", [("S", "7.50"), ("L", "11.25")]),
    ("Steamed Chicken w. Broccoli", [("S", "6.95"), ("L", "10.50")]),
))

# ── Bento & Lunch ────────────────────────────────────────────────────────────

cat("Bento Box", "弁当", "Bento & Lunch",
    "Served w. California roll, house salad, white rice, vegetable & shumai or "
    "egg roll. Choose one: teriyaki chicken, steak, shrimp, salmon or white "
    "fish · sushi (4 pcs assorted raw fish) · sashimi (5 pcs assorted raw fish).",
    items(
    ("Lunch Bento Special", "13.50"),
    ("Dinner Bento", "15.50"),
))

cat("Sushi Lunch Special", "ランチ巻き", "Bento & Lunch",
    "Mon–Sat only. Choose any two classic rolls, w. onion soup, miso soup or "
    "house salad. Brown rice add $1 each roll.", items(
    ("Any Two Rolls", "8.99",
     "Choose from 30 classic rolls — vegetable, cucumber, avocado, krab, "
     "crunch, asparagus, sweet potato, California, salmon skin, tuna, salmon, "
     "Philly, spicy krab, Alaskan, calamari, Boston, fancy, eel, spicy tuna, "
     "crunch krab, snow crab, spicy salmon, crawfish, eel avocado, peanut "
     "avocado, tuna cucumber, yasai, salmon cheese, salmon avocado, banana"),
))

# ── Drinks & Sides ───────────────────────────────────────────────────────────

cat("Side Orders", "お供", "Drinks & Sides", "", items(
    ("Brown Rice", [("S", "4.00"), ("L", "6.00")]),
    ("Fried Rice or Fried Noodle", [("S", "3.95"), ("L", "5.50")]),
    ("Steamed Rice", [("S", "2.50"), ("L", "3.75")]),
    ("Crispy Noodles", "0.50"),
    ("Sushi Rice (8 oz)", [("S", "2.50"), ("L", "5.00")]),
))

# REVIEW: beverage prices not readable in the photos — carried over.
cat("Beverages", "お飲み物", "Drinks & Sides", REVIEW_NOTE, items(
    ("Bottle of Water", "1.50"),
    ("Soft Drink / Ice Tea", "2.50"),
    ("Hot Tea", "2.00"),
    ("Iced Japanese Green Tea (Can)", "2.95"),
    ("Japanese Sprite (Ramune)", "3.75"),
    ("Mochi Ice Cream (2)", "5.95"),
))

cat("Sake, Beer & Wine", "酒", "Drinks & Sides",
    "We serve beer, wine and sake — ask for today's selection.", items(
    ("House Sake (Small)", "4.99"),
    ("House Sake (Large)", "7.99"),
))

# ─────────────────────────────────────────────────────────────────────────────

n = sum(len(c["items"]) for c in cats)
json.dump(cats, open(os.path.join(HERE, "menu_seed.json"), "w", encoding="utf-8"),
          indent=1, ensure_ascii=False)
print(f"Wrote menu_seed.json: {len(cats)} categories, {n} items")
