import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Influencer {
  id: string
  name: string
  city: string
  instagram?: string | null
  followers?: string | null
  niche?: string | null
  bio?: string | null
  avatarColor: string
  status: string
  guideEntries?: GuideEntry[]
}

interface GuideEntry {
  id: string
  title: string
  slug: string
  coverImage?: string | null
  content: string
  city?: string | null
  venueName?: string | null
  publishedAt?: string | null
}

function excerpt(content: string, len = 120): string {
  const plain = content.replace(/[#*_>`]/g, '').trim()
  return plain.length > len ? plain.slice(0, len) + '…' : plain
}

const IcInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const IcPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#8B5CF6" stroke="#8B5CF6" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

export default function InfluencerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [influencer, setInfluencer] = useState<Influencer | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/api/influencers/${id}`)
      .then(r => {
        if (r.data.status !== 'approved') { setNotFound(true); return }
        setInfluencer(r.data)
        document.title = `${r.data.name} — getdatewith.me`
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Raleway, sans-serif', color: '#777' }}>
      Yükleniyor…
    </div>
  )

  if (notFound || !influencer) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <p style={{ color: '#555' }}>Bu profil bulunamadı.</p>
      <Link to="/" style={{ color: '#00C060', fontWeight: 700, textDecoration: 'none' }}>Ana sayfaya dön</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', background: '#FAFAFA', color: '#0D0D0D' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A0533 0%, #2D0B5C 60%, #4C1D95 100%)', padding: '60px 20px 40px', textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: influencer.avatarColor, color: '#fff', fontSize: '32px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid rgba(139,92,246,0.6)', boxShadow: '0 0 24px rgba(139,92,246,0.4)' }}>
          {influencer.name[0].toUpperCase()}
        </div>

        {/* Influencer badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '9999px', padding: '4px 12px', fontSize: '11px', color: '#C4B5FD', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          <IcStar /> Platform İçerik Üreticisi
        </div>

        <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          {influencer.name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
          {influencer.city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#C4B5FD', fontSize: '13px' }}>
              <IcPin /> {influencer.city}
            </span>
          )}
          {influencer.instagram && (
            <a href={`https://instagram.com/${influencer.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#C4B5FD', fontSize: '13px', textDecoration: 'none' }}>
              <IcInstagram /> {influencer.instagram}
            </a>
          )}
          {influencer.followers && (
            <span style={{ color: '#C4B5FD', fontSize: '13px' }}>
              {influencer.followers} takipçi
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Bio */}
        {influencer.bio && (
          <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#8B5CF6', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Hakkında</div>
            <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7, margin: 0 }}>{influencer.bio}</p>
          </div>
        )}

        {/* Niche pills */}
        {influencer.niche && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            {influencer.niche.split(/[,&]/).map((n, i) => (
              <span key={i} style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '9999px', padding: '5px 14px', fontSize: '12px', fontWeight: 700, color: '#6D28D9' }}>
                {n.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Guide entries */}
        {influencer.guideEntries && influencer.guideEntries.length > 0 && (
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#8B5CF6', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Rehber Yazıları
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {influencer.guideEntries.map(e => (
                <Link key={e.id} to={`/rehber/${e.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', height: '100%' }}>
                    {e.coverImage ? (
                      <img src={e.coverImage} alt={e.title} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ height: '80px', background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IcStar />
                      </div>
                    )}
                    <div style={{ padding: '14px' }}>
                      {e.city && <div style={{ fontSize: '10px', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>{e.city}{e.venueName ? ` · ${e.venueName}` : ''}</div>}
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', lineHeight: 1.3 }}>{e.title}</div>
                      <p style={{ fontSize: '12px', color: '#777', lineHeight: 1.5, margin: 0 }}>{excerpt(e.content)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(!influencer.guideEntries || influencer.guideEntries.length === 0) && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#AAA' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.4 }}>✦</div>
            <p style={{ fontSize: '14px' }}>Henüz rehber yazısı yok, yakında burada.</p>
          </div>
        )}
      </div>
    </div>
  )
}
