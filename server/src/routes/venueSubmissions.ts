import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { adminAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/venue-submissions — public
router.post('/', async (req: Request, res: Response) => {
  const schema = z.object({
    name:           z.string().min(2).max(100),
    category:       z.enum(['cafe', 'restaurant', 'bar', 'park', 'rooftop', 'cultural']),
    city:           z.string().min(2).max(60),
    district:       z.string().min(2).max(60),
    address:        z.string().max(200).optional(),
    googleMapsUrl:  z.string().max(500).optional(),
    instagramUrl:   z.string().max(200).optional(),
    rating:         z.number().min(1).max(5).optional(),
    priceLevel:     z.number().int().min(1).max(3).optional(),
    description:    z.string().max(300).optional(),
    submitterName:  z.string().max(80).optional(),
    submitterEmail: z.string().email().max(120).optional(),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz giriş' })
    return
  }

  const { name, city, district } = parsed.data
  const duplicate = await prisma.venueSubmission.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      city: { equals: city, mode: 'insensitive' },
      district: { equals: district, mode: 'insensitive' },
      status: { not: 'rejected' },
    },
  })
  if (duplicate) {
    res.status(409).json({ error: 'Bu mekan zaten öneri kuyruğunda veya onaylandı.' })
    return
  }

  await prisma.venueSubmission.create({ data: parsed.data })
  res.status(201).json({ success: true, message: 'Öneriniz alındı, inceleme sonrası yayınlanacak!' })
})

// GET /api/admin/venue-submissions — admin only
router.get('/admin', adminAuth, async (_req: AuthRequest, res: Response) => {
  const status = ((_req as any).query?.status as string) || 'pending'
  const submissions = await prisma.venueSubmission.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  })
  const pendingCount = await prisma.venueSubmission.count({ where: { status: 'pending' } })
  res.json({ submissions, pendingCount })
})

// PATCH /api/admin/venue-submissions/:id/approve — admin only
router.patch('/admin/:id/approve', adminAuth, async (req: AuthRequest, res: Response) => {
  const sub = await prisma.venueSubmission.findUnique({ where: { id: req.params.id } })
  if (!sub) { res.status(404).json({ error: 'Bulunamadı' }); return }

  const igRaw = sub.instagramUrl?.trim() ?? ''
  const instagramUrl = igRaw
    ? igRaw.startsWith('http') ? igRaw : `https://instagram.com/${igRaw.replace(/^@/, '')}`
    : null

  const venue = await prisma.venue.create({
    data: {
      name:         sub.name,
      category:     sub.category,
      city:         sub.city,
      district:     sub.district,
      address:      sub.address ?? undefined,
      googleMapsUrl: sub.googleMapsUrl ?? undefined,
      instagramUrl: instagramUrl ?? undefined,
      rating:       sub.rating ?? undefined,
      priceLevel:   sub.priceLevel ?? undefined,
      description:  sub.description ?? undefined,
      isActive:     true,
      isFeatured:   true,
      featuredBy:   'admin',
    },
  })

  await prisma.venueSubmission.update({
    where: { id: sub.id },
    data: { status: 'approved', reviewedAt: new Date() },
  })

  res.json({ success: true, venueId: venue.id })
})

// PATCH /api/admin/venue-submissions/:id/reject — admin only
router.patch('/admin/:id/reject', adminAuth, async (req: AuthRequest, res: Response) => {
  const { adminNote } = req.body
  const sub = await prisma.venueSubmission.findUnique({ where: { id: req.params.id } })
  if (!sub) { res.status(404).json({ error: 'Bulunamadı' }); return }

  await prisma.venueSubmission.update({
    where: { id: sub.id },
    data: { status: 'rejected', reviewedAt: new Date(), adminNote: adminNote || null },
  })
  res.json({ success: true })
})

export default router
