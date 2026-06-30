import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { adminAuth, AuthRequest } from '../middleware/auth'

const router = Router()

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// GET /api/guide — yayınlanmış rehber yazıları
router.get('/', async (req: Request, res: Response) => {
  const status = (req.query.status as string) || 'published'
  try {
    const entries = await prisma.guideEntry.findMany({
      where: status === 'all' ? {} : { status },
      include: { author: true },
      orderBy: { publishedAt: 'desc' },
    })
    res.json(entries)
  } catch {
    res.status(500).json({ error: 'DB hatası' })
  }
})

// GET /api/guide/:slug — tek yazı
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const entry = await prisma.guideEntry.findUnique({
      where: { slug: req.params.slug },
      include: { author: true },
    })
    if (!entry) { res.status(404).json({ error: 'Bulunamadı' }); return }
    res.json(entry)
  } catch {
    res.status(500).json({ error: 'DB hatası' })
  }
})

// POST /api/guide — admin yeni yazı oluşturur
router.post('/', adminAuth, async (req: AuthRequest, res: Response) => {
  const { title, content, coverImage, city, venueName, venueId, authorId, status } = req.body
  if (!title || !content) {
    res.status(400).json({ error: 'Başlık ve içerik zorunlu' })
    return
  }
  try {
    let slug = slugify(title)
    const existing = await prisma.guideEntry.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const entry = await prisma.guideEntry.create({
      data: {
        title, slug, content, coverImage: coverImage || null,
        city: city || null, venueName: venueName || null, venueId: venueId || null,
        authorId: authorId || null,
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
      },
    })
    res.json(entry)
  } catch {
    res.status(500).json({ error: 'Kayıt başarısız' })
  }
})

// PATCH /api/guide/:id — admin günceller (yayınlama dahil)
router.patch('/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data: Record<string, unknown> = { ...req.body }
    if (data.status === 'published') {
      const current = await prisma.guideEntry.findUnique({ where: { id: req.params.id } })
      if (current && !current.publishedAt) data.publishedAt = new Date()
    }
    const entry = await prisma.guideEntry.update({ where: { id: req.params.id }, data })
    res.json(entry)
  } catch {
    res.status(404).json({ error: 'Bulunamadı' })
  }
})

// DELETE /api/guide/:id
router.delete('/:id', adminAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.guideEntry.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Bulunamadı' })
  }
})

export default router
