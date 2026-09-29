import crypto from 'node:crypto'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db'
import { ah, parse, HttpError, cents } from '../lib/http'
import { FREE_SHIPPING_OVER_CENTS, SHIPPING_METHODS, findPromo, quoteCart, quoteDto, quoteSchema } from '../lib/pricing'

export const checkout = Router()

checkout.get('/shipping-methods', (_req, res) => {
  res.json({
    items: SHIPPING_METHODS.map((m) => ({ id: m.id, name: m.name, eta: m.eta, price: cents(m.priceCents) })),
    freeShippingOver: cents(FREE_SHIPPING_OVER_CENTS),
  })
})

/** POST /api/promo/validate { code } */
checkout.post('/promo/validate', ah(async (req, res) => {
  const { code } = parse(z.object({ code: z.string().trim().min(1, 'Enter a code.').max(32) }), req.body)
  const promo = await findPromo(code)
  if (!promo) {
    // 200 with valid:false (not 404) so a mistyped code isn't logged as a network error in the browser console
    res.json({ valid: false, message: `“${code.toUpperCase()}” isn’t a valid code. Try DEMO10.` })
    return
  }
  res.json({ valid: true, code: promo.code, label: promo.label, percentOff: promo.percentOff, freeShipping: promo.freeShipping })
}))

/** POST /api/cart/quote - server-side pricing of the client cart (prices, promo, shipping) */
checkout.post('/cart/quote', ah(async (req, res) => {
  const input = parse(quoteSchema, req.body)
  const q = await quoteCart(input)
  res.json(quoteDto(q, input.promoCode))
}))

const postal = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/
const orderSchema = quoteSchema.extend({
  customer: z.object({
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z.string().trim().max(40).optional().refine((v) => !v || v.replace(/\D/g, '').length >= 7, 'Phone number looks too short'),
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    address1: z.string().trim().min(4).max(160),
    address2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(1).max(80),
    region: z.string().trim().min(1).max(80),
    postal: z.string().trim().regex(postal, 'Invalid postal code'),
    country: z.string().trim().min(2).max(60),
  }),
  payment: z.discriminatedUnion('method', [
    // demo only: we never receive a full card number, just the last 4 digits for the receipt
    z.object({ method: z.literal('card'), last4: z.string().regex(/^\d{4}$/) }),
    z.object({ method: z.literal('paypal') }),
    z.object({ method: z.literal('bank') }),
  ]),
  /** optional: client-side total, used only to detect stale prices */
  expectedTotal: z.number().nonnegative().optional(),
})

const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many orders from this IP, try again later.' } })

const newNumber = () => `TNH-${crypto.randomInt(100000, 1000000)}`

/** POST /api/orders - create an order with server-computed totals */
checkout.post('/orders', orderLimiter, ah(async (req, res) => {
  const input = parse(orderSchema, req.body)
  const q = await quoteCart(input, { strictPromo: true })
  const c = input.customer
  const paymentLabel = input.payment.method === 'card' ? `Demo card ending ${input.payment.last4}` : input.payment.method === 'paypal' ? 'PayPal (demo)' : 'Bank transfer (demo)'
  const accessToken = crypto.randomBytes(24).toString('base64url')

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await prisma.order.create({
        data: {
          number: newNumber(), accessToken,
          email: c.email, phone: c.phone || null, firstName: c.firstName, lastName: c.lastName,
          address1: c.address1, address2: c.address2 || null, city: c.city, region: c.region, postal: c.postal, country: c.country,
          shippingMethod: q.method.id, shippingCents: q.shippingCents,
          paymentMethod: input.payment.method, paymentLabel,
          promoCode: q.promo?.code ?? null,
          subtotalCents: q.subtotalCents, discountCents: q.discountCents, totalCents: q.totalCents,
          items: { create: q.lines.map((l) => ({ productId: l.productId, productName: l.name, image: l.image, options: l.options, unitPriceCents: l.unitPriceCents, qty: l.qty, lineTotalCents: l.lineTotalCents })) },
        },
      })
      res.status(201).json({
        number: order.number, accessToken, total: cents(order.totalCents),
        priceChanged: input.expectedTotal != null && Math.abs(input.expectedTotal - cents(order.totalCents)) > 0.009,
      })
      return
    } catch (e) {
      // unique collision on order number -> retry with a new one
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue
      throw e
    }
  }
  throw new HttpError(503, 'Could not allocate an order number, please retry')
}))

/** GET /api/orders/:number?token=... - order confirmation (token proves you placed it) */
checkout.get('/orders/:number', ah(async (req, res) => {
  const number = parse(z.string().regex(/^TNH-\d{6}$/), req.params.number)
  const token = parse(z.string().min(10).max(64), req.query.token)
  const o = await prisma.order.findUnique({ where: { number }, include: { items: { orderBy: { id: 'asc' } } } })
  if (!o || o.accessToken.length !== token.length || !crypto.timingSafeEqual(Buffer.from(o.accessToken), Buffer.from(token))) {
    throw new HttpError(404, 'Order not found')
  }
  const method = SHIPPING_METHODS.find((m) => m.id === o.shippingMethod) ?? SHIPPING_METHODS[0]
  res.json({
    number: o.number, status: o.status, placedAt: o.createdAt.toISOString(),
    email: o.email, name: `${o.firstName} ${o.lastName}`.trim(),
    address: [o.address1, o.address2, `${o.city}, ${o.region} ${o.postal}`, o.country].filter(Boolean),
    shipping: { name: method.name, eta: method.eta, price: cents(o.shippingCents) },
    payment: o.paymentLabel, promo: o.promoCode,
    lines: o.items.map((i) => ({
      name: i.productName, image: i.image, qty: i.qty, unitPrice: cents(i.unitPriceCents), total: cents(i.lineTotalCents),
      options: Object.values(i.options as Record<string, string>).join(' · '),
    })),
    subtotal: cents(o.subtotalCents), discount: cents(o.discountCents), total: cents(o.totalCents),
  })
}))
