import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import CommunityBanner from '../components/CommunityBanner'
import { BookmarkIcon } from '../components/icons'
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

function VenueCard({ venue, saved, onToggle }: { venue: Venue; saved: boolean; onToggle: (id: string) => void }) {
  const cat = CATEGORIES.find(c => c.value === venue.category)
  const mapsUrl = isRealUrl(venue.googleMapsUrl) ? venue.googleMapsUrl : null
  const igLink = igUrl(venue.instagramUrl)

  return (
    <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {venue.imageUrl ? (
        <div style={{ height: '160px', background: '#1A1A1A', overflow: 'hidden' }}>
          <img src={venue.imageUrl} alt={venue.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ height: '100px', background: '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
          {cat?.emoji ?? '📍'}
        </div>
      )}
      <button
        onClick={e => { e.stopPropagation(); onToggle(venue.id) }}
        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(13,13,13,0.75)', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={saved ? 'Kaydedildi' : 'Kaydet'}
      >
        <BookmarkIcon filled={saved} />
      </button>
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

const getSaved = (): string[] => {
  try { return JSON.parse(localStorage.getItem('savedVenues') || '[]') } catch { return [] }
}
const toggleSave = (id: string): string[] => {
  const saved = getSaved()
  const next = saved.includes(id) ? saved.filter(s => s !== id) : [...saved, id]
  localStorage.setItem('savedVenues', JSON.stringify(next))
  return next
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [savedIds, setSavedIds] = useState<string[]>(getSaved)

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
      <AppHeader rightContent={<Link to="/topluluk" style={{ color: '#00F680', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>+ Mekan Ekle</Link>} />

      {/* HERO */}
      <div className="page-content" style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '32px' }}>
        <div style={{ display: 'inline-block', background: '#111', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#00F680', letterSpacing: '2px', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>
          ✦ Mekan Rehberi
        </div>
        <h1 className="page-h1" style={{ fontSize: 'clamp(28px, 7vw, 42px)', letterSpacing: '-1px', marginBottom: '12px' }}>
          Şehrinin en iyi<br />
          <span style={{ color: '#00F680' }}>buluşma mekanları.</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto' }}>
          Topluluk tarafından derlendi. Date için, GNO için.
        </p>
      </div>

      {/* FILTERS */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 32px', boxSizing: 'border-box' }}>
        <select value={city} onChange={e => setCity(e.target.value)}
          style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', width: '100%', marginBottom: '12px', outline: 'none', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', boxSizing: 'border-box' }}>
          <option value="">Tüm Şehirler</option>
          <option value="İstanbul">İstanbul</option>
          <option value="İzmir">İzmir</option>
          <option value="Ankara">Ankara</option>
        </select>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none', marginBottom: '12px' } as React.CSSProperties}>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setCategory(cat.value)}
              style={{ background: category === cat.value ? 'rgba(0,246,128,0.12)' : '#111', border: `1px solid ${category === cat.value ? 'rgba(0,246,128,0.4)' : '#2A2A2A'}`, borderRadius: '9999px', padding: '8px 14px', color: category === cat.value ? '#00F680' : '#888', fontSize: '13px', fontWeight: category === cat.value ? 700 : 400, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', flexShrink: 0 }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
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
            {filtered.map(v => (
              <VenueCard
                key={v.id}
                venue={v}
                saved={savedIds.includes(v.id)}
                onToggle={id => setSavedIds(toggleSave(id))}
              />
            ))}
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
      <div style={{ height: '80px' }} />
    </div>
  )
}
