import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category, Product } from '../data/products'
import { getCategories, getProducts } from '../lib/api'

/** Loads categories + the full (small) catalog once, for nav, home, cart line lookup. */
interface CatalogCtx {
  status: 'loading' | 'ready' | 'error'
  error: string | null
  categories: Category[]
  products: Product[]
  priceMax: number
  byId: (id: string) => Product | undefined
  categoryName: (id: string) => string
  retry: () => void
}

const Ctx = createContext<CatalogCtx | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CatalogCtx['status']>('loading')
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [priceMax, setPriceMax] = useState(110)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let alive = true
    setStatus('loading')
    Promise.all([getCategories(), getProducts()])
      .then(([c, p]) => {
        if (!alive) return
        setCategories(c.items); setProducts(p.items); setPriceMax(p.priceMax || 110)
        setStatus('ready'); setError(null)
      })
      .catch((e: Error) => { if (alive) { setStatus('error'); setError(e.message) } })
    return () => { alive = false }
  }, [attempt])

  const map = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const byId = useCallback((id: string) => map.get(id), [map])
  const categoryName = useCallback((id: string) => categories.find((c) => c.id === id)?.name ?? id, [categories])
  const retry = useCallback(() => setAttempt((a) => a + 1), [])

  return <Ctx.Provider value={{ status, error, categories, products, priceMax, byId, categoryName, retry }}>{children}</Ctx.Provider>
}

export function useCatalog() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCatalog outside provider')
  return c
}
