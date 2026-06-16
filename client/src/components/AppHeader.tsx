import { Link } from 'react-router-dom'

interface AppHeaderProps {
  showBack?: boolean
  backTo?: string
  backLabel?: string
}

export default function AppHeader({ showBack, backTo = '/', backLabel = '← Geri' }: AppHeaderProps) {
  return (
    <header style={{
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #1A1A1A',
      background: '#0D0D0D',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <Link to="/" style={{
        color: '#00F680',
        fontWeight: 800,
        fontSize: '16px',
        textDecoration: 'none',
        letterSpacing: '-0.3px',
        flexShrink: 0,
      }}>
        getdatewith.me
      </Link>

      {showBack && (
        <Link to={backTo} style={{
          color: '#666',
          fontSize: '13px',
          textDecoration: 'none',
        }}>
          {backLabel}
        </Link>
      )}
    </header>
  )
}
