import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

interface Card {
  id: string
  recipientName: string
  slug: string
  theme: string
  status: string
  selectedOption: string | null
  selectedDate: string | null
  pickupChoice: boolean | null
  location: string | null
  withBarAfter: boolean
  createdAt: string
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Bekliyor',  color: '#F5C400', bg: '#2A2300' },
  accepted: { label: 'Kabul ✓',  color: '#22C55E', bg: '#0D2E1A' },
  declined: { label: 'Reddetti', color: '#EF4444', bg: '#2D1010' },
}

function CardRow({ card, username }: { card: Card; username: string }) {
  const [open, setOpen] = useState(false)
  const s = STATUS[card.status] ?? STATUS.pending
  const link = `${window.location.origin}/${username}/${card.slug}`
  const hasDetails = card.status === 'accepted' && (card.selectedOption || card.selectedDate)

  function copyLink() {
    navigator.clipboard.writeText(link)
  }

  return (
    <div style={{ borderBottom: '1px solid #2A2A2A' }}>
      <div
        onClick={() => hasDetails && setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: hasDetails ? 'pointer' : 'default', transition: 'background 0.1s' }}
        onMouseEnter={e => { if (hasDetails) (e.currentTarget as HTMLDivElement).style.background = '#222' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0, display: 'block' }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '15px' }}>{card.recipientName}</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{new Date(card.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33`, borderRadius: '9999px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
          {card.status === 'pending' && (
            <button onClick={e => { e.stopPropagation(); copyLink() }}
              style={{ fontSize: '12px', color: '#F5C400', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Linki Kopyala
            </button>
          )}
          {hasDetails && <span style={{ color: '#666', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </div>

      {open && hasDetails && (
        <div className="fade-in" style={{ padding: '0 20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {card.selectedOption && (
            <p style={{ fontSize: '14px' }}>🎯 <strong>Seçim:</strong> {card.selectedOption}</p>
          )}
          {card.selectedDate && (
            <p style={{ fontSize: '14px' }}>📅 <strong>Tarih:</strong> {new Date(card.selectedDate).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          )}
          {card.pickupChoice !== null && (
            <p style={{ fontSize: '14px' }}>{card.pickupChoice ? '🚗' : '🗺️'} <strong>Karşılama:</strong> {card.pickupChoice ? 'Seni alıyor' : 'Orada buluşuyor'}</p>
          )}
          {card.location && (
            <p style={{ fontSize: '14px' }}>📍 <strong>Mekan:</strong> {card.location}</p>
          )}
          {card.withBarAfter && (
            <p style={{ fontSize: '14px' }}>🍺 Bar sonrası da var</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/cards')
      .then(r => setCards(r.data.cards))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #2A2A2A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F5C400' }}>datewith.me</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#999', fontSize: '14px' }}>@{user?.username}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Çıkış</button>
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Merhaba {user?.name} 👋</h2>
          <p style={{ color: '#999', marginTop: '6px', fontSize: '15px' }}>Gönderdiğin date teklifleri burada.</p>
        </div>

        {/* New card CTA */}
        <Link to="/dashboard/create" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ marginBottom: '32px' }}>
            ✨ Yeni Kart Oluştur
          </button>
        </Link>

        {/* Cards list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2A' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Teklifler</h3>
            <p style={{ color: '#666', fontSize: '13px', marginTop: '2px' }}>Kabul edilenlere tıklayınca detaylar açılır</p>
          </div>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>Yükleniyor…</div>
          ) : cards.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>💌</p>
              <p>Henüz kart yok. İlk kartını oluştur!</p>
            </div>
          ) : (
            cards.map(c => <CardRow key={c.id} card={c} username={user?.username ?? ''} />)
          )}
        </div>
      </main>
    </div>
  )
}
