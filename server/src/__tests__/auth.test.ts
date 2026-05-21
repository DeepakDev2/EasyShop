import request from 'supertest'
import express from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/db'
import authRoutes from '../routes/auth.routes'
import { errorHandler } from '../middleware/errorHandler'

// Set JWT_SECRET before any module reads it
process.env.JWT_SECRET = 'test-secret-key-for-jest'

const app = express()
app.use(express.json())
app.use('/api/v1/auth', authRoutes)
app.use(errorHandler) // ← MUST be last for JSON error responses

const prismaMock = prisma as jest.Mocked<typeof prisma>

describe('POST /api/v1/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prismaMock.user.create as jest.Mock).mockResolvedValue({
      id: 1, name: 'Test User', email: 'test@example.com',
      phone: null, role: 'customer', createdAt: new Date(),
    })

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('test@example.com')
  })

  it('returns 409 if email already exists', async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1, email: 'taken@example.com',
    })

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'taken@example.com', password: 'password123' })

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'no-name@example.com', password: 'pass123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 if password is too short (min 6 chars)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@example.com', password: '123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/auth/login', () => {
  const hashedPw = bcrypt.hashSync('password123', 4) // low rounds for speed

  it('returns 200 and a token with valid credentials', async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1, name: 'Test User', email: 'test@example.com',
      password: hashedPw, phone: null, role: 'customer',
    })

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.token).toBeDefined()
    expect(typeof res.body.token).toBe('string')
  })

  it('returns 401 with wrong password', async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1, email: 'test@example.com', password: hashedPw, name: 'Test',
    })

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('returns 401 if user does not exist', async () => {
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@example.com', password: 'password123' })

    expect(res.status).toBe(401)
  })

  it('returns 400 with invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'password123' })

    expect(res.status).toBe(400)
  })
})
