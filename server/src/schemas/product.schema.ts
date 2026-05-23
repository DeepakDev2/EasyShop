import { z } from 'zod'

export const productQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export type ProductQuery = z.infer<typeof productQuerySchema>

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  brand: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  images: z.array(
    z.object({
      url: z.string().url('Invalid image URL'),
      isPrimary: z.boolean().default(false),
      displayOrder: z.number().int().default(0),
    })
  ).optional(),
  specs: z.array(
    z.object({
      specKey: z.string().min(1, 'Spec key is required'),
      specValue: z.string().min(1, 'Spec value is required'),
      displayOrder: z.number().int().default(0),
    })
  ).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

export const updateProductSchema = createProductSchema.partial()

export type UpdateProductInput = z.infer<typeof updateProductSchema>
