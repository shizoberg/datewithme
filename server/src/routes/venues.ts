import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { adminAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const VENUE_SELECT = {
  id: true, name: true, category: true, city: true, district: true,
  address: true, googleMapsUrl: true, instagramUrl: true, rating: true,
  priceLevel: true, imageUrl: true, aiTags: true, dateSkor: true, gnoSkor: true, atmosfer: true,
  reviewsJson: true, totalRatings: true,
}

// GET /api/venues/suggest?city=...&district=...&category=...
router.get('/suggest', async (req: Request, res: Response) => {
  const { city, district, category } = req.query as Record<string, string>
  if (!city) { res.status(400).json({ error: 'city gerekli' }); return }

  const cityTrimmed = city.trim()
  const districtTrimmed = district?.trim() ?? ''

  const venues = await prisma.venue.findMany({
    where: {
      city: { equals: cityTrimmed, mode: 'insensitive' },
      isActive: true,
      ...(category ? { category } : {}),
      ...(districtTrimmed ? { district: { contains: districtTrimmed, mode: 'insensitive' } } : {}),
    },
    select: { ...VENUE_SELECT, district: true, city: true },
    orderBy: [{ rating: 'desc' }],
  })

  res.json({ venues: venues.slice(0, 8) })
})

// venueType olarak saklanan kategoriler
const VENUE_TYPE_CATEGORIES = ['koy', 'doga', 'antik', 'plaj']

// GET /api/venues/all
router.get('/all', async (req: Request, res: Response) => {
  const { city, category, limit = '100' } = req.query as Record<string, string>
  const where: Record<string, unknown> = { isActive: true }
  if (city) where.city = { equals: city, mode: 'insensitive' }
  if (category) {
    if (VENUE_TYPE_CATEGORIES.includes(category)) {
      where.venueType = category
    } else {
      where.category = category
    }
  }

  const venues = await prisma.venue.findMany({
    where,
    select: { ...VENUE_SELECT, district: true, city: true, description: true },
    orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    take: Math.min(parseInt(limit) || 100, 500),
  })
  res.json({ venues })
})

// GET /api/admin/venues
router.get('/admin', adminAuth, async (_req: AuthRequest, res: Response) => {
  const venues = await prisma.venue.findMany({ orderBy: [{ city: 'asc' }, { district: 'asc' }, { name: 'asc' }] })
  res.json({ venues })
})

// POST /api/admin/venues
router.post('/admin', adminAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name:          z.string().min(1).max(100),
    category:      z.enum(['cafe', 'restaurant', 'bar', 'park', 'rooftop', 'cultural']),
    city:          z.string().min(1).max(60),
    district:      z.string().min(1).max(60),
    address:       z.string().max(200).optional(),
    googleMapsUrl: z.string().url().optional().or(z.literal('')),
    instagramUrl:  z.string().max(200).optional(),
    rating:        z.number().min(1).max(5).optional(),
    priceLevel:    z.number().int().min(1).max(3).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return }

  const data = {
    ...parsed.data,
    googleMapsUrl: parsed.data.googleMapsUrl || null,
    instagramUrl:  parsed.data.instagramUrl  || null,
  }
  const venue = await prisma.venue.create({ data })
  res.status(201).json({ venue })
})

// PATCH /api/admin/venues/:id
router.patch('/admin/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name:          z.string().min(1).max(100).optional(),
    category:      z.enum(['cafe', 'restaurant', 'bar', 'park', 'rooftop', 'cultural']).optional(),
    city:          z.string().min(1).max(60).optional(),
    district:      z.string().min(1).max(60).optional(),
    address:       z.string().max(200).optional().nullable(),
    googleMapsUrl: z.string().optional().nullable(),
    instagramUrl:  z.string().max(200).optional().nullable(),
    rating:        z.number().min(1).max(5).optional().nullable(),
    priceLevel:    z.number().int().min(1).max(3).optional().nullable(),
    isActive:      z.boolean().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message }); return }

  const venue = await prisma.venue.update({ where: { id: req.params.id }, data: parsed.data })
  res.json({ venue })
})

// DELETE /api/admin/venues/:id
router.delete('/admin/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  await prisma.venue.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
