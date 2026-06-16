import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CommunityBanner from '../components/CommunityBanner'
import { api } from '../lib/api'

interface Venue {
  id: string
  name: string
  category: string
  city: string
  district: string
  address: string | null
  googleMapsUrl: string | null
  instagramUrl: string | null
  rating: number | null
  priceLevel: number | null
  imageUrl: string | null
  description: string | null
}

const CATEGORIES = [
  { value: '',          label: 'Tümü',            emoji: '✦' },
  { value: 'cafe',      label: 'Kafe',             emoji: '☕' },
  { value: 'restaurant',label: 'Restoran',          emoji: '🍽️' },
  { value: 'bar',       label: 'Bar',              emoji: '🍸' },
  { value: 'park',      label: 'Park / Açık Alan', emoji: '🌿' },
  { value: 'rooftop',   label: 'Rooftop',          emoji: '🌆' },
  { value: 'cultural',  label: 'Kültürel',         emoji: '🎨' },
]

const CITIES = ['', 'İstanbul', 'Ankara', 'İzmir']

function isRealUrl(url: string | null | undefined): url is string {
  return !!url && url.startsWith('https://') && url.length > 35
}

function igUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(/instagram\.com\/([^/?#]+)/)
  if (m) return `https://instagram.com/${m[1]}`
  return url.startsWith('http') ? url : `https://instagram.com/${url.replace(/^@/, '')}`
}

function PriceDots({ level }: { level: number | null }) {
  if (!level) return null
  return (
    <span style={{ color: '#666', fontSize: '12px' }}>
      {'₺'.repeat(level)}{'₺'.repeat(3 - level).split('').map(() => '·').join('')}
    </span>
  )
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <span style={{ color: '#00F680', fontSize: '13px', fontWeight: 700 }}>
      ★ {rating.toFixed(1)}
    </span>
  )
}

function VenueCard({ venue }: { venue: Venue }) {
  const cat = CATEGORIES.find(c => c.value === venue.category)
  const mapsUrl = isRealUrl(venue.googleMapsUrl) ? venue.googleMapsUrl : null
  const igLink = igUrl(venue.instagramUrl)

  return (
    <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {venue.imageUrl ? (
        <div style={{ height: '160px', background: '#1A1A1A', overflow: 'hidden' }}>
          <img src={venue.imageUrl} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ height: '100px', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          {cat?.emoji ?? '📍'}
        </div>
      )}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', lineHeight: 1.3 }}>{venue.name}</div>
          <StarRating rating={venue.rating} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '3px 10px', fontSize: '11px', color: '#888' }}>
            {cat?.emoji} {cat?.label ?? venue.category}
          </span>
          <span style={{ fontSize: '12px', color: '#555' }}>{venue.district}, {venue.city}</span>
          <PriceDots level={venue.priceLevel} />
        </div>
        {venue.description && (
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, margin: 0 }}>{venue.description}</p>
        )}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '9px 12px', color: '#ccc', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Harita
            </a>
          )}
          {igLink && (
            <a href={igLink} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '9px 12px', color: '#ccc', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { document.title = 'Buluşma Mekanları — getdatewith.me' }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (city) params.set('city', city)
    if (category) params.set('category', category)
    api.get(`/api/venues/all?${params.toString()}`)
      .then(r => setVenues(r.data.venues))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false))
  }, [city, category])

  const filtered = venues.filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.district.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif' }}>
      {/* NAV */}
      <nav className="desktop-nav" style={{ borderBottom: '1px solid #1A1A1A', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0D0D0D', zIndex: 50 }}>
        <Link to="/" style={{ fontSize: '18px', fontWeight: 900, color: '#00F680', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          getdatewith.me
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/topluluk" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00F680', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '7px 14px', border: '1px solid rgba(0,246,128,0.3)', borderRadius: '9999px', background: 'rgba(0,246,128,0.06)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Topluluk
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '64px 24px 48px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#111', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#00F680', letterSpacing: '2px', fontWeight: 700, marginBottom: '28px', textTransform: 'uppercase' }}>
          ✦ Mekan Rehberi
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(32px, 7vw, 52px)', lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: '16px' }}>
          Şehrinin en iyi<br />
          <span style={{ color: '#00F680' }}>buluşma mekanları.</span>
        </h1>
        <p style={{ fontSize: '16px', color: '#888', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
          Topluluk tarafından derlendi. Date için, GNO için, her türlü buluşma için.
        </p>
      </section>

      {/* FILTERS */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 32px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <select value={city} onChange={e => setCity(e.target.value)}
            style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '10px 16px', color: city ? '#fff' : '#666', fontSize: '14px', fontFamily: 'Raleway, sans-serif', cursor: 'pointer', minWidth: '140px' }}>
            <option value="">Tüm şehirler</option>
            {CITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                style={{ background: category === cat.value ? 'rgba(0,246,128,0.12)' : '#111', border: `1px solid ${category === cat.value ? 'rgba(0,246,128,0.4)' : '#2A2A2A'}`, borderRadius: '9999px', padding: '8px 16px', color: category === cat.value ? '#00F680' : '#888', fontSize: '13px', fontWeight: category === cat.value ? 700 : 400, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Mekan veya semt ara…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '12px 18px', color: '#fff', fontSize: '14px', fontFamily: 'Raleway, sans-serif', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {/* GRID */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#555' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗺️</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Mekan bulunamadı.</p>
            <p style={{ fontSize: '13px', color: '#444' }}>Filtreni değiştir veya <Link to="/topluluk" style={{ color: '#00F680' }}>sen öner!</Link></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map(v => <VenueCard key={v.id} venue={v} />)}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>Favori mekanın listede yok mu?</p>
          <Link to="/topluluk" style={{ display: 'inline-block', background: '#00F680', color: '#0D0D0D', textDecoration: 'none', borderRadius: '9999px', padding: '13px 28px', fontSize: '14px', fontWeight: 800 }}>
            Mekan Öner →
          </Link>
        </div>
      </div>

      <CommunityBanner />
    </div>
  )
}
