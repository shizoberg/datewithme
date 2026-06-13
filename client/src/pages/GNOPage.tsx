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
  pickupChoice: string
}

const TS = {
  minimal: { bg: '#0D0D0D', surface: '#1A1A1A', surface2: '#222', accent: '#F5C400', border: '#F5C400', muted: '#888' },
  rosy:    { bg: '#130810', surface: '#2D1520', surface2: '#3D1F2C', accent: '#FF8FAB', border: '#C06080', muted: '#a06070' },
  emoji:   { bg: '#0A0D1A', surface: '#12172A', surface2: '#1C2438', accent: '#F5C400', border: '#4C6EF5', muted: '#6080c0' },
}

function PollBar({ label, count, total, accent, isLeader }: { label: string; count: number; total: number; accent: string; isLeader: boolean }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isLeader && count > 0 && <span style={{ fontSize: '12px' }}>👑</span>}
          <span style={{ fontSize: '13px', fontWeight: isLeader && count > 0 ? 700 : 500, color: isLeader && count > 0 ? '#fff' : '#bbb' }}>{label}</span>
        </div>
        <span style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>{count > 0 ? `${count} oy · %${pct}` : '0 oy'}</span>
      </div>
      <div style={{ height: '7px', borderRadius: '9999px', background: '#1A1A1A', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: isLeader && count > 0 ? accent : `${accent}55`, borderRadius: '9999px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function tally(votes: Vote[], key: keyof Vote) {
  const map: Record<string, number> = {}
  votes.forEach(v => { const val = v[key] as string; map[val] = (map[val] || 0) + 1 })
  return map
}

function leader(t: Record<string, number>) {
  return Object.entries(t).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
}

// Pill selector with "custom" option
function PillSelect({ options, value, onChange, accent, surface2, placeholder }:
  { options: string[]; value: string; onChange: (v: string) => void; accent: string; surface2: string; placeholder: string }) {
  const [custom, setCustom] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const isCustomActive = value && !options.includes(value)

  function handleCustom(v: string) {
    setCustom(v)
    onChange(v)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        {options.map(o => (
          <button key={o} onClick={() => { onChange(o); setShowCustom(false) }}
            style={{ padding: '8px 16px', borderRadius: '9999px', border: `1.5px solid ${value === o ? accent : '#333'}`, background: value === o ? `${accent}22` : 'transparent', color: value === o ? accent : '#aaa', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s', fontFamily: 'Raleway, sans-serif' }}>
            {o}
          </button>
        ))}
        <button onClick={() => setShowCustom(v => !v)}
          style={{ padding: '8px 16px', borderRadius: '9999px', border: `1.5px solid ${isCustomActive || showCustom ? accent : '#333'}`, background: isCustomActive || showCustom ? `${accent}22` : 'transparent', color: isCustomActive || showCustom ? accent : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s', fontFamily: 'Raleway, sans-serif' }}>
          ✏️ Kendim yazayım
        </button>
      </div>
      {showCustom && (
        <input
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${accent}66`, background: surface2, color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Raleway, sans-serif', boxSizing: 'border-box' }}
          placeholder={placeholder}
          value={custom}
          autoFocus
          onChange={e => handleCustom(e.target.value)}
        />
      )}
    </div>
  )
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
  const [pickupChoice, setPickupChoice] = useState<'meet' | 'pickup'>('meet')
  const [saving, setSaving]       = useState(false)

  function refresh() {
    return api.get(`/api/gno/public/${slug}`).then(r => setCard(r.data.card)).catch(() => {})
  }

  useEffect(() => {
    api.get(`/api/gno/public/${slug}`)
      .then(r => setCard(r.data.card))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!card) return
    const interval = setInterval(refresh, 8000)
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
        pickupChoice,
      })
      await refresh()
      setStep('done')
    } catch (err: any) {
      alert(err.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D' }}>
      <p style={{ color: '#666', fontFamily: 'Raleway, sans-serif' }}>Yükleniyor…</p>
    </div>
  )

  if (!card) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D0D' }}>
      <p style={{ color: '#666', fontFamily: 'Raleway, sans-serif' }}>Grup bulunamadı.</p>
    </div>
  )

  const ts = TS[card.theme as keyof typeof TS] || TS.rosy
  const eventOptions    = [card.option1Label, card.option2Label, card.option3Label, card.option4Label, card.option5Label, card.option6Label]
  const timeOptions     = [card.time1Label, card.time2Label, card.time3Label]
  const locationOptions = [card.location1Label, card.location2Label, card.location3Label]
  const totalVotes      = card.votes.length
  const eventTally      = tally(card.votes, 'selectedEvent')
  const timeTally       = tally(card.votes, 'selectedTime')
  const locTally        = tally(card.votes, 'selectedLocation')
  const pickupTally     = tally(card.votes, 'pickupChoice')

  // Merge custom options into tally display
  const allEventOpts    = [...new Set([...eventOptions, ...Object.keys(eventTally)])]
  const allTimeOpts     = [...new Set([...timeOptions, ...Object.keys(timeTally)])]
  const allLocOpts      = [...new Set([...locationOptions, ...Object.keys(locTally)])]

  const canVote = !!voterName.trim() && !!selEvent && !!selTime && !!selLoc

  return (
    <div style={{ minHeight: '100vh', background: ts.bg, color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${ts.accent}18`, border: `1px solid ${ts.accent}40`, borderRadius: '9999px', padding: '5px 16px', fontSize: '12px', color: ts.accent, fontWeight: 800, letterSpacing: '1.5px', marginBottom: '14px', textTransform: 'uppercase' }}>
            👯‍♀️ Girls Night Out
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>{card.groupName}</h1>
          <p style={{ color: ts.muted, fontSize: '14px' }}>{totalVotes === 0 ? 'Henüz oy yok — ilk sen ol!' : `${totalVotes} kişi oyladı`}</p>
        </div>

        {/* Live Poll */}
        <div style={{ background: ts.surface, border: `1px solid ${ts.border}28`, borderRadius: '20px', padding: '22px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: ts.accent, letterSpacing: '1px', textTransform: 'uppercase' }}>Canlı Sonuçlar</span>
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#555', fontWeight: 600 }}>her 8sn güncellenir</span>
          </div>

          <p style={{ fontSize: '11px', color: '#555', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>🎯 Etkinlik</p>
          {allEventOpts.map(o => <PollBar key={o} label={o} count={eventTally[o] || 0} total={totalVotes} accent={ts.accent} isLeader={leader(eventTally) === o} />)}

          <div style={{ height: '1px', background: `${ts.border}20`, margin: '16px 0' }} />

          <p style={{ fontSize: '11px', color: '#555', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>📅 Zaman</p>
          {allTimeOpts.map(o => <PollBar key={o} label={o} count={timeTally[o] || 0} total={totalVotes} accent={ts.accent} isLeader={leader(timeTally) === o} />)}

          <div style={{ height: '1px', background: `${ts.border}20`, margin: '16px 0' }} />

          <p style={{ fontSize: '11px', color: '#555', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>📍 Mekan</p>
          {allLocOpts.map(o => <PollBar key={o} label={o} count={locTally[o] || 0} total={totalVotes} accent={ts.accent} isLeader={leader(locTally) === o} />)}

          {totalVotes > 0 && (
            <>
              <div style={{ height: '1px', background: `${ts.border}20`, margin: '16px 0' }} />
              <p style={{ fontSize: '11px', color: '#555', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>🚗 Ulaşım</p>
              {['meet', 'pickup'].map(o => (
                <PollBar key={o} label={o === 'meet' ? '🗺️ Orada buluşalım' : '🚗 Alabilirsiniz'} count={pickupTally[o] || 0} total={totalVotes} accent={ts.accent} isLeader={leader(pickupTally) === o} />
              ))}
            </>
          )}
        </div>

        {/* Voting Card */}
        {step === 'name' && (
          <div style={{ background: ts.surface, border: `1px solid ${ts.border}40`, borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '6px' }}>Oyunu kullan 🗳️</h3>
            <p style={{ color: ts.muted, fontSize: '14px', marginBottom: '20px' }}>Adını gir ve tercihlerini seç.</p>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Adın</label>
            <input
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1.5px solid ${ts.border}50`, background: ts.surface2, color: '#fff', fontSize: '16px', outline: 'none', fontFamily: 'Raleway, sans-serif', boxSizing: 'border-box', marginBottom: '16px' }}
              placeholder="Zeynep"
              value={voterName}
              onChange={e => setVoterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && voterName.trim() && setStep('vote')}
              autoFocus
            />
            <button onClick={() => setStep('vote')} disabled={!voterName.trim()}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: voterName.trim() ? ts.accent : '#2A2A2A', color: voterName.trim() ? '#000' : '#555', cursor: voterName.trim() ? 'pointer' : 'default', fontSize: '15px', fontWeight: 800, fontFamily: 'Raleway, sans-serif', transition: 'all 0.15s' }}>
              Devam Et →
            </button>
          </div>
        )}

        {step === 'vote' && (
          <div style={{ background: ts.surface, border: `1px solid ${ts.border}40`, borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `${ts.accent}22`, border: `1.5px solid ${ts.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👋</div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '16px' }}>Merhaba {voterName}!</p>
                <p style={{ color: ts.muted, fontSize: '12px' }}>Her kategoriden birini seç veya kendin yaz.</p>
              </div>
            </div>

            {/* Event */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: ts.accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>🎯 Etkinlik {selEvent && <span style={{ color: '#666', fontWeight: 500 }}>· {selEvent}</span>}</p>
              <PillSelect options={eventOptions} value={selEvent} onChange={setSelEvent} accent={ts.accent} surface2={ts.surface2} placeholder="Kendi etkinliğini yaz…" />
            </div>

            <div style={{ height: '1px', background: `${ts.border}20`, marginBottom: '20px' }} />

            {/* Time */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: ts.accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>📅 Zaman {selTime && <span style={{ color: '#666', fontWeight: 500 }}>· {selTime}</span>}</p>
              <PillSelect options={timeOptions} value={selTime} onChange={setSelTime} accent={ts.accent} surface2={ts.surface2} placeholder="Kendi zamanını yaz…" />
            </div>

            <div style={{ height: '1px', background: `${ts.border}20`, marginBottom: '20px' }} />

            {/* Location */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: ts.accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>📍 Mekan {selLoc && <span style={{ color: '#666', fontWeight: 500 }}>· {selLoc}</span>}</p>
              <PillSelect options={locationOptions} value={selLoc} onChange={setSelLoc} accent={ts.accent} surface2={ts.surface2} placeholder="Kendi mekanını yaz…" />
            </div>

            <div style={{ height: '1px', background: `${ts.border}20`, marginBottom: '20px' }} />

            {/* Pickup */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: ts.accent, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>🚗 Nasıl Gidelim?</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { val: 'meet', icon: '🗺️', label: 'Orada buluşalım' },
                  { val: 'pickup', icon: '🚗', label: 'Beni alabilirsiniz' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setPickupChoice(opt.val as 'meet' | 'pickup')}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: '12px', border: `1.5px solid ${pickupChoice === opt.val ? ts.accent : '#333'}`, background: pickupChoice === opt.val ? `${ts.accent}18` : 'transparent', color: pickupChoice === opt.val ? ts.accent : '#888', cursor: 'pointer', fontSize: '13px', fontWeight: 700, textAlign: 'center', transition: 'all 0.15s', fontFamily: 'Raleway, sans-serif' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{opt.icon}</div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={submitVote} disabled={!canVote || saving}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: canVote ? ts.accent : '#2A2A2A', color: canVote ? '#000' : '#555', cursor: canVote ? 'pointer' : 'default', fontSize: '15px', fontWeight: 800, fontFamily: 'Raleway, sans-serif', transition: 'all 0.15s' }}>
              {saving ? 'Kaydediliyor…' : '✅ Oyumu Gönder'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ background: ts.surface, border: `1px solid ${ts.accent}44`, borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Oyun kaydedildi!</h3>
            <p style={{ color: ts.muted, fontSize: '14px', marginBottom: '24px' }}>Tüm kızlar oyladığında sonuç netleşecek. Sayfayı açık bırakırsan sonuçlar canlı güncellenir.</p>

            {totalVotes > 0 && (
              <div style={{ background: ts.surface2, borderRadius: '14px', padding: '16px', textAlign: 'left' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: ts.accent, letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>🏆 Şu anki lider</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🎯</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{leader(eventTally) || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📅</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{leader(timeTally) || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📍</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{leader(locTally) || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>🚗</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{(pickupTally['pickup'] || 0) > (pickupTally['meet'] || 0) ? 'Alınmak istiyor' : 'Orada buluşuyor'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#333', fontSize: '12px', marginTop: '32px' }}>
          <span style={{ color: ts.accent, fontWeight: 700 }}>getdatewith.me</span> ile oluşturuldu
        </p>
      </div>
    </div>
  )
}
