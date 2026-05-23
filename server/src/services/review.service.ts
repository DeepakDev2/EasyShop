import { prisma } from '../config/db'
import { createError } from '../middleware/errorHandler'
import type { CreateReviewInput } from '../schemas/review.schema'

async function recomputeProductRating(productId: number) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  })
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      ratingCount: agg._count.rating,
    },
  })
}

async function hasVerifiedPurchase(userId: number, productId: number): Promise<boolean> {
  const item = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        // Any active order counts — app has no delivery advancement workflow
        status: { notIn: ['cancelled'] },
      },
    },
  })
  return !!item
}

export const getProductReviews = async (productId: number, page: number, limit: number) => {
  const skip = (page - 1) * limit
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { name: true } } },
    }),
    prisma.review.count({ where: { productId } }),
  ])

  // Rating breakdown (count per star 1–5)
  const breakdown = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: { rating: true },
  })
  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  breakdown.forEach((b: any) => { ratingBreakdown[b.rating] = b._count.rating })

  return { reviews, total, page, limit, ratingBreakdown }
}

export const canUserReview = async (userId: number, productId: number) => {
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  })
  const purchased = await hasVerifiedPurchase(userId, productId)
  return {
    canReview: purchased,
    hasReviewed: !!existing,
    existingReview: existing ?? null,
  }
}

export const upsertReview = async (userId: number, input: CreateReviewInput) => {
  const { productId, rating, title, body } = input

  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
  if (!product) throw createError('Product not found', 404, 'NOT_FOUND')

  const verifiedPurchase = await hasVerifiedPurchase(userId, productId)
  if (!verifiedPurchase) throw createError('You can only review products you have purchased', 403, 'FORBIDDEN')

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, rating, title, body, verifiedPurchase: true },
    update: { rating, title, body, verifiedPurchase: true },
    include: { user: { select: { name: true } } },
  })

  await recomputeProductRating(productId)
  return review
}

export const deleteReview = async (reviewId: number, userId: number, role: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) throw createError('Review not found', 404, 'NOT_FOUND')
  if (review.userId !== userId && role !== 'admin') throw createError('Not authorized', 403, 'FORBIDDEN')

  await prisma.review.delete({ where: { id: reviewId } })
  await recomputeProductRating(review.productId)
}
