import { useState } from 'react'
import { imgSrc, imgSrcSet } from '../lib/format'

interface Props {
  name: string
  alt: string
  sizes?: string
  className?: string
  eager?: boolean
  width?: number
  height?: number
}

/** Local responsive webp with native lazy loading and a soft fade-in. */
export default function Img({ name, alt, sizes = '(min-width: 1024px) 33vw, 50vw', className = '', eager, width = 700, height = 875 }: Props) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={imgSrc(name, 700)}
      srcSet={imgSrcSet(name)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      // @ts-expect-error fetchpriority is valid HTML, React 18 types lag behind
      fetchpriority={eager ? 'high' : undefined}
      onLoad={() => setLoaded(true)}
      ref={(el) => { if (el?.complete && el.naturalWidth && !loaded) setLoaded(true) }}
      className={`img-fade ${loaded ? 'is-loaded' : ''} ${className}`}
    />
  )
}
