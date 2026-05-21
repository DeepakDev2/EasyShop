import { Router, IRouter } from 'express'
import { placeOrder, getMyOrders, getOrder, cancelOrder } from '../controllers/order.controller'

const router: IRouter = Router()

router.post('/', ...(Array.isArray(placeOrder) ? placeOrder : [placeOrder]))
router.get('/my', ...(Array.isArray(getMyOrders) ? getMyOrders : [getMyOrders]))
router.get('/:id', ...(Array.isArray(getOrder) ? getOrder : [getOrder]))
router.put('/:id/cancel', ...(Array.isArray(cancelOrder) ? cancelOrder : [cancelOrder]))

export default router

