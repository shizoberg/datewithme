import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
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
  author: { name: string; avatarColor: string; instagram: string | null } | null
}

export default function RehberDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [entry, setEntry] = useState<GuideEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/api/guide/${slug}`)
      .then(r => { setEntry(r.data); document.title = `${r.data.title} — Rehber — getdatewith.me` })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Raleway, sans-serif' }}>Yükleniyor…</div>
  }
  if (notFound || !entry) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif' }}>
        <AppHeader />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p style={{ fontSize: '16px', color: '#555', marginBottom: '12px' }}>Bu yazı bulunamadı.</p>
          <Link to="/rehber" style={{ color: '#00C060', fontWeight: 700, textDecoration: 'none' }}>← Rehber'e dön</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', background: '#FFFFFF', color: '#0D0D0D' }}>
      <AppHeader />
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <Link to="/rehber" style={{ color: '#00C060', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>← Rehber</Link>

        {entry.city && (
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#00C060', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {entry.city}{entry.venueName ? ` · ${entry.venueName}` : ''}
          </div>
        )}
        <h1 style={{ fontSize: 'clamp(26px, 6vw, 38px)', letterSpacing: '-1px', margin: '10px 0 16px' }}>{entry.title}</h1>

        {entry.author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: entry.author.avatarColor, color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {entry.author.name[0]}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{entry.author.name}</div>
              {entry.publishedAt && <div style={{ fontSize: '11px', color: '#999' }}>{new Date(entry.publishedAt).toLocaleDateString('tr-TR')}</div>}
            </div>
          </div>
        )}

        {entry.coverImage && (
          <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '28px' }}>
            <img src={entry.coverImage} alt={entry.title} style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#222', whiteSpace: 'pre-wrap' }}>
          {entry.content}
        </div>
      </div>
    </div>
  )
}
