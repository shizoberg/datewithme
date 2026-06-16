import { Link, useLocation } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()
  const path = location.pathname

  const items = [
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
    {
      to: '/dashboard',
      label: 'Kart Oluştur',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="12" fill="#00F680"/>
          <line x1="12" y1="7" x2="12" y2="17" stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="7" y1="12" x2="17" y2="12" stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      ),
      isMain: true,
    },
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
      to: '/login',
      label: 'Giriş',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ]

  const isActive = (to: string) => {
    if (to === '/') return path === '/'
    return path.startsWith(to)
  }

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
        {items.map(item => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                textDecoration: 'none',
                color: item.isMain ? '#00F680' : (active ? '#00F680' : '#555'),
                minWidth: '52px',
                padding: '4px 0',
                transition: 'color 0.15s',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: item.isMain ? 'translateY(-8px)' : 'none',
              }}>
                {item.icon}
              </div>
              {!item.isMain && (
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.01em',
                }}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
