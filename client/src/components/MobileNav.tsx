import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const isLoggedIn = !!localStorage.getItem('token')

  const handleCreateCard = (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(isLoggedIn ? '/dashboard' : '/login')
  }

  const isActive = (to: string) => {
    if (to === '/') return path === '/'
    return path.startsWith(to)
  }

  const regularItems = [
    {
      to: '/',
      label: 'Ana Sayfa',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      to: '/bulusma-mekanlari',
      label: 'Mekanlar',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
  ]

  const rightItems = [
    {
      to: '/topluluk',
      label: 'Topluluk',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      to: isLoggedIn ? '/dashboard' : '/login',
      label: isLoggedIn ? 'Profil' : 'Giriş',
      icon: isLoggedIn ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="#00F680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      ),
    },
  ]

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    textDecoration: 'none',
    color: active ? '#00F680' : '#555',
    minWidth: '52px',
    padding: '4px 0',
    transition: 'color 0.15s',
  })

  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '10px',
    fontFamily: 'Raleway, sans-serif',
    fontWeight: active ? 600 : 400,
    letterSpacing: '0.01em',
  })

  return (
    <>
      <div style={{ height: '72px' }} className="mobile-nav-spacer" />
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(13,13,13,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #1E1E1E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {regularItems.map(item => {
          const active = isActive(item.to)
          return (
            <Link key={item.to} to={item.to} style={itemStyle(active)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <span style={labelStyle(active)}>{item.label}</span>
            </Link>
          )
        })}

        {/* Orta + butonu */}
        <button onClick={handleCreateCard} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          minWidth: '52px',
          padding: '4px 0',
        }}>
          <div style={{ transform: 'translateY(-8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="22" fill="#00F680"/>
              <line x1="22" y1="13" x2="22" y2="31"
                    stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round"/>
              <line x1="13" y1="22" x2="31" y2="22"
                    stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        {rightItems.map(item => {
          const active = isActive(item.to)
          return (
            <Link key={item.to} to={item.to} style={itemStyle(active)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <span style={labelStyle(active)}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
