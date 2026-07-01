import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface VenuePin {
  id: string
  name: string
  category: string
  city: string
  district: string
  lat: number
  lng: number
  rating: number | null
  isFeatured: boolean | null
  featuredBy: string | null
  imageUrl: string | null
}

const CAT_COLORS: Record<string, string> = {
  cafe: '#F59E0B', restaurant: '#EF4444', bar: '#8B5CF6',
  park: '#10B981', rooftop: '#3B82F6', cultural: '#EC4899',
  koy: '#06B6D4', doga: '#22C55E', antik: '#A16207', default: '#6B7280',
}

const CAT_LABEL: Record<string, string> = {
  cafe: 'Kafe', restaurant: 'Restoran', bar: 'Bar', park: 'Park',
  rooftop: 'Rooftop', cultural: 'Kültürel', koy: 'Koy & Plaj',
  doga: 'Doğa', antik: 'Tarihi',
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)
  const [venues, setVenues] = useState<VenuePin[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCity, setActiveCity] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [selectedVenue, setSelectedVenue] = useState<VenuePin | null>(null)

  useEffect(() => { document.title = 'Harita — getdatewith.me' }, [])

  useEffect(() => {
    api.get('/api/venues/map').then(r => setVenues(r.data)).catch(() => setVenues([])).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || !mapRef.current || mapInstance.current) return

    // Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
      }
    }
  }, [loading, venues])

  function initMap() {
    if (!mapRef.current || !window.L) return
    const L = window.L

    const map = L.map(mapRef.current, {
      center: [39.0, 35.2],
      zoom: 6,
      zoomControl: true,
    })
    mapInstance.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 18,
    }).addTo(map)

    addMarkers(map, venues)
  }

  function addMarkers(map: unknown, pins: VenuePin[]) {
    const L = window.L
    const m = map as { addLayer: (l: unknown) => void } // eslint-disable-line

    pins.forEach(v => {
      const color = v.isFeatured && v.featuredBy === 'admin'
        ? '#F59E0B'
        : v.isFeatured ? '#8B5CF6'
        : CAT_COLORS[v.category] || CAT_COLORS.default

      const size = v.isFeatured ? 14 : 10
      const borderColor = v.isFeatured ? '#fff' : 'rgba(255,255,255,0.7)'

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${borderColor};box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;${v.isFeatured ? 'width:16px;height:16px' : ''}"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker([v.lat, v.lng], { icon })
      marker.bindTooltip(`<b>${v.name}</b><br><span style="color:#666;font-size:11px">${v.district ? v.district + ', ' : ''}${v.city}</span>`, {
        direction: 'top', offset: [0, -8],
      })
      marker.on('click', () => setSelectedVenue(v))
      m.addLayer(marker)
    })
  }

  const filtered = venues.filter(v =>
    (!activeCity || v.city === activeCity) &&
    (!activeCategory || v.category === activeCategory)
  )

  const cities = [...new Set(venues.map(v => v.city))].sort()
  const categories = [...new Set(venues.map(v => v.category))].sort()

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', background: '#F8F8F8', color: '#0D0D0D', display: 'flex', flexDirection: 'column' }}>

      <div style={{ padding: '16px 20px 0', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            ✦ <span style={{ color: '#00C060' }}>{filtered.length}</span> mekan haritada
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={activeCity} onChange={e => setActiveCity(e.target.value)}
              style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '9999px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', outline: 'none' }}>
              <option value="">Tüm Şehirler</option>
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
              style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: '9999px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', outline: 'none' }}>
              <option value="">Tüm Kategoriler</option>
              {categories.map(c => <option key={c} value={c}>{CAT_LABEL[c] || c}</option>)}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {Object.entries(CAT_LABEL).map(([k, v]) => (
            <button key={k} onClick={() => setActiveCategory(activeCategory === k ? '' : k)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: activeCategory === k ? `${CAT_COLORS[k]}15` : '#fff', border: `1px solid ${activeCategory === k ? CAT_COLORS[k] : '#E0E0E0'}`, borderRadius: '9999px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: activeCategory === k ? 700 : 400 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CAT_COLORS[k], flexShrink: 0 }} />
              {v}
            </button>
          ))}
          <button onClick={() => setActiveCategory('')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FFF7E6', border: '1px solid #F59E0B', borderRadius: '9999px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B', border: '2px solid white', flexShrink: 0 }} />
            Berk'in Seçimi
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 20px 20px', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#777' }}>Harita yükleniyor…</div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div ref={mapRef} style={{ height: '580px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E8E8E8', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }} />

            {selectedVenue && (
              <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                background: '#fff', borderRadius: '16px', padding: '16px 20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: '260px', maxWidth: '340px',
                border: `2px solid ${selectedVenue.isFeatured && selectedVenue.featuredBy === 'admin' ? '#F59E0B' : selectedVenue.isFeatured ? '#8B5CF6' : '#E8E8E8'}`,
                zIndex: 1000,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px' }}>{selectedVenue.name}</div>
                    <div style={{ fontSize: '12px', color: '#777' }}>{selectedVenue.district ? `${selectedVenue.district}, ` : ''}{selectedVenue.city}</div>
                  </div>
                  <button onClick={() => setSelectedVenue(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#999', lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span style={{ background: `${CAT_COLORS[selectedVenue.category] || '#888'}18`, color: CAT_COLORS[selectedVenue.category] || '#888', borderRadius: '9999px', padding: '2px 9px', fontSize: '11px', fontWeight: 700 }}>
                    {CAT_LABEL[selectedVenue.category] || selectedVenue.category}
                  </span>
                  {selectedVenue.rating && <span style={{ color: '#00C060', fontSize: '12px', fontWeight: 700 }}>★ {selectedVenue.rating.toFixed(1)}</span>}
                  {selectedVenue.isFeatured && (
                    <span style={{ background: selectedVenue.featuredBy === 'admin' ? '#FFF7E6' : '#F5F3FF', color: selectedVenue.featuredBy === 'admin' ? '#F59E0B' : '#8B5CF6', borderRadius: '9999px', padding: '2px 9px', fontSize: '11px', fontWeight: 700 }}>
                      {selectedVenue.featuredBy === 'admin' ? "★ Berk'in Seçimi" : '✦ Influencer Tavsiyesi'}
                    </span>
                  )}
                </div>
                <Link to="/bulusma-mekanlari" style={{ display: 'block', textAlign: 'center', color: '#00C060', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                  Tüm mekanlara git →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
