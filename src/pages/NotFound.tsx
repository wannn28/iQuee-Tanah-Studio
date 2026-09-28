import { Link } from 'react-router-dom'
import useTitle from '../lib/useTitle'
export default function NotFound() {
  useTitle('Page not found')
  return (
    <section className="wrap py-28 text-center">
      <p className="label">404</p>
      <h1 className="mt-3 font-serif text-5xl italic">Cracked in the kiln.</h1>
      <p className="mx-auto mt-4 max-w-md text-stone">We couldn’t find that page. It happens to the best pots.</p>
      <Link to="/shop" className="btn-primary mt-8">Back to the shop</Link>
    </section>
  )
}
