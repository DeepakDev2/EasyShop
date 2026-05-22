# EasyShop — Project Context

> **Read this first** if you're a new LLM or resuming work. It contains everything needed to understand and continue this project.

---

## Overview

**EasyShop** — Full-stack Flipkart-style e-commerce platform.  
**Root**: `/home/deepak-kumar/Documents/pro2/EasyShop`  
**Git branch**: `main` | **Package manager**: `pnpm` (workspace monorepo)  
**Last updated**: 2026-05-22

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), CSS (global), Zustand, React Query, Axios |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL on **Neon** (serverless, free tier — auto-pauses after 5 min idle) |
| ORM | Prisma v5 |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| Email | Resend (API key in `.env`) |
| Validation | Zod (server-side) |
| Testing | Jest + Supertest (backend), Jest + RTL (frontend) |

---

## How to Run

```bash
pnpm install              # from root, installs all workspaces
pnpm dev                  # starts both (server :5000, client :3000)
pnpm dev:server           # backend only
pnpm dev:client           # frontend only

# From server/
pnpm prisma:migrate       # run migrations
pnpm prisma:seed          # seed categories + products
pnpm prisma:studio        # Prisma GUI at :5555
pnpm test                 # Jest backend tests
```

---

## Directory Structure

```
EasyShop/
├── client/src/
│   ├── app/
│   │   ├── page.tsx                  ← Homepage: product grid, filters, search
│   │   ├── layout.tsx                ← Root layout (Providers + MobileNav)
│   │   ├── not-found.tsx             ← Custom 404
│   │   ├── middleware.ts             ← Route protection (checkout/orders/wishlist → login)
│   │   ├── product/[slug]/page.tsx   ← Product detail
│   │   ├── cart/page.tsx             ← Cart
│   │   ├── checkout/address/page.tsx ← Step 1: address (saves to DB if logged in)
│   │   ├── checkout/review/page.tsx  ← Step 2: review + place order
│   │   ├── order-success/page.tsx    ← Confetti + delivery estimate
│   │   ├── orders/page.tsx           ← My Orders list
│   │   ├── orders/[id]/page.tsx      ← Order detail + status tracker
│   │   ├── wishlist/page.tsx         ← Wishlist page
│   │   └── auth/{login,register}/   ← Auth pages
│   ├── components/
│   │   ├── layout/Header.tsx         ← Sticky header, cart badge (mounted guard), user dropdown
│   │   ├── layout/CategoryNav.tsx    ← Horizontal scrollable category strip
│   │   ├── layout/Footer.tsx         ← Dark footer
│   │   ├── layout/MobileNav.tsx      ← Bottom nav (mounted guard on cart badge)
│   │   ├── product/ProductCard.tsx   ← Card + ❤ wishlist (mounted guard on heart fill)
│   │   ├── product/FilterSidebar.tsx
│   │   ├── product/ImageCarousel.tsx
│   │   ├── product/SpecsTable.tsx
│   │   ├── cart/CartItem.tsx
│   │   └── cart/PriceSummary.tsx
│   ├── store/
│   │   ├── cartStore.ts      ← Zustand + localStorage persist; merges guest cart on login
│   │   ├── authStore.ts      ← Zustand + localStorage; sets cookie for Next.js middleware
│   │   └── wishlistStore.ts  ← Zustand + localStorage; syncs with API when logged in
│   ├── hooks/
│   │   ├── useProducts.ts    ← React Query: product list + single product
│   │   └── useCategories.ts  ← React Query: categories
│   ├── lib/
│   │   ├── api.ts            ← Axios instance with JWT interceptor
│   │   ├── utils.ts          ← formatPrice, formatDate, getPrimaryImage
│   │   ├── filters.ts        ← Filter URL param helpers
│   │   ├── india-states.ts   ← Indian states list
│   │   ├── pincode.ts        ← Pincode → city/state lookup (postal API)
│   │   └── token.ts          ← JWT decode helpers
│   └── types/index.ts        ← All shared TypeScript types
│
└── server/src/
    ├── config/
    │   ├── env.ts            ← Typed env (validates required vars on startup)
    │   └── db.ts             ← Prisma singleton with explicit datasourceUrl (fixes Neon cold-start)
    ├── middleware/
    │   ├── auth.ts           ← authenticate / optionalAuth / requireAdmin
    │   ├── errorHandler.ts   ← asyncHandler, createError, global error handler
    │   └── validate.ts       ← Zod middleware
    ├── schemas/              ← auth, product, order, address, cart schemas
    ├── services/             ← auth, product, category, order, wishlist, address, cart, pincode
    ├── controllers/          ← auth, product, category, order, wishlist, address, cart, pincode
    ├── routes/               ← all routes (see API table below)
    ├── __mocks__/db.ts       ← Prisma mock for Jest
    ├── __tests__/            ← auth, products, orders test suites (30 tests, all passing)
    └── index.ts              ← Express app: helmet, CORS, morgan, all routes mounted
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/api/v1/categories` | — | All categories |
| GET | `/api/v1/products` | — | Paginated products (filters, search, sort) |
| GET | `/api/v1/products/:slug` | — | Product detail + related |
| POST | `/api/v1/auth/register` | — | Register → returns JWT + user |
| POST | `/api/v1/auth/login` | — | Login → returns JWT + user |
| GET | `/api/v1/auth/me` | JWT | Current user profile |
| POST | `/api/v1/orders` | JWT | Place order (transactional) |
| GET | `/api/v1/orders/my` | JWT | User's orders |
| GET | `/api/v1/orders/:id` | JWT | Order detail |
| PATCH | `/api/v1/orders/:id/cancel` | JWT | Cancel order |
| GET | `/api/v1/wishlist` | JWT | Get wishlist |
| POST | `/api/v1/wishlist/:productId` | JWT | Toggle wishlist |
| GET | `/api/v1/addresses` | JWT | Get saved addresses |
| POST | `/api/v1/addresses` | JWT | Save new address |
| PUT | `/api/v1/addresses/:id` | JWT | Update address |
| DELETE | `/api/v1/addresses/:id` | JWT | Delete address |
| PATCH | `/api/v1/addresses/:id/default` | JWT | Set default address |
| GET | `/api/v1/cart` | JWT | Get server-side cart |
| POST | `/api/v1/cart` | JWT | Add/update cart item |
| DELETE | `/api/v1/cart/:productId` | JWT | Remove cart item |
| GET | `/api/v1/pincode/:pin` | — | Pincode → city/state |

**Product query params**: `category`, `q`, `minPrice`, `maxPrice`, `brand`, `rating`, `sort` (price_asc/price_desc/rating/newest), `page`, `limit`

---

## Database

- **Host**: Neon (serverless PostgreSQL, auto-pauses on free tier)
- **Config**: `server/.env` → `DATABASE_URL` (must include `?sslmode=require&connect_timeout=30&pool_timeout=30`)
- **Prisma client**: initialized with `datasourceUrl: env.DATABASE_URL` explicitly (prevents cold-start connection failure)

### Migrations (3 applied)
1. `20260521101927_init` — 9 tables
2. `20260521125851_add_shipping_address` — `orders.shipping_address` text column
3. `20260521152633_add_address_type_field` — `addresses.type` varchar column

### Schema Models
`User` · `Category` · `Product` · `ProductImage` · `ProductSpec` · `Address` · `CartItem` · `Order` · `OrderItem` · `WishlistItem`

### Seed Data
- **6 categories**: Mobiles, Electronics, Fashion, Home & Furniture, Appliances, Books
- **14 products** with images + specs

### DB Persistence Status
| Table | Populated by |
|---|---|
| `users` | `POST /auth/register` |
| `orders` + `order_items` | `POST /orders` (checkout) |
| `wishlist_items` | Toggle heart (logged-in only) |
| `addresses` | Checkout address form (logged-in saves to DB) |
| `categories`, `products`, etc. | `pnpm prisma:seed` |
| `cart_items` | **Intentionally client-side** (Zustand/localStorage) |

---

## Key Bugs Fixed (Important for Future Work)

| Bug | Fix |
|---|---|
| **Hydration mismatch** (cart badge, heart icon, user dropdown) | Added `mounted` state in Header, MobileNav, ProductCard — Zustand persist reads localStorage only after client hydration |
| **Neon DB connection failure on server start** | `db.ts` now passes `datasourceUrl: env.DATABASE_URL` directly to PrismaClient instead of relying on `process.env` (module hoisting issue with ts-node) |
| **`addresses` table always empty** | Route was commented out — now mounted and fully implemented |

---

## Phase Status

| Phase | Status |
|---|---|
| 0 — Setup & Scaffolding | ✅ Complete |
| 1 — Products & Categories API | ✅ Complete |
| 2 — Frontend Product Listing | ✅ Complete |
| 3 — Product Detail Page | ✅ Complete |
| 4 — Shopping Cart | ✅ Complete |
| 5 — Checkout & Orders | ✅ Complete |
| 6 — Authentication | ✅ Complete |
| 7 — Wishlist, Footer, Polish | ✅ Complete |
| 8 — Responsive Design | ✅ Complete (mobile nav, header hamburger, grids) |
| 9 — Testing & QA | ✅ Backend: 30 tests passing. Frontend: component tests written |
| 10 — Deployment | ⏳ Not started (Vercel + Render/Railway) |

---

## Design Decisions

| Decision | Choice |
|---|---|
| Cart persistence | Zustand + localStorage (guest-friendly; merges on login) |
| Wishlist for guests | localStorage only; API syncs on login |
| Auth tokens | localStorage + cookie (cookie needed for Next.js middleware) |
| Address persistence | DB (logged-in users); sessionStorage (guests, checkout only) |
| Delivery charge | Free ≥ ₹500, else ₹40 |
| Neon cold-start | `connect_timeout=30&pool_timeout=30` in DATABASE_URL |

## Color Palette

`#2874f0` (primary blue) · `#FFE500` (yellow) · `#388e3c` (green/discount) · `#fb641b` (orange/CTA) · `#f1f3f6` (page bg) · `#172337` (footer) · `#212121` (body text)
