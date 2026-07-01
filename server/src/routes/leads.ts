import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// POST /api/leads — kurumsal başvuru formu
router.post('/', async (req: Request, res: Response) => {
  const { businessName, contactName, email, phone, package: pkg, message } = req.body
  if (!businessName || !contactName || !email || !pkg) {
    res.status(400).json({ error: 'Zorunlu alanlar eksik' })
    return
  }
  try {
    const lead = await prisma.businessLead.create({
      data: { businessName, contactName, email, phone: phone || null, package: pkg, message: message || null }
    })
    res.json({ ok: true, id: lead.id })
  } catch (e) {
    res.status(500).json({ error: 'Kayıt başarısız' })
  }
})

// GET /api/leads/profile/:slug — public kurumsal profil
router.get('/profile/:slug', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.businessLead.findUnique({ where: { slug: req.params.slug } })
    if (!lead || lead.status !== 'approved') { res.status(404).json({ error: 'Bulunamadı' }); return }
    res.json(lead)
  } catch { res.status(500).json({ error: 'DB hatası' }) }
})

// GET /api/leads — admin için başvuruları listele
router.get('/', async (_req: Request, res: Response) => {
  try {
    const leads = await prisma.businessLead.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(leads)
  } catch (e) {
    res.status(500).json({ error: 'DB hatası' })
  }
})

export default router
