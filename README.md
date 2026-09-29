# Tanah Studio

A finished demo e-commerce storefront for a fictional boutique selling handmade stoneware and Indonesian coffee. Built as a portfolio piece by [iQuee](https://iquee.tech).

**Demo only — no real orders or payments.** Cart, promo codes, and demo orders live in `localStorage`.

**Live demo:** [https://shop.iquee.tech](https://shop.iquee.tech)

## Features

- Home, catalog, product detail, cart, checkout, and order confirmation
- Catalog filters: category, search, sort, and price range (URL-synced)
- Product gallery, variants with price deltas, quantity stepper, related products
- Cart drawer and cart page with qty/remove, promo codes `DEMO10` / `FREESHIP`, and a free-shipping meter
- Validated checkout with a demo payment selector
- Order confirmation with a generated order number
- Cart, promo, and demo orders persisted in `localStorage`
- Static SPA build suitable for nginx (see `deploy/`)

## Tech Stack

| Area | Choice | Version |
| --- | --- | --- |
| Frontend framework / language | React + TypeScript | React `^18.3.1`, TypeScript `~5.6.2` |
| Styling | Tailwind CSS (+ PostCSS, Autoprefixer); self-hosted variable fonts Fraunces & Instrument Sans | Tailwind `^3.4.19`, PostCSS `^8.5.28`, Autoprefixer `^10.6.1`, fonts `^5.3.0` |
| Routing | React Router DOM | `^6.30.6` |
| State / data storage (cart) | Browser `localStorage` only — no backend or database. Products are mock data in code; cart, promo codes, and demo orders persist in the browser. | — |
| Images | Local WebP assets (from [Pexels](https://www.pexels.com); see [CREDITS.md](./CREDITS.md)) | — |
| Build tooling | Vite (+ `@vitejs/plugin-react`) | Vite `^5.4.10`, plugin `^4.3.3` |
| Linting | ESLint 9 flat config (`eslint`, `typescript-eslint`, React Hooks / Refresh plugins) | ESLint `^9.13.0`, typescript-eslint `^8.11.0` |
| Hosting / deploy | Static SPA on Nginx (Ubuntu VPS), Cloudflare in front, Let's Encrypt SSL (see `deploy/`) | — |

**Honest limits:** there is **no backend**, **no database**, and **no real payments**. Checkout is a demo UI only.

### Production-ready path *(future work — not implemented)*

To turn this demo into a real store you would still need, for example: a REST API + PostgreSQL (or similar) for products/orders, a payment gateway such as Stripe, and an admin CMS. None of that exists in this repo today.

## Getting started

```bash
npm install
npm run dev       # local development server
npm run build     # typecheck + production build -> dist/
npm run preview   # serve the built dist/ locally
npm run lint      # ESLint
```

Serve `dist/` with SPA fallback to `index.html` (examples in `deploy/`).

### Optional Playwright helpers

Requires Playwright (and Chrome/Chromium) plus a running preview server on port 4173:

```bash
npx vite preview --port 4173
python shots.py                 # screenshots -> shot-*.png in the repo root
python flow.py                  # end-to-end storefront flow checks
python tools/render_meta.py     # regenerate OG image and favicon PNGs
```

Override paths with env vars if needed: `CHROME_PATH`, `SHOTS_OUT`. A local venv such as `.venv-pw` is fine; it is gitignored.

## License / credits

Tanah Studio is a fictional brand. Product names, descriptions, and prices are invented for this demo. Image credits: [CREDITS.md](./CREDITS.md).
