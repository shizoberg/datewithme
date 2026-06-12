import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    if (field === 'username') value = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Hesap oluştur ✨</h1>
        <p style={{ color: '#999', marginBottom: '32px', fontSize: '15px' }}>Ücretsiz, 30 saniyede hazır</p>

        {error && (
          <div style={{ background: '#3D1515', border: '1px solid #EF4444', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#EF4444', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Adın</label>
            <input className="input" placeholder="Berk" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="sen@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="label">Kullanıcı adı</label>
            <input className="input" placeholder="berk123" value={form.username} onChange={e => set('username', e.target.value)} required />
            {form.username && (
              <p style={{ marginTop: '6px', fontSize: '13px', color: '#F5C400' }}>
                getdatewith.me/{form.username}
              </p>
            )}
          </div>
          <div>
            <label className="label">Şifre</label>
            <input className="input" type="password" placeholder="En az 6 karakter" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%', padding: '14px' }}>
            {loading ? 'Kaydediliyor…' : 'Kayıt Ol 🚀'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Hesabın var mı?{' '}
          <Link to="/login" style={{ color: '#F5C400', textDecoration: 'none', fontWeight: 600 }}>Giriş yap</Link>
        </p>
      </div>
    </div>
  )
}
