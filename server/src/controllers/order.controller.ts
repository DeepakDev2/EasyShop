import { Request, Response } from 'express'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import { createOrderSchema } from '../schemas/order.schema'
import * as orderService from '../services/order.service'

export const placeOrder = [
  authenticate,
  validate(createOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.user!.id, req.body)
    res.status(201).json({ success: true, data: order })
  }),
]

export const getMyOrders = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await orderService.getUserOrders(req.user!.id)
    res.json({ success: true, data: orders })
  }),
]

export const getOrder = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.id)
    if (isNaN(orderId)) throw createError('Invalid order ID', 400, 'BAD_REQUEST')
    const order = await orderService.getOrderById(orderId, req.user!.id)
    res.json({ success: true, data: order })
  }),
]
