import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createReviewSchema } from '../schemas/review.schema'
import * as reviewService from '../services/review.service'

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 10))
  const result = await reviewService.getProductReviews(productId, page, limit)
  res.json({ success: true, data: result })
})

export const canReview = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId)
    const result = await reviewService.canUserReview(req.user!.id, productId)
    res.json({ success: true, data: result })
  }),
]

export const submitReview = [
  authenticate,
  validate(createReviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.upsertReview(req.user!.id, req.body)
    res.status(201).json({ success: true, data: review })
  }),
]

export const removeReview = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id)
    await reviewService.deleteReview(reviewId, req.user!.id, req.user!.role ?? 'customer')
    res.json({ success: true, message: 'Review deleted' })
  }),
]
