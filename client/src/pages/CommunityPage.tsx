import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../lib/api'

interface TriplistPreview {
  id: string; title: string; slug: string
  city: string; district?: string; country: string
  viewCount: number; likeCount: number; saveCount: number
  stops: { id: string; venueName: string }[]
  user: { username: string; name: string; avatarId?: string }
  startDate?: string; endDate?: string
}

const SORT_OPTIONS = [
  { value: 'latest', label: '🕐 En Yeni' },
  { value: 'views',  label: '👁 En Çok Görüntülenen' },
  { value: 'likes',  label: '❤️ En Çok Beğenilen' },
  { value: 'saves',  label: '🔖 En Çok Kaydedilen' },
]

function TriplistCard({ t, liked, saved, onLike, onSave }: {
  t: TriplistPreview; liked: boolean; saved: boolean
  onLike: () => void; onSave: () => void
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}>
      <Link to={`/${t.user.username}/triplist/${t.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ background: '#F5F5F5', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#555' }}>🌍 {t.country}</span>
          <span style={{ background: '#F5F5F5', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#555' }}>📍 {t.city}{t.district ? `, ${t.district}` : ''}</span>
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', marginBottom: '10px', color: '#0D0D0D' }}>{t.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
          {t.stops.slice(0, 3).map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#E8FFF4', border: '1px solid #00C06030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#00C060', flexShrink: 0 }}>{i + 1}</span>
              {s.venueName}
            </div>
          ))}
          {t.stops.length > 3 && <div style={{ fontSize: '11px', color: '#999', paddingLeft: '24px' }}>+{t.stops.length - 3} durak daha</div>}
        </div>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600, color: '#555' }}>{t.user.name}</span> · 👁 {t.viewCount}
        </div>
      </Link>
      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F0F0F0', paddingTop: '12px' }}>
        <button onClick={onLike}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', borderRadius: '10px', border: `1px solid ${liked ? '#FFB3C1' : '#E8E8E8'}`, background: liked ? '#FFF0F3' : '#fff', color: liked ? '#E0566A' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          ❤️ {t.likeCount > 0 ? t.likeCount : ''} Beğen
        </button>
        <button onClick={onSave}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', borderRadius: '10px', border: `1px solid ${saved ? '#B3D9FF' : '#E8E8E8'}`, background: saved ? '#F0F7FF' : '#fff', color: saved ? '#2E6EAE' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          🔖 {t.saveCount > 0 ? t.saveCount : ''} Kaydet
        </button>
      </div>
    </div>
  )
}

const CATEGORIES = [
  { value: 'cafe', label: 'Kafe', emoji: '☕' },
  { value: 'restaurant', label: 'Restoran', emoji: '🍽️' },
  { value: 'bar', label: 'Bar', emoji: '🍸' },
  { value: 'park', label: 'Park / Açık Alan', emoji: '🌿' },
  { value: 'rooftop', label: 'Rooftop', emoji: '🌆' },
  { value: 'cultural', label: 'Kültürel', emoji: '🎨' },
]

const EMPTY = {
  name: '', category: 'cafe', city: '', district: '', address: '',
  googleMapsUrl: '', instagramUrl: '', rating: 4.5, priceLevel: 2,
  description: '', submitterName: '', submitterEmail: '',
}

export default function CommunityPage() {
  const [form, setForm] = useState({ ...EMPTY })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [triplists, setTriplists] = useState<TriplistPreview[]>([])
  const [activeTab, setActiveTab] = useState<'triplists' | 'suggest'>('triplists')
  const [sort, setSort] = useState('latest')
  const [interactions, setInteractions] = useState<{ triplistId: string; type: string }[]>([])

  useEffect(() => { document.title = 'Triplist — getdatewith.me' }, [])

  useEffect(() => {
    api.get(`/api/triplists/public?sort=${sort}`).then(r => setTriplists(r.data)).catch(() => {})
  }, [sort])

  useEffect(() => {
    api.get('/api/triplists/my-interactions').then(r => setInteractions(r.data)).catch(() => {})
  }, [])

  function isLiked(id: string) { return interactions.some(i => i.triplistId === id && i.type === 'like') }
  function isSaved(id: string) { return interactions.some(i => i.triplistId === id && i.type === 'save') }

  async function handleLike(t: TriplistPreview) {
    const wasLiked = isLiked(t.id)
    setInteractions(prev => wasLiked
      ? prev.filter(i => !(i.triplistId === t.id && i.type === 'like'))
      : [...prev, { triplistId: t.id, type: 'like' }])
    setTriplists(prev => prev.map(x => x.id === t.id ? { ...x, likeCount: x.likeCount + (wasLiked ? -1 : 1) } : x))
    await api.post(`/api/triplists/${t.id}/like`, { type: 'like' }).catch(() => {})
  }

  async function handleSave(t: TriplistPreview) {
    const wasSaved = isSaved(t.id)
    setInteractions(prev => wasSaved
      ? prev.filter(i => !(i.triplistId === t.id && i.type === 'save'))
      : [...prev, { triplistId: t.id, type: 'save' }])
    setTriplists(prev => prev.map(x => x.id === t.id ? { ...x, saveCount: x.saveCount + (wasSaved ? -1 : 1) } : x))
    await api.post(`/api/triplists/${t.id}/like`, { type: 'save' }).catch(() => {})
  }

  function set(k: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/api/venue-submissions', {
        name: form.name.trim(), category: form.category,
        city: form.city.trim(), district: form.district.trim(),
        address: form.address.trim() || undefined,
        googleMapsUrl: form.googleMapsUrl.trim() || undefined,
        instagramUrl: form.instagramUrl.trim() || undefined,
        rating: form.rating || undefined, priceLevel: form.priceLevel || undefined,
        description: form.description.trim() || undefined,
        submitterName: form.submitterName.trim() || undefined,
        submitterEmail: form.submitterEmail.trim() || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata oluştu, tekrar dene.')
    } finally { setSubmitting(false) }
  }

  function reset() { setForm({ ...EMPTY }); setSuccess(false); setError('') }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid #E0E0E0', background: '#FAFAFA', color: '#0D0D0D',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 700, color: '#888',
    letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>
      <AppHeader rightContent={<Link to="/bulusma-mekanlari" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>← Mekanlar</Link>} />

      <div className="page-content" style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '24px' }}>
        <div style={{ display: 'inline-block', background: '#E8FFF4', border: '1px solid #00C06030', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#00A050', letterSpacing: '2px', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>
          ✦ Topluluk
        </div>
        <h1 className="page-h1" style={{ fontSize: 'clamp(28px, 7vw, 42px)', letterSpacing: '-1px', marginBottom: '12px' }}>
          Rotalar & Mekanlar
        </h1>
        <p style={{ fontSize: '15px', color: '#777', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto' }}>
          Topluluğun keşfettiği güzergahlar ve mekanlar bir arada.
        </p>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 32px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveTab('triplists')}
          style={{ padding: '10px 24px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', background: activeTab === 'triplists' ? '#00C060' : '#fff', color: activeTab === 'triplists' ? '#fff' : '#666', border: `1px solid ${activeTab === 'triplists' ? '#00C060' : '#E0E0E0'}`, transition: 'all 0.15s' }}>
          🗺️ Triplistler
        </button>
        <button onClick={() => setActiveTab('suggest')}
          style={{ padding: '10px 24px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', background: activeTab === 'suggest' ? '#00C060' : '#fff', color: activeTab === 'suggest' ? '#fff' : '#666', border: `1px solid ${activeTab === 'suggest' ? '#00C060' : '#E0E0E0'}`, transition: 'all 0.15s' }}>
          📍 Mekan Öner
        </button>
      </div>

      {activeTab === 'triplists' && (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setSort(o.value)}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${sort === o.value ? '#00C060' : '#E0E0E0'}`, background: sort === o.value ? '#E8FFF4' : '#fff', color: sort === o.value ? '#00A050' : '#888', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {o.label}
                </button>
              ))}
            </div>
            <Link to="/plan/yeni"
              style={{ background: '#00C060', color: '#fff', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '20px', textDecoration: 'none', fontFamily: 'Syne, sans-serif' }}>
              + Triplist Oluştur
            </Link>
          </div>
          {triplists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#555', marginBottom: '8px' }}>Henüz triplist yok</div>
              <div style={{ fontSize: '13px' }}>İlk triplist'i sen oluştur!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {triplists.map(t => (
                <TriplistCard key={t.id} t={t}
                  liked={isLiked(t.id)} saved={isSaved(t.id)}
                  onLike={() => handleLike(t)} onSave={() => handleSave(t)} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggest' && (<>
        <section style={{ padding: '0 20px 60px', maxWidth: '640px', margin: '0 auto', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#00C060', marginBottom: '4px' }}>75+</p>
              <p style={{ fontSize: '13px', color: '#888' }}>Mekan</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#00C060', marginBottom: '4px' }}>3</p>
              <p style={{ fontSize: '13px', color: '#888' }}>Şehir</p>
            </div>
            <div style={{ gridColumn: '1 / -1', background: '#E8FFF4', border: '1px solid #00C06020', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#00A050' }}>∞</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Toplulukla Büyüyor</div>
            </div>
          </div>
        </section>

        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '32px', borderTop: '3px solid #00C060', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px', color: '#0D0D0D' }}>Mekanını Ekle</h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '28px' }}>Onaylandıktan sonra tüm kullanıcılara önerilecek.</p>

            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ background: '#E8FFF4', border: '1px solid #00C06030', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '36px', marginBottom: '12px' }}>✓</p>
                  <p style={{ fontWeight: 800, fontSize: '18px', color: '#00A050', marginBottom: '8px' }}>Teşekkürler!</p>
                  <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
                    Mekanın inceleme kuyruğunda.<br />Onaylandığında tüm kullanıcılara önerilecek.
                  </p>
                </div>
                <button onClick={reset}
                  style={{ background: '#00C060', color: '#fff', border: 'none', borderRadius: '9999px', padding: '13px 28px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Başka bir mekan ekle →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div><label style={lbl}>İsim *</label><input style={inp} placeholder="Paper Cup" value={form.name} onChange={set('name')} required /></div>
                  <div><label style={lbl}>Kategori *</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={set('category')}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div><label style={lbl}>Şehir *</label><input style={inp} placeholder="İstanbul" value={form.city} onChange={set('city')} required /></div>
                  <div><label style={lbl}>İlçe *</label><input style={inp} placeholder="Kadıköy" value={form.district} onChange={set('district')} required /></div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={lbl}>Adres <span style={{ color: '#bbb', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                  <input style={inp} placeholder="Moda Cad. No:18/A" value={form.address} onChange={set('address')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div><label style={lbl}>Google Maps URL</label><input style={inp} placeholder="maps.app.goo.gl/..." value={form.googleMapsUrl} onChange={set('googleMapsUrl')} /></div>
                  <div><label style={lbl}>Instagram</label><input style={inp} placeholder="@kullanıcıadı" value={form.instagramUrl} onChange={set('instagramUrl')} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={lbl}>Puan ({form.rating.toFixed(1)})</label>
                    <input type="range" min="1" max="5" step="0.1" value={form.rating}
                      onChange={e => setForm(p => ({ ...p, rating: parseFloat(e.target.value) }))}
                      style={{ width: '100%', marginTop: '8px', accentColor: '#00C060' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999', marginTop: '4px' }}><span>1.0</span><span>5.0</span></div>
                  </div>
                  <div>
                    <label style={lbl}>Fiyat Seviyesi</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {[1,2,3].map(n => (
                        <button type="button" key={n} onClick={() => setForm(p => ({ ...p, priceLevel: n }))}
                          style={{ flex: 1, padding: '9px 4px', borderRadius: '8px', border: `2px solid ${form.priceLevel === n ? '#00C060' : '#E0E0E0'}`, background: form.priceLevel === n ? '#E8FFF4' : '#FAFAFA', color: '#0D0D0D', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                          {'₺'.repeat(n)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ ...lbl, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Açıklama <span style={{ color: '#ccc', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></span>
                    <span style={{ color: form.description.length > 280 ? '#EF4444' : '#bbb' }}>{form.description.length}/300</span>
                  </label>
                  <textarea style={{ ...inp, resize: 'vertical', minHeight: '80px' } as React.CSSProperties}
                    placeholder="Bu mekan hakkında kısa bir şey yaz..." maxLength={300}
                    value={form.description} onChange={set('description')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  <div><label style={lbl}>Adın <span style={{ color: '#ccc', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label><input style={inp} placeholder="Zeynep" value={form.submitterName} onChange={set('submitterName')} /></div>
                  <div><label style={lbl}>E-posta</label><input style={inp} type="email" placeholder="zeynep@mail.com" value={form.submitterEmail} onChange={set('submitterEmail')} /></div>
                </div>
                {error && <div style={{ background: '#FEE2E2', border: '1px solid #EF444430', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#B91C1C', fontSize: '14px' }}>{error}</div>}
                <button type="submit" disabled={submitting || !form.name.trim() || !form.city.trim() || !form.district.trim()}
                  style={{ width: '100%', padding: '14px', borderRadius: '9999px', border: 'none', fontFamily: 'inherit', background: (!form.name.trim() || !form.city.trim() || !form.district.trim() || submitting) ? '#E8E8E8' : '#00C060', color: (!form.name.trim() || !form.city.trim() || !form.district.trim() || submitting) ? '#999' : '#fff', fontWeight: 800, fontSize: '16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {submitting ? 'Gönderiliyor…' : 'Mekanı Öner →'}
                </button>
              </form>
            )}
          </div>

          <div style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px', textAlign: 'center', color: '#0D0D0D' }}>Nasıl çalışır?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {[
                { icon: '📝', title: 'Formu doldur', desc: '2 dakika sürer' },
                { icon: '👀', title: 'Ekibimiz inceler', desc: '24-48 saat içinde' },
                { icon: '✨', title: 'Yayına girer', desc: 'Tüm kullanıcılara önerilir' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</p>
                  <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#0D0D0D' }}>{s.title}</p>
                  <p style={{ fontSize: '12px', color: '#888' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#bbb', fontSize: '12px', lineHeight: 1.7, marginTop: '32px' }}>
            Eklediğin mekanlar incelendikten sonra yayına girer.<br />Ticari olmayan, gerçek mekan önerileri kabul edilir.
          </p>
        </div>
      </>)}

      <footer style={{ borderTop: '1px solid #EBEBEB', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: '#bbb', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#00C060', textDecoration: 'none', fontWeight: 700 }}>getdatewith.me</Link>
          {' '}· <Link to="/kvkk" style={{ color: '#bbb', textDecoration: 'none' }}>KVKK</Link>
        </p>
      </footer>
      <div style={{ height: '80px' }} />
    </div>
  )
}
