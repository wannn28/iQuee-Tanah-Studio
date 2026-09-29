// End-to-end API smoke test. Usage: API_BASE=http://localhost:8001 ADMIN_USER=demo ADMIN_PASSWORD=... node scripts/smoke.mjs
const BASE = process.env.API_BASE ?? 'http://localhost:8001'
const H = { 'Content-Type': 'application/json', ...(process.env.ORIGIN ? { Origin: process.env.ORIGIN } : {}) }
let fails = 0
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name} ${extra}`); if (!cond) fails++ }
const j = async (path, init = {}) => { const r = await fetch(BASE + path, { ...init, headers: { ...H, ...(init.headers ?? {}) } }); let b = null; try { b = await r.json() } catch {} return { s: r.status, b } }

const h = await j('/api/health'); check('health', h.s === 200 && h.b.db === 'up')
const list = await j('/api/products'); check('products list = 16', list.b.items.length === 16, `(${list.b.items.length})`)
const f = await j('/api/products?category=brewing&sort=price-desc'); check('filter+sort', f.b.items[0].slug === 'slow-pour-kettle')
const s = await j('/api/products?q=flores'); check('search', s.b.items.some((p) => p.slug === 'flores-bajawa-coffee'))
const d = await j('/api/products/dune-stoneware-mug'); check('detail + related', d.s === 200 && d.b.related.length === 4)
check('detail 404', (await j('/api/products/nope')).s === 404)
check('promo valid', (await j('/api/promo/validate', { method: 'POST', body: JSON.stringify({ code: 'demo10' }) })).b.valid === true)
check('promo invalid', (await j('/api/promo/validate', { method: 'POST', body: JSON.stringify({ code: 'BOGUS' }) })).b.valid === false)

const lines = [{ productId: 'p01', options: { Color: 'Charcoal', Size: '12 oz' }, qty: 2 }, { productId: 'p08', options: { Size: '500 g', Grind: 'Filter' }, qty: 1 }]
const q = await j('/api/cart/quote', { method: 'POST', body: JSON.stringify({ lines, promoCode: 'DEMO10', shippingMethod: 'standard' }) })
// (34+4)*2 + (19+15) = 110 ; -10% = 11 -> 99 ; < 120 so +8 shipping = 107
check('quote math', q.b.subtotal === 110 && q.b.discount === 11 && q.b.shipping.price === 8 && q.b.total === 107, JSON.stringify({ s: q.b.subtotal, d: q.b.discount, t: q.b.total }))
const bad = await j('/api/cart/quote', { method: 'POST', body: JSON.stringify({ lines: [{ productId: 'p01', options: { Color: 'Gold' }, qty: 1 }] }) })
check('invalid option rejected', bad.s === 422)
check('tampered price ignored', (await j('/api/cart/quote', { method: 'POST', body: JSON.stringify({ lines: [{ productId: 'p06', qty: 1, price: 1 }] }) })).b.total === 97)

const customer = { email: 'smoke@example.com', firstName: 'Smoke', lastName: 'Test', address1: '1 Test Street', city: 'Bandung', region: 'West Java', postal: '40111', country: 'Indonesia' }
check('order validation 400', (await j('/api/orders', { method: 'POST', body: JSON.stringify({ lines, customer: { ...customer, email: 'x' }, payment: { method: 'bank' } }) })).s === 400)
const o = await j('/api/orders', { method: 'POST', body: JSON.stringify({ lines, promoCode: 'FREESHIP', shippingMethod: 'standard', customer, payment: { method: 'card', last4: '4242' }, expectedTotal: 110 }) })
check('order created', o.s === 201 && /^TNH-\d{6}$/.test(o.b.number) && o.b.total === 110, JSON.stringify(o.b))
const c = await j(`/api/orders/${o.b.number}?token=${o.b.accessToken}`)
check('confirmation', c.s === 200 && c.b.total === 110 && c.b.lines.length === 2)
check('confirmation wrong token 404', (await j(`/api/orders/${o.b.number}?token=wrongwrongwrongwrong`)).s === 404)

check('admin no token 401', (await j('/api/admin/orders')).s === 401)
check('admin bad login 401', (await j('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: 'demo', password: 'nope' }) })).s === 401)
if (process.env.ADMIN_PASSWORD) {
  const l = await j('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: process.env.ADMIN_USER ?? 'demo', password: process.env.ADMIN_PASSWORD }) })
  check('admin login', l.s === 200 && !!l.b.token)
  const ao = await j('/api/admin/orders', { headers: { Authorization: `Bearer ${l.b.token}` } })
  check('admin orders lists new order', ao.s === 200 && ao.b.items.some((x) => x.number === o.b.number), `(total ${ao.b.total})`)
  const st = await j('/api/admin/stats', { headers: { Authorization: `Bearer ${l.b.token}` } })
  check('admin stats', st.s === 200 && st.b.orders >= 1)
}
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED')
process.exit(fails ? 1 : 0)
