import { prisma } from '../config/db'
import { generateOrderNumber } from '../utils/helpers'
import { CreateOrderInput } from '../schemas/order.schema'
import { createError } from '../middleware/errorHandler'
import { sendOrderConfirmation } from '../utils/email'

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

    await tx.cartItem.deleteMany({ where: { userId } })
    return newOrder
  })

  // Fire-and-forget email — don't await, won't block the API response
  prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
    .then(user => {
      if (!user) return
      return sendOrderConfirmation({
        orderNumber: order.orderNumber,
        userEmail: user.email,
        userName: user.name,
        items: order.orderItems.map(i => ({
          productName: i.productName,
          productImg: i.productImg,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
        })),
        shippingAddress: order.shippingAddress ?? '',
        total: Number(order.total),
        placedAt: order.placedAt,
      })
    })
    .catch(err => console.error('[Email] Failed to send order confirmation:', err.message))

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

export const cancelOrder = async (orderId: number, userId: number) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  })
  if (!order) throw createError('Order not found', 404, 'NOT_FOUND')
  if (order.userId !== userId) throw createError('Access denied', 403, 'FORBIDDEN')
  if (!['placed', 'confirmed'].includes(order.status))
    throw createError('Order cannot be cancelled at this stage', 400, 'CANNOT_CANCEL')

  // Restore stock and update status in a single transaction
  const updated = await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId! },
        data: { stock: { increment: item.quantity } },
      })
    }
    return tx.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', paymentStatus: 'refunded' },
    })
  })
  return updated
}
