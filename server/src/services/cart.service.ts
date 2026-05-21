import { prisma } from '../config/db'
import { createError } from '../middleware/errorHandler'

const cartInclude = {
  product: {
    include: {
      images: { orderBy: { displayOrder: 'asc' as const } },
      category: { select: { id: true, name: true, slug: true } },
    },
  },
}

export const getCart = async (userId: number) => {
  return prisma.cartItem.findMany({
    where: { userId },
    include: cartInclude,
    orderBy: { addedAt: 'asc' },
  })
}

export const upsertCartItem = async (userId: number, productId: number, quantity: number) => {
  const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
  if (!product) throw createError('Product not found', 404, 'NOT_FOUND')
  if (product.stock < quantity) throw createError(`Only ${product.stock} left in stock`, 400, 'OUT_OF_STOCK')

  return prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity: Math.min(product.stock, quantity) },
    include: cartInclude,
  })
}

export const updateCartItem = async (userId: number, itemId: number, quantity: number) => {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { product: true } })
  if (!item || item.userId !== userId) throw createError('Cart item not found', 404, 'NOT_FOUND')
  if (item.product.stock < quantity) throw createError(`Only ${item.product.stock} left in stock`, 400, 'OUT_OF_STOCK')

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: cartInclude,
  })
}

export const removeCartItem = async (userId: number, itemId: number) => {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } })
  if (!item || item.userId !== userId) throw createError('Cart item not found', 404, 'NOT_FOUND')
  await prisma.cartItem.delete({ where: { id: itemId } })
}

export const clearCart = async (userId: number) => {
  await prisma.cartItem.deleteMany({ where: { userId } })
}

export const mergeCartItems = async (userId: number, items: { productId: number; quantity: number }[]) => {
  for (const { productId, quantity } of items) {
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } })
    if (!product) continue

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    })
    const mergedQty = Math.min(product.stock, (existing?.quantity ?? 0) + quantity)
    if (mergedQty < 1) continue

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, quantity: mergedQty },
      update: { quantity: mergedQty },
    })
  }
  return getCart(userId)
}
