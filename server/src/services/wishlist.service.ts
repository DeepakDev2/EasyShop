import { prisma } from '../config/db'
import { createError } from '../middleware/errorHandler'

export const toggleWishlist = async (userId: number, productId: number) => {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  })
  if (existing) {
    await prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } })
    return { added: false }
  }
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
  if (!product) throw createError('Product not found', 404, 'NOT_FOUND')
  await prisma.wishlistItem.create({ data: { userId, productId } })
  return { added: true }
}

export const getWishlist = async (userId: number) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { addedAt: 'desc' },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
      },
    },
  })
  return items.map(i => i.product)
}
