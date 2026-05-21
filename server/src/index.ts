import 'dotenv/config'
import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'

const app: Application = express()

// ─── Security & Logging Middleware ───────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(morgan(env.IS_DEVELOPMENT ? 'dev' : 'combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EasyShop API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  })
})

// ─── API Routes ───────────────────────────────────────────────────────────────
import productRoutes from './routes/product.routes'
import categoryRoutes from './routes/category.routes'

app.use('/api/v1/products', productRoutes)
app.use('/api/v1/categories', categoryRoutes)
// app.use('/api/v1/auth', authRoutes)       — Phase 6
// app.use('/api/v1/cart', cartRoutes)       — Phase 4
// app.use('/api/v1/orders', orderRoutes)    — Phase 5
// app.use('/api/v1/addresses', addressRoutes) — Phase 5
// app.use('/api/v1/wishlist', wishlistRoutes) — Phase 7

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'NOT_FOUND',
  })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler)

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🛍️  EasyShop API running on http://localhost:${env.PORT}`)
  console.log(`📦  Environment: ${env.NODE_ENV}`)
  console.log(`🌐  CORS allowed for: ${env.CLIENT_URL}`)
  console.log(`❤️   Health check: http://localhost:${env.PORT}/health\n`)
})

export default app
