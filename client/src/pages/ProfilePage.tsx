import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PlanIcon, BookmarkIcon, RouteIcon } from '../components/icons'
import { AvatarDisplay } from '../components/avatars'
import { api } from '../lib/api'

interface SavedVenue {
  id: string; name: string; category: string; city: string; district: string
  googleMapsUrl?: string | null; rating?: number | null
}

interface Triplist {
  id: string; title: string; slug: string; city: string
  isPublic: boolean; viewCount: number; likeCount: number
  stops: { venueName: string }[]
  createdAt: string
}

const CAT_EMOJI: Record<string, string> = {
  cafe: '☕', restaurant: '🍽️', bar: '🍸', park: '🌿', rooftop: '🌆', cultural: '🎨',
}

const TABS = ['Planlarım', 'Rotalarım', 'Mekanlarım', 'Etkinliklerim']

const card: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: '12px', padding: '16px',
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(false)
  const [triplists, setTriplists] = useState<Triplist[]>([])
  const [triplistsLoading, setTriplistsLoading] = useState(false)

  useEffect(() => { document.title = 'Profilim — getdatewith.me' }, [])

  useEffect(() => {
    if (activeTab !== 0) return
    setTriplistsLoading(true)
    api.get('/api/triplists/mine')
      .then(r => setTriplists(r.data))
      .catch(() => setTriplists([]))
      .finally(() => setTriplistsLoading(false))
  }, [activeTab])

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
      <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Yükleniyor…</p>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>

      <div className="page-content">
        {/* Profil kartı */}
        <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: user.bio || user.personalityTags ? '16px' : '0' }}>
            {user.avatarId ? (
              <AvatarDisplay avatarId={user.avatarId} size={64} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#00C060', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '24px', color: '#fff', flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#0D0D0D' }}>{user.name}</div>
              <div style={{ fontSize: '13px', color: '#777', marginTop: '2px' }}>@{user.username}</div>
              {user.city && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  📍 {user.district ? `${user.district}, ` : ''}{user.city}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
              <Link to="/dashboard" style={{ background: 'none', border: '1px solid #00C060', borderRadius: '100px', padding: '7px 16px', color: '#00C060', fontSize: '13px', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: '100px', padding: '7px 16px', color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                Çıkış
              </button>
            </div>
          </div>
          {user.bio && (
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, margin: '0 0 12px' }}>{user.bio}</p>
          )}
          {user.personalityTags && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {user.personalityTags.split(',').map(tag => (
                <span key={tag} style={{ background: 'rgba(0,192,96,0.08)', border: '1px solid rgba(0,192,96,0.2)', borderRadius: '100px', padding: '4px 12px', fontSize: '12px', color: '#00C060', fontWeight: 500 }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sekmeler */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid #E8E8E8', overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              background: 'none', border: 'none',
              borderBottom: activeTab === i ? '2px solid #00C060' : '2px solid transparent',
              padding: '10px 16px', color: activeTab === i ? '#00C060' : '#777',
              fontSize: '13px', fontWeight: activeTab === i ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Planlarım — gerçek triplist verileri */}
        {activeTab === 0 && (
          triplistsLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>Yükleniyor…</div>
          ) : triplists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗺️</div>
              <div style={{ marginBottom: '16px', fontSize: '15px' }}>Henüz triplist oluşturmadın.</div>
              <Link to="/plan/yeni" style={{ color: '#00C060', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>İlk Rotanı Oluştur →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {triplists.map(t => (
                <div key={t.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: '12px', color: '#777' }}>
                      📍 {t.city} · {t.stops.length} durak · {t.isPublic ? '🌐 Herkese açık' : '🔒 Gizli'} · 👁 {t.viewCount} · ❤️ {t.likeCount}
                    </div>
                  </div>
                  <Link to={`/${user.username}/triplist/${t.slug}`}
                    style={{ flexShrink: 0, fontSize: '13px', color: '#00C060', fontWeight: 600, textDecoration: 'none', border: '1px solid #00C060', borderRadius: '8px', padding: '6px 12px' }}>
                    Görüntüle →
                  </Link>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Link to="/plan/yeni" style={{ color: '#00C060', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>+ Yeni Triplist Oluştur</Link>
              </div>
            </div>
          )
        )}

        {/* Rotalarım */}
        {activeTab === 1 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
            <RouteIcon />
            <div style={{ marginTop: '12px', marginBottom: '16px' }}>Kaydedilen rotalar yakında burada.</div>
            <Link to="/bulusma-mekanlari" style={{ color: '#00C060', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Mekanlara Bak →</Link>
          </div>
        )}

        {/* Mekanlarım */}
        {activeTab === 2 && (
          venuesLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>Yükleniyor…</div>
          ) : savedVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
              <BookmarkIcon />
              <div style={{ marginTop: '12px', marginBottom: '16px' }}>Henüz mekan kaydetmedin.</div>
              <Link to="/bulusma-mekanlari" style={{ color: '#00C060', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Mekanlara Bak →</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {savedVenues.map(v => (
                <div key={v.id} style={card}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{v.name}</div>
                  <div style={{ fontSize: '12px', color: '#777' }}>{CAT_EMOJI[v.category] ?? '📍'} {v.district}, {v.city}</div>
                  {v.rating && <div style={{ fontSize: '12px', color: '#00C060', marginTop: '4px' }}>★ {v.rating}</div>}
                  {v.googleMapsUrl && (
                    <a href={v.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: '#4A90E2', textDecoration: 'none' }}>
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
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
            <div style={{ marginBottom: '16px' }}>Etkinlik özellikleri yakında geliyor.</div>
            <Link to="/topluluk" style={{ color: '#00C060', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>Topluluğa Katıl →</Link>
          </div>
        )}
      </div>

      <div style={{ height: '80px' }} />
    </div>
  )
}
