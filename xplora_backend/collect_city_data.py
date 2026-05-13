"""
============================================================
  Xplora — Collecte de données Google Places → MySQL
  Ville par ville | morocco_guide database
============================================================

CONFIGURATION REQUISE :
1. pip install googlemaps mysql-connector-python python-dotenv requests
2. Ajouter dans votre .env :
      GOOGLE_PLACES_API_KEY=AIza...
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=votre_mot_de_passe
      DB_NAME=morocco_guide

USAGE :
   python collect_city_data.py
   Modifier TARGET_CITY en bas du fichier pour changer de ville.
============================================================
"""

import os
import time
import requests
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
#  CONFIG
# ─────────────────────────────────────────────
GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

DB_CONFIG = {
    "host":     os.getenv("DB_HOST",     "localhost"),
    "user":     os.getenv("DB_USER",     "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME",     "morocco_guide"),
    "charset":  "utf8mb4",
}

BASE_URL      = "https://maps.googleapis.com/maps/api/place"
PHOTO_BASE    = f"{BASE_URL}/photo"
DETAILS_URL   = f"{BASE_URL}/details/json"
TEXTSEARCH_URL= f"{BASE_URL}/textsearch/json"

# Délai entre les requêtes (éviter rate-limit Google)
DELAY_BETWEEN_REQUESTS = 0.3   # secondes
MAX_RESULTS_PER_CATEGORY = 20  # max 20 par catégorie (1 page = 20)


# ─────────────────────────────────────────────
#  CONNEXION BASE DE DONNÉES
# ─────────────────────────────────────────────
def get_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            print("✅ Connexion MySQL réussie")
            return conn
    except Error as e:
        print(f"❌ Erreur MySQL : {e}")
        raise


# ─────────────────────────────────────────────
#  RÉCUPÉRATION OU CRÉATION DE LA VILLE
# ─────────────────────────────────────────────
def get_or_create_city(conn, city_name: str, region: str) -> int:
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM cities WHERE name = %s", (city_name,))
    row = cursor.fetchone()
    if row:
        print(f"🏙️  Ville trouvée : {city_name} (id={row[0]})")
        return row[0]
    cursor.execute(
        "INSERT INTO cities (name, region) VALUES (%s, %s)",
        (city_name, region)
    )
    conn.commit()
    city_id = cursor.lastrowid
    print(f"🏙️  Ville créée : {city_name} (id={city_id})")
    return city_id


# ─────────────────────────────────────────────
#  CONSTRUCTION URL PHOTO
# ─────────────────────────────────────────────
def build_photo_url(photo_reference: str, max_width: int = 800) -> str:
    if not photo_reference:
        return None
    return (
        f"{PHOTO_BASE}"
        f"?maxwidth={max_width}"
        f"&photo_reference={photo_reference}"
        f"&key={GOOGLE_API_KEY}"
    )


# ─────────────────────────────────────────────
#  DÉTAILS D'UN LIEU (description, horaires...)
# ─────────────────────────────────────────────
def fetch_place_details(place_id: str) -> dict:
    params = {
        "place_id": place_id,
        "fields": "name,editorial_summary,opening_hours,formatted_phone_number,website,rating,user_ratings_total",
        "language": "fr",
        "key": GOOGLE_API_KEY,
    }
    try:
        r = requests.get(DETAILS_URL, params=params, timeout=10)
        data = r.json()
        if data.get("status") == "OK":
            return data.get("result", {})
    except Exception as e:
        print(f"  ⚠️  Détails non récupérés : {e}")
    return {}


# ─────────────────────────────────────────────
#  RECHERCHE TEXTE GOOGLE PLACES
# ─────────────────────────────────────────────
def search_places(query: str, city: str) -> list:
    all_results = []
    params = {
        "query": f"{query} {city} Maroc",
        "language": "fr",
        "key": GOOGLE_API_KEY,
    }
    while True:
        time.sleep(DELAY_BETWEEN_REQUESTS)
        r = requests.get(TEXTSEARCH_URL, params=params, timeout=15)
        data = r.json()
        status = data.get("status")

        if status == "REQUEST_DENIED":
            print(f"  ❌ Clé API refusée : {data.get('error_message')}")
            break
        if status not in ("OK", "ZERO_RESULTS"):
            print(f"  ⚠️  Status inattendu : {status}")
            break

        results = data.get("results", [])
        all_results.extend(results)

        if len(all_results) >= MAX_RESULTS_PER_CATEGORY:
            break

        next_token = data.get("next_page_token")
        if not next_token:
            break

        # Google exige 2s d'attente avant d'utiliser next_page_token
        time.sleep(2)
        params = {"pagetoken": next_token, "key": GOOGLE_API_KEY}

    return all_results[:MAX_RESULTS_PER_CATEGORY]


# ─────────────────────────────────────────────
#  NETTOYAGE DES DONNÉES
# ─────────────────────────────────────────────
def clean_text(text: str, max_length: int = 255) -> str:
    if not text:
        return None
    return text.strip()[:max_length]

def clean_price_level(level: int) -> str:
    mapping = {0: "budget", 1: "budget", 2: "moderate", 3: "upscale", 4: "upscale"}
    return mapping.get(level, "moderate")

def clean_stars(rating: float) -> int:
    if rating is None:
        return 3
    # Google rating 1-5 → étoiles hôtel 1-5
    return max(1, min(5, round(rating)))

def extract_coords(place: dict):
    loc = place.get("geometry", {}).get("location", {})
    return loc.get("lat"), loc.get("lng")


# ─────────────────────────────────────────────
#  INSERTIONS
# ─────────────────────────────────────────────

def insert_hotel(conn, city_id: int, place: dict, details: dict):
    lat, lng = extract_coords(place)
    photo_ref = None
    photos = place.get("photos") or details.get("photos")
    if photos:
        photo_ref = photos[0].get("photo_reference")

    rating = place.get("rating")
    name   = clean_text(place.get("name"), 255)
    stars  = clean_stars(rating)
    desc   = clean_text(
        (details.get("editorial_summary") or {}).get("overview") or
        place.get("formatted_address"),
        500
    )
    photo_url = build_photo_url(photo_ref)

    cursor = conn.cursor()
    # Éviter les doublons
    cursor.execute(
        "SELECT id FROM hotels WHERE name = %s AND city_id = %s",
        (name, city_id)
    )
    if cursor.fetchone():
        print(f"    ⏭️  Hôtel déjà existant : {name}")
        return

    sql = """
        INSERT INTO hotels
            (city_id, name, stars, latitude, longitude, description, image_url, rating)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (city_id, name, stars, lat, lng, desc, photo_url, rating))
    conn.commit()
    print(f"    ✅ Hôtel inséré : {name} ({stars}⭐)")


def insert_restaurant(conn, city_id: int, place: dict, details: dict):
    lat, lng = extract_coords(place)
    photo_ref = None
    photos = place.get("photos") or details.get("photos")
    if photos:
        photo_ref = photos[0].get("photo_reference")

    rating      = place.get("rating")
    name        = clean_text(place.get("name"), 255)
    price_level = clean_price_level(place.get("price_level"))
    desc        = clean_text(
        (details.get("editorial_summary") or {}).get("overview") or
        place.get("formatted_address"),
        500
    )
    photo_url = build_photo_url(photo_ref)

    # Type de cuisine depuis les types Google
    types = place.get("types", [])
    cuisine_map = {
        "restaurant":      "Général",
        "meal_takeaway":   "Rapide",
        "cafe":            "Café",
        "bakery":          "Boulangerie",
        "bar":             "Bar",
        "food":            "Général",
    }
    cuisine = "Marocain"
    for t in types:
        if t in cuisine_map:
            cuisine = cuisine_map[t]
            break

    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM restaurants WHERE name = %s AND city_id = %s",
        (name, city_id)
    )
    if cursor.fetchone():
        print(f"    ⏭️  Restaurant déjà existant : {name}")
        return

    sql = """
        INSERT INTO restaurants
            (city_id, name, price_level, cuisine_type,
             latitude, longitude, description, image_url, rating)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        city_id, name, price_level, cuisine,
        lat, lng, desc, photo_url, rating
    ))
    conn.commit()
    print(f"    ✅ Restaurant inséré : {name} ({price_level})")


def insert_park(conn, city_id: int, place: dict, details: dict):
    lat, lng = extract_coords(place)
    photo_ref = None
    photos = place.get("photos") or details.get("photos")
    if photos:
        photo_ref = photos[0].get("photo_reference")

    rating    = place.get("rating")
    name      = clean_text(place.get("name"), 255)
    desc      = clean_text(
        (details.get("editorial_summary") or {}).get("overview") or
        place.get("formatted_address"),
        500
    )
    photo_url = build_photo_url(photo_ref)

    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM parks WHERE name = %s AND city_id = %s",
        (name, city_id)
    )
    if cursor.fetchone():
        print(f"    ⏭️  Parc déjà existant : {name}")
        return

    sql = """
        INSERT INTO parks
            (city_id, name, latitude, longitude,
             description, image_url, rating)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (city_id, name, lat, lng, desc, photo_url, rating))
    conn.commit()
    print(f"    ✅ Parc inséré : {name}")


def insert_activity(conn, city_id: int, place: dict, details: dict, activity_type: str):
    lat, lng = extract_coords(place)
    photo_ref = None
    photos = place.get("photos") or details.get("photos")
    if photos:
        photo_ref = photos[0].get("photo_reference")

    rating    = place.get("rating")
    name      = clean_text(place.get("name"), 255)
    desc      = clean_text(
        (details.get("editorial_summary") or {}).get("overview") or
        place.get("formatted_address"),
        500
    )
    photo_url = build_photo_url(photo_ref)

    cursor = conn.cursor()
    cursor.execute(
        "SELECT id FROM activities WHERE name = %s AND city_id = %s",
        (name, city_id)
    )
    if cursor.fetchone():
        print(f"    ⏭️  Activité déjà existante : {name}")
        return

    sql = """
        INSERT INTO activities
            (city_id, name, activity_type, latitude, longitude,
             description, image_url, rating)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        city_id, name, activity_type,
        lat, lng, desc, photo_url, rating
    ))
    conn.commit()
    print(f"    ✅ Activité insérée : {name} [{activity_type}]")


# ─────────────────────────────────────────────
#  PIPELINE PRINCIPAL
# ─────────────────────────────────────────────

CATEGORY_CONFIG = {
    "hotels": [
        ("hôtels",          insert_hotel,      None),
        ("riads",           insert_hotel,      None),
    ],
    "restaurants": [
        ("restaurants",     insert_restaurant, None),
        ("café salon de thé", insert_restaurant, None),
    ],
    "parks": [
        ("parcs jardins",   insert_park,       None),
        ("plage",           insert_park,       None),
    ],
    "activities": [
        ("musée",           insert_activity,   "Musée"),
        ("cinéma",          insert_activity,   "Cinéma"),
        ("activité sportive", insert_activity, "Sport"),
        ("centre commercial", insert_activity, "Shopping"),
        ("monument historique", insert_activity, "Culture"),
        ("hammam spa",      insert_activity,   "Bien-être"),
    ],
}


def collect_city(city_name: str, region: str):
    print(f"\n{'='*55}")
    print(f"  🇲🇦  Collecte : {city_name.upper()}")
    print(f"{'='*55}\n")

    if not GOOGLE_API_KEY:
        print("❌ GOOGLE_PLACES_API_KEY manquante dans .env")
        return

    conn = get_connection()
    city_id = get_or_create_city(conn, city_name, region)

    total_inserted = 0

    for table, queries in CATEGORY_CONFIG.items():
        print(f"\n📂 Catégorie : {table.upper()}")
        print("-" * 40)

        for query, insert_fn, extra_arg in queries:
            print(f"\n🔍 Recherche : «{query} {city_name}»")
            places = search_places(query, city_name)
            print(f"   → {len(places)} résultats trouvés")

            for i, place in enumerate(places, 1):
                place_id = place.get("place_id")
                name     = place.get("name", "?")
                print(f"   [{i}/{len(places)}] {name}")

                # Récupération des détails enrichis
                time.sleep(DELAY_BETWEEN_REQUESTS)
                details = fetch_place_details(place_id) if place_id else {}

                try:
                    if extra_arg:
                        insert_fn(conn, city_id, place, details, extra_arg)
                    else:
                        insert_fn(conn, city_id, place, details)
                    total_inserted += 1
                except Exception as e:
                    print(f"    ❌ Erreur insertion : {e}")

    conn.close()
    print(f"\n{'='*55}")
    print(f"  ✅ Terminé ! {total_inserted} enregistrements pour {city_name}")
    print(f"{'='*55}\n")


# ─────────────────────────────────────────────
#  VILLES DU MAROC — modifier ici
# ─────────────────────────────────────────────
CITIES = {
    "Casablanca":  "Casablanca-Settat",
    "Marrakech":   "Marrakech-Safi",
    "Agadir":      "Souss-Massa",
    "Ifrane":      "Fès-Meknès",
    "Tanger":      "Tanger-Tétouan-Al Hoceïma",
    "Ouarzazate":  "Drâa-Tafilalet",
    "Rabat":       "Rabat-Salé-Kénitra",
}

# ─────────────────────────────────────────────
#  LANCEMENT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    # Changer "Casablanca" par n'importe quelle ville du dict ci-dessus
    TARGET_CITY = "Casablanca"

    if TARGET_CITY not in CITIES:
        print(f"❌ Ville inconnue. Choisir parmi : {list(CITIES.keys())}")
    else:
        collect_city(TARGET_CITY, CITIES[TARGET_CITY])