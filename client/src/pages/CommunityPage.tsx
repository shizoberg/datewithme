import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../lib/api'

interface TriplistPreview {
  id: string; title: string; slug: string
  city: string; district?: string; country: string
  viewCount: number; stops: { id: string; venueName: string }[]
  user: { username: string; name: string; avatarId?: string }
  startDate?: string; endDate?: string
}

function TriplistCard({ t }: { t: TriplistPreview }) {
  return (
    <Link to={`/${t.user.username}/triplist/${t.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '16px', padding: '20px', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#00F68040'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#1E1E1E'}>
        {/* Etiketler */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#666' }}>🌍 {t.country}</span>
          <span style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#666' }}>📍 {t.city}{t.district ? `, ${t.district}` : ''}</span>
        </div>
        {/* Başlık */}
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>{t.title}</div>
        {/* Duraklar mini */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
          {t.stops.slice(0, 3).map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#00F68015', border: '1px solid #00F68030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#00F680', flexShrink: 0 }}>{i + 1}</span>
              {s.venueName}
            </div>
          ))}
          {t.stops.length > 3 && <div style={{ fontSize: '11px', color: '#444', paddingLeft: '24px' }}>+{t.stops.length - 3} durak daha</div>}
        </div>
        {/* Alt bilgi */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' }}>
            <span style={{ fontWeight: 600 }}>{t.user.name}</span>
            <span>·</span>
            <span>👁 {t.viewCount}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#444' }}>{t.stops.length} durak →</span>
        </div>
      </div>
    </Link>
  )
}

const CATEGORIES = [
  { value: 'cafe',       label: 'Kafe',            emoji: '☕' },
  { value: 'restaurant', label: 'Restoran',         emoji: '🍽️' },
  { value: 'bar',        label: 'Bar',              emoji: '🍸' },
  { value: 'park',       label: 'Park / Açık Alan', emoji: '🌿' },
  { value: 'rooftop',    label: 'Rooftop',          emoji: '🌆' },
  { value: 'cultural',   label: 'Kültürel',         emoji: '🎨' },
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

  useEffect(() => { document.title = 'Topluluk — getdatewith.me' }, [])
  useEffect(() => {
    api.get('/api/triplists/public').then(r => setTriplists(r.data)).catch(() => {})
  }, [])

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
        name:           form.name.trim(),
        category:       form.category,
        city:           form.city.trim(),
        district:       form.district.trim(),
        address:        form.address.trim()        || undefined,
        googleMapsUrl:  form.googleMapsUrl.trim()  || undefined,
        instagramUrl:   form.instagramUrl.trim()   || undefined,
        rating:         form.rating                || undefined,
        priceLevel:     form.priceLevel            || undefined,
        description:    form.description.trim()    || undefined,
        submitterName:  form.submitterName.trim()  || undefined,
        submitterEmail: form.submitterEmail.trim() || undefined,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bir hata oluştu, tekrar dene.')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() { setForm({ ...EMPTY }); setSuccess(false); setError('') }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1px solid #2A2A2A', background: '#111', color: '#fff',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 700, color: '#666',
    letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: 'Raleway, sans-serif' }}>

      <AppHeader rightContent={<Link to="/bulusma-mekanlari" style={{ color: '#666', textDecoration: 'none', fontSize: '13px' }}>← Mekanlar</Link>} />

      {/* HERO */}
      <div className="page-content" style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '24px' }}>
        <div style={{ display: 'inline-block', background: '#111', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#00F680', letterSpacing: '2px', fontWeight: 700, marginBottom: '24px', textTransform: 'uppercase' }}>
          ✦ Topluluk
        </div>
        <h1 className="page-h1" style={{ fontSize: 'clamp(28px, 7vw, 42px)', letterSpacing: '-1px', marginBottom: '12px' }}>
          Rotalar & Mekanlar
        </h1>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.7, maxWidth: '380px', margin: '0 auto' }}>
          Topluluğun keşfettiği güzergahlar ve mekanlar bir arada.
        </p>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 32px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setActiveTab('triplists')}
          style={{ padding: '10px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', background: activeTab === 'triplists' ? '#00F680' : '#111', color: activeTab === 'triplists' ? '#000' : '#666', transition: 'all 0.15s' }}>
          🗺️ Triplistler
        </button>
        <button onClick={() => setActiveTab('suggest')}
          style={{ padding: '10px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '13px', background: activeTab === 'suggest' ? '#00F680' : '#111', color: activeTab === 'suggest' ? '#000' : '#666', transition: 'all 0.15s' }}>
          📍 Mekan Öner
        </button>
      </div>

      {/* TRIPLİST FEED */}
      {activeTab === 'triplists' && (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 20px 60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: '#555' }}>{triplists.length} triplist paylaşıldı</div>
            <Link to="/plan/yeni"
              style={{ background: '#00F680', color: '#000', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '20px', textDecoration: 'none', fontFamily: 'Syne, sans-serif' }}>
              + Triplist Oluştur
            </Link>
          </div>
          {triplists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺️</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '8px' }}>Henüz triplist yok</div>
              <div style={{ fontSize: '13px', color: '#555' }}>İlk triplist'i sen oluştur!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {triplists.map(t => <TriplistCard key={t.id} t={t} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggest' && (<>

      {/* STATS */}
      <section style={{ padding: '0 20px 60px', maxWidth: '640px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#00F680', marginBottom: '4px' }}>75+</p>
            <p style={{ fontSize: '13px', color: '#666' }}>Mekan</p>
          </div>
          <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#00F680', marginBottom: '4px' }}>3</p>
            <p style={{ fontSize: '13px', color: '#666' }}>Şehir</p>
          </div>
          <div style={{ gridColumn: '1 / -1', background: '#1A1A1A', border: '1px solid rgba(0,246,128,0.2)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F680" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#00F680' }}>∞</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Toplulukla Büyüyor</div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '20px', padding: '32px', borderTop: '3px solid #00F680' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '6px' }}>Mekanını Ekle</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px' }}>Onaylandıktan sonra tüm kullanıcılara önerilecek.</p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ background: '#0D1A0D', border: '1px solid #00F68030', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
                <p style={{ fontSize: '36px', marginBottom: '12px' }}>✓</p>
                <p style={{ fontWeight: 800, fontSize: '18px', color: '#00F680', marginBottom: '8px' }}>Teşekkürler!</p>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
                  Mekanın inceleme kuyruğunda.<br />
                  Onaylandığında tüm kullanıcılara önerilecek.
                </p>
              </div>
              <button onClick={reset}
                style={{ background: '#00F680', color: '#000', border: 'none', borderRadius: '9999px', padding: '13px 28px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Başka bir mekan ekle →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>İsim *</label>
                  <input style={inp} placeholder="Paper Cup" value={form.name} onChange={set('name')} required />
                </div>
                <div>
                  <label style={lbl}>Kategori *</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Şehir *</label>
                  <input style={inp} placeholder="İstanbul" value={form.city} onChange={set('city')} required />
                </div>
                <div>
                  <label style={lbl}>İlçe *</label>
                  <input style={inp} placeholder="Kadıköy" value={form.district} onChange={set('district')} required />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Adres <span style={{ color: '#444', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                <input style={inp} placeholder="Moda Cad. No:18/A" value={form.address} onChange={set('address')} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Google Maps URL</label>
                  <input style={inp} placeholder="maps.app.goo.gl/..." value={form.googleMapsUrl} onChange={set('googleMapsUrl')} />
                </div>
                <div>
                  <label style={lbl}>Instagram</label>
                  <input style={inp} placeholder="@kullanıcıadı" value={form.instagramUrl} onChange={set('instagramUrl')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={lbl}>Puan ({form.rating.toFixed(1)})</label>
                  <input type="range" min="1" max="5" step="0.1"
                    value={form.rating}
                    onChange={e => setForm(p => ({ ...p, rating: parseFloat(e.target.value) }))}
                    style={{ width: '100%', marginTop: '8px', accentColor: '#00F680' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginTop: '4px' }}>
                    <span>1.0</span><span>5.0</span>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Fiyat Seviyesi</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {[1,2,3].map(n => (
                      <button type="button" key={n}
                        onClick={() => setForm(p => ({ ...p, priceLevel: n }))}
                        style={{ flex: 1, padding: '9px 4px', borderRadius: '8px', border: `2px solid ${form.priceLevel === n ? '#00F680' : '#2A2A2A'}`, background: form.priceLevel === n ? '#00F68018' : '#1A1A1A', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                        {'₺'.repeat(n)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ ...lbl, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Açıklama <span style={{ color: '#444', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></span>
                  <span style={{ color: form.description.length > 280 ? '#EF4444' : '#555' }}>{form.description.length}/300</span>
                </label>
                <textarea
                  style={{ ...inp, resize: 'vertical', minHeight: '80px' }}
                  placeholder="Bu mekan hakkında kısa bir şey yaz..."
                  maxLength={300}
                  value={form.description}
                  onChange={set('description')}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={lbl}>Adın <span style={{ color: '#444', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                  <input style={inp} placeholder="Zeynep" value={form.submitterName} onChange={set('submitterName')} />
                </div>
                <div>
                  <label style={lbl}>E-posta <span style={{ color: '#444', fontWeight: 400, textTransform: 'none' }}>(sadece biz görürüz)</span></label>
                  <input style={inp} type="email" placeholder="zeynep@mail.com" value={form.submitterEmail} onChange={set('submitterEmail')} />
                </div>
              </div>

              {error && (
                <div style={{ background: '#1A0D0D', border: '1px solid #EF444430', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#EF4444', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button type="submit"
                disabled={submitting || !form.name.trim() || !form.city.trim() || !form.district.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: '9999px', border: 'none', fontFamily: 'inherit',
                  background: (!form.name.trim() || !form.city.trim() || !form.district.trim() || submitting) ? '#1A1A1A' : '#00F680',
                  color: (!form.name.trim() || !form.city.trim() || !form.district.trim() || submitting) ? '#555' : '#000',
                  fontWeight: 800, fontSize: '16px', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {submitting ? 'Gönderiliyor…' : 'Mekanı Öner →'}
              </button>
            </form>
          )}
        </div>

        {/* HOW IT WORKS */}
        <div style={{ marginTop: '48px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>Nasıl çalışır?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[
              { icon: '📝', title: 'Formu doldur',    desc: '2 dakika sürer' },
              { icon: '👀', title: 'Ekibimiz inceler', desc: '24-48 saat içinde' },
              { icon: '✨', title: 'Yayına girer',     desc: 'Tüm kullanıcılara önerilir' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</p>
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{s.title}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#444', fontSize: '12px', lineHeight: 1.7, marginTop: '32px' }}>
          Eklediğin mekanlar incelendikten sonra yayına girer.<br />
          Ticari olmayan, gerçek mekan önerileri kabul edilir.
        </p>
      </div>
      </>)}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #141414', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#00F680', textDecoration: 'none', fontWeight: 700 }}>getdatewith.me</Link>
          {' '}· <Link to="/kvkk" style={{ color: '#444', textDecoration: 'none' }}>KVKK</Link>
        </p>
      </footer>
      <div style={{ height: '80px' }} />
    </div>
  )
}
