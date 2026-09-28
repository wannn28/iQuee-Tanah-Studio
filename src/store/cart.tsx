import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { products, type Product } from '../data/products'

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
export const PROMOS: Record<string, { label: string; percent?: number; freeShipping?: boolean }> = {
  DEMO10: { label: '10% off your order', percent: 10 },
  FREESHIP: { label: 'Free standard shipping', freeShipping: true },
}

const LS_CART = 'tanah.cart.v1'
const LS_PROMO = 'tanah.promo.v1'

export function unitPrice(p: Product, options: Record<string, string>) {
  let price = p.price
  for (const o of p.options) {
    const v = o.values.find((x) => x.label === options[o.name])
    if (v?.priceDelta) price += v.priceDelta
  }
  return price
}

export function shippingCost(subtotalAfterDiscount: number, methodId: string, promo: string | null) {
  const m = SHIPPING_METHODS.find((s) => s.id === methodId) ?? SHIPPING_METHODS[0]
  if (m.id === 'standard' && (subtotalAfterDiscount >= FREE_SHIPPING_OVER || (promo && PROMOS[promo]?.freeShipping))) return 0
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
  promo: string | null
  drawerOpen: boolean
  lastAdded: string | null
  add: (productId: string, options: Record<string, string>, qty?: number) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
  applyPromo: (code: string) => { ok: boolean; message: string }
  removePromo: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>(() => read<CartLine[]>(LS_CART, []))
  const [promo, setPromo] = useState<string | null>(() => read<string | null>(LS_PROMO, null))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState<string | null>(null)

  useEffect(() => { localStorage.setItem(LS_CART, JSON.stringify(raw)) }, [raw])
  useEffect(() => { localStorage.setItem(LS_PROMO, JSON.stringify(promo)) }, [promo])
  // keep tabs in sync
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === LS_CART) setRaw(read<CartLine[]>(LS_CART, []))
      if (e.key === LS_PROMO) setPromo(read<string | null>(LS_PROMO, null))
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const lines = useMemo(
    () =>
      raw.flatMap((l) => {
        const product = products.find((p) => p.id === l.productId)
        if (!product) return []
        const unit = unitPrice(product, l.options)
        return [{ ...l, product, unit, total: unit * l.qty }]
      }),
    [raw],
  )
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.total, 0)
  const pct = promo ? PROMOS[promo]?.percent ?? 0 : 0
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
    applyPromo: (code) => {
      const c = code.trim().toUpperCase()
      if (!c) return { ok: false, message: 'Enter a code.' }
      if (!PROMOS[c]) return { ok: false, message: `“${c}” isn’t a valid code. Try DEMO10.` }
      setPromo(c)
      return { ok: true, message: `${c} applied: ${PROMOS[c].label}.` }
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
