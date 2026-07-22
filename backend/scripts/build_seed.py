# scripts/build_seed.py
#
# Builds menu_seed.json from menupages_menu.json — the restaurant's official
# online-ordering menu (Grubhub restaurant 560075, the same feed behind
# oecjapaneseexpress.dine.online), scraped from Menupages July 2026.
#
# These are the prices OEC itself charges for online orders (slightly above
# the printed in-store menu, by their own choice). Two in-store-only
# categories (Poke Bowl, Sake) are appended from the printed menu since the
# online feed omits them.
#
# Run from backend/:  python scripts/build_seed.py   (then scripts/seed.py)
#
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))

# section -> (display name, jp label, group, sort order, note)
SECTION_META = {
    "Appetizers":               ("Appetizer", "前菜", "Starters & Soups", 10, ""),
    "Sushi Bar Appetizers":     ("Sushi Bar Appetizers", "酒肴", "Starters & Soups", 11,
                                 "Most items feature raw fish."),
    "Soup":                     ("Soup", "汁物", "Starters & Soups", 12, ""),
    "Salad":                    ("Salad", "サラダ", "Starters & Soups", 13, ""),
    "Sushi":                    ("Sushi", "握り", "Sushi Bar", 20, "2 pieces per order."),
    "Sashimi":                  ("Sashimi", "刺身", "Sushi Bar", 21, "3 pieces per order."),
    "Sushi Roll":               ("Sushi Rolls", "巻き寿司", "Sushi Bar", 22,
                                 "Hand roll available on request · Brown rice extra $1."),
    "Sushi Special Roll":       ("Sushi Special Roll", "特製巻き寿司", "Sushi Bar", 23,
                                 "Most special rolls feature raw fish."),
    "Naruto":                   ("Naruto", "なると巻き", "Sushi Bar", 24,
                                 "Wrapped with cucumber, with miso sauce."),
    "Sushi Bar Special":        ("Sushi Bar Special", "寿司盛り合わせ", "Sushi Bar", 25,
                                 "Served w. soup or salad."),
    "Sushi Combo":              ("Sushi Combo", "寿司コンボ", "Sushi Bar", 26,
                                 "Served w. soup or salad."),
    "Hibachi Lunch":            ("Hibachi Lunch", "鉄板焼（昼）", "Hibachi & Kitchen", 30,
                                 "Mon–Sun 11:00 am–3:00 pm. Served with sweet carrots, "
                                 "fried rice or noodle."),
    "Hibachi Dinner":           ("Hibachi Dinner", "鉄板焼（夜）", "Hibachi & Kitchen", 31,
                                 "Served with fried rice or noodle, sweet carrots & house salad."),
    "Teriyaki":                 ("Teriyaki", "照り焼き", "Hibachi & Kitchen", 32, ""),
    "Tempura":                  ("Tempura", "天ぷら", "Hibachi & Kitchen", 33,
                                 "Served w. white rice."),
    "Katsu":                    ("Katsu", "カツ", "Hibachi & Kitchen", 34,
                                 "Breaded & deep fried, served w. salad or soup, white rice."),
    "Yakimeshi":                ("Yakimeshi", "焼き飯", "Hibachi & Kitchen", 35,
                                 "Fried rice or noodle."),
    "Yaki Udon":                ("Yaki Udon", "焼きうどん", "Hibachi & Kitchen", 36,
                                 "Stir-fried noodles, served w. miso soup."),
    "Soba":                     ("Yaki Soba", "焼きそば", "Hibachi & Kitchen", 37,
                                 "Stir-fried noodles, served w. miso soup."),
    "Noodle Soup":              ("Noodle Soup", "麺類", "Hibachi & Kitchen", 38,
                                 "Udon or soba, served w. house salad."),
    "Entrees from the Kitchen": ("Entrees From The Kitchen", "台所より", "Hibachi & Kitchen", 39,
                                 "w. White rice."),
    "Healthy Food":             ("Healthy Food", "蒸し料理", "Hibachi & Kitchen", 40,
                                 "w. White rice."),
    "Lunch Bento Special":      ("Lunch Bento", "昼の弁当", "Bento & Lunch", 50,
                                 "Served w. California roll, house salad, rice and shumai or egg roll."),
    "Dinner Bento Special":     ("Dinner Bento", "夜の弁当", "Bento & Lunch", 51,
                                 "Served w. California roll, house salad, rice and shumai or egg roll."),
    "Sushi Lunch Special":      ("Sushi Lunch Special", "ランチ巻き", "Bento & Lunch", 52,
                                 "Mon–Sat only. Choose any two classic rolls, w. onion soup, "
                                 "miso soup or house salad."),
    "Side Orders":              ("Side Orders", "お供", "Drinks & Sides", 60, ""),
    "Beverages":                ("Beverages", "お飲み物", "Drinks & Sides", 61, ""),
}

SPICY = re.compile(r"spicy|jalapeno|kimchi|hot pepper|wasabi mayo", re.I)

# "2 Piece Krab Sushi" / "3 Piece krab Sashimi" -> "Krab"
PIECE_PREFIX = re.compile(r"^\d+\s*Piece\s+", re.I)
COURSE_SUFFIX = re.compile(r"\s*\((Lunch|Dinner)\)$", re.I)
HIBACHI_INFIX = re.compile(r"\s*Hibachi\s*", re.I)


def clean_name(section, name):
    name = name.replace("�", "").strip()
    name = re.sub(r"\s{2,}", " ", name)
    name = COURSE_SUFFIX.sub("", name)
    if section in ("Sushi", "Sashimi"):
        name = PIECE_PREFIX.sub("", name)
        name = re.sub(r"\s*(Sushi|Sashimi)$", "", name, flags=re.I)
    if section in ("Hibachi Lunch", "Hibachi Dinner"):
        name = HIBACHI_INFIX.sub(" ", name).strip()
    if section == "Sushi Lunch Special" and name == "Sushi Special":
        name = "Any Two Rolls"
    name = re.sub(r"\(\s+", "(", name)
    name = re.sub(r"\s+\)", ")", name)
    # normalize sentence-case oddities like "krab"
    if name and name[0].islower():
        name = name[0].upper() + name[1:]
    # typos present in the upstream feed
    name = re.sub(r"\bRol\b", "Roll", name)
    return name.strip()


def clean_desc(section, name, desc):
    desc = desc.replace("�", "").strip()
    desc = re.sub(r"\s{2,}", " ", desc)
    if section == "Sushi Lunch Special":
        desc = ("Choose from 30 classic rolls — vegetable, cucumber, avocado, krab, "
                "crunch, asparagus, sweet potato, California, salmon skin, tuna, "
                "salmon, Philly, spicy krab, Alaskan, calamari, Boston, fancy, eel, "
                "spicy tuna, crunch krab, snow crab, spicy salmon, crawfish, eel "
                "avocado, peanut avocado, tuna cucumber, yasai, salmon cheese, "
                "salmon avocado, banana")
    return desc


def run():
    raw = json.load(open(os.path.join(HERE, "menupages_menu.json"), encoding="utf-8"))
    cats = []
    seen_names = {}
    unmapped = []
    for sec in raw:
        sec_name = sec["section"].replace("�", "").strip()
        meta = SECTION_META.get(sec_name)
        if not meta:
            unmapped.append(sec_name)
            continue
        display, jp, group, order, note = meta
        items, dedupe = [], set()
        for it in sec["items"]:
            name = clean_name(sec_name, it["name"])
            key = name.lower()
            if key in dedupe:          # feed contains a few duplicates
                continue
            dedupe.add(key)
            desc = clean_desc(sec_name, name, it.get("desc", ""))
            items.append({
                "name": name,
                "desc": desc,
                "prices": [{"label": "", "amount": it["price"]}],
                "spicy": bool(SPICY.search(name + " " + desc)),
            })
        cats.append({"category": display, "jp": jp, "group": group,
                     "order": order, "note": note, "items": items})
    if unmapped:
        print("WARNING unmapped sections:", unmapped)

    # In-store-only extras (from the printed menu; not in the online feed)
    cats.append({
        "category": "Poke Bowl", "jp": "ポケ丼", "group": "Sushi Bar", "order": 27,
        "note": "In-store special. All poke bowls come w. krab, cucumber, seaweed "
                "salad, sesame seeds. Choose your base, fish, sauce and toppings.",
        "items": [
            {"name": "Poke Bowl — Two Scoop Fish", "desc": "",
             "prices": [{"label": "", "amount": "10.99"}], "spicy": False},
            {"name": "Poke Bowl — Three Scoop Fish", "desc": "",
             "prices": [{"label": "", "amount": "12.99"}], "spicy": False},
        ],
    })
    cats.append({
        "category": "Sake, Beer & Wine", "jp": "酒", "group": "Drinks & Sides", "order": 62,
        "note": "Dine-in — ask for today's selection.",
        "items": [
            {"name": "House Sake (Small)", "desc": "",
             "prices": [{"label": "", "amount": "4.99"}], "spicy": False},
            {"name": "House Sake (Large)", "desc": "",
             "prices": [{"label": "", "amount": "7.99"}], "spicy": False},
        ],
    })

    cats.sort(key=lambda c: c["order"])
    n = sum(len(c["items"]) for c in cats)
    json.dump(cats, open(os.path.join(HERE, "menu_seed.json"), "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)
    print(f"Wrote menu_seed.json: {len(cats)} categories, {n} items")
    for c in cats:
        print(f"  {c['group']:20s} | {c['category']:24s} {len(c['items']):3d}")


if __name__ == "__main__":
    run()
