import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { OrderStatus } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db'
import { env } from '../env'
import { ah, parse, HttpError, cents } from '../lib/http'
import { issueToken, requireAdmin, safeEqual } from '../lib/auth'

export const admin = Router()

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many login attempts, try again later.' } })

admin.post('/login', loginLimiter, ah(async (req, res) => {
  const { username, password } = parse(z.object({ username: z.string().max(80), password: z.string().max(200) }), req.body)
  const ok = safeEqual(username, env.ADMIN_USER) && safeEqual(password, env.ADMIN_PASSWORD)
  if (!ok) throw new HttpError(401, 'Wrong username or password')
  res.json({ ...issueToken(username), user: username })
}))

admin.use(requireAdmin)

/** The demo admin is public, so shopper PII is masked in admin responses. */
const maskEmail = (e: string) => {
  const [u, d] = e.split('@')
  return `${u.slice(0, 1)}${'•'.repeat(Math.max(2, Math.min(6, u.length - 1)))}@${d ?? ''}`
}

admin.get('/stats', ah(async (_req, res) => {
  const [agg, byStatus, top] = await Promise.all([
    prisma.order.aggregate({ _count: true, _sum: { totalCents: true }, _avg: { totalCents: true } }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
    prisma.orderItem.groupBy({ by: ['productName'], _sum: { qty: true }, orderBy: { _sum: { qty: 'desc' } }, take: 5 }),
  ])
  res.json({
    orders: agg._count, revenue: cents(agg._sum.totalCents ?? 0), averageOrder: cents(Math.round(agg._avg.totalCents ?? 0)),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    topProducts: top.map((t) => ({ name: t.productName, qty: t._sum.qty ?? 0 })),
  })
}))

admin.get('/orders', ah(async (req, res) => {
  const q = parse(z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    status: z.nativeEnum(OrderStatus).optional(),
  }), req.query)
  const where = q.status ? { status: q.status } : {}
  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize,
      include: { items: { select: { productName: true, qty: true, options: true, lineTotalCents: true } } },
    }),
  ])
  res.json({
    page: q.page, pageSize: q.pageSize, total,
    items: rows.map((o) => ({
      number: o.number, status: o.status, placedAt: o.createdAt.toISOString(),
      customer: `${o.firstName} ${o.lastName.slice(0, 1)}.`, email: maskEmail(o.email),
      destination: `${o.city}, ${o.country}`, shipping: o.shippingMethod, payment: o.paymentLabel, promo: o.promoCode,
      itemCount: o.items.reduce((s, i) => s + i.qty, 0),
      items: o.items.map((i) => ({ name: i.productName, qty: i.qty, options: Object.values(i.options as Record<string, string>).join(' · '), total: cents(i.lineTotalCents) })),
      subtotal: cents(o.subtotalCents), discount: cents(o.discountCents), shippingCost: cents(o.shippingCents), total: cents(o.totalCents),
    })),
  })
}))

admin.patch('/orders/:number/status', ah(async (req, res) => {
  const number = parse(z.string().regex(/^TNH-\d{6}$/), req.params.number)
  const { status } = parse(z.object({ status: z.nativeEnum(OrderStatus) }), req.body)
  const o = await prisma.order.update({ where: { number }, data: { status } }).catch(() => null)
  if (!o) throw new HttpError(404, 'Order not found')
  res.json({ number: o.number, status: o.status })
}))
