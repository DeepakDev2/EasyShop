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
  return results.map((r: any) => r.brand).filter(Boolean)
}

import { CreateProductInput, UpdateProductInput } from '../schemas/product.schema'
import { slugify } from '../utils/helpers'
import { createError } from '../middleware/errorHandler'

export const createProduct = async (data: CreateProductInput) => {
  const slug = data.slug || slugify(data.name)
  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) throw createError('Product slug already exists', 409, 'SLUG_EXISTS')

  const { images, specs, ...rest } = data

  const product = await prisma.$transaction(async (tx: any) => {
    return tx.product.create({
      data: {
        ...rest,
        slug,
        images: images?.length ? {
          create: images.map((img, idx) => ({
            url: img.url,
            isPrimary: img.isPrimary ?? false,
            displayOrder: img.displayOrder ?? idx,
          }))
        } : undefined,
        specs: specs?.length ? {
          create: specs.map((spec, idx) => ({
            specKey: spec.specKey,
            specValue: spec.specValue,
            displayOrder: spec.displayOrder ?? idx,
          }))
        } : undefined,
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specs: { orderBy: { displayOrder: 'asc' } },
      }
    })
  })

  return formatProduct(product)
}

export const updateProduct = async (id: number, data: UpdateProductInput) => {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) throw createError('Product not found', 404, 'NOT_FOUND')

  let slug = data.slug
  if (data.name && !slug) {
    slug = slugify(data.name)
  }

  if (slug && slug !== existing.slug) {
    const duplicate = await prisma.product.findUnique({ where: { slug } })
    if (duplicate) throw createError('Product slug already exists', 409, 'SLUG_EXISTS')
  }

  const { images, specs, ...rest } = data

  const product = await prisma.$transaction(async (tx: any) => {
    if (images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } })
    }
    if (specs !== undefined) {
      await tx.productSpec.deleteMany({ where: { productId: id } })
    }

    return tx.product.update({
      where: { id },
      data: {
        ...rest,
        ...(slug && { slug }),
        ...(images !== undefined && {
          images: {
            create: images.map((img, idx) => ({
              url: img.url,
              isPrimary: img.isPrimary ?? false,
              displayOrder: img.displayOrder ?? idx,
            }))
          }
        }),
        ...(specs !== undefined && {
          specs: {
            create: specs.map((spec, idx) => ({
              specKey: spec.specKey,
              specValue: spec.specValue,
              displayOrder: spec.displayOrder ?? idx,
            }))
          }
        }),
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specs: { orderBy: { displayOrder: 'asc' } },
      }
    })
  })

  return formatProduct(product)
}

export const deleteProduct = async (id: number) => {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) throw createError('Product not found', 404, 'NOT_FOUND')

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: {
      category: true,
      images: { orderBy: { displayOrder: 'asc' } },
      specs: { orderBy: { displayOrder: 'asc' } },
    }
  })

  return formatProduct(product)
}
