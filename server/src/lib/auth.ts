import crypto from 'node:crypto'
import type { RequestHandler } from 'express'
import { env } from '../env'

/** Minimal signed bearer token (HMAC-SHA256) for the demo admin. Stateless, 8h expiry. */
const TTL_MS = 8 * 60 * 60 * 1000

const sign = (payload: string) => crypto.createHmac('sha256', env.ADMIN_TOKEN_SECRET).update(payload).digest('base64url')

export function issueToken(user: string) {
  const exp = Date.now() + TTL_MS
  const payload = Buffer.from(JSON.stringify({ sub: user, exp })).toString('base64url')
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(exp).toISOString() }
}

export function verifyToken(token: string): { sub: string; exp: number } | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = sign(payload)
  const a = Buffer.from(sig), b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub: string; exp: number }
    return data.exp > Date.now() ? data : null
  } catch { return null }
}

/** constant-time string comparison (hash first so lengths match) */
export function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest()
  const hb = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export const requireAdmin: RequestHandler = (req, res, next) => {
  const h = req.headers.authorization ?? ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  const data = token && verifyToken(token)
  if (!data) { res.status(401).json({ error: 'Unauthorized' }); return }
  res.locals.admin = data.sub
  next()
}
