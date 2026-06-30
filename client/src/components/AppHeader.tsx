import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface Props {
  rightContent?: React.ReactNode
}

export default function AppHeader({ rightContent }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  })

  const navLink = (to: string, label: string) => (
    <Link to={to} style={{ color: '#555', fontSize: '13px', textDecoration: 'none', fontWeight: 500, padding: '4px 0' }}>
      {label}
    </Link>
  )

  return (
    <header style={{
      height: '56px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #E8E8E8',
      background: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <Link to="/" style={{
        color: '#00C060',
        fontWeight: 800,
        fontSize: '15px',
        textDecoration: 'none',
        letterSpacing: '-0.3px',
        flexShrink: 0,
      }}>
        getdatewith.me
      </Link>

      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {navLink('/bulusma-mekanlari', 'Mekanlar')}
          {navLink('/topluluk', 'Triplist')}
          {isLoggedIn ? (
            <>
              {navLink('/dashboard', 'Dashboard')}
              {navLink('/profil', 'Profilim')}
              {rightContent}
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#555', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Giriş Yap</Link>
              <button onClick={() => navigate('/register')} style={{ background: '#00C060', border: 'none', borderRadius: '100px', padding: '7px 18px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
