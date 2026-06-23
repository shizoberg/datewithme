"""
Venue tablosundaki yorumları Claude API ile analiz eder.
Kullanım: python scripts/analyze_venues.py [--limit=20] [--reanalyze]
"""

import os
import sys
import json
import time
import psycopg2
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

DATABASE_URL  = os.environ['DATABASE_URL']
ANTHROPIC_KEY = os.environ['ANTHROPIC_API_KEY']

client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

GETDATE_BADGES = [
    'sessiz_date',
    'romantik_mekan',
    'sabah_date',
    'late_night',
    'kizlarin_kahvesi',
    'gno_gece',
    'dogada_bulus',
    'sahil_keyfi',
    'kultur_sanat',
    'brunch_club',
    'manzara_nefes',
    'koy_kacamak',
    'sarap_aksami',
    'aktif_date',
]


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def fetch_venues(conn, limit: int, reanalyze: bool) -> list[dict]:
    with conn.cursor() as cur:
        where = '' if reanalyze else 'WHERE "aiAnalysis" IS NULL'
        cur.execute(f"""
            SELECT id, name, rating, description, "reviewsJson", city, district, category, "venueType", "isNature"
            FROM "Venue"
            {where}
            ORDER BY rating DESC NULLS LAST
            LIMIT %s
        """, (limit,))
        rows = cur.fetchall()
    return [
        {'id': r[0], 'name': r[1], 'rating': r[2], 'description': r[3],
         'reviewsJson': r[4], 'city': r[5], 'district': r[6],
         'category': r[7], 'venueType': r[8], 'isNature': r[9]}
        for r in rows
    ]


def save_analysis(conn, venue_id: str, analysis: dict):
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE "Venue"
            SET "aiAnalysis" = %s,
                "dateSkor"   = %s,
                "gnoSkor"    = %s,
                "atmosfer"   = %s,
                "aiTags"     = %s
            WHERE id = %s
        """, (
            json.dumps(analysis, ensure_ascii=False),
            analysis.get('dateSkor'),
            analysis.get('gnoSkor'),
            analysis.get('atmosfer'),
            ','.join(analysis.get('badges', [])),
            venue_id,
        ))
    conn.commit()


def analyze_venue(venue: dict) -> dict | None:
    reviews_raw = venue.get('reviewsJson') or '[]'
    try:
        reviews = json.loads(reviews_raw)
    except Exception:
        reviews = []

    reviews_text = '\n'.join(
        f'- {r.get("author","?")} ({r.get("rating","?")}★): {r["text"]}'
        for r in reviews[:3] if r.get('text')
    ) or '(yorum yok)'

    badges_list = '\n'.join(f'- {b}' for b in GETDATE_BADGES)

    prompt = f"""Sen getdatewith.me uygulaması için mekan analiz uzmanısın.
Bu uygulama Türkiye'de çift buluşmaları ve kız grupları için mekan önerir.
Sadece JSON döndür, başka hiçbir şey yazma.

Mekan: {venue["name"]}
Şehir: {venue["city"]} / {venue["district"]}
Kategori: {venue["category"]} / venueType: {venue.get("venueType")}
Doğal alan: {venue.get("isNature")}
Puan: {venue.get("rating") or "bilinmiyor"}
Açıklama: {venue.get("description") or "yok"}
Yorumlar:
{reviews_text}

Rozet seçenekleri (max 3, sadece gerçekten uyan):
{badges_list}

JSON:
{{
  "dateSkor": <1-10 çift buluşması uygunluğu>,
  "gnoSkor": <1-10 kız grubu gecesi uygunluğu>,
  "atmosfer": "<romantik|eğlenceli|sakin|enerjik|kültürel|doğal|hareketli>",
  "badges": [<max 3 rozet listeden>],
  "enIyiYorum": "<en çarpıcı yorum max 80 karakter, yoksa boş>",
  "fiyatYorum": "<uygun|orta|pahalı>"
}}"""

    try:
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=400,
            messages=[{'role': 'user', 'content': prompt}],
        )
        text = msg.content[0].text.strip()
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f'  x Claude hatasi: {e}')
        return None


def main():
    limit = 100
    reanalyze = False
    for arg in sys.argv[1:]:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])
        if arg == '--reanalyze':
            reanalyze = True

    print(f'\n{"─"*60}')
    print(f'  getdatewith.me — AI Venue Analyzer')
    print(f'  Limit: {limit} | Reanalyze: {reanalyze}')
    print(f'{"─"*60}\n')

    conn = get_conn()
    venues = fetch_venues(conn, limit, reanalyze)
    print(f'{len(venues)} mekan analiz edilecek\n')

    success = 0
    for i, venue in enumerate(venues, 1):
        print(f'[{i}/{len(venues)}] {venue["name"]} ({venue["city"]})')
        analysis = analyze_venue(venue)
        if analysis:
            save_analysis(conn, venue['id'], analysis)
            badges = ', '.join(analysis.get('badges', [])) or '-'
            print(f'  OK date={analysis.get("dateSkor")} gno={analysis.get("gnoSkor")} '
                  f'atm={analysis.get("atmosfer")} | {badges}')
            success += 1
        time.sleep(0.2)

    conn.close()

    print(f'\n{"="*60}')
    print(f'  TAMAMLANDI: {success}/{len(venues)} analiz edildi')
    print(f'  Tahmini maliyet: ~${success * 0.0003:.2f} (Haiku)')
    print(f'{"="*60}\n')


if __name__ == '__main__':
    main()
