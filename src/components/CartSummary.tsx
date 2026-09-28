import { useState } from 'react'
import { FREE_SHIPPING_OVER, PROMOS, shippingCost, useCart } from '../store/cart'
import { money } from '../lib/format'

export function PromoForm({ compact = false }: { compact?: boolean }) {
  const { promo, applyPromo, removePromo } = useCart()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  if (promo) {
    return (
      <div className="flex items-center justify-between gap-3 border border-moss/40 bg-moss/5 px-3 py-2.5 text-sm" role="status">
        <span><span className="font-semibold tracking-wide text-moss">{promo}</span> <span className="text-stone">· {PROMOS[promo]?.label}</span></span>
        <button type="button" onClick={() => { removePromo(); setMsg(null) }} className="text-xs link-u">Remove</button>
      </div>
    )
  }
  return (
    <div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const r = applyPromo(code); setMsg({ ok: r.ok, text: r.message }); if (r.ok) setCode('') }}>
        <label htmlFor={compact ? 'promo-c' : 'promo'} className="sr-only">Promo code</label>
        <input id={compact ? 'promo-c' : 'promo'} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" autoComplete="off"
          className="field py-2.5 uppercase placeholder:normal-case" aria-describedby={compact ? 'promo-msg-c' : 'promo-msg'} aria-invalid={msg && !msg.ok ? true : undefined} />
        <button className="btn-ghost shrink-0 px-4 py-2.5">Apply</button>
      </form>
      <p id={compact ? 'promo-msg-c' : 'promo-msg'} className={`mt-1.5 text-xs ${msg && !msg.ok ? 'text-clay' : 'text-stone'}`} aria-live="polite">
        {msg?.text ?? <>Demo codes: <strong>DEMO10</strong> or <strong>FREESHIP</strong></>}
      </p>
    </div>
  )
}

export function Totals({ methodId = 'standard', estimate = true }: { methodId?: string; estimate?: boolean }) {
  const { subtotal, discount, promo } = useCart()
  const after = subtotal - discount
  const ship = subtotal === 0 ? 0 : shippingCost(after, methodId, promo)
  const total = after + ship
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
      {discount > 0 && <div className="flex justify-between text-moss"><dt>Discount ({promo})</dt><dd className="tabular-nums">−{money(discount)}</dd></div>}
      <div className="flex justify-between"><dt className="text-stone">Shipping{estimate ? ' (standard, est.)' : ''}</dt><dd className="tabular-nums">{ship === 0 ? 'Free' : money(ship)}</dd></div>
      <div className="flex items-baseline justify-between border-t border-ink/15 pt-3 text-base"><dt className="font-semibold">Total <span className="text-xs font-normal text-stone">USD</span></dt><dd className="font-serif text-2xl tabular-nums" data-testid="order-total">{money(total)}</dd></div>
    </dl>
  )
}

export function FreeShipMeter() {
  const { subtotal, discount } = useCart()
  const after = subtotal - discount
  const left = Math.max(0, FREE_SHIPPING_OVER - after)
  const pct = Math.min(100, (after / FREE_SHIPPING_OVER) * 100)
  return (
    <div>
      <p className="text-xs text-stone">{left > 0 ? <>You’re <strong className="text-ink">{money(left)}</strong> away from free standard shipping.</> : <>Your order ships free (standard).</>}</p>
      <div className="mt-2 h-[3px] w-full bg-sand" aria-hidden><div className="h-full bg-clay transition-all duration-500" style={{ width: `${pct}%` }} /></div>
    </div>
  )
}
