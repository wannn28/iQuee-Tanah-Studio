import { Link } from 'react-router-dom'
import type { Product } from '../data/products'
import { money } from '../lib/format'
import Img from './Img'

export default function ProductCard({ p, sizes, eager }: { p: Product; sizes?: string; eager?: boolean }) {
  const colors = p.options.find((o) => o.values.some((v) => v.swatch))
  return (
    <article className="group relative">
      <Link to={`/products/${p.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          <Img name={p.images[0].src} alt={p.images[0].alt} sizes={sizes} eager={eager} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
          {p.images[1] && (
            <Img name={p.images[1].src} alt="" sizes={sizes} className="!absolute inset-0 hidden h-full w-full object-cover !opacity-0 transition-opacity duration-500 group-hover:!opacity-100 md:block" />
          )}
          {p.badge && <span className="absolute left-3 top-3 bg-paper/95 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">{p.badge}</span>}
        </div>
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <h3 className="font-serif text-[1.08rem] leading-snug group-hover:text-clay">{p.name}</h3>
          <p className="shrink-0 text-sm tabular-nums sm:pt-0.5">
            {p.compareAt && <s className="mr-1.5 text-stone">{money(p.compareAt)}</s>}
            <span className={p.compareAt ? 'text-clay' : ''}>{money(p.price)}</span>
          </p>
        </div>
      </Link>
      {colors && (
        <div className="mt-2 flex items-center gap-1.5" aria-label={`${colors.values.length} ${colors.name.toLowerCase()}s available`}>
          {colors.values.map((v) => <span key={v.label} title={v.label} className="h-3 w-3 rounded-full ring-1 ring-ink/20" style={{ background: v.swatch }} />)}
        </div>
      )}
    </article>
  )
}
