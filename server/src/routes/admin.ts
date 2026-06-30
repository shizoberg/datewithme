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
