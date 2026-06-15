import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Veri Sorumlusu',
    content: (
      <p>Bu aydınlatma metni, <strong>getdatewith.me</strong> tarafından hazırlanmıştır. Veri sorumlusu olarak kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında işlemekteyiz.</p>
    ),
  },
  {
    title: '2. Hangi Veriler İşleniyor?',
    content: (
      <ul>
        <li>Ad, soyad, e-posta adresi</li>
        <li>Kullanıcı adı ve profil bilgileri</li>
        <li>Site kullanım verileri (çerezler aracılığıyla)</li>
      </ul>
    ),
  },
  {
    title: '3. Verilerin İşlenme Amacı',
    content: (
      <ul>
        <li>Hizmetin sunulması ve geliştirilmesi</li>
        <li>Kullanıcı deneyiminin iyileştirilmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>
    ),
  },
  {
    title: '4. Verilerin Saklanma Süresi',
    content: (
      <ul>
        <li>Verileriniz hesabınız aktif olduğu sürece saklanır.</li>
        <li>Hesabınızı silmeniz durumunda verileriniz 30 gün içinde imha edilir.</li>
      </ul>
    ),
  },
  {
    title: '5. Kullanıcı Hakları (KVKK Madde 11)',
    content: (
      <>
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenen verilere ilişkin bilgi talep etme</li>
          <li>Verilerin silinmesini veya yok edilmesini isteme</li>
          <li>İşlemenin kısıtlanmasını talep etme</li>
        </ul>
        <p>Talepleriniz için: <a href="mailto:getdatewith@gmail.com" style={{ color: '#00F680' }}>getdatewith@gmail.com</a></p>
      </>
    ),
  },
  {
    title: '6. Çerezler',
    content: (
      <ul>
        <li><strong>Oturum çerezleri</strong> — Hizmetin çalışması için zorunludur, oturum bilgilerinizi tutar.</li>
        <li><strong>Analitik çerezler</strong> — Site trafiğini ölçmek için kullanılır (isteğe bağlı).</li>
      </ul>
    ),
  },
]

export default function KVKKPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: 'Syne, sans-serif', padding: '40px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00F680', textDecoration: 'none', fontSize: '14px', fontWeight: 600, marginBottom: '32px' }}>
          ← Ana Sayfaya Dön
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.3, marginBottom: '8px' }}>
          Kişisel Verilerin Korunması Hakkında Aydınlatma Metni
        </h1>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '40px' }}>
          Son güncelleme: Haziran 2025
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '32px', borderBottom: '1px solid #1A1A1A', paddingBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#00F680', marginBottom: '12px' }}>{s.title}</h2>
            <div style={{ color: '#ccc', fontSize: '14px', lineHeight: 1.8 }}>
              {s.content}
            </div>
          </div>
        ))}

        <p style={{ color: '#555', fontSize: '12px', marginTop: '16px' }}>
          Bu metin, 6698 sayılı KVKK ve ilgili mevzuat kapsamında hazırlanmıştır.
        </p>
      </div>
    </div>
  )
}
