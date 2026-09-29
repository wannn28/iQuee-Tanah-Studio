import { z } from 'zod'
import type { PromoCode } from '@prisma/client'
import { prisma } from '../db'
import { HttpError, cents } from './http'
import type { ProductOption } from './serialize'

/** Shipping rules live on the server; the client only displays them. */
export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard', eta: '5–8 business days', priceCents: 800 },
  { id: 'express', name: 'Express', eta: '2–3 business days', priceCents: 2200 },
] as const
export const FREE_SHIPPING_OVER_CENTS = 12000

export const cartLineSchema = z.object({
  productId: z.string().trim().min(1).max(32),
  options: z.record(z.string().max(40), z.string().max(60)).default({}),
  qty: z.number().int().min(1).max(99),
})
export const quoteSchema = z.object({
  lines: z.array(cartLineSchema).min(1, 'Cart is empty').max(50),
  promoCode: z.string().trim().toUpperCase().max(32).optional().nullable(),
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
})
export type QuoteInput = z.infer<typeof quoteSchema>

export async function findPromo(code: string | null | undefined): Promise<PromoCode | null> {
  if (!code) return null
  const promo = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } })
  return promo && promo.active ? promo : null
}

/**
 * Re-prices a cart from the database. Client-sent prices are never trusted:
 * only product ids, option labels and quantities are accepted.
 */
export async function quoteCart(input: QuoteInput, { strictPromo = false } = {}) {
  const ids = [...new Set(input.lines.map((l) => l.productId))]
  const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } })
  const byId = new Map(products.map((p) => [p.id, p]))

  const lines = input.lines.map((l, i) => {
    const p = byId.get(l.productId)
    if (!p) throw new HttpError(422, `Product ${l.productId} is not available`, { line: i })
    const opts = p.options as unknown as ProductOption[]
    const unknown = Object.keys(l.options).filter((k) => !opts.some((o) => o.name === k))
    if (unknown.length) throw new HttpError(422, `Unknown option "${unknown[0]}" for ${p.name}`, { line: i })
    let unit = p.priceCents
    const chosen: Record<string, string> = {}
    for (const o of opts) {
      const label = l.options[o.name] ?? o.values[0]?.label
      const v = o.values.find((x) => x.label === label)
      if (!v) throw new HttpError(422, `Invalid ${o.name} "${label}" for ${p.name}`, { line: i })
      chosen[o.name] = v.label
      unit += Math.round((v.priceDelta ?? 0) * 100)
    }
    const images = p.images as { src: string }[]
    return {
      productId: p.id, slug: p.slug, name: p.name, image: images[0]?.src ?? '',
      options: chosen, qty: l.qty, unitPriceCents: unit, lineTotalCents: unit * l.qty,
    }
  })

  const promo = await findPromo(input.promoCode)
  if (input.promoCode && !promo && strictPromo) throw new HttpError(422, `Promo code "${input.promoCode}" is not valid`)

  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0)
  const discountCents = promo ? Math.round((subtotalCents * promo.percentOff) / 100) : 0
  const after = subtotalCents - discountCents
  const method = SHIPPING_METHODS.find((m) => m.id === input.shippingMethod) ?? SHIPPING_METHODS[0]
  const freeStd = method.id === 'standard' && (after >= FREE_SHIPPING_OVER_CENTS || !!promo?.freeShipping)
  const shippingCents = freeStd ? 0 : method.priceCents
  const totalCents = after + shippingCents

  return { lines, promo, method, subtotalCents, discountCents, shippingCents, totalCents }
}

export function quoteDto(q: Awaited<ReturnType<typeof quoteCart>>, requestedPromo?: string | null) {
  return {
    lines: q.lines.map((l) => ({ ...l, unitPrice: cents(l.unitPriceCents), lineTotal: cents(l.lineTotalCents) })),
    promo: q.promo ? { code: q.promo.code, label: q.promo.label } : null,
    promoError: requestedPromo && !q.promo ? `“${requestedPromo}” isn’t a valid code.` : undefined,
    shipping: { id: q.method.id, name: q.method.name, eta: q.method.eta, price: cents(q.shippingCents) },
    subtotal: cents(q.subtotalCents),
    discount: cents(q.discountCents),
    total: cents(q.totalCents),
    currency: 'USD',
  }
}
