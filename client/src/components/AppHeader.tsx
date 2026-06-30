import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AppHeader() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const p = location.pathname

  const navLink = (to: string, label: string) => {
    const active = p === to || (to !== '/' && p.startsWith(to + '/'))
    return (
      <Link to={to} style={{
        color: active ? '#00C060' : '#555',
        fontSize: '13px', textDecoration: 'none',
        fontWeight: active ? 700 : 500,
        padding: '4px 0',
        borderBottom: active ? '1.5px solid #00C060' : '1.5px solid transparent',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </Link>
    )
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header style={{
      height: '56px',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #E8E8E8',
      background: '#FFFFFF',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      boxSizing: 'border-box',
    }}>
      <Link to="/" style={{
        color: '#00C060', fontWeight: 800, fontSize: '15px',
        textDecoration: 'none', letterSpacing: '-0.3px', flexShrink: 0,
      }}>
        getdatewith.me
      </Link>

      {!isMobile && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {navLink('/bulusma-mekanlari', 'Mekanlar')}
          {navLink('/harita', 'Harita')}
          {navLink('/topluluk', 'Triplist')}
          {navLink('/rehber', 'Rehber')}

          {user ? (
            <>
              {navLink('/dashboard', 'Dashboard')}
              {navLink('/profil', 'Profilim')}
              <span style={{ color: '#CCC' }}>|</span>
              <span style={{ color: '#777', fontSize: '13px' }}>@{user.username}</span>
              <button onClick={handleLogout}
                style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: '100px', padding: '5px 12px', color: '#666', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#555', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Giriş Yap</Link>
              <button onClick={() => navigate('/register')}
                style={{ background: '#00C060', border: 'none', borderRadius: '100px', padding: '7px 18px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Kayıt Ol
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
