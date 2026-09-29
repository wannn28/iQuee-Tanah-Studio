import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Img from '../components/Img'
import ProductCard from '../components/ProductCard'
import QtyStepper from '../components/QtyStepper'
import { CheckIcon } from '../components/Icons'
import type { Product } from '../data/products'
import { ApiError, getProduct } from '../lib/api'
import { useCatalog } from '../store/catalog'
import { ErrorBox, Spinner } from '../components/Status'
import { money } from '../lib/format'
import { unitPrice, useCart, FREE_SHIPPING_OVER } from '../store/cart'
import useTitle from '../lib/useTitle'
import NotFound from './NotFound'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const { categoryName } = useCatalog()
  const [data, setData] = useState<{ product: Product; related: Product[] } | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    setState('loading')
    getProduct(slug)
      .then((r) => { if (alive) { setData(r); setState('ready') } })
      .catch((e: Error) => { if (!alive) return; if (e instanceof ApiError && e.status === 404) setState('notfound'); else { setErr(e.message); setState('error') } })
    return () => { alive = false }
  }, [slug, attempt])
  const p = state === 'ready' ? data?.product : undefined
  const { add } = useCart()
  const [active, setActive] = useState(0)
  const [qty, setQty] = useState(1)
  const [sel, setSel] = useState<Record<string, string>>({})
  const [added, setAdded] = useState(false)
  useTitle(p?.name ?? (state === 'notfound' ? 'Not found' : 'Loading…'))

  useEffect(() => {
    if (!p) return
    setActive(0); setQty(1); setAdded(false)
    setSel(Object.fromEntries(p.options.map((o) => [o.name, o.values[0].label])))
  }, [p])

  const related = useMemo(() => data?.related ?? [], [data])

  if (state === 'loading') return <Spinner label="Loading product…" />
  if (state === 'error') return <ErrorBox message={err} onRetry={() => setAttempt((a) => a + 1)} />
  if (!p) return <NotFound />
  const price = unitPrice(p, sel)

  const choose = (name: string, label: string, image?: number) => {
    setSel((s) => ({ ...s, [name]: label }))
    if (image !== undefined && image < p.images.length) setActive(image)
  }

  return (
    <>
      <div className="wrap pt-6">
        <nav aria-label="Breadcrumb" className="text-xs text-stone">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-ink">Home</Link></li><li aria-hidden>/</li>
            <li><Link to={`/shop?category=${p.category}`} className="hover:text-ink">{categoryName(p.category)}</Link></li><li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">{p.name}</li>
          </ol>
        </nav>
      </div>

      <section className="wrap grid gap-8 pt-6 lg:grid-cols-12 lg:gap-14">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            {p.images.length > 1 && (
              <div className="flex gap-3 md:w-20 md:flex-col" role="tablist" aria-label="Product images">
                {p.images.map((im, i) => (
                  <button key={im.src} role="tab" aria-selected={active === i} aria-label={`Show image ${i + 1}: ${im.alt}`} onClick={() => setActive(i)}
                    className={`aspect-[4/5] w-16 shrink-0 overflow-hidden bg-bone md:w-full ${active === i ? 'ring-1 ring-ink ring-offset-2 ring-offset-paper' : 'opacity-70 hover:opacity-100'}`}>
                    <Img name={im.src} alt="" sizes="80px" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-bone" role="tabpanel">
              {p.images.map((im, i) => (
                <Img key={im.src} name={im.src} alt={im.alt} eager={i === 0} sizes="(min-width: 1024px) 50vw, 100vw"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${active === i ? '' : '!opacity-0'}`} />
              ))}
              {p.badge && <span className="absolute left-4 top-4 bg-paper/95 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">{p.badge}</span>}
              {p.images.length > 1 && <span className="absolute bottom-4 right-4 bg-paper/90 px-2 py-0.5 text-xs tabular-nums">{active + 1} / {p.images.length}</span>}
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="label">{categoryName(p.category)}</p>
            <h1 className="mt-3 text-4xl leading-tight sm:text-[2.8rem]">{p.name}</h1>
            <p className="mt-4 flex items-baseline gap-3 text-xl tabular-nums">
              <span className={p.compareAt ? 'text-clay' : ''} data-testid="product-price">{money(price)}</span>
              {p.compareAt && <s className="text-base text-stone">{money(p.compareAt)}</s>}
            </p>
            <p className="mt-5 leading-relaxed text-stone">{p.short}</p>

            <div className="mt-8 space-y-6 border-t border-ink/15 pt-6">
              {p.options.map((o) => {
                const isSwatch = o.values.some((v) => v.swatch)
                return (
                  <fieldset key={o.name}>
                    <legend className="mb-3 text-sm"><span className="font-semibold">{o.name}:</span> <span className="text-stone">{sel[o.name]}</span></legend>
                    <div className="flex flex-wrap gap-2">
                      {o.values.map((v) => {
                        const on = sel[o.name] === v.label
                        return (
                          <label key={v.label} className="cursor-pointer">
                            <input type="radio" name={`opt-${o.name}`} value={v.label} checked={on} onChange={() => choose(o.name, v.label, v.image)} className="peer sr-only" />
                            {isSwatch ? (
                              <span title={v.label} className={`flex items-center gap-2 border py-2 pl-2 pr-3 text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-clay ${on ? 'border-ink bg-white/60' : 'border-ink/20 hover:border-ink/60'}`}>
                                <span className="h-5 w-5 rounded-full ring-1 ring-ink/15" style={{ background: v.swatch }} aria-hidden />{v.label}
                              </span>
                            ) : (
                              <span className={`block border px-4 py-2 text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-clay ${on ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink/60'}`}>
                                {v.label}{v.priceDelta ? <span className={on ? 'text-paper/70' : 'text-stone'}> +{money(v.priceDelta)}</span> : null}
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                )
              })}
              <div>
                <p className="mb-3 text-sm font-semibold" id="qty-label">Quantity</p>
                <div className="flex flex-wrap gap-3">
                  <QtyStepper value={qty} onChange={setQty} label="Quantity" />
                  <button className="btn-clay h-12 flex-1" onClick={() => { add(p.id, sel, qty); setAdded(true) }} data-testid="add-to-cart">
                    {added ? <><CheckIcon /> Added — add another</> : <>Add to cart · {money(price * qty)}</>}
                  </button>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-1.5 text-sm text-stone">
              <li>· Free standard shipping on orders over {money(FREE_SHIPPING_OVER)}</li>
              <li>· Made to order batches ship within 3 business days</li>
            </ul>

            <div className="mt-8 divide-y divide-ink/15 border-y border-ink/15">
              <details open className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">About this piece<span className="text-stone transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
                <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-stone">{p.description.map((d) => <p key={d.slice(0, 20)}>{d}</p>)}</div>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">Details &amp; care<span className="text-stone transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.95rem] text-stone">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
              </details>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">Shipping &amp; returns<span className="text-stone transition-transform group-open:rotate-45" aria-hidden>+</span></summary>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">We ship worldwide from Bandung, wrapped in recycled paper and honeycomb. Not in love? Return unused pieces within 30 days. (This is a demo store: nothing actually ships.)</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap pt-24" aria-labelledby="rel-h">
        <div className="flex items-end justify-between border-b border-ink/15 pb-4">
          <h2 id="rel-h" className="text-3xl">You may also <em className="text-clay">like</em></h2>
          <Link to={`/shop?category=${p.category}`} className="text-sm font-semibold link-u">More {categoryName(p.category).toLowerCase()}</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {related.map((r) => <ProductCard key={r.id} p={r} sizes="(min-width: 1024px) 22vw, 48vw" />)}
        </div>
      </section>
    </>
  )
}
