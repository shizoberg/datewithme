import { Link } from 'react-router-dom'

const STEPS = [
  {
    num: '01',
    icon: '✏️',
    title: 'Kartını oluştur',
    desc: 'Kime göndereceğini yaz, 6 date seçeneğini özelleştir.',
  },
  {
    num: '02',
    icon: '🔗',
    title: 'Linki gönder',
    desc: 'Benzersiz linki WhatsApp\'tan, Instagram\'dan veya SMS ile ilet.',
  },
  {
    num: '03',
    icon: '💌',
    title: 'O seçsin',
    desc: 'Karşındaki tarih, mekan ve karşılama tercihini seçer.',
  },
  {
    num: '04',
    icon: '🎉',
    title: 'Date confirmed!',
    desc: 'Sen dashboarddan tüm detayları görürsün. Date planlandı.',
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid #1A1A1A' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: '#F5C400', letterSpacing: '-0.5px' }}>
          datewith.me
        </span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{ color: '#999', textDecoration: 'none', fontSize: '14px', padding: '8px 16px' }}>
            Giriş Yap
          </Link>
          <Link to="/register" style={{ background: '#F5C400', color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '8px 20px', borderRadius: '9999px' }}>
            Başla
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '9999px', padding: '6px 16px', fontSize: '12px', color: '#F5C400', letterSpacing: '2px', fontWeight: 700, marginBottom: '32px', textTransform: 'uppercase' }}>
          ✨ Date teklifleri için
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(42px, 8vw, 72px)', lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-2px' }}>
          Çıkma teklifi<br />
          <span style={{ color: '#F5C400' }}>geri geldi.</span>
        </h1>

        <p style={{ fontSize: '18px', color: '#888', lineHeight: 1.6, marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
          Kişiselleştirilmiş date kartı oluştur, linki gönder —<br />
          karşındaki tercihini yapsın, sen sadece orada ol.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: '#F5C400', color: '#000', textDecoration: 'none', fontSize: '16px', fontWeight: 800, padding: '14px 32px', borderRadius: '9999px', display: 'inline-block' }}>
            Kart Oluştur →
          </Link>
          <Link to="/login" style={{ background: 'transparent', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '14px 32px', borderRadius: '9999px', border: '1px solid #2A2A2A', display: 'inline-block' }}>
            Giriş Yap
          </Link>
        </div>
      </section>

      {/* MOCK CARD */}
      <section style={{ padding: '0 24px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#111', border: '2px solid #F5C400', borderRadius: '20px', padding: '28px 32px', maxWidth: '360px', width: '100%', boxShadow: '0 0 60px rgba(245,196,0,0.08)' }}>
          <p style={{ fontSize: '10px', color: '#F5C400', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px' }}>DATE CONFIRMED 💛</p>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '24px', marginBottom: '20px' }}>Mert & Zeynep 💛</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '🎯', label: 'Seçim', val: '🍕 Pizza' },
              { icon: '📅', label: 'Tarih & Saat', val: '20 Haziran 2026 Cumartesi 20:00' },
              { icon: '📍', label: 'Mekan', val: 'Kadıköy Meydan' },
              { icon: '🚗', label: '', val: 'Seni alıyor' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#1A1A1A', borderRadius: '10px', padding: '10px 14px' }}>
                {r.label && <p style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>{r.icon} {r.label}</p>}
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{!r.label ? r.icon + ' ' : ''}{r.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '60px 24px 100px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '32px', textAlign: 'center', marginBottom: '8px' }}>
          Nasıl çalışır?
        </h2>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '56px', fontSize: '15px' }}>
          4 adımda date planla
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {STEPS.map((s) => (
            <div key={s.num} style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: '16px', padding: '24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '22px' }}>{s.icon}</span>
                <span style={{ fontSize: '11px', color: '#F5C400', fontWeight: 800, letterSpacing: '1px' }}>{s.num}</span>
              </div>
              <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{s.title}</h4>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ borderTop: '1px solid #1A1A1A', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '28px', marginBottom: '16px' }}>
          İlk kartını oluştur 💌
        </h2>
        <p style={{ color: '#666', marginBottom: '28px', fontSize: '15px' }}>Ücretsiz, kayıt gerektiriyor.</p>
        <Link to="/register" style={{ background: '#F5C400', color: '#000', textDecoration: 'none', fontSize: '15px', fontWeight: 800, padding: '14px 32px', borderRadius: '9999px', display: 'inline-block' }}>
          Hemen Başla →
        </Link>
      </section>

    </div>
  )
}
