import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

function toSlug(name: string): string {
  return name.toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const VENUE_SELECT = {
  id: true, name: true, category: true, city: true, district: true,
  address: true, googleMapsUrl: true, instagramUrl: true, rating: true, priceLevel: true,
}

// GET /api/gno — list mine
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const cards = await prisma.gNOCard.findMany({
    where: { userId: req.userId },
    include: { votes: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ cards })
})

// POST /api/gno — create
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    groupName:       z.string().min(1).max(50),
    theme:           z.enum(['minimal', 'rosy', 'emoji']).default('rosy'),
    option1Label:    z.string().max(40).default('🍕 Pizza'),
    option2Label:    z.string().max(40).default('🍦 Dondurma'),
    option3Label:    z.string().max(40).default('☕ Kahve'),
    option4Label:    z.string().max(40).default('🍸 Kokteyl'),
    option5Label:    z.string().max(40).default('🎨 Workshop'),
    option6Label:    z.string().max(40).default('🍺 Bar'),
    time1Label:      z.string().max(50).default('Cuma 20:00'),
    time2Label:      z.string().max(50).default('Cumartesi 20:00'),
    time3Label:      z.string().max(50).default('Pazar 18:00'),
    location1Label:  z.string().max(50).default('Kadıköy'),
    location2Label:  z.string().max(50).default('Beşiktaş'),
    location3Label:  z.string().max(50).default('Nişantaşı'),
    venueCity:        z.string().max(60).optional(),
    venueDistrict:    z.string().max(60).optional(),
    suggestedVenueId: z.string().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz giriş' })
    return
  }

  const baseSlug = toSlug(parsed.data.groupName)
  let slug = baseSlug
  let counter = 2
  while (await prisma.gNOCard.findFirst({ where: { userId: req.userId!, slug } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const card = await prisma.gNOCard.create({
    data: { ...parsed.data, userId: req.userId!, slug },
  })
  res.status(201).json({ card })
})

// GET /api/gno/public/:slug — public vote page
router.get('/public/:slug', async (req: Request, res: Response) => {
  const card = await prisma.gNOCard.findFirst({
    where: { slug: req.params.slug },
    include: {
      votes: true,
      user: { select: { name: true, username: true } },
    },
  })
  if (!card) { res.status(404).json({ error: 'Grup bulunamadı' }); return }

  let suggestedVenue = null
  if (card.suggestedVenueId) {
    suggestedVenue = await prisma.venue.findUnique({
      where: { id: card.suggestedVenueId },
      select: VENUE_SELECT,
    })
  }

  res.json({ card: { ...card, suggestedVenue } })
})

// POST /api/gno/:id/vote — submit vote
router.post('/:id/vote', async (req: Request, res: Response) => {
  const schema = z.object({
    voterName:        z.string().min(1).max(50),
    selectedEvent:    z.string().min(1).max(100),
    selectedTime:     z.string().min(1).max(100),
    selectedLocation: z.string().min(1).max(100),
    pickupChoice:     z.enum(['meet', 'pickup']).default('meet'),
    selectedVenueId:  z.string().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz giriş' })
    return
  }

  const card = await prisma.gNOCard.findUnique({ where: { id: req.params.id } })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }

  const vote = await prisma.gNOVote.create({
    data: { cardId: card.id, ...parsed.data },
  })
  res.status(201).json({ vote })
})

// GET /api/gno/:id — owner detail
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const card = await prisma.gNOCard.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { votes: true },
  })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }
  res.json({ card })
})

export default router
