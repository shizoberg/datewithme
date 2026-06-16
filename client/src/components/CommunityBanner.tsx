import { Link } from 'react-router-dom'

export default function CommunityBanner() {
  return (
    <div style={{ borderTop: '1px solid #1A1A1A', padding: '40px 24px', background: '#0D0D0D' }}>
      <div style={{
        maxWidth: '640px', margin: '0 auto',
        background: '#111', border: '1px solid rgba(0,246,128,0.2)',
        borderRadius: '16px', padding: '28px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '24px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,246,128,0.08)', border: '1px solid rgba(0,246,128,0.2)',
            borderRadius: '9999px', padding: '4px 12px',
            fontSize: '11px', color: '#00F680', fontWeight: 700, letterSpacing: '1px',
            marginBottom: '10px',
          }}>
            🌿 Community Built
          </div>
          <div style={{ fontWeight: 800, fontSize: '17px', color: '#fff', marginBottom: '6px' }}>
            Harika bir mekan biliyor musun?
          </div>
          <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, maxWidth: '360px' }}>
            Şehrindeki en iyi mekanı ekle, herkes senin gibi kaliteli vakit geçirsin.
          </div>
        </div>
        <Link to="/topluluk" style={{
          display: 'inline-block', background: '#00F680', color: '#0D0D0D',
          textDecoration: 'none', borderRadius: '9999px', padding: '13px 24px',
          fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Mekan Öner →
        </Link>
      </div>
    </div>
  )
}
