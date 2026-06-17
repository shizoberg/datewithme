import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface Props {
  rightContent?: React.ReactNode
}

export default function AppHeader({ rightContent }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <header style={{
      height: '56px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1A1A1A',
      background: '#0D0D0D',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <Link to="/" style={{
        color: '#00F680',
        fontWeight: 800,
        fontSize: '15px',
        textDecoration: 'none',
        letterSpacing: '-0.3px',
        flexShrink: 0,
      }}>
        getdatewith.me
      </Link>
      {!isMobile && rightContent && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {rightContent}
        </div>
      )}
    </header>
  )
}
