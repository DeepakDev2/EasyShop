import { Request, Response } from 'express'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import { upsertCartSchema, updateCartSchema, mergeCartSchema } from '../schemas/cart.schema'
import * as cartService from '../services/cart.service'

export const getCart = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const items = await cartService.getCart(req.user!.id)
    res.json({ success: true, data: items })
  }),
]

export const addOrUpdateItem = [
  authenticate,
  validate(upsertCartSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity } = req.body
    const item = await cartService.upsertCartItem(req.user!.id, productId, quantity)
    res.json({ success: true, data: item })
  }),
]

export const updateItem = [
  authenticate,
  validate(updateCartSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.itemId)
    if (isNaN(itemId)) throw createError('Invalid cart item ID', 400, 'BAD_REQUEST')
    const item = await cartService.updateCartItem(req.user!.id, itemId, req.body.quantity)
    res.json({ success: true, data: item })
  }),
]

export const removeItem = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.itemId)
    if (isNaN(itemId)) throw createError('Invalid cart item ID', 400, 'BAD_REQUEST')
    await cartService.removeCartItem(req.user!.id, itemId)
    res.json({ success: true, message: 'Item removed' })
  }),
]

export const clearCart = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await cartService.clearCart(req.user!.id)
    res.json({ success: true, message: 'Cart cleared' })
  }),
]

export const mergeCart = [
  authenticate,
  validate(mergeCartSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const items = await cartService.mergeCartItems(req.user!.id, req.body.items)
    res.json({ success: true, data: items })
  }),
]
