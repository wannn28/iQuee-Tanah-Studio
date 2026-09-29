import { Link } from 'react-router-dom'
import { useCatalog } from '../store/catalog'
import Logo from './Logo'

export default function Footer() {
  const { categories } = useCatalog()
  return (
    <footer className="mt-24 border-t border-ink/15 bg-bone/60">
      <div className="wrap grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            Small-batch stoneware and single-origin Indonesian coffee, made for slow mornings. Thrown, glazed and packed by a studio of four.
          </p>
          <form className="mt-6 flex max-w-sm border-b border-ink/40" onSubmit={(e) => { e.preventDefault(); (e.currentTarget.elements.namedItem('nl') as HTMLInputElement).value = ''; alert('Demo only — no newsletter emails are collected.') }}>
            <label htmlFor="nl" className="sr-only">Email address</label>
            <input id="nl" name="nl" type="email" required placeholder="Kiln notes, once a month" className="w-full bg-transparent py-3 text-sm placeholder:text-stone/70 focus:outline-none" />
            <button className="px-2 text-sm font-semibold hover:text-clay">Subscribe</button>
          </form>
        </div>
        <div className="md:col-span-2 md:col-start-7">
          <h2 className="label mb-4">Shop</h2>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => <li key={c.id}><Link className="hover:text-clay" to={`/shop?category=${c.id}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="label mb-4">Help</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-clay" to="/cart">Your cart</Link></li>
            <li><span className="text-stone">Shipping: worldwide</span></li>
            <li><span className="text-stone">Returns: 30 days</span></li>
            <li><span className="text-stone">Care guide</span></li>
            <li><Link className="hover:text-clay" to="/admin">Store admin (demo)</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h2 className="label mb-4">Visit</h2>
          <p className="text-sm leading-relaxed text-stone">Jl. Tanah Liat 12<br />Bandung, West Java<br />Thu–Sun, 10–5</p>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tanah Studio — a fictional brand. Photos from Pexels, <a className="link-u" href="/credits.txt">see credits</a>.</p>
          <p>
            Demo store by <a className="font-semibold text-ink link-u" href="https://iquee.tech" target="_blank" rel="noopener">iQuee</a> — no real orders or payments.
          </p>
        </div>
      </div>
    </footer>
  )
}
