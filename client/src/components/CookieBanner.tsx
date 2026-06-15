import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('cookie_consent'))
  const navigate = useNavigate()

  if (!visible) return null

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0D0D0D', borderTop: '1px solid #2A2A2A',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', flexWrap: 'wrap',
      fontFamily: 'Syne, sans-serif',
    }}>
      <p style={{ color: '#ccc', fontSize: '13px', lineHeight: 1.6, flex: '1 1 280px', margin: 0 }}>
        Deneyimini geliştirmek için çerez kullanıyoruz.{' '}
        Devam ederek{' '}
        <button onClick={() => navigate('/kvkk')}
          style={{ background: 'none', border: 'none', color: '#F5C400', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>
          KVKK Aydınlatma Metni
        </button>
        'ni kabul etmiş olursun.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/kvkk')}
          style={{ background: 'none', border: '1px solid #444', color: '#999', borderRadius: '9999px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Detaylar
        </button>
        <button onClick={accept}
          style={{ background: '#F5C400', color: '#000', borderRadius: '9999px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
          Kabul Et
        </button>
      </div>
    </div>
  )
}
