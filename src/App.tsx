import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header, { DemoBar } from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductPage from './pages/Product'
import CartPage from './pages/Cart'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import NotFound from './pages/NotFound'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
      <ScrollManager />
      <DemoBar />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderNo" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
