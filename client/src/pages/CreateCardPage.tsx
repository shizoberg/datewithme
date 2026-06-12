import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const THEMES = [
  { id: 'minimal', label: 'Minimal', desc: 'Sade & şık', preview: { bg: '#111', border: '#333', dot: '#fff' } },
  { id: 'rosy',    label: 'Rosy',    desc: 'Pembe & romantik', preview: { bg: '#2D1A1E', border: '#C06080', dot: '#FF8FAB' } },
  { id: 'emoji',   label: 'Emoji',   desc: 'Eğlenceli & renkli', preview: { bg: '#1A1F2A', border: '#4C6EF5', dot: '#F5C400' } },
]

const DEFAULT_OPTIONS = ['🍕 Pizza', '🍦 Dondurma', '☕ Kahve', '🍸 Kokteyl', '🎨 Workshop', '🍺 Bar']

export default function CreateCardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [recipientName, setRecipientName] = useState('')
  const [theme, setTheme] = useState('minimal')
  const [options, setOptions] = useState([...DEFAULT_OPTIONS])
  const [suggestions, setSuggestions] = useState({ select: '', datetime: '', location: '', pickup: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<{ link: string } | null>(null)
  const [copied, setCopied] = useState(false)

  function slugify(s: string) {
    return s.toLowerCase().trim()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  async function publish() {
    setSaving(true)
    try {
      const r = await api.post('/api/cards', {
        recipientName: recipientName.trim(),
        theme,
        option1Label: options[0],
        option2Label: options[1],
        option3Label: options[2],
        option4Label: options[3],
        option5Label: options[4],
        option6Label: options[5],
        suggestSelect:   suggestions.select   || undefined,
        suggestDatetime: suggestions.datetime || undefined,
        suggestLocation: suggestions.location || undefined,
        suggestPickup:   suggestions.pickup   || undefined,
      })
      const slug = r.data.card.slug
      const link = `${window.location.origin}/${user?.username}/${slug}`
      setDone({ link })
    } catch (err: any) {
      alert(err.response?.data?.error || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(done!.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── DONE ────────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>💌</div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{recipientName} için kart hazır!</h2>
        <p style={{ color: '#999', marginBottom: '32px' }}>Bu linki gönder, cevabı bekle.</p>

        <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ flex: 1, fontSize: '13px', wordBreak: 'break-all', textAlign: 'left', color: '#ccc' }}>{done.link}</span>
          <button onClick={copy} className="btn-primary" style={{ flexShrink: 0, padding: '8px 16px', fontSize: '13px' }}>
            {copied ? '✓' : '📋 Kopyala'}
          </button>
        </div>

        <Link to="/dashboard" style={{ color: '#999', fontSize: '14px' }}>← Dashboard'a dön</Link>
      </div>
    </div>
  )

  // ── STEP 1 ───────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <Link to="/dashboard" style={{ color: '#999', fontSize: '14px', textDecoration: 'none', display: 'block', marginBottom: '32px' }}>← Dashboard</Link>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i === 1 ? '#F5C400' : '#2A2A2A' }} />)}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Kimin için? 💌</h2>
        <p style={{ color: '#999', marginBottom: '28px' }}>Alıcının adını yaz ve tema seç.</p>

        <div style={{ marginBottom: '24px' }}>
          <label className="label">Alıcının adı</label>
          <input className="input" style={{ fontSize: '18px' }} placeholder="Ayşe" value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && recipientName.trim() && setStep(2)} autoFocus />
          {recipientName && (
            <p style={{ marginTop: '8px', fontSize: '13px', color: '#F5C400' }}>
              getdatewith.me/{user?.username}/{slugify(recipientName)}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label className="label" style={{ marginBottom: '12px' }}>Tema</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                style={{ padding: '16px 12px', borderRadius: '12px', border: `2px solid ${theme === t.id ? '#F5C400' : '#2A2A2A'}`, background: t.preview.bg, cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.preview.dot, margin: '0 auto 8px' }} />
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{t.label}</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={() => setStep(2)} disabled={!recipientName.trim()} style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          İlerle →
        </button>
      </div>
    </div>
  )

  // ── STEP 2 ───────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px', marginBottom: '32px', display: 'block' }}>← Geri</button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= 2 ? '#F5C400' : '#2A2A2A' }} />)}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Seçenekleri özelleştir ✏️</h2>
        <p style={{ color: '#999', marginBottom: '28px' }}>İstersen değiştir, olduğu gibi de bırakabilirsin. 6 seçenek {recipientName}'e gönderilecek.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {options.map((opt, i) => (
            <input key={i} className="input" value={opt}
              onChange={e => setOptions(o => o.map((v, j) => j === i ? e.target.value : v))} />
          ))}
        </div>

        <button className="btn-primary" onClick={() => setStep(3)} disabled={options.some(o => !o.trim())}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          İlerle →
        </button>
      </div>
    </div>
  )

  // ── STEP 3 ───────────────────────────────────────────────────
  const SUGGEST_FIELDS = [
    { key: 'select',   icon: '🎯', label: 'Date tipi seçerken', placeholder: 'Örn: Kahveyi seç, favorim o! ☕' },
    { key: 'datetime', icon: '📅', label: 'Tarih & saat seçerken', placeholder: 'Örn: Cumartesi akşamları uygunumdur 😊' },
    { key: 'location', icon: '📍', label: 'Mekan seçerken', placeholder: 'Örn: Kadıköy\'de bir yer olursa harika' },
    { key: 'pickup',   icon: '🚗', label: 'Karşılama için', placeholder: 'Örn: Seni almak isterim ama sen bilirsin 🙂' },
  ] as const

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>
        <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px', marginBottom: '32px', display: 'block' }}>← Geri</button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: '#F5C400' }} />)}
        </div>

        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px' }}>Önerilerini ekle 💬</h2>
        <p style={{ color: '#999', marginBottom: '28px' }}>
          {recipientName} her adımda senin önerini görecek. Boş bırakabilirsin.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {SUGGEST_FIELDS.map(f => (
            <div key={f.key}>
              <label className="label" style={{ marginBottom: '6px' }}>
                {f.icon} {f.label}
              </label>
              <input
                className="input"
                placeholder={f.placeholder}
                value={suggestions[f.key]}
                onChange={e => setSuggestions(s => ({ ...s, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={publish} disabled={saving}
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
          {saving ? 'Oluşturuluyor…' : '🚀 Kartı Yayınla'}
        </button>
      </div>
    </div>
  )
}
