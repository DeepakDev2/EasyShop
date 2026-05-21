import { z } from 'zod'

const guestCartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits').optional(),
  guestCart: z.array(guestCartItemSchema).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  guestCart: z.array(guestCartItemSchema).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
