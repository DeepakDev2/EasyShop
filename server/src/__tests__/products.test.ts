import request from 'supertest'
import express from 'express'
import { prisma } from '../config/db'
import productRoutes from '../routes/product.routes'
import categoryRoutes from '../routes/category.routes'
import { errorHandler } from '../middleware/errorHandler'

const app = express()
app.use(express.json())
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use(errorHandler)

const prismaMock = prisma as jest.Mocked<typeof prisma>

// Mock service returns — products response is { products: [...], total, page, totalPages }
const mockProduct = {
  id: 1, name: 'Samsung Galaxy S24 Ultra 5G', slug: 'samsung-galaxy-s24',
  description: 'Flagship smartphone', price: 74999, originalPrice: 89999,
  discountPct: 17, stock: 50, rating: 4.5, ratingCount: 1234,
  brand: 'Samsung', isActive: true, createdAt: new Date(), categoryId: 1,
  category: { id: 1, name: 'Mobiles', slug: 'mobiles' },
  images: [{ id: 1, url: 'https://picsum.photos/400', isPrimary: true, displayOrder: 0 }],
  specs: [{ id: 1, specKey: 'RAM', specValue: '8GB', displayOrder: 0 }],
}

// formatProduct helper transforms the DB shape — we simulate the formatted result
const formattedProduct = {
  id: 1, name: 'Samsung Galaxy S24 Ultra 5G', slug: 'samsung-galaxy-s24',
  price: 74999, originalPrice: 89999, discountPct: 17, stock: 50,
  rating: 4.5, ratingCount: 1234, brand: 'Samsung', isActive: true,
  image: 'https://picsum.photos/400', images: [{ url: 'https://picsum.photos/400', isPrimary: true }],
  category: 'Mobiles', categorySlug: 'mobiles', categoryId: 1,
}

describe('GET /api/v1/products', () => {
  beforeEach(() => {
    ;(prismaMock.product.findMany as jest.Mock).mockResolvedValue([mockProduct])
    ;(prismaMock.product.count as jest.Mock).mockResolvedValue(1)
  })

  it('returns 200 with paginated products', async () => {
    const res = await request(app).get('/api/v1/products')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('returns products key with array in response body', async () => {
    const res = await request(app).get('/api/v1/products')
    // Response is { success, products: [...], total, page, totalPages }
    expect(Array.isArray(res.body.products)).toBe(true)
    expect(res.body.total).toBeDefined()
    expect(res.body.page).toBeDefined()
    expect(res.body.totalPages).toBeDefined()
  })

  it('accepts ?q= search filter', async () => {
    const res = await request(app).get('/api/v1/products?q=samsung')
    expect(res.status).toBe(200)
    expect(prismaMock.product.findMany).toHaveBeenCalled()
  })

  it('accepts ?category= filter', async () => {
    const res = await request(app).get('/api/v1/products?category=mobiles')
    expect(res.status).toBe(200)
  })

  it('accepts ?sort=price_asc', async () => {
    const res = await request(app).get('/api/v1/products?sort=price_asc')
    expect(res.status).toBe(200)
  })

  it('accepts ?minPrice and ?maxPrice filters', async () => {
    const res = await request(app).get('/api/v1/products?minPrice=1000&maxPrice=50000')
    expect(res.status).toBe(200)
  })

  it('accepts ?page= and ?limit= for pagination', async () => {
    const res = await request(app).get('/api/v1/products?page=2&limit=10')
    expect(res.status).toBe(200)
    expect(res.body.page).toBe(2)
  })
})

describe('GET /api/v1/products/:slug', () => {
  it('returns a single product by slug', async () => {
    ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)
    ;(prismaMock.product.findMany as jest.Mock).mockResolvedValue([])

    const res = await request(app).get('/api/v1/products/samsung-galaxy-s24')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.slug).toBe('samsung-galaxy-s24')
  })

  it('returns 404 for unknown slug', async () => {
    ;(prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null)
    const res = await request(app).get('/api/v1/products/nonexistent-product')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /api/v1/categories', () => {
  it('returns list of categories with productCount', async () => {
    ;(prismaMock.category.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'Mobiles', slug: 'mobiles', iconUrl: null, parentId: null, _count: { products: 5 } },
      { id: 2, name: 'Electronics', slug: 'electronics', iconUrl: null, parentId: null, _count: { products: 8 } },
    ])

    const res = await request(app).get('/api/v1/categories')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(2)
    expect(res.body.data[0]).toHaveProperty('productCount')
  })
})
