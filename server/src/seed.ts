/* Idempotent seed: upserts categories, the 16 demo products and promo codes. Orders are never touched. */
import { PrismaClient } from '@prisma/client'
import { categories, products, promoCodes } from './seed-data'

const prisma = new PrismaClient()

async function main() {
  for (const [i, c] of categories.entries()) {
    const data = { name: c.name, blurb: c.blurb, image: c.image, sortOrder: i }
    await prisma.category.upsert({ where: { id: c.id }, create: { id: c.id, ...data }, update: data })
  }
  for (const p of products) {
    const data = {
      slug: p.slug, name: p.name, categoryId: p.category,
      priceCents: Math.round(p.price * 100), compareAtCents: p.compareAt != null ? Math.round(p.compareAt * 100) : null,
      images: p.images, short: p.short, description: p.description, details: p.details, options: p.options as object[],
      badge: p.badge ?? null, featured: !!p.featured, addedRank: p.added, active: true,
    }
    await prisma.product.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data })
  }
  for (const pc of promoCodes) {
    await prisma.promoCode.upsert({ where: { code: pc.code }, create: pc, update: pc })
  }
  console.log(`Seeded ${categories.length} categories, ${products.length} products, ${promoCodes.length} promo codes`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
