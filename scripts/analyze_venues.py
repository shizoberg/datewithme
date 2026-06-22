"""
Venue tablosundaki yorumları Claude API ile analiz eder.
Kullanım: python scripts/analyze_venues.py [--limit 20]
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


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def fetch_unanalyzed(conn, limit: int) -> list[dict]:
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, name, rating, description, "reviewsJson", city, category
            FROM "Venue"
            WHERE "aiAnalysis" IS NULL
              AND ("reviewsJson" IS NOT NULL OR description IS NOT NULL)
            ORDER BY rating DESC NULLS LAST
            LIMIT %s
        """, (limit,))
        rows = cur.fetchall()
    return [
        {'id': r[0], 'name': r[1], 'rating': r[2], 'description': r[3],
         'reviewsJson': r[4], 'city': r[5], 'category': r[6]}
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
            ','.join(analysis.get('tags', [])),
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
        f'- {r["author"]} ({r.get("rating", "?")}★): {r["text"]}'
        for r in reviews if r.get('text')
    ) or '(yorum yok)'

    prompt = f"""Sen bir İstanbul/İzmir/Ankara mekan uzmanısın.
Bu mekan için kısa bir analiz yap ve aşağıdaki JSON formatında döndür.
Sadece JSON döndür, başka hiçbir şey yazma.

Mekan: {venue["name"]}
Şehir: {venue["city"]}
Kategori: {venue["category"]}
Puan: {venue.get("rating") or "bilinmiyor"}
Açıklama: {venue.get("description") or "yok"}
Kullanıcı yorumları:
{reviews_text}

JSON:
{{
  "dateSkor": <1-10 arası sayı, romantik date için uygunluk>,
  "gnoSkor": <1-10 arası sayı, kız grubu gecesi için uygunluk>,
  "atmosfer": "<romantik|eğlenceli|sakin|enerjik|kültürel|doğal>",
  "fiyatYorum": "<uygun|orta|pahalı>",
  "enIyiYorum": "<en etkileyici yorumu Türkçe özetle, max 100 karakter>",
  "tags": [<max 5 Türkçe tag, örn: "manzara", "kahvaltı", "gece", "doğa">]
}}"""

    try:
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=400,
            messages=[{'role': 'user', 'content': prompt}],
        )
        text = msg.content[0].text.strip()
        # JSON bloğunu temizle
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f'  ✗ Claude hatası: {e}')
        return None


def main():
    limit = 50
    for arg in sys.argv[1:]:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])

    print(f'\n{"─"*60}')
    print(f'  getdatewith.me — AI Venue Analyzer')
    print(f'  Limit: {limit} mekan')
    print(f'{"─"*60}\n')

    conn = get_conn()
    venues = fetch_unanalyzed(conn, limit)
    print(f'{len(venues)} analiz edilmemiş mekan bulundu\n')

    success = 0
    for i, venue in enumerate(venues, 1):
        print(f'[{i}/{len(venues)}] {venue["name"]} ({venue["city"]})')
        analysis = analyze_venue(venue)
        if analysis:
            save_analysis(conn, venue['id'], analysis)
            print(f'  ✓ dateSkor={analysis.get("dateSkor")} gnoSkor={analysis.get("gnoSkor")} atmosfer={analysis.get("atmosfer")}')
            success += 1
        time.sleep(0.3)

    conn.close()

    print(f'\n{"═"*60}')
    print(f'  TAMAMLANDI: {success}/{len(venues)} mekan analiz edildi')
    print(f'  Tahmini maliyet: ~${success * 0.0003:.2f} (Haiku)')
    print(f'{"═"*60}\n')


if __name__ == '__main__':
    main()
