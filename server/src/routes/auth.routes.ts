import { Router, IRouter } from 'express'
import { register, login, getMe } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

const router: IRouter = Router()

// POST /api/v1/auth/register
router.post('/register', ...(Array.isArray(register) ? register : [register]))

// POST /api/v1/auth/login
router.post('/login', ...(Array.isArray(login) ? login : [login]))

// GET /api/v1/auth/me  (protected)
router.get('/me', authenticate, getMe)

export default router
