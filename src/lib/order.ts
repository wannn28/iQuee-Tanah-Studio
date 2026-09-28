export interface PlacedOrder {
  number: string
  placedAt: string
  email: string
  name: string
  address: string[]
  shipping: { name: string; eta: string; price: number }
  payment: string
  promo: string | null
  lines: { name: string; options: string; qty: number; total: number; image: string }[]
  subtotal: number
  discount: number
  total: number
}
const KEY = 'tanah.orders.v1'
export function saveOrder(o: PlacedOrder) {
  const all = loadOrders()
  all[o.number] = o
  localStorage.setItem(KEY, JSON.stringify(all))
}
export function loadOrders(): Record<string, PlacedOrder> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
}
export function newOrderNumber() {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `TNH-${n}`
}
