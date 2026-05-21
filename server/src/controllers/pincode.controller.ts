import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import * as pincodeService from '../services/pincode.service'

export const getPincodeDetails = asyncHandler(async (req: Request, res: Response) => {
  const pin = (req.params.pin || '').replace(/\D/g, '')
  const result = await pincodeService.lookupPincode(pin)
  res.json({ success: true, data: result })
})
