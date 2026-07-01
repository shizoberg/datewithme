import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface VenueResult { id: string; name: string; category: string; city: string; district: string; address?: string }

interface Stop {
  venueName: string
  venueId?: string
  address?: string
  description?: string
  transitMode?: string
  transitLine?: string
  transitNote?: string
  tags?: string[]     // max 3 custom tag
  _tagInput?: string  // current tag being typed
  _venueSearch?: string
  _results?: VenueResult[]
}

const TRANSIT_MODES = [
  { value: 'yürüyüş', label: '🚶 Yürüyüş' },
  { value: 'otobüs',  label: '🚌 Otobüs' },
  { value: 'metro',   label: '🚇 Metro' },
  { value: 'tramvay', label: '🚋 Tramvay' },
  { value: 'taksi',   label: '🚕 Taksi' },
  { value: 'araba',   label: '🚗 Araba' },
  { value: 'feribot', label: '⛴️ Feribot' },
]

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid #E0E0E0', background: '#F8F8F8', color: '#0D0D0D',
  fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, color: '#444',
  letterSpacing: '0.5px', marginBottom: '5px', textTransform: 'uppercase',
}

export default function CreateTriplistPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [country, setCountry] = useState('Turkey')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [teamMembers, setTeamMembers] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [stops, setStops] = useState<Stop[]>([{ venueName: '' }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { document.title = 'Triplist Oluştur — getdatewith.me' }, [])

  function addStop() { setStops(s => [...s, { venueName: '' }]) }
  function removeStop(i: number) { setStops(s => s.filter((_, idx) => idx !== i)) }

  function updateStop(i: number, patch: Partial<Stop>) {
    setStops(s => s.map((st, idx) => idx === i ? { ...st, ...patch } : st))
  }

  async function searchVenue(i: number, q: string) {
    updateStop(i, { _venueSearch: q, venueName: q, venueId: undefined })
    if (q.length < 2) { updateStop(i, { _results: [] }); return }
    try {
      const { data } = await api.get('/api/triplists/venue-search', { params: { q } })
      updateStop(i, { _results: data })
    } catch { /* ignore */ }
  }

  function selectVenue(i: number, v: VenueResult) {
    updateStop(i, {
      venueName: v.name, venueId: v.id,
      address: v.address || `${v.district}, ${v.city}`,
      _venueSearch: v.name, _results: [],
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !city.trim() || stops.every(s => !s.venueName.trim())) {
      setError('Başlık, şehir ve en az bir durak gerekli.'); return
    }
    setSaving(true); setError('')
    try {
      const { data } = await api.post('/api/triplists', {
        title: title.trim(), city: city.trim(), district: district.trim(),
        country, description: description.trim() || undefined,
        startDate: startDate || undefined, endDate: endDate || undefined,
        teamMembers: teamMembers.trim() || undefined,
        isPublic,
        stops: stops.filter(s => s.venueName.trim()).map(s => ({
          venueName: s.venueName, venueId: s.venueId,
          address: s.address, description: s.description,
          transitMode: s.transitMode, transitLine: s.transitLine, transitNote: s.transitNote,
          tags: s.tags && s.tags.length > 0 ? JSON.stringify(s.tags) : undefined,
        })),
      })
      navigate(`/${user?.username}/triplist/${data.slug}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata oluştu.')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px 80px' }}>
        <Link to="/topluluk" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#555', textDecoration: 'none', fontSize: '13px', fontWeight: 600, background: '#F5F5F5', border: '1px solid #E8E8E8', borderRadius: '9999px', padding: '5px 12px 5px 8px', marginBottom: '24px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Triplist
        </Link>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#00C060', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Yeni Triplist</div>
          <h1 style={{ fontWeight: 700, fontSize: '28px', margin: 0 }}>Rotanı oluştur</h1>
          <p style={{ color: '#444', fontSize: '14px', marginTop: '8px' }}>Durak durak bir gezi planı oluştur, istersen herkesle paylaş.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Temel bilgiler */}
          <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Triplist Adı *</label>
              <input style={inp} placeholder="Urla Sabahtan Akşama" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={lbl}>Şehir *</label>
                <input style={inp} placeholder="İzmir" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>İlçe</label>
                <input style={inp} placeholder="Urla" value={district} onChange={e => setDistrict(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={lbl}>Açıklama</label>
              <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' } as React.CSSProperties}
                placeholder="Bu triplist hakkında kısa bir not..."
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Tarih & Ekip */}
          <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={lbl}>Başlangıç Tarihi</label>
                <input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Bitiş Tarihi</label>
                <input type="date" style={inp} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={lbl}>Ekip (isteğe bağlı)</label>
              <input style={inp} placeholder="Ali, Zeynep, Berk..." value={teamMembers} onChange={e => setTeamMembers(e.target.value)} />
            </div>
          </div>

          {/* Duraklar */}
          <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Duraklar</span>
              <button type="button" onClick={addStop}
                style={{ background: '#F0F0F0', border: '1px solid #333', borderRadius: '8px', color: '#00C060', fontSize: '12px', fontWeight: 700, padding: '6px 14px', cursor: 'pointer' }}>
                + Durak Ekle
              </button>
            </div>

            {stops.map((stop, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i < stops.length - 1 ? '0' : '0' }}>
                {/* Bağlantı çizgisi */}
                {i < stops.length - 1 && (
                  <div style={{ position: 'absolute', left: '20px', top: '100%', width: '2px', height: '32px', background: '#2A2A2A', zIndex: 0 }} />
                )}
                <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '16px', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#00C060', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: '#666' }}>Durak {i + 1}</span>
                    {stops.length > 1 && (
                      <button type="button" onClick={() => removeStop(i)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '16px' }}>×</button>
                    )}
                  </div>

                  {/* Mekan arama */}
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <label style={lbl}>Mekan Adı *</label>
                    <input style={inp} placeholder="Mekan ara veya yaz..."
                      value={stop._venueSearch ?? stop.venueName}
                      onChange={e => searchVenue(i, e.target.value)} />
                    {stop._results && stop._results.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#F0F0F0', border: '1px solid #333', borderRadius: '10px', zIndex: 10, overflow: 'hidden' }}>
                        {stop._results.map(v => (
                          <div key={v.id} onClick={() => selectVenue(i, v)}
                            style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #222', fontSize: '13px' }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#222'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                            <span style={{ fontWeight: 600 }}>{v.name}</span>
                            <span style={{ color: '#444', marginLeft: '8px' }}>{v.district}, {v.city}</span>
                            {stop.venueId === v.id && <span style={{ color: '#00C060', marginLeft: '8px' }}>✓ DB'de var</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    {stop.venueId && (
                      <div style={{ fontSize: '11px', color: '#00C060', marginTop: '4px' }}>✓ Veritabanımızda mevcut</div>
                    )}
                    {!stop.venueId && stop.venueName.length > 1 && stop._results?.length === 0 && (
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>Veritabanımızda yok — onayladıktan sonra ekleyeceğiz</div>
                    )}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={lbl}>Adres / Not</label>
                    <input style={inp} placeholder="Kısa Köy, Urla" value={stop.address || ''} onChange={e => updateStop(i, { address: e.target.value })} />
                  </div>

                  <div>
                    <label style={lbl}>Açıklama</label>
                    <input style={inp} placeholder="Harika kahvesi var, açık oturmayı tercih edin..." value={stop.description || ''} onChange={e => updateStop(i, { description: e.target.value })} />
                  </div>

                  {/* Etiketler */}
                  <div style={{ marginTop: '12px' }}>
                    <label style={lbl}>Öne Çıkan Detay <span style={{ color: '#AAA', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(max 3 etiket)</span></label>
                    {(stop.tags || []).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {(stop.tags || []).map((tag, ti) => (
                          <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F0FAF5', border: '1px solid #00C06040', borderRadius: '9999px', padding: '4px 10px', fontSize: '12px', color: '#00A050', fontWeight: 600 }}>
                            {tag}
                            <button type="button" onClick={() => updateStop(i, { tags: (stop.tags || []).filter((_, ti2) => ti2 !== ti) })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, fontSize: '14px', lineHeight: 1 }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    {(stop.tags || []).length < 3 && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input style={{ ...inp, flex: 1 }}
                          placeholder="Türk kahvesi çok iyi, Karaköy manzarası..."
                          value={stop._tagInput || ''}
                          onChange={e => updateStop(i, { _tagInput: e.target.value })}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ',') && stop._tagInput?.trim()) {
                              e.preventDefault()
                              const tag = stop._tagInput.trim().replace(/,$/, '')
                              if (tag) updateStop(i, { tags: [...(stop.tags || []), tag], _tagInput: '' })
                            }
                          }} />
                        <button type="button"
                          onClick={() => {
                            const tag = (stop._tagInput || '').trim()
                            if (tag) updateStop(i, { tags: [...(stop.tags || []), tag], _tagInput: '' })
                          }}
                          style={{ background: '#F0F0F0', border: '1px solid #DDD', borderRadius: '8px', padding: '0 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: '#444' }}>
                          Ekle
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ulaşım (sonraki durağa) */}
                  {i < stops.length - 1 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222' }}>
                      <label style={{ ...lbl, color: '#444' }}>Sonraki Durağa Ulaşım</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <select style={{ ...inp, cursor: 'pointer' }} value={stop.transitMode || ''} onChange={e => updateStop(i, { transitMode: e.target.value })}>
                          <option value="">Ulaşım seç</option>
                          {TRANSIT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <input style={inp} placeholder="Hat / rota (45T, M2...)" value={stop.transitLine || ''} onChange={e => updateStop(i, { transitLine: e.target.value })} />
                      </div>
                      <input style={{ ...inp, marginTop: '8px' }} placeholder="Ek not (10 dk, dolmuş çıkışında bekle...)" value={stop.transitNote || ''} onChange={e => updateStop(i, { transitNote: e.target.value })} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paylaşım */}
          <div style={{ background: '#F8F8F8', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Herkesle paylaş</div>
                <div style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>Topluluğun feed'inde görünsün</div>
              </div>
              <div onClick={() => setIsPublic(v => !v)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', background: isPublic ? '#00C060' : '#2A2A2A', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: '3px', left: isPublic ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </div>
            {!isPublic && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#444' }}>
                Sadece link ile erişilebilir: <span style={{ color: '#666' }}>{window.location.origin}/{user?.username}/triplist/…</span>
              </div>
            )}
          </div>

          {error && <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: saving ? '#333' : '#00C060', color: '#000', fontWeight: 700, fontSize: '15px', border: 'none', cursor: saving ? 'default' : 'pointer', fontFamily: 'Syne, sans-serif' }}>
            {saving ? 'Kaydediliyor...' : isPublic ? '🗺️ Triplist Oluştur & Paylaş' : '🗺️ Triplist Oluştur'}
          </button>
        </form>
      </div>
    </div>
  )
}
