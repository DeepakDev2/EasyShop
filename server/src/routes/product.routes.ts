import { Router, IRouter } from 'express'
import * as productController from '../controllers/product.controller'
import { authenticate, requireAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createProductSchema, updateProductSchema } from '../schemas/product.schema'

const router: IRouter = Router()

// GET /api/v1/products
router.get('/', productController.getProducts)

// GET /api/v1/products/brands
router.get('/brands', productController.getBrands)

// GET /api/v1/products/:slug
router.get('/:slug', productController.getProductBySlug)

// Administrative Admin CRUD Routes
// POST /api/v1/products
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  productController.createProduct
)

// PUT /api/v1/products/:id
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateProductSchema),
  productController.updateProduct
)

// DELETE /api/v1/products/:id
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.deleteProduct
)

export default router
