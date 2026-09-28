import { MinusIcon, PlusIcon } from './Icons'
export default function QtyStepper({ value, onChange, label, min = 1, size = 'md' }: { value: number; onChange: (n: number) => void; label: string; min?: number; size?: 'sm' | 'md' }) {
  const h = size === 'sm' ? 'h-9' : 'h-12'
  const w = size === 'sm' ? 'w-8' : 'w-11'
  return (
    <div className={`inline-flex ${h} items-stretch border border-ink/25`} role="group" aria-label={label}>
      <button type="button" className={`${w} grid place-items-center hover:bg-bone disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity"><MinusIcon /></button>
      <input
        type="number" inputMode="numeric" min={min} max={99} value={value}
        onChange={(e) => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(99, n))) }}
        className={`${size === 'sm' ? 'w-9 text-sm' : 'w-12'} border-x border-ink/25 bg-transparent text-center tabular-nums [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none`}
        aria-label="Quantity"
      />
      <button type="button" className={`${w} grid place-items-center hover:bg-bone disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= 99} aria-label="Increase quantity"><PlusIcon /></button>
    </div>
  )
}
