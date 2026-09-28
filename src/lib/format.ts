const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const money = (n: number) => fmt.format(n)
export const imgSrc = (name: string, w: 700 | 1400 = 700) => `/images/${name}-${w}.webp`
export const imgSrcSet = (name: string) => `/images/${name}-700.webp 700w, /images/${name}-1400.webp 1400w`
