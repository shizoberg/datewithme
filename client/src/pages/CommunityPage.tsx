import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface TriplistPreview {
  id: string; title: string; slug: string
  city: string; district?: string; country: string
  viewCount: number; likeCount: number; saveCount: number
  stops: { id: string; venueName: string }[]
  user: { username: string; name: string; avatarId?: string }
  startDate?: string
  isFeatured?: boolean; featuredBy?: string; sponsoredBy?: string
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'En Yeni',        icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { value: 'views',  label: 'En Çok Gezilen', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { value: 'likes',  label: 'En Çok Beğenilen',icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { value: 'saves',  label: 'En Çok Kaydedilen',icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> },
]

// Türkçe büyük/küçük harf normalizasyonu
function normCity(s: string) {
  return s.replace(/İ/g, 'i').replace(/I/g, 'i').replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's').replace(/Ö/g, 'o').replace(/Ç/g, 'c').toLowerCase()
}

function IcHeart({ filled, c }: { filled?: boolean; c: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
function IcBookmark({ filled, c }: { filled?: boolean; c: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
}
function IcEye({ c }: { c: string }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IcPin({ c }: { c: string }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function IcStar({ c }: { c: string }) {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function IcUser({ c }: { c: string }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

function TriplistCard({ t, liked, saved, onLike, onSave }: {
  t: TriplistPreview; liked: boolean; saved: boolean
  onLike: () => void; onSave: () => void
}) {
  const isEditorPick = t.isFeatured && t.featuredBy === 'admin'
  const isInfluencer = t.isFeatured && t.featuredBy === 'influencer'
  const isSponsored = t.isFeatured && !!t.sponsoredBy

  const badgeColor = isSponsored ? '#F59E0B' : isEditorPick ? '#00C060' : isInfluencer ? '#8B5CF6' : ''
  const badgeLabel = isSponsored ? `✦ ${t.sponsoredBy}` : isEditorPick ? "Berk'in Seçimi" : isInfluencer ? 'Influencer Tavsiyesi' : ''
  const hasBadge = isSponsored || isEditorPick || isInfluencer

  return (
    <div style={{
      background: '#fff',
      border: isSponsored ? '1.5px solid #F59E0B' : isEditorPick ? '1.5px solid #00C060' : isInfluencer ? '1.5px solid #8B5CF6' : '1px solid #EBEBEB',
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: hasBadge ? `0 4px 16px ${badgeColor}22` : '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {hasBadge && (
        <div style={{ background: badgeColor, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <IcStar c="#fff" />
          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px' }}>
            {badgeLabel}
          </span>
        </div>
      )}
      <Link to={`/${t.user.username}/triplist/${t.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '18px 18px 0' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F5F5F5', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', color: '#555' }}>
            <IcPin c="#888" /> {t.city}{t.district ? `, ${t.district}` : ''}
          </span>
        </div>
        <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '12px', color: '#0D0D0D', lineHeight: 1.3 }}>{t.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
          {t.stops.slice(0, 3).map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F0FAF5', border: '1.5px solid #00C06030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#00C060', flexShrink: 0 }}>{i + 1}</div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.venueName}</span>
            </div>
          ))}
          {t.stops.length > 3 && <div style={{ fontSize: '11px', color: '#AAA', paddingLeft: '26px' }}>+{t.stops.length - 3} durak daha</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#00C060', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
            {t.user.name[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#00C060' }}>@{t.user.username}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#BBB', fontSize: '11px' }}>
            <IcEye c="#BBB" /> {t.viewCount}
          </div>
        </div>
      </Link>
      <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #F5F5F5', margin: '0 0 0 0' }}>
        <button onClick={onLike}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', border: 'none', borderRight: '1px solid #F5F5F5', background: liked ? '#FFF5F7' : 'transparent', color: liked ? '#E0566A' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '0 0 0 14px' }}>
          <IcHeart filled={liked} c={liked ? '#E0566A' : '#AAA'} />
          {t.likeCount > 0 ? t.likeCount : ''} Beğen
        </button>
        <button onClick={onSave}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', border: 'none', background: saved ? '#F0F7FF' : 'transparent', color: saved ? '#2E6EAE' : '#888', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '0 0 14px 0' }}>
          <IcBookmark filled={saved} c={saved ? '#2E6EAE' : '#AAA'} />
          {t.saveCount > 0 ? t.saveCount : ''} Kaydet
        </button>
      </div>
    </div>
  )
}

const CATEGORIES = [
  { value: 'cafe', label: 'Kafe' }, { value: 'restaurant', label: 'Restoran' },
  { value: 'bar', label: 'Bar' }, { value: 'park', label: 'Park' },
  { value: 'rooftop', label: 'Rooftop' }, { value: 'cultural', label: 'Kültürel' },
]

const EMPTY = { name: '', category: 'cafe', city: '', district: '', address: '', googleMapsUrl: '', instagramUrl: '', rating: 4.5, priceLevel: 2, description: '', submitterName: '', submitterEmail: '' }

export default function CommunityPage() {
  const [form, setForm] = useState({ ...EMPTY })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [triplists, setTriplists] = useState<TriplistPreview[]>([])
  const [activeTab, setActiveTab] = useState<'triplists' | 'suggest'>('triplists')
  const [sort, setSort] = useState('latest')
  const [cityFilter, setCityFilter] = useState('')
  const [interactions, setInteractions] = useState<{ triplistId: string; type: string }[]>([])

  useEffect(() => { document.title = 'Triplist — getdatewith.me' }, [])

  useEffect(() => {
    api.get(`/api/triplists/public?sort=${sort}`).then(r => setTriplists(r.data)).catch(() => {})
  }, [sort])

  useEffect(() => {
    api.get('/api/triplists/my-interactions').then(r => setInteractions(r.data)).catch(() => {})
  }, [])

  function isLiked(id: string) { return interactions.some(i => i.triplistId === id && i.type === 'like') }
  function isSaved(id: string) { return interactions.some(i => i.triplistId === id && i.type === 'save') }

  async function handleLike(t: TriplistPreview) {
    const wasLiked = isLiked(t.id)
    setInteractions(prev => wasLiked ? prev.filter(i => !(i.triplistId === t.id && i.type === 'like')) : [...prev, { triplistId: t.id, type: 'like' }])
    setTriplists(prev => prev.map(x => x.id === t.id ? { ...x, likeCount: x.likeCount + (wasLiked ? -1 : 1) } : x))
    await api.post(`/api/triplists/${t.id}/like`, { type: 'like' }).catch(() => {})
  }
  async function handleSave(t: TriplistPreview) {
    const wasSaved = isSaved(t.id)
    setInteractions(prev => wasSaved ? prev.filter(i => !(i.triplistId === t.id && i.type === 'save')) : [...prev, { triplistId: t.id, type: 'save' }])
    setTriplists(prev => prev.map(x => x.id === t.id ? { ...x, saveCount: x.saveCount + (wasSaved ? -1 : 1) } : x))
    await api.post(`/api/triplists/${t.id}/like`, { type: 'save' }).catch(() => {})
  }

  function set(k: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      await api.post('/api/venue-submissions', { name: form.name.trim(), category: form.category, city: form.city.trim(), district: form.district.trim(), address: form.address.trim() || undefined, googleMapsUrl: form.googleMapsUrl.trim() || undefined, instagramUrl: form.instagramUrl.trim() || undefined, rating: form.rating || undefined, priceLevel: form.priceLevel || undefined, description: form.description.trim() || undefined, submitterName: form.submitterName.trim() || undefined, submitterEmail: form.submitterEmail.trim() || undefined })
      setSuccess(true)
    } catch (err: any) { setError(err.response?.data?.error || 'Bir hata oluştu.') }
    finally { setSubmitting(false) }
  }

  // Dinamik şehir listesi — triplistlerden çek, unique + sıralı
  const cities = Array.from(new Set(triplists.map(t => t.city).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'tr'))

  const filtered = cityFilter
    ? triplists.filter(t => normCity(t.city) === normCity(cityFilter))
    : triplists

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E0E0E0', background: '#FAFAFA', color: '#0D0D0D', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', letterSpacing: '0.5px', marginBottom: '6px', textTransform: 'uppercase' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F8F8', color: '#0D0D0D', fontFamily: 'Raleway, sans-serif' }}>

      {/* Header */}
      <div className="page-content" style={{ paddingTop: '28px', paddingBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '0' }}>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Triplistler</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/plan/yeni" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#00C060', color: '#fff', fontWeight: 700, fontSize: '13px', padding: '8px 16px', borderRadius: '9999px', textDecoration: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Triplist Oluştur
            </Link>
            <button onClick={() => setActiveTab('suggest')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: activeTab === 'suggest' ? '#0D0D0D' : '#F5F5F5', color: activeTab === 'suggest' ? '#fff' : '#555', fontWeight: 600, fontSize: '13px', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Mekanını Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Tab indicator — sadece suggest için göster */}
      {activeTab === 'suggest' && (
        <div className="page-content" style={{ paddingTop: '0', paddingBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '12px' }}>
            <button onClick={() => setActiveTab('triplists')} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', padding: '0' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              Triplistlere dön
            </button>
          </div>
        </div>
      )}

      {activeTab === 'triplists' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 20px 80px' }}>
          {/* Filtreler */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Şehir filtresi — dinamik */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => setCityFilter('')}
                style={{ padding: '5px 14px', borderRadius: '9999px', border: `1px solid ${cityFilter === '' ? '#00C060' : '#E0E0E0'}`, background: cityFilter === '' ? '#E8FFF4' : '#fff', color: cityFilter === '' ? '#00A050' : '#666', fontSize: '12px', fontWeight: cityFilter === '' ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Tümü
              </button>
              {cities.map(c => (
                <button key={c} onClick={() => setCityFilter(c)}
                  style={{ padding: '5px 14px', borderRadius: '9999px', border: `1px solid ${normCity(cityFilter) === normCity(c) ? '#00C060' : '#E0E0E0'}`, background: normCity(cityFilter) === normCity(c) ? '#E8FFF4' : '#fff', color: normCity(cityFilter) === normCity(c) ? '#00A050' : '#666', fontSize: '12px', fontWeight: normCity(cityFilter) === normCity(c) ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sıralama */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {SORT_OPTIONS.map(o => (
              <button key={o.value} onClick={() => setSort(o.value)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '9999px', border: `1px solid ${sort === o.value ? '#00C060' : '#E0E0E0'}`, background: sort === o.value ? '#F0FAF5' : '#fff', color: sort === o.value ? '#00A050' : '#888', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {o.icon} {o.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}><path d="M3 17 C6 17 6 7 12 7 S18 17 21 17"/><circle cx="3" cy="17" r="2" fill="#DDD" stroke="none"/><circle cx="12" cy="7" r="2" fill="#DDD" stroke="none"/><circle cx="21" cy="17" r="2" fill="#DDD" stroke="none"/></svg>
              <div style={{ fontWeight: 700, color: '#555', marginBottom: '6px' }}>
                {cityFilter ? `${cityFilter} için henüz triplist yok` : 'Henüz triplist yok'}
              </div>
              <div style={{ fontSize: '13px' }}>İlk triplist'i sen oluştur!</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {filtered.map(t => (
                <TriplistCard key={t.id} t={t}
                  liked={isLiked(t.id)} saved={isSaved(t.id)}
                  onLike={() => handleLike(t)} onSave={() => handleSave(t)} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggest' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px 80px' }}>
          <div style={{ background: '#fff', border: '1px solid #E8E8E8', borderRadius: '20px', padding: '28px', borderTop: '3px solid #00C060' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Mekanını Ekle</h2>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>Onaylandıktan sonra tüm kullanıcılara önerilecek.</p>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ background: '#EDFAF4', border: '1px solid #00C06030', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '28px', color: '#00C060', fontWeight: 800, marginBottom: '8px' }}>✓</div>
                  <p style={{ fontWeight: 700, color: '#00A050', marginBottom: '4px' }}>Teşekkürler!</p>
                  <p style={{ color: '#666', fontSize: '13px' }}>Mekanın inceleme kuyruğunda.</p>
                </div>
                <button onClick={() => { setForm({ ...EMPTY }); setSuccess(false) }}
                  style={{ background: '#00C060', color: '#fff', border: 'none', borderRadius: '9999px', padding: '11px 24px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Başka bir mekan ekle
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div><label style={lbl}>İsim *</label><input style={inp} placeholder="Paper Cup" value={form.name} onChange={set('name')} required /></div>
                  <div><label style={lbl}>Kategori *</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={set('category')}>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div><label style={lbl}>Şehir *</label><input style={inp} placeholder="İstanbul" value={form.city} onChange={set('city')} required /></div>
                  <div><label style={lbl}>İlçe *</label><input style={inp} placeholder="Kadıköy" value={form.district} onChange={set('district')} required /></div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={lbl}>Açıklama <span style={{ color: '#CCC', fontWeight: 400, textTransform: 'none' }}>(opsiyonel)</span></label>
                  <textarea style={{ ...inp, resize: 'vertical', minHeight: '72px' } as React.CSSProperties} placeholder="Bu mekan hakkında bir şey yaz..." maxLength={300} value={form.description} onChange={set('description')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div><label style={lbl}>Adın</label><input style={inp} placeholder="Zeynep" value={form.submitterName} onChange={set('submitterName')} /></div>
                  <div><label style={lbl}>E-posta</label><input style={inp} type="email" placeholder="zeynep@mail.com" value={form.submitterEmail} onChange={set('submitterEmail')} /></div>
                </div>
                {error && <div style={{ background: '#FEE2E2', border: '1px solid #EF444430', borderRadius: '10px', padding: '11px 14px', marginBottom: '14px', color: '#B91C1C', fontSize: '13px' }}>{error}</div>}
                <button type="submit" disabled={submitting || !form.name.trim() || !form.city.trim() || !form.district.trim()}
                  style={{ width: '100%', padding: '13px', borderRadius: '9999px', border: 'none', fontFamily: 'inherit', background: (!form.name.trim() || !form.city.trim() || !form.district.trim() || submitting) ? '#E8E8E8' : '#00C060', color: (!form.name.trim() || !form.city.trim() || !form.district.trim() || submitting) ? '#999' : '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {submitting ? 'Gönderiliyor…' : 'Mekanı Öner →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div style={{ height: '80px' }} />
    </div>
  )
}
