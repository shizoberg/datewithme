import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface GuideEntry {
  id: string
  title: string
  slug: string
  coverImage: string | null
  content: string
  city: string | null
  venueName: string | null
  publishedAt: string | null
  author: { name: string; avatarColor: string } | null
}

function excerpt(content: string, len = 140): string {
  const plain = content.replace(/[#*_>`]/g, '').trim()
  return plain.length > len ? plain.slice(0, len) + '…' : plain
}

export default function RehberPage() {
  const [entries, setEntries] = useState<GuideEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { document.title = 'Rehber — getdatewith.me' }, [])

  useEffect(() => {
    api.get('/api/guide').then(r => setEntries(r.data)).catch(() => setEntries([])).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', background: '#FFFFFF', color: '#0D0D0D' }}>

      <div className="page-content" style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '32px' }}>
        <div style={{ display: 'inline-block', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#00C060', letterSpacing: '2px', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>
          ✦ Rehber
        </div>
        <h1 className="page-h1" style={{ fontSize: 'clamp(28px, 7vw, 42px)', letterSpacing: '-1px', marginBottom: '12px' }}>
          Gerçekten gidip<br />
          <span style={{ color: '#00C060' }}>gördüklerimiz.</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#777', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto' }}>
          Topluluğumuz ve içerik üreticilerimizden birinci ağızdan mekan deneyimleri.
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>Yükleniyor…</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📝</div>
            <p style={{ fontSize: '16px' }}>Henüz yazı yok, çok yakında burada olacak.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {entries.map(e => (
              <Link key={e.id} to={`/rehber/${e.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #E8E8E8', borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {e.coverImage ? (
                    <div style={{ height: '150px', background: '#F0F0F0' }}>
                      <img src={e.coverImage} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: '100px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📍</div>
                  )}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {e.city && <span style={{ fontSize: '11px', color: '#00C060', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{e.city}{e.venueName ? ` · ${e.venueName}` : ''}</span>}
                    <div style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.3 }}>{e.title}</div>
                    <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, margin: 0, flex: 1 }}>{excerpt(e.content)}</p>
                    {e.author && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: e.author.avatarColor, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {e.author.name[0]}
                        </div>
                        <span style={{ fontSize: '12px', color: '#777' }}>{e.author.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
