import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../lib/api'

interface BusinessLead {
  id: string; businessName: string; contactName: string; email: string
  phone?: string; package: string; message?: string; status: string; createdAt: string
}

interface Influencer {
  id: string; name: string; email?: string; phone?: string; city: string
  instagram?: string; followers?: string; engagement?: string; niche?: string
  bio?: string; avatarColor: string; status: string; source: string; createdAt: string
}

interface GuideEntry {
  id: string; title: string; slug: string; coverImage?: string; content: string
  city?: string; venueName?: string; status: string; authorId?: string
  author?: { id: string; name: string; avatarColor: string } | null
  publishedAt?: string; createdAt: string
}

const INFLUENCER_EMPTY_FORM = { name: '', city: '', instagram: '', followers: '', engagement: '', niche: '', email: '', phone: '', bio: '' }
const GUIDE_EMPTY_FORM = { title: '', content: '', city: '', venueName: '', coverImage: '', authorId: '' }

interface Venue {
  id: string; name: string; category: string; city: string; district: string
  address?: string; googleMapsUrl?: string; instagramUrl?: string
  rating?: number; priceLevel?: number; isActive: boolean; createdAt: string
  isFeatured?: boolean; featuredBy?: string
}

const GOOGLE_IMPORT_EMPTY = { placeId: '', city: '', district: '', category: 'cafe' }

interface Submission {
  id: string; name: string; category: string; city: string; district: string
  address?: string; googleMapsUrl?: string; instagramUrl?: string
  rating?: number; priceLevel?: number; description?: string
  submitterName?: string; submitterEmail?: string
  status: string; adminNote?: string; createdAt: string
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
  // Auth state — all hooks must come first, before any conditional returns
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem('admin_token')
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Venues state
  const [tab, setTab] = useState<'venues' | 'submissions' | 'triplists' | 'leads' | 'influencers' | 'guide'>('venues')
  const [leads, setLeads] = useState<BusinessLead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [influencersLoading, setInfluencersLoading] = useState(false)
  const [showInfForm, setShowInfForm] = useState(false)
  const [infForm, setInfForm] = useState({ ...INFLUENCER_EMPTY_FORM })
  const [infSaving, setInfSaving] = useState(false)
  const [guideEntries, setGuideEntries] = useState<GuideEntry[]>([])
  const [guideLoading, setGuideLoading] = useState(false)
  const [showGuideForm, setShowGuideForm] = useState(false)
  const [guideForm, setGuideForm] = useState({ ...GUIDE_EMPTY_FORM })
  const [guideSaving, setGuideSaving] = useState(false)
  const [editGuideId, setEditGuideId] = useState<string | null>(null)
  const [triplists, setTriplists] = useState<any[]>([])
  const [triplistLoading, setTriplistLoading] = useState(false)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showGoogleImport, setShowGoogleImport] = useState(false)
  const [googleImportForm, setGoogleImportForm] = useState({ ...GOOGLE_IMPORT_EMPTY })
  const [googleImporting, setGoogleImporting] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Submissions state
  const [subFilter, setSubFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [subLoading, setSubLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [approveModal, setApproveModal] = useState<Submission | null>(null)
  const [rejectModal, setRejectModal] = useState<Submission | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const r = await adminApi.get('/api/venues/admin')
      setVenues(r.data.venues)
    } catch (err: any) {
      if (err?.response?.status === 401) { localStorage.removeItem('admin_token'); setAdminToken(null) }
      else alert('Yüklenemedi')
    } finally { setLoading(false) }
  }

  async function loadSubmissions(status = subFilter) {
    setSubLoading(true)
    try {
      const r = await adminApi.get(`/api/admin/venue-submissions/admin?status=${status}`)
      setSubmissions(r.data.submissions)
      setPendingCount(r.data.pendingCount)
    } catch (err: any) {
      if (err?.response?.status === 401) { localStorage.removeItem('admin_token'); setAdminToken(null) }
    } finally { setSubLoading(false) }
  }

  useEffect(() => { if (adminToken) load() }, [adminToken])
  useEffect(() => { if (adminToken && tab === 'submissions') loadSubmissions() }, [tab, subFilter, adminToken])
  useEffect(() => {
    if (adminToken && tab === 'leads') {
      setLeadsLoading(true)
      adminApi.get('/api/leads').then(r => setLeads(r.data)).catch(() => {}).finally(() => setLeadsLoading(false))
    }
  }, [tab, adminToken])
  useEffect(() => {
    if (adminToken && tab === 'triplists') {
      setTriplistLoading(true)
      adminApi.get('/api/triplists/public').then(r => setTriplists(r.data)).catch(() => {}).finally(() => setTriplistLoading(false))
    }
  }, [tab, adminToken])
  function loadInfluencers() {
    setInfluencersLoading(true)
    adminApi.get('/api/influencers?status=all').then(r => setInfluencers(r.data)).catch(() => {}).finally(() => setInfluencersLoading(false))
  }
  useEffect(() => { if (adminToken && tab === 'influencers') loadInfluencers() }, [tab, adminToken])

  function loadGuideEntries() {
    setGuideLoading(true)
    adminApi.get('/api/guide?status=all').then(r => setGuideEntries(r.data)).catch(() => {}).finally(() => setGuideLoading(false))
  }
  useEffect(() => { if (adminToken && tab === 'guide') loadGuideEntries() }, [tab, adminToken])
  useEffect(() => { if (adminToken && tab === 'guide' && influencers.length === 0) loadInfluencers() }, [tab, adminToken])

  async function saveInfluencer() {
    setInfSaving(true)
    try {
      await adminApi.post('/api/influencers', infForm)
      setShowInfForm(false)
      setInfForm({ ...INFLUENCER_EMPTY_FORM })
      loadInfluencers()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Hata')
    } finally { setInfSaving(false) }
  }

  async function approveInfluencer(id: string) {
    await adminApi.patch(`/api/influencers/${id}`, { status: 'approved' })
    setInfluencers(prev => prev.map(i => i.id === id ? { ...i, status: 'approved' } : i))
  }

  async function deleteInfluencer(id: string) {
    await adminApi.delete(`/api/influencers/${id}`)
    setInfluencers(prev => prev.filter(i => i.id !== id))
  }

  async function saveGuideEntry() {
    setGuideSaving(true)
    try {
      const payload = { ...guideForm, authorId: guideForm.authorId || undefined }
      if (editGuideId) {
        await adminApi.patch(`/api/guide/${editGuideId}`, payload)
      } else {
        await adminApi.post('/api/guide', { ...payload, status: 'draft' })
      }
      setShowGuideForm(false)
      setEditGuideId(null)
      setGuideForm({ ...GUIDE_EMPTY_FORM })
      loadGuideEntries()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Hata')
    } finally { setGuideSaving(false) }
  }

  function startEditGuide(g: GuideEntry) {
    setGuideForm({
      title: g.title, content: g.content, city: g.city || '',
      venueName: g.venueName || '', coverImage: g.coverImage || '',
      authorId: g.authorId || '',
    })
    setEditGuideId(g.id)
    setShowGuideForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function publishGuideEntry(id: string) {
    await adminApi.patch(`/api/guide/${id}`, { status: 'published' })
    loadGuideEntries()
  }

  async function deleteGuideEntry(id: string) {
    await adminApi.delete(`/api/guide/${id}`)
    setGuideEntries(prev => prev.filter(e => e.id !== id))
  }

  // Auto-refresh pending count every 30s
  useEffect(() => {
    if (!adminToken) return
    const t = setInterval(() => {
      adminApi.get('/api/admin/venue-submissions/admin?status=pending')
        .then(r => setPendingCount(r.data.pendingCount))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [adminToken])

  const handleLogin = async () => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const base = import.meta.env.VITE_API_URL || ''
      const res = await fetch(`${base}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Hatalı şifre')
      localStorage.setItem('admin_token', data.token)
      setAdminToken(data.token)
    } catch (err: any) {
      setLoginError(err.message || 'Hatalı şifre')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setAdminToken(null)
  }

  if (!adminToken) {
    return (
      <div style={{ background: '#0D0D0D', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '360px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Admin Paneli</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>getdatewith.me yönetim paneli</div>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Kullanıcı adı"
            autoFocus
            autoComplete="username"
            style={{
              width: '100%', background: '#111', border: `1px solid ${loginError ? '#ff4444' : '#2A2A2A'}`,
              borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '14px',
              marginBottom: '10px', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Raleway, sans-serif',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Şifre"
            autoComplete="current-password"
            style={{
              width: '100%', background: '#111', border: `1px solid ${loginError ? '#ff4444' : '#2A2A2A'}`,
              borderRadius: '10px', padding: '12px 14px', color: '#fff', fontSize: '14px',
              marginBottom: '12px', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Raleway, sans-serif',
            }}
          />
          {loginError && (
            <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>{loginError}</div>
          )}
          <button
            onClick={handleLogin}
            disabled={loginLoading || !password || !username}
            style={{
              width: '100%', background: '#00F680', color: '#0D0D0D', border: 'none',
              borderRadius: '100px', padding: '13px', fontSize: '14px', fontWeight: 700,
              cursor: loginLoading || !password || !username ? 'not-allowed' : 'pointer',
              opacity: loginLoading || !password || !username ? 0.6 : 1, fontFamily: 'Raleway, sans-serif',
            }}
          >
            {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
          </button>
        </div>
      </div>
    )
  }

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
        await adminApi.patch(`/api/venues/admin/${editId}`, payload)
      } else {
        await adminApi.post('/api/venues/admin', payload)
      }
      cancelForm()
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Hata')
    } finally { setSaving(false) }
  }

  async function importFromGoogle() {
    if (!googleImportForm.placeId || !googleImportForm.city || !googleImportForm.category) {
      alert('Place ID, şehir ve kategori zorunlu'); return
    }
    setGoogleImporting(true)
    try {
      const r = await adminApi.post('/api/venues/admin/import-google', googleImportForm)
      alert(`✓ "${r.data.venue.name}" başarıyla eklendi!`)
      setShowGoogleImport(false)
      setGoogleImportForm({ ...GOOGLE_IMPORT_EMPTY })
      await load()
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Hata'
      alert(msg === 'Bu mekan zaten DB\'de var' ? '⚠️ Bu mekan zaten veritabanında var.' : `Hata: ${msg}`)
    } finally { setGoogleImporting(false) }
  }

  async function toggleFeatured(v: Venue) {
    if (v.isFeatured) {
      await adminApi.patch(`/api/venues/admin/${v.id}/featured`, { isFeatured: false })
      setVenues(prev => prev.map(x => x.id === v.id ? { ...x, isFeatured: false, featuredBy: undefined } : x))
    } else {
      await adminApi.patch(`/api/venues/admin/${v.id}/featured`, { isFeatured: true, featuredBy: 'admin' })
      setVenues(prev => prev.map(x => x.id === v.id ? { ...x, isFeatured: true, featuredBy: 'admin' } : x))
    }
  }

  async function toggleActive(v: Venue) {
    await adminApi.patch(`/api/venues/admin/${v.id}`, { isActive: !v.isActive })
    setVenues(prev => prev.map(x => x.id === v.id ? { ...x, isActive: !v.isActive } : x))
  }

  async function confirmDelete() {
    if (!deleteId) return
    await adminApi.delete(`/api/venues/admin/${deleteId}`)
    setDeleteId(null)
    await load()
  }

  async function approveSubmission() {
    if (!approveModal) return
    setActionLoading(true)
    try {
      await adminApi.patch(`/api/admin/venue-submissions/admin/${approveModal.id}/approve`)
      setSubmissions(prev => prev.filter(s => s.id !== approveModal.id))
      setPendingCount(p => Math.max(0, p - 1))
      setApproveModal(null)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Hata')
    } finally { setActionLoading(false) }
  }

  async function rejectSubmission() {
    if (!rejectModal) return
    setActionLoading(true)
    try {
      await adminApi.patch(`/api/admin/venue-submissions/admin/${rejectModal.id}/reject`, { adminNote: rejectNote })
      setSubmissions(prev => prev.filter(s => s.id !== rejectModal.id))
      setPendingCount(p => Math.max(0, p - 1))
      setRejectModal(null)
      setRejectNote('')
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Hata')
    } finally { setActionLoading(false) }
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#fff', fontFamily: 'Syne, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #2A2A2A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#00F680' }}>Admin Panel</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/dashboard" style={{ color: '#999', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #2A2A2A', borderRadius: '100px', padding: '6px 14px', color: '#666', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Çıkış</button>
        </div>
      </header>

      <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A' }}>
        <button onClick={() => setTab('venues')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'venues' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'venues' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          📍 Mekanlar
        </button>
        <button onClick={() => setTab('submissions')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'submissions' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'submissions' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          📬 Mekan Önerileri {pendingCount > 0 && <span style={{ background: '#00F680', color: '#000', borderRadius: '9999px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' }}>{pendingCount}</span>}
        </button>
        <button onClick={() => setTab('triplists')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'triplists' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'triplists' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          🗺️ Triplistler
        </button>
        <button onClick={() => setTab('leads')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'leads' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'leads' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          💼 Başvurular {leads.length > 0 && <span style={{ background: '#00F680', color: '#000', borderRadius: '9999px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' }}>{leads.length}</span>}
        </button>
        <button onClick={() => setTab('influencers')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'influencers' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'influencers' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          ⭐ Influencerlar {influencers.filter(i => i.status === 'pending').length > 0 && <span style={{ background: '#00F680', color: '#000', borderRadius: '9999px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' }}>{influencers.filter(i => i.status === 'pending').length}</span>}
        </button>
        <button onClick={() => setTab('guide')}
          style={{ padding: '12px 24px', background: 'none', border: 'none', color: tab === 'guide' ? '#00F680' : '#666', fontWeight: 700, cursor: 'pointer', borderBottom: tab === 'guide' ? '2px solid #00F680' : '2px solid transparent', fontSize: '14px', fontFamily: 'inherit' }}>
          📝 Rehber
        </button>
      </div>

      {/* ── VENUES TAB ── */}
      {tab === 'venues' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '24px' }}>
            {!showForm && !showGoogleImport && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => { setShowGoogleImport(true); setShowForm(false) }} style={{ padding: '10px 20px', fontSize: '14px', background: '#EA4335', color: '#fff', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔴 Google'dan Çek
                </button>
                <button onClick={() => { setShowForm(true); setShowGoogleImport(false) }} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                  + Manuel Ekle
                </button>
              </div>
            )}
            {showGoogleImport && (
              <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🔴 Google Places'tan Mekan Çek</h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>Google Maps URL'inden Place ID'yi al: URL'deki <code style={{ color: '#00F680' }}>ChIJ...</code> kısmını kopyala.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label className="label">Google Place ID *</label>
                    <input className="input" value={googleImportForm.placeId} onChange={e => setGoogleImportForm(p => ({ ...p, placeId: e.target.value }))} placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" />
                  </div>
                  <div>
                    <label className="label">Şehir *</label>
                    <select className="input" value={googleImportForm.city} onChange={e => setGoogleImportForm(p => ({ ...p, city: e.target.value }))} style={{ cursor: 'pointer' }}>
                      <option value="">Seç…</option>
                      <option>İstanbul</option><option>İzmir</option><option>Ankara</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">İlçe</label>
                    <input className="input" value={googleImportForm.district} onChange={e => setGoogleImportForm(p => ({ ...p, district: e.target.value }))} placeholder="Kadıköy" />
                  </div>
                  <div>
                    <label className="label">Kategori *</label>
                    <select className="input" value={googleImportForm.category} onChange={e => setGoogleImportForm(p => ({ ...p, category: e.target.value }))} style={{ cursor: 'pointer' }}>
                      {['cafe','restaurant','bar','park','rooftop','cultural','koy','doga','antik'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={importFromGoogle} disabled={googleImporting} className="btn-primary" style={{ padding: '10px 24px' }}>
                    {googleImporting ? 'Çekiliyor…' : '🔴 Çek ve Ekle'}
                  </button>
                  <button onClick={() => { setShowGoogleImport(false); setGoogleImportForm({ ...GOOGLE_IMPORT_EMPTY }) }} className="btn-secondary" style={{ padding: '10px 20px' }}>İptal</button>
                </div>
              </div>
            )}
            {showForm && (
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
                          <button onClick={() => toggleFeatured(v)} title={v.isFeatured ? 'Öne çıkmayı kaldır' : 'Öne çıkar (admin)'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', marginRight: '4px', opacity: v.isFeatured ? 1 : 0.3 }}>
                            {v.isFeatured && v.featuredBy === 'admin' ? '🌟' : v.isFeatured ? '⭐' : '☆'}
                          </button>
                          <button onClick={() => startEdit(v)} style={{ background: 'none', border: 'none', color: '#00F680', cursor: 'pointer', fontSize: '14px', marginRight: '4px' }}>✏️</button>
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
      )}

      {/* ── TRIPLİSTLER TAB ── */}
      {tab === 'triplists' && (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '16px', color: '#555', fontSize: '13px' }}>{triplists.length} public triplist</div>
          {triplistLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Yükleniyor…</div>
          ) : triplists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Henüz public triplist yok.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {triplists.map((t: any) => (
                <div key={t.id} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '14px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{t.title}</div>
                      <div style={{ fontSize: '12px', color: '#555' }}>
                        📍 {t.city}{t.district ? `, ${t.district}` : ''} · 👤 @{t.user?.username} · 👁 {t.viewCount} · {t.stops?.length} durak
                      </div>
                      {t.startDate && (
                        <div style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>
                          📅 {new Date(t.startDate).toLocaleDateString('tr-TR')} {t.endDate ? `→ ${new Date(t.endDate).toLocaleDateString('tr-TR')}` : ''}
                        </div>
                      )}
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {t.stops?.map((s: any, i: number) => (
                          <span key={s.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', color: '#888' }}>
                            {i + 1}. {s.venueName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a href={`/${t.user?.username}/triplist/${t.slug}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: '12px', color: '#00F680', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Görüntüle →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSIONS TAB ── */}
      {tab === 'submissions' && (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {(['pending', 'approved', 'rejected'] as const).map(s => (
              <button key={s} onClick={() => setSubFilter(s)}
                style={{ padding: '8px 18px', borderRadius: '9999px', border: `1.5px solid ${subFilter === s ? '#00F680' : '#2A2A2A'}`, background: subFilter === s ? '#00F68018' : 'transparent', color: subFilter === s ? '#00F680' : '#666', cursor: 'pointer', fontWeight: 700, fontSize: '13px', fontFamily: 'inherit' }}>
                {s === 'pending' ? `Bekleyenler${pendingCount > 0 ? ` (${pendingCount})` : ''}` : s === 'approved' ? 'Onaylananlar' : 'Reddedilenler'}
              </button>
            ))}
          </div>

          {subLoading ? (
            <p style={{ color: '#666' }}>Yükleniyor…</p>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#444' }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
              <p>Bu kategoride öneri yok.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {submissions.map(s => (
                <div key={s.id} className="card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px' }}>{CAT_EMOJI[s.category] ?? '📍'}</span>
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>{s.name}</span>
                        <span style={{ fontSize: '11px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '4px', padding: '1px 6px', color: '#888' }}>{s.category}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                        📍 {s.city}, {s.district}{s.address ? ` · ${s.address}` : ''}
                      </p>
                      {s.description && (
                        <p style={{ fontSize: '12px', color: '#555', marginBottom: '4px', maxWidth: '480px' }}>"{s.description}"</p>
                      )}
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#555', flexWrap: 'wrap' }}>
                        {s.rating && <span>★ {s.rating}</span>}
                        {s.priceLevel && <span>{PRICE_LABEL[s.priceLevel]}</span>}
                        {s.googleMapsUrl && <a href={s.googleMapsUrl} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', textDecoration: 'none' }}>🗺️ Harita</a>}
                        {s.instagramUrl && <a href={s.instagramUrl.startsWith('http') ? s.instagramUrl : `https://instagram.com/${s.instagramUrl.replace(/^@/, '')}`} target="_blank" rel="noreferrer" style={{ color: '#F472B6', textDecoration: 'none' }}>@ Instagram</a>}
                      </div>
                      {s.submitterName && (
                        <p style={{ fontSize: '12px', color: '#444', marginTop: '6px' }}>
                          Öneren: {s.submitterName}{s.submitterEmail ? ` · ${s.submitterEmail}` : ''}
                        </p>
                      )}
                      {s.adminNote && (
                        <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>Red notu: {s.adminNote}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                      <p style={{ fontSize: '11px', color: '#444' }}>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</p>
                      {subFilter === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setApproveModal(s)}
                            style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: '#00F680', color: '#000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            ✓ Onayla
                          </button>
                          <button onClick={() => { setRejectModal(s); setRejectNote('') }}
                            style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #EF444440', background: 'transparent', color: '#EF4444', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            ✗ Reddet
                          </button>
                        </div>
                      )}
                      {subFilter !== 'pending' && (
                        <span style={{ fontSize: '12px', color: subFilter === 'approved' ? '#00F680' : '#EF4444', fontWeight: 700 }}>
                          {subFilter === 'approved' ? '✓ Onaylandı' : '✗ Reddedildi'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BAŞVURULAR TAB ── */}
      {tab === 'leads' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '16px', color: '#555', fontSize: '13px' }}>{leads.length} başvuru</div>
          {leadsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Yükleniyor…</div>
          ) : leads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <div>Henüz başvuru yok.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leads.map(l => (
                <div key={l.id} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{l.businessName}</div>
                        <span style={{ background: l.package === 'triplist' ? '#00F68018' : '#7C3AED20', border: `1px solid ${l.package === 'triplist' ? '#00F68040' : '#7C3AED40'}`, borderRadius: '6px', padding: '2px 10px', fontSize: '11px', color: l.package === 'triplist' ? '#00F680' : '#A78BFA', fontWeight: 700 }}>
                          {l.package === 'triplist' ? 'Triplist Öne Çıkma' : 'Influencer İşbirliği'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>
                        👤 {l.contactName} · 📧 <a href={`mailto:${l.email}`} style={{ color: '#60A5FA', textDecoration: 'none' }}>{l.email}</a>
                        {l.phone && <> · 📞 {l.phone}</>}
                      </div>
                      {l.message && (
                        <div style={{ marginTop: '10px', fontSize: '13px', color: '#666', background: '#1A1A1A', borderRadius: '8px', padding: '10px 14px', lineHeight: 1.5 }}>
                          "{l.message}"
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#444' }}>{new Date(l.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div style={{ marginTop: '8px' }}>
                        <a href={`mailto:${l.email}?subject=getdatewith.me Kurumsal Başvurunuz`}
                          style={{ padding: '7px 14px', borderRadius: '8px', background: '#00F680', color: '#000', fontWeight: 700, fontSize: '12px', textDecoration: 'none', display: 'inline-block' }}>
                          Yanıtla →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INFLUENCERLAR TAB ── */}
      {tab === 'influencers' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#555', fontSize: '13px' }}>{influencers.length} influencer</div>
            {!showInfForm && (
              <button onClick={() => setShowInfForm(true)} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>+ Influencer Ekle</button>
            )}
          </div>

          {showInfForm && (
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>+ Yeni Influencer</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="label">İsim *</label><input className="input" value={infForm.name} onChange={e => setInfForm(p => ({ ...p, name: e.target.value }))} placeholder="Ayşe K." /></div>
                <div><label className="label">Şehir *</label><input className="input" value={infForm.city} onChange={e => setInfForm(p => ({ ...p, city: e.target.value }))} placeholder="İstanbul" /></div>
                <div><label className="label">Instagram</label><input className="input" value={infForm.instagram} onChange={e => setInfForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@kullaniciadi" /></div>
                <div><label className="label">Niş</label><input className="input" value={infForm.niche} onChange={e => setInfForm(p => ({ ...p, niche: e.target.value }))} placeholder="Yemek & Kafe" /></div>
                <div><label className="label">Takipçi</label><input className="input" value={infForm.followers} onChange={e => setInfForm(p => ({ ...p, followers: e.target.value }))} placeholder="24K" /></div>
                <div><label className="label">Etkileşim</label><input className="input" value={infForm.engagement} onChange={e => setInfForm(p => ({ ...p, engagement: e.target.value }))} placeholder="%8.2" /></div>
                <div><label className="label">E-posta</label><input className="input" value={infForm.email} onChange={e => setInfForm(p => ({ ...p, email: e.target.value }))} placeholder="mail@ornek.com" /></div>
                <div><label className="label">Telefon</label><input className="input" value={infForm.phone} onChange={e => setInfForm(p => ({ ...p, phone: e.target.value }))} placeholder="05XX XXX XX XX" /></div>
                <div style={{ gridColumn: '1/-1' }}><label className="label">Bio</label><input className="input" value={infForm.bio} onChange={e => setInfForm(p => ({ ...p, bio: e.target.value }))} /></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={saveInfluencer} disabled={infSaving || !infForm.name || !infForm.city} className="btn-primary" style={{ padding: '10px 24px' }}>{infSaving ? 'Kaydediliyor…' : '💾 Kaydet'}</button>
                <button onClick={() => { setShowInfForm(false); setInfForm({ ...INFLUENCER_EMPTY_FORM }) }} className="btn-secondary" style={{ padding: '10px 20px' }}>İptal</button>
              </div>
            </div>
          )}

          {influencersLoading ? (
            <p style={{ color: '#666' }}>Yükleniyor…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {influencers.map(inf => (
                <div key={inf.id} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '14px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: inf.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>{inf.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{inf.name}</div>
                      {inf.status === 'pending' && <span style={{ fontSize: '10px', background: '#F59E0B20', color: '#F59E0B', borderRadius: '6px', padding: '1px 6px', fontWeight: 700 }}>BEKLİYOR</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>📍 {inf.city}{inf.instagram ? ` · ${inf.instagram}` : ''}</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {inf.followers && <span style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '100px', padding: '2px 9px', fontSize: '11px', color: '#888', fontWeight: 600 }}>{inf.followers} takipçi</span>}
                      {inf.engagement && <span style={{ background: '#00F68012', border: '1px solid #00F68030', borderRadius: '100px', padding: '2px 9px', fontSize: '11px', color: '#00F680', fontWeight: 600 }}>{inf.engagement}</span>}
                    </div>
                    {inf.niche && <div style={{ marginTop: '6px', fontSize: '12px', color: '#555' }}>{inf.niche}</div>}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      {inf.status === 'pending' && (
                        <button onClick={() => approveInfluencer(inf.id)} style={{ background: 'none', border: 'none', color: '#00F680', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit' }}>✓ Onayla</button>
                      )}
                      <button onClick={() => deleteInfluencer(inf.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>🗑️ Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REHBER TAB ── */}
      {tab === 'guide' && (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#555', fontSize: '13px' }}>{guideEntries.length} yazı</div>
            {!showGuideForm && (
              <button onClick={() => setShowGuideForm(true)} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>+ Yazı Ekle</button>
            )}
          </div>

          {showGuideForm && (
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>{editGuideId ? '✏️ Yazıyı Düzenle' : '+ Yeni Rehber Yazısı'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: '1/-1' }}><label className="label">Başlık *</label><input className="input" value={guideForm.title} onChange={e => setGuideForm(p => ({ ...p, title: e.target.value }))} placeholder="Boyalık Plajı'nda bir gün" /></div>
                <div><label className="label">Şehir</label><input className="input" value={guideForm.city} onChange={e => setGuideForm(p => ({ ...p, city: e.target.value }))} placeholder="İzmir" /></div>
                <div><label className="label">Mekan Adı</label><input className="input" value={guideForm.venueName} onChange={e => setGuideForm(p => ({ ...p, venueName: e.target.value }))} placeholder="Boyalık Plajı" /></div>
                <div style={{ gridColumn: '1/-1' }}><label className="label">Kapak Görseli URL</label><input className="input" value={guideForm.coverImage} onChange={e => setGuideForm(p => ({ ...p, coverImage: e.target.value }))} placeholder="https://..." /></div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Yazar (Influencer)</label>
                  <select className="input" value={guideForm.authorId} onChange={e => setGuideForm(p => ({ ...p, authorId: e.target.value }))} style={{ cursor: 'pointer' }}>
                    <option value="">— Yazar seçilmedi —</option>
                    {influencers.filter(i => i.status === 'approved').map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">İçerik *</label>
                  <textarea
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #2A2A2A', background: '#111', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '160px', boxSizing: 'border-box' }}
                    value={guideForm.content} onChange={e => setGuideForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Birinci ağızdan deneyimi yaz…"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={saveGuideEntry} disabled={guideSaving || !guideForm.title || !guideForm.content} className="btn-primary" style={{ padding: '10px 24px' }}>{guideSaving ? 'Kaydediliyor…' : editGuideId ? '💾 Güncelle' : '💾 Taslak Kaydet'}</button>
                <button onClick={() => { setShowGuideForm(false); setEditGuideId(null); setGuideForm({ ...GUIDE_EMPTY_FORM }) }} className="btn-secondary" style={{ padding: '10px 20px' }}>İptal</button>
              </div>
            </div>
          )}

          {guideLoading ? (
            <p style={{ color: '#666' }}>Yükleniyor…</p>
          ) : guideEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
              <div>Henüz yazı yok.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {guideEntries.map(g => (
                <div key={g.id} style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: '14px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{g.title}</div>
                        <span style={{ fontSize: '10px', background: g.status === 'published' ? '#00F68020' : '#2A2A2A', color: g.status === 'published' ? '#00F680' : '#888', borderRadius: '6px', padding: '1px 6px', fontWeight: 700 }}>
                          {g.status === 'published' ? 'YAYINDA' : 'TASLAK'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {g.city && `📍 ${g.city}${g.venueName ? ` · ${g.venueName}` : ''}`}
                        {g.author && ` · ✦ ${g.author.name}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => startEditGuide(g)} style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit' }}>✏️ Düzenle</button>
                      {g.status !== 'published' && (
                        <button onClick={() => publishGuideEntry(g.id)} style={{ background: 'none', border: 'none', color: '#00F680', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'inherit' }}>↑ Yayınla</button>
                      )}
                      {g.status === 'published' && (
                        <a href={`/rehber/${g.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#60A5FA', textDecoration: 'none' }}>Görüntüle →</a>
                      )}
                      <button onClick={() => deleteGuideEntry(g.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
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

      {/* Approve confirm modal */}
      {approveModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '32px', maxWidth: '400px', width: '90%' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>✓</p>
            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>{approveModal.name}</h3>
            <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
              Bu mekan Venue tablosuna eklenecek ve kullanıcılara önerilecek.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setApproveModal(null)} className="btn-secondary" style={{ flex: 1 }}>İptal</button>
              <button onClick={approveSubmission} disabled={actionLoading}
                style={{ flex: 2, padding: '10px 20px', background: '#00F680', color: '#000', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {actionLoading ? 'İşleniyor…' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject confirm modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '32px', maxWidth: '400px', width: '90%' }}>
            <p style={{ fontSize: '28px', marginBottom: '12px' }}>✗</p>
            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>{rejectModal.name}</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#888', marginBottom: '6px' }}>Red sebebi (opsiyonel)</label>
              <textarea
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #2A2A2A', background: '#111', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' }}
                placeholder="Sahte içerik, spam, ticari tanıtım..."
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setRejectModal(null)} className="btn-secondary" style={{ flex: 1 }}>İptal</button>
              <button onClick={rejectSubmission} disabled={actionLoading}
                style={{ flex: 2, padding: '10px 20px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {actionLoading ? 'İşleniyor…' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
