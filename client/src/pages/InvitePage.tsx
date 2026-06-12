import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

/* ── Types ─────────────────────────────────────────────── */
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
  user: { name: string; username: string }
}

type Step = 'invite' | 'select' | 'datetime' | 'location' | 'pickup' | 'done'

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

  function fmt(iso: string) {
    return new Date(iso).toLocaleString('tr-TR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  function icsUrl() { return `/api/cards/${card.id}/ics` }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <EmojiBg theme={card.theme} />
      <div className="date-card-border" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
        <div style={{ background: '#1A1A1A', borderRadius: '18px', padding: '36px 32px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#F5C400', marginBottom: '8px', textTransform: 'uppercase' }}>Date Confirmed 💛</p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>
            {card.user.name} & {card.recipientName} 💛
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {card.selectedOption && (
              <div style={{ background: '#222', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Date tipi</p>
                <p style={{ fontWeight: 600, fontSize: '16px' }}>{card.selectedOption}</p>
              </div>
            )}
            {card.selectedDate && (
              <div style={{ background: '#222', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📅 Tarih & Saat</p>
                <p style={{ fontWeight: 600, fontSize: '15px' }}>{fmt(card.selectedDate)}</p>
              </div>
            )}
            {card.location && (
              <div style={{ background: '#222', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📍 Mekan</p>
                <p style={{ fontWeight: 600 }}>{card.location}</p>
              </div>
            )}
            {card.pickupChoice !== null && (
              <div style={{ background: '#222', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontWeight: 600 }}>{card.pickupChoice ? '🚗 Seni alıyor' : '🗺️ Orada buluşuyorsunuz'}</p>
              </div>
            )}
            {card.withBarAfter && (
              <div style={{ background: '#222', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontWeight: 600 }}>🍺 Bar sonrası da var!</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '28px', flexWrap: 'wrap' }}>
            {card.selectedDate && (
              <a href={icsUrl()} download className="btn-primary" style={{ fontSize: '13px', padding: '10px 18px', textDecoration: 'none' }}>
                📅 Takvime Ekle
              </a>
            )}
            <button onClick={() => { navigator.clipboard.writeText(link) }} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 18px' }}>
              🔗 Kartı Paylaş
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/api/public/${username}/${slug}`)
      .then(r => {
        const c = r.data.card
        setCard(c)
        if (c.status === 'accepted') setStep('done')
        if (c.status === 'declined') setStep('done')
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
      const iso = date && time ? new Date(`${date}T${time}`).toISOString() : undefined
      const r = await api.post(`/api/public/${username}/${slug}/respond`, {
        accepted: true,
        selectedOption,
        selectedDate: iso,
        pickupChoice,
        location: location || undefined,
        withBarAfter,
      })
      setCard(r.data.card)
      setStep('done')
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
    minimal: { bg: '#0D0D0D', accent: '#F5C400' },
    rosy:    { bg: '#1A0D10', accent: '#FF8FAB' },
    emoji:   { bg: '#0A0D1A', accent: '#F5C400' },
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
        <button className="btn-primary" onClick={() => setStep('datetime')} disabled={!selectedOption}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          İlerle →
        </button>
      </div>
    </div>
  )

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
