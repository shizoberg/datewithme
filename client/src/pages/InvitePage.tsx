import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

/* ── Types ─────────────────────────────────────────────── */
interface VenueInfo {
  id: string; name: string; category: string; district: string
  address?: string; googleMapsUrl?: string; instagramUrl?: string
  rating?: number; priceLevel?: number
}

interface Card {
  id: string
  recipientName: string
  slug: string
  theme: string
  status: string
  option1Label: string
  option2Label: string
  option3Label: string
  option4Label: string
  option5Label: string
  option6Label: string
  selectedOption: string | null
  selectedDate: string | null
  pickupChoice: boolean | null
  location: string | null
  withBarAfter: boolean
  suggestSelect:   string | null
  suggestDatetime: string | null
  suggestLocation: string | null
  suggestPickup:   string | null
  venueCity:        string | null
  venueDistrict:    string | null
  suggestedVenueId: string | null
  selectedVenueId:  string | null
  suggestedVenue:   VenueInfo | null
  selectedVenue:    VenueInfo | null
  user: { name: string; username: string }
}

const CAT: Record<string, { emoji: string }> = {
  cafe: { emoji: '☕' }, restaurant: { emoji: '🍽️' }, bar: { emoji: '🍸' },
  park: { emoji: '🌿' }, rooftop: { emoji: '🌆' }, cultural: { emoji: '🎨' },
}

type Step = 'invite' | 'select' | 'venue' | 'datetime' | 'location' | 'pickup' | 'done'

/* ── Emoji background ───────────────────────────────────── */
function EmojiBg({ theme }: { theme: string }) {
  const sets: Record<string, string[]> = {
    minimal: ['💛','✨','🖤','⭐','💫'],
    rosy:    ['🌸','💕','🌷','💝','🦋'],
    emoji:   ['🎉','🍕','☕','🍸','🎨','🍺','🥳'],
  }
  const emojis = sets[theme] ?? sets.emoji
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="emoji-fall" style={{
          left: `${(i * 37 + 5) % 100}%`,
          animationDuration: `${7 + (i % 5)}s`,
          animationDelay: `${(i % 7) * 0.8}s`,
          fontSize: `${1.2 + (i % 3) * 0.4}rem`,
        }}>
          {emojis[i % emojis.length]}
        </span>
      ))}
    </>
  )
}

/* ── Runaway Hayır button ───────────────────────────────── */
function RunawayBtn({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [attempts, setAttempts] = useState(0)

  function flee() {
    const range = 160
    setPos({ x: (Math.random() - 0.5) * range * 2, y: (Math.random() - 0.5) * range })
    setAttempts(n => n + 1)
  }

  return (
    <button ref={ref} onClick={onClick} onMouseEnter={flee}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.25s ease' }}
      className="btn-secondary">
      Hayır 🙈 {attempts > 2 && <span style={{ fontSize: '11px', opacity: 0.5 }}>({attempts}x)</span>}
    </button>
  )
}

/* ── Date card (final) ──────────────────────────────────── */
function DateCard({ card, username }: { card: Card; username: string }) {
  const link = `${window.location.origin}/${username}/${card.slug}`
  const [copied, setCopied] = useState(false)
  const creatorName = card.user.name || card.user.username

  // webcal:// makes iOS/Android open the native Calendar app directly
  const apiBase = (import.meta.env.VITE_API_URL as string) || ''
  const icsUrl = card.selectedDate
    ? apiBase.replace(/^https?:\/\//, 'webcal://') + `/api/cards/${card.id}/ics`
    : undefined

  const themeStyle: Record<string, { bg: string; surface: string; accent: string; border: string }> = {
    minimal: { bg: '#0D0D0D', surface: '#1A1A1A', accent: '#00F680', border: '#00F680' },
    rosy:    { bg: '#1A0810', surface: '#2D1520', accent: '#FF8FAB', border: '#C06080' },
    emoji:   { bg: '#0A0D1A', surface: '#12172A', accent: '#00F680', border: '#4C6EF5' },
  }
  const ts = themeStyle[card.theme] ?? themeStyle.minimal

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: ts.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <EmojiBg theme={card.theme} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px', borderRadius: '20px', padding: '3px', background: `linear-gradient(135deg, ${ts.border}, ${ts.accent}88, ${ts.border})` }}>
        <div style={{ background: ts.surface, borderRadius: '18px', padding: '36px 32px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: ts.accent, marginBottom: '8px', textTransform: 'uppercase' }}>Date Confirmed 💛</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>
            {creatorName} & {card.recipientName} 💛
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {card.selectedOption && (
              <div style={{ background: '#00000030', border: `1px solid ${ts.border}44`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', color: ts.accent, marginBottom: '4px', fontWeight: 700 }}>🎯 Seçim</p>
                <p style={{ fontWeight: 600, fontSize: '16px' }}>{card.selectedOption}</p>
              </div>
            )}
            <div style={{ background: '#00000030', border: `1px solid ${ts.border}44`, borderRadius: '10px', padding: '12px 16px' }}>
              <p style={{ fontSize: '11px', color: ts.accent, marginBottom: '4px', fontWeight: 700 }}>📅 Tarih & Saat</p>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>
                {card.selectedDate ? fmt(card.selectedDate) : '—'}
              </p>
            </div>
            {card.location && (
              <div style={{ background: '#00000030', border: `1px solid ${ts.border}44`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '11px', color: ts.accent, marginBottom: '4px', fontWeight: 700 }}>📍 Mekan</p>
                <p style={{ fontWeight: 600 }}>{card.location}</p>
              </div>
            )}
            {card.pickupChoice !== null && (
              <div style={{ background: '#00000030', border: `1px solid ${ts.border}44`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontWeight: 600 }}>{card.pickupChoice ? '🚗 Seni alıyor' : '🗺️ Orada buluşuyorsunuz'}</p>
              </div>
            )}
            {card.withBarAfter && (
              <div style={{ background: '#00000030', border: `1px solid ${ts.border}44`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontWeight: 600 }}>🍺 Bar sonrası da var!</p>
              </div>
            )}
            {(card.selectedVenue || card.suggestedVenue) && (() => {
              const v = card.selectedVenue || card.suggestedVenue!
              const label = card.selectedVenue ? '📍 Buluşma Mekanı' : '📍 Önerilen Mekan'
              const sub   = card.selectedVenue ? v.district : `${v.district} (önerildi)`
              return (
                <div style={{ background: '#00000030', border: `1px solid ${ts.border}44`, borderRadius: '10px', padding: '12px 16px' }}>
                  <p style={{ fontSize: '11px', color: ts.accent, marginBottom: '4px', fontWeight: 700 }}>{label}</p>
                  <p style={{ fontWeight: 600 }}>{CAT[v.category]?.emoji ?? '📍'} {v.name}</p>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{sub}</p>
                  {v.googleMapsUrl && (
                    <a href={v.googleMapsUrl} target="_blank" rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: '6px', fontSize: '12px', color: ts.accent, textDecoration: 'none', fontWeight: 600 }}>
                      🗺️ Haritada Gör →
                    </a>
                  )}
                </div>
              )
            })()}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '28px', flexWrap: 'wrap' }}>
            <a
              href={icsUrl}
              onClick={!icsUrl ? e => e.preventDefault() : undefined}
              style={{
                background: icsUrl ? ts.accent : '#333',
                color: icsUrl ? '#000' : '#666',
                fontSize: '13px', fontWeight: 700, padding: '10px 18px',
                borderRadius: '9999px', textDecoration: 'none', cursor: icsUrl ? 'pointer' : 'not-allowed',
              }}>
              📅 Takvime Ekle
            </a>
            <button onClick={copyLink} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 18px' }}>
              {copied ? '✓ Kopyalandı' : '🔗 Kartı Paylaş'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Öneri kutusu ───────────────────────────────────────── */
function SuggestBox({ name, text, accent }: { name: string; text: string; accent: string }) {
  return (
    <div style={{ background: `${accent}14`, border: `1px solid ${accent}44`, borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '18px', flexShrink: 0 }}>💬</span>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '3px' }}>{name}'in önerisi</p>
        <p style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.5 }}>"{text}"</p>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────── */
export default function InvitePage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const [card, setCard] = useState<Card | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState<Step>('invite')

  // form state
  const [selectedOption, setSelectedOption] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('20:00')
  const [location, setLocation] = useState('')
  const [pickupChoice, setPickupChoice] = useState<boolean | null>(null)
  const [withBarAfter, setWithBarAfter] = useState(false)
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [venueList, setVenueList] = useState<VenueInfo[]>([])
  const [showVenueList, setShowVenueList] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/api/public/${username}/${slug}`)
      .then(r => {
        const c = r.data.card
        setCard(c)
        if (c.status === 'accepted') setStep('done')
        if (c.status === 'declined') setStep('done')
        // pre-load venue list for receiver if city known
        if (c.venueCity) {
          const params = new URLSearchParams({ city: c.venueCity })
          if (c.venueDistrict) params.set('district', c.venueDistrict)
          api.get(`/api/venues/suggest?${params}`).then(vr => setVenueList(vr.data.venues)).catch(() => {})
        }
      })
      .catch(() => setNotFound(true))
  }, [username, slug])

  async function decline() {
    if (!card) return
    setSaving(true)
    try {
      const r = await api.post(`/api/public/${username}/${slug}/respond`, { accepted: false })
      setCard(r.data.card)
      setStep('done')
    } finally { setSaving(false) }
  }

  async function finish() {
    if (!card || saving) return
    setSaving(true)
    try {
      let iso: string | undefined
      if (date) {
        const timeStr = time || '20:00'
        const [h, m] = timeStr.split(':').map(Number)
        const d = new Date(date)
        d.setHours(h || 20, m || 0, 0, 0)
        if (!isNaN(d.getTime())) iso = d.toISOString()
      }
      const r = await api.post(`/api/public/${username}/${slug}/respond`, {
        accepted: true,
        selectedOption,
        selectedDate: iso,
        pickupChoice,
        location: location || undefined,
        withBarAfter,
        selectedVenueId: selectedVenueId || undefined,
      })
      setCard(r.data.card)
      setStep('done')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Bir hata oluştu, tekrar dene.'
      alert(msg)
    } finally { setSaving(false) }
  }

  /* ── Loading / Not Found ── */
  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div><p style={{ fontSize: '48px' }}>🤔</p><p style={{ color: '#999', marginTop: '16px' }}>Bu davet bulunamadı.</p></div>
    </div>
  )
  if (!card) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Yükleniyor…</p>
    </div>
  )

  const options = [card.option1Label, card.option2Label, card.option3Label, card.option4Label, card.option5Label, card.option6Label]

  /* ── DONE ── */
  if (step === 'done') {
    if (card.status === 'declined') return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <div><p style={{ fontSize: '48px' }}>😊</p><h2 style={{ fontSize: '24px', fontWeight: 800, marginTop: '16px' }}>Anladık!</h2><p style={{ color: '#999', marginTop: '8px' }}>Belki başka bir zaman.</p></div>
      </div>
    )
    return <DateCard card={card} username={username!} />
  }

  const themeColors: Record<string, { bg: string; accent: string }> = {
    minimal: { bg: '#0D0D0D', accent: '#00F680' },
    rosy:    { bg: '#1A0D10', accent: '#FF8FAB' },
    emoji:   { bg: '#0A0D1A', accent: '#00F680' },
  }
  const tc = themeColors[card.theme] ?? themeColors.minimal

  /* ── INVITE ── */
  if (step === 'invite') return (
    <div style={{ minHeight: '100vh', background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <EmojiBg theme={card.theme} />
      <div className="fade-in" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: tc.accent, marginBottom: '16px', textTransform: 'uppercase' }}>
          {card.user.name} sana bir teklif gönderiyor 💌
        </p>
        <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
          Sen! Evet<br/>Sen! 🎯
        </h1>
        <p style={{ color: '#999', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 }}>
          Çıkma teklifim geri geldi galiba... Benimle bir date'e çıkar mısın?
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStep('select')} className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            Evet ❤️
          </button>
          <RunawayBtn onClick={decline} />
        </div>
      </div>
    </div>
  )

  /* ── SELECT ── */
  if (step === 'select') return (
    <div style={{ minHeight: '100vh', background: tc.bg, padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <EmojiBg theme={card.theme} />
      <div className="fade-in" style={{ maxWidth: '520px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Step bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i === 1 ? tc.accent : '#2A2A2A' }} />)}
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Ne yapalım? 🎯</h2>
        <p style={{ color: '#999', marginBottom: '20px' }}>Bir seçenek seç</p>
        {card.suggestSelect && <SuggestBox name={card.user.name} text={card.suggestSelect} accent={tc.accent} />}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => setSelectedOption(opt)}
              style={{ padding: '20px 16px', borderRadius: '14px', border: `2px solid ${selectedOption === opt ? tc.accent : '#2A2A2A'}`, background: selectedOption === opt ? `${tc.accent}18` : '#1A1A1A', cursor: 'pointer', fontSize: '16px', color: '#fff', fontWeight: 600, transition: 'all 0.15s', textAlign: 'center' }}>
              {opt}
            </button>
          ))}
        </div>
        <button className="btn-primary"
          onClick={() => setStep(card.suggestedVenueId || card.venueCity ? 'venue' : 'datetime')}
          disabled={!selectedOption}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          İlerle →
        </button>
      </div>
    </div>
  )

  /* ── VENUE ── */
  if (step === 'venue') {
    const sugVenue = card.suggestedVenue
    const showList = showVenueList || !sugVenue

    function VenueRow({ v, sel, onSel }: { v: VenueInfo; sel: boolean; onSel: () => void }) {
      const cat = CAT[v.category] ?? { emoji: '📍' }
      const price = v.priceLevel ? '₺'.repeat(v.priceLevel) : ''
      return (
        <div onClick={onSel} style={{
          padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
          border: `2px solid ${sel ? tc.accent : '#2A2A2A'}`,
          background: sel ? `${tc.accent}12` : '#1A1A1A',
          display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s',
        }}>
          <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '14px' }}>{v.name}</p>
            <p style={{ fontSize: '12px', color: '#666' }}>{v.district}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px' }}>
            <div style={{ color: tc.accent }}>{v.rating ? `★ ${v.rating}` : ''}</div>
            <div style={{ color: '#666' }}>{price}</div>
          </div>
          {v.googleMapsUrl && (
            <a href={v.googleMapsUrl} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: '16px', textDecoration: 'none' }}>🗺️</a>
          )}
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', background: tc.bg, padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
        <EmojiBg theme={card.theme} />
        <div className="fade-in" style={{ maxWidth: '520px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= 2 ? tc.accent : '#2A2A2A' }} />)}
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>📍 Buluşma Mekanı</h2>
          <p style={{ color: '#999', marginBottom: '20px' }}>Bir mekan seçebilirsin (opsiyonel)</p>

          {sugVenue && !showList && (
            <div style={{ background: `${tc.accent}10`, border: `2px solid ${tc.accent}44`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: tc.accent, marginBottom: '10px' }}>
                💛 {card.user.name || card.user.username} şunu öneriyor:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '28px' }}>{CAT[sugVenue.category]?.emoji ?? '📍'}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '18px' }}>{sugVenue.name}</p>
                  <p style={{ fontSize: '13px', color: '#999' }}>{sugVenue.district}{sugVenue.rating ? ` · ★ ${sugVenue.rating}` : ''}{sugVenue.priceLevel ? ` · ${'₺'.repeat(sugVenue.priceLevel)}` : ''}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sugVenue.googleMapsUrl && (
                  <a href={sugVenue.googleMapsUrl} target="_blank" rel="noreferrer"
                    style={{ padding: '7px 14px', borderRadius: '9999px', background: '#1A1A1A', border: '1px solid #333', color: '#60A5FA', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                    🗺️ Haritada Gör
                  </a>
                )}
                {sugVenue.instagramUrl && (
                  <a href={sugVenue.instagramUrl} target="_blank" rel="noreferrer"
                    style={{ padding: '7px 14px', borderRadius: '9999px', background: '#1A1A1A', border: '1px solid #333', color: '#F472B6', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                    @ Instagram
                  </a>
                )}
              </div>
              <button onClick={() => { setSelectedVenueId(sugVenue.id); setStep('datetime') }}
                className="btn-primary" style={{ width: '100%', marginTop: '14px', padding: '12px' }}>
                ✓ Bu mekanı onaylıyorum
              </button>
              <button onClick={() => setShowVenueList(true)}
                style={{ width: '100%', marginTop: '8px', background: 'none', border: '1px solid #333', borderRadius: '9999px', color: '#999', padding: '10px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
                Başka mekan seç
              </button>
            </div>
          )}

          {showList && venueList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {venueList.map(v => (
                <VenueRow key={v.id} v={v} sel={selectedVenueId === v.id}
                  onSel={() => setSelectedVenueId(selectedVenueId === v.id ? null : v.id)} />
              ))}
            </div>
          )}

          {showList && venueList.length === 0 && (
            <p style={{ color: '#555', fontSize: '14px', marginBottom: '16px' }}>Bu şehir için mekan bulunamadı.</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep('select')} className="btn-secondary" style={{ flex: 1 }}>← Geri</button>
            <button onClick={() => setStep('datetime')} className="btn-primary" style={{ flex: 2 }}>
              {selectedVenueId ? 'İlerle →' : 'Atla →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── DATETIME ── */
  if (step === 'datetime') {
    let preview = ''
    try {
      if (date && time && time.length >= 5) {
        const d = new Date(`${date}T${time}`)
        if (!isNaN(d.getTime())) {
          preview = d.toLocaleString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
        }
      }
    } catch {}

    return (
      <div style={{ minHeight: '100vh', background: tc.bg, padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
        <EmojiBg theme={card.theme} />
        <div className="fade-in" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= 2 ? tc.accent : '#2A2A2A' }} />)}
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Ne zaman? 📅</h2>
          <p style={{ color: '#999', marginBottom: '20px' }}>Tarih ve saat seç</p>
          {card.suggestDatetime && <SuggestBox name={card.user.name} text={card.suggestDatetime} accent={tc.accent} />}

          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Tarih</label>
              <input type="date" className="input" value={date} min={new Date().toISOString().slice(0,10)}
                onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Saat</label>
              <input type="time" className="input" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            {preview && (
              <div style={{ marginTop: '16px', background: `${tc.accent}18`, border: `1px solid ${tc.accent}44`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ color: tc.accent, fontWeight: 700 }}>📅 {preview}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep('select')} className="btn-secondary" style={{ flex: 1 }}>← Geri</button>
            <button onClick={() => setStep('location')} disabled={!date} className="btn-primary" style={{ flex: 2 }}>İlerle →</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── LOCATION ── */
  if (step === 'location') return (
    <div style={{ minHeight: '100vh', background: tc.bg, padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <EmojiBg theme={card.theme} />
      <div className="fade-in" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= 3 ? tc.accent : '#2A2A2A' }} />)}
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Nerede? 📍</h2>
        <p style={{ color: '#999', marginBottom: '20px' }}>Mekan tercihin nedir? (opsiyonel)</p>
        {card.suggestLocation && <SuggestBox name={card.user.name} text={card.suggestLocation} accent={tc.accent} />}

        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <label className="label">Mekan / Adres</label>
          <input className="input" placeholder="Örn: Kadıköy Meydan, İstanbul" value={location}
            onChange={e => setLocation(e.target.value)} />

          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setWithBarAfter(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', color: withBarAfter ? tc.accent : '#999', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ width: '36px', height: '20px', borderRadius: '9999px', background: withBarAfter ? tc.accent : '#2A2A2A', display: 'grid', alignItems: 'center', padding: '2px', transition: 'background 0.2s', flexShrink: 0 }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transform: withBarAfter ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s', display: 'block' }} />
              </span>
              Yemek sonrası bar da olabilir 🍺
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setStep('datetime')} className="btn-secondary" style={{ flex: 1 }}>← Geri</button>
          <button onClick={() => setStep('pickup')} className="btn-primary" style={{ flex: 2 }}>İlerle →</button>
        </div>
      </div>
    </div>
  )

  /* ── PICKUP ── */
  return (
    <div style={{ minHeight: '100vh', background: tc.bg, padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <EmojiBg theme={card.theme} />
      <div className="fade-in" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: tc.accent }} />)}
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Seni alayım mı? 🚗</h2>
        <p style={{ color: '#999', marginBottom: '20px' }}>Nasıl buluşalım?</p>
        {card.suggestPickup && <SuggestBox name={card.user.name} text={card.suggestPickup} accent={tc.accent} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
          {[
            { val: true,  emoji: '💅', label: 'Evet, gel al beni' },
            { val: false, emoji: '🗺️', label: 'Orada buluşalım' },
          ].map(opt => (
            <button key={String(opt.val)} onClick={() => setPickupChoice(opt.val)}
              style={{ padding: '24px 16px', borderRadius: '14px', border: `2px solid ${pickupChoice === opt.val ? tc.accent : '#2A2A2A'}`, background: pickupChoice === opt.val ? `${tc.accent}18` : '#1A1A1A', cursor: 'pointer', color: '#fff', fontWeight: 600, transition: 'all 0.15s' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{opt.emoji}</div>
              <div style={{ fontSize: '14px' }}>{opt.label}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setStep('location')} className="btn-secondary" style={{ flex: 1 }}>← Geri</button>
          <button onClick={finish} disabled={pickupChoice === null || saving} className="btn-primary" style={{ flex: 2 }}>
            {saving ? 'Kaydediliyor…' : '🎉 Tamamla'}
          </button>
        </div>
      </div>
    </div>
  )
}
