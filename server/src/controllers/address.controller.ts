import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import { authenticate } from '../middleware/auth'
import * as addressService from '../services/address.service'

export const getAddresses = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.getUserAddresses(req.user!.id)
    res.json({ success: true, data: addresses })
  }),
]

export const addAddress = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.createAddress(req.user!.id, req.body)
    res.status(201).json({ success: true, data: address })
  }),
]

export const updateAddress = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const address = await addressService.updateAddress(id, req.user!.id, req.body)
    res.json({ success: true, data: address })
  }),
]

export const removeAddress = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    await addressService.deleteAddress(parseInt(req.params.id), req.user!.id)
    res.json({ success: true, message: 'Address deleted' })
  }),
]

export const makeDefault = [
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.setDefault(parseInt(req.params.id), req.user!.id)
    res.json({ success: true, data: address })
  }),
]
