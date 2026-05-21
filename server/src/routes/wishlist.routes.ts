import { Router, IRouter } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler, createError } from '../middleware/errorHandler'
import * as wishlistService from '../services/wishlist.service'
import { Request, Response } from 'express'

const router: IRouter = Router()

// GET /api/v1/wishlist — get my wishlist
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const items = await wishlistService.getWishlist(req.user!.id)
  res.json({ success: true, data: items })
}))

// POST /api/v1/wishlist/:productId — toggle
router.post('/:productId', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId)
  if (isNaN(productId)) throw createError('Invalid product ID', 400, 'BAD_REQUEST')
  const result = await wishlistService.toggleWishlist(req.user!.id, productId)
  res.json({ success: true, ...result })
}))

export default router
