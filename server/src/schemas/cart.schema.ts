import { z } from 'zod'

export const upsertCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export const updateCartSchema = z.object({
  quantity: z.number().int().positive(),
})

export const mergeCartSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(0),
})
