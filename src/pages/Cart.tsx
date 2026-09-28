import { Link } from 'react-router-dom'
import Img from '../components/Img'
import QtyStepper from '../components/QtyStepper'
import { FreeShipMeter, PromoForm, Totals } from '../components/CartSummary'
import { optionText } from '../components/CartDrawer'
import { ArrowIcon } from '../components/Icons'
import { money } from '../lib/format'
import { useCart } from '../store/cart'
import useTitle from '../lib/useTitle'

export default function CartPage() {
  const { lines, setQty, remove, count } = useCart()
  useTitle('Cart')
  return (
    <div className="wrap pt-10 lg:pt-14">
      <h1 className="text-4xl sm:text-5xl">Your cart</h1>
      {lines.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/25 px-6 py-20 text-center">
          <p className="font-serif text-2xl italic">Your cart is empty.</p>
          <p className="mt-2 text-sm text-stone">Pieces you add will wait for you here, even if you close the tab.</p>
          <Link to="/shop" className="btn-primary mt-6">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-12">
          <section className="lg:col-span-8" aria-label="Cart items">
            <div className="hidden grid-cols-[1fr_8rem_6rem] border-b border-ink/15 pb-3 text-xs uppercase tracking-label text-stone md:grid">
              <span>Product</span><span className="text-center">Quantity</span><span className="text-right">Total</span>
            </div>
            <ul className="divide-y divide-ink/10 border-b border-ink/10">
              {lines.map((l) => (
                <li key={l.key} className="grid grid-cols-[5.5rem_1fr] gap-4 py-6 md:grid-cols-[1fr_8rem_6rem] md:items-center">
                  <div className="contents md:flex md:gap-5">
                    <Link to={`/products/${l.product.slug}`} className="row-span-2 block aspect-[4/5] w-[5.5rem] overflow-hidden bg-bone md:w-24">
                      <Img name={l.product.images[0].src} alt="" sizes="96px" className="h-full w-full object-cover" />
                    </Link>
                    <div>
                      <Link to={`/products/${l.product.slug}`} className="font-serif text-lg hover:text-clay">{l.product.name}</Link>
                      {Object.keys(l.options).length > 0 && <p className="mt-0.5 text-sm text-stone">{optionText(l.options)}</p>}
                      <p className="mt-1 text-sm tabular-nums text-stone">{money(l.unit)} each</p>
                      <button onClick={() => remove(l.key)} className="mt-2 text-xs text-stone link-u">Remove</button>
                    </div>
                  </div>
                  <div className="col-start-2 flex items-center justify-between md:col-start-auto md:justify-center">
                    <QtyStepper size="sm" value={l.qty} min={0} onChange={(n) => setQty(l.key, n)} label={`Quantity for ${l.product.name}`} />
                    <span className="tabular-nums md:hidden">{money(l.total)}</span>
                  </div>
                  <span className="hidden text-right tabular-nums md:block">{money(l.total)}</span>
                </li>
              ))}
            </ul>
            <Link to="/shop" className="mt-6 inline-block text-sm link-u">← Continue shopping</Link>
          </section>
          <aside className="lg:col-span-4" aria-label="Order summary">
            <div className="space-y-5 bg-bone/70 p-6 lg:sticky lg:top-28">
              <h2 className="font-serif text-2xl">Summary <span className="font-sans text-sm text-stone">({count} {count === 1 ? "item" : "items"})</span></h2>
              <FreeShipMeter />
              <PromoForm />
              <Totals />
              <Link to="/checkout" className="btn-primary w-full">Checkout <ArrowIcon /></Link>
              <p className="text-center text-xs text-stone">Taxes calculated at checkout. Demo store — nothing is charged.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
