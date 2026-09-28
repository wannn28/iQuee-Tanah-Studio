import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../store/cart'
import { money } from '../lib/format'
import Img from './Img'
import QtyStepper from './QtyStepper'
import { CloseIcon } from './Icons'
import { FreeShipMeter, PromoForm, Totals } from './CartSummary'

export function optionText(o: Record<string, string>) {
  return Object.values(o).join(' · ')
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, setQty, remove, count } = useCart()
  const panel = useRef<HTMLDivElement>(null)
  const loc = useLocation()
  useEffect(() => { closeDrawer() }, [loc.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select')
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { clearTimeout(t); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); prev?.focus?.() }
  }, [drawerOpen, closeDrawer])

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
      <div className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} />
      <div
        ref={panel} role="dialog" aria-modal="true" aria-labelledby="cart-title" data-testid="cart-drawer"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[26.5rem] flex-col bg-paper transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}
        {...(!drawerOpen ? { inert: '' } : {})}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 id="cart-title" className="font-serif text-2xl">Your cart <span className="font-sans text-sm text-stone">({count})</span></h2>
          <button onClick={closeDrawer} className="-mr-2 p-2 hover:text-clay" aria-label="Close cart" data-autofocus><CloseIcon /></button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-serif text-2xl italic">Nothing here yet.</p>
            <p className="mt-2 text-sm text-stone">A good mug is a fine place to start.</p>
            <Link to="/shop" className="btn-primary mt-6">Browse the shop</Link>
          </div>
        ) : (
          <>
            <div className="px-6 pt-4"><FreeShipMeter /></div>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-5">
                  <Link to={`/products/${l.product.slug}`} className="block h-24 w-20 shrink-0 overflow-hidden bg-bone">
                    <Img name={l.product.images[0].src} alt="" sizes="80px" className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link to={`/products/${l.product.slug}`} className="font-serif text-[1.05rem] leading-snug hover:text-clay">{l.product.name}</Link>
                      <span className="text-sm tabular-nums">{money(l.total)}</span>
                    </div>
                    {Object.keys(l.options).length > 0 && <p className="mt-0.5 text-xs text-stone">{optionText(l.options)}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper size="sm" value={l.qty} min={0} onChange={(n) => setQty(l.key, n)} label={`Quantity for ${l.product.name}`} />
                      <button onClick={() => remove(l.key)} className="text-xs text-stone link-u">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-ink/10 bg-bone/50 px-6 py-5">
              <PromoForm compact />
              <Totals />
              <div className="grid grid-cols-2 gap-2">
                <Link to="/cart" className="btn-ghost px-3">View cart</Link>
                <Link to="/checkout" className="btn-primary px-3">Checkout</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
