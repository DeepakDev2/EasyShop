# EasyShop — Project Context & Progress Log

> **Purpose**: This file is a complete, living context document. If you lose your chat, read this file first — it tells you exactly what has been done, how, and what to do next.

---

## Project Overview

**Name**: EasyShop  
**Type**: Full-stack e-commerce platform (Flipkart-style)  
**Repo Root**: `/home/deepak-kumar/Documents/pro2/EasyShop`  
**Git Branch**: `main`  
**Plan File**: `plan.md` (1220 lines, full phase-by-phase blueprint)  
**Last Updated**: 2026-05-21 (all gaps through Phase 7 resolved)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TailwindCSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL via **Neon** (serverless) |
| ORM | Prisma v5 |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| Package Manager | **pnpm** (v11.1.3) |
| State (frontend) | Zustand (cart, auth, wishlist — all persisted) |
| Data Fetching | @tanstack/react-query |
| HTTP Client | axios (with JWT interceptor) |
| Validation | zod (server-side schemas) |
| Email | nodemailer (planned, not yet implemented) |

---

## How to Run

```bash
# From root — install everything
pnpm install

# Start both frontend + backend
pnpm dev

# Backend only: http://localhost:5000
pnpm dev:server

# Frontend only: http://localhost:3000
pnpm dev:client

# Prisma tools (from server/)
cd server
pnpm prisma:migrate    # Run DB migrations
pnpm prisma:seed       # Seed categories + products
pnpm prisma:studio     # GUI at http://localhost:5555
```

---

## Monorepo Structure

```
/home/deepak-kumar/Documents/pro2/EasyShop/
├── client/                          ← Next.js 14 frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx             ← Homepage (product grid, filters, search)
│       │   ├── layout.tsx           ← Root layout (Providers + MobileNav)
│       │   ├── not-found.tsx        ← Custom 404 page
│       │   ├── middleware.ts        ← Route protection (checkout/orders/wishlist)
│       │   ├── product/[slug]/      ← Product detail page
│       │   ├── cart/                ← Shopping cart page
│       │   ├── checkout/
│       │   │   ├── address/         ← Step 1: Address form (type, pincode auto-fill)
│       │   │   └── review/          ← Step 2: Review + place order
│       │   ├── order-success/       ← Confetti success page with delivery estimate
│       │   ├── orders/
│       │   │   ├── page.tsx         ← My Orders list (clickable)
│       │   │   └── [id]/page.tsx    ← Order detail + status progress tracker
│       │   ├── wishlist/            ← Wishlist page (remove + move to cart)
│       │   └── auth/
│       │       ├── login/           ← Login (with ?redirect= support)
│       │       └── register/        ← Register (strength indicator + confirm pw)
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx       ← Sticky blue header, cart badge, user dropdown
│       │   │   ├── CategoryNav.tsx  ← Horizontal scrollable category strip
│       │   │   ├── Footer.tsx       ← Dark footer with links + social icons
│       │   │   └── MobileNav.tsx    ← Bottom mobile nav (Home/Categories/Cart/Account)
│       │   ├── product/
│       │   │   ├── ProductCard.tsx  ← Card with ❤ wishlist button, discount badge
│       │   │   ├── ProductSkeleton.tsx
│       │   │   ├── FilterSidebar.tsx
│       │   │   ├── ImageCarousel.tsx
│       │   │   └── SpecsTable.tsx
│       │   └── cart/
│       │       ├── CartItem.tsx
│       │       └── PriceSummary.tsx
│       ├── store/
│       │   ├── cartStore.ts         ← Zustand cart (items, qty, totals, persist)
│       │   ├── authStore.ts         ← Zustand auth (user, token, cookie sync)
│       │   └── wishlistStore.ts     ← Zustand wishlist (guest + server sync)
│       ├── hooks/
│       │   ├── useProducts.ts       ← React Query (list + single product)
│       │   └── useCategories.ts     ← React Query categories
│       ├── lib/
│       │   ├── api.ts               ← Axios instance (JWT interceptor)
│       │   └── utils.ts             ← formatPrice, formatDate, getPrimaryImage
│       └── types/index.ts           ← All TypeScript types
│
└── server/                          ← Express.js REST API
    └── src/
        ├── config/
        │   ├── env.ts               ← Typed env validation
        │   └── db.ts                ← Prisma client singleton
        ├── middleware/
        │   ├── auth.ts              ← JWT authenticate / optionalAuth / requireAdmin
        │   ├── errorHandler.ts      ← Global error handler + asyncHandler
        │   └── validate.ts          ← Zod middleware
        ├── schemas/
        │   ├── product.schema.ts
        │   ├── auth.schema.ts
        │   └── order.schema.ts
        ├── services/
        │   ├── product.service.ts
        │   ├── category.service.ts
        │   ├── auth.service.ts      ← register, login, getProfile
        │   ├── order.service.ts     ← createOrder (transactional), getUserOrders, getOrderById
        │   └── wishlist.service.ts  ← toggleWishlist, getWishlist
        ├── controllers/             ← (product, category, auth, order controllers)
        ├── routes/                  ← (product, category, auth, order, wishlist routes)
        ├── utils/helpers.ts         ← computeDiscountPct, generateOrderNumber, formatProduct
        └── index.ts                 ← Express entry: helmet, CORS, morgan, all routes
```

---

## Phase Completion Status

| Phase | Status | Notes |
|---|---|---|
| **Phase 0** — Setup & Scaffolding | ✅ **COMPLETE** | Monorepo, Express, Next.js 14, Prisma, Neon DB |
| **Phase 1** — Products & Categories API | ✅ **COMPLETE** | Full CRUD, filters, search, pagination, seed data |
| **Phase 2** — Frontend Product Listing | ✅ **COMPLETE** | Homepage, grid, filters, search, category nav |
| **Phase 3** — Product Detail Page | ✅ **COMPLETE** | Image carousel, specs, qty, offers, related products |
| **Phase 4** — Shopping Cart | ✅ **COMPLETE** | Zustand store, cart page, qty controls, price summary, badge |
| **Phase 5** — Checkout & Order Placement | ✅ **COMPLETE** | Address form, review page, order API, stock decrement, order history |
| **Phase 6** — User Authentication | ✅ **COMPLETE** | JWT, bcrypt, register/login, user dropdown, cookie sync |
| **Phase 7** — Good-to-Have Features | ✅ **COMPLETE** | Wishlist, Footer, 404 page, all plan gaps resolved |
| **Phase 8** — Responsive Design & Polish | ⏳ Partially done | Mobile bottom nav ✅, mobile grid ✅ — full audit pending |
| **Phase 9** — Testing & QA | ⏳ Not started | Jest + Supertest backend tests |
| **Phase 10** — Deployment | ⏳ Not started | Vercel (frontend) + Railway/Render (backend) |

---

## Database

- **Host**: Neon (serverless PostgreSQL)
- **Connection**: `DATABASE_URL` in `server/.env`
- **Migrations**: `server/prisma/migrations/` (2 migrations applied)
  - `20260521101927_init` — initial 9 tables
  - `20260521125851_add_shipping_address` — added `shipping_address` text column to `orders`

### Schema (9 models)
`User` · `Category` · `Product` · `ProductImage` · `ProductSpec` · `Address` · `CartItem` · `Order` · `OrderItem` · `WishlistItem`

### Seed Data
- **6 categories**: Mobiles, Electronics, Fashion, Home & Furniture, Appliances, Books
- **14 products** with 2–3 images + specs each

---

## API Endpoints (All Working)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |
| GET | `/api/v1/categories` | — | All categories with product count |
| GET | `/api/v1/products` | — | Paginated products (filters, search, sort) |
| GET | `/api/v1/products/:slug` | — | Product detail + related |
| POST | `/api/v1/auth/register` | — | Create account, returns JWT |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/auth/me` | JWT | Current user profile |
| POST | `/api/v1/orders` | JWT | Place order (transactional) |
| GET | `/api/v1/orders/my` | JWT | User's order history |
| GET | `/api/v1/orders/:id` | JWT | Single order detail |
| GET | `/api/v1/wishlist` | JWT | Get wishlist products |
| POST | `/api/v1/wishlist/:productId` | JWT | Toggle wishlist (add/remove) |

### Product Query Params
`category` · `q` (search) · `minPrice` · `maxPrice` · `brand` · `rating` · `sort` (price_asc/price_desc/rating/newest) · `page` · `limit`

---

## Frontend Features Implemented

### Product Discovery
- Homepage with product grid (2–4 columns responsive)
- Category nav strip with active state
- Filter sidebar: category, price range, rating, brand, sort
- Full-text search with **300ms debounce**
- Pagination
- Product card with discount badge + ❤ wishlist button

### Product Detail Page
- Image carousel with thumbnails + zoom
- Expandable specifications table
- Quantity selector (capped at stock)
- Available offers section
- Pincode delivery check
- ❤ Heart button (syncs with wishlist store)
- ADD TO CART + BUY NOW buttons

### Shopping Cart
- Zustand store with `localStorage` persistence
- Qty +/- controls, Remove button
- Live price summary (subtotal, discount, delivery, total)
- FREE delivery above ₹500
- Cart item count badge in header

### Checkout Flow (2-step)
- **Step 1** `/checkout/address`: Full address form
  - Home / Work address type toggle
  - Pincode auto-fill (city + state via postal API)
  - Indian state dropdown
- **Step 2** `/checkout/review`: Review + place order
  - Shows address, items, price summary, COD label
  - Places order via API with JWT
- **Order success** `/order-success`: Confetti 🎉 + estimated delivery date + order summary

### Orders
- My Orders list with status badges (placed/confirmed/shipped/delivered/cancelled)
- Clickable → Order detail page
- Order detail: status progress tracker, items, address, payment, total

### Authentication
- Register: name, email, phone, password + **strength indicator** + confirm password
- Login: email, password, show/hide toggle
- Both pages: Flipkart-style split blue/white layout
- `?redirect=` param — returns to original protected page after login
- JWT stored in `localStorage` + `cookie` (for middleware)
- Header: shows first name + dropdown (My Orders · Wishlist · Logout) when logged in

### Wishlist
- ❤ button on every ProductCard + PDP
- Guest wishlist stored in `localStorage` (no login required)
- Syncs with server when logged in
- Wishlist page: product grid, Remove, Move to Cart

### Route Protection (Next.js Middleware)
- `/checkout/*`, `/orders/*`, `/wishlist/*` → redirect to `/auth/login?redirect=<path>`

### UI/UX
- Sticky blue header with search
- Mobile bottom nav (Home / Categories / Cart / Account)
- Dark footer with columns, social icons, copyright
- Custom 404 not-found page
- Toast notifications (`react-hot-toast`) throughout
- Skeleton loaders on product grid + order list

---

## What's NOT Yet Implemented (Known Gaps)

| Feature | Phase | Notes |
|---|---|---|
| Email notifications (order confirmation) | 7.3 | Requires SMTP credentials; `nodemailer` is a dependency |
| Full mobile audit | 8 | Mobile nav done; header hamburger menu not built |
| Backend tests | 9 | Jest + Supertest — not started |
| Deployment | 10 | Vercel + Railway — not started |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| DB hosting | Neon (serverless PostgreSQL) | No Docker needed, free tier |
| Package manager | pnpm | Faster, disk-efficient, best monorepo support |
| Naming | "EasyShop" everywhere | User preference |
| Cart persistence | Zustand + `localStorage` | Works for guests; merged on login |
| Wishlist for guests | Zustand + `localStorage` (no API) | API only called when logged in |
| Auth cookie | Set on login/register for middleware | localStorage not accessible in Next.js middleware |
| Delivery charge | Free if total ≥ ₹500, else ₹40 | Flipkart-style incentive |

---

## Color Palette

| Name | Hex |
|---|---|
| Primary Blue | `#2874f0` |
| Yellow Accent | `#FFE500` |
| Green (Discount/Success) | `#388e3c` |
| Orange (CTA/Offers) | `#fb641b` |
| Background | `#f1f3f6` |
| Card Background | `#ffffff` |
| Footer Background | `#172337` |
| Body text | `#212121` |
| Secondary text | `#878787` |

---

*Last updated: 2026-05-21 — All plan gaps through Phase 7 resolved. Ready for Phase 8 (full mobile polish) or Phase 9 (testing).*
