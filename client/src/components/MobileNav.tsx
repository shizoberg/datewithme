import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, MapPinIcon, UserIcon, LogInIcon, PlusIcon } from './icons'

function TriplistIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#00C060' : '#999'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/>
      <circle cx="3" cy="17" r="2" fill={active ? '#00C060' : '#999'} stroke="none"/>
      <circle cx="12" cy="7" r="2" fill={active ? '#00C060' : '#999'} stroke="none"/>
      <circle cx="21" cy="17" r="2" fill={active ? '#00C060' : '#999'} stroke="none"/>
    </svg>
  )
}

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
    setMenuOpen(false)
  }, [location.pathname])

  const isActive = (to: string) => {
    if (to === '/') return path === '/'
    return path.startsWith(to)
  }

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '3px', textDecoration: 'none', color: active ? '#00C060' : '#999',
    minWidth: '52px', padding: '4px 0', transition: 'color 0.15s',
  })
  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '10px', fontFamily: 'Raleway, sans-serif', fontWeight: active ? 600 : 400, letterSpacing: '0.01em',
  })

  const homeActive = isActive('/')
  const venuesActive = isActive('/bulusma-mekanlari')
  const communityActive = isActive('/topluluk')
  const profileActive = isActive('/profil') || isActive('/dashboard')

  return (
    <>
      <div style={{ height: '72px' }} className="mobile-nav-spacer" />

      {menuOpen && isLoggedIn && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.1)' }} />
          <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '10px', width: '240px' }}>

            <button onClick={() => { setMenuOpen(false); navigate('/create') }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid #E8E8E8', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,192,96,0.1)', border: '1px solid rgba(0,192,96,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0D0D0D' }}>Date Kartı</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Kişiye özel teklif gönder</div>
              </div>
            </button>

            <button onClick={() => { setMenuOpen(false); navigate('/create-gno') }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid #E8E8E8', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,111,174,0.1)', border: '1px solid rgba(255,111,174,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6FAE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0D0D0D' }}>Girls Night Out</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Grup gecesini organize et</div>
              </div>
            </button>

            <button onClick={() => { setMenuOpen(false); navigate('/plan/yeni') }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1px solid rgba(255,214,0,0.4)', borderRadius: '14px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,214,0,0.1)', border: '1px solid rgba(255,214,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4A800" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/><circle cx="3" cy="17" r="2" fill="#D4A800" stroke="none"/><circle cx="12" cy="7" r="2" fill="#D4A800" stroke="none"/><circle cx="21" cy="17" r="2" fill="#D4A800" stroke="none"/></svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px', color: '#0D0D0D' }}>
                  Triplist Oluştur
                  <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(255,214,0,0.15)', color: '#A07800', padding: '2px 6px', borderRadius: '100px', fontWeight: 500 }}>YENİ</span>
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Aşamalı rota planı yap</div>
              </div>
            </button>
          </div>
        </>
      )}

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 1000, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <Link to="/" style={itemStyle(homeActive)}>
          <HomeIcon active={homeActive} />
          <span style={labelStyle(homeActive)}>Ana Sayfa</span>
        </Link>
        <Link to="/bulusma-mekanlari" style={itemStyle(venuesActive)}>
          <MapPinIcon active={venuesActive} />
          <span style={labelStyle(venuesActive)}>Mekanlar</span>
        </Link>
        <button onClick={() => { if (!isLoggedIn) { navigate('/login'); return } setMenuOpen(m => !m) }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', minWidth: '52px', padding: '4px 0' }}>
          <div style={{ transform: 'translateY(-8px)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#00C060', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
              <PlusIcon />
            </div>
          </div>
        </button>
        <Link to="/topluluk" style={itemStyle(communityActive)}>
          <TriplistIcon active={communityActive} />
          <span style={labelStyle(communityActive)}>Triplist</span>
        </Link>
        <Link to={isLoggedIn ? '/profil' : '/login'} style={itemStyle(profileActive)}>
          {isLoggedIn ? <UserIcon active={profileActive} /> : <LogInIcon />}
          <span style={labelStyle(profileActive)}>{isLoggedIn ? 'Profil' : 'Giriş'}</span>
        </Link>
      </nav>
    </>
  )
}
