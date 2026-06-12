import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const isProd = process.env.NODE_ENV === 'production'

function setToken(res: Response, userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' })
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const schema = z.object({
    name:     z.string().min(1).max(50),
    email:    z.string().email(),
    password: z.string().min(6),
    username: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/, 'Sadece küçük harf, rakam ve tire'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz giriş' })
    return
  }
  const { name, email, password, username } = parsed.data

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })
  if (exists) {
    res.status(409).json({ error: exists.email === email ? 'Bu email zaten kayıtlı' : 'Bu username alınmış' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, password: hashed, username } })

  setToken(res, user.id)
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, username: user.username } })
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const schema = z.object({
    email:    z.string().email(),
    password: z.string().min(1),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Email veya şifre hatalı' })
    return
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user) { res.status(401).json({ error: 'Email veya şifre hatalı' }); return }

  const valid = await bcrypt.compare(parsed.data.password, user.password)
  if (!valid) { res.status(401).json({ error: 'Email veya şifre hatalı' }); return }

  setToken(res, user.id)
  res.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username } })
})

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token', { path: '/', sameSite: isProd ? 'none' : 'lax', secure: isProd })
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) { res.status(401).json({ error: 'Kullanıcı bulunamadı' }); return }
  res.json({ user: { id: user.id, name: user.name, email: user.email, username: user.username } })
})

export default router
