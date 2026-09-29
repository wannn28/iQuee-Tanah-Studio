import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from './Icons'
import { useCart } from '../store/cart'
import { useCatalog } from '../store/catalog'

export function DemoBar() {
  return (
    <div className="bg-ink text-paper/80">
      <p className="wrap py-2 text-center text-[0.72rem] tracking-wide">
        Demo store by <a href="https://iquee.tech" className="font-semibold text-paper underline decoration-paper/40 underline-offset-2 hover:decoration-paper" target="_blank" rel="noopener">iQuee</a> — no real orders or payments.
        <span className="hidden sm:inline"> Try code <strong className="font-semibold text-paper">DEMO10</strong> at checkout.</span>
      </p>
    </div>
  )
}


export default function Header() {
  const { count, openDrawer } = useCart()
  const { categories } = useCatalog()
  const nav = [{ to: '/shop', label: 'Shop all' }, ...categories.map((c) => ({ to: `/shop?category=${c.id}`, label: c.name }))]
  const [menu, setMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const loc = useLocation()
  const navigate = useNavigate()
  useEffect(() => { setMenu(false); setSearchOpen(false) }, [loc.pathname, loc.search])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`)
    setQ('')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="wrap grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-[4.5rem]">
        <div className="flex items-center gap-6">
          <button className="-ml-2 p-2 lg:hidden" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu ? 'Close menu' : 'Open menu'}>
            {menu ? <CloseIcon /> : <MenuIcon />}
          </button>
          <nav aria-label="Main" className="hidden items-center gap-6 text-[0.84rem] lg:flex">
            {nav.slice(0, 4).map((n) => (
              <NavLink key={n.to} to={n.to} className={() => {
                const active = loc.pathname + loc.search === n.to || (n.to === '/shop' && loc.pathname === '/shop' && !loc.search)
                return `py-1 transition-colors hover:text-clay ${active ? 'text-clay' : ''}`
              }}>{n.label}</NavLink>
            ))}
          </nav>
        </div>
        <Logo />
        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <Link to="/#story" className="hidden text-[0.84rem] hover:text-clay xl:inline">Our studio</Link>
          <button className="p-2 hover:text-clay" onClick={() => setSearchOpen((s) => !s)} aria-expanded={searchOpen} aria-controls="site-search" aria-label="Search products"><SearchIcon /></button>
          <button className="relative -mr-2 flex items-center gap-2 p-2 hover:text-clay" onClick={openDrawer} aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
            <BagIcon />
            <span className="hidden text-[0.84rem] sm:inline">Cart</span>
            <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.68rem] font-semibold tabular-nums ${count ? 'bg-clay text-paper' : 'bg-bone text-stone'}`} aria-hidden>{count}</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div id="site-search" className="border-t border-ink/10 bg-paper">
          <form onSubmit={submit} className="wrap flex items-center gap-3 py-3" role="search">
            <SearchIcon className="h-5 w-5 text-stone" />
            <label htmlFor="header-q" className="sr-only">Search the shop</label>
            <input id="header-q" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mugs, drippers, coffee…" className="w-full bg-transparent py-2 font-serif text-xl placeholder:text-stone/50 focus:outline-none" />
            <button className="btn-primary py-2.5">Search</button>
          </form>
        </div>
      )}

      {menu && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-ink/10 bg-paper lg:hidden">
          <ul className="wrap divide-y divide-ink/10 py-2">
            {nav.map((n) => (
              <li key={n.to}><Link to={n.to} className="flex items-center justify-between py-3.5 font-serif text-xl">{n.label}<span className="text-stone">→</span></Link></li>
            ))}
            <li><Link to="/cart" className="flex items-center justify-between py-3.5 font-serif text-xl">Cart ({count})<span className="text-stone">→</span></Link></li>
          </ul>
        </nav>
      )}
    </header>
  )
}
