import { Router, IRouter } from 'express'
import {
  getProductReviews,
  canReview,
  submitReview,
  removeReview,
} from '../controllers/review.controller'

const router: IRouter = Router()

// GET /api/v1/reviews/product/:productId?page=&limit=
router.get('/product/:productId', getProductReviews)

// GET /api/v1/reviews/can-review/:productId  (auth required)
router.get('/can-review/:productId', ...(Array.isArray(canReview) ? canReview : [canReview]))

// POST /api/v1/reviews  (auth required)
router.post('/', ...(Array.isArray(submitReview) ? submitReview : [submitReview]))

// DELETE /api/v1/reviews/:id  (auth required)
router.delete('/:id', ...(Array.isArray(removeReview) ? removeReview : [removeReview]))

export default router
