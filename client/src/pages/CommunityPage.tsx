import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

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

  useEffect(() => { document.title = 'Mekan Öner — getdatewith.me' }, [])

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

      {/* NAV */}
      <nav className="desktop-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid #1A1A1A' }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: '20px', color: '#00F680', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          getdatewith.me
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '13px', padding: '8px 12px' }}>← Ana Sayfa</Link>
          <Link to="/login" style={{ color: '#999', textDecoration: 'none', fontSize: '14px', padding: '8px 16px' }}>Giriş Yap</Link>
          <Link to="/register" style={{ background: '#00F680', color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '8px 20px', borderRadius: '9999px' }}>Başla</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#111', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#00F680', letterSpacing: '2px', fontWeight: 700, marginBottom: '28px', textTransform: 'uppercase' }}>
          🌿 Community Built
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(32px, 7vw, 56px)', lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: '20px' }}>
          Mekan işi<br />
          <span style={{ color: '#00F680' }}>ciddi bir iştir.</span>
        </h1>
        <p style={{ fontSize: '16px', color: '#888', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto' }}>
          Şehrinin en iyi mekanını biliyor musun? Ekle, herkes senin gibi
          kaliteli vakit geçirsin.
        </p>
      </section>

      {/* STATS */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '0 24px 60px', flexWrap: 'wrap' }}>
        {[
          { value: '75+', label: 'Mekan' },
          { value: '3',   label: 'Şehir' },
          { value: '↑',   label: 'Toplulukla Büyüyor' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '20px 28px', textAlign: 'center', minWidth: '120px' }}>
            <p style={{ fontSize: '28px', fontWeight: 900, color: '#00F680', marginBottom: '4px' }}>{s.value}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>{s.label}</p>
          </div>
        ))}
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

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #141414', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#00F680', textDecoration: 'none', fontWeight: 700 }}>getdatewith.me</Link>
          {' '}· <Link to="/kvkk" style={{ color: '#444', textDecoration: 'none' }}>KVKK</Link>
        </p>
      </footer>
    </div>
  )
}
