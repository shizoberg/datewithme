import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const DATE_STEPS = [
  { num: '01', icon: '✏️', title: 'Kartını oluştur', desc: 'Kime göndereceğini yaz, 6 date seçeneğini özelleştir.' },
  { num: '02', icon: '🔗', title: 'Linki gönder',    desc: 'Benzersiz linki WhatsApp\'tan veya Instagram\'dan ilet.' },
  { num: '03', icon: '💌', title: 'O seçsin',        desc: 'Karşındaki tarih, mekan ve karşılama tercihini seçer.' },
  { num: '04', icon: '🎉', title: 'Date confirmed!', desc: 'Sen dashboarddan tüm detayları görürsün.' },
]

const GNO_STEPS = [
  { num: '01', icon: '👯‍♀️', title: 'Grup oluştur',    desc: 'Grubun adını ver, etkinlik, zaman ve mekan seçeneklerini belirle.' },
  { num: '02', icon: '🔗', title: 'Linki at gruba',  desc: 'WhatsApp grubuna at, herkes oylamasını yapsın.' },
  { num: '03', icon: '🗳️', title: 'Kızlar oylasın',  desc: 'Herkes kendi tercihini seçer ya da kendisi yazar.' },
  { num: '04', icon: '🏆', title: 'Sonuç belli!',    desc: 'Canlı anket sonuçlarına göre kazanan seçenek netleşir.' },
]

export default function LandingPage() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "getdatewith.me",
      "url": "https://www.getdatewith.me",
      "description": "Date planlamak, buluşma organize etmek ve kaliteli arkadaş bulmak için en kolay uygulama.",
      "applicationCategory": "SocialNetworkingApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TRY"
      },
      "inLanguage": "tr",
      "featureList": [
        "Date planlama ve organizasyon",
        "Girls Night Out organizasyonu",
        "Koşu arkadaşı bulma",
        "Çalışma arkadaşı bulma",
        "Kişiye özel buluşma linki"
      ]
    })
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: 'Raleway, sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid #1A1A1A' }}>
        <span style={{ fontWeight: 800, fontSize: '20px', color: '#F5C400', letterSpacing: '-0.5px' }}>
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
          ✨ Date & Girls Night Out için
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(42px, 8vw, 72px)', lineHeight: 1.05, marginBottom: '24px', letterSpacing: '-2px' }}>
          Çıkma teklifi<br />
          <span style={{ color: '#F5C400' }}>geri geldi.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#888', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 40px' }}>
          İster bire bir date, ister kız grubu gecesi —<br />
          planlama tartışması bitti, link gönder yeter.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: '#F5C400', color: '#000', textDecoration: 'none', fontSize: '16px', fontWeight: 800, padding: '14px 32px', borderRadius: '9999px' }}>
            Hemen Başla →
          </Link>
          <Link to="/login" style={{ background: 'transparent', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '14px 32px', borderRadius: '9999px', border: '1px solid #2A2A2A' }}>
            Giriş Yap
          </Link>
        </div>
      </section>

      {/* MOCK CARDS — side by side */}
      <section style={{ padding: '0 24px 80px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>

        {/* Date Card */}
        <div style={{ background: '#111', border: '2px solid #F5C400', borderRadius: '20px', padding: '24px 28px', maxWidth: '320px', width: '100%', boxShadow: '0 0 50px rgba(245,196,0,0.07)' }}>
          <p style={{ fontSize: '10px', color: '#F5C400', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px' }}>💛 DATE CONFIRMED</p>
          <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '16px' }}>Mert & Zeynep</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { icon: '🎯', label: 'Seçim', val: '🍕 Pizza' },
              { icon: '📅', label: 'Tarih', val: 'Cumartesi 20:00' },
              { icon: '📍', label: 'Mekan', val: 'Kadıköy Meydan' },
              { icon: '🚗', label: 'Karşılama', val: 'Seni alıyor' },
            ].map((r, i) => (
              <div key={i} style={{ background: '#1A1A1A', borderRadius: '10px', padding: '9px 13px' }}>
                <p style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>{r.icon} {r.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 600 }}>{r.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GNO Poll Card */}
        <div style={{ background: '#1A0810', border: '2px solid #C06080', borderRadius: '20px', padding: '24px 28px', maxWidth: '320px', width: '100%', boxShadow: '0 0 50px rgba(255,143,171,0.07)' }}>
          <p style={{ fontSize: '10px', color: '#FF8FAB', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px' }}>👯‍♀️ GIRLS NIGHT OUT</p>
          <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '16px' }}>Pembe Kızlar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {[
              { icon: '🎯', label: 'Önde giden', val: '🍸 Kokteyl', pct: 60 },
              { icon: '📅', label: 'Önde giden', val: 'Cuma 20:00', pct: 75 },
              { icon: '📍', label: 'Önde giden', val: 'Beşiktaş', pct: 50 },
            ].map((r, i) => (
              <div key={i} style={{ background: '#2D1520', borderRadius: '10px', padding: '9px 13px' }}>
                <p style={{ fontSize: '10px', color: '#a06070', marginBottom: '4px' }}>{r.icon} {r.label}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>{r.val}</p>
                <div style={{ height: '4px', borderRadius: '9999px', background: '#3D1F2C' }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: '#FF8FAB', borderRadius: '9999px' }} />
                </div>
              </div>
            ))}
            <div style={{ background: '#2D1520', borderRadius: '10px', padding: '9px 13px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>4 kişi oyladı</span>
              <span style={{ fontSize: '13px', color: '#FF8FAB', fontWeight: 700 }}>Canlı 🔴</span>
            </div>
          </div>
        </div>
      </section>

      {/* TWO MODES */}
      <section style={{ padding: '20px 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)', textAlign: 'center', marginBottom: '8px' }}>
          İki mod, sonsuz plan
        </h2>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
          Bire bir date mi? Kız grubu gecesi mi?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* Date Mode */}
          <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '20px', padding: '28px', borderTop: '3px solid #F5C400' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A00', border: '1px solid #F5C40040', borderRadius: '9999px', padding: '4px 12px', fontSize: '11px', color: '#F5C400', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
              💛 DATE KARTI
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Çıkma teklifi gönder</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Karşına özel kart oluştur, seçenekleri sun — o seçsin, sen sadece orada ol.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {DATE_STEPS.map(s => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{s.title}</p>
                    <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register" style={{ display: 'block', marginTop: '24px', background: '#F5C400', color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 800, padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              Date Kartı Oluştur →
            </Link>
          </div>

          {/* GNO Mode */}
          <div style={{ background: '#1A0810', border: '1px solid #3D1F2C', borderRadius: '20px', padding: '28px', borderTop: '3px solid #FF8FAB' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2D1520', border: '1px solid #C0608040', borderRadius: '9999px', padding: '4px 12px', fontSize: '11px', color: '#FF8FAB', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
              👯‍♀️ GIRLS NIGHT OUT
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Grup gecesini planla</h3>
            <p style={{ color: '#a06070', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
              Nereye? Ne zaman? Canlı anketle kızlar oylasın, en çok oy alan kazansın.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {GNO_STEPS.map(s => (
                <div key={s.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{s.title}</p>
                    <p style={{ fontSize: '12px', color: '#a06070', lineHeight: 1.4 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register" style={{ display: 'block', marginTop: '24px', background: '#FF8FAB', color: '#000', textDecoration: 'none', fontSize: '14px', fontWeight: 800, padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
              GNO Oylama Oluştur →
            </Link>
          </div>

        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ borderTop: '1px solid #1A1A1A', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '12px' }}>
          Başlamak ücretsiz 💌
        </h2>
        <p style={{ color: '#666', marginBottom: '28px', fontSize: '15px' }}>Kayıt ol, ilk kartını oluştur, linki gönder.</p>
        <Link to="/register" style={{ background: '#F5C400', color: '#000', textDecoration: 'none', fontSize: '15px', fontWeight: 800, padding: '14px 36px', borderRadius: '9999px', display: 'inline-block' }}>
          Hemen Başla →
        </Link>
      </section>

      {/* CREATED BY */}
      <footer style={{ borderTop: '1px solid #141414', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: '#444', fontSize: '13px', marginBottom: '12px' }}>
          created by <span style={{ color: '#F5C400', fontWeight: 700 }}>krebsatka</span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <a href="https://www.youtube.com/@krebsatka" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '9999px', border: '1px solid #222', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FF0000'; (e.currentTarget as HTMLAnchorElement).style.color = '#FF4444' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222'; (e.currentTarget as HTMLAnchorElement).style.color = '#555' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/></svg>
            YouTube
          </a>
          <a href="https://www.instagram.com/krebsatka" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '9999px', border: '1px solid #222', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E1306C'; (e.currentTarget as HTMLAnchorElement).style.color = '#E1306C' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#222'; (e.currentTarget as HTMLAnchorElement).style.color = '#555' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            Instagram
          </a>
        </div>
      </footer>

    </div>
  )
}
