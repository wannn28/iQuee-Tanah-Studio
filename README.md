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

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- Self-hosted variable fonts (Fraunces, Instrument Sans)

Product and editorial photographs are from [Pexels](https://www.pexels.com), stored locally as WebP — see [CREDITS.md](./CREDITS.md).

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
