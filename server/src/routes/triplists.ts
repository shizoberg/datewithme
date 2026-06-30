import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { prisma } from '../lib/prisma'

const router = Router()

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 6)
}

// Public feed
router.get('/public', async (req, res: Response) => {
  const sort = (req.query.sort as string) || 'latest'
  const orderBy =
    sort === 'views'  ? { viewCount: 'desc' as const } :
    sort === 'likes'  ? { likeCount: 'desc' as const } :
    sort === 'saves'  ? { saveCount: 'desc' as const } :
                        { createdAt: 'desc' as const }

  const triplists = await prisma.triplist.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { username: true, name: true, avatarId: true } },
      stops: { orderBy: { order: 'asc' } },
    },
    orderBy,
    take: 50,
  })
  res.json(triplists)
})

// Public single by username + slug (view count++)
router.get('/view/:username/:slug', async (req, res: Response) => {
  const { username, slug } = req.params
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) { res.status(404).json({ error: 'Kullanıcı bulunamadı' }); return }

  const triplist = await prisma.triplist.findUnique({
    where: { userId_slug: { userId: user.id, slug } },
    include: {
      user: { select: { username: true, name: true, avatarId: true } },
      stops: { orderBy: { order: 'asc' } },
    },
  })
  if (!triplist) { res.status(404).json({ error: 'Triplist bulunamadı' }); return }
  if (!triplist.isPublic && triplist.userId !== user.id) {
    res.status(403).json({ error: 'Erişim yok' }); return
  }

  await prisma.triplist.update({ where: { id: triplist.id }, data: { viewCount: { increment: 1 } } })
  res.json(triplist)
})

// My triplists
router.get('/mine', requireAuth, async (req: AuthRequest, res: Response) => {
  const triplists = await prisma.triplist.findMany({
    where: { userId: req.userId! },
    include: { stops: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(triplists)
})

// Create
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { title, country, city, district, description, isPublic, startDate, endDate, teamMembers, stops } = req.body
  const slug = generateSlug(title)

  const triplist = await prisma.triplist.create({
    data: {
      userId: req.userId!,
      title, slug, country: country || 'Turkey', city,
      district, description,
      isPublic: !!isPublic,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      teamMembers,
      stops: {
        create: (stops || []).map((s: any, i: number) => ({
          order: i + 1,
          venueName: s.venueName,
          venueId: s.venueId || null,
          address: s.address || null,
          description: s.description || null,
          transitMode: s.transitMode || null,
          transitLine: s.transitLine || null,
          transitNote: s.transitNote || null,
        })),
      },
    },
    include: { stops: { orderBy: { order: 'asc' } } },
  })

  // Venue'de olmayan mekanları VenueSubmission'a at
  for (const s of (stops || [])) {
    if (!s.venueId && s.venueName) {
      await prisma.venueSubmission.create({
        data: {
          name: s.venueName,
          category: 'bilinmiyor',
          city,
          district: district || '',
          address: s.address || null,
          description: `Triplist'ten eklendi: ${title}`,
          status: 'pending',
        },
      })
    }
  }

  res.json(triplist)
})

// Update
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.triplist.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) { res.status(403).json({ error: 'Yetkisiz' }); return }

  const { title, country, city, district, description, isPublic, startDate, endDate, teamMembers, stops } = req.body

  await prisma.tripStop.deleteMany({ where: { triplistId: req.params.id } })

  const updated = await prisma.triplist.update({
    where: { id: req.params.id },
    data: {
      title, country, city, district, description,
      isPublic: !!isPublic,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      teamMembers,
      stops: {
        create: (stops || []).map((s: any, i: number) => ({
          order: i + 1,
          venueName: s.venueName,
          venueId: s.venueId || null,
          address: s.address || null,
          description: s.description || null,
          transitMode: s.transitMode || null,
          transitLine: s.transitLine || null,
          transitNote: s.transitNote || null,
        })),
      },
    },
    include: { stops: { orderBy: { order: 'asc' } } },
  })
  res.json(updated)
})

// Delete
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.triplist.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) { res.status(403).json({ error: 'Yetkisiz' }); return }
  await prisma.triplist.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

// Toggle public
router.patch('/:id/publish', requireAuth, async (req: AuthRequest, res: Response) => {
  const existing = await prisma.triplist.findUnique({ where: { id: req.params.id } })
  if (!existing || existing.userId !== req.userId) { res.status(403).json({ error: 'Yetkisiz' }); return }
  const updated = await prisma.triplist.update({
    where: { id: req.params.id },
    data: { isPublic: !existing.isPublic },
  })
  res.json({ isPublic: updated.isPublic })
})

// Like / Save toggle
router.post('/:id/like', requireAuth, async (req: AuthRequest, res: Response) => {
  const { type } = req.body // 'like' | 'save'
  const t = type === 'save' ? 'save' : 'like'
  const field = t === 'save' ? 'saveCount' : 'likeCount'
  const existing = await prisma.triplistLike.findUnique({
    where: { triplistId_userId_type: { triplistId: req.params.id, userId: req.userId!, type: t } },
  })
  if (existing) {
    await prisma.triplistLike.delete({ where: { id: existing.id } })
    await prisma.triplist.update({ where: { id: req.params.id }, data: { [field]: { decrement: 1 } } })
    res.json({ active: false })
  } else {
    await prisma.triplistLike.create({ data: { triplistId: req.params.id, userId: req.userId!, type: t } })
    await prisma.triplist.update({ where: { id: req.params.id }, data: { [field]: { increment: 1 } } })
    res.json({ active: true })
  }
})

// My likes/saves (hangileri beğendim/kaydettim)
router.get('/my-interactions', requireAuth, async (req: AuthRequest, res: Response) => {
  const items = await prisma.triplistLike.findMany({ where: { userId: req.userId! } })
  res.json(items)
})

// Venue search (DB'de var mı?)
router.get('/venue-search', async (req, res: Response) => {
  const q = (req.query.q as string) || ''
  if (q.length < 2) { res.json([]); return }
  const venues = await prisma.venue.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { district: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, category: true, city: true, district: true, address: true, imageUrl: true },
    take: 10,
  })
  res.json(venues)
})

export default router
