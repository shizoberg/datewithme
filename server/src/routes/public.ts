import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

const router = Router()

// GET /api/public/:username/:slug
router.get('/:username/:slug', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { username: req.params.username } })
  if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }

  const card = await prisma.card.findFirst({
    where: { userId: user.id, slug: req.params.slug },
    include: { user: { select: { name: true, username: true } } },
  })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }

  const venueSelect = { id: true, name: true, category: true, district: true, address: true, googleMapsUrl: true, instagramUrl: true, rating: true, priceLevel: true }
  const [suggestedVenue, selectedVenue] = await Promise.all([
    card.suggestedVenueId ? prisma.venue.findUnique({ where: { id: card.suggestedVenueId }, select: venueSelect }) : null,
    card.selectedVenueId  ? prisma.venue.findUnique({ where: { id: card.selectedVenueId  }, select: venueSelect }) : null,
  ])

  res.json({ card: { ...card, suggestedVenue, selectedVenue } })
})

// POST /api/public/:username/:slug/respond
router.post('/:username/:slug/respond', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { username: req.params.username } })
  if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }

  const card = await prisma.card.findFirst({ where: { userId: user.id, slug: req.params.slug } })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }

  if (card.status !== 'pending') {
    res.status(409).json({ error: 'Bu teklif zaten cevaplandı' }); return
  }

  const schema = z.object({
    accepted:        z.boolean(),
    selectedOption:  z.string().max(40).optional(),
    selectedDate:    z.string().datetime().optional(),
    pickupChoice:    z.boolean().optional(),
    location:        z.string().max(200).optional(),
    withBarAfter:    z.boolean().optional(),
    selectedVenueId: z.string().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz giriş' }); return
  }

  const updated = await prisma.card.update({
    where: { id: card.id },
    data: {
      status:         parsed.data.accepted ? 'accepted' : 'declined',
      selectedOption: parsed.data.selectedOption ?? null,
      selectedDate:   parsed.data.selectedDate ? new Date(parsed.data.selectedDate) : null,
      pickupChoice:   parsed.data.pickupChoice ?? null,
      location:        parsed.data.location ?? null,
      withBarAfter:    parsed.data.withBarAfter ?? false,
      selectedVenueId: parsed.data.selectedVenueId ?? null,
    },
    include: { user: { select: { name: true, username: true } } },
  })

  const venueSelect = { id: true, name: true, category: true, district: true, address: true, googleMapsUrl: true, instagramUrl: true, rating: true, priceLevel: true }
  const [suggestedVenue, selectedVenue] = await Promise.all([
    updated.suggestedVenueId ? prisma.venue.findUnique({ where: { id: updated.suggestedVenueId }, select: venueSelect }) : null,
    updated.selectedVenueId  ? prisma.venue.findUnique({ where: { id: updated.selectedVenueId  }, select: venueSelect }) : null,
  ])

  res.json({ card: { ...updated, suggestedVenue, selectedVenue } })
})

export default router
