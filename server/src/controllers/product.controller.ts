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

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.createProduct(req.body)
  res.status(201).json({ success: true, data: result })
})

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) throw createError('Invalid product ID', 400, 'BAD_REQUEST')
  const result = await productService.updateProduct(id, req.body)
  res.json({ success: true, data: result })
})

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) throw createError('Invalid product ID', 400, 'BAD_REQUEST')
  const result = await productService.deleteProduct(id)
  res.json({ success: true, data: result })
})
