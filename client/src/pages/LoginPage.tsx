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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Tekrar hoş geldin 👋</h1>
        <p style={{ color: '#999', marginBottom: '32px', fontSize: '15px' }}>Hesabına giriş yap</p>

        {error && (
          <div style={{ background: '#3D1515', border: '1px solid #EF4444', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#EF4444', fontSize: '14px' }}>
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

        <p style={{ marginTop: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Hesabın yok mu?{' '}
          <Link to="/register" style={{ color: '#F5C400', textDecoration: 'none', fontWeight: 600 }}>Kayıt ol</Link>
        </p>
      </div>
    </div>
  )
}
