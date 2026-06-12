import { Router, Response } from 'express'
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

// GET /api/cards
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const cards = await prisma.card.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ cards })
})

// POST /api/cards
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    recipientName: z.string().min(1).max(50),
    theme:         z.enum(['minimal', 'rosy', 'emoji']).default('minimal'),
    option1Label:  z.string().max(40).default('🍕 Pizza'),
    option2Label:  z.string().max(40).default('🍦 Dondurma'),
    option3Label:  z.string().max(40).default('☕ Kahve'),
    option4Label:  z.string().max(40).default('🍸 Kokteyl'),
    option5Label:  z.string().max(40).default('🎨 Workshop'),
    option6Label:  z.string().max(40).default('🍺 Bar'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Geçersiz giriş' })
    return
  }

  const baseSlug = toSlug(parsed.data.recipientName)
  let slug = baseSlug
  let counter = 2
  while (await prisma.card.findFirst({ where: { userId: req.userId!, slug } })) {
    slug = `${baseSlug}-${counter++}`
  }

  const card = await prisma.card.create({
    data: { ...parsed.data, userId: req.userId!, slug },
  })
  res.status(201).json({ card })
})

// GET /api/cards/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const card = await prisma.card.findFirst({ where: { id: req.params.id, userId: req.userId } })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }
  res.json({ card })
})

// PATCH /api/cards/:id/labels
router.patch('/:id/labels', requireAuth, async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    option1Label: z.string().max(40).optional(),
    option2Label: z.string().max(40).optional(),
    option3Label: z.string().max(40).optional(),
    option4Label: z.string().max(40).optional(),
    option5Label: z.string().max(40).optional(),
    option6Label: z.string().max(40).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: 'Geçersiz giriş' }); return }

  const card = await prisma.card.findFirst({ where: { id: req.params.id, userId: req.userId } })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }
  if (card.status !== 'pending') { res.status(409).json({ error: 'Yanıtlanmış kart düzenlenemez' }); return }

  const updated = await prisma.card.update({ where: { id: req.params.id }, data: parsed.data })
  res.json({ card: updated })
})

// DELETE /api/cards/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const card = await prisma.card.findFirst({ where: { id: req.params.id, userId: req.userId } })
  if (!card) { res.status(404).json({ error: 'Kart bulunamadı' }); return }
  await prisma.card.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

// GET /api/cards/:id/ics
router.get('/:id/ics', async (req, res: Response) => {
  const card = await prisma.card.findUnique({ where: { id: req.params.id }, include: { user: true } })
  if (!card || !card.selectedDate) { res.status(404).json({ error: 'Kart veya tarih bulunamadı' }); return }

  const start = new Date(card.selectedDate)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//datewith.me//EN',
    'BEGIN:VEVENT',
    `UID:${card.id}@datewith.me`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${card.user.name} & ${card.recipientName} Date 💛`,
    `DESCRIPTION:${card.selectedOption ?? ''} ${card.location ? '@ ' + card.location : ''}`,
    card.location ? `LOCATION:${card.location}` : '',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  res.setHeader('Content-Type', 'text/calendar')
  res.setHeader('Content-Disposition', `attachment; filename="date-${card.id}.ics"`)
  res.send(ics)
})

export default router
