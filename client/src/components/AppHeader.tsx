import { Link } from 'react-router-dom'

interface Props {
  rightContent?: React.ReactNode
}

export default function AppHeader({ rightContent }: Props) {
  return (
    <header style={{
      height: 'var(--header-height)',
      padding: '0 var(--page-padding)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
    }}>
      <Link to="/" style={{
        color: 'var(--green)',
        fontWeight: 800,
        fontSize: '15px',
        textDecoration: 'none',
        letterSpacing: '-0.3px',
        flexShrink: 0,
      }}>
        getdatewith.me
      </Link>
      {rightContent && (
        <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {rightContent}
        </div>
      )}
    </header>
  )
}
