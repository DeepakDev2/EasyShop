import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { createError } from './errorHandler'

export interface JwtPayload {
  userId: number
  email: string
  role: string
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    next(createError('Authentication required', 401, 'UNAUTHORIZED'))
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    next(createError('Invalid or expired token', 401, 'INVALID_TOKEN'))
  }
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    next()
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = payload
  } catch {
    // Token invalid — proceed as unauthenticated guest
  }
  next()
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    next(createError('Admin access required', 403, 'FORBIDDEN'))
    return
  }
  next()
}
