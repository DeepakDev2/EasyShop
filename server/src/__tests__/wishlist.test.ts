import request from 'supertest'
import express from 'express'
import { prisma } from '../config/db'
import wishlistRoutes from '../routes/wishlist.routes'
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
app.use('/api/v1/wishlist', wishlistRoutes)
app.use(errorHandler)

const prismaMock = prisma as jest.Mocked<typeof prisma>

const mockWishlistItem = {
  id: 1,
  userId: 1,
  productId: 10,
  createdAt: new Date(),
  product: {
    id: 10,
    name: 'Test Product',
    price: 999,
    images: [{ url: 'https://picsum.photos/200', isPrimary: true }],
  },
}

describe('Wishlist Routes integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/v1/wishlist', () => {
    it('returns the user\'s wishlist successfully', async () => {
      ;(prismaMock.wishlistItem.findMany as jest.Mock).mockResolvedValue([mockWishlistItem])

      const res = await request(app).get('/api/v1/wishlist')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data[0].productId).toBe(10)
    })
  })

  describe('POST /api/v1/wishlist/:productId', () => {
    it('removes the product from wishlist if it is already wishlisted', async () => {
      ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue({ id: 10, isActive: true })
      ;(prismaMock.wishlistItem.findUnique as jest.Mock).mockResolvedValue(mockWishlistItem)
      ;(prismaMock.wishlistItem.delete as jest.Mock).mockResolvedValue(mockWishlistItem)

      const res = await request(app).post('/api/v1/wishlist/10')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.action).toBe('removed')
    })

    it('adds the product to wishlist if it is not already wishlisted', async () => {
      ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue({ id: 10, isActive: true })
      ;(prismaMock.wishlistItem.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prismaMock.wishlistItem.create as jest.Mock).mockResolvedValue(mockWishlistItem)

      const res = await request(app).post('/api/v1/wishlist/10')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.action).toBe('added')
    })

    it('returns 404 if the product does not exist or is inactive', async () => {
      ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null)

      const res = await request(app).post('/api/v1/wishlist/999')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.error).toMatch(/product not found/i)
    })

    it('returns 400 if productId is invalid (non-numeric)', async () => {
      const res = await request(app).post('/api/v1/wishlist/invalid')

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.code).toBe('BAD_REQUEST')
    })
  })
})
