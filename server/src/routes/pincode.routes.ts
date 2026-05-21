import { Router, IRouter } from 'express'
import { getPincodeDetails } from '../controllers/pincode.controller'

const router: IRouter = Router()

router.get('/:pin', getPincodeDetails)

export default router
