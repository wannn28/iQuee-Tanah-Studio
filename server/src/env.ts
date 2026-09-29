import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8001),
  DATABASE_URL: z.string().url(),
  /** comma separated list of allowed browser origins */
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
  /** number of reverse proxies in front of the app (nginx + Cloudflare = 2) */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  ADMIN_USER: z.string().min(3).default('demo'),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_TOKEN_SECRET: z.string().min(32, 'ADMIN_TOKEN_SECRET must be at least 32 chars'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}
export const env = parsed.data
export const corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
