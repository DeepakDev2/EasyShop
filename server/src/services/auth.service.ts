import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db'
import { env } from '../config/env'
import { RegisterInput, LoginInput } from '../schemas/auth.schema'
import { createError } from '../middleware/errorHandler'
import * as cartService from './cart.service'

const signToken = (userId: number, email: string, role: string) =>
  jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })

const safeUser = (user: { id: number; name: string; email: string; phone: string | null; role: string; createdAt: Date }) => ({
  id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt,
})

export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw createError('Email already registered', 409, 'EMAIL_EXISTS')

  const hashedPassword = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashedPassword, phone: data.phone },
  })

  const token = signToken(user.id, user.email, user.role)
  if (data.guestCart?.length) await cartService.mergeCartItems(user.id, data.guestCart)
  return { user: safeUser(user), token }
}

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } })
  if (!user) throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

  const valid = await bcrypt.compare(data.password, user.password)
  if (!valid) throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

  const token = signToken(user.id, user.email, user.role)
  if (data.guestCart?.length) await cartService.mergeCartItems(user.id, data.guestCart)
  return { user: safeUser(user), token }
}

export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw createError('User not found', 404, 'NOT_FOUND')
  return safeUser(user)
}
