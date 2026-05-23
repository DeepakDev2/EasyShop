import { z } from 'zod'

export const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional(),
  body: z.string().min(20, 'Review must be at least 20 characters'),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
