import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HomeIcon, MapPinIcon, UsersIcon, UserIcon, LogInIcon } from './icons'

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

  const homeActive = isActive('/')
  const venuesActive = isActive('/bulusma-mekanlari')
  const communityActive = isActive('/topluluk')
  const profileActive = isActive('/profil') || isActive('/dashboard')

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
        <Link to="/" style={itemStyle(homeActive)}>
          <HomeIcon active={homeActive} />
          <span style={labelStyle(homeActive)}>Ana Sayfa</span>
        </Link>

        <Link to="/bulusma-mekanlari" style={itemStyle(venuesActive)}>
          <MapPinIcon active={venuesActive} />
          <span style={labelStyle(venuesActive)}>Mekanlar</span>
        </Link>

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
              <line x1="22" y1="13" x2="22" y2="31" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round"/>
              <line x1="13" y1="22" x2="31" y2="22" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        <Link to="/topluluk" style={itemStyle(communityActive)}>
          <UsersIcon active={communityActive} />
          <span style={labelStyle(communityActive)}>Topluluk</span>
        </Link>

        <Link to={isLoggedIn ? '/profil' : '/login'} style={itemStyle(profileActive)}>
          {isLoggedIn ? <UserIcon active={profileActive} /> : <LogInIcon />}
          <span style={labelStyle(profileActive)}>{isLoggedIn ? 'Profil' : 'Giriş'}</span>
        </Link>
      </nav>
    </>
  )
}
