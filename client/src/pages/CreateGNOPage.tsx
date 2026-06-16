import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const THEMES = [
  { id: 'rosy',    label: 'Rosy',    desc: 'Pembe & romantic', preview: { bg: '#2D1A1E', border: '#C06080', dot: '#FF8FAB' } },
  { id: 'minimal', label: 'Minimal', desc: 'Sade & şık',       preview: { bg: '#111',    border: '#333',    dot: '#fff' } },
  { id: 'emoji',   label: 'Emoji',   desc: 'Renkli & eğlenceli', preview: { bg: '#1A1F2A', border: '#4C6EF5', dot: '#00F680' } },
]

const DEFAULT_OPTIONS  = ['🍕 Pizza', '🍦 Dondurma', '☕ Kahve', '🍸 Kokteyl', '🎨 Workshop', '🍺 Bar']
const DEFAULT_TIMES    = ['Cuma 20:00', 'Cumartesi 20:00', 'Pazar 18:00']
const DEFAULT_LOCATIONS = ['Kadıköy', 'Beşiktaş', 'Nişantaşı']

const CAT: Record<string, { emoji: string }> = {
  cafe:       { emoji: '☕' },
  restaurant: { emoji: '🍽️' },
  bar:        { emoji: '🍸' },
  park:       { emoji: '🌿' },
  rooftop:    { emoji: '🌆' },
  cultural:   { emoji: '🎨' },
}

interface Venue {
  id: string; name: string; category: string; city: string
  district: string; address?: string; googleMapsUrl?: string
  instagramUrl?: string; rating?: number; priceLevel?: number
}

function VenueCard({ venue, selected, onSelect, accent }: { venue: Venue; selected: boolean; onSelect: () => void; accent: string }) {
  const cat = CAT[venue.category] ?? { emoji: '📍' }
  const price = venue.priceLevel ? '₺'.repeat(venue.priceLevel) : ''
  const stars = venue.rating ? Math.round(venue.rating) : 0

  return (
    <div onClick={onSelect} style={{
      padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s',
      border: `2px solid ${selected ? accent : '#2A2A2A'}`,
      background: selected ? `${accent}10` : '#1A1A1A',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{ fontSize: '24px', flexShrink: 0 }}>{cat.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          {selected && <span style={{ fontSize: '10px', fontWeight: 700, color: accent, background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: '4px', padding: '1px 5px' }}>✓ Önerildi</span>}
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{venue.name}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>{venue.district}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '12px', color: accent, marginBottom: '4px' }}>
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>{price}</div>
      </div>
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); venue.googleMapsUrl && window.open(venue.googleMapsUrl, '_blank') }}
          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #333', background: 'none', color: venue.googleMapsUrl ? '#60A5FA' : '#444', cursor: venue.googleMapsUrl ? 'pointer' : 'not-allowed', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          🗺️
        </button>
        <button
          onClick={e => { e.stopPropagation(); venue.instagramUrl && window.open(venue.instagramUrl, '_blank') }}
          style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #333', background: 'none', color: venue.instagramUrl ? '#F472B6' : '#444', cursor: venue.instagramUrl ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          @
        </button>
      </div>
    </div>
  )
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default function CreateGNOPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]           = useState<1 | 2 | 3>(1)
  const [groupName, setGroupName] = useState('')
  const [theme, setTheme]         = useState('rosy')
  const [options, setOptions]     = useState([...DEFAULT_OPTIONS])
  const [times, setTimes]         = useState([...DEFAULT_TIMES])
  const [locations, setLocations] = useState([...DEFAULT_LOCATIONS])
  const [venueCity, setVenueCity]         = useState('')
  const [venueDistrict, setVenueDistrict] = useState('')
  const [venues, setVenues]               = useState<Venue[]>([])
  const [venueLoading, setVenueLoading]   = useState(false)
  const [suggestedVenueId, setSuggestedVenueId] = useState('')
  const [saving, setSaving]       = useState(false)
  const [done, setDone]           = useState<{ link: string } | null>(null)
  const [copied, setCopied]       = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const accent = '#FF8FAB'

  useEffect(() => {
    if (venueCity.length < 2) { setVenues([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setVenueLoading(true)
      try {
        const params = new URLSearchParams({ city: venueCity })
        if (venueDistrict) params.set('district', venueDistrict)
        const r = await api.get(`/api/venues/suggest?${params}`)
        setVenues(r.data.venues)
      } catch { setVenues([]) }
      finally { setVenueLoading(false) }
    }, 600)
  }, [venueCity, venueDistrict])

  async function publish() {
    setSaving(true)
    try {
      const r = await api.post('/api/gno', {
        groupName: groupName.trim(),
        theme,
        option1Label: options[0], option2Label: options[1],
        option3Label: options[2], option4Label: options[3],
        option5Label: options[4], option6Label: options[5],
        time1Label: times[0], time2Label: times[1], time3Label: times[2],
        location1Label: locations[0], location2Label: locations[1], location3Label: locations[2],
        venueCity:       venueCity       || undefined,
        venueDistrict:   venueDistrict   || undefined,
        suggestedVenueId: suggestedVenueId || undefined,
      })
      const slug = r.data.card.slug
      const link = `${window.location.origin}/girlsnightout/${slug}`
      setDone({ link })
    } catch (err: any) {
      alert(err.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(done!.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── DONE ────────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>👯‍♀️</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{groupName} için oylama hazır!</h2>
        <p style={{ color: '#999', marginBottom: '32px' }}>Bu linki gruba at, oylama başlasın!</p>
        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ flex: 1, fontSize: '13px', wordBreak: 'break-all', textAlign: 'left', color: '#ccc' }}>{done.link}</span>
          <button onClick={copy} className="btn-primary" style={{ flexShrink: 0, padding: '8px 16px', fontSize: '13px' }}>
            {copied ? '✓' : '📋 Kopyala'}
          </button>
        </div>
        <Link to="/dashboard" style={{ color: '#999', fontSize: '14px' }}>← Dashboard'a dön</Link>
      </div>
    </div>
  )

  // ── STEP 1 ───────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <Link to="/dashboard" style={{ color: '#999', fontSize: '14px', textDecoration: 'none', display: 'block', marginBottom: '32px' }}>← Dashboard</Link>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i === 1 ? accent : '#2A2A2A' }} />)}
        </div>

        <div style={{ display: 'inline-block', background: '#2D1520', border: '1px solid #C06080', borderRadius: '9999px', padding: '4px 14px', fontSize: '12px', color: accent, fontWeight: 700, marginBottom: '16px', letterSpacing: '1px' }}>
          👯‍♀️ GIRLS NIGHT OUT
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Grubun adı ne? 💅</h2>
        <p style={{ color: '#999', marginBottom: '28px' }}>Grup adı link olarak görünecek.</p>

        <div style={{ marginBottom: '24px' }}>
          <label className="label">Grup adı</label>
          <input className="input" style={{ fontSize: '18px' }} placeholder="Pembe Kızlar" value={groupName}
            onChange={e => setGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && groupName.trim() && setStep(2)} autoFocus />
          {groupName && (
            <p style={{ marginTop: '8px', fontSize: '13px', color: accent }}>
              getdatewith.me/girlsnightout/{slugify(groupName)}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label className="label" style={{ marginBottom: '12px' }}>Tema</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                style={{ padding: '16px 12px', borderRadius: '12px', border: `2px solid ${theme === t.id ? accent : '#2A2A2A'}`, background: t.preview.bg, cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.preview.dot, margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{t.label}</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Venue section */}
        <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '20px', marginBottom: '28px' }}>
          <label className="label" style={{ marginBottom: '6px' }}>📍 Buluşma şehri <span style={{ color: '#555', fontWeight: 400 }}>(opsiyonel)</span></label>
          <input className="input" placeholder="İstanbul, İzmir, Ankara..." value={venueCity}
            onChange={e => setVenueCity(e.target.value)} style={{ marginBottom: '10px' }} />

          {venueCity.length >= 2 && (
            <>
              <label className="label" style={{ marginBottom: '6px' }}>İlçe <span style={{ color: '#555', fontWeight: 400 }}>(önerilir)</span></label>
              <input className="input" placeholder="Kadıköy, Alsancak..." value={venueDistrict}
                onChange={e => setVenueDistrict(e.target.value)} style={{ marginBottom: '12px' }} />
            </>
          )}

          {venueLoading && <p style={{ color: '#666', fontSize: '13px' }}>Mekanlar aranıyor…</p>}

          {!venueLoading && venues.length > 0 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>📍 Önerilen Mekanlar</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {venues.map(v => (
                  <VenueCard key={v.id} venue={v} selected={suggestedVenueId === v.id} accent={accent}
                    onSelect={() => setSuggestedVenueId(suggestedVenueId === v.id ? '' : v.id)} />
                ))}
              </div>
              {suggestedVenueId && (
                <button onClick={() => setSuggestedVenueId('')}
                  style={{ marginTop: '8px', background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
                  × Seçimi kaldır
                </button>
              )}
            </>
          )}

          {!venueLoading && venueCity.length >= 2 && venues.length === 0 && (
            <p style={{ color: '#555', fontSize: '13px' }}>Bu şehir için henüz mekan yok.</p>
          )}
        </div>

        <button className="btn-primary" onClick={() => setStep(2)} disabled={!groupName.trim()}
          style={{ width: '100%', padding: '14px', fontSize: '16px', background: accent, color: '#000' }}>
          İlerle →
        </button>
      </div>
    </div>
  )

  // ── STEP 2 ───────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px', marginBottom: '32px', display: 'block' }}>← Geri</button>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= 2 ? accent : '#2A2A2A' }} />)}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Seçenekleri ayarla ✏️</h2>
        <p style={{ color: '#999', marginBottom: '24px' }}>Kızlar her kategoriden birini oylayacak.</p>

        {/* Event options */}
        <div style={{ marginBottom: '24px' }}>
          <label className="label" style={{ marginBottom: '10px' }}>🎯 Etkinlik seçenekleri</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.map((opt, i) => (
              <input key={i} className="input" value={opt}
                onChange={e => setOptions(o => o.map((v, j) => j === i ? e.target.value : v))} />
            ))}
          </div>
        </div>

        {/* Time options */}
        <div style={{ marginBottom: '24px' }}>
          <label className="label" style={{ marginBottom: '10px' }}>📅 Zaman seçenekleri</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {times.map((t, i) => (
              <input key={i} className="input" value={t}
                onChange={e => setTimes(arr => arr.map((v, j) => j === i ? e.target.value : v))} />
            ))}
          </div>
        </div>

        {/* Location options */}
        <div style={{ marginBottom: '32px' }}>
          <label className="label" style={{ marginBottom: '10px' }}>📍 Mekan seçenekleri</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {locations.map((l, i) => (
              <input key={i} className="input" value={l}
                onChange={e => setLocations(arr => arr.map((v, j) => j === i ? e.target.value : v))} />
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={() => setStep(3)}
          style={{ width: '100%', padding: '14px', fontSize: '16px', background: accent, color: '#000' }}>
          İlerle →
        </button>
      </div>
    </div>
  )

  // ── STEP 3 — confirm & publish ───────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px', marginBottom: '32px', display: 'block' }}>← Geri</button>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: accent }} />)}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Hazır! 🎉</h2>
        <p style={{ color: '#999', marginBottom: '28px' }}>Her şey doğru görünüyor mu?</p>

        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: accent, fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>👯‍♀️ GIRLS NIGHT OUT</p>
          <p style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>{groupName}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p style={{ fontSize: '13px', color: '#888' }}>🎯 {options.filter(Boolean).join(' · ')}</p>
            <p style={{ fontSize: '13px', color: '#888' }}>📅 {times.filter(Boolean).join(' · ')}</p>
            <p style={{ fontSize: '13px', color: '#888' }}>📍 {locations.filter(Boolean).join(' · ')}</p>
            {suggestedVenueId && venues.find(v => v.id === suggestedVenueId) && (
              <p style={{ fontSize: '13px', color: accent }}>
                📍 Önerilen mekan: {venues.find(v => v.id === suggestedVenueId)?.name}
              </p>
            )}
          </div>
        </div>

        <button className="btn-primary" onClick={publish} disabled={saving}
          style={{ width: '100%', padding: '14px', fontSize: '16px', background: accent, color: '#000' }}>
          {saving ? 'Oluşturuluyor…' : '🚀 Oylama Linkini Oluştur'}
        </button>
      </div>
    </div>
  )
}
