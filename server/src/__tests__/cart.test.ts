import request from 'supertest'
import express from 'express'
import { prisma } from '../config/db'
import cartRoutes from '../routes/cart.routes'
import { errorHandler } from '../middleware/errorHandler'

// Mock authenticate middleware to bypass JWT in tests
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 1, email: 'test@example.com', role: 'customer' }
    next()
  },
}))

const app = express()
app.use(express.json())
app.use('/api/v1/cart', cartRoutes)
app.use(errorHandler)

const prismaMock = prisma as jest.Mocked<typeof prisma>

const mockCartItem = {
  id: 1,
  userId: 1,
  productId: 10,
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  product: {
    id: 10,
    name: 'Test Product',
    price: 999,
    images: [{ url: 'https://picsum.photos/200', isPrimary: true }],
  },
}

describe('Cart Routes integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/v1/cart', () => {
    it('returns the user\'s cart items successfully', async () => {
      ;(prismaMock.cartItem.findMany as jest.Mock).mockResolvedValue([mockCartItem])

      const res = await request(app).get('/api/v1/cart')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data[0].productId).toBe(10)
    })
  })

  describe('POST /api/v1/cart', () => {
    it('adds or updates a cart item successfully', async () => {
      ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue({ id: 10, stock: 5, price: 999, isActive: true })
      ;(prismaMock.cartItem.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prismaMock.cartItem.create as jest.Mock).mockResolvedValue(mockCartItem)

      const res = await request(app)
        .post('/api/v1/cart')
        .send({ productId: 10, quantity: 2 })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.quantity).toBe(2)
    })

    it('returns 400 if validation fails (e.g. quantity is 0)', async () => {
      const res = await request(app)
        .post('/api/v1/cart')
        .send({ productId: 10, quantity: 0 })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PUT /api/v1/cart/:itemId', () => {
    it('updates quantity of an existing cart item', async () => {
      ;(prismaMock.cartItem.findUnique as jest.Mock).mockResolvedValue(mockCartItem)
      ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue({ id: 10, stock: 10, price: 999, isActive: true })
      ;(prismaMock.cartItem.update as jest.Mock).mockResolvedValue({ ...mockCartItem, quantity: 4 })

      const res = await request(app)
        .put('/api/v1/cart/1')
        .send({ quantity: 4 })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.quantity).toBe(4)
    })

    it('returns 404 if item does not exist or does not belong to user', async () => {
      ;(prismaMock.cartItem.findUnique as jest.Mock).mockResolvedValue(null)

      const res = await request(app)
        .put('/api/v1/cart/999')
        .send({ quantity: 4 })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/v1/cart/:itemId', () => {
    it('removes a cart item successfully', async () => {
      ;(prismaMock.cartItem.findUnique as jest.Mock).mockResolvedValue(mockCartItem)
      ;(prismaMock.cartItem.delete as jest.Mock).mockResolvedValue(mockCartItem)

      const res = await request(app).delete('/api/v1/cart/1')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Item removed')
    })
  })

  describe('DELETE /api/v1/cart', () => {
    it('clears all items in user\'s cart', async () => {
      ;(prismaMock.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 1 })

      const res = await request(app).delete('/api/v1/cart')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Cart cleared')
    })
  })

  describe('POST /api/v1/cart/merge', () => {
    it('merges guest cart items', async () => {
      ;(prismaMock.cartItem.findMany as jest.Mock).mockResolvedValue([])
      ;(prismaMock.product.findMany as jest.Mock).mockResolvedValue([
        { id: 10, stock: 10, price: 999, isActive: true },
      ])
      ;(prismaMock.cartItem.create as jest.Mock).mockResolvedValue(mockCartItem)

      const res = await request(app)
        .post('/api/v1/cart/merge')
        .send({ items: [{ productId: 10, quantity: 2 }] })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
