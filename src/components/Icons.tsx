type P = { className?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
export const BagIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" /><path d="M9 10V6.5a3 3 0 0 1 6 0V10" /></svg>
)
export const SearchIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
)
export const MenuIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M3 7h18M3 12h18M3 17h12" /></svg>
)
export const CloseIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const ArrowIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 12h16M14 6l6 6-6 6" /></svg>
)
export const MinusIcon = ({ className = 'h-3.5 w-3.5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 12h14" /></svg>
)
export const PlusIcon = ({ className = 'h-3.5 w-3.5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 5v14M5 12h14" /></svg>
)
export const CheckIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
export const LockIcon = ({ className = 'h-4 w-4' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><rect x="5" y="10.5" width="14" height="10" rx="1" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></svg>
)
