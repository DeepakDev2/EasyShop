# EasyShop — Project Context

> **Read this first** if you're a new LLM or resuming work. It contains everything needed to understand and continue this project.

---

## Overview

**EasyShop** — Full-stack Flipkart-style e-commerce platform.  
**Root**: `/home/sangal/temp/EasyShop`  
**Git branch**: `main` | **Package manager**: `pnpm` (workspace monorepo)  
**Last updated**: 2026-05-23

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), CSS (global), Zustand, React Query, Axios |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL on **Neon** (serverless, free tier — auto-pauses after 5 min idle) |
| ORM | Prisma v5 |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| Email | Gmail SMTP via `nodemailer` (App Password in `server/.env`) |
| Validation | Zod (server-side) |
| Testing | Jest + Supertest (backend), Jest + RTL (frontend) |

---

## How to Run

```bash
pnpm install              # from root, installs all workspaces
pnpm dev                  # starts both (server :5000, client :3000)
pnpm dev:server           # backend only
pnpm dev:client           # frontend only

# From server/ — run after pulling schema changes
npx prisma generate       # regenerate typed Prisma client (required after schema changes)
npx prisma db push        # sync schema to DB (also runs generate)
pnpm prisma:seed          # seed categories + products
pnpm prisma:studio        # Prisma GUI at :5555
pnpm test                 # Jest backend tests
```

> **Important**: `server/.env` must exist (copy from `.env.example`). The env file lives in `server/`, not the monorepo root.

---

## Directory Structure

```
EasyShop/
├── .env.example                          ← Template — copy to server/.env and fill in values
├── client/src/
│   ├── app/
│   │   ├── page.tsx                      ← Homepage: product grid, filters, search
│   │   ├── layout.tsx                    ← Root layout (Providers + MobileNav)
│   │   ├── not-found.tsx                 ← Custom 404
│   │   ├── middleware.ts                 ← Route protection (checkout/orders/wishlist → login)
│   │   ├── product/[slug]/page.tsx       ← Product detail + reviews section
│   │   ├── cart/page.tsx                 ← Cart
│   │   ├── checkout/address/page.tsx     ← Step 1: address (saves to DB if logged in)
│   │   ├── checkout/review/page.tsx      ← Step 2: review + place order
│   │   ├── order-success/page.tsx        ← Confetti + delivery estimate
│   │   ├── orders/page.tsx               ← My Orders list
│   │   ├── orders/[id]/page.tsx          ← Order detail + status tracker
│   │   ├── wishlist/page.tsx             ← Wishlist page
│   │   └── auth/{login,register}/        ← Auth pages
│   ├── components/
│   │   ├── layout/Header.tsx             ← Sticky header, cart badge (mounted guard), user dropdown
│   │   ├── layout/CategoryNav.tsx        ← Horizontal scrollable category strip
│   │   ├── layout/Footer.tsx             ← Dark footer
│   │   ├── layout/MobileNav.tsx          ← Bottom nav (mounted guard on cart badge)
│   │   ├── product/ProductCard.tsx       ← Card + ❤ wishlist (mounted guard on heart fill)
│   │   ├── product/FilterSidebar.tsx
│   │   ├── product/ImageCarousel.tsx
│   │   ├── product/SpecsTable.tsx
│   │   ├── cart/CartItem.tsx
│   │   └── cart/PriceSummary.tsx
│   ├── store/
│   │   ├── cartStore.ts      ← Zustand + localStorage persist; merges guest cart on login
│   │   ├── authStore.ts      ← Zustand + localStorage; sets cookie for Next.js middleware
│   │   └── wishlistStore.ts  ← Zustand + localStorage; optimistic update; syncs with API when logged in
│   ├── hooks/
│   │   ├── useProducts.ts    ← React Query: product list + single product
│   │   ├── useCategories.ts  ← React Query: categories
│   │   └── useReviews.ts     ← React Query: product reviews, can-review check, submit, delete
│   ├── lib/
│   │   ├── api.ts            ← Axios instance with JWT interceptor
│   │   ├── utils.ts          ← formatPrice, formatDate, getPrimaryImage
│   │   ├── filters.ts        ← Filter URL param helpers
│   │   ├── india-states.ts   ← Indian states list
│   │   ├── pincode.ts        ← Pincode → city/state lookup (calls server; SSL-bypass handled server-side)
│   │   └── token.ts          ← JWT decode helpers
│   └── types/index.ts        ← All shared TypeScript types (includes Review, ReviewsResponse, CanReviewResponse)
│
└── server/
    ├── .env                              ← Secret config (never commit; see .env.example)
    └── src/
        ├── config/
        │   ├── env.ts            ← Typed env (validates required vars on startup; loads server/.env)
        │   └── db.ts             ← Prisma singleton
        ├── middleware/
        │   ├── auth.ts           ← authenticate / optionalAuth / requireAdmin
        │   ├── errorHandler.ts   ← asyncHandler, createError, global error handler
        │   └── validate.ts       ← Zod middleware
        ├── schemas/              ← auth, product, order, address, cart, review schemas
        ├── services/             ← auth, product, category, order, wishlist, address, cart, pincode, review
        ├── controllers/          ← auth, product, category, order, wishlist, address, cart, pincode, review
        ├── routes/               ← all routes (see API table below)
        ├── utils/
        │   └── email.ts          ← nodemailer transporter + sendOrderConfirmation + HTML template
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
| GET | `/api/v1/reviews/product/:productId` | — | Paginated reviews + rating breakdown |
| GET | `/api/v1/reviews/can-review/:productId` | JWT | Check if user can review + existing review |
| POST | `/api/v1/reviews` | JWT | Create or update own review |
| DELETE | `/api/v1/reviews/:id` | JWT | Delete own review (or admin) |

**Product query params**: `category`, `q`, `minPrice`, `maxPrice`, `brand`, `rating`, `sort` (price_asc/price_desc/rating/newest), `page`, `limit`

---

## Database

- **Host**: Neon (serverless PostgreSQL, auto-pauses on free tier)
- **Config**: `server/.env` → `DATABASE_URL`
- **Prisma client**: run `npx prisma generate` from `server/` after any schema change

### Schema Models
`User` · `Category` · `Product` · `ProductImage` · `ProductSpec` · `Address` · `CartItem` · `Order` · `OrderItem` · `WishlistItem` · `Review`

### Seed Data
- **6 categories**: Mobiles, Electronics, Fashion, Home & Furniture, Appliances, Books
- **14 products** with images + specs
- **Ratings seeded as 0** — `rating` and `ratingCount` on Product are driven entirely by real user reviews via `recomputeProductRating()` in `review.service.ts`

### DB Persistence Status
| Table | Populated by |
|---|---|
| `users` | `POST /auth/register` |
| `orders` + `order_items` | `POST /orders` (checkout) |
| `wishlist_items` | Toggle heart (logged-in only) |
| `addresses` | Checkout address form (logged-in saves to DB) |
| `reviews` | `POST /api/v1/reviews` (must have non-cancelled order for product) |
| `categories`, `products`, etc. | `pnpm prisma:seed` |
| `cart_items` | **Intentionally client-side** (Zustand/localStorage) |

---

## Key Bugs Fixed

| Bug | Fix |
|---|---|
| **Hydration mismatch** (cart badge, heart icon, user dropdown) | Added `mounted` state in Header, MobileNav, ProductCard |
| **Neon DB connection failure on server start** | `db.ts` passes `datasourceUrl: env.DATABASE_URL` directly to PrismaClient |
| **`addresses` table always empty** | Route was commented out — now mounted and fully implemented |
| **Wishlist toggle slow** | Optimistic update in `wishlistStore.ts` — UI flips instantly, reverts on error. Backend reduced from 3→2 DB queries on add, 2→1 on remove |
| **Pincode city wrong** (e.g. "Bengaluru Urban" instead of "Bengaluru") | Added `DISTRICT_CITY_ALIASES` table + `deriveCity()` in `pincode.service.ts` |
| **Pincode API SSL failure** | `api.postalpincode.in` has expired SSL cert — replaced `fetch` with Node `https` module using `rejectUnauthorized: false` + redirect following |
| **Pincode spinner bobs down instead of rotating** | Split into outer div (positioning) + inner div (`animate-spin`) to avoid `transform` conflict with `-translate-y-1/2` |
| **`DATABASE_URL` missing on startup** | `.env` moved from monorepo root to `server/.env`; `env.ts` loads it via `path.resolve(__dirname, '../../.env')` |
| **TypeScript compile error on server start** | Prisma client stale — `npx prisma generate` from `server/` fixes it |
| **`process` not found in seed.ts** | Added `/// <reference types="node" />` — seed is outside tsconfig `include` |

---

## Reviews & Ratings Feature

- **One review per user per product** (`@@unique([userId, productId])`)
- **Verified purchase gate**: user must have a non-cancelled order containing the product
- **Aggregate recompute**: after every create/update/delete, `recomputeProductRating()` updates `Product.rating` + `Product.ratingCount` live
- **Frontend**: rating summary with star bars breakdown, interactive star picker (half-star rendering via CSS clip), review list with verified badge + pagination, edit/delete own review
- **Half-star rendering**: uses overlaid filled star clipped to 50% width — supports 0.25 threshold (4.25→half, 4.75→full)

---

## Email

- **Provider**: Gmail SMTP via `nodemailer` (`smtp.gmail.com:587`, STARTTLS)
- **Auth**: Gmail App Password (generate at https://myaccount.google.com/apppasswords)
- **Trigger**: fire-and-forget after `POST /orders` — sends order confirmation HTML email
- **Template**: inline HTML in `server/src/utils/email.ts` (`buildOrderEmailHTML`) — Flipkart-style branding
- **Config vars**: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` in `server/.env`
- **CTA link**: uses `env.CLIENT_URL` (not hardcoded localhost)

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
| Review eligibility | Any non-cancelled order qualifies (no delivery tracking workflow exists) |
| Product ratings | Fully driven by real reviews; seed always writes 0 |

## Color Palette

`#2874f0` (primary blue) · `#FFE500` (yellow) · `#388e3c` (green/discount) · `#fb641b` (orange/CTA) · `#f1f3f6` (page bg) · `#172337` (footer) · `#212121` (body text)
