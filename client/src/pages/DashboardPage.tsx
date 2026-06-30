import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

interface Card {
  id: string; recipientName: string; slug: string; theme: string; status: string
  selectedOption: string | null; selectedDate: string | null; pickupChoice: boolean | null
  location: string | null; withBarAfter: boolean; createdAt: string
  suggestedVenueId: string | null; selectedVenueId: string | null
}
interface GNOCard {
  id: string; groupName: string; slug: string; theme: string; createdAt: string
  votes: { id: string; voterName: string; selectedEvent: string; selectedTime: string; selectedLocation: string }[]
}
interface Triplist {
  id: string; title: string; slug: string; isPublic: boolean; viewCount: number; stops: { venueName: string }[]
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Bekliyor', color: '#D97706', bg: '#FEF9EC' },
  accepted: { label: 'Kabul ✓',  color: '#059669', bg: '#EDFAF4' },
  declined: { label: 'Reddetti', color: '#DC2626', bg: '#FEF2F2' },
}

function CardRow({ card, username }: { card: Card; username: string }) {
  const [open, setOpen] = useState(false)
  const s = STATUS[card.status] ?? STATUS.pending
  const link = `${window.location.origin}/${username}/${card.slug}`
  const hasDetails = card.status === 'accepted' && (card.selectedOption || card.selectedDate)

  return (
    <div style={{ borderBottom: '1px solid #F0F0F0' }}>
      <div onClick={() => hasDetails && setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', cursor: hasDetails ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.recipientName}</p>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{new Date(card.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ background: s.bg, color: s.color, borderRadius: '9999px', padding: '2px 9px', fontSize: '11px', fontWeight: 600 }}>{s.label}</span>
          {card.status === 'pending' && (
            <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(link) }}
              style={{ fontSize: '11px', color: '#00C060', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              Kopyala
            </button>
          )}
          {hasDetails && <span style={{ color: '#CCC', fontSize: '11px' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </div>
      {open && hasDetails && (
        <div style={{ paddingBottom: '12px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {card.selectedOption && <p style={{ fontSize: '13px', color: '#555' }}>🎯 {card.selectedOption}</p>}
          {card.selectedDate && <p style={{ fontSize: '13px', color: '#555' }}>📅 {new Date(card.selectedDate).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>}
          {card.location && <p style={{ fontSize: '13px', color: '#555' }}>📍 {card.location}</p>}
          {card.withBarAfter && <p style={{ fontSize: '13px', color: '#555' }}>🍺 Bar sonrası da var</p>}
        </div>
      )}
    </div>
  )
}

function GNORow({ card }: { card: GNOCard }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/girlsnightout/${card.slug}`
  function winner(key: keyof GNOCard['votes'][0]) {
    const map: Record<string, number> = {}
    card.votes.forEach(v => { const val = v[key] as string; map[val] = (map[val] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  }
  return (
    <div style={{ borderBottom: '1px solid #F0F0F0' }}>
      <div onClick={() => card.votes.length > 0 && setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', cursor: card.votes.length > 0 ? 'pointer' : 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C06080', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.groupName}</p>
            <p style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{card.votes.length} oy · {new Date(card.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            style={{ fontSize: '11px', color: '#C06080', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
            {copied ? '✓' : 'Kopyala'}
          </button>
          {card.votes.length > 0 && <span style={{ color: '#CCC', fontSize: '11px' }}>{open ? '▲' : '▼'}</span>}
        </div>
      </div>
      {open && card.votes.length > 0 && (
        <div style={{ paddingBottom: '12px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '12px', color: '#C06080', fontWeight: 600, marginBottom: '2px' }}>Şu anki lider:</p>
          <p style={{ fontSize: '13px', color: '#555' }}>🎯 {winner('selectedEvent')}</p>
          <p style={{ fontSize: '13px', color: '#555' }}>📅 {winner('selectedTime')}</p>
          <p style={{ fontSize: '13px', color: '#555' }}>📍 {winner('selectedLocation')}</p>
          <p style={{ fontSize: '12px', color: '#AAA', marginTop: '2px' }}>{card.votes.map(v => v.voterName).join(', ')}</p>
        </div>
      )}
    </div>
  )
}

function EmptyState({ emoji, text, action, path }: { emoji: string; text: string; action: string; path: string }) {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '32px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{emoji}</div>
      <p style={{ fontSize: '13px', color: '#AAA', marginBottom: '12px' }}>{text}</p>
      <button onClick={() => navigate(path)} style={{ background: '#00C060', color: '#fff', border: 'none', borderRadius: '9999px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Raleway, sans-serif' }}>
        {action}
      </button>
    </div>
  )
}

type Tab = 'date' | 'triplist' | 'gno'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cards, setCards] = useState<Card[]>([])
  const [gnoCards, setGnoCards] = useState<GNOCard[]>([])
  const [triplists, setTriplists] = useState<Triplist[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('date')

  useEffect(() => {
    Promise.all([
      api.get('/api/cards').then(r => setCards(r.data.cards)).catch(() => {}),
      api.get('/api/gno').then(r => setGnoCards(r.data.cards)).catch(() => {}),
      api.get('/api/triplists/mine').then(r => setTriplists(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const TABS: { id: Tab; label: string; count: number; color: string; action: string; path: string }[] = [
    { id: 'date',     label: 'Date Kartları', count: cards.length,     color: '#00C060', action: 'Yeni Kart',     path: '/create' },
    { id: 'triplist', label: 'Triplistler',   count: triplists.length, color: '#D97706', action: 'Yeni Triplist', path: '/plan/yeni' },
    { id: 'gno',      label: 'Girls Night',   count: gnoCards.length,  color: '#C06080', action: 'Yeni GNO',      path: '/create-gno' },
  ]
  const active = TABS.find(t => t.id === tab)!

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', color: '#0D0D0D', background: '#F8F8F8' }}>
      <main style={{ maxWidth: '620px', margin: '0 auto', padding: '28px 20px 100px' }}>

        {/* Karşılama */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Merhaba, {user?.name?.split(' ')[0] || user?.username} 👋
          </h1>
          <p style={{ color: '#999', fontSize: '13px', marginTop: '3px' }}>Planlarını buradan takip et.</p>
        </div>

        {/* Hızlı eylemler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {[
            { label: 'Date Kartı', icon: '💌', path: '/create', color: '#EDFAF4', stroke: '#00C060' },
            { label: 'Triplist',   icon: '🗺️', path: '/plan/yeni', color: '#FEF9EC', stroke: '#D97706' },
            { label: 'Girls Night',icon: '👯',  path: '/create-gno', color: '#FFF0F5', stroke: '#C06080' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontFamily: 'Raleway, sans-serif' }}>
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#555' }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tab kartı */}
        <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          {/* Tab başlıkları */}
          <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '13px 4px', background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t.id ? t.color : 'transparent'}`,
                color: tab === t.id ? t.color : '#AAA',
                fontWeight: tab === t.id ? 700 : 500, fontSize: '12px',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}>
                {t.label}
                {!loading && t.count > 0 && (
                  <span style={{ marginLeft: '5px', background: tab === t.id ? t.color : '#F0F0F0', color: tab === t.id ? '#fff' : '#AAA', borderRadius: '9999px', padding: '0 5px', fontSize: '10px', fontWeight: 700 }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* İçerik */}
          <div style={{ padding: '0 20px' }}>
            {loading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#CCC', fontSize: '13px' }}>Yükleniyor…</div>
            ) : (
              <>
                {tab === 'date' && (cards.length === 0
                  ? <EmptyState emoji="💌" text="Henüz kart yok." action="Kart Oluştur" path="/create" />
                  : cards.map(c => <CardRow key={c.id} card={c} username={user?.username ?? ''} />)
                )}
                {tab === 'triplist' && (triplists.length === 0
                  ? <EmptyState emoji="🗺️" text="Henüz triplist yok." action="Triplist Oluştur" path="/plan/yeni" />
                  : triplists.map(t => (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.title}</div>
                          <div style={{ fontSize: '11px', color: '#AAA', marginTop: '2px' }}>
                            {t.stops.length} durak · {t.isPublic ? '🌐 Açık' : '🔒 Gizli'} · 👁 {t.viewCount}
                          </div>
                        </div>
                        <a href={`/${user?.username}/triplist/${t.slug}`} style={{ fontSize: '12px', color: '#D97706', textDecoration: 'none', fontWeight: 700 }}>Gör →</a>
                      </div>
                    ))
                )}
                {tab === 'gno' && (gnoCards.length === 0
                  ? <EmptyState emoji="👯‍♀️" text="Henüz GNO yok." action="GNO Oluştur" path="/create-gno" />
                  : gnoCards.map(c => <GNORow key={c.id} card={c} />)
                )}
              </>
            )}
          </div>

          {/* Alt + yeni butonu */}
          {!loading && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #F5F5F5' }}>
              <button onClick={() => navigate(active.path)} style={{ width: '100%', padding: '9px', background: 'none', border: `1.5px dashed ${active.color}50`, borderRadius: '10px', color: active.color, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                + {active.action}
              </button>
            </div>
          )}
        </div>

        {/* Keşfet */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { to: '/bulusma-mekanlari', emoji: '📍', label: 'Mekanlar',  sub: 'Buluşma yerleri' },
            { to: '/harita',            emoji: '🗺️', label: 'Harita',    sub: 'Tüm mekanlar' },
            { to: '/topluluk',          emoji: '✦',  label: 'Triplist',  sub: 'Topluluk rotaları' },
            { to: '/rehber',            emoji: '📝', label: 'Rehber',    sub: 'Mekan yazıları' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '12px', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#333' }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: '#BBB', marginTop: '1px' }}>{item.sub}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}
