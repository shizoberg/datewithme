import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { useAuth } from '../context/AuthContext'
import { PlanIcon, BookmarkIcon, RouteIcon } from '../components/icons'

interface SavedVenue {
  id: string; name: string; category: string; city: string; district: string
  googleMapsUrl?: string | null; instagramUrl?: string | null; rating?: number | null
  imageUrl?: string | null
}

const mockPlans = [
  { id: '1', name: 'Cumartesi Gecesi', date: '28 Haziran 2026', stops: 3 },
  { id: '2', name: 'Pazar Brunch', date: '29 Haziran 2026', stops: 2 },
]

const mockRoutes = [
  { id: '1', name: 'Kadıköy Turu', city: 'İstanbul', stops: 4, savedAt: '15 Haziran 2026' },
]

const CAT_EMOJI: Record<string, string> = {
  cafe: '☕', restaurant: '🍽️', bar: '🍸', park: '🌿', rooftop: '🌆', cultural: '🎨',
}

const TABS = ['Planlarım', 'Rotalarım', 'Mekanlarım', 'Etkinliklerim']

export default function ProfilePage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(false)

  useEffect(() => {
    document.title = 'Profilim — getdatewith.me'
  }, [])

  useEffect(() => {
    if (activeTab !== 2) return
    const ids: string[] = (() => {
      try { return JSON.parse(localStorage.getItem('savedVenues') || '[]') } catch { return [] }
    })()
    if (ids.length === 0) { setSavedVenues([]); return }
    setVenuesLoading(true)
    const base = import.meta.env.VITE_API_URL || ''
    fetch(`${base}/api/venues/all`)
      .then(r => r.json())
      .then(data => setSavedVenues((data.venues || []).filter((v: SavedVenue) => ids.includes(v.id))))
      .catch(() => setSavedVenues([]))
      .finally(() => setVenuesLoading(false))
  }, [activeTab])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555' }}>Yükleniyor…</p>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
      <AppHeader rightContent={
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #2A2A2A', borderRadius: '100px', padding: '5px 12px', color: '#666', fontSize: '12px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Çıkış</button>
      } />

      <div className="page-content">
        {/* Profil kartı */}
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#00F680', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '22px', color: '#0D0D0D', flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: '#fff' }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>@{user.username}</div>
          </div>
          <Link to="/dashboard" style={{ background: 'none', border: '1px solid #00F680', borderRadius: '100px', padding: '7px 16px', color: '#00F680', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
            Planlarım
          </Link>
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid #2A2A2A', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === i ? '2px solid #00F680' : '2px solid transparent',
              padding: '10px 16px', color: activeTab === i ? '#00F680' : '#555',
              fontSize: '13px', fontWeight: activeTab === i ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Planlarım */}
        {activeTab === 0 && (
          mockPlans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#555' }}>
              <PlanIcon />
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>Henüz plan oluşturmadın.</div>
              <Link to="/dashboard" style={{ color: '#00F680', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>İlk Planını Yap →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {mockPlans.map(plan => (
                <div key={plan.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>{plan.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{plan.date}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>{plan.stops} durak</div>
                  <Link to="/dashboard" style={{ display: 'block', background: '#00F680', color: '#0D0D0D', border: 'none', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                    Görüntüle
                  </Link>
                </div>
              ))}
            </div>
          )
        )}

        {/* Rotalarım */}
        {activeTab === 1 && (
          mockRoutes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#555' }}>
              <RouteIcon />
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>Henüz rota kaydetmedin.</div>
              <Link to="/bulusma-mekanlari" style={{ color: '#00F680', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Mekanlara Bak →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockRoutes.map(route => (
                <div key={route.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px' }}>{route.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>{route.city} · {route.stops} durak · {route.savedAt}</div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#555', background: '#111', border: '1px solid #2A2A2A', borderRadius: '6px', padding: '4px 8px' }}>Yakında</span>
                </div>
              ))}
            </div>
          )
        )}

        {/* Mekanlarım */}
        {activeTab === 2 && (
          venuesLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#555' }}>Yükleniyor…</div>
          ) : savedVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#555' }}>
              <BookmarkIcon />
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>Henüz mekan kaydetmedin.</div>
              <Link to="/bulusma-mekanlari" style={{ color: '#00F680', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Mekanlara Bak →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {savedVenues.map(v => (
                <div key={v.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{v.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{CAT_EMOJI[v.category] ?? '📍'} {v.district}, {v.city}</div>
                  {v.rating && <div style={{ fontSize: '12px', color: '#00F680', marginTop: '4px' }}>★ {v.rating}</div>}
                  {v.googleMapsUrl && (
                    <a href={v.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>
                      🗺️ Haritada gör
                    </a>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Etkinliklerim */}
        {activeTab === 3 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#555' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
            <div style={{ marginBottom: '16px' }}>Etkinlik özellikleri yakında geliyor.</div>
            <Link to="/topluluk" style={{ color: '#00F680', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Topluluğa Katıl →</Link>
          </div>
        )}
      </div>

      <div style={{ height: '80px' }} />
    </div>
  )
}
