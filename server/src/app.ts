import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { prisma } from './db'
import { env, corsOrigins } from './env'
import { errorHandler } from './lib/http'
import { catalog } from './routes/catalog'
import { checkout } from './routes/checkout'
import { admin } from './routes/admin'

const started = Date.now()

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', env.TRUST_PROXY)
  app.use(helmet())
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || corsOrigins.includes(origin)),
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }))
  app.use(express.json({ limit: '32kb' }))

  const api = express.Router()
  api.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`
      res.json({ status: 'ok', db: 'up', service: 'tanah-shop-api', uptimeSec: Math.round((Date.now() - started) / 1000) })
    } catch {
      res.status(503).json({ status: 'degraded', db: 'down', service: 'tanah-shop-api' })
    }
  })
  api.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }))
  api.use(catalog)
  api.use(checkout)
  api.use('/admin', admin)
  api.use((_req, res) => { res.status(404).json({ error: 'Not found' }) })

  app.use('/api', api)
  app.use((_req, res) => { res.status(404).json({ error: 'Not found' }) })
  app.use(errorHandler)
  return app
}
