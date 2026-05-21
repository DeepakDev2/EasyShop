import { prisma } from '../config/db'
import { generateOrderNumber } from '../utils/helpers'
import { CreateOrderInput } from '../schemas/order.schema'
import { createError } from '../middleware/errorHandler'

export const createOrder = async (userId: number, input: CreateOrderInput) => {
  const productIds = input.items.map(i => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })

  if (products.length !== productIds.length)
    throw createError('One or more products are unavailable', 400, 'PRODUCT_UNAVAILABLE')

  for (const item of input.items) {
    const p = products.find(p => p.id === item.productId)!
    if (p.stock < item.qty) throw createError(`Insufficient stock for ${p.name}`, 400, 'OUT_OF_STOCK')
  }

  const total = input.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const orderNumber = generateOrderNumber()
  const { address } = input
  const shippingAddress = `${address.fullName}, ${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} - ${address.pincode} | Ph: ${address.phone}`

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber, userId, total, shippingAddress,
        orderItems: {
          create: input.items.map(i => {
            const p = products.find(p => p.id === i.productId)!
            return {
              productId: i.productId,
              productName: p.name,
              productImg: p.images?.[0]?.url ?? null,
              quantity: i.qty,
              unitPrice: i.price,
              totalPrice: i.price * i.qty,
            }
          }),
        },
      },
      include: { orderItems: { include: { product: true } } },
    })

    for (const item of input.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } })
    }

    return newOrder
  })

  return order
}

export const getUserOrders = async (userId: number) => {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { placedAt: 'desc' },
    include: {
      orderItems: {
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      },
    },
  })
}

export const getOrderById = async (orderId: number, userId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
      },
    },
  })
  if (!order) throw createError('Order not found', 404, 'NOT_FOUND')
  if (order.userId !== userId) throw createError('Access denied', 403, 'FORBIDDEN')
  return order
}
