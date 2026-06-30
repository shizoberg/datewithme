import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#0D0D0D' }}>Tekrar hoş geldin 👋</h1>
        <p style={{ color: '#777', marginBottom: '32px', fontSize: '15px' }}>Hesabına giriş yap</p>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#B91C1C', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="sen@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Şifre</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '8px', width: '100%', padding: '14px' }}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#777', fontSize: '14px' }}>
          Hesabın yok mu?{' '}
          <Link to="/register" style={{ color: '#00C060', textDecoration: 'none', fontWeight: 600 }}>Kayıt ol</Link>
        </p>

        <div style={{ marginTop: '32px', borderTop: '1px solid #EEEEEE', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>İşletme misiniz?</p>
          <Link to="/kurumsal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F8F8F8', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '12px 20px', textDecoration: 'none', color: '#0D0D0D', fontSize: '14px', fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            Kurumsal — İşletmeler &amp; Etkinlikler
            <span style={{ color: '#00C060' }}>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
