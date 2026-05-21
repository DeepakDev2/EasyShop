import { Request, Response } from 'express'
import { asyncHandler, createError } from '../middleware/errorHandler'
import { productQuerySchema } from '../schemas/product.schema'
import * as productService from '../services/product.service'

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const parsed = productQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    const details = parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    res.status(400).json({ success: false, error: 'Invalid query params', code: 'VALIDATION_ERROR', details })
    return
  }
  const result = await productService.getProducts(parsed.data)
  res.json({ success: true, ...result })
})

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params
  const product = await productService.getProductBySlug(slug)
  if (!product) throw createError('Product not found', 404, 'NOT_FOUND')

  // fetch related products
  const related = product.categoryId
    ? await productService.getRelatedProducts(product.categoryId, slug)
    : []

  res.json({ success: true, data: { ...product, related } })
})

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query
  const brands = await productService.getDistinctBrands(category as string | undefined)
  res.json({ success: true, data: brands })
})
