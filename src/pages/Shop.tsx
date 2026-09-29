import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { CloseIcon, SearchIcon } from '../components/Icons'
import type { Product } from '../data/products'
import { getProducts } from '../lib/api'
import { useCatalog } from '../store/catalog'
import { CardSkeletons, ErrorBox } from '../components/Status'
import { money } from '../lib/format'
import useTitle from '../lib/useTitle'

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'name', label: 'Name: A–Z' },
]

function PriceRange({ min, max, onChange, PRICE_MAX }: { min: number; max: number; onChange: (min: number, max: number) => void; PRICE_MAX: number }) {
  const l = (min / PRICE_MAX) * 100, r = (max / PRICE_MAX) * 100
  return (
    <fieldset>
      <legend className="label mb-4">Price</legend>
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/25" />
        <div className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-ink" style={{ left: `${l}%`, right: `${100 - r}%` }} />
        <input type="range" className="dual" min={0} max={PRICE_MAX} step={5} value={min} aria-label="Minimum price" onChange={(e) => onChange(Math.min(+e.target.value, max - 5), max)} />
        <input type="range" className="dual" min={0} max={PRICE_MAX} step={5} value={max} aria-label="Maximum price" onChange={(e) => onChange(min, Math.max(+e.target.value, min + 5))} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm tabular-nums">
        <span>{money(min)}</span><span className="text-stone">to</span><span>{money(max)}{max === PRICE_MAX ? '+' : ''}</span>
      </div>
    </fieldset>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { categories, categoryName, priceMax: PRICE_MAX, products: all } = useCatalog()
  const q = params.get('q') ?? ''
  const cat = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'featured'
  const min = Number(params.get('min') ?? 0)
  const max = Number(params.get('max') ?? PRICE_MAX)
  useTitle(cat ? categoryName(cat) : 'Shop all')

  const set = (patch: Record<string, string | number | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || (k === 'min' && v === 0) || (k === 'max' && v === PRICE_MAX) || (k === 'sort' && v === 'featured')) next.delete(k)
      else next.set(k, String(v))
    }
    setParams(next, { replace: true })
  }

  // Filtering, search and sorting run server-side (PostgreSQL) via GET /api/products
  const [results, setResults] = useState<Product[]>([])
  const key = JSON.stringify([cat, q.trim(), sort, min, max])
  const [resultKey, setResultKey] = useState('')
  const stale = resultKey !== key
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const ctrl = new AbortController()
    setState((s) => (s === 'ready' ? 'ready' : 'loading'))
    const t = setTimeout(() => {
      getProducts({ category: cat, q: q.trim(), sort, min: min > 0 ? min : undefined, max: max < PRICE_MAX ? max : undefined })
        .then((r) => { if (!ctrl.signal.aborted) { setResults(r.items); setResultKey(key); setState('ready') } })
        .catch((e: Error) => { if (!ctrl.signal.aborted) { setErr(e.message); setState('error') } })
    }, q ? 250 : 0) // debounce typing
    return () => { ctrl.abort(); clearTimeout(t) }
  }, [q, cat, sort, min, max, PRICE_MAX, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = (cat ? 1 : 0) + (min > 0 || max < PRICE_MAX ? 1 : 0) + (q ? 1 : 0)
  const current = categories.find((c) => c.id === cat)

  const filters = (
    <div className="space-y-9">
      <fieldset>
        <legend className="label mb-3">Category</legend>
        <ul className="space-y-1">
          {[{ id: '', name: 'All pieces' }, ...categories].map((c) => {
            const n = c.id ? categories.find((x) => x.id === c.id)?.productCount ?? 0 : all.length
            const on = cat === c.id
            return (
              <li key={c.id || 'all'}>
                <label className={`flex cursor-pointer items-center justify-between py-1.5 text-[0.95rem] hover:text-clay ${on ? 'font-semibold text-ink' : 'text-ink/80'}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="category" className="peer sr-only" checked={on} onChange={() => set({ category: c.id })} />
                    <span className={`h-2 w-2 rounded-full border border-ink/50 peer-focus-visible:ring-2 peer-focus-visible:ring-clay ${on ? 'border-clay bg-clay' : ''}`} aria-hidden />
                    {c.name}
                  </span>
                  <span className="text-xs tabular-nums text-stone">{n}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>
      <PriceRange min={min} max={max} PRICE_MAX={PRICE_MAX} onChange={(a, b) => set({ min: a, max: b })} />
      {activeCount > 0 && (
        <button className="text-sm link-u" onClick={() => setParams(sort !== 'featured' ? { sort } : {}, { replace: true })}>Clear all filters</button>
      )}
    </div>
  )

  return (
    <div className="wrap pb-10 pt-10 lg:pt-14">
      <header className="grid gap-6 border-b border-ink/15 pb-8 md:grid-cols-2 md:items-end">
        <div>
          <p className="label">{current ? 'Collection' : 'The shop'}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{current ? current.name : <>Everything <em className="text-clay">we make</em></>}</h1>
          <p className="mt-3 max-w-md text-stone">{current ? current.blurb : 'Stoneware for the table and the shelf, plus the tools and beans for a better cup.'}</p>
        </div>
        <form role="search" className="flex items-center gap-3 border-b border-ink/40 md:justify-self-end md:w-80" onSubmit={(e) => e.preventDefault()}>
          <SearchIcon className="h-4 w-4 text-stone" />
          <label htmlFor="shop-q" className="sr-only">Search products</label>
          <input id="shop-q" type="search" value={q} onChange={(e) => set({ q: e.target.value })} placeholder="Search the shop" className="w-full bg-transparent py-2.5 text-sm placeholder:text-stone/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden" />
          {q && <button type="button" onClick={() => set({ q: null })} aria-label="Clear search" className="text-stone hover:text-ink"><CloseIcon className="h-4 w-4" /></button>}
        </form>
      </header>

      <div className="flex items-center justify-between gap-4 py-5">
        <div className="flex items-center gap-4">
          <button className="btn-ghost px-4 py-2 lg:hidden" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="filters-mobile">
            Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
          <p className="text-sm text-stone" aria-live="polite" data-testid="result-count">{state === 'loading' || (stale && state === 'ready') ? 'Updating…' : <>{results.length} {results.length === 1 ? 'piece' : 'pieces'}{q && <> for “<span className="text-ink">{q}</span>”</>}</>}</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="hidden text-stone sm:inline">Sort by</span>
          <select value={sort} onChange={(e) => set({ sort: e.target.value })} className="cursor-pointer border-b border-ink/40 bg-transparent py-1.5 pr-1 font-semibold focus:outline-none" aria-label="Sort products">
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-10 lg:grid-cols-[14rem_1fr] xl:gap-14">
        <aside className="hidden lg:block" aria-label="Filters"><div className="sticky top-28">{filters}</div></aside>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters" id="filters-mobile">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto bg-paper p-6 pb-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="p-2" aria-label="Close filters"><CloseIcon /></button>
              </div>
              {filters}
              <button className="btn-primary mt-8 w-full" onClick={() => setFiltersOpen(false)}>Show {results.length} pieces</button>
            </div>
          </div>
        )}

        <section aria-label="Products">
          {state === 'loading' ? <CardSkeletons /> : state === 'error' ? <ErrorBox message={err} onRetry={() => setAttempt((a) => a + 1)} /> : results.length ? (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity md:grid-cols-3 lg:gap-x-6 ${stale ? 'opacity-50' : ''}`} aria-busy={stale}>
              {results.map((p, i) => <ProductCard key={p.id} p={p} eager={i < 3} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 30vw, 48vw" />)}
            </div>
          ) : (
            <div className="border border-dashed border-ink/25 px-6 py-20 text-center">
              <p className="font-serif text-2xl italic">No pieces match that.</p>
              <p className="mt-2 text-sm text-stone">Try a different search or widen the price range.</p>
              <button className="btn-ghost mt-6" onClick={() => setParams({}, { replace: true })}>Reset filters</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
