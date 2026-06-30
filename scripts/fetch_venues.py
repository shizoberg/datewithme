"""
Google Places API → Railway PostgreSQL venue scraper.
Kullanım: python scripts/fetch_venues.py [--test-izmir-koy]
"""

import os
import re
import sys
import json
import time
import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

API_KEY      = os.environ['GOOGLE_PLACES_API_KEY']
DATABASE_URL = os.environ['DATABASE_URL']

SEARCH_URL  = 'https://places.googleapis.com/v1/places:searchText'
DETAILS_URL = 'https://places.googleapis.com/v1/places/{place_id}'

FIELD_MASK = ','.join([
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.rating',
    'places.userRatingCount',
    'places.priceLevel',
    'places.types',
    'places.editorialSummary',
    'places.reviews',
    'places.photos',
    'places.location',
    'places.websiteUri',
    'places.regularOpeningHours',
    'places.nationalPhoneNumber',
    'places.googleMapsUri',
    'places.attributions',
])

DETAILS_FIELD_MASK = ','.join([
    'id', 'displayName', 'formattedAddress', 'rating', 'userRatingCount',
    'priceLevel', 'types', 'editorialSummary', 'reviews', 'photos',
    'location', 'websiteUri', 'regularOpeningHours', 'nationalPhoneNumber',
    'googleMapsUri', 'attributions',
])

# ─── Arama sorguları ───────────────────────────────────────────────────────────

QUERIES = [
    # ── İZMİR MEKANLAR ───────────────────────────────────────────
    ('İzmir', 'Alsancak',   'cafe',       'İzmir Alsancak en iyi kafeler'),
    ('İzmir', 'Alsancak',   'bar',        'İzmir Alsancak barlar gece hayatı'),
    ('İzmir', 'Kordon',     'restaurant', 'İzmir Kordon restoranlar'),
    ('İzmir', 'Karşıyaka',  'cafe',       'İzmir Karşıyaka kafeler'),
    ('İzmir', 'Bornova',    'cafe',       'İzmir Bornova kafeler'),
    ('İzmir', 'Çeşme',      'restaurant', 'İzmir Çeşme Alaçatı restoranlar'),
    ('İzmir', 'Urla',       'bar',        'İzmir Urla şarap mekanları'),
    ('İzmir', 'Konak',      'cultural',   'İzmir müzeler gezilecek yerler'),
    # ── İZMİR KOY & DOĞA ─────────────────────────────────────────
    ('İzmir', 'Çeşme',      'koy',        'İzmir Çeşme koylar plajlar'),
    ('İzmir', 'Alaçatı',    'doga',       'İzmir Alaçatı gezilecek yerler'),
    ('İzmir', 'Foça',       'koy',        'İzmir Foça koylar deniz'),
    ('İzmir', 'Mordoğan',   'koy',        'İzmir Mordoğan Karaburun koy'),
    ('İzmir', 'Urla',       'koy',        'İzmir Urla koylar tekne turu'),
    ('İzmir', 'Seferihisar','koy',        'İzmir Seferihisar Teos koy plaj'),
    ('İzmir', 'Dikili',     'koy',        'İzmir Dikili koylar'),
    ('İzmir', 'Çandarlı',   'plaj',       'İzmir Çandarlı plaj koy'),
    ('İzmir', 'Ildırı',     'koy',        'İzmir Ildırı koy doğa'),
    ('İzmir', 'Sigacık',    'koy',        'İzmir Sigacık koy liman'),
    # ── İZMİR KÜLTÜR ─────────────────────────────────────────────
    ('İzmir', 'Selçuk',     'antik',      'İzmir Efes antik kent'),
    ('İzmir', 'Şirince',    'doga',       'İzmir Şirince köyü'),
    ('İzmir', 'Bergama',    'antik',      'İzmir Pergamon antik kent Bergama'),
    ('İzmir', 'Konak',      'cultural',   'İzmir Arkeoloji Müzesi'),
    ('İzmir', 'Kemeraltı',  'cultural',   'İzmir Kemeraltı çarşı tarihi'),
    ('İzmir', 'Konak',      'cultural',   'İzmir Saat Kulesi Konak'),
    # ── ÇEŞME ────────────────────────────────────────────────────
    ('İzmir', 'Çeşme',      'restaurant', 'Çeşme en iyi restoranlar'),
    ('İzmir', 'Çeşme',      'bar',        'Çeşme gece hayatı barlar'),
    ('İzmir', 'Çeşme',      'cafe',       'Çeşme kahvaltı kafeler'),
    ('İzmir', 'Çeşme',      'plaj',       'Çeşme Ilıca plaj mekanlar'),
    ('İzmir', 'Alaçatı',    'cafe',       'Alaçatı kafeler rölantili mekan'),
    ('İzmir', 'Alaçatı',    'doga',       'Alaçatı sörf plajı'),
    ('İzmir', 'Çeşme',      'restaurant', 'Çeşme marina restoranlar'),
    # ── İSTANBUL ─────────────────────────────────────────────────
    ('İstanbul', 'Kadıköy',    'cafe',       'İstanbul Kadıköy Moda kafeler'),
    ('İstanbul', 'Karaköy',    'bar',        'İstanbul Beyoğlu Karaköy barlar'),
    ('İstanbul', 'Beşiktaş',   'restaurant', 'İstanbul Beşiktaş Bebek restoranlar'),
    ('İstanbul', 'Nişantaşı',  'cafe',       'İstanbul Nişantaşı kafeler restoranlar'),
    ('İstanbul', 'Beyoğlu',    'bar',        'İstanbul rooftop bar restoran'),
    ('İstanbul', 'Beyoğlu',    'cultural',   'İstanbul müzeler sanat galerileri'),
    ('İstanbul', 'Beşiktaş',   'restaurant', 'İstanbul Boğaz manzaralı mekanlar'),
    ('İstanbul', 'Adalar',     'doga',       'İstanbul Adalar gezilecek yerler'),
    # ── İZMİR EK MEKANLAR ────────────────────────────────────────
    ('İzmir', 'Alsancak',    'restaurant', 'İzmir Alsancak restoranlar'),
    ('İzmir', 'Konak',       'cafe',       'İzmir Konak Kemeraltı kafeler'),
    ('İzmir', 'Karşıyaka',   'bar',        'İzmir Karşıyaka barlar gece hayatı'),
    ('İzmir', 'Güzelbahçe',  'cafe',       'İzmir Güzelbahçe sahil kafeler restoranlar'),
    ('İzmir', 'Balçova',     'cafe',       'İzmir Balçova Narlıdere kafeler'),
    ('İzmir', 'Bayraklı',    'restaurant', 'İzmir Bayraklı restoranlar'),
    ('İzmir', 'Urla',        'restaurant', 'Urla restoran çiftlik kahvaltı'),
    ('İzmir', 'Çeşme',       'cafe',       'Çeşme Alaçatı doğal kahvaltı bahçe'),
    # ── İZMİR EK DOĞA ────────────────────────────────────────────
    ('İzmir', 'Güzelbahçe',  'koy',        'İzmir Güzelbahçe Gülbahçe koy plaj'),
    ('İzmir', 'Urla',        'doga',       'Urla doğa yürüyüş bağ bahçe'),
    ('İzmir', 'Karaburun',   'koy',        'İzmir Karaburun yarımadası koy doğa'),
    ('İzmir', 'Bergama',     'doga',       'Bergama Kozak yaylası doğa'),
    ('İzmir', 'Manisa',      'doga',       'Manisa Spil Dağı doğa tabiat parkı'),
    ('İzmir', 'Selçuk',      'doga',       'Selçuk Efes doğa milli park'),
    # ── İSTANBUL EK MEKANLAR ─────────────────────────────────────
    ('İstanbul', 'Balat',        'cafe',       'İstanbul Balat Fener kafeler restoranlar'),
    ('İstanbul', 'Cihangir',     'cafe',       'İstanbul Cihangir Galata kafeler'),
    ('İstanbul', 'Sultanahmet',  'cultural',   'İstanbul Sultanahmet tarihi yerler gezilecek'),
    ('İstanbul', 'Ortaköy',      'cafe',       'İstanbul Ortaköy kafeler sahil mekanlar'),
    ('İstanbul', 'Arnavutköy',   'restaurant', 'İstanbul Arnavutköy Bebek Boğaz restoranlar'),
    ('İstanbul', 'Sarıyer',      'restaurant', 'İstanbul Sarıyer Tarabya balık restoranlar'),
    ('İstanbul', 'Anadolu',      'cafe',       'İstanbul Bostancı Suadiye Moda kafeler'),
    ('İstanbul', 'Kadıköy',      'bar',        'İstanbul Kadıköy barlar gece hayatı'),
    ('İstanbul', 'Beyoğlu',      'cultural',   'İstanbul Galata Pera sanat galerileri'),
    ('İstanbul', 'Üsküdar',      'cafe',       'İstanbul Üsküdar Çengelköy kafeler sahil'),
    ('İstanbul', 'Maltepe',      'cafe',       'İstanbul Maltepe Kartal sahil kafeler'),
    # ── İSTANBUL EK DOĞA ─────────────────────────────────────────
    ('İstanbul', 'Şile',         'koy',        'İstanbul Şile plaj koy doğa'),
    ('İstanbul', 'Kilyos',       'koy',        'İstanbul Kilyos plaj sahil'),
    ('İstanbul', 'Belgrad',      'doga',       'İstanbul Belgrad Ormanı doğa yürüyüş'),
    ('İstanbul', 'Ağva',         'doga',       'İstanbul Ağva doğa nehir kamp'),
    ('İstanbul', 'Emirgan',      'doga',       'İstanbul Emirgan korusu park'),
    ('İstanbul', 'Polonezköy',   'doga',       'İstanbul Polonezköy doğa tabiat parkı'),
    ('İstanbul', 'Büyükçekmece', 'koy',        'İstanbul Büyükçekmece Florya plaj sahil'),
    ('İstanbul', 'Çamlıca',      'doga',       'İstanbul Çamlıca tepesi park manzara'),
    # ── ANKARA EK MEKANLAR ───────────────────────────────────────
    ('Ankara', 'Çankaya',           'cafe',     'Ankara Çankaya Kavaklıdere kafeler'),
    ('Ankara', 'Gaziosmanpaşa',     'restaurant','Ankara Gaziosmanpaşa restoranlar'),
    ('Ankara', 'Ulus',              'cultural',  'Ankara müzeler tarihi yerler'),
    ('Ankara', 'Yenimahalle',       'doga',      'Ankara Atatürk Orman Çiftliği park'),
    ('Ankara', 'Çankaya',           'bar',        'Ankara Kavaklıdere Tunalı barlar gece hayatı'),
    ('Ankara', 'Çankaya',           'restaurant', 'Ankara Çankaya Kızılay restoranlar'),
    ('Ankara', 'Keçiören',          'cafe',       'Ankara Keçiören Pursaklar kafeler'),
    ('Ankara', 'Ulus',              'cultural',   'Ankara Anıtkabir Ulus tarihi gezilecek yerler'),
    # ── ANKARA EK DOĞA ───────────────────────────────────────────
    ('Ankara', 'Gölbaşı',           'doga',       'Ankara Gölbaşı gölü doğa piknik'),
    ('Ankara', 'Eymir',             'doga',       'Ankara Eymir gölü doğa yürüyüş'),
    ('Ankara', 'Kızılcahamam',      'doga',       'Ankara Kızılcahamam doğa kaplıca'),
    ('Ankara', 'Beypazarı',         'doga',       'Ankara Beypazarı doğa tarihi köy'),
    ('Ankara', 'Elmadağ',           'doga',       'Ankara Elmadağ Çubuk doğa tabiat'),
]

# Sadece İzmir koy sorgularını test etmek için
TEST_KOY_QUERIES = [q for q in QUERIES if q[2] in ('koy', 'plaj', 'doga') and q[0] == 'İzmir']

# ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """Mekan adını Instagram hashtag'e çevir."""
    tr_map = str.maketrans('çğışöüÇĞİŞÖÜ', 'cgisouCGISOu')
    text = text.translate(tr_map).lower()
    text = re.sub(r'[^a-z0-9]', '', text)
    return text


def detect_venue_type(types: list[str], query: str, category: str) -> tuple[str, bool, str | None]:
    """(venueType, isNature, beachType) döndür."""
    query_lower = query.lower()
    types_set = set(types)

    if category in ('koy', 'plaj') or 'koy' in query_lower or 'plaj' in query_lower:
        is_nature = True
        beach_type = 'koy' if 'koy' in query_lower else 'plaj'
        return 'koy', True, beach_type

    if category == 'antik' or 'antik' in query_lower or 'müze' in query_lower or 'tarihi' in query_lower:
        return 'antik', False, None

    if category == 'doga' or 'natural_feature' in types_set or 'park' in types_set:
        return 'doga', True, None

    if category == 'cultural' or 'museum' in types_set or 'art_gallery' in types_set:
        return 'cultural', False, None

    if 'bar' in types_set or 'night_club' in types_set or category == 'bar':
        return 'bar', False, None

    if 'restaurant' in types_set or category == 'restaurant':
        return 'restaurant', False, None

    if 'cafe' in types_set or category == 'cafe':
        return 'cafe', False, None

    return 'mekan', False, None


def map_price_level(price_level: str | None) -> int | None:
    """Places API v1 price level → 1-3 int."""
    mapping = {
        'PRICE_LEVEL_FREE': 1,
        'PRICE_LEVEL_INEXPENSIVE': 1,
        'PRICE_LEVEL_MODERATE': 2,
        'PRICE_LEVEL_EXPENSIVE': 3,
        'PRICE_LEVEL_VERY_EXPENSIVE': 3,
    }
    return mapping.get(price_level or '', None)


def build_photo_urls(photos: list[dict]) -> list[str]:
    """İlk 3 fotoğrafın media URL'ini döndür."""
    urls = []
    for p in photos[:3]:
        name = p.get('name', '')
        if name:
            url = f'https://places.googleapis.com/v1/{name}/media?maxWidthPx=800&key={API_KEY}'
            urls.append(url)
    return urls


def extract_instagram(website: str | None, place_name: str) -> tuple[str | None, str]:
    """(instagramUrl, instagramSearch) döndür."""
    instagram_url = None
    if website and 'instagram.com' in website:
        instagram_url = website

    slug = slugify(place_name)
    search_url = f'https://www.instagram.com/explore/tags/{slug}'
    return instagram_url, search_url


def places_search(query: str, retries: int = 3) -> list[dict]:
    """Text Search ile mekan listesi döndür."""
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
    }
    body = {
        'textQuery': query,
        'languageCode': 'tr',
        'regionCode': 'TR',
        'maxResultCount': 20,
    }
    for attempt in range(retries):
        try:
            r = requests.post(SEARCH_URL, headers=headers, json=body, timeout=15)
            r.raise_for_status()
            return r.json().get('places', [])
        except Exception as e:
            if attempt == retries - 1:
                print(f'  ✗ Arama hatası ({query}): {e}')
                return []
            time.sleep(2 ** attempt)
    return []


def place_details(place_id: str, retries: int = 3) -> dict:
    """Tek mekan için detay çek."""
    url = DETAILS_URL.format(place_id=place_id)
    headers = {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': DETAILS_FIELD_MASK,
    }
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=headers, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == retries - 1:
                print(f'  ✗ Detay hatası ({place_id}): {e}')
                return {}
            time.sleep(2 ** attempt)
    return {}


# ─── Veritabanı ───────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(DATABASE_URL)


def ensure_columns(conn):
    """Eksik kolonları ekle (idempotent)."""
    cols = {
        'googlePlaceId': 'TEXT UNIQUE',
        'googleRating':  'FLOAT',
        'totalRatings':  'INTEGER',
        'reviewsJson':   'TEXT',
        'photosJson':    'TEXT',
        'openingHours':  'TEXT',
        'phone':         'TEXT',
        'website':       'TEXT',
        'googleMapsUri': 'TEXT',
        'aiAnalysis':    'TEXT',
        'dateSkor':      'FLOAT',
        'gnoSkor':       'FLOAT',
        'atmosfer':      'TEXT',
        'aiTags':        'TEXT',
        'venueType':     'TEXT DEFAULT \'mekan\'',
        'isNature':      'BOOLEAN DEFAULT FALSE',
        'beachType':     'TEXT',
        'swimSuitable':  'BOOLEAN',
        'instagramSearch': 'TEXT',
    }
    with conn.cursor() as cur:
        for col, definition in cols.items():
            # PostgreSQL sütun adları küçük harfli
            col_pg = col[0].lower() + col[1:]
            cur.execute("""
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'Venue' AND column_name = %s
            """, (col_pg,))
            if not cur.fetchone():
                cur.execute(f'ALTER TABLE "Venue" ADD COLUMN "{col_pg}" {definition}')
                print(f'  + Kolon eklendi: {col_pg}')
    conn.commit()


def venue_exists(conn, google_place_id: str) -> bool:
    with conn.cursor() as cur:
        cur.execute('SELECT 1 FROM "Venue" WHERE "googlePlaceId" = %s', (google_place_id,))
        return cur.fetchone() is not None


def insert_venue(conn, data: dict) -> bool:
    """Yeni mekan ekle, duplicate ise False döndür."""
    if venue_exists(conn, data['googlePlaceId']):
        return False

    cols = ', '.join(f'"{k}"' for k in data.keys())
    placeholders = ', '.join(['%s'] * len(data))
    sql = f'INSERT INTO "Venue" ({cols}) VALUES ({placeholders})'
    with conn.cursor() as cur:
        cur.execute(sql, list(data.values()))
    conn.commit()
    return True


# ─── Ana akış ─────────────────────────────────────────────────────────────────

def process_place(place: dict, city: str, district: str, category: str, query: str, conn) -> str:
    """Bir mekanı işle ve DB'ye kaydet. 'new' | 'dup' | 'skip' döndür."""
    place_id = place.get('id', '')
    if not place_id:
        return 'skip'

    if venue_exists(conn, place_id):
        return 'dup'

    # Detay çek (reviews için)
    details = place_details(place_id)
    if details:
        place = {**place, **details}  # detaylar override eder

    name = place.get('displayName', {}).get('text', '')
    if not name:
        return 'skip'

    address = place.get('formattedAddress', '')
    rating = place.get('rating')
    total_ratings = place.get('userRatingCount')
    price_level = map_price_level(place.get('priceLevel'))
    types = place.get('types', [])
    website = place.get('websiteUri')
    phone = place.get('nationalPhoneNumber')
    google_maps_uri = place.get('googleMapsUri')

    # Editöryal özet
    description = (
        place.get('editorialSummary', {}).get('text') or
        place.get('editorialSummary', {}).get('overview') or
        None
    )

    # Fotoğraflar
    photos = place.get('photos', [])
    photo_urls = build_photo_urls(photos)
    image_url = photo_urls[0] if photo_urls else None
    photos_json = json.dumps(photo_urls) if photo_urls else None

    # Yorumlar
    reviews = place.get('reviews', [])
    reviews_data = []
    for rv in reviews[:3]:
        reviews_data.append({
            'author': rv.get('authorAttribution', {}).get('displayName', ''),
            'text': rv.get('text', {}).get('text', ''),
            'rating': rv.get('rating'),
        })
    reviews_json = json.dumps(reviews_data, ensure_ascii=False) if reviews_data else None

    # Açılış saatleri
    opening = place.get('regularOpeningHours', {})
    opening_hours = json.dumps(opening, ensure_ascii=False) if opening else None

    # Instagram
    instagram_url, instagram_search = extract_instagram(website, name)

    # Venue type & nature
    venue_type, is_nature, beach_type = detect_venue_type(types, query, category)

    # Bölge: adres'ten ilçe tahmin et
    district_final = district or ''

    # Google Maps URL (eski format, mevcut schema'da googleMapsUrl var)
    google_maps_url = google_maps_uri

    data = {
        'id':              __import__('uuid').uuid4().hex,
        'name':            name,
        'category':        category if category not in ('koy', 'plaj', 'doga', 'antik') else 'park',
        'city':            city,
        'district':        district_final,
        'address':         address,
        'googleMapsUrl':   google_maps_url,
        'instagramUrl':    instagram_url,
        'instagramSearch': instagram_search,
        'rating':          rating,
        'priceLevel':      price_level,
        'imageUrl':        image_url,
        'description':     description,
        'isActive':        True,
        'googlePlaceId':   place_id,
        'googleRating':    rating,
        'totalRatings':    total_ratings,
        'reviewsJson':     reviews_json,
        'photosJson':      photos_json,
        'openingHours':    opening_hours,
        'phone':           phone,
        'website':         website,
        'googleMapsUri':   google_maps_uri,
        'venueType':       venue_type,
        'isNature':        is_nature,
        'beachType':       beach_type,
    }

    # None değerleri temizle (isteğe bağlı — psycopg2 NULL olarak ekler)
    data = {k: v for k, v in data.items() if v is not None or k in ('isActive', 'isNature')}

    ok = insert_venue(conn, data)
    return 'new' if ok else 'dup'


def main(test_koy: bool = False):
    queries = TEST_KOY_QUERIES if test_koy else QUERIES

    print(f'\n{"─"*60}')
    print(f'  getdatewith.me — Venue Scraper')
    print(f'  Mod: {"TEST (İzmir koy)" if test_koy else "FULL"}')
    print(f'  Toplam sorgu: {len(queries)}')
    print(f'{"─"*60}\n')

    conn = get_conn()
    print('DB bağlantısı OK')
    ensure_columns(conn)

    stats = {'new': 0, 'dup': 0, 'skip': 0, 'api_calls': 0}

    for city, district, category, query in queries:
        print(f'\n► {query}')
        places = places_search(query)
        stats['api_calls'] += 1
        print(f'  {len(places)} mekan bulundu')

        for place in places:
            time.sleep(0.5)
            stats['api_calls'] += 1
            result = process_place(place, city, district, category, query, conn)
            stats[result] += 1
            name = place.get('displayName', {}).get('text', '?')
            icon = {'new': '✓', 'dup': '·', 'skip': '✗'}[result]
            print(f'  {icon} [{result}] {name}')

        time.sleep(0.5)

    conn.close()

    # Rapor
    print(f'\n{"═"*60}')
    print(f'  TAMAMLANDI')
    print(f'  ✓ Yeni eklenen : {stats["new"]}')
    print(f'  · Duplicate    : {stats["dup"]}')
    print(f'  ✗ Atlanan      : {stats["skip"]}')
    print(f'  API istekleri  : {stats["api_calls"]}')
    cost = stats['api_calls'] * 0.032  # Text Search ~$0.032/istek
    print(f'  Tahmini maliyet: ~${cost:.2f}')
    print(f'{"═"*60}\n')


if __name__ == '__main__':
    test_mode = '--test-izmir-koy' in sys.argv
    main(test_koy=test_mode)
