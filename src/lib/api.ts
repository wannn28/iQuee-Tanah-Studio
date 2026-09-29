import type { Category, Product } from '../data/products'

/** API base: same origin in production (Nginx proxies /api), Vite proxies /api in dev. */
const BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) { super(message) }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown; token?: string } = {}): Promise<T> {
  const { json, token, headers, ...rest } = init
  let res: Response
  try {
    res = await fetch(`${BASE}/api${path}`, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    })
  } catch {
    throw new ApiError(0, 'Can’t reach the store server. Check your connection and try again.')
  }
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, (body && (body.error || body.message)) || `Request failed (${res.status})`, body)
  return body as T
}

export interface ProductList { items: Product[]; total: number; priceMax: number }
export interface ProductDetail { product: Product; related: Product[] }
export interface PromoInfo { code: string; label: string; percentOff: number; freeShipping: boolean }
export interface CartLineInput { productId: string; options: Record<string, string>; qty: number }
export interface Quote {
  lines: { productId: string; name: string; options: Record<string, string>; qty: number; unitPrice: number; lineTotal: number }[]
  promo: { code: string; label: string } | null
  promoError?: string
  shipping: { id: string; name: string; eta: string; price: number }
  subtotal: number; discount: number; total: number; currency: string
}
export interface PlacedOrder {
  number: string; status: string; placedAt: string; email: string; name: string; address: string[]
  shipping: { name: string; eta: string; price: number }; payment: string; promo: string | null
  lines: { name: string; options: string; qty: number; unitPrice: number; total: number; image: string }[]
  subtotal: number; discount: number; total: number
}

export const getCategories = () => api<{ items: Category[] }>('/categories')
export const getProducts = (params: Record<string, string | number | undefined> = {}) => {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') qs.set(k, String(v))
  const s = qs.toString()
  return api<ProductList>(`/products${s ? `?${s}` : ''}`)
}
export const getProduct = (slug: string) => api<ProductDetail>(`/products/${encodeURIComponent(slug)}`)
export const validatePromo = (code: string) => api<(PromoInfo & { valid: true }) | { valid: false; message: string }>('/promo/validate', { method: 'POST', json: { code } })
export const quoteCart = (lines: CartLineInput[], promoCode: string | null, shippingMethod: string) =>
  api<Quote>('/cart/quote', { method: 'POST', json: { lines, promoCode, shippingMethod } })
export const getOrder = (number: string, token: string) => api<PlacedOrder>(`/orders/${encodeURIComponent(number)}?token=${encodeURIComponent(token)}`)

/* Order access tokens are kept in localStorage so the confirmation page can be reopened in this browser. */
const LS_TOKENS = 'tanah.orderTokens.v2'
export function saveOrderToken(number: string, token: string) {
  const all = loadOrderTokens()
  all[number] = token
  localStorage.setItem(LS_TOKENS, JSON.stringify(all))
}
export function loadOrderTokens(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LS_TOKENS) || '{}') } catch { return {} }
}
