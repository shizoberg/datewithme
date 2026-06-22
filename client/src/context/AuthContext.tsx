import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from 'react'
import { api } from '../lib/api'

interface User { id: string; name: string; email: string; username: string; avatarId?: string; bio?: string; city?: string; district?: string; photoUrl?: string; personalityTags?: string; onboardingDone?: boolean }
interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; username: string }) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const r = await api.post('/api/auth/login', { email, password })
    if (r.data.token) localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
  }

  async function register(data: { name: string; email: string; password: string; username: string }) {
    const r = await api.post('/api/auth/register', data)
    if (r.data.token) localStorage.setItem('token', r.data.token)
    setUser(r.data.user)
  }

  async function logout() {
    await api.post('/api/auth/logout')
    localStorage.removeItem('token')
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
