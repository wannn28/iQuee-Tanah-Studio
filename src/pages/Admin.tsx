import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import { money } from '../lib/format'
import useTitle from '../lib/useTitle'
import { ErrorBox, Spinner } from '../components/Status'

/* Demo back-office: password-protected order list backed by /api/admin/* (signed bearer token). */

const DEMO_USER = 'demo'
const DEMO_PASS = 'tanah-admin-demo'
const LS = 'tanah.admin.session'
const STATUSES = ['PLACED', 'PACKED', 'SHIPPED', 'CANCELLED'] as const

interface Session { token: string; expiresAt: string; user: string }
interface Stats { orders: number; revenue: number; averageOrder: number; byStatus: Record<string, number>; topProducts: { name: string; qty: number }[] }
interface AdminOrder {
  number: string; status: string; placedAt: string; customer: string; email: string; destination: string
  shipping: string; payment: string; promo: string | null; itemCount: number
  items: { name: string; qty: number; options: string; total: number }[]
  subtotal: number; discount: number; shippingCost: number; total: number
}

function loadSession(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(LS) || 'null') as Session | null
    return s && new Date(s.expiresAt) > new Date() ? s : null
  } catch { return null }
}

function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try {
      const s = await api<Session>('/admin/login', { method: 'POST', json: { username: u, password: p } })
      sessionStorage.setItem(LS, JSON.stringify(s)); onLogin(s)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Login failed') } finally { setBusy(false) }
  }
  return (
    <div className="wrap max-w-md py-20">
      <p className="label">Back office</p>
      <h1 className="mt-3 text-4xl">Store admin</h1>
      <p className="mt-3 text-sm text-stone">Orders placed on this demo store are saved in PostgreSQL. Sign in to see them.</p>
      <div className="mt-6 border border-dashed border-clay/60 bg-clay-light/20 px-4 py-3 text-sm" data-testid="demo-creds">
        Demo credentials: <strong>{DEMO_USER}</strong> / <strong>{DEMO_PASS}</strong>
        <button type="button" className="ml-2 text-xs link-u" onClick={() => { setU(DEMO_USER); setP(DEMO_PASS) }}>Fill in</button>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4" aria-label="Admin sign in">
        <div><label htmlFor="adm-u" className="mb-1.5 block text-sm font-medium">Username</label><input id="adm-u" className="field" autoComplete="username" value={u} onChange={(e) => setU(e.target.value)} required /></div>
        <div><label htmlFor="adm-p" className="mb-1.5 block text-sm font-medium">Password</label><input id="adm-p" type="password" className="field" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} required /></div>
        {err && <p role="alert" className="text-sm text-clay-dark">{err}</p>}
        <button className="btn-primary w-full" disabled={busy} data-testid="admin-login">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}

export default function Admin() {
  useTitle('Admin')
  useEffect(() => {
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex'
    document.head.appendChild(m)
    return () => { m.remove() }
  }, [])
  const [session, setSession] = useState<Session | null>(loadSession)
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const pageSize = 15

  const logout = useCallback(() => { sessionStorage.removeItem(LS); setSession(null) }, [])
  const load = useCallback(async () => {
    if (!session) return
    setState((s) => (s === 'ready' ? s : 'loading'))
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(filter ? { status: filter } : {}) })
      const [st, list] = await Promise.all([
        api<Stats>('/admin/stats', { token: session.token }),
        api<{ items: AdminOrder[]; total: number }>(`/admin/orders?${qs}`, { token: session.token }),
      ])
      setStats(st); setOrders(list.items); setTotal(list.total); setState('ready')
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) { logout(); return }
      setErr(e instanceof Error ? e.message : 'Failed'); setState('error')
    }
  }, [session, page, filter, logout])
  useEffect(() => { load() }, [load])

  const setStatus = async (number: string, status: string) => {
    if (!session) return
    try {
      await api(`/admin/orders/${number}/status`, { method: 'PATCH', json: { status }, token: session.token })
      load()
    } catch (e) { alert(e instanceof Error ? e.message : 'Update failed') }
  }

  if (!session) return <Login onLogin={setSession} />
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="wrap pb-10 pt-10" data-testid="admin-dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/15 pb-6">
        <div>
          <p className="label">Back office · demo</p>
          <h1 className="mt-2 text-4xl">Orders</h1>
          <p className="mt-2 text-sm text-stone">Live from PostgreSQL via the store API. Shopper emails and addresses are masked because this demo admin is public.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button className="link-u" onClick={load}>Refresh</button>
          <span className="text-stone">Signed in as <strong className="text-ink">{session.user}</strong></span>
          <button className="btn-ghost px-4 py-2" onClick={logout}>Sign out</button>
        </div>
      </div>

      {stats && (
        <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 md:grid-cols-4" data-testid="admin-stats">
          {[['Orders', String(stats.orders)], ['Revenue (demo)', money(stats.revenue)], ['Average order', money(stats.averageOrder)], ['Top product', stats.topProducts[0] ? `${stats.topProducts[0].name} ×${stats.topProducts[0].qty}` : '—']].map(([k, v]) => (
            <div key={k} className="bg-paper px-5 py-5"><dt className="label">{k}</dt><dd className="mt-2 truncate font-serif text-2xl" title={v}>{v}</dd></div>
          ))}
        </dl>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} onClick={() => { setFilter(s); setPage(1) }} className={`border px-3 py-1.5 ${filter === s ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink/60'}`}>
            {s ? `${s[0]}${s.slice(1).toLowerCase()}` : 'All'}{s && stats?.byStatus[s] ? ` (${stats.byStatus[s]})` : s ? '' : stats ? ` (${stats.orders})` : ''}
          </button>
        ))}
      </div>

      {state === 'loading' ? <Spinner label="Loading orders…" /> : state === 'error' ? <ErrorBox message={err} onRetry={load} /> : orders.length === 0 ? (
        <div className="mt-6 border border-dashed border-ink/25 px-6 py-16 text-center">
          <p className="font-serif text-2xl italic">No orders yet.</p>
          <p className="mt-2 text-sm text-stone">Place a demo order in the <Link to="/shop" className="link-u">shop</Link> and it will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm" data-testid="orders-table">
            <thead className="border-b border-ink/20 text-xs uppercase tracking-label text-stone">
              <tr><th className="py-3 pr-4 font-medium">Order</th><th className="py-3 pr-4 font-medium">Placed</th><th className="py-3 pr-4 font-medium">Customer</th><th className="py-3 pr-4 font-medium">Ship to</th><th className="py-3 pr-4 font-medium">Items</th><th className="py-3 pr-4 text-right font-medium">Total</th><th className="py-3 font-medium">Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.number}>
                  <tr className="border-b border-ink/10 align-top">
                    <td className="py-3 pr-4"><button className="font-semibold link-u" onClick={() => setOpen(open === o.number ? null : o.number)} aria-expanded={open === o.number}>{o.number}</button></td>
                    <td className="py-3 pr-4 tabular-nums text-stone">{new Date(o.placedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3 pr-4">{o.customer}<br /><span className="text-xs text-stone">{o.email}</span></td>
                    <td className="py-3 pr-4">{o.destination}<br /><span className="text-xs capitalize text-stone">{o.shipping}</span></td>
                    <td className="py-3 pr-4">{o.itemCount}{o.promo && <span className="ml-2 bg-moss/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-moss">{o.promo}</span>}</td>
                    <td className="py-3 pr-4 text-right font-serif text-base tabular-nums">{money(o.total)}</td>
                    <td className="py-3">
                      <select aria-label={`Status of ${o.number}`} value={o.status} onChange={(e) => setStatus(o.number, e.target.value)} className="border border-ink/20 bg-transparent px-2 py-1 text-xs font-semibold">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                  {open === o.number && (
                    <tr className="border-b border-ink/10 bg-bone/50">
                      <td colSpan={7} className="px-4 py-4">
                        <ul className="space-y-1">{o.items.map((i, k) => <li key={k} className="flex justify-between gap-4"><span>{i.qty} × {i.name} <span className="text-stone">{i.options}</span></span><span className="tabular-nums">{money(i.total)}</span></li>)}</ul>
                        <p className="mt-3 text-xs text-stone">Subtotal {money(o.subtotal)} · Discount −{money(o.discount)} · Shipping {money(o.shippingCost)} · {o.payment}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="text-stone">{total} orders · page {page} of {pages}</span>
            <div className="flex gap-2">
              <button className="btn-ghost px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button className="btn-ghost px-3 py-1.5" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
