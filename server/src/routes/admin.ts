import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { adminAuth } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// POST /api/admin/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  const adminUser = process.env.ADMIN_USERNAME || 'krebsatka'
  if (!username || !password || username !== adminUser || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ message: 'Hatalı kullanıcı adı veya şifre' })
    return
  }
  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )
  res.json({ token })
})

// GET /api/admin/users — tüm kullanıcılar
router.get('/users', adminAuth, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true, city: true, role: true, influencerId: true, onboardingDone: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch {
    res.status(500).json({ error: 'DB hatası' })
  }
})

// POST /api/admin/users/:id/make-influencer — kullanıcıyı influencer yap
router.post('/users/:id/make-influencer', adminAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, city: true, role: true, influencerId: true },
    })
    if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }

    if (user.role === 'influencer' && user.influencerId) {
      // Zaten influencer — influencer kaydını döndür
      res.json({ ok: true, influencerId: user.influencerId })
      return
    }

    const AVATAR_COLORS = ['#00C060', '#4A90E2', '#D46080', '#F59E0B', '#8B5CF6', '#06B6D4']
    const influencer = await prisma.influencer.create({
      data: {
        name: user.name,
        email: user.email,
        city: user.city || '',
        status: 'approved',
        source: 'admin',
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'influencer', influencerId: influencer.id },
    })

    res.json({ ok: true, influencerId: influencer.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'İşlem başarısız' })
  }
})

// PATCH /api/admin/leads/:id — kurumsal profili güncelle
router.patch('/leads/:id', adminAuth, async (req: Request, res: Response) => {
  try {
    const lead = await prisma.businessLead.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(lead)
  } catch {
    res.status(404).json({ error: 'Bulunamadı' })
  }
})

// GET /api/admin/users/export — kullanıcı emaillerini CSV olarak döndür
router.get('/users/export', adminAuth, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    const csv = [
      'id,name,email,username,createdAt',
      ...users.map(u => `"${u.id}","${u.name}","${u.email}","${u.username}","${u.createdAt.toISOString()}"`)
    ].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"')
    res.send(csv)
  } catch (e) {
    res.status(500).json({ error: 'DB hatası' })
  }
})

export default router
