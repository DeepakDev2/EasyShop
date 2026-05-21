import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import * as categoryService from '../services/category.service'

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories()
  res.json({ success: true, data: categories })
})

export const getCategoryProducts = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params
  const category = await categoryService.getCategoryBySlug(slug)
  if (!category) {
    res.status(404).json({ success: false, error: 'Category not found', code: 'NOT_FOUND' })
    return
  }
  res.json({ success: true, data: category })
})
