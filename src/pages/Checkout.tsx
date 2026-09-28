import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Img from '../components/Img'
import { PromoForm } from '../components/CartSummary'
import { optionText } from '../components/CartDrawer'
import { LockIcon } from '../components/Icons'
import { money } from '../lib/format'
import { SHIPPING_METHODS, shippingCost, useCart } from '../store/cart'
import { newOrderNumber, saveOrder } from '../lib/order'
import useTitle from '../lib/useTitle'

const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Netherlands', 'France', 'Singapore', 'Japan', 'Indonesia', 'Other']

type Form = {
  email: string; phone: string; firstName: string; lastName: string; address1: string; address2: string
  city: string; region: string; postal: string; country: string; shipping: string; payment: string
  cardName: string; cardNumber: string; cardExp: string; cardCvc: string
}
const initial: Form = {
  email: '', phone: '', firstName: '', lastName: '', address1: '', address2: '', city: '', region: '', postal: '', country: 'United States',
  shipping: 'standard', payment: 'card', cardName: '', cardNumber: '4242 4242 4242 4242', cardExp: '12 / 30', cardCvc: '123',
}

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (!f.email.trim()) e.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email, like name@example.com.'
  if (f.phone.trim() && f.phone.replace(/\D/g, '').length < 7) e.phone = 'Phone number looks too short.'
  if (!f.firstName.trim()) e.firstName = 'Enter your first name.'
  if (!f.lastName.trim()) e.lastName = 'Enter your last name.'
  if (f.address1.trim().length < 4) e.address1 = 'Enter a street address.'
  if (!f.city.trim()) e.city = 'Enter a city.'
  if (!f.region.trim()) e.region = 'Enter a state or region.'
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(f.postal.trim())) e.postal = 'Enter a valid postal code.'
  if (f.payment === 'card') {
    if (!f.cardName.trim()) e.cardName = 'Enter the name on the card.'
    if (f.cardNumber.replace(/\D/g, '').length !== 16) e.cardNumber = 'Card number must be 16 digits.'
    if (!/^(0[1-9]|1[0-2]) ?\/ ?\d{2}$/.test(f.cardExp.trim())) e.cardExp = 'Use MM / YY.'
    if (!/^\d{3,4}$/.test(f.cardCvc.trim())) e.cardCvc = '3 or 4 digits.'
  }
  return e
}

function Field({ id, label, error, optional, className = '', children }: { id: string; label: string; error?: string; optional?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}{optional && <span className="font-normal text-stone"> (optional)</span>}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-clay-dark">{error}</p>}
    </div>
  )
}

export default function Checkout() {
  useTitle('Checkout')
  const { lines, subtotal, discount, promo, clear, count } = useCart()
  const navigate = useNavigate()
  const [f, setF] = useState<Form>(initial)
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [placing, setPlacing] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const errors = useMemo(() => validate(f), [f])
  const errCount = Object.keys(errors).length

  const after = subtotal - discount
  const ship = shippingCost(after, f.shipping, promo)
  const total = after + ship
  const method = SHIPPING_METHODS.find((m) => m.id === f.shipping)!

  const show = (k: keyof Form) => (submitted || touched[k]) && errors[k]
  const bind = (k: keyof Form) => ({
    id: k, name: k, value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
    'aria-invalid': show(k) ? true : undefined,
    'aria-describedby': show(k) ? `${k}-err` : undefined,
    className: 'field',
  })

  if (!lines.length && !placing) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-4xl">Nothing to check out yet</h1>
        <p className="mt-3 text-stone">Your cart is empty. Add a piece or two first.</p>
        <Link to="/shop" className="btn-primary mt-8">Go to the shop</Link>
      </div>
    )
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (errCount) {
      const first = Object.keys(errors)[0]
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus())
      return
    }
    setPlacing(true)
    const number = newOrderNumber()
    saveOrder({
      number, placedAt: new Date().toISOString(), email: f.email.trim(), name: `${f.firstName} ${f.lastName}`.trim(),
      address: [f.address1, f.address2, `${f.city}, ${f.region} ${f.postal}`, f.country].filter(Boolean),
      shipping: { name: method.name, eta: method.eta, price: ship },
      payment: f.payment === 'card' ? `Demo card ending ${f.cardNumber.replace(/\D/g, '').slice(-4)}` : f.payment === 'paypal' ? 'PayPal (demo)' : 'Bank transfer (demo)',
      promo, subtotal, discount, total,
      lines: lines.map((l) => ({ name: l.product.name, options: optionText(l.options), qty: l.qty, total: l.total, image: l.product.images[0].src })),
    })
    setTimeout(() => { clear(); navigate(`/order/${number}`) }, 700)
  }

  return (
    <div className="wrap pt-8 lg:pt-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <nav aria-label="Checkout steps" className="text-xs text-stone">
            <ol className="flex gap-2"><li><Link to="/cart" className="hover:text-ink">Cart</Link></li><li aria-hidden>›</li><li aria-current="step" className="font-semibold text-ink">Details &amp; payment</li><li aria-hidden>›</li><li>Confirmation</li></ol>
          </nav>
          <h1 className="mt-3 text-4xl sm:text-5xl">Checkout</h1>
        </div>
        <p className="flex items-center gap-2 text-xs text-stone"><LockIcon /> Demo checkout — no payment is taken</p>
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-10 lg:col-span-7" aria-label="Checkout form">
          {submitted && errCount > 0 && (
            <div role="alert" className="border-l-2 border-clay bg-clay-light/30 px-4 py-3 text-sm">
              Please fix {errCount} {errCount === 1 ? 'field' : 'fields'} below to place your order.
            </div>
          )}

          <fieldset className="space-y-4">
            <legend className="mb-4 flex w-full items-baseline gap-3 border-b border-ink/15 pb-3"><span className="font-serif italic text-stone">01</span><span className="font-serif text-2xl">Contact</span></legend>
            <Field id="email" label="Email" error={show('email') || undefined}><input type="email" autoComplete="email" placeholder="you@example.com" {...bind('email')} /></Field>
            <Field id="phone" label="Phone" optional error={show('phone') || undefined}><input type="tel" autoComplete="tel" placeholder="For delivery updates" {...bind('phone')} /></Field>
          </fieldset>

          <fieldset className="grid grid-cols-2 gap-4">
            <legend className="col-span-2 mb-4 flex w-full items-baseline gap-3 border-b border-ink/15 pb-3"><span className="font-serif italic text-stone">02</span><span className="font-serif text-2xl">Shipping address</span></legend>
            <Field id="country" label="Country" className="col-span-2"><select autoComplete="country-name" {...bind('country')}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field id="firstName" label="First name" error={show('firstName') || undefined}><input autoComplete="given-name" {...bind('firstName')} /></Field>
            <Field id="lastName" label="Last name" error={show('lastName') || undefined}><input autoComplete="family-name" {...bind('lastName')} /></Field>
            <Field id="address1" label="Address" className="col-span-2" error={show('address1') || undefined}><input autoComplete="address-line1" placeholder="Street and house number" {...bind('address1')} /></Field>
            <Field id="address2" label="Apartment, suite, etc." optional className="col-span-2"><input autoComplete="address-line2" {...bind('address2')} /></Field>
            <Field id="city" label="City" className="col-span-2 sm:col-span-1" error={show('city') || undefined}><input autoComplete="address-level2" {...bind('city')} /></Field>
            <div className="col-span-2 grid grid-cols-2 gap-4 sm:col-span-1">
              <Field id="region" label="State / region" error={show('region') || undefined}><input autoComplete="address-level1" {...bind('region')} /></Field>
              <Field id="postal" label="Postal code" error={show('postal') || undefined}><input autoComplete="postal-code" {...bind('postal')} /></Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 flex w-full items-baseline gap-3 border-b border-ink/15 pb-3"><span className="font-serif italic text-stone">03</span><span className="font-serif text-2xl">Shipping method</span></legend>
            <div className="divide-y divide-sand border border-sand bg-white/50">
              {SHIPPING_METHODS.map((m) => {
                const cost = shippingCost(after, m.id, promo)
                return (
                  <label key={m.id} className={`flex cursor-pointer items-center gap-4 px-4 py-4 ${f.shipping === m.id ? 'bg-white' : ''}`}>
                    <input type="radio" name="shipping" value={m.id} checked={f.shipping === m.id} onChange={() => setF((s) => ({ ...s, shipping: m.id }))} className="h-4 w-4 accent-[#221E19]" />
                    <span className="flex-1"><span className="block text-sm font-semibold">{m.name}</span><span className="text-xs text-stone">{m.eta}</span></span>
                    <span className="text-sm tabular-nums">{cost === 0 ? 'Free' : money(cost)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 flex w-full items-baseline gap-3 border-b border-ink/15 pb-3">
              <span className="font-serif italic text-stone">04</span><span className="font-serif text-2xl">Payment</span>
              <span className="ml-auto bg-clay px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-paper">Demo only</span>
            </legend>
            <p className="mb-4 border border-dashed border-clay/60 bg-clay-light/20 px-4 py-3 text-sm leading-relaxed">
              <strong>This is a demo payment selector.</strong> No card is charged and no data leaves your browser. The test card below is prefilled for you.
            </p>
            <div className="divide-y divide-sand border border-sand bg-white/50">
              {[{ id: 'card', label: 'Credit / debit card', hint: 'Visa, Mastercard, Amex — demo' }, { id: 'paypal', label: 'PayPal', hint: 'Redirect simulated — demo' }, { id: 'bank', label: 'Bank transfer', hint: 'Instructions by email — demo' }].map((pm) => (
                <div key={pm.id}>
                  <label className={`flex cursor-pointer items-center gap-4 px-4 py-4 ${f.payment === pm.id ? 'bg-white' : ''}`}>
                    <input type="radio" name="payment" value={pm.id} checked={f.payment === pm.id} onChange={() => setF((s) => ({ ...s, payment: pm.id }))} className="h-4 w-4 accent-[#221E19]" />
                    <span className="flex-1"><span className="block text-sm font-semibold">{pm.label}</span><span className="text-xs text-stone">{pm.hint}</span></span>
                  </label>
                  {pm.id === 'card' && f.payment === 'card' && (
                    <div className="grid grid-cols-2 gap-4 bg-white px-4 pb-5 pt-1">
                      <Field id="cardNumber" label="Card number (test)" className="col-span-2" error={show('cardNumber') || undefined}><input inputMode="numeric" autoComplete="off" {...bind('cardNumber')} /></Field>
                      <Field id="cardName" label="Name on card" className="col-span-2" error={show('cardName') || undefined}><input autoComplete="off" placeholder="As it would appear on the card" {...bind('cardName')} /></Field>
                      <Field id="cardExp" label="Expiry" error={show('cardExp') || undefined}><input autoComplete="off" placeholder="MM / YY" {...bind('cardExp')} /></Field>
                      <Field id="cardCvc" label="CVC" error={show('cardCvc') || undefined}><input inputMode="numeric" autoComplete="off" {...bind('cardCvc')} /></Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>

          <div>
            <button type="submit" className="btn-clay w-full py-4 text-base" disabled={placing} data-testid="place-order">
              {placing ? 'Placing order…' : <>Place demo order · {money(total)}</>}
            </button>
            <p className="mt-3 text-center text-xs text-stone">By placing this order you agree that it isn’t real. Demo store by <a href="https://iquee.tech" className="link-u" target="_blank" rel="noopener">iQuee</a>.</p>
          </div>
        </form>

        <aside className="lg:col-span-5" aria-label="Order summary">
          <div className="bg-bone/70 p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Order summary <span className="font-sans text-sm text-stone">({count})</span></h2>
            <ul className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-2 pt-2">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-4">
                  <div className="relative h-16 w-14 shrink-0 bg-bone">
                    <Img name={l.product.images[0].src} alt="" sizes="56px" className="h-full w-full object-cover" />
                    <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-semibold text-paper">{l.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate font-serif">{l.product.name}</p><p className="text-xs text-stone">{optionText(l.options)}</p></div>
                  <span className="text-sm tabular-nums">{money(l.total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-ink/15 pt-5"><PromoForm compact /></div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between text-moss"><dt>Discount ({promo})</dt><dd className="tabular-nums" data-testid="discount">−{money(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-stone">Shipping · {method.name}</dt><dd className="tabular-nums">{ship === 0 ? 'Free' : money(ship)}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Taxes</dt><dd className="text-stone">$0.00 (demo)</dd></div>
              <div className="flex items-baseline justify-between border-t border-ink/15 pt-3 text-base"><dt className="font-semibold">Total <span className="text-xs font-normal text-stone">USD</span></dt><dd className="font-serif text-2xl tabular-nums" data-testid="checkout-total">{money(total)}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
