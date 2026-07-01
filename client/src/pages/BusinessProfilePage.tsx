import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Business {
  id: string
  businessName: string
  slug: string
  description?: string
  logoUrl?: string
  city?: string
  website?: string
  instagram?: string
  highlights?: string  // JSON array
  status: string
}

export default function BusinessProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/api/leads/profile/${slug}`)
      .then(r => {
        if (r.data.status !== 'approved') { setNotFound(true); return }
        setBusiness(r.data)
        document.title = `${r.data.businessName} — getdatewith.me`
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px' }}>
        Yükleniyor…
      </div>
    )
  }

  if (notFound || !business) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', gap: '12px' }}>
        <div style={{ fontSize: '40px' }}>🏪</div>
        <div style={{ fontWeight: 700, fontSize: '18px', color: '#EEE' }}>Profil bulunamadı</div>
        <Link to="/" style={{ color: '#00F680', textDecoration: 'none', fontSize: '14px' }}>Ana sayfaya dön</Link>
      </div>
    )
  }

  let highlights: string[] = []
  try { highlights = business.highlights ? JSON.parse(business.highlights) : [] } catch { highlights = [] }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#F0F0F0', fontFamily: 'Raleway, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #111827 60%, #1A1A1A 100%)', borderBottom: '1px solid #1A1A1A', padding: '60px 24px 48px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          {/* Logo */}
          {business.logoUrl ? (
            <img src={business.logoUrl} alt={business.businessName}
              style={{ width: '90px', height: '90px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #222', marginBottom: '20px' }} />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '20px', background: '#1A1A1A', border: '2px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 20px' }}>
              🏪
            </div>
          )}

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#00F68015', border: '1px solid #00F68040', borderRadius: '9999px', padding: '4px 14px', marginBottom: '16px' }}>
            <span style={{ color: '#00F680', fontSize: '11px', fontWeight: 800, letterSpacing: '0.5px' }}>✦ KURUMSAL ORTAK</span>
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '8px' }}>
            {business.businessName}
          </h1>

          {business.city && (
            <div style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>📍 {business.city}</div>
          )}

          {business.description && (
            <p style={{ color: '#AAA', fontSize: '15px', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 24px' }}>
              {business.description}
            </p>
          )}

          {/* Links */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {business.website && (
              <a href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 20px', background: '#00F680', color: '#000', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', textDecoration: 'none' }}>
                🌐 Website
              </a>
            )}
            {business.instagram && (
              <a href={business.instagram.startsWith('http') ? business.instagram : `https://instagram.com/${business.instagram.replace(/^@/, '')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 20px', background: '#1A1A1A', color: '#EEE', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', textDecoration: 'none', border: '1px solid #2A2A2A' }}>
                📸 Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px 0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: '#EEE', letterSpacing: '-0.3px' }}>Öne Çıkan Detaylar</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {highlights.map((h, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '14px 20px', fontSize: '14px', color: '#DDD', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#00F680', fontSize: '16px' }}>✦</span>
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#555', textDecoration: 'none', fontSize: '13px' }}>
          getdatewith.me ile keşfet →
        </Link>
      </div>
    </div>
  )
}
