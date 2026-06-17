import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Admin yetkisi gerekli' })
    return
  }
  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role?: string }
    if (decoded.role !== 'admin') {
      res.status(403).json({ message: 'Yetersiz yetki' })
      return
    }
    next()
  } catch {
    res.status(401).json({ message: 'Geçersiz token' })
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  // Support both cookie and Authorization header (Bearer token)
  const cookieToken = req.cookies?.token
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined
  const token = cookieToken || headerToken

  if (!token) {
    res.status(401).json({ error: 'Giriş gerekli' })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Geçersiz token' })
  }
}
