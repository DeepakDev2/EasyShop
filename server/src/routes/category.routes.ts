import { Router, IRouter } from 'express'
import * as categoryController from '../controllers/category.controller'

const router: IRouter = Router()

// GET /api/v1/categories
router.get('/', categoryController.getCategories)

// GET /api/v1/categories/:slug
router.get('/:slug', categoryController.getCategoryProducts)

export default router
