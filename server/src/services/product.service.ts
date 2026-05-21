import { Prisma } from '@prisma/client'
import { prisma } from '../config/db'
import { formatProduct } from '../utils/helpers'
import { ProductQuery } from '../schemas/product.schema'

export const getProducts = async (filters: ProductQuery) => {
  const { category, q, minPrice, maxPrice, brand, rating, sort, page, limit } = filters

  const where: Prisma.ProductWhereInput = { isActive: true }

  if (category) where.category = { slug: category }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { brand: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: new Prisma.Decimal(minPrice) }),
      ...(maxPrice !== undefined && { lte: new Prisma.Decimal(maxPrice) }),
    }
  }

  if (brand) where.brand = { contains: brand, mode: 'insensitive' }
  if (rating) where.rating = { gte: new Prisma.Decimal(rating) }

  const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    rating: { rating: 'desc' },
    newest: { createdAt: 'desc' },
  }
  const orderBy = orderByMap[sort ?? 'newest'] ?? { createdAt: 'desc' }

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: limit,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return { products: products.map(formatProduct), total, page, limit, totalPages: Math.ceil(total / limit) }
}

export const getProductBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      specs: { orderBy: { displayOrder: 'asc' } },
    },
  })
  if (!product || !product.isActive) return null
  return formatProduct(product)
}

export const getRelatedProducts = async (categoryId: number, excludeSlug: string, limit = 10) => {
  const products = await prisma.product.findMany({
    where: { categoryId, slug: { not: excludeSlug }, isActive: true },
    take: limit,
    include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { rating: 'desc' },
  })
  return products.map(formatProduct)
}

export const getDistinctBrands = async (categorySlug?: string) => {
  const where: Prisma.ProductWhereInput = { isActive: true, brand: { not: null } }
  if (categorySlug) where.category = { slug: categorySlug }
  const results = await prisma.product.findMany({
    where, select: { brand: true }, distinct: ['brand'], orderBy: { brand: 'asc' },
  })
  return results.map(r => r.brand).filter(Boolean)
}
