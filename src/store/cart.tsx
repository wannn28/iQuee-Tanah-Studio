import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'
import { useCatalog } from './catalog'
import { validatePromo, type PromoInfo } from '../lib/api'

export interface CartLine {
  key: string
  productId: string
  options: Record<string, string>
  qty: number
}

export interface ShippingMethod { id: string; name: string; eta: string; price: number }
export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'standard', name: 'Standard', eta: '5–8 business days', price: 8 },
  { id: 'express', name: 'Express', eta: '2–3 business days', price: 22 },
]
export const FREE_SHIPPING_OVER = 120
// Shipping rules are mirrored here for instant UI estimates only; the API (server/src/lib/pricing.ts)
// re-prices every cart and computes the authoritative totals at checkout.

const LS_CART = 'tanah.cart.v1'
const LS_PROMO = 'tanah.promo.v2'

export function unitPrice(p: Product, options: Record<string, string>) {
  let price = p.price
  for (const o of p.options) {
    const v = o.values.find((x) => x.label === options[o.name])
    if (v?.priceDelta) price += v.priceDelta
  }
  return price
}

export function shippingCost(subtotalAfterDiscount: number, methodId: string, promo: PromoInfo | null) {
  const m = SHIPPING_METHODS.find((s) => s.id === methodId) ?? SHIPPING_METHODS[0]
  if (m.id === 'standard' && (subtotalAfterDiscount >= FREE_SHIPPING_OVER || promo?.freeShipping)) return 0
  return m.price
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

interface CartCtx {
  lines: (CartLine & { product: Product; unit: number; total: number })[]
  count: number
  subtotal: number
  discount: number
  promo: PromoInfo | null
  drawerOpen: boolean
  lastAdded: string | null
  add: (productId: string, options: Record<string, string>, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  applyPromo: (code: string) => Promise<{ ok: boolean; message: string }>
  removePromo: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>(() => read<CartLine[]>(LS_CART, []))
  const { byId } = useCatalog()
  const [promo, setPromo] = useState<PromoInfo | null>(() => read<PromoInfo | null>(LS_PROMO, null))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  useEffect(() => { localStorage.setItem(LS_CART, JSON.stringify(raw)) }, [raw])
  useEffect(() => { localStorage.setItem(LS_PROMO, JSON.stringify(promo)) }, [promo])
  // keep tabs in sync
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === LS_CART) setRaw(read<CartLine[]>(LS_CART, []))
      if (e.key === LS_PROMO) setPromo(read<PromoInfo | null>(LS_PROMO, null))
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const lines = useMemo(
    () =>
      raw.flatMap((l) => {
        const product = byId(l.productId)
        if (!product) return []
        const unit = unitPrice(product, l.options)
        return [{ ...l, product, unit, total: unit * l.qty }]
      }),
    [raw, byId],
  )
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.total, 0)
  const pct = promo?.percentOff ?? 0
  const discount = Math.round(subtotal * pct) / 100

  const add = useCallback((productId: string, options: Record<string, string>, qty = 1) => {
    const key = productId + '|' + Object.entries(options).map(([k, v]) => `${k}:${v}`).join('|')
    setRaw((prev) => {
      const found = prev.find((l) => l.key === key)
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
      return [...prev, { key, productId, options, qty }]
    })
    setLastAdded(key)
    setDrawerOpen(true)
  }, [])

  const value: CartCtx = {
    lines, count, subtotal, discount, promo, drawerOpen, lastAdded, add,
    setQty: (key, qty) => setRaw((prev) => (qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)))),
    remove: (key) => setRaw((prev) => prev.filter((l) => l.key !== key)),
    clear: () => { setRaw([]); setPromo(null) },
    applyPromo: async (code) => {
      const c = code.trim().toUpperCase()
      if (!c) return { ok: false, message: 'Enter a code.' }
      try {
        const r = await validatePromo(c) // validated against the promo_codes table
        if (!r.valid) return { ok: false, message: r.message }
        setPromo({ code: r.code, label: r.label, percentOff: r.percentOff, freeShipping: r.freeShipping })
        return { ok: true, message: `${r.code} applied: ${r.label}.` }
      } catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : 'Could not check that code.' }
      }
    },
    removePromo: () => setPromo(null),
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart outside provider')
  return c
}
