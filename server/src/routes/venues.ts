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
  isFeatured: true, featuredBy: true, featuredInfluencerId: true,
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

// GET /api/venues/map — harita için lat/lng olan mekanlar
router.get('/map', async (_req: Request, res: Response) => {
  const venues = await prisma.venue.findMany({
    where: { isActive: true, lat: { not: null }, lng: { not: null } },
    select: { id: true, name: true, category: true, city: true, district: true, lat: true, lng: true, rating: true, isFeatured: true, featuredBy: true, imageUrl: true },
    orderBy: { name: 'asc' },
  })
  res.json(venues)
})

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

// POST /api/venues/admin/search-google — isim+şehir ile Place ID bul (toplu import için)
router.post('/admin/search-google', adminAuth, async (req: AuthRequest, res: Response) => {
  const { name, city } = req.body
  if (!name || !city) { res.status(400).json({ error: 'name ve city gerekli' }); return }
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY
  if (!API_KEY) { res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY eksik' }); return }
  const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': 'places.id,places.displayName' },
    body: JSON.stringify({ textQuery: `${name} ${city}`, languageCode: 'tr', regionCode: 'TR', maxResultCount: 1 }),
  })
  const data: Record<string, unknown> = await searchRes.json() as Record<string, unknown>
  const places = (data.places as Array<Record<string,unknown>>) || []
  if (!places.length) { res.json({ placeId: null }); return }
  res.json({ placeId: places[0].id, name: (places[0].displayName as Record<string,string>)?.text })
})

// DELETE /api/admin/venues/:id
router.delete('/admin/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  await prisma.venue.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

// POST /api/venues/admin/import-google — Google Place ID ile mekan çek ve ekle
router.post('/admin/import-google', adminAuth, async (req: AuthRequest, res: Response) => {
  const { placeId, city, district, category } = req.body
  if (!placeId || !city || !category) {
    res.status(400).json({ error: 'placeId, city ve category zorunlu' }); return
  }

  const existing = await prisma.venue.findUnique({ where: { googlePlaceId: placeId } })
  if (existing) { res.status(409).json({ error: 'Bu mekan zaten DB\'de var', venue: existing }); return }

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY
  if (!API_KEY) { res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY eksik' }); return }

  const FIELD_MASK = [
    'id','displayName','formattedAddress','rating','userRatingCount','priceLevel',
    'types','editorialSummary','reviews','photos','websiteUri','regularOpeningHours',
    'nationalPhoneNumber','googleMapsUri',
  ].join(',')

  const detailRes = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    { headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': FIELD_MASK } }
  )
  if (!detailRes.ok) { res.status(502).json({ error: 'Google API hatası', status: detailRes.status }); return }
  const p: Record<string, unknown> = await detailRes.json() as Record<string, unknown>

  const name = (p.displayName as Record<string,string>)?.text || ''
  if (!name) { res.status(400).json({ error: 'Mekan adı alınamadı' }); return }

  const PRICE_MAP: Record<string, number> = {
    PRICE_LEVEL_FREE: 1, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 3,
  }

  const photos = (p.photos as Array<Record<string,string>>) || []
  const photoUrls = photos.slice(0, 3).map(ph =>
    `https://places.googleapis.com/v1/${ph.name}/media?maxWidthPx=800&key=${API_KEY}`
  )
  const reviews = (p.reviews as Array<Record<string, unknown>>) || []
  const reviewsData = reviews.slice(0, 5).map(rv => ({
    author: (rv.authorAttribution as Record<string,string>)?.displayName || '',
    text: (rv.text as Record<string,string>)?.text || '',
    rating: rv.rating as number,
  })).filter(r => r.text)

  const venue = await prisma.venue.create({
    data: {
      name,
      category: ['koy','doga','antik'].includes(category) ? 'park' : category,
      city,
      district: district || '',
      address: (p.formattedAddress as string) || null,
      googleMapsUrl: (p.googleMapsUri as string) || null,
      googleMapsUri: (p.googleMapsUri as string) || null,
      rating: (p.rating as number) || null,
      totalRatings: (p.userRatingCount as number) || null,
      googleRating: (p.rating as number) || null,
      priceLevel: PRICE_MAP[p.priceLevel as string] || null,
      imageUrl: photoUrls[0] || null,
      photosJson: photoUrls.length ? JSON.stringify(photoUrls) : null,
      description: (p.editorialSummary as Record<string,string>)?.text || null,
      reviewsJson: reviewsData.length ? JSON.stringify(reviewsData) : null,
      phone: (p.nationalPhoneNumber as string) || null,
      website: (p.websiteUri as string) || null,
      googlePlaceId: placeId,
      venueType: category,
      isNature: ['koy','doga'].includes(category),
      isActive: true,
      lat: ((p.location as Record<string,number>)?.latitude) || null,
      lng: ((p.location as Record<string,number>)?.longitude) || null,
    },
  })
  res.json({ ok: true, venue })
})

// PATCH /api/venues/admin/:id/featured — öne çıkar / kaldır
router.patch('/admin/:id/featured', adminAuth, async (req: AuthRequest, res: Response) => {
  const { isFeatured, featuredBy, featuredInfluencerId } = req.body
  const venue = await prisma.venue.update({
    where: { id: req.params.id },
    data: {
      isFeatured: isFeatured ?? true,
      featuredBy: featuredBy || 'admin',
      featuredInfluencerId: featuredInfluencerId || null,
    },
  })
  res.json(venue)
})

export default router
