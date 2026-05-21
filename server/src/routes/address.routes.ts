import { Router, IRouter } from 'express'
import { getAddresses, addAddress, updateAddress, removeAddress, makeDefault } from '../controllers/address.controller'

const router: IRouter = Router()

// GET  /api/v1/addresses          — list all user addresses
router.get('/', ...(Array.isArray(getAddresses) ? getAddresses : [getAddresses]))

// POST /api/v1/addresses          — create new address
router.post('/', ...(Array.isArray(addAddress) ? addAddress : [addAddress]))

// PUT  /api/v1/addresses/:id      — update address
router.put('/:id', ...(Array.isArray(updateAddress) ? updateAddress : [updateAddress]))

// DELETE /api/v1/addresses/:id   — delete address
router.delete('/:id', ...(Array.isArray(removeAddress) ? removeAddress : [removeAddress]))

// PATCH /api/v1/addresses/:id/default — set as default
router.patch('/:id/default', ...(Array.isArray(makeDefault) ? makeDefault : [makeDefault]))

export default router
