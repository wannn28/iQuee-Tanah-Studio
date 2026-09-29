import { Link } from 'react-router-dom'
import Img from '../components/Img'
import ProductCard from '../components/ProductCard'
import { ArrowIcon } from '../components/Icons'
import { useCatalog } from '../store/catalog'
import { CardSkeletons, ErrorBox } from '../components/Status'
import useTitle from '../lib/useTitle'

export default function Home() {
  useTitle()
  const { categories, products, status, error, retry } = useCatalog()
  const featured = products.filter((p) => p.featured).slice(0, 8)
  return (
    <>
      {/* Hero */}
      <section className="wrap grid gap-8 pb-16 pt-8 md:grid-cols-12 md:gap-10 md:pt-14 lg:pb-24">
        <div className="flex flex-col justify-center md:col-span-6 lg:col-span-5">
          <p className="label">Batch Nº 214 · Fired September 2026</p>
          <h1 className="mt-5 text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem]" style={{ fontVariationSettings: '"opsz" 144' }}>
            Made slowly,<br />
            <em className="font-light text-clay">from the ground</em> up.
          </h1>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-stone">
            Tanah means <em>earth</em> in Indonesian. We throw stoneware from West Javan clay and roast coffee from the islands, in small batches, for people who like their mornings unhurried.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/shop" className="btn-primary">Shop the collection <ArrowIcon /></Link>
            <Link to="/shop?category=brewing" className="text-sm font-semibold link-u">Coffee &amp; brewing</Link>
          </div>
        </div>
        <div className="relative md:col-span-6 lg:col-span-7">
          <div className="grid grid-cols-5 gap-3 sm:gap-4">
            <div className="col-span-3 aspect-[3/4] overflow-hidden bg-bone">
              <Img name="hero-shelf" eager alt="Handmade cream and white stoneware on a studio shelf in soft morning light" sizes="(min-width: 768px) 35vw, 60vw" className="h-full w-full object-cover" />
            </div>
            <div className="col-span-2 flex flex-col gap-3 pt-10 sm:gap-4 sm:pt-16">
              <div className="aspect-[3/4] overflow-hidden bg-bone">
                <Img name="dune-mug-1" eager alt="Dune stoneware mugs in sand and charcoal" sizes="(min-width: 768px) 22vw, 40vw" className="h-full w-full object-cover" />
              </div>
              <Link to="/products/dune-stoneware-mug" className="group text-xs leading-snug">
                <span className="label block">On the cover</span>
                <span className="mt-1 block font-serif text-base group-hover:text-clay">Dune Stoneware Mug — from $34</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section aria-label="Why Tanah" className="border-y border-ink/15">
        <ul className="wrap grid grid-cols-2 text-center text-[0.8rem] md:grid-cols-4">
          {['Handmade in Bandung', 'Free shipping over $120', 'Roasted to order', '30-day easy returns'].map((t, i) => (
            <li key={t} className={`py-4 ${i % 2 ? 'border-l border-ink/15' : ''} ${i > 1 ? 'border-t border-ink/15 md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}>
              <span className="font-serif italic text-stone">{String(i + 1).padStart(2, '0')}</span>&nbsp;&nbsp;{t}
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="wrap py-20 lg:py-24" aria-labelledby="cat-h">
        <div className="flex items-end justify-between gap-6">
          <h2 id="cat-h" className="text-3xl sm:text-4xl">Shop by <em className="text-clay">ritual</em></h2>
          <Link to="/shop" className="hidden text-sm font-semibold link-u sm:inline">View everything</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
          {status === 'loading' && [0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-bone" aria-hidden />)}
          {categories.map((c, i) => (
            <Link key={c.id} to={`/shop?category=${c.id}`} className={`group block ${i % 2 ? 'lg:mt-14' : ''}`}>
              <div className="aspect-[4/5] overflow-hidden bg-bone">
                <Img name={c.image} alt="" sizes="(min-width: 1024px) 25vw, 50vw" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <div className="mt-4 flex items-baseline gap-3 border-t border-ink/20 pt-3">
                <span className="font-serif text-sm italic text-stone">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-xl group-hover:text-clay">{c.name}</h3>
                  <p className="mt-1 text-sm text-stone">{c.blurb}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-bone/60 py-20 lg:py-24" aria-labelledby="feat-h">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="label">Fresh from the kiln</p>
              <h2 id="feat-h" className="mt-3 text-3xl sm:text-4xl">This season’s favourites</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold link-u">Shop all {products.length || ''} pieces <ArrowIcon /></Link>
          </div>
          {status === 'loading' && <div className="mt-10"><CardSkeletons n={4} /></div>}
          {status === 'error' && <ErrorBox message={error ?? 'Could not load products.'} onRetry={retry} />}
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {featured.map((p) => <ProductCard key={p.id} p={p} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 48vw" />)}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="wrap scroll-mt-24 py-20 lg:py-28" aria-labelledby="story-h">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="grid grid-cols-2 gap-4 md:col-span-6">
            <div className="aspect-[3/4] overflow-hidden bg-bone">
              <Img name="story-studio" alt="A potter trimming a bowl at the wheel in a sunlit studio" sizes="(min-width: 768px) 25vw, 50vw" className="h-full w-full object-cover" />
            </div>
            <div className="mt-16 aspect-[3/4] overflow-hidden bg-bone">
              <Img name="story-wheel" alt="Potter shaping a tall vessel on the wheel" sizes="(min-width: 768px) 25vw, 50vw" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="label">The studio</p>
            <h2 id="story-h" className="mt-4 text-3xl leading-tight sm:text-[2.6rem]">Four people, one kiln, and a lot of <em className="text-clay">patience</em>.</h2>
            <div className="mt-6 space-y-4 leading-relaxed text-stone">
              <p>We started Tanah in 2019 in a converted garage in north Bandung. Everything is still thrown, trimmed and glazed there, a few hundred pieces a month, never more.</p>
              <p>The coffee came later. Our neighbours farm on the slopes of Mt. Tilu, and it felt wrong to make cups without knowing what went in them.</p>
            </div>
            <blockquote className="mt-8 border-l-2 border-clay pl-5">
              <p className="font-serif text-xl italic leading-snug">“Heavier than it looks, warmer than it looks. My favourite mug in years.”</p>
              <footer className="mt-2 text-xs uppercase tracking-label text-stone">Hanna M. · Copenhagen</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Coffee band */}
      <section className="wrap" aria-labelledby="coffee-h">
        <div className="grid overflow-hidden bg-ink text-paper md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[30rem]">
            <Img name="cat-brewing" alt="Pour-over coffee brewing into a glass carafe" sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="text-[0.7rem] font-semibold uppercase tracking-label text-clay-light">Roasted every Monday</p>
            <h2 id="coffee-h" className="mt-4 text-3xl leading-tight sm:text-4xl">Coffee from the islands, <em className="font-light">roasted for your dripper.</em></h2>
            <p className="mt-5 max-w-md leading-relaxed text-paper/70">Single-origin lots from Flores and West Java, bought direct and roasted light for filter. Pair a bag with the Arc dripper for the way we brew at the studio.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products/flores-bajawa-coffee" className="btn bg-paper text-ink hover:bg-clay-light">Shop Flores Bajawa</Link>
              <Link to="/shop?category=brewing" className="btn border border-paper/40 text-paper hover:bg-paper hover:text-ink">All brewing</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
