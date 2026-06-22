import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { bio, city, district, photoUrl, personalityTags, onboardingDone } = req.body
  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(personalityTags !== undefined && { personalityTags }),
        ...(onboardingDone !== undefined && { onboardingDone }),
      },
      select: { id: true, name: true, email: true, username: true, bio: true, city: true, district: true, photoUrl: true, personalityTags: true, onboardingDone: true },
    })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Profil güncellenemedi' })
  }
})

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, name: true, email: true, username: true, bio: true, city: true, district: true, photoUrl: true, personalityTags: true, onboardingDone: true },
    })
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Kullanıcı bulunamadı' })
  }
})

router.get('/:username', async (req, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true, name: true, username: true, bio: true, city: true, district: true, photoUrl: true, personalityTags: true },
    })
    if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }
    res.json({ user })
  } catch {
    res.status(500).json({ error: 'Sunucu hatası' })
  }
})

export default router
