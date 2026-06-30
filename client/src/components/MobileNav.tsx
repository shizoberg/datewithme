import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HomeIcon, MapPinIcon, UserIcon, PlusIcon } from './icons'

// SVG icon bileşenleri
const IcTriplist = ({ c }: { c: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/>
    <circle cx="3" cy="17" r="2" fill={c} stroke="none"/>
    <circle cx="12" cy="7" r="2" fill={c} stroke="none"/>
    <circle cx="21" cy="17" r="2" fill={c} stroke="none"/>
  </svg>
)
const IcMapPin = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IcMap = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)
const IcRoute = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/>
    <circle cx="3" cy="17" r="2" fill={c} stroke="none"/>
    <circle cx="12" cy="7" r="2" fill={c} stroke="none"/>
    <circle cx="21" cy="17" r="2" fill={c} stroke="none"/>
  </svg>
)
const IcBook = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const IcBriefcase = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
)
const IcStar = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const IcDashboard = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IcUser = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IcLogout = ({ c }: { c: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const path = location.pathname
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (to: string) => to === '/' ? path === '/' : path.startsWith(to)
  function closeAll() { setCreateOpen(false); setProfileOpen(false) }

  async function handleLogout() {
    closeAll()
    await logout()
    navigate('/login')
  }

  const navBtnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '3px', textDecoration: 'none', color: active ? '#00C060' : '#999',
    minWidth: '52px', padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Raleway, sans-serif',
  })
  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '10px', fontFamily: 'Raleway, sans-serif', fontWeight: active ? 600 : 400,
  })

  const profileActive = isActive('/profil') || isActive('/dashboard')

  const EXPLORE_ITEMS = [
    { to: '/bulusma-mekanlari', label: 'Mekanlar',    icon: IcMapPin,    color: '#00C060' },
    { to: '/harita',            label: 'Harita',       icon: IcMap,       color: '#3B82F6' },
    { to: '/topluluk',          label: 'Triplist',     icon: IcRoute,     color: '#D97706' },
    { to: '/rehber',            label: 'Rehber',       icon: IcBook,      color: '#8B5CF6' },
    { to: '/kurumsal',          label: 'Kurumsal',     icon: IcBriefcase, color: '#059669' },
    { to: '/influencer-basvuru',label: 'Influencer',   icon: IcStar,      color: '#C06080' },
  ]

  return (
    <>
      <div style={{ height: '72px' }} />

      {/* Backdrop */}
      {(createOpen || profileOpen) && (
        <div onClick={closeAll} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* + Oluştur menüsü (sadece giriş yapılmışsa) */}
      {createOpen && user && (
        <div style={{ position: 'fixed', bottom: '76px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '10px', width: '248px' }}>
          {[
            { label: 'Date Kartı',     sub: 'Kişiye özel teklif gönder',  path: '/create',     color: '#00C060', bg: 'rgba(0,192,96,0.08)',    border: 'rgba(0,192,96,0.15)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
            { label: 'Girls Night Out',sub: 'Grup gecesini organize et',   path: '/create-gno', color: '#FF6FAE', bg: 'rgba(255,111,174,0.08)', border: 'rgba(255,111,174,0.15)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6FAE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { label: 'Triplist Oluştur',sub:'Aşamalı rota planı yap',     path: '/plan/yeni',  color: '#D97706', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.15)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/><circle cx="3" cy="17" r="2" fill="#D97706" stroke="none"/><circle cx="12" cy="7" r="2" fill="#D97706" stroke="none"/><circle cx="21" cy="17" r="2" fill="#D97706" stroke="none"/></svg> },
          ].map(item => (
            <button key={item.path} onClick={() => { closeAll(); navigate(item.path) }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid #E8E8E8', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'Raleway, sans-serif' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: item.bg, border: `1px solid ${item.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0D0D0D' }}>{item.label}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Profil menüsü — SADECE giriş yapılmışsa slide-up açılır */}
      {profileOpen && user && (
        <div style={{ position: 'fixed', bottom: '76px', left: '12px', right: '12px', zIndex: 999, background: '#fff', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

          {/* Kullanıcı başlık */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#00C060', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>@{user.username}</div>
            </div>
          </div>

          {/* Hesap linkleri */}
          <div style={{ padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
            {[
              { to: '/dashboard', label: 'Dashboard', sub: 'Kartlar ve planlar', Icon: IcDashboard, color: '#00C060' },
              { to: '/profil',    label: 'Profilim',  sub: 'Hesap bilgileri',    Icon: IcUser,      color: '#555' },
            ].map(item => (
              <button key={item.to} onClick={() => { closeAll(); navigate(item.to) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: isActive(item.to) ? '#F7FAF7' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Raleway, sans-serif' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: isActive(item.to) ? 'rgba(0,192,96,0.1)' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.Icon c={isActive(item.to) ? '#00C060' : item.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: isActive(item.to) ? '#00C060' : '#0D0D0D' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#BBB' }}>{item.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Keşfet grid */}
          <div style={{ padding: '10px 12px 8px' }}>
            <div style={{ fontSize: '10px', color: '#CCC', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '6px' }}>Keşfet</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {EXPLORE_ITEMS.map(item => {
                const active = isActive(item.to)
                return (
                  <button key={item.to} onClick={() => { closeAll(); navigate(item.to) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 10px', background: active ? `${item.color}10` : 'transparent', border: `1px solid ${active ? item.color + '30' : 'transparent'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Raleway, sans-serif' }}>
                    <item.icon c={active ? item.color : '#888'} />
                    <span style={{ fontSize: '12px', fontWeight: active ? 700 : 500, color: active ? item.color : '#555' }}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Çıkış */}
          <div style={{ padding: '4px 12px 14px' }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #F0F0F0', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <IcLogout c="#DC2626" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <Link to="/" style={navBtnStyle(isActive('/')) as React.CSSProperties}>
          <HomeIcon active={isActive('/')} />
          <span style={labelStyle(isActive('/'))}>Ana Sayfa</span>
        </Link>

        <Link to="/bulusma-mekanlari" style={navBtnStyle(isActive('/bulusma-mekanlari')) as React.CSSProperties}>
          <MapPinIcon active={isActive('/bulusma-mekanlari')} />
          <span style={labelStyle(isActive('/bulusma-mekanlari'))}>Mekanlar</span>
        </Link>

        {/* Merkez + */}
        <button onClick={() => { if (!user) { navigate('/login'); return }; setCreateOpen(m => !m); setProfileOpen(false) }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', minWidth: '52px', padding: '4px 0' }}>
          <div style={{ transform: 'translateY(-8px)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#00C060', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: createOpen ? 'rotate(45deg)' : 'none', boxShadow: '0 4px 12px rgba(0,192,96,0.3)' }}>
              <PlusIcon />
            </div>
          </div>
        </button>

        <Link to="/topluluk" style={navBtnStyle(isActive('/topluluk')) as React.CSSProperties}>
          <IcTriplist c={isActive('/topluluk') ? '#00C060' : '#999'} />
          <span style={labelStyle(isActive('/topluluk'))}>Triplist</span>
        </Link>

        {/* Profil / Giriş */}
        {user ? (
          <button onClick={() => { setProfileOpen(m => !m); setCreateOpen(false) }}
            style={{ ...navBtnStyle(profileActive || profileOpen) as React.CSSProperties, minWidth: '52px' }}>
            <UserIcon active={profileActive || profileOpen} />
            <span style={labelStyle(profileActive || profileOpen)}>Profil</span>
          </button>
        ) : (
          <Link to="/login" style={navBtnStyle(isActive('/login')) as React.CSSProperties}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isActive('/login') ? '#00C060' : '#999'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span style={labelStyle(isActive('/login'))}>Giriş</span>
          </Link>
        )}
      </nav>
    </>
  )
}
