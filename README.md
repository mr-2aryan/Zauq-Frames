# Zauq Frames

Storefront for **Zauq Premium Frames**: curated and custom wall frames, made in Rawalpindi.

| Part | Stack |
| --- | --- |
| `client/` | React 19, Vite 8, React Router 8, CSS Modules |
| `server/` | Node.js, Express 5, Multer (uploads), Zod (validation) |
| Database | Not chosen yet. Data lives in memory behind repository modules (see below). |

Requires **Node.js 22.22 or newer**.

## Getting started

```bash
npm install      # installs root, client and server (npm workspaces)
npm run dev      # starts the API and the website together
```

- Website: http://localhost:5173
- API: http://localhost:5000/api/health

In development, Vite proxies `/api` and `/uploads` to the Express server, so the client always calls relative URLs.

## Pages

The site uses the **Olive Market** design (concept D): olive `#3E4A1F`, Plus Jakarta Sans, rounded panels.

| Path | Page |
| --- | --- |
| `/` | Home: hero, categories, featured pieces, custom-frame teaser, business section |
| `/shop`, `/collections/:collection` | Product listing with category filters, header search (`?q=`) and sort |
| `/products/:slug` | Product: gallery, size picker (one price for every size), add to cart / buy now, details tabs, related pieces |
| `/custom-frames` | Photo upload, live framed preview with drag-to-crop, size and orientation |
| `/cart` | Cart, order summary and checkout (places a real order via the API) |
| Other links | "Coming soon" placeholders: see `UPCOMING_PAGES` in `client/src/config/routes.js` |

## Products, prices and the promotion

- **Products and collections:** edit `server/src/modules/products/products.catalog.js`. Each piece has a name, description, collection and images (stored in `client/public/images/products/`). Set `featured: true` to show it on the home page, and `badge` (e.g. `'New'`) to label its card.
- **Prices:** edit `server/src/modules/frames/frames.catalog.js`.
  - `PRODUCT_PRICE` (currently Rs 2,500) is what customers pay for every shop product in any size, after the promotion. The struck-through price (Rs 2,941) is worked out from it.
  - `FRAME_SIZES[].price` is the price of a custom frame (your photo) in each size.
- **Promotion:** `PROMOTION.percentOff` in the same file (currently 15). It is applied everywhere: product cards, the announcement bar, the cart and the server's order totals. Set it to `0` to switch it off.

## Scripts (run from the project root)

| Command | What it does |
| --- | --- |
| `npm run dev` | API (auto-restarts on change) and Vite dev server |
| `npm run dev:client` / `npm run dev:server` | Start only one side |
| `npm run build` | Production build of the client into `client/dist` |
| `npm start` | Start the API. With `NODE_ENV=production` it also serves `client/dist` |
| `npm run lint` | Lint the client with oxlint |

## Environment

Both apps work with no `.env` file. To override defaults, copy the example files:

- `server/.env.example` → `server/.env` (port, CORS origin, upload folder and size limit)
- `client/.env.example` → `client/.env.local` (dev proxy target, optional external API URL)

## Project structure

```
client/src/
  app/                App shell: router, providers
  config/             Routes, navigation, brand/contact details
  styles/             Design tokens (colours, fonts, spacing) and global CSS
  components/
    ui/               Design-system primitives: Button, Panel, Section, Price, Chip, Badge, Logo, …
    layout/           Header (with mobile menu and search), Footer, WhatsAppButton
    common/           Reusable blocks: FaqList, PageMessage, TrustStrip
    icons/            SVG icon components
  context/            Frame catalogue (loaded once), cart (persisted to localStorage), toasts
  features/
    home/             Home page sections
    products/         Product cards, grid, gallery, purchase panel, shop filters, data hooks
    custom-frames/    Custom Frames page: sections, builder, hooks, copy
    cart/             Cart lines, summary, checkout form, order confirmation
  layouts/            MainLayout (header + page + footer)
  pages/              Route-level pages
  services/           API client and one module per API resource
  hooks/, utils/      Shared helpers

server/src/
  app.js              Express app (middleware, routes, error handling)
  server.js           Starts the HTTP server
  config/env.js       Environment configuration
  modules/<feature>/  routes → controller → service → repository, plus a Zod schema
  middleware/         Validation, 404 and error handlers
  lib/                createMemoryRepository (temporary persistence)
```

### Conventions

- **One component per folder**, each with its own `*.module.css`. Shared values come from CSS variables in `styles/tokens.css`. Don't hard-code colours.
- **Feature folders** (`features/<name>/`) hold everything a page section needs. Pages only compose them.
- **Prices come from the API** (`GET /api/frames/catalog`). The server recalculates every order total and never trusts prices sent by the client.
- Import with the `@/` alias (`@/components/ui`), which maps to `client/src`.

## API

All responses are `{ "data": … }` on success or `{ "error": { "message", "details?" } }` on failure.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Liveness check |
| GET | `/api/frames/catalog` | Sizes with custom-frame prices, the product price, promotion, orientations, delivery fee |
| GET | `/api/collections` | Collections with product counts (`/api/collections/:slug` for one) |
| GET | `/api/products` | Products. Query: `collection` (comma-separated), `q`, `sort` (`featured`, `name-asc`, `name-desc`), `featured=true`, `limit` |
| GET | `/api/products/:slug` | One product with images and related pieces |
| POST | `/api/uploads` | Upload a customer photo (`multipart/form-data`, field `photo`; JPG/PNG ≤ 20 MB; file signature checked) |
| POST | `/api/orders` | Place an order: `customer` + `items[]`. Items are `{ type: 'product', productId, sizeId, orientation, quantity }` or `{ type: 'custom-frame', photoId, sizeId, orientation, quantity, crop }`. Prices are computed by the server |
| GET | `/api/orders/:orderId` | Public order status, without contact details |
| POST | `/api/newsletter` | Subscribe an email (idempotent) |

Uploaded photos are stored in `server/uploads/` (git-ignored) and served from `/uploads/<id>`.

## Brand catalogue (PDF)

`catalogue/` holds the 12-page A4 company catalogue:

- `catalogue.html` is the source; see `DESIGN.md` for the design system.
- `images/` holds the print-resolution product photos.
- Two PDFs are built from it: `Zauq-Frames-Catalogue-2026.pdf` (A4, for email and office printing) and `Zauq-Frames-Catalogue-2026-PRINT-3mm-bleed.pdf` (for a print shop).

After editing the HTML, rebuild with:

```bash
node catalogue/build-pdf.mjs   # needs Edge or Chrome installed, and internet for Google Fonts
```

## Adding a database later

Persistence is isolated in repository modules:

- `server/src/modules/orders/orders.repository.js`
- `server/src/modules/newsletter/newsletter.repository.js`
- `server/src/modules/frames/frames.catalog.js` (static catalogue, read only by `frames.service.js`)
- `server/src/modules/products/products.catalog.js` (static catalogue, read only by `products.service.js`)

Replace each with a DB-backed version that exposes the same async methods (`create`, `findById`, `findOne`, `findAll`, `update`). Services and controllers won't need to change.

## Adding a page

Pages linked from the header and footer currently show a "Coming soon" placeholder (listed in `client/src/config/routes.js` → `UPCOMING_PAGES`). To build one:

1. Create the page in `client/src/pages/` (and a `features/<name>/` folder if it has several sections).
2. Remove its entry from `UPCOMING_PAGES`.
3. Add a route for it in `client/src/app/router.jsx`.
