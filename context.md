# EasyShop — Project Context & Progress Log

> **Purpose**: This file is a complete, living context document. If you lose your chat, read this file first — it tells you exactly what has been done, how, and what to do next.

---

## Project Overview

**Name**: EasyShop  
**Type**: Full-stack e-commerce platform (Flipkart-style clone)  
**Repo Root**: `/home/deepak-kumar/Documents/pro2/EasyShop`  
**Git Branch**: `main`  
**Plan File**: `plan.md` (1220 lines, full phase-by-phase blueprint)

---

## Tech Stack (Confirmed Choices)

| Layer | Technology | Decision Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router), TailwindCSS | Per plan.md |
| Backend | Node.js + Express.js + TypeScript | Per plan.md |
| Database | PostgreSQL via **Neon** (serverless, free) | User chose Neon over Docker |
| ORM | Prisma v5 | Per plan.md |
| Auth | JWT (jsonwebtoken + bcryptjs) | Per plan.md |
| Package Manager | **pnpm** (v11.1.3) | Better than npm for monorepos — faster, disk-efficient |
| State (frontend) | Zustand | Per plan.md |
| Data Fetching | @tanstack/react-query | Per plan.md |
| HTTP Client | axios | Per plan.md |
| Validation | zod (server-side) | Per plan.md |
| Email | nodemailer | Per plan.md |

---

## Monorepo Structure

```
/home/deepak-kumar/Documents/pro2/EasyShop/
├── client/                     ← Next.js 14 frontend (pnpm workspace)
│   ├── src/
│   │   ├── app/                ← App Router pages (layout, page, auth, cart, etc.)
│   │   ├── components/         ← layout/, product/, cart/, checkout/, ui/
│   │   ├── store/              ← Zustand stores (cartStore, authStore, wishlistStore)
│   │   ├── hooks/              ← useProducts, useCart, useAuth, etc.
│   │   ├── lib/                ← api.ts (axios), utils.ts
│   │   └── types/index.ts      ← All TypeScript types ✅ DONE
│   ├── .env.local              ← NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_NAME
│   └── package.json
│
├── server/                     ← Express.js REST API (pnpm workspace)
│   ├── src/
│   │   ├── config/env.ts       ← Centralized env vars with validation ✅ DONE
│   │   ├── middleware/
│   │   │   ├── auth.ts         ← JWT authenticate, optionalAuth, requireAdmin ✅ DONE
│   │   │   ├── errorHandler.ts ← Global error handler, createError, asyncHandler ✅ DONE
│   │   │   └── validate.ts     ← Zod request/query validation middleware ✅ DONE
│   │   ├── routes/             ← (empty, will be filled in Phase 1)
│   │   ├── controllers/        ← (empty, will be filled in Phase 1)
│   │   ├── services/           ← (empty, will be filled in Phase 1)
│   │   ├── schemas/            ← (empty, Zod schemas per resource)
│   │   ├── utils/              ← (empty, email, orderNumber, upload helpers)
│   │   └── index.ts            ← Express entry point ✅ DONE + TESTED
│   ├── prisma/
│   │   └── schema.prisma       ← Full DB schema (9 models) ✅ DONE
│   ├── .env                    ← Needs DATABASE_URL from Neon
│   ├── tsconfig.json           ✅ DONE
│   └── package.json            ✅ DONE
│
├── .env.example                ← Template for all env vars ✅ DONE
├── .gitignore                  ✅ DONE
├── package.json                ← Root pnpm workspace scripts ✅ DONE
├── pnpm-workspace.yaml         ← Declares client + server workspaces ✅ DONE
├── README.md                   ✅ DONE
├── plan.md                     ← Full implementation plan
└── context.md                  ← This file
```

---

## Phase Completion Status

| Phase | Status | Notes |
|---|---|---|
| **Phase 0** — Setup & Scaffolding | ✅ **COMPLETE** | See details below |
| Phase 1 — Core Backend: Products & Categories | ⏳ Not started | Awaiting user approval |
| Phase 2 — Frontend: Product Listing | ⏳ Not started | |
| Phase 3 — Product Detail Page | ⏳ Not started | |
| Phase 4 — Shopping Cart | ⏳ Not started | |
| Phase 5 — Checkout & Order Placement | ⏳ Not started | |
| Phase 6 — User Authentication | ⏳ Not started | |
| Phase 7 — Good-to-Have Features | ⏳ Not started | |
| Phase 8 — Responsive Design & Polish | ⏳ Not started | |
| Phase 9 — Testing & QA | ⏳ Not started | |
| Phase 10 — Deployment | ⏳ Not started | |

---

## Phase 0 — Detailed Completion Log

### ✅ Step 0.0 — Prerequisites Verified
- Node.js: v24.11.0
- npm: 11.6.1
- Git: 2.43.0
- pnpm: installed globally via `npm install -g pnpm` → v11.1.3

### ✅ Step 0.1 — Repository Structure
- `git init` done, branch renamed to `main`
- Root files created: `pnpm-workspace.yaml`, `.gitignore`, `package.json`, `.env.example`, `README.md`
- Root `package.json` has workspace scripts: `pnpm dev`, `pnpm dev:server`, `pnpm dev:client`

### ✅ Step 0.2 — Backend Initialized
Files created in `server/`:
- `package.json` — all Express, Prisma, auth, and dev dependencies
- `tsconfig.json` — TypeScript config targeting ES2020, outputting to `dist/`
- `src/config/env.ts` — validates required env vars on startup, exports typed `env` object
- `src/middleware/errorHandler.ts` — `AppError` type, `createError()`, `asyncHandler()`, global handler
- `src/middleware/auth.ts` — `authenticate`, `optionalAuth`, `requireAdmin` JWT middleware
- `src/middleware/validate.ts` — Zod body and query validation middleware
- `src/index.ts` — Express app: helmet, CORS, morgan, json parsing, health check at `/health`
- `prisma/schema.prisma` — 9 Prisma models: User, Category, Product, ProductImage, ProductSpec, Address, CartItem, Order, OrderItem, WishlistItem
- `.env` — placeholder (needs real Neon DATABASE_URL)
- Dependencies installed via `pnpm install` + Prisma build scripts approved

### ✅ Step 0.3 — Frontend Initialized
- Created with: `npx create-next-app@14 client --typescript --tailwind --app --src-dir --import-alias "@/*"`
- Additional libs installed: `axios`, `zustand`, `@tanstack/react-query`, `swiper`, `react-hot-toast`, `lucide-react`, `clsx`
- Folder structure created: `app/`, `components/{layout,product,cart,checkout,ui}`, `store/`, `hooks/`, `lib/`, `types/`
- `src/types/index.ts` — All TypeScript types: Product, Category, User, Order, Cart, Wishlist, API responses, filters
- `.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:5000`

### ✅ Tests Passed
- Server TypeScript: `pnpm exec tsc --noEmit` → **0 errors**
- Client TypeScript: `pnpm exec tsc --noEmit` → **0 errors**
- Server startup: `ts-node src/index.ts` → Started successfully
- Health check: `GET http://localhost:5000/health` → `{"status":"ok","app":"EasyShop API",...}` ✅

### ✅ Git Commit
```
[main (root-commit) 757f93e] Phase 0 complete: Monorepo scaffold, Express server, Next.js 14 client, Prisma schema
32 files changed, 13457 insertions(+)
```

---

## ⚠️ PENDING ACTION REQUIRED

### You must set up Neon before Phase 1 can run:

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Create a new project (choose a region close to you)
3. Copy the **Connection String** (it looks like: `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`)
4. Open `server/.env` and replace the `DATABASE_URL` placeholder with your actual connection string

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| DB hosting | Neon (serverless PostgreSQL) | No Docker needed, free tier, easy setup |
| Package manager | pnpm | Faster, disk-efficient, best monorepo support |
| Naming | "EasyShop" everywhere | User preference (no "Flipkart" name anywhere) |
| No Docker Compose | Skipped | User opted for Neon instead |

---

## EasyShop Color Palette (from Flipkart design study)

| Name | Hex |
|---|---|
| Primary Blue | `#2874f0` |
| Yellow Accent | `#FFE500` |
| Green (Discount) | `#388e3c` |
| Orange (Offers) | `#ff6161` |
| Background | `#f1f3f6` |
| Card Background | `#ffffff` |
| Header text | `#ffffff` |
| Body text | `#212121` |
| Secondary text | `#878787` |

---

## How to Run (Once Neon is configured)

```bash
# Install all dependencies (from root)
pnpm install

# Run backend only
pnpm dev:server     # http://localhost:5000
# Test: curl http://localhost:5000/health

# Run frontend only
pnpm dev:client     # http://localhost:3000

# Run both
pnpm dev

# Prisma commands (from server/)
cd server
pnpm prisma:migrate    # Run migrations
pnpm prisma:seed       # Seed data (Phase 1)
pnpm prisma:studio     # DB GUI at http://localhost:5555
```

---

## Phase 1 Preview (What comes next)

When the user says "start Phase 1", do the following:
1. Create `server/prisma/seed.ts` with 10 categories + 80 products
2. Run `pnpm prisma migrate dev --name init` against Neon
3. Create `server/src/routes/product.routes.ts` + `category.routes.ts`
4. Create `server/src/controllers/product.controller.ts` + `category.controller.ts`
5. Create `server/src/services/product.service.ts` + `category.service.ts`
6. Create Zod schemas in `server/src/schemas/`
7. Wire up routes in `server/src/index.ts`
8. Test with curl: GET /api/v1/products, GET /api/v1/categories, GET /api/v1/products?category=mobiles, GET /api/v1/products?q=samsung

---

*Last updated: Phase 0 complete — 2026-05-21*
