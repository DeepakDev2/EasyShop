import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { createError } from './errorHandler'

export interface JwtPayload {
  userId: number
  email?: string
  role?: string
}

// Augment Express Request globally so req.user is available everywhere
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; email?: string; role?: string }
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) { next(createError('Authentication required', 401, 'UNAUTHORIZED')); return }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = { id: payload.userId, email: payload.email, role: payload.role }
    next()
  } catch {
    next(createError('Invalid or expired token', 401, 'INVALID_TOKEN'))
  }
}

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      req.user = { id: payload.userId, email: payload.email, role: payload.role }
    } catch { /* proceed as guest */ }
  }
  next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    next(createError('Admin access required', 403, 'FORBIDDEN')); return
  }
  next()
}
