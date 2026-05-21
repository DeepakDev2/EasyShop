import { Router, IRouter } from 'express'
import * as productController from '../controllers/product.controller'

const router: IRouter = Router()

// GET /api/v1/products
router.get('/', productController.getProducts)

// GET /api/v1/products/brands
router.get('/brands', productController.getBrands)

// GET /api/v1/products/:slug
router.get('/:slug', productController.getProductBySlug)

export default router
