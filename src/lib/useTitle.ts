import { useEffect } from 'react'
export default function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Tanah Studio` : 'Tanah Studio — Handmade stoneware & Indonesian coffee'
  }, [title])
}
