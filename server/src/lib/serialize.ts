import type { Product } from '@prisma/client'
import { cents } from './http'

export interface OptionValue { label: string; priceDelta?: number; image?: number; swatch?: string }
export interface ProductOption { name: string; values: OptionValue[] }

/** DB row -> the JSON shape the React frontend already uses (prices in USD) */
export function productDto(p: Product) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.categoryId,
    price: cents(p.priceCents),
    ...(p.compareAtCents != null ? { compareAt: cents(p.compareAtCents) } : {}),
    images: p.images as { src: string; alt: string }[],
    short: p.short,
    description: p.description as string[],
    details: p.details as string[],
    options: p.options as unknown as ProductOption[],
    ...(p.badge ? { badge: p.badge } : {}),
    featured: p.featured,
    added: p.addedRank,
  }
}
export type ProductDto = ReturnType<typeof productDto>
