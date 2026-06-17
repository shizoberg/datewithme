import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import CommunityBanner from '../components/CommunityBanner'
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
  suggestedVenueId: string | null
  selectedVenueId: string | null
}

interface GNOCard {
  id: string
  groupName: string
  slug: string
  theme: string
  createdAt: string
  votes: { id: string; voterName: string; selectedEvent: string; selectedTime: string; selectedLocation: string }[]
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Bekliyor',  color: '#00F680', bg: '#2A2300' },
  accepted: { label: 'Kabul ✓',  color: '#22C55E', bg: '#0D2E1A' },
  declined: { label: 'Reddetti', color: '#EF4444', bg: '#2D1010' },
}

function CardRow({ card, username }: { card: Card; username: string }) {
  const [open, setOpen] = useState(false)
  const s = STATUS[card.status] ?? STATUS.pending
  const link = `${window.location.origin}/${username}/${card.slug}`
  const hasDetails = card.status === 'accepted' && (card.selectedOption || card.selectedDate)

  function copyLink() { navigator.clipboard.writeText(link) }

  return (
    <div style={{ borderBottom: '1px solid #2A2A2A' }}>
      <div onClick={() => hasDetails && setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: hasDetails ? 'pointer' : 'default' }}
        onMouseEnter={e => { if (hasDetails) (e.currentTarget as HTMLDivElement).style.background = '#222' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
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
              style={{ fontSize: '12px', color: '#00F680', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Linki Kopyala
            </button>
          )}
          {hasDetails && <span style={{ color: '#666', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </div>
      {open && hasDetails && (
        <div className="fade-in" style={{ padding: '0 20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {card.selectedOption && <p style={{ fontSize: '14px' }}>🎯 <strong>Seçim:</strong> {card.selectedOption}</p>}
          {card.selectedDate && <p style={{ fontSize: '14px' }}>📅 <strong>Tarih:</strong> {new Date(card.selectedDate).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
          {card.pickupChoice !== null && <p style={{ fontSize: '14px' }}>{card.pickupChoice ? '🚗' : '🗺️'} <strong>Karşılama:</strong> {card.pickupChoice ? 'Seni alıyor' : 'Orada buluşuyor'}</p>}
          {card.location && <p style={{ fontSize: '14px' }}>📍 <strong>Mekan:</strong> {card.location}</p>}
          {card.withBarAfter && <p style={{ fontSize: '14px' }}>🍺 Bar sonrası da var</p>}
          {card.suggestedVenueId && <p style={{ fontSize: '14px' }}>📍 <strong>Önerilen Mekan ID:</strong> {card.suggestedVenueId}</p>}
          {card.selectedVenueId  && <p style={{ fontSize: '14px' }}>✓ <strong>Seçilen Mekan ID:</strong> {card.selectedVenueId}</p>}
        </div>
      )}
    </div>
  )
}

function GNOCardRow({ card }: { card: GNOCard }) {
  const [open, setOpen] = useState(false)
  const link = `${window.location.origin}/girlsnightout/${card.slug}`
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // tally votes
  function winner(key: keyof GNOCard['votes'][0]) {
    const map: Record<string, number> = {}
    card.votes.forEach(v => { const val = v[key] as string; map[val] = (map[val] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  }

  return (
    <div style={{ borderBottom: '1px solid #2A2A2A' }}>
      <div onClick={() => card.votes.length > 0 && setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: card.votes.length > 0 ? 'pointer' : 'default' }}
        onMouseEnter={e => { if (card.votes.length > 0) (e.currentTarget as HTMLDivElement).style.background = '#222' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px' }}>👯‍♀️</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>{card.groupName}</p>
              <span style={{ background: '#2D1520', color: '#FF8FAB', border: '1px solid #C0608044', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>Girls Night Out</span>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{new Date(card.createdAt).toLocaleDateString('tr-TR')} · {card.votes.length} oy</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: '#2D1520', color: '#FF8FAB', border: '1px solid #C0608033', borderRadius: '9999px', padding: '3px 10px', fontSize: '12px', fontWeight: 600 }}>
            {card.votes.length} oy
          </span>
          <button onClick={e => { e.stopPropagation(); copyLink() }}
            style={{ fontSize: '12px', color: '#FF8FAB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            {copied ? '✓ Kopyalandı' : 'Linki Kopyala'}
          </button>
          {card.votes.length > 0 && <span style={{ color: '#666', fontSize: '12px' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </div>
      {open && card.votes.length > 0 && (
        <div className="fade-in" style={{ padding: '0 20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '13px', color: '#FF8FAB', fontWeight: 700, marginBottom: '4px' }}>🏆 Şu anki lider:</p>
          <p style={{ fontSize: '14px' }}>🎯 {winner('selectedEvent')}</p>
          <p style={{ fontSize: '14px' }}>📅 {winner('selectedTime')}</p>
          <p style={{ fontSize: '14px' }}>📍 {winner('selectedLocation')}</p>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Oylar: {card.votes.map(v => v.voterName).join(', ')}</p>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState<Card[]>([])
  const [gnoCards, setGnoCards] = useState<GNOCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/cards').then(r => setCards(r.data.cards)).catch(() => {}),
      api.get('/api/gno').then(r => setGnoCards(r.data.cards)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader rightContent={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: '#666', fontSize: '13px' }}>@{user?.username}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #2A2A2A', borderRadius: '100px', padding: '5px 12px', color: '#666', fontSize: '12px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>Çıkış</button>
        </div>
      } />

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px var(--page-padding) 100px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Merhaba {user?.name} 👋</h2>
          <p style={{ color: '#999', marginTop: '6px', fontSize: '15px' }}>Kartlarını ve gruplarını buradan yönet.</p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <Link to="/create" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Yeni Kart Oluştur
            </button>
          </Link>
          <Link to="/create-gno" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '9999px', border: '1.5px solid #C06080', background: '#2D1520', color: '#FF8FAB', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'Raleway, sans-serif' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Girls Night Out Oluştur
            </button>
          </Link>
        </div>

        {/* Date Cards */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2A' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Date Teklifleri
            </h3>
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

        {/* GNO Cards */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px' }}>👯‍♀️ Girls Night Out</h3>
            <span style={{ background: '#2D1520', color: '#FF8FAB', border: '1px solid #C0608044', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>GNO</span>
          </div>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>Yükleniyor…</div>
          ) : gnoCards.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>👯‍♀️</p>
              <p>Henüz grup yok. İlk GNO'nu oluştur!</p>
            </div>
          ) : (
            gnoCards.map(c => <GNOCardRow key={c.id} card={c} />)
          )}
        </div>

      </main>
      <CommunityBanner />
      <div style={{ height: '80px' }} />
    </div>
  )
}
