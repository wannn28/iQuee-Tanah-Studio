/** Shared loading / error states for API-backed pages. */
export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-sm text-stone" role="status" aria-live="polite">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" aria-hidden />
      {label}
    </div>
  )
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto my-16 max-w-lg border border-dashed border-clay/60 bg-clay-light/20 px-6 py-10 text-center">
      <p className="font-serif text-2xl italic">Something went wrong.</p>
      <p className="mt-2 text-sm text-stone">{message}</p>
      {onRetry && <button className="btn-ghost mt-6" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function CardSkeletons({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-bone" />
          <div className="mt-3 h-4 w-3/4 bg-bone" />
          <div className="mt-2 h-3 w-1/4 bg-bone" />
        </div>
      ))}
    </div>
  )
}
