/* Shared catalog types. The data itself now lives in PostgreSQL and is served by the API (see server/). */
export type CategoryId = 'cups' | 'brewing' | 'tableware' | 'home'

export interface Category {
  id: CategoryId
  name: string
  blurb: string
  image: string
  productCount: number
}

export interface OptionValue {
  label: string
  priceDelta?: number
  /** index into product.images to show when selected */
  image?: number
  swatch?: string
}

export interface ProductOption {
  name: string
  values: OptionValue[]
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategoryId
  price: number
  compareAt?: number
  images: { src: string; alt: string }[]
  short: string
  description: string[]
  details: string[]
  options: ProductOption[]
  badge?: string
  featured?: boolean
  added: number // for "newest" sort (server-side)
}

