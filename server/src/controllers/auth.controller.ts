import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { validate } from '../middleware/validate'
import { registerSchema, loginSchema } from '../schemas/auth.schema'
import * as authService from '../services/auth.service'

export const register = [
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body)
    res.status(201).json({ success: true, ...result })
  }),
]

export const login = [
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body)
    res.json({ success: true, ...result })
  }),
]

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id)
  res.json({ success: true, data: user })
})
