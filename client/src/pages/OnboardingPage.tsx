import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'

const PERSONALITY_TAGS = [
  { id: 'gece_insani', label: 'Gece İnsanı', emoji: '🌙' },
  { id: 'kafe_delisi', label: 'Kafe Delisi', emoji: '☕' },
  { id: 'etkinlik_avcisi', label: 'Etkinlik Avcısı', emoji: '🎯' },
  { id: 'yemek_tutkunu', label: 'Yemek Tutkunu', emoji: '🍽️' },
  { id: 'doga_sever', label: 'Doğa Sever', emoji: '🌿' },
  { id: 'muzik_asigi', label: 'Müzik Aşığı', emoji: '🎵' },
  { id: 'sanat_dostu', label: 'Sanat Dostu', emoji: '🎨' },
  { id: 'spor_aktif', label: 'Spor & Aktif', emoji: '🏃' },
  { id: 'bar_hopper', label: 'Bar Hopper', emoji: '🍸' },
  { id: 'brunch_lover', label: 'Brunch Lover', emoji: '🥂' },
  { id: 'rooftop_fani', label: 'Rooftop Fanı', emoji: '🌆' },
  { id: 'plan_ustasi', label: 'Plan Ustası', emoji: '📋' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bio: '',
    city: '',
    district: '',
    selectedTags: [] as string[],
    photoUrl: '',
  })

  const token = localStorage.getItem('token')

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const toggleTag = (id: string) => {
    setForm(f => {
      if (f.selectedTags.includes(id)) {
        return { ...f, selectedTags: f.selectedTags.filter(t => t !== id) }
      }
      if (f.selectedTags.length >= 5) return f
      return { ...f, selectedTags: [...f.selectedTags, id] }
    })
  }

  const finish = async (skip = false) => {
    setSaving(true)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/profile/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: form.bio,
          city: form.city,
          district: form.district,
          photoUrl: form.photoUrl,
          personalityTags: form.selectedTags.join(','),
          onboardingDone: true,
        }),
      })
    } catch {
      // sessizce geç
    } finally {
      navigate('/dashboard')
    }
  }

  const inp = {
    width: '100%',
    background: '#111',
    border: '1px solid #2A2A2A',
    borderRadius: '12px',
    padding: '13px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box' as const,
  }

  const ProgressDots = () => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          width: i === step ? '24px' : '8px',
          height: '8px',
          borderRadius: '100px',
          background: i <= step ? '#00F680' : '#2A2A2A',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  )

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: '#0D0D0D', minHeight: '100vh' }}>
      <AppHeader />
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px 100px' }}>
        <ProgressDots />
        {children}
      </div>
    </div>
  )

  const NavButtons = ({ onNext, nextLabel = 'İlerle →', nextDisabled = false, showSkip = true }: {
    onNext: () => void, nextLabel?: string, nextDisabled?: boolean, showSkip?: boolean
  }) => (
    <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          background: nextDisabled ? '#1A1A1A' : '#00F680',
          color: nextDisabled ? '#555' : '#0D0D0D',
          border: 'none', borderRadius: '100px',
          padding: '14px', fontSize: '15px', fontWeight: 700,
          cursor: nextDisabled ? 'not-allowed' : 'pointer',
          width: '100%', fontFamily: 'Syne, sans-serif',
          transition: 'all 0.15s',
        }}
      >
        {nextLabel}
      </button>
      {step > 1 && (
        <button onClick={back} style={{
          background: 'none', border: 'none', color: '#555',
          fontSize: '13px', cursor: 'pointer', padding: '8px',
        }}>
          ← Geri
        </button>
      )}
      {showSkip && (
        <button onClick={() => step === 4 ? finish(true) : next()} style={{
          background: 'none', border: 'none', color: '#444',
          fontSize: '13px', cursor: 'pointer', padding: '8px',
        }}>
          Şimdi değil, atla
        </button>
      )}
    </div>
  )

  if (step === 1) return (
    <Wrapper>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
        Seni tanıyalım 👋
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
        Sana özel deneyim için birkaç şey soracağız. İstersen atlayabilirsin.
      </p>
      <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px' }}>
        Kendini kısaca anlat (opsiyonel)
      </label>
      <textarea
        value={form.bio}
        onChange={e => setForm(f => ({...f, bio: e.target.value}))}
        placeholder="Gece çıkmaları seven, yeni mekanlar keşfetmekten keyif alan biri..."
        maxLength={160}
        style={{ ...inp, resize: 'none', height: '100px' }}
      />
      <div style={{ fontSize: '11px', color: '#555', textAlign: 'right', marginTop: '4px' }}>
        {form.bio.length}/160
      </div>
      <NavButtons onNext={next} />
    </Wrapper>
  )

  if (step === 2) return (
    <Wrapper>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
        Nerelisin? 📍
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
        Sana yakın mekan önerileri sunabilelim.
      </p>
      <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px' }}>Şehir</label>
      <select
        value={form.city}
        onChange={e => setForm(f => ({...f, city: e.target.value}))}
        style={{ ...inp, cursor: 'pointer', marginBottom: '14px' }}
      >
        <option value="">Şehir seç...</option>
        <option value="İstanbul">İstanbul</option>
        <option value="İzmir">İzmir</option>
        <option value="Ankara">Ankara</option>
        <option value="Bursa">Bursa</option>
        <option value="Antalya">Antalya</option>
        <option value="Diğer">Diğer</option>
      </select>
      {form.city && (
        <>
          <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px' }}>
            İlçe (opsiyonel)
          </label>
          <input
            value={form.district}
            onChange={e => setForm(f => ({...f, district: e.target.value}))}
            placeholder="Kadıköy, Alsancak, Çankaya..."
            style={inp}
          />
        </>
      )}
      <NavButtons onNext={next} />
    </Wrapper>
  )

  if (step === 3) return (
    <Wrapper>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
        Sen nasıl birisin? ✨
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '6px', lineHeight: 1.6 }}>
        Seni en iyi tanımlayan etiketleri seç.
      </p>
      <p style={{ color: '#555', fontSize: '12px', marginBottom: '20px' }}>
        En az 1, en fazla 5 seç · {form.selectedTags.length}/5
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {PERSONALITY_TAGS.map(tag => {
          const selected = form.selectedTags.includes(tag.id)
          const disabled = form.selectedTags.length >= 5 && !selected
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              disabled={disabled}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 14px', borderRadius: '12px',
                border: `1px solid ${selected ? '#00F680' : '#2A2A2A'}`,
                background: selected ? 'rgba(0,246,128,0.08)' : '#1A1A1A',
                color: selected ? '#00F680' : disabled ? '#444' : '#999',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: selected ? 600 : 400,
                transition: 'all 0.15s', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '18px' }}>{tag.emoji}</span>
              <span style={{ flex: 1 }}>{tag.label}</span>
              {selected && <span style={{ fontSize: '11px' }}>✓</span>}
            </button>
          )
        })}
      </div>
      <NavButtons onNext={next} nextDisabled={form.selectedTags.length === 0} />
    </Wrapper>
  )

  return (
    <Wrapper>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
        Son adım 🎉
      </h1>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
        İsteğe bağlı — profil fotoğrafı ekle.
      </p>

      {form.photoUrl && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src={form.photoUrl}
            alt="Profil"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00F680' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}

      <label style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px' }}>
        Fotoğraf URL'si (opsiyonel)
      </label>
      <input
        type="url"
        value={form.photoUrl}
        onChange={e => setForm(f => ({...f, photoUrl: e.target.value}))}
        placeholder="https://..."
        style={inp}
      />
      <p style={{ fontSize: '12px', color: '#444', marginTop: '8px' }}>
        Instagram profilinden veya herhangi bir fotoğraf linkini yapıştırabilirsin.
      </p>

      <NavButtons
        onNext={() => finish()}
        nextLabel={saving ? 'Kaydediliyor...' : 'Profili Tamamla →'}
        nextDisabled={saving}
        showSkip={!saving}
      />
    </Wrapper>
  )
}
