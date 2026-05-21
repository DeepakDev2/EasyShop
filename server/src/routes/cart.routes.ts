import { Router, IRouter } from 'express'
import { getCart, addOrUpdateItem, updateItem, removeItem, clearCart, mergeCart } from '../controllers/cart.controller'

const router: IRouter = Router()

router.get('/', ...(Array.isArray(getCart) ? getCart : [getCart]))
router.post('/merge', ...(Array.isArray(mergeCart) ? mergeCart : [mergeCart]))
router.post('/', ...(Array.isArray(addOrUpdateItem) ? addOrUpdateItem : [addOrUpdateItem]))
router.put('/:itemId', ...(Array.isArray(updateItem) ? updateItem : [updateItem]))
router.delete('/:itemId', ...(Array.isArray(removeItem) ? removeItem : [removeItem]))
router.delete('/', ...(Array.isArray(clearCart) ? clearCart : [clearCart]))

export default router
