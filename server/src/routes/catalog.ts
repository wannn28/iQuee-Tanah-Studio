import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../db'
import { ah, parse, HttpError } from '../lib/http'
import { productDto } from '../lib/serialize'

export const catalog = Router()

catalog.get('/categories', ah(async (_req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: { where: { active: true } } } } },
  })
  res.set('Cache-Control', 'public, max-age=60')
  res.json({ items: cats.map((c) => ({ id: c.id, name: c.name, blurb: c.blurb, image: c.image, productCount: c._count.products })) })
}))

const SORTS = ['featured', 'newest', 'price-asc', 'price-desc', 'name'] as const
const listQuery = z.object({
  category: z.string().trim().max(32).optional(),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(SORTS).default('featured'),
  min: z.coerce.number().min(0).max(100000).optional(),
  max: z.coerce.number().min(0).max(100000).optional(),
  featured: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
})

const ORDER_BY: Record<(typeof SORTS)[number], Prisma.ProductOrderByWithRelationInput[]> = {
  featured: [{ featured: 'desc' }, { id: 'asc' }],
  newest: [{ addedRank: 'desc' }],
  'price-asc': [{ priceCents: 'asc' }, { id: 'asc' }],
  'price-desc': [{ priceCents: 'desc' }, { id: 'asc' }],
  name: [{ name: 'asc' }],
}

/** GET /api/products?category=cups&q=mug&sort=price-asc&min=20&max=80 */
catalog.get('/products', ah(async (req, res) => {
  const q = parse(listQuery, req.query)
  const where: Prisma.ProductWhereInput = { active: true }
  if (q.category) where.categoryId = q.category
  if (q.featured) where.featured = q.featured === 'true'
  if (q.min != null || q.max != null) {
    where.priceCents = { ...(q.min != null ? { gte: Math.round(q.min * 100) } : {}), ...(q.max != null ? { lte: Math.round(q.max * 100) } : {}) }
  }
  if (q.q) {
    // full-text-ish search across name, copy, JSON details and category name (parameterised, case-insensitive)
    const needle = `%${q.q.replace(/[\\%_]/g, (m) => '\\' + m)}%`
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id FROM products p JOIN categories c ON c.id = p.category_id
      WHERE (p.name || ' ' || p.short || ' ' || c.name || ' ' || p.description::text || ' ' || p.details::text) ILIKE ${needle}`
    where.id = { in: rows.map((r) => r.id) }
  }
  const [items, agg] = await Promise.all([
    prisma.product.findMany({ where, orderBy: ORDER_BY[q.sort], take: q.limit }),
    prisma.product.aggregate({ where: { active: true }, _max: { priceCents: true } }),
  ])
  const priceMax = Math.ceil((agg._max.priceCents ?? 0) / 100 / 10) * 10
  res.json({ items: items.map(productDto), total: items.length, priceMax })
}))

/** GET /api/products/:slug -> product + up to 4 related */
catalog.get('/products/:slug', ah(async (req, res) => {
  const slug = parse(z.string().trim().min(1).max(120), req.params.slug)
  const p = await prisma.product.findFirst({ where: { slug, active: true } })
  if (!p) throw new HttpError(404, 'Product not found')
  const [same, other] = await Promise.all([
    prisma.product.findMany({ where: { active: true, categoryId: p.categoryId, NOT: { id: p.id } }, orderBy: { id: 'asc' }, take: 4 }),
    prisma.product.findMany({ where: { active: true, featured: true, NOT: { categoryId: p.categoryId } }, orderBy: { id: 'asc' }, take: 4 }),
  ])
  res.json({ product: productDto(p), related: [...same, ...other].slice(0, 4).map(productDto) })
}))
