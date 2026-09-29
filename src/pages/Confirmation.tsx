import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Img from '../components/Img'
import { CheckIcon } from '../components/Icons'
import { money } from '../lib/format'
import { getOrder, loadOrderTokens, type PlacedOrder } from '../lib/api'
import { Spinner } from '../components/Status'
import useTitle from '../lib/useTitle'

export default function Confirmation() {
  const { orderNo = '' } = useParams()
  const [o, setO] = useState<PlacedOrder | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [err, setErr] = useState('')
  useEffect(() => {
    const token = loadOrderTokens()[orderNo]
    if (!token) { setState('missing'); return }
    let alive = true
    getOrder(orderNo, token)
      .then((r) => { if (alive) { setO(r); setState('ready') } })
      .catch((e: Error) => { if (alive) { setErr(e.message); setState('missing') } })
    return () => { alive = false }
  }, [orderNo])
  useTitle(o ? `Order ${o.number} confirmed` : state === 'loading' ? 'Loading order…' : 'Order not found')
  if (state === 'loading') return <Spinner label="Loading your order…" />
  if (!o) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-4xl">We couldn’t find order {orderNo}</h1>
        <p className="mt-3 text-stone">{err && err !== 'Order not found' ? err : 'Order confirmations can only be opened from the browser that placed the order.'}</p>
        <Link to="/shop" className="btn-primary mt-8">Back to the shop</Link>
      </div>
    )
  }
  const date = new Date(o.placedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return (
    <div className="wrap max-w-4xl pt-12 lg:pt-16">
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss text-paper"><CheckIcon className="h-6 w-6" /></span>
        <p className="label mt-6">Order confirmed</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Thank you, <em className="text-clay">{o.name.split(' ')[0]}</em>.</h1>
        <p className="mt-4 text-stone">Your order number is</p>
        <p className="mt-1 font-serif text-3xl tracking-wide" data-testid="order-number">{o.number}</p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-stone">A confirmation would normally be sent to <strong className="text-ink">{o.email}</strong>. This is a demo store by <a href="https://iquee.tech" className="link-u" target="_blank" rel="noopener">iQuee</a>, so no email is sent, nothing is charged and nothing will ship. The order itself is real data: it was priced and saved by the store API in PostgreSQL.</p>
      </div>

      <div className="mt-12 grid gap-8 border-t border-ink/15 pt-10 md:grid-cols-5">
        <section className="md:col-span-3" aria-label="Items">
          <h2 className="label mb-4">Items</h2>
          <ul className="divide-y divide-ink/10">
            {o.lines.map((l, i) => (
              <li key={i} className="flex items-center gap-4 py-4">
                <div className="h-20 w-16 shrink-0 overflow-hidden bg-bone"><Img name={l.image} alt="" sizes="64px" className="h-full w-full object-cover" /></div>
                <div className="flex-1"><p className="font-serif text-lg">{l.name}</p><p className="text-xs text-stone">{l.options}{l.options ? ' · ' : ''}Qty {l.qty}</p></div>
                <span className="text-sm tabular-nums">{money(l.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/15 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{money(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-moss"><dt>Discount ({o.promo})</dt><dd className="tabular-nums">−{money(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-stone">Shipping · {o.shipping.name}</dt><dd className="tabular-nums">{o.shipping.price ? money(o.shipping.price) : 'Free'}</dd></div>
            <div className="flex justify-between pt-2 text-base font-semibold"><dt>Total paid (demo)</dt><dd className="font-serif text-2xl font-normal tabular-nums">{money(o.total)}</dd></div>
          </dl>
        </section>
        <section className="space-y-6 bg-bone/70 p-6 text-sm md:col-span-2" aria-label="Details">
          <div><h2 className="label mb-2">Placed</h2><p>{date}</p></div>
          <div><h2 className="label mb-2">Ship to</h2><p className="leading-relaxed">{o.name}<br />{o.address.map((a) => <span key={a}>{a}<br /></span>)}</p></div>
          <div><h2 className="label mb-2">Delivery</h2><p>{o.shipping.name} · {o.shipping.eta}</p></div>
          <div><h2 className="label mb-2">Payment</h2><p>{o.payment}</p></div>
        </section>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 border-t border-ink/15 pt-10 text-center">
        <Link to="/shop" className="btn-primary">Continue shopping</Link>
        <p className="text-sm text-stone">Like this store? It was designed and built by <a href="https://iquee.tech" className="font-semibold text-ink link-u" target="_blank" rel="noopener">iQuee</a>.</p>
      </div>
    </div>
  )
}
