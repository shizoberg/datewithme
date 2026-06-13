import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

interface GNOCard {
  id: string
  groupName: string
  theme: string
  option1Label: string; option2Label: string; option3Label: string
  option4Label: string; option5Label: string; option6Label: string
  time1Label: string; time2Label: string; time3Label: string
  location1Label: string; location2Label: string; location3Label: string
  votes: Vote[]
  user: { name: string; username: string }
}

interface Vote {
  id: string
  voterName: string
  selectedEvent: string
  selectedTime: string
  selectedLocation: string
}

function PollBar({ label, count, total, accent }: { label: string; count: number; total: number; accent: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#888' }}>{count} oy · %{pct}</span>
      </div>
      <div style={{ height: '6px', borderRadius: '9999px', background: '#2A2A2A', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

function tally(votes: Vote[], key: keyof Vote) {
  const map: Record<string, number> = {}
  votes.forEach(v => { const val = v[key] as string; map[val] = (map[val] || 0) + 1 })
  return map
}

export default function GNOPage() {
  const { slug } = useParams<{ slug: string }>()
  const [card, setCard] = useState<GNOCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'name' | 'vote' | 'done'>('name')
  const [voterName, setVoterName] = useState('')
  const [selEvent, setSelEvent]   = useState('')
  const [selTime, setSelTime]     = useState('')
  const [selLoc, setSelLoc]       = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    api.get(`/api/gno/public/${slug}`)
      .then(r => setCard(r.data.card))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  // Poll every 10s to update votes
  useEffect(() => {
    if (!card) return
    const interval = setInterval(() => {
      api.get(`/api/gno/public/${slug}`)
        .then(r => setCard(r.data.card))
        .catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [card, slug])

  async function submitVote() {
    if (!card || !voterName.trim() || !selEvent || !selTime || !selLoc) return
    setSaving(true)
    try {
      await api.post(`/api/gno/${card.id}/vote`, {
        voterName: voterName.trim(),
        selectedEvent: selEvent,
        selectedTime: selTime,
        selectedLocation: selLoc,
      })
      const r = await api.get(`/api/gno/public/${slug}`)
      setCard(r.data.card)
      setStep('done')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Yükleniyor…</p>
    </div>
  )

  if (!card) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#666' }}>Grup bulunamadı.</p>
    </div>
  )

  const themeStyle = {
    minimal: { bg: '#0D0D0D', surface: '#1A1A1A', accent: '#F5C400', border: '#F5C400' },
    rosy:    { bg: '#1A0810', surface: '#2D1520', accent: '#FF8FAB', border: '#C06080' },
    emoji:   { bg: '#0A0D1A', surface: '#12172A', accent: '#F5C400', border: '#4C6EF5' },
  }
  const ts = themeStyle[card.theme as keyof typeof themeStyle] || themeStyle.rosy

  const eventOptions   = [card.option1Label, card.option2Label, card.option3Label, card.option4Label, card.option5Label, card.option6Label]
  const timeOptions    = [card.time1Label, card.time2Label, card.time3Label]
  const locationOptions = [card.location1Label, card.location2Label, card.location3Label]

  const totalVotes = card.votes.length
  const eventTally = tally(card.votes, 'selectedEvent')
  const timeTally  = tally(card.votes, 'selectedTime')
  const locTally   = tally(card.votes, 'selectedLocation')

  const winner = (t: Record<string, number>) => Object.entries(t).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  return (
    <div style={{ minHeight: '100vh', background: ts.bg, color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', background: `${ts.accent}20`, border: `1px solid ${ts.accent}44`, borderRadius: '9999px', padding: '4px 14px', fontSize: '12px', color: ts.accent, fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
            👯‍♀️ GIRLS NIGHT OUT
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>{card.groupName}</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>{totalVotes} kişi oy kullandı</p>
        </div>

        {/* Live Poll Results */}
        <div style={{ background: ts.surface, border: `1px solid ${ts.border}33`, borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: ts.accent, marginBottom: '16px', letterSpacing: '1px' }}>📊 CANLI SONUÇLAR</p>

          <p style={{ fontSize: '12px', color: '#666', fontWeight: 700, marginBottom: '8px' }}>🎯 ETKİNLİK</p>
          {eventOptions.map(o => <PollBar key={o} label={o} count={eventTally[o] || 0} total={totalVotes} accent={ts.accent} />)}

          <div style={{ height: '1px', background: '#2A2A2A', margin: '16px 0' }} />

          <p style={{ fontSize: '12px', color: '#666', fontWeight: 700, marginBottom: '8px' }}>📅 ZAMAN</p>
          {timeOptions.map(o => <PollBar key={o} label={o} count={timeTally[o] || 0} total={totalVotes} accent={ts.accent} />)}

          <div style={{ height: '1px', background: '#2A2A2A', margin: '16px 0' }} />

          <p style={{ fontSize: '12px', color: '#666', fontWeight: 700, marginBottom: '8px' }}>📍 MEKAN</p>
          {locationOptions.map(o => <PollBar key={o} label={o} count={locTally[o] || 0} total={totalVotes} accent={ts.accent} />)}
        </div>

        {/* Voting section */}
        {step === 'name' && (
          <div style={{ background: ts.surface, border: `1px solid ${ts.border}44`, borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>Oyunu kullan! 🗳️</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Adını gir ve tercihlerini seç.</p>
            <label className="label">Adın</label>
            <input className="input" placeholder="Zeynep" value={voterName}
              onChange={e => setVoterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && voterName.trim() && setStep('vote')}
              style={{ marginBottom: '16px' }} autoFocus />
            <button className="btn-primary" onClick={() => setStep('vote')} disabled={!voterName.trim()}
              style={{ width: '100%', background: ts.accent, color: '#000' }}>
              Devam Et →
            </button>
          </div>
        )}

        {step === 'vote' && (
          <div style={{ background: ts.surface, border: `1px solid ${ts.border}44`, borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '4px' }}>Merhaba {voterName}! 👋</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Her kategoriden birini seç.</p>

            <p style={{ fontSize: '13px', fontWeight: 700, color: ts.accent, marginBottom: '10px' }}>🎯 Etkinlik</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {eventOptions.map(o => (
                <button key={o} onClick={() => setSelEvent(o)}
                  style={{ padding: '8px 14px', borderRadius: '9999px', border: `1.5px solid ${selEvent === o ? ts.accent : '#2A2A2A'}`, background: selEvent === o ? `${ts.accent}22` : 'transparent', color: selEvent === o ? ts.accent : '#ccc', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}>
                  {o}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '13px', fontWeight: 700, color: ts.accent, marginBottom: '10px' }}>📅 Zaman</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {timeOptions.map(o => (
                <button key={o} onClick={() => setSelTime(o)}
                  style={{ padding: '8px 14px', borderRadius: '9999px', border: `1.5px solid ${selTime === o ? ts.accent : '#2A2A2A'}`, background: selTime === o ? `${ts.accent}22` : 'transparent', color: selTime === o ? ts.accent : '#ccc', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}>
                  {o}
                </button>
              ))}
            </div>

            <p style={{ fontSize: '13px', fontWeight: 700, color: ts.accent, marginBottom: '10px' }}>📍 Mekan</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {locationOptions.map(o => (
                <button key={o} onClick={() => setSelLoc(o)}
                  style={{ padding: '8px 14px', borderRadius: '9999px', border: `1.5px solid ${selLoc === o ? ts.accent : '#2A2A2A'}`, background: selLoc === o ? `${ts.accent}22` : 'transparent', color: selLoc === o ? ts.accent : '#ccc', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}>
                  {o}
                </button>
              ))}
            </div>

            <button className="btn-primary" onClick={submitVote}
              disabled={!selEvent || !selTime || !selLoc || saving}
              style={{ width: '100%', background: ts.accent, color: '#000' }}>
              {saving ? 'Kaydediliyor…' : '✅ Oyumu Gönder'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ background: ts.surface, border: `1px solid ${ts.accent}44`, borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>Oyun kaydedildi!</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>Tüm kızlar oyladığında sonuç netleşecek.</p>
            {totalVotes > 0 && (
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: ts.accent, marginBottom: '12px' }}>🏆 Şu anki lider:</p>
                <p style={{ fontSize: '14px', marginBottom: '6px' }}>🎯 {winner(eventTally)}</p>
                <p style={{ fontSize: '14px', marginBottom: '6px' }}>📅 {winner(timeTally)}</p>
                <p style={{ fontSize: '14px' }}>📍 {winner(locTally)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
