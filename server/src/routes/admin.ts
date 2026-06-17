import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

// POST /api/admin/login
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ message: 'Hatalı şifre' })
    return
  }
  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )
  res.json({ token })
})

export default router
