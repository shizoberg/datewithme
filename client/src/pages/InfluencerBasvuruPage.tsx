import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../lib/api'

export default function InfluencerBasvuruPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', instagram: '', followers: '', niche: '', bio: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.name || !form.city || !form.instagram) { setError('İsim, şehir ve Instagram zorunlu.'); return }
    setSending(true); setError('')
    try {
      await api.post('/api/influencers/basvuru', form)
      setSent(true)
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setSending(false)
    }
  }

  const field = (label: string, key: keyof typeof form, placeholder: string, required = false) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', color: '#777', marginBottom: '6px', fontWeight: 600 }}>
        {label}{required && <span style={{ color: '#D46080' }}> *</span>}
      </label>
      <input
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        style={{ width: '100%', background: '#F8F8F8', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontFamily: 'Raleway, sans-serif', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  )

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✦</div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Başvurun alındı!</h2>
        <p style={{ color: '#777', fontSize: '14px', maxWidth: '320px' }}>İnceleyip en kısa sürede sana dönüş yapacağız.</p>
        <Link to="/" style={{ marginTop: '24px', color: '#00C060', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>Anasayfaya dön →</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Raleway, sans-serif', background: '#FFFFFF', color: '#0D0D0D' }}>
      <AppHeader />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 20px 80px' }}>
        <div style={{ display: 'inline-block', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#7C3AED', letterSpacing: '2px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase' }}>
          ✦ Influencer Başvurusu
        </div>
        <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', letterSpacing: '-1px', marginBottom: '10px' }}>
          İçerik üreticisi misin?
        </h1>
        <p style={{ fontSize: '14px', color: '#777', lineHeight: 1.6, marginBottom: '32px' }}>
          getdatewith.me platformunda işletmelerle eşleşmek, öne çıkan triplistler oluşturmak ve Rehber sayfasında içerik üretmek için başvur.
        </p>

        <form onSubmit={submit}>
          {field('İsim Soyisim', 'name', 'Ayşe Kaya', true)}
          {field('Şehir', 'city', 'İstanbul', true)}
          {field('Instagram', 'instagram', '@kullaniciadi', true)}
          {field('Takipçi Sayısı', 'followers', 'Ör. 15K')}
          {field('Niş / İçerik Alanı', 'niche', 'Ör. Yemek & Kafe, Gece Hayatı...')}
          {field('E-posta', 'email', 'mail@ornek.com')}
          {field('Telefon', 'phone', '05XX XXX XX XX')}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#777', marginBottom: '6px', fontWeight: 600 }}>Kendinden bahset</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="İçerik tarzın, kitlen, neden işbirliği yapmak istersin..."
              rows={4}
              style={{ width: '100%', background: '#F8F8F8', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontFamily: 'Raleway, sans-serif', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          {error && <p style={{ color: '#D46080', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <button type="submit" disabled={sending}
            style={{ width: '100%', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '9999px', padding: '14px', fontSize: '14px', fontWeight: 800, cursor: sending ? 'default' : 'pointer', opacity: sending ? 0.7 : 1, fontFamily: 'Raleway, sans-serif' }}>
            {sending ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}
          </button>
        </form>
      </div>
    </div>
  )
}
