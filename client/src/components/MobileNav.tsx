import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
  const { user, logout } = useAuth()
  const path = location.pathname
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const isActive = (to: string) => to === '/' ? path === '/' : path.startsWith(to)

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '3px', textDecoration: 'none', color: active ? '#00C060' : '#999',
    minWidth: '52px', padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'Raleway, sans-serif',
  })
  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '10px', fontFamily: 'Raleway, sans-serif', fontWeight: active ? 600 : 400,
  })

  function closeAll() { setCreateOpen(false); setProfileOpen(false) }

  async function handleLogout() {
    closeAll()
    await logout()
    navigate('/login')
  }

  const profileActive = isActive('/profil') || isActive('/dashboard')

  return (
    <>
      <div style={{ height: '72px' }} />

      {/* Backdrop */}
      {(createOpen || profileOpen) && (
        <div onClick={closeAll} style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }} />
      )}

      {/* + Oluştur menüsü */}
      {createOpen && user && (
        <div style={{ position: 'fixed', bottom: '76px', left: '50%', transform: 'translateX(-50%)', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '10px', width: '240px' }}>
          {[
            { label: 'Date Kartı', sub: 'Kişiye özel teklif gönder', path: '/create', color: '#00C060', bg: 'rgba(0,192,96,0.08)', border: 'rgba(0,192,96,0.15)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
            { label: 'Girls Night Out', sub: 'Grup gecesini organize et', path: '/create-gno', color: '#FF6FAE', bg: 'rgba(255,111,174,0.08)', border: 'rgba(255,111,174,0.15)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6FAE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { label: 'Triplist Oluştur', sub: 'Aşamalı rota planı yap', path: '/plan/yeni', color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.15)', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/><circle cx="3" cy="17" r="2" fill="#D97706" stroke="none"/><circle cx="12" cy="7" r="2" fill="#D97706" stroke="none"/><circle cx="21" cy="17" r="2" fill="#D97706" stroke="none"/></svg> },
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

      {/* Profil / Keşfet menüsü */}
      {profileOpen && (
        <div style={{ position: 'fixed', bottom: '76px', left: '12px', right: '12px', zIndex: 999, background: '#fff', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          {user && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F5', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#00C060', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>@{user.username}</div>
              </div>
            </div>
          )}

          {/* Hesap linkleri */}
          {user && (
            <div style={{ padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
              {[
                { to: '/dashboard', label: 'Dashboard', emoji: '📊', sub: 'Kartlar ve planlar' },
                { to: '/profil', label: 'Profilim', emoji: '👤', sub: 'Hesap bilgileri' },
              ].map(item => (
                <button key={item.to} onClick={() => { closeAll(); navigate(item.to) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Raleway, sans-serif' }}>
                  <span style={{ fontSize: '16px', width: '24px' }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#0D0D0D' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>{item.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Keşfet linkleri */}
          <div style={{ padding: '8px 0', borderBottom: user ? '1px solid #F5F5F5' : 'none' }}>
            <div style={{ fontSize: '10px', color: '#CCC', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 20px 6px' }}>Keşfet</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '0 12px' }}>
              {[
                { to: '/bulusma-mekanlari', label: 'Mekanlar', emoji: '📍' },
                { to: '/harita',            label: 'Harita',   emoji: '🗺️' },
                { to: '/topluluk',          label: 'Triplist', emoji: '✦' },
                { to: '/rehber',            label: 'Rehber',   emoji: '📝' },
                { to: '/kurumsal',          label: 'Kurumsal', emoji: '💼' },
                { to: '/influencer-basvuru',label: 'Influencer', emoji: '⭐' },
              ].map(item => (
                <button key={item.to} onClick={() => { closeAll(); navigate(item.to) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', background: isActive(item.to) ? '#F0FAF5' : 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Raleway, sans-serif' }}>
                  <span style={{ fontSize: '14px' }}>{item.emoji}</span>
                  <span style={{ fontSize: '12px', fontWeight: isActive(item.to) ? 700 : 500, color: isActive(item.to) ? '#00C060' : '#555' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Çıkış / Giriş */}
          <div style={{ padding: '8px 20px 16px' }}>
            {user ? (
              <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
                Çıkış Yap
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { closeAll(); navigate('/login') }} style={{ flex: 1, padding: '10px', background: '#F5F5F5', border: 'none', borderRadius: '10px', color: '#555', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Giriş Yap</button>
                <button onClick={() => { closeAll(); navigate('/register') }} style={{ flex: 1, padding: '10px', background: '#00C060', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Kayıt Ol</button>
              </div>
            )}
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
        <Link to="/" style={itemStyle(isActive('/')) as React.CSSProperties}>
          <HomeIcon active={isActive('/')} />
          <span style={labelStyle(isActive('/'))}>Ana Sayfa</span>
        </Link>

        <Link to="/bulusma-mekanlari" style={itemStyle(isActive('/bulusma-mekanlari')) as React.CSSProperties}>
          <MapPinIcon active={isActive('/bulusma-mekanlari')} />
          <span style={labelStyle(isActive('/bulusma-mekanlari'))}>Mekanlar</span>
        </Link>

        {/* Merkez + butonu */}
        <button onClick={() => { if (!user) { navigate('/login'); return } setCreateOpen(m => !m); setProfileOpen(false) }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', minWidth: '52px', padding: '4px 0' }}>
          <div style={{ transform: 'translateY(-8px)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#00C060', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: createOpen ? 'rotate(45deg)' : 'none', boxShadow: '0 4px 12px rgba(0,192,96,0.3)' }}>
              <PlusIcon />
            </div>
          </div>
        </button>

        <Link to="/topluluk" style={itemStyle(isActive('/topluluk')) as React.CSSProperties}>
          <TriplistIcon active={isActive('/topluluk')} />
          <span style={labelStyle(isActive('/topluluk'))}>Triplist</span>
        </Link>

        {/* Profil — tıklanınca menü açılır */}
        <button onClick={() => { setProfileOpen(m => !m); setCreateOpen(false) }}
          style={{ ...itemStyle(profileActive || profileOpen) as React.CSSProperties, minWidth: '52px' }}>
          {user ? <UserIcon active={profileActive || profileOpen} /> : <LogInIcon />}
          <span style={labelStyle(profileActive || profileOpen)}>{user ? 'Profil' : 'Giriş'}</span>
        </button>
      </nav>
    </>
  )
}
