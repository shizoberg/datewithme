import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

interface Venue {
  id: string; name: string; category: string; city: string; district: string
  address?: string; googleMapsUrl?: string; instagramUrl?: string
  rating?: number; priceLevel?: number; isActive: boolean; createdAt: string
}

const CATEGORIES = ['cafe', 'restaurant', 'bar', 'park', 'rooftop', 'cultural']
const CAT_EMOJI: Record<string, string> = {
  cafe: '☕', restaurant: '🍽️', bar: '🍸', park: '🌿', rooftop: '🌆', cultural: '🎨',
}
const PRICE_LABEL = ['', '₺', '₺₺', '₺₺₺']

const EMPTY_FORM = {
  name: '', category: 'cafe', city: '', district: '', address: '',
  googleMapsUrl: '', instagramUrl: '', rating: '', priceLevel: '2',
}

export default function AdminPage() {
  const [tab, setTab] = useState<'venues'>('venues')
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const r = await api.get('/api/venues/admin')
      setVenues(r.data.venues)
    } catch { alert('Yüklenemedi') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function startEdit(v: Venue) {
    setForm({
      name: v.name, category: v.category, city: v.city, district: v.district,
      address: v.address ?? '', googleMapsUrl: v.googleMapsUrl ?? '',
      instagramUrl: v.instagramUrl ?? '',
      rating: v.rating?.toString() ?? '', priceLevel: v.priceLevel?.toString() ?? '2',
    })
    setEditId(v.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm({ ...EMPTY_FORM })
  }

  async function save() {
    setSaving(true)
    try {
      const igRaw = form.instagramUrl.trim()
      const ig = igRaw
        ? igRaw.startsWith('http') ? igRaw : `https://instagram.com/${igRaw.replace(/^@/, '')}`
        : undefined
      const payload = {
        name: form.name, category: form.category, city: form.city, district: form.district,
        address: form.address || undefined,
        googleMapsUrl: form.googleMapsUrl || undefined,
        instagramUrl: ig,
        rating: form.rating ? parseFloat(form.rating) : undefined,
        priceLevel: form.priceLevel ? parseInt(form.priceLevel) : undefined,
      }
      if (editId) {
        await api.patch(`/api/venues/admin/${editId}`, payload)
      } else {
        await api.post('/api/venues/admin', payload)
      }
      cancelForm()
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Hata')
    } finally { setSaving(false) }
  }

  async function toggleActive(v: Venue) {
    await api.patch(`/api/venues/admin/${v.id}`, { isActive: !v.isActive })
    setVenues(prev => prev.map(x => x.id === v.id ? { ...x, isActive: !v.isActive } : x))
  }

  async function confirmDelete() {
    if (!deleteId) return
    await api.delete(`/api/venues/admin/${deleteId}`)
    setDeleteId(null)
    await load()
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: 'Syne, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #2A2A2A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#00F680' }}>Admin Panel</h1>
        <Link to="/dashboard" style={{ color: '#999', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</Link>
      </header>

      <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A' }}>
        <button onClick={() => setTab('venues')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'venues' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'venues' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          📍 Mekanlar
        </button>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Form */}
        <div style={{ marginBottom: '24px' }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              + Yeni Mekan Ekle
            </button>
          ) : (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>{editId ? '✏️ Mekanı Düzenle' : '+ Yeni Mekan'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">İsim *</label>
                  <input className="input" value={form.name} onChange={f('name')} placeholder="Manda Cafe" />
                </div>
                <div>
                  <label className="label">Kategori *</label>
                  <select className="input" value={form.category} onChange={f('category')} style={{ cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Fiyat Seviyesi</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {[1,2,3].map(n => (
                      <button key={n} onClick={() => setForm(p => ({ ...p, priceLevel: String(n) }))}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${form.priceLevel === String(n) ? '#00F680' : '#2A2A2A'}`, background: form.priceLevel === String(n) ? '#00F68018' : '#1A1A1A', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit' }}>
                        {'₺'.repeat(n)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Şehir *</label>
                  <input className="input" value={form.city} onChange={f('city')} placeholder="İstanbul" />
                </div>
                <div>
                  <label className="label">İlçe *</label>
                  <input className="input" value={form.district} onChange={f('district')} placeholder="Kadıköy" />
                </div>
                <div>
                  <label className="label">Rating (1-5)</label>
                  <input className="input" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={f('rating')} placeholder="4.5" />
                </div>
                <div>
                  <label className="label">Adres</label>
                  <input className="input" value={form.address} onChange={f('address')} placeholder="Moda Cad. No:1" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Google Maps URL</label>
                  <input className="input" value={form.googleMapsUrl} onChange={f('googleMapsUrl')} placeholder="https://maps.google.com/..." />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Instagram (@kullanıcıadı veya tam URL)</label>
                  <input className="input" value={form.instagramUrl} onChange={f('instagramUrl')} placeholder="@mandacafe" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={save} disabled={saving || !form.name || !form.city || !form.district} className="btn-primary" style={{ padding: '10px 24px' }}>
                  {saving ? 'Kaydediliyor…' : editId ? '💾 Güncelle' : '💾 Kaydet'}
                </button>
                <button onClick={cancelForm} className="btn-secondary" style={{ padding: '10px 20px' }}>İptal</button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ color: '#666' }}>Yükleniyor…</p>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2A2A2A' }}>
                    {['İsim','Kategori','Şehir','İlçe','Rating','Fiyat','IG','Maps','Aktif',''].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#666', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venues.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #1A1A1A', opacity: v.isActive ? 1 : 0.4 }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.name}</td>
                      <td style={{ padding: '10px 12px' }}>{CAT_EMOJI[v.category]} {v.category}</td>
                      <td style={{ padding: '10px 12px' }}>{v.city}</td>
                      <td style={{ padding: '10px 12px' }}>{v.district}</td>
                      <td style={{ padding: '10px 12px' }}>{v.rating ? `★ ${v.rating}` : '—'}</td>
                      <td style={{ padding: '10px 12px' }}>{v.priceLevel ? PRICE_LABEL[v.priceLevel] : '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {v.instagramUrl ? <a href={v.instagramUrl} target="_blank" rel="noreferrer" style={{ color: '#F472B6' }}>@</a> : <span style={{ color: '#444' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {v.googleMapsUrl ? <a href={v.googleMapsUrl} target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>🗺️</a> : <span style={{ color: '#444' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => toggleActive(v)}
                          style={{ width: '36px', height: '20px', borderRadius: '9999px', background: v.isActive ? '#00F680' : '#2A2A2A', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                          <span style={{ position: 'absolute', top: '2px', left: v.isActive ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => startEdit(v)} style={{ background: 'none', border: 'none', color: '#00F680', cursor: 'pointer', fontSize: '14px', marginRight: '8px' }}>✏️</button>
                        <button onClick={() => setDeleteId(v.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '32px', maxWidth: '360px', textAlign: 'center' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🗑️</p>
            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Bu mekanı sil?</h3>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>Bu işlem geri alınamaz.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary">İptal</button>
              <button onClick={confirmDelete} style={{ padding: '10px 20px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
