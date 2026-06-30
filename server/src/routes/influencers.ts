import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { adminAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const AVATAR_COLORS = ['#00C060', '#4A90E2', '#D46080', '#F59E0B', '#8B5CF6', '#06B6D4']

// GET /api/influencers — onaylanmış influencerları herkese aç (Kurumsal sayfa için)
router.get('/', async (req: Request, res: Response) => {
  const status = (req.query.status as string) || 'approved'
  try {
    const influencers = await prisma.influencer.findMany({
      where: status === 'all' ? {} : { status },
      orderBy: { createdAt: 'desc' },
    })
    res.json(influencers)
  } catch {
    res.status(500).json({ error: 'DB hatası' })
  }
})

// POST /api/influencers/basvuru — influencer kendi başvurusunu yapar (status: pending)
router.post('/basvuru', async (req: Request, res: Response) => {
  const { name, email, phone, city, instagram, followers, niche, bio } = req.body
  if (!name || !city || !instagram) {
    res.status(400).json({ error: 'İsim, şehir ve Instagram zorunlu' })
    return
  }
  try {
    const influencer = await prisma.influencer.create({
      data: {
        name, email: email || null, phone: phone || null, city,
        instagram, followers: followers || null, niche: niche || null,
        bio: bio || null, status: 'pending', source: 'self',
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      },
    })
    res.json({ ok: true, id: influencer.id })
  } catch {
    res.status(500).json({ error: 'Kayıt başarısız' })
  }
})

// POST /api/influencers — admin manuel influencer ekler (status: approved)
router.post('/', adminAuth, async (req: AuthRequest, res: Response) => {
  const { name, email, phone, city, instagram, followers, engagement, niche, bio, avatarColor } = req.body
  if (!name || !city) {
    res.status(400).json({ error: 'İsim ve şehir zorunlu' })
    return
  }
  try {
    const influencer = await prisma.influencer.create({
      data: {
        name, email: email || null, phone: phone || null, city,
        instagram: instagram || null, followers: followers || null,
        engagement: engagement || null, niche: niche || null, bio: bio || null,
        avatarColor: avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        status: 'approved', source: 'admin',
      },
    })
    res.json(influencer)
  } catch {
    res.status(500).json({ error: 'Kayıt başarısız' })
  }
})

// PATCH /api/influencers/:id — admin durum/bilgi günceller
router.patch('/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await prisma.influencer.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(influencer)
  } catch {
    res.status(404).json({ error: 'Bulunamadı' })
  }
})

// DELETE /api/influencers/:id
router.delete('/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.influencer.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Bulunamadı' })
  }
})

export default router
