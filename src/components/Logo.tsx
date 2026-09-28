import { Link } from 'react-router-dom'
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-baseline gap-1.5 ${className}`} aria-label="Tanah Studio, home">
      <span className="font-serif text-[1.7rem] italic leading-none tracking-tight" style={{ fontVariationSettings: '"opsz" 144' }}>Tanah</span>
      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-stone group-hover:text-clay">Studio</span>
    </Link>
  )
}
