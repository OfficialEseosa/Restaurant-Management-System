"""
Restaurant Management System database seeder.

Usage:
  python seed_database.py

Environment variables:
  RMS_BASE_URL=http://localhost:8080
  RMS_RESET_BEFORE_SEED=true|false   (default: true)
"""

from __future__ import annotations

import os
import time
from typing import Any

import requests

BASE = os.getenv("RMS_BASE_URL", "http://localhost:8080").rstrip("/")
RESET_BEFORE_SEED = os.getenv("RMS_RESET_BEFORE_SEED", "true").strip().lower() in {
    "1",
    "true",
    "yes",
    "y",
}

REQUEST_TIMEOUT = 20
UPLOAD_TIMEOUT = 45
SLEEP_BETWEEN_UPLOADS = 0.25
USER_AGENT = "Mozilla/5.0 (compatible; RMS-Seeder/2.0)"
FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80"

# ---------------------------------------------------------------------------
# Image sources (validated at runtime)
# ---------------------------------------------------------------------------

INGREDIENT_IMAGES = {
    "Beef Patty": "https://images.unsplash.com/photo-1602030638412-bb8dcc0bc8b0?w=640&q=80",
    "Chicken Breast": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=640&q=80",
    "Bacon": "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=640&q=80",
    "Cheddar Cheese": "https://images.unsplash.com/photo-1619881590738-a111d176d906?w=640&q=80",
    "American Cheese": "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=640&q=80",
    "Lettuce": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=640&q=80",
    "Tomato": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=640&q=80",
    "Yellow Onion": "https://images.unsplash.com/photo-1508747703725-719777637510?w=640&q=80",
    "Dill Pickles": "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=640&q=80",
    "Brioche Bun": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=640&q=80",
    "Russet Potatoes": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=640&q=80",
    "All-Purpose Flour": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=640&q=80",
    "Eggs": "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=640&q=80",
    "Whole Milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=640&q=80",
    "Butter": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=640&q=80",
    "Mushrooms": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=640&q=80",
    "Avocado": "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=640&q=80",
    "Jalapeno Peppers": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=640&q=80",
    "Vanilla Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=640&q=80",
    "Heavy Cream": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=640&q=80",
    "Breadcrumbs": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=640&q=80",
    "Turkey Breast": "https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=640&q=80",
    "Pasta": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=640&q=80",
}

MENU_ITEM_IMAGES = {
    "Classic Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&q=80",
    "Bacon Cheeseburger": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=640&q=80",
    "Mushroom Swiss Burger": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=640&q=80",
    "Avocado Burger": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=640&q=80",
    "Spicy Jalapeno Burger": "https://images.unsplash.com/photo-1544025162-d76694265947?w=640&q=80",
    "Double Smash Burger": "https://images.unsplash.com/photo-1586816001966-79b736744398?w=640&q=80",
    "Club Sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=640&q=80",
    "Grilled Chicken Sandwich": "https://images.unsplash.com/photo-1619059558110-c45be64b73ae?w=640&q=80",
    "BLT Sandwich": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=640&q=80",
    "Philly Cheesesteak": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=640&q=80",
    "Classic Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=640&q=80",
    "Loaded Cheese Fries": "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=640&q=80",
    "Onion Rings": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=640&q=80",
    "Side Salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80",
    "Mac and Cheese": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=640&q=80",
    "Pancake Stack": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=640&q=80",
    "Eggs Benedict": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=640&q=80",
    "Classic Omelette": "https://images.unsplash.com/photo-1619895092538-128341789043?w=640&q=80",
    "Bacon and Eggs": "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=640&q=80",
    "French Toast": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=640&q=80",
    "Tomato Soup": "https://images.unsplash.com/photo-1547592180-85f173990554?w=640&q=80",
    "Clam Chowder": "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=640&q=80",
    "Vanilla Milkshake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=640&q=80",
    "Apple Pie Slice": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=640&q=80",
    "Ice Cream Sundae": "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=640&q=80",
    "Fresh Lemonade": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=640&q=80",
    "Chocolate Brownie": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=640&q=80",
}

# ---------------------------------------------------------------------------
# Ingredient definitions: (name, unit, initial_stock)
# ---------------------------------------------------------------------------

INGREDIENTS = [
    ("Beef Patty", "pieces", 200),
    ("Chicken Breast", "pieces", 150),
    ("Bacon", "strips", 300),
    ("Cheddar Cheese", "slices", 400),
    ("American Cheese", "slices", 400),
    ("Lettuce", "leaves", 500),
    ("Tomato", "slices", 400),
    ("Yellow Onion", "pieces", 300),
    ("Dill Pickles", "slices", 500),
    ("Brioche Bun", "pieces", 200),
    ("Russet Potatoes", "grams", 5000),
    ("All-Purpose Flour", "grams", 3000),
    ("Eggs", "pieces", 500),
    ("Whole Milk", "ml", 4000),
    ("Butter", "grams", 2000),
    ("Mushrooms", "grams", 1000),
    ("Avocado", "pieces", 150),
    ("Jalapeno Peppers", "pieces", 200),
    ("Vanilla Ice Cream", "scoops", 300),
    ("Heavy Cream", "ml", 2000),
    ("Breadcrumbs", "grams", 1500),
    ("Turkey Breast", "slices", 200),
    ("Pasta", "grams", 3000),
]

# ---------------------------------------------------------------------------
# Menu item definitions:
# (name, description, price, active, [(ingredient_name, qty_required), ...])
# ---------------------------------------------------------------------------

MENU_ITEMS = [
    (
        "Classic Burger",
        "Juicy beef patty with fresh lettuce, tomato, onion, and pickles on a brioche bun.",
        8.99,
        True,
        [
            ("Beef Patty", 1),
            ("Lettuce", 2),
            ("Tomato", 2),
            ("Yellow Onion", 2),
            ("Dill Pickles", 3),
            ("Brioche Bun", 1),
        ],
    ),
    (
        "Bacon Cheeseburger",
        "Our classic burger topped with crispy bacon and melted cheddar.",
        10.99,
        True,
        [
            ("Beef Patty", 1),
            ("Bacon", 3),
            ("Cheddar Cheese", 2),
            ("Lettuce", 2),
            ("Tomato", 2),
            ("Brioche Bun", 1),
        ],
    ),
    (
        "Mushroom Swiss Burger",
        "Savory sauteed mushrooms and melted cheese on a juicy beef patty.",
        11.99,
        True,
        [
            ("Beef Patty", 1),
            ("Mushrooms", 80),
            ("Cheddar Cheese", 2),
            ("Lettuce", 1),
            ("Brioche Bun", 1),
        ],
    ),
    (
        "Avocado Burger",
        "Fresh sliced avocado, lettuce, and tomato on a grilled beef patty.",
        12.49,
        True,
        [("Beef Patty", 1), ("Avocado", 1), ("Lettuce", 2), ("Tomato", 2), ("Brioche Bun", 1)],
    ),
    (
        "Spicy Jalapeno Burger",
        "Kicked up with fresh jalapenos and melted cheddar for the heat seekers.",
        11.49,
        True,
        [
            ("Beef Patty", 1),
            ("Jalapeno Peppers", 3),
            ("Cheddar Cheese", 2),
            ("Lettuce", 2),
            ("Tomato", 2),
            ("Brioche Bun", 1),
        ],
    ),
    (
        "Double Smash Burger",
        "Two smashed beef patties layered with American cheese, pickles, and caramelized onion.",
        13.99,
        True,
        [
            ("Beef Patty", 2),
            ("American Cheese", 2),
            ("Dill Pickles", 4),
            ("Yellow Onion", 3),
            ("Brioche Bun", 1),
        ],
    ),
    (
        "Club Sandwich",
        "Stacked turkey, crispy bacon, lettuce, tomato, and avocado on toasted bread.",
        9.99,
        True,
        [("Turkey Breast", 3), ("Bacon", 3), ("Lettuce", 3), ("Tomato", 2), ("Avocado", 1)],
    ),
    (
        "Grilled Chicken Sandwich",
        "Marinated grilled chicken breast with fresh lettuce and tomato on a brioche bun.",
        9.49,
        True,
        [("Chicken Breast", 1), ("Lettuce", 2), ("Tomato", 2), ("Brioche Bun", 1)],
    ),
    (
        "BLT Sandwich",
        "Classic bacon, lettuce, and tomato on toasted bread with butter.",
        8.49,
        True,
        [("Bacon", 4), ("Lettuce", 3), ("Tomato", 3), ("Butter", 15)],
    ),
    (
        "Philly Cheesesteak",
        "Thinly sliced beef, sauteed mushrooms and onions, smothered in American cheese.",
        12.99,
        True,
        [("Beef Patty", 2), ("Mushrooms", 60), ("Yellow Onion", 2), ("American Cheese", 3)],
    ),
    ("Classic Fries", "Golden crispy fries seasoned with sea salt. The perfect side.", 3.99, True, [("Russet Potatoes", 200)]),
    (
        "Loaded Cheese Fries",
        "Crispy fries piled high with melted cheddar and crumbled bacon.",
        5.99,
        True,
        [("Russet Potatoes", 200), ("Cheddar Cheese", 3), ("Bacon", 2)],
    ),
    (
        "Onion Rings",
        "Hand-battered thick-cut onion rings, golden and crispy.",
        4.49,
        True,
        [("Yellow Onion", 2), ("All-Purpose Flour", 80), ("Eggs", 1), ("Whole Milk", 60), ("Breadcrumbs", 60)],
    ),
    ("Side Salad", "Fresh greens with tomato and onion. Light and refreshing.", 4.99, True, [("Lettuce", 4), ("Tomato", 2), ("Yellow Onion", 1)]),
    (
        "Mac and Cheese",
        "Creamy housemade mac and cheese with sharp cheddar sauce.",
        6.99,
        True,
        [("Pasta", 120), ("Cheddar Cheese", 4), ("Whole Milk", 120), ("Butter", 30)],
    ),
    (
        "Pancake Stack",
        "Fluffy stack of three buttermilk pancakes served with butter.",
        7.99,
        True,
        [("All-Purpose Flour", 150), ("Eggs", 2), ("Whole Milk", 180), ("Butter", 20)],
    ),
    (
        "Eggs Benedict",
        "Poached eggs and bacon on an English muffin with hollandaise sauce.",
        11.99,
        True,
        [("Eggs", 2), ("Butter", 30), ("Bacon", 3)],
    ),
    (
        "Classic Omelette",
        "Three-egg omelette with cheddar, mushrooms, and onion.",
        9.49,
        True,
        [("Eggs", 3), ("Cheddar Cheese", 2), ("Mushrooms", 50), ("Yellow Onion", 1)],
    ),
    ("Bacon and Eggs", "Three strips of crispy bacon with two eggs cooked your way.", 8.99, True, [("Bacon", 3), ("Eggs", 2), ("Butter", 10)]),
    (
        "French Toast",
        "Thick-cut bread dipped in egg and milk batter, pan-fried to golden perfection.",
        7.49,
        True,
        [("Eggs", 2), ("Whole Milk", 60), ("Butter", 20), ("All-Purpose Flour", 20)],
    ),
    (
        "Tomato Soup",
        "Rich, slow-simmered tomato soup with a touch of cream. Served with a bread slice.",
        5.99,
        True,
        [("Tomato", 5), ("Butter", 20), ("Heavy Cream", 60), ("Yellow Onion", 1)],
    ),
    (
        "Clam Chowder",
        "Creamy New England-style chowder with potatoes and smoky bacon.",
        6.99,
        True,
        [("Russet Potatoes", 150), ("Butter", 20), ("Heavy Cream", 120), ("Yellow Onion", 1)],
    ),
    ("Vanilla Milkshake", "Thick and creamy hand-spun vanilla milkshake topped with whipped cream.", 5.49, True, [("Vanilla Ice Cream", 3), ("Whole Milk", 120)]),
    ("Apple Pie Slice", "Classic American apple pie with a buttery flaky crust. Served warm.", 5.49, True, [("All-Purpose Flour", 100), ("Butter", 60), ("Eggs", 1)]),
    ("Ice Cream Sundae", "Two scoops of vanilla ice cream with hot fudge and whipped cream.", 4.99, True, [("Vanilla Ice Cream", 2)]),
    ("Fresh Lemonade", "Freshly squeezed lemonade over ice. Refreshing and tart.", 3.49, True, []),
    (
        "Chocolate Brownie",
        "Warm fudgy chocolate brownie served with a scoop of vanilla ice cream.",
        4.99,
        True,
        [("All-Purpose Flour", 80), ("Eggs", 2), ("Butter", 50), ("Vanilla Ice Cream", 1)],
    ),
]


def api_request(method: str, path: str, *, timeout: int = REQUEST_TIMEOUT, **kwargs: Any) -> requests.Response:
    url = f"{BASE}{path}"
    resp = requests.request(method, url, timeout=timeout, **kwargs)
    return resp


def api_json(method: str, path: str, *, timeout: int = REQUEST_TIMEOUT, **kwargs: Any) -> Any:
    resp = api_request(method, path, timeout=timeout, **kwargs)
    if resp.status_code >= 400:
        body = resp.text[:250].replace("\n", " ")
        raise RuntimeError(f"{method} {path} failed ({resp.status_code}): {body}")
    if not resp.content:
        return None
    return resp.json()


def get_list(path: str) -> list[dict[str, Any]]:
    data = api_json("GET", path)
    if not isinstance(data, list):
        raise RuntimeError(f"Expected list response from {path}, got: {type(data).__name__}")
    return data


def post(path: str, body: dict[str, Any]) -> dict[str, Any]:
    out = api_json("POST", path, json=body)
    if not isinstance(out, dict):
        raise RuntimeError(f"Expected object response from POST {path}")
    return out


def put(path: str, body: dict[str, Any]) -> dict[str, Any]:
    out = api_json("PUT", path, json=body)
    if not isinstance(out, dict):
        raise RuntimeError(f"Expected object response from PUT {path}")
    return out


def delete(path: str) -> None:
    resp = api_request("DELETE", path)
    if resp.status_code not in (200, 202, 204, 404):
        body = resp.text[:250].replace("\n", " ")
        raise RuntimeError(f"DELETE {path} failed ({resp.status_code}): {body}")


def is_image_response(resp: requests.Response) -> bool:
    content_type = resp.headers.get("Content-Type", "").lower()
    return resp.status_code == 200 and content_type.startswith("image/")


def download_image_bytes(url: str, label: str) -> tuple[bytes, str, str] | None:
    try:
        resp = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        )
        if not is_image_response(resp):
            print(f"  [WARN] Non-image response for {label}: {url} ({resp.status_code}, {resp.headers.get('Content-Type', '')})")
            return None
        content_type = resp.headers.get("Content-Type", "image/jpeg").split(";")[0].strip()
        return resp.content, content_type, resp.url
    except Exception as exc:  # noqa: BLE001
        print(f"  [WARN] Download failed for {label}: {url} ({exc})")
        return None


def validate_image_url(url: str, label: str) -> bool:
    try:
        resp = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        )
        ok = is_image_response(resp)
        if not ok:
            print(f"  [WARN] URL is not a valid image for {label}: {url}")
        return ok
    except Exception as exc:  # noqa: BLE001
        print(f"  [WARN] Could not validate image URL for {label}: {url} ({exc})")
        return False


def upload_to_cloudinary(image_bytes: bytes, content_type: str, label: str) -> str:
    files = {"file": (f"{label}.jpg", image_bytes, content_type)}
    resp = api_request("POST", "/api/images/upload", files=files, timeout=UPLOAD_TIMEOUT)
    if resp.status_code >= 400:
        return ""
    try:
        payload = resp.json()
    except ValueError:
        return ""
    if not isinstance(payload, dict):
        return ""
    url = payload.get("url")
    return url if isinstance(url, str) else ""


def resolve_image_url(source_url: str, label: str) -> str:
    candidates = [source_url, FALLBACK_IMAGE_URL]
    selected_source = ""
    selected_content_type = "image/jpeg"
    selected_bytes = b""

    for candidate in candidates:
        if not candidate:
            continue
        downloaded = download_image_bytes(candidate, label)
        if downloaded is None:
            continue
        selected_bytes, selected_content_type, selected_source = downloaded
        break

    if not selected_bytes:
        print(f"  [WARN] No image sources were valid for {label}; using fallback URL directly.")
        return FALLBACK_IMAGE_URL

    uploaded = upload_to_cloudinary(selected_bytes, selected_content_type, label)
    if uploaded and validate_image_url(uploaded, label):
        print(f"  [IMG]  {label}: uploaded ok")
        return uploaded

    if validate_image_url(selected_source, label):
        print(f"  [IMG]  {label}: using validated source URL (upload unavailable)")
        return selected_source

    print(f"  [WARN] Upload and source validation both failed for {label}; using fallback URL.")
    return FALLBACK_IMAGE_URL


def delete_collection(path: str, id_field: str, label: str) -> int:
    rows = get_list(path)
    deleted = 0
    for row in rows:
        row_id = row.get(id_field)
        if row_id is None:
            print(f"  [WARN] Missing '{id_field}' in {label} row: {row}")
            continue
        delete(f"{path}/{row_id}")
        deleted += 1
    print(f"  [CLR]  Deleted {deleted} {label}")
    return deleted


def delete_menu_item_links() -> int:
    rows = get_list("/api/menu-item-ingredients")
    deleted = 0
    for row in rows:
        menu_item_id = None
        ingredient_id = None

        identifier = row.get("id")
        if isinstance(identifier, dict):
            menu_item_id = identifier.get("menuItemId")
            ingredient_id = identifier.get("ingredientId")

        if menu_item_id is None and isinstance(row.get("menuItem"), dict):
            menu_item_id = row["menuItem"].get("menuItemId")
        if ingredient_id is None and isinstance(row.get("ingredient"), dict):
            ingredient_id = row["ingredient"].get("ingredientId")

        if menu_item_id is None or ingredient_id is None:
            print(f"  [WARN] Skipping invalid menu_item_ingredient row: {row}")
            continue

        delete(f"/api/menu-item-ingredients/{menu_item_id}/{ingredient_id}")
        deleted += 1

    print(f"  [CLR]  Deleted {deleted} menu item ingredient links")
    return deleted


def clear_domain_data() -> None:
    print("--- Resetting seedable tables ---")
    # Order matters because of foreign keys.
    delete_collection("/api/stock-change-logs", "stockChangeId", "stock change logs")
    delete_collection("/api/orders", "orderId", "orders")
    delete_menu_item_links()
    delete_collection("/api/inventory", "ingredientId", "inventory rows")
    delete_collection("/api/menu-items", "menuItemId", "menu items")
    delete_collection("/api/ingredients", "ingredientId", "ingredients")


def wait_for_api() -> None:
    print(f"Connecting to API at {BASE} ...")
    for attempt in range(1, 11):
        try:
            resp = api_request("GET", "/api/menu-items", timeout=8)
            if resp.status_code < 500:
                print("API is reachable.\n")
                return
        except Exception:  # noqa: BLE001
            pass
        print(f"  [WAIT] Backend not ready yet (attempt {attempt}/10)")
        time.sleep(1.2)
    raise RuntimeError("Backend did not become reachable. Start Spring Boot app first.")


def seed_ingredients() -> dict[str, int]:
    print("--- Step 1: Creating ingredients + inventory ---")
    ingredient_ids: dict[str, int] = {}

    for name, unit, stock in INGREDIENTS:
        image_url = resolve_image_url(INGREDIENT_IMAGES.get(name, ""), name)
        time.sleep(SLEEP_BETWEEN_UPLOADS)

        ingredient = post(
            "/api/ingredients",
            {
                "name": name,
                "unit": unit,
                "imageUrl": image_url,
            },
        )
        ingredient_id = ingredient["ingredientId"]
        ingredient_ids[name] = ingredient_id

        post(
            "/api/inventory",
            {
                "ingredient": {"ingredientId": ingredient_id},
                "quantityOnHand": stock,
            },
        )
        print(f"  [OK]   Ingredient {name} (id={ingredient_id}) with stock={stock}")

    return ingredient_ids


def infer_menu_category(name: str, description: str) -> str:
    haystack = f"{name} {description}".lower()
    if "burger" in haystack or "smash" in haystack:
        return "BURGERS"
    if "sandwich" in haystack or "blt" in haystack or "cheesesteak" in haystack or "club" in haystack:
        return "SANDWICHES"
    if "fries" in haystack or "onion rings" in haystack:
        return "FRIES"
    if "pancake" in haystack or "benedict" in haystack or "omelette" in haystack or "french toast" in haystack:
        return "BREAKFAST"
    if "soup" in haystack or "chowder" in haystack:
        return "SOUPS"
    if "milkshake" in haystack or "brownie" in haystack or "sundae" in haystack or "pie" in haystack or "ice cream" in haystack:
        return "SWEETS"
    if "lemonade" in haystack or "drink" in haystack or "soda" in haystack or "tea" in haystack or "coffee" in haystack:
        return "DRINKS"
    return "SIDES"


def seed_menu_items(ingredient_ids: dict[str, int]) -> int:
    print("\n--- Step 2: Creating menu items + ingredient links ---")
    created_count = 0

    for name, description, price, active, links in MENU_ITEMS:
        image_url = resolve_image_url(MENU_ITEM_IMAGES.get(name, ""), name)
        time.sleep(SLEEP_BETWEEN_UPLOADS)

        menu_item = post(
            "/api/menu-items",
            {
                "name": name,
                "description": description,
                "category": infer_menu_category(name, description),
                "price": price,
                "imageUrl": image_url,
                "active": active,
            },
        )
        menu_item_id = menu_item["menuItemId"]
        created_count += 1
        print(f"  [OK]   Menu item {name} (id={menu_item_id})")

        linked = 0
        for ingredient_name, qty in links:
            ingredient_id = ingredient_ids.get(ingredient_name)
            if ingredient_id is None:
                print(f"  [WARN] Ingredient '{ingredient_name}' missing; skipping link.")
                continue

            payload = {
                "menuItem": {"menuItemId": menu_item_id},
                "ingredient": {"ingredientId": ingredient_id},
                "quantityRequired": qty,
            }
            try:
                post("/api/menu-item-ingredients", payload)
                linked += 1
            except RuntimeError as exc:
                if "409" in str(exc):
                    linked += 1
                    continue
                print(f"  [WARN] Could not link '{ingredient_name}' to '{name}': {exc}")
        if links:
            print(f"         linked {linked}/{len(links)} ingredients")

    return created_count


def main() -> None:
    print("=== RMS Database Seeder ===\n")
    wait_for_api()

    if RESET_BEFORE_SEED:
        clear_domain_data()
        print()
    else:
        print("Skipping reset step (RMS_RESET_BEFORE_SEED=false).\n")

    ingredient_ids = seed_ingredients()
    menu_item_count = seed_menu_items(ingredient_ids)

    print("\n=== Seeding complete ===")
    print(f"Ingredients created: {len(ingredient_ids)}")
    print(f"Menu items created: {menu_item_count}")
    print("Database reset before seed:", "yes" if RESET_BEFORE_SEED else "no")


if __name__ == "__main__":
    main()
