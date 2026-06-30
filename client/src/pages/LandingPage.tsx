import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import CommunityBanner from '../components/CommunityBanner'

export default function LandingPage() {
  const isLoggedIn = !!localStorage.getItem('token')

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
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
      "inLanguage": "tr",
    })
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>
      <AppHeader rightContent={
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/bulusma-mekanlari" style={{ color: '#555', textDecoration: 'none', fontSize: '14px' }}>Mekanlar</Link>
          <Link to="/login" style={{ color: '#555', textDecoration: 'none', fontSize: '14px' }}>Giriş Yap</Link>
          <Link to="/register" style={{ background: '#00C060', color: '#fff', textDecoration: 'none', borderRadius: '100px', padding: '9px 20px', fontSize: '14px', fontWeight: 700 }}>Başla</Link>
        </div>
      } />

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '64px 24px 48px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '9999px', padding: '6px 18px', fontSize: '12px', color: '#555', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '28px', textTransform: 'uppercase' }}>
          Hızlı ve Kaliteli Planlar
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 'clamp(36px, 8vw, 64px)', lineHeight: 1.05, marginBottom: '20px', letterSpacing: '-2px', color: '#0D0D0D' }}>
          Planı yap.{' '}
          <span style={{ color: '#00C060' }}>Linki at.</span>
          <br />Geriye gece kalsın.
        </h1>
        <p style={{ color: '#666', fontSize: '16px', lineHeight: 1.7, margin: '0 auto 32px', maxWidth: '440px' }}>
          Date, Girls Night Out ve tüm planlarını yap,<br />
          linki at — topluca takip edin.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={isLoggedIn ? '/dashboard' : '/register'}
            style={{ background: '#00C060', color: '#fff', textDecoration: 'none', fontSize: '16px', fontWeight: 800, padding: '14px 32px', borderRadius: '9999px', display: 'inline-block' }}>
            {isLoggedIn ? 'Planına Devam Et →' : 'Planını Oluştur →'}
          </Link>
          {!isLoggedIn && (
            <Link to="/login"
              style={{ background: 'transparent', color: '#0D0D0D', textDecoration: 'none', fontSize: '16px', fontWeight: 600, padding: '14px 32px', borderRadius: '9999px', border: '1.5px solid #D0D0D0', display: 'inline-block' }}>
              Giriş Yap
            </Link>
          )}
        </div>
      </div>

      {/* TRIPLIST — YENİ ÖZELLİK */}
      <div style={{ padding: '0 20px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #00C060 0%, #009A4E 100%)', borderRadius: '24px', padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.18)', borderRadius: '9999px', padding: '5px 16px', fontSize: '11px', color: '#fff', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Yeni Özellik
            </div>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(22px, 4vw, 34px)', color: '#fff', marginBottom: '14px', lineHeight: 1.15 }}>
              Triplist — Rota paylaşımı<br />artık burada
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '15px', lineHeight: 1.65, maxWidth: '500px', marginBottom: '32px' }}>
              Durak durak gezi planları oluştur, arkadaşlarınla paylaş. Hangi mekan, nasıl gidilir, kim geliyor — hepsi tek rotada.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link to={isLoggedIn ? '/plan/yeni' : '/register'}
                style={{ background: '#fff', color: '#009A4E', textDecoration: 'none', fontWeight: 800, fontSize: '15px', padding: '13px 28px', borderRadius: '9999px', display: 'inline-block' }}>
                Triplist Oluştur →
              </Link>
              <Link to="/topluluk"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '15px', padding: '13px 28px', borderRadius: '9999px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.35)' }}>
                Topluluk Rotaları
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { label: 'Durak durak rota', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
                { label: 'Ulaşım bilgisi', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                { label: 'Ekip paneli', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { label: 'Beğen & kaydet', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600 }}>
                  {f.icon}{f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* İKİ MOD */}
      <section style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontWeight: 900, fontSize: 'clamp(24px, 4vw, 36px)', textAlign: 'center', marginBottom: '8px', color: '#0D0D0D' }}>
          İki mod, sonsuz plan
        </h2>
        <p style={{ color: '#777', textAlign: 'center', marginBottom: '48px', fontSize: '15px' }}>
          Bire bir date mi? Kız grubu gecesi mi?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* Date Mode */}
          <div style={{ background: '#FAFAFA', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '28px', borderTop: '3px solid #00C060' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,192,96,0.08)', border: '1px solid rgba(0,192,96,0.2)', borderRadius: '9999px', padding: '4px 12px', fontSize: '11px', color: '#00C060', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              DATE KARTI
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px', color: '#0D0D0D' }}>Çıkma teklifi gönder</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Karşına özel kart oluştur, seçenekleri sun — o seçsin, sen sadece orada ol.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title: 'Kartını oluştur', desc: 'Kime göndereceğini yaz, seçenekleri özelleştir.' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>, title: 'Linki gönder', desc: 'WhatsApp\'tan veya Instagram\'dan ilet.' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'O seçsin', desc: 'Karşındaki tarih, mekan ve karşılama tercihini seçer.' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Rota hazır!', desc: 'Sen dashboarddan tüm detayları görürsün.' },
              ].map(s => (
                <div key={s.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', background: '#FFFFFF', border: '1px solid #EEEEEE', borderRadius: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,192,96,0.08)', border: '1px solid rgba(0,192,96,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0D0D0D', marginBottom: '3px' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: '#777', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register" style={{ display: 'block', marginTop: '20px', background: '#00C060', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '13px', borderRadius: '12px', textAlign: 'center' }}>
              Date Kartı Oluştur →
            </Link>
          </div>

          {/* GNO Mode */}
          <div style={{ background: '#FFF5F8', border: '1px solid #F0D8E4', borderRadius: '20px', padding: '28px', borderTop: '3px solid #D46080' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212,96,128,0.08)', border: '1px solid rgba(212,96,128,0.2)', borderRadius: '9999px', padding: '4px 12px', fontSize: '11px', color: '#D46080', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              GIRLS NIGHT OUT
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px', color: '#0D0D0D' }}>Grup gecesini planla</h3>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Nereye? Ne zaman? Canlı anketle kızlar oylasın, en çok oy alan kazansın.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D46080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, title: 'Grup oluştur', desc: 'Grubun adını ver, etkinlik ve mekan seçeneklerini belirle.' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D46080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>, title: 'Linki gruba at', desc: 'WhatsApp grubuna at, herkes oylamasını yapsın.' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D46080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Kızlar oylasın', desc: 'Herkes kendi tercihini seçer ya da kendisi yazar.' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D46080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, title: 'Sonuç belli!', desc: 'Canlı anket sonuçlarına göre kazanan seçenek netleşir.' },
              ].map(s => (
                <div key={s.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', background: '#FFFFFF', border: '1px solid #F0D8E4', borderRadius: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212,96,128,0.08)', border: '1px solid rgba(212,96,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0D0D0D', marginBottom: '3px' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register" style={{ display: 'block', marginTop: '20px', background: '#D46080', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '13px', borderRadius: '12px', textAlign: 'center' }}>
              GNO Oylama Oluştur →
            </Link>
          </div>
        </div>
      </section>

      {/* MOCK KARTLAR */}
      <section style={{ padding: '0 24px 80px', maxWidth: '780px', margin: '0 auto' }}>
        <h2 style={{ fontWeight: 900, fontSize: 'clamp(22px, 4vw, 30px)', textAlign: 'center', marginBottom: '8px', color: '#0D0D0D' }}>Böyle görünüyor</h2>
        <p style={{ color: '#777', textAlign: 'center', marginBottom: '40px', fontSize: '15px' }}>Planını oluşturduktan sonra alıcı bu kartı görür</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Date Card */}
          <div style={{ background: '#FFFFFF', border: '2px solid #00C060', borderRadius: '20px', padding: '24px 28px', maxWidth: '300px', width: '100%', boxShadow: '0 4px 24px rgba(0,192,96,0.12)' }}>
            <p style={{ fontSize: '10px', color: '#00C060', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px' }}>DATE CONFIRMED</p>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: '#0D0D0D' }}>Mert & Zeynep</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Seçim', val: 'Pizza' },
                { label: 'Tarih', val: 'Cumartesi 20:00' },
                { label: 'Mekan', val: 'Kadıköy Meydan' },
                { label: 'Karşılama', val: 'Seni alıyor' },
              ].map(r => (
                <div key={r.label} style={{ background: '#F8F8F8', borderRadius: '10px', padding: '10px 14px' }}>
                  <p style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>{r.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0D0D0D' }}>{r.val}</p>
                </div>
              ))}
            </div>
          </div>
          {/* GNO Poll Card */}
          <div style={{ background: '#FFF5F8', border: '2px solid #D46080', borderRadius: '20px', padding: '24px 28px', maxWidth: '300px', width: '100%', boxShadow: '0 4px 24px rgba(212,96,128,0.1)' }}>
            <p style={{ fontSize: '10px', color: '#D46080', letterSpacing: '2px', fontWeight: 700, marginBottom: '10px' }}>GIRLS NIGHT OUT</p>
            <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '16px', color: '#0D0D0D' }}>Pembe Kızlar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Önde giden', val: 'Kokteyl', pct: 60 },
                { label: 'Önde giden', val: 'Cuma 20:00', pct: 75 },
                { label: 'Önde giden', val: 'Beşiktaş', pct: 50 },
              ].map((r, i) => (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #F0D8E4', borderRadius: '10px', padding: '10px 14px' }}>
                  <p style={{ fontSize: '10px', color: '#C08090', marginBottom: '4px' }}>{r.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#0D0D0D' }}>{r.val}</p>
                  <div style={{ height: '4px', borderRadius: '9999px', background: '#F0D8E4' }}>
                    <div style={{ height: '100%', width: `${r.pct}%`, background: '#D46080', borderRadius: '9999px' }} />
                  </div>
                </div>
              ))}
              <div style={{ background: '#FFFFFF', border: '1px solid #F0D8E4', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>4 kişi oyladı</span>
                <span style={{ fontSize: '12px', color: '#D46080', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D46080', display: 'inline-block' }} />Canlı
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ background: '#F8F8F8', borderTop: '1px solid #EEEEEE', padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 900, fontSize: '28px', marginBottom: '12px', color: '#0D0D0D' }}>
          Başlamak ücretsiz
        </h2>
        <p style={{ color: '#777', marginBottom: '28px', fontSize: '15px' }}>Kayıt ol, ilk kartını oluştur, linki gönder.</p>
        <Link to="/register" style={{ background: '#00C060', color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 800, padding: '14px 36px', borderRadius: '9999px', display: 'inline-block' }}>
          Hemen Başla →
        </Link>
      </section>

      <CommunityBanner />

      <footer style={{ borderTop: '1px solid #EEEEEE', padding: '28px 24px', textAlign: 'center', background: '#FFFFFF' }}>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
          created by <span style={{ color: '#00C060', fontWeight: 700 }}>krebsatka</span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <a href="https://www.youtube.com/@krebsatka" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '9999px', border: '1px solid #E0E0E0' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/></svg>
            YouTube
          </a>
          <a href="https://www.instagram.com/krebsatka" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '9999px', border: '1px solid #E0E0E0' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            Instagram
          </a>
        </div>
      </footer>
      <div style={{ height: '80px' }} />
    </div>
  )
}
