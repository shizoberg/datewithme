"""
Mekan isimleri listesinden Google Places API ile veri çek ve DB'ye ekle.

Kullanım:
  python scripts/import_by_name.py venues.txt

venues.txt formatı (her satır: mekan_adı|şehir|kategori):
  Karafırın|İstanbul|cafe
  Büyükada|İstanbul|doga
  Kordon Boyu|İzmir|park

Kategori değerleri: cafe restaurant bar park rooftop cultural koy doga antik
"""

import os, re, sys, json, time, uuid
import psycopg2
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

API_KEY      = os.environ['GOOGLE_PLACES_API_KEY']
DATABASE_URL = os.environ['DATABASE_URL']

SEARCH_URL  = 'https://places.googleapis.com/v1/places:searchText'
DETAILS_URL = 'https://places.googleapis.com/v1/places/{}'

SEARCH_FIELD_MASK = ','.join([
    'places.id', 'places.displayName', 'places.formattedAddress',
    'places.rating', 'places.userRatingCount', 'places.priceLevel',
    'places.types', 'places.location',
])

DETAILS_FIELD_MASK = ','.join([
    'id', 'displayName', 'formattedAddress', 'rating', 'userRatingCount',
    'priceLevel', 'types', 'editorialSummary', 'reviews', 'photos',
    'location', 'websiteUri', 'regularOpeningHours', 'nationalPhoneNumber',
    'googleMapsUri',
])

PRICE_MAP = {
    'PRICE_LEVEL_FREE': 1, 'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2, 'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 3,
}

NATURE_CATS = {'koy', 'doga', 'antik', 'plaj'}


def search_place(name: str, city: str) -> str | None:
    """Mekan adı + şehir ile arama yap, ilk sonucun place_id'sini döndür."""
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': SEARCH_FIELD_MASK,
    }
    body = {
        'textQuery': f'{name} {city}',
        'languageCode': 'tr',
        'regionCode': 'TR',
        'maxResultCount': 3,
    }
    try:
        r = requests.post(SEARCH_URL, headers=headers, json=body, timeout=15)
        r.raise_for_status()
        places = r.json().get('places', [])
        if places:
            return places[0].get('id')
    except Exception as e:
        print(f'  ✗ Arama hatası: {e}')
    return None


def fetch_details(place_id: str) -> dict:
    url = DETAILS_URL.format(place_id)
    headers = {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': DETAILS_FIELD_MASK,
        'Accept-Language': 'tr',
    }
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f'  ✗ Detay hatası: {e}')
        return {}


def extract_price_mention(reviews: list[dict]) -> str | None:
    """Yorumlardan fiyat içeren bir cümle çıkar."""
    price_patterns = [
        r'(?:fiyat|ucuz|pahalı|uygun|₺|TL|lira|para|ücret)[^.!?]{0,80}[.!?]',
        r'[^.!?]{0,40}(?:₺\d+|\d+\s*TL|\d+\s*lira)[^.!?]{0,40}[.!?]',
    ]
    for rv in reviews:
        text = rv.get('text', '')
        for pat in price_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                snippet = m.group(0).strip()
                if len(snippet) > 15:
                    return snippet[:120]
    return None


def extract_highlight(reviews: list[dict], name: str) -> str | None:
    """En çok bahsedilen özelliği bul (kahve, kruvassan, manzara vs.)."""
    food_keywords = [
        'kruvassan','kruvasan','kahve','latte','cappuccino','çay','tost',
        'waffle','pasta','kek','börek','baklava','döner','pide','pizza',
        'meze','balık','manzara','atmosfer','müzik','servis','bahçe',
        'teras','deniz','boğaz','sahil','park','orman','doğa',
    ]
    text_all = ' '.join(rv.get('text', '') for rv in reviews).lower()
    counts = {kw: text_all.count(kw) for kw in food_keywords if text_all.count(kw) > 1}
    if not counts:
        return None
    top = max(counts, key=counts.get)
    return f'{top.capitalize()} ile meşhur'


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def venue_exists(cur, place_id: str) -> bool:
    cur.execute('SELECT 1 FROM "Venue" WHERE "googlePlaceId" = %s', (place_id,))
    return cur.fetchone() is not None


def insert_venue(conn, data: dict) -> bool:
    if not data.get('googlePlaceId'):
        return False
    with conn.cursor() as cur:
        if venue_exists(cur, data['googlePlaceId']):
            return False
        cols = ', '.join(f'"{k}"' for k in data)
        ph   = ', '.join(['%s'] * len(data))
        cur.execute(f'INSERT INTO "Venue" ({cols}) VALUES ({ph})', list(data.values()))
    conn.commit()
    return True


def process(name: str, city: str, category: str, conn) -> str:
    """'new' | 'dup' | 'skip' döndür."""
    print(f'  ⟳ Aranıyor: {name} / {city}')
    place_id = search_place(name, city)
    if not place_id:
        return 'skip'

    with conn.cursor() as cur:
        if venue_exists(cur, place_id):
            print(f'  · Zaten var')
            return 'dup'

    time.sleep(0.3)
    p = fetch_details(place_id)
    if not p:
        return 'skip'

    vname = p.get('displayName', {}).get('text', name)

    photos = p.get('photos', [])
    photo_urls = [
        f'https://places.googleapis.com/v1/{ph["name"]}/media?maxWidthPx=800&key={API_KEY}'
        for ph in photos[:5] if ph.get('name')
    ]

    # 15 yoruma kadar çek
    reviews_raw = p.get('reviews', [])[:15]
    reviews_data = [
        {
            'author': rv.get('authorAttribution', {}).get('displayName', ''),
            'text': rv.get('text', {}).get('text', ''),
            'rating': rv.get('rating'),
        }
        for rv in reviews_raw if rv.get('text', {}).get('text')
    ]

    price_mention = extract_price_mention(reviews_data)
    highlight     = extract_highlight(reviews_data, vname)

    loc = p.get('location', {})
    lat = loc.get('latitude')
    lng = loc.get('longitude')

    db_category = 'park' if category in NATURE_CATS else category

    data = {
        'id':            uuid.uuid4().hex,
        'name':          vname,
        'category':      db_category,
        'city':          city,
        'district':      '',
        'address':       p.get('formattedAddress') or '',
        'googleMapsUrl': p.get('googleMapsUri'),
        'googleMapsUri': p.get('googleMapsUri'),
        'rating':        p.get('rating'),
        'totalRatings':  p.get('userRatingCount'),
        'googleRating':  p.get('rating'),
        'priceLevel':    PRICE_MAP.get(p.get('priceLevel', ''), None),
        'imageUrl':      photo_urls[0] if photo_urls else None,
        'photosJson':    json.dumps(photo_urls) if photo_urls else None,
        'description':   p.get('editorialSummary', {}).get('text'),
        'reviewsJson':   json.dumps(reviews_data, ensure_ascii=False) if reviews_data else None,
        'aiAnalysis':    price_mention,        # fiyat örneği
        'atmosfer':      highlight,            # "Kruvassan ile meşhur"
        'phone':         p.get('nationalPhoneNumber'),
        'website':       p.get('websiteUri'),
        'googlePlaceId': place_id,
        'venueType':     category,
        'isNature':      category in {'koy', 'doga'},
        'isActive':      True,
        'lat':           lat,
        'lng':           lng,
    }
    # None'ları temizle (isActive + isNature hariç)
    data = {k: v for k, v in data.items() if v is not None or k in ('isActive', 'isNature')}

    ok = insert_venue(conn, data)
    if ok:
        print(f'  ✓ Eklendi: {vname}')
        return 'new'
    return 'dup'


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(f'Dosya bulunamadı: {input_file}')
        sys.exit(1)

    lines = [l.strip() for l in open(input_file, encoding='utf-8') if l.strip() and not l.startswith('#')]

    conn = get_conn()
    stats = {'new': 0, 'dup': 0, 'skip': 0}

    for line in lines:
        parts = [x.strip() for x in line.split('|')]
        if len(parts) < 2:
            print(f'Geçersiz satır: {line}')
            continue
        name     = parts[0]
        city     = parts[1]
        category = parts[2] if len(parts) > 2 else 'cafe'
        print(f'\n► {name} ({city})')
        result = process(name, city, category, conn)
        stats[result] += 1
        time.sleep(0.5)

    conn.close()
    print(f'\n{"═"*50}')
    print(f'  ✓ Yeni: {stats["new"]}  · Var: {stats["dup"]}  ✗ Atla: {stats["skip"]}')
    print(f'{"═"*50}')


if __name__ == '__main__':
    main()
