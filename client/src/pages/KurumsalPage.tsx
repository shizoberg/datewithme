import { useState, FormEvent, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface InfluencerEntry {
  id: string
  name: string
  city: string
  followers: string | null
  engagement: string | null
  niche: string | null
  avatarColor: string
}

const PACKAGES = [
  {
    id: 'triplist',
    title: 'Triplist Öne Çıkma',
    price: '₺1.500 / ay',
    color: '#00C060',
    lightBg: 'rgba(0,192,96,0.06)',
    border: 'rgba(0,192,96,0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      </svg>
    ),
    features: [
      'İşletmeniz tripliste öncelikli eklenir',
      'Triplist detay sayfasında öne çıkma badgei',
      'Aylık raporlama (görüntülenme, tıklama)',
      'Mekan profiliniz platform içi listelerde üstte',
      'Topluluk sayfasında sponsorlu görünüm',
    ],
  },
  {
    id: 'influencer',
    title: 'Influencer İşbirliği',
    price: 'Özel Fiyat',
    color: '#7C3AED',
    lightBg: 'rgba(124,58,237,0.06)',
    border: 'rgba(124,58,237,0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    features: [
      'Platform içi influencer veritabanına erişim',
      'Hedef kitleye göre influencer eşleştirme',
      'Yönetilen kampanya süreci',
      'İçerik onay mekanizması',
      'Detaylı kampanya analitikleri',
    ],
  },
  {
    id: 'cekim',
    title: 'Çekim Hizmeti',
    price: 'Tek Seferlik',
    color: '#F59E0B',
    lightBg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.2)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    features: [
      'Mekanınızda profesyonel fotoğraf & video çekimi',
      'Sosyal medya için hazır kısa içerikler',
      'Platform profilinizde kullanılacak görseller',
      'Triplist ve mekan kartlarında öne çıkan kalite',
      'Tek seferlik ödeme, taahhüt yok',
    ],
  },
]

export default function KurumsalPage() {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [form, setForm] = useState({ businessName: '', contactName: '', email: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [influencers, setInfluencers] = useState<InfluencerEntry[]>([])

  useEffect(() => {
    api.get('/api/influencers').then(r => setInfluencers(r.data)).catch(() => setInfluencers([]))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!selectedPkg) { setError('Lütfen bir paket seçin'); return }
    setSending(true); setError('')
    try {
      await api.post('/api/leads', { ...form, package: selectedPkg })
      setSent(true)
    } catch {
      setError('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #F0F0F0', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#0D0D0D', letterSpacing: '-0.5px' }}>getdate<span style={{ color: '#00C060' }}>with.me</span></span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>Giriş Yap</Link>
          <a href="#iletisim" style={{ background: '#00C060', color: '#fff', borderRadius: '100px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Başvur</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '100px', padding: '6px 16px', fontSize: '12px', color: '#555', fontWeight: 600, marginBottom: '24px', letterSpacing: '0.5px' }}>
          KURUMSAL
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '20px' }}>
          Hedef kitlenize<br /><span style={{ color: '#00C060' }}>doğrudan ulaşın</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#555', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.6 }}>
          İstanbul, Ankara ve İzmir'de aktif olan binlerce date ve etkinlik kullanıcısına işletmenizi tanıtın.
          Triplist öne çıkma veya influencer işbirlikleriyle büyüyün.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#paketler" style={{ background: '#00C060', color: '#fff', borderRadius: '100px', padding: '14px 28px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>Paketleri İncele</a>
          <a href="#iletisim" style={{ background: '#F5F5F5', color: '#0D0D0D', borderRadius: '100px', padding: '14px 28px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid #E0E0E0' }}>Bizimle İletişime Geç</a>
        </div>
      </section>

      {/* Rakamlar */}
      <section style={{ background: '#F8F8F8', borderTop: '1px solid #EEEEEE', borderBottom: '1px solid #EEEEEE', padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            { val: '694+', label: 'Kayıtlı Kullanıcı' },
            { val: '3', label: 'Şehir' },
            { val: '500+', label: 'Aylık Aktif Kullanıcı' },
            { val: '18–35', label: 'Yaş Aralığı' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#00C060', letterSpacing: '-1px' }}>{s.val}</div>
              <div style={{ fontSize: '13px', color: '#777', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Paketler */}
      <section id="paketler" style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px 56px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', textAlign: 'center', marginBottom: '8px' }}>Üç yol, bir hedef</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '48px', fontSize: '15px' }}>İşletmenize en uygun paketi seçin</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.id} style={{ background: '#FAFAFA', border: `2px solid ${selectedPkg === pkg.id ? pkg.color : '#E8E8E8'}`, borderRadius: '20px', padding: '32px', transition: 'border-color 0.2s', cursor: 'pointer' }}
              onClick={() => { setSelectedPkg(pkg.id); document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: pkg.lightBg, border: `1px solid ${pkg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pkg.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '17px' }}>{pkg.title}</div>
                  <div style={{ fontSize: '13px', color: pkg.color, fontWeight: 700 }}>{pkg.price}</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#444' }}>
                    <span style={{ color: pkg.color, flexShrink: 0, marginTop: '1px' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={e => { e.stopPropagation(); setSelectedPkg(pkg.id); document.getElementById('iletisim')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ width: '100%', marginTop: '24px', padding: '12px', borderRadius: '12px', background: selectedPkg === pkg.id ? pkg.color : 'transparent', border: `1.5px solid ${pkg.color}`, color: selectedPkg === pkg.id ? '#fff' : pkg.color, fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {selectedPkg === pkg.id ? '✓ Seçildi' : 'Bu Paketi Seç'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Influencer Showcase */}
      <section style={{ background: '#F8F8F8', borderTop: '1px solid #EEEEEE', padding: '72px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Platform Influencerları</h2>
            <p style={{ color: '#666', fontSize: '15px' }}>İşbirliği yapabileceğiniz içerik üreticileri — şehir, niş ve erişim bazlı eşleştirme</p>
          </div>
          {influencers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {influencers.map(inf => (
                <div key={inf.id} style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', borderRadius: '16px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: inf.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>{inf.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{inf.name}</div>
                    <div style={{ fontSize: '12px', color: '#777', marginBottom: '8px' }}>📍 {inf.city}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {inf.followers && <span style={{ background: '#F0F0F0', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', color: '#555', fontWeight: 600 }}>{inf.followers} takipçi</span>}
                      {inf.engagement && <span style={{ background: 'rgba(0,192,96,0.08)', border: '1px solid rgba(0,192,96,0.15)', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', color: '#00C060', fontWeight: 600 }}>{inf.engagement} etkileşim</span>}
                    </div>
                    {inf.niche && <div style={{ marginTop: '6px', fontSize: '12px', color: '#888' }}>{inf.niche}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>Influencer havuzumuz büyüyor — yakında burada listelenecekler.</p>
          )}
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#999' }}>
            * Influencer veritabanımız sürekli büyüyor. Başvurunuzda hedef kitlenizi belirtin, size en uygun eşleşmeyi sunalım.
          </p>
          <p style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link to="/influencer-basvuru" style={{ color: '#7C3AED', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>İçerik üreticisi misin? Başvur →</Link>
          </p>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 56px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '48px' }}>Nasıl çalışır?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          {[
            { step: '01', title: 'Başvurun', desc: 'Formu doldurun, ilgilendiğiniz paketi seçin' },
            { step: '02', title: 'Görüşelim', desc: '24 saat içinde sizi arayıp detayları konuşalım' },
            { step: '03', title: 'Yayına Geçin', desc: 'Anlaşma sonrası işletmeniz hemen öne çıkmaya başlar' },
          ].map(s => (
            <div key={s.step}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#EEEEEE', letterSpacing: '-2px', marginBottom: '8px' }}>{s.step}</div>
              <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{s.title}</div>
              <div style={{ fontSize: '14px', color: '#777', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* İletişim formu */}
      <section id="iletisim" style={{ background: '#F8F8F8', borderTop: '1px solid #EEEEEE', padding: '72px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px', textAlign: 'center' }}>Hemen Başvurun</h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '40px' }}>24 saat içinde sizinle iletişime geçiyoruz</p>

          {sent ? (
            <div style={{ background: '#fff', border: '1px solid #D1FAE5', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px', color: '#059669' }}>Başvurunuz alındı!</div>
              <div style={{ color: '#666', fontSize: '14px' }}>En kısa sürede sizinle iletişime geçeceğiz.</div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Paket seçimi */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '8px' }}>İlgilendiğiniz Paket *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {PACKAGES.map(pkg => (
                    <button type="button" key={pkg.id}
                      onClick={() => setSelectedPkg(pkg.id)}
                      style={{ padding: '12px', borderRadius: '10px', border: `1.5px solid ${selectedPkg === pkg.id ? pkg.color : '#E0E0E0'}`, background: selectedPkg === pkg.id ? pkg.lightBg : '#FAFAFA', color: selectedPkg === pkg.id ? pkg.color : '#555', fontWeight: selectedPkg === pkg.id ? 700 : 400, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s' }}>
                      {pkg.title}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>İşletme Adı *</label>
                  <input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} required placeholder="Café Elma" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', background: '#FAFAFA', color: '#0D0D0D', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Yetkili Adı *</label>
                  <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} required placeholder="Ahmet Yılmaz" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', background: '#FAFAFA', color: '#0D0D0D', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Email *</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required type="email" placeholder="info@cafe.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', background: '#FAFAFA', color: '#0D0D0D', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Telefon</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0532 000 0000" style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', background: '#FAFAFA', color: '#0D0D0D', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>Mesajınız</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="İşletmeniz hakkında kısaca bilgi verin, hedeflerinizi paylaşın..." rows={4} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', background: '#FAFAFA', color: '#0D0D0D', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>

              {error && <div style={{ color: '#DC2626', fontSize: '13px' }}>{error}</div>}

              <button type="submit" disabled={sending} style={{ padding: '14px', borderRadius: '12px', background: '#00C060', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: sending ? 0.7 : 1 }}>
                {sending ? 'Gönderiliyor…' : 'Başvuruyu Gönder →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #EEEEEE', padding: '24px', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '16px', color: '#0D0D0D', letterSpacing: '-0.5px' }}>
          getdate<span style={{ color: '#00C060' }}>with.me</span>
        </Link>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>© 2026 getdatewith.me — Tüm hakları saklıdır</p>
      </footer>
    </div>
  )
}
