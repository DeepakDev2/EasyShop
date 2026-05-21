import request from 'supertest'
import express from 'express'
import { prisma } from '../config/db'
import orderRoutes from '../routes/order.routes'
import { errorHandler } from '../middleware/errorHandler'

// Mock Resend email — prevents "Missing API key" error on import
jest.mock('../utils/email', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
}))

// Mock authenticate middleware — bypass JWT entirely in tests
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 1, email: 'test@example.com', role: 'customer' }
    next()
  },
}))

const app = express()
app.use(express.json())
app.use('/api/v1/orders', orderRoutes)
app.use(errorHandler)

const prismaMock = prisma as jest.Mocked<typeof prisma>

const mockOrder = {
  id: 1, orderNumber: 'OD20260521001', userId: 1,
  status: 'placed', paymentMethod: 'cod', paymentStatus: 'pending',
  total: 74999,
  shippingAddress: 'Test User, 123 Street, Bangalore, Karnataka - 560034 | Ph: 9876543210',
  placedAt: new Date(), updatedAt: new Date(),
  orderItems: [{
    id: 1, orderId: 1, productId: 1, productName: 'Samsung S24',
    productImg: null, quantity: 1, unitPrice: 74999, totalPrice: 74999,
    product: { id: 1, name: 'Samsung S24', images: [] },
  }],
}

const validOrderBody = {
  items: [{ productId: 1, qty: 1, price: 74999 }],
  address: {
    fullName: 'Test User', phone: '9876543210', line1: '123 Street',
    line2: '', city: 'Bangalore', state: 'Karnataka', pincode: '560034', type: 'home',
  },
}

describe('POST /api/v1/orders', () => {
  it('places an order successfully with valid data', async () => {
    ;(prismaMock.product.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Samsung S24', stock: 10, price: 74999, isActive: true, images: [] },
    ])
    ;(prismaMock.$transaction as jest.Mock).mockResolvedValue(mockOrder)
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ email: 'test@example.com', name: 'Test User' })

    const res = await request(app)
      .post('/api/v1/orders')
      .send(validOrderBody)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.orderNumber).toBe('OD20260521001')
  })

  it('returns 400 if address fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ items: [{ productId: 1, qty: 1, price: 100 }], address: {} })

    expect(res.status).toBe(400)
  })

  it('returns 400 if items array is empty', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ ...validOrderBody, items: [] })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/orders/my', () => {
  it('returns user orders', async () => {
    ;(prismaMock.order.findMany as jest.Mock).mockResolvedValue([mockOrder])

    const res = await request(app).get('/api/v1/orders/my')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data[0].orderNumber).toBe('OD20260521001')
  })

  it('returns empty array when user has no orders', async () => {
    ;(prismaMock.order.findMany as jest.Mock).mockResolvedValue([])

    const res = await request(app).get('/api/v1/orders/my')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(0)
  })
})

describe('GET /api/v1/orders/:id', () => {
  it('returns 404 for non-existent order', async () => {
    ;(prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/orders/9999')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('returns 403 if order belongs to another user', async () => {
    ;(prismaMock.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, userId: 99 })

    const res = await request(app).get('/api/v1/orders/1')
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid (non-numeric) order ID', async () => {
    const res = await request(app).get('/api/v1/orders/not-a-number')
    expect(res.status).toBe(400)
  })

  it('returns full order detail for the owner', async () => {
    ;(prismaMock.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

    const res = await request(app).get('/api/v1/orders/1')
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(1)
    expect(res.body.data.orderNumber).toBe('OD20260521001')
  })
})

describe('PUT /api/v1/orders/:id/cancel', () => {
  it('cancels a placed order and restores stock', async () => {
    ;(prismaMock.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'placed' })
    ;(prismaMock.$transaction as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'cancelled' })

    const res = await request(app).put('/api/v1/orders/1/cancel')
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('cancelled')
  })

  it('returns 400 when trying to cancel a shipped order', async () => {
    ;(prismaMock.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'shipped' })

    const res = await request(app).put('/api/v1/orders/1/cancel')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/cannot be cancelled/i)
  })

  it('returns 403 when user tries to cancel another user\'s order', async () => {
    ;(prismaMock.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, userId: 99 })

    const res = await request(app).put('/api/v1/orders/1/cancel')
    expect(res.status).toBe(403)
  })
})
