# Flipkart Clone — E-Commerce Platform Implementation Plan

> A comprehensive, phase-by-phase blueprint for building a full-stack e-commerce application replicating Flipkart's design and functionality using Next.js, Node.js/Express, and PostgreSQL.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Database Schema Design](#database-schema-design)
4. [API Design](#api-design)
5. [Phase 0 — Project Setup & Scaffolding](#phase-0--project-setup--scaffolding)
6. [Phase 1 — Core Backend: Products & Categories](#phase-1--core-backend-products--categories)
7. [Phase 2 — Frontend Foundation & Product Listing](#phase-2--frontend-foundation--product-listing)
8. [Phase 3 — Product Detail Page](#phase-3--product-detail-page)
9. [Phase 4 — Shopping Cart](#phase-4--shopping-cart)
10. [Phase 5 — Checkout & Order Placement](#phase-5--checkout--order-placement)
11. [Phase 6 — User Authentication](#phase-6--user-authentication)
12. [Phase 7 — Good-to-Have Features](#phase-7--good-to-have-features)
13. [Phase 8 — Responsive Design & Polish](#phase-8--responsive-design--polish)
14. [Phase 9 — Testing & QA](#phase-9--testing--qa)
15. [Phase 10 — Deployment](#phase-10--deployment)
16. [Folder Structure](#folder-structure)
17. [Environment Variables Reference](#environment-variables-reference)
18. [Seed Data Strategy](#seed-data-strategy)
19. [Timeline Estimate](#timeline-estimate)

---

## Project Overview

Build a pixel-accurate Flipkart clone with:
- **Product browsing** with grid layout, search, and category filters
- **Product detail pages** with image carousel, specs, and stock status
- **Cart management** with quantity controls and price summary
- **Order placement** with address form, order review, and confirmation
- **User authentication** (login/signup) — good to have
- **Order history, Wishlist, Email notifications** — good to have

---

## Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client Layer                     │
│          Next.js 14 (App Router, SPA Mode)           │
│    Tailwind CSS · shadcn/ui · Zustand · React Query  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST
┌──────────────────────▼──────────────────────────────┐
│                    API Layer                          │
│            Node.js + Express.js REST API             │
│        JWT Auth · Multer (images) · Nodemailer        │
└──────────────────────┬──────────────────────────────┘
                       │ SQL via pg / Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│                  Database Layer                       │
│                   PostgreSQL 15                       │
│               (hosted on Supabase / Neon)            │
└─────────────────────────────────────────────────────┘
```

### Key Libraries

| Layer | Package | Purpose |
|---|---|---|
| Frontend | `next` 14 | React framework, App Router |
| Frontend | `tailwindcss` | Utility-first CSS |
| Frontend | `zustand` | Client-side cart/auth state |
| Frontend | `@tanstack/react-query` | Server data fetching/caching |
| Frontend | `swiper` | Image carousel |
| Frontend | `axios` | HTTP client |
| Frontend | `react-hot-toast` | Notifications |
| Backend | `express` | HTTP server |
| Backend | `pg` + `prisma` | PostgreSQL ORM |
| Backend | `bcryptjs` | Password hashing |
| Backend | `jsonwebtoken` | JWT tokens |
| Backend | `nodemailer` | Email notifications |
| Backend | `multer` | File uploads |
| Backend | `cors`, `helmet` | Security middleware |
| Backend | `zod` | Request validation |

---

## Database Schema Design

```sql
-- USERS
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  phone       VARCHAR(20),
  role        VARCHAR(20) DEFAULT 'customer',   -- customer | admin
  created_at  TIMESTAMP DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) UNIQUE NOT NULL,
  icon_url    TEXT,
  parent_id   INT REFERENCES categories(id)     -- for sub-categories
);

-- PRODUCTS
CREATE TABLE products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(300) UNIQUE NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2),               -- for showing strikethrough
  discount_pct    INT GENERATED ALWAYS AS
                    (CASE WHEN original_price > 0
                     THEN ROUND(((original_price - price)/original_price)*100)
                     ELSE 0 END) STORED,
  stock           INT DEFAULT 0,
  rating          NUMERIC(2,1) DEFAULT 0,
  rating_count    INT DEFAULT 0,
  brand           VARCHAR(100),
  category_id     INT REFERENCES categories(id),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  is_primary  BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0
);

-- PRODUCT SPECIFICATIONS
CREATE TABLE product_specs (
  id          SERIAL PRIMARY KEY,
  product_id  INT REFERENCES products(id) ON DELETE CASCADE,
  spec_key    VARCHAR(100) NOT NULL,
  spec_value  TEXT NOT NULL,
  display_order INT DEFAULT 0
);

-- ADDRESSES
CREATE TABLE addresses (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  full_name   VARCHAR(100) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10) NOT NULL,
  is_default  BOOLEAN DEFAULT FALSE
);

-- CART
CREATE TABLE cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  session_id  VARCHAR(100),                    -- for guest cart
  product_id  INT REFERENCES products(id),
  quantity    INT NOT NULL DEFAULT 1,
  added_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, product_id),
  UNIQUE (session_id, product_id)
);

-- ORDERS
CREATE TABLE orders (
  id              SERIAL PRIMARY KEY,
  order_number    VARCHAR(20) UNIQUE NOT NULL,  -- e.g. OD-20240521-0001
  user_id         INT REFERENCES users(id),
  address_id      INT REFERENCES addresses(id),
  status          VARCHAR(30) DEFAULT 'pending', -- pending|confirmed|shipped|delivered|cancelled
  subtotal        NUMERIC(10,2) NOT NULL,
  discount        NUMERIC(10,2) DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  payment_method  VARCHAR(30) DEFAULT 'cod',
  payment_status  VARCHAR(20) DEFAULT 'unpaid',
  placed_at       TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INT REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,          -- snapshot at time of order
  product_img  TEXT,
  quantity    INT NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- WISHLIST
CREATE TABLE wishlist_items (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  product_id  INT REFERENCES products(id),
  added_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

-- INDEXES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_orders_user ON orders(user_id);
```

---

## API Design

### Base URL: `/api/v1`

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Get logged-in user profile |
| POST | `/auth/logout` | Invalidate token (client-side) |

#### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List products (paginated, filterable) |
| GET | `/products/:slug` | Get product detail with images & specs |
| GET | `/products/search?q=` | Full-text search |
| POST | `/products` | Create product (admin) |
| PUT | `/products/:id` | Update product (admin) |
| DELETE | `/products/:id` | Delete product (admin) |

Query params for GET `/products`:
- `category` — category slug
- `q` — search query
- `minPrice`, `maxPrice`
- `brand`
- `rating`
- `sort` — price_asc | price_desc | rating | newest
- `page`, `limit`

#### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/categories` | List all categories |
| GET | `/categories/:slug/products` | Products by category |

#### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get cart items |
| POST | `/cart` | Add item to cart |
| PUT | `/cart/:itemId` | Update quantity |
| DELETE | `/cart/:itemId` | Remove item |
| DELETE | `/cart` | Clear entire cart |

#### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place order |
| GET | `/orders` | Get user's order history |
| GET | `/orders/:orderNumber` | Get order detail |
| PUT | `/orders/:id/cancel` | Cancel order |

#### Addresses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/addresses` | List saved addresses |
| POST | `/addresses` | Add new address |
| PUT | `/addresses/:id` | Update address |
| DELETE | `/addresses/:id` | Delete address |

#### Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlist` | Get wishlist |
| POST | `/wishlist` | Add to wishlist |
| DELETE | `/wishlist/:productId` | Remove from wishlist |

---

## Phase 0 — Project Setup & Scaffolding

**Goal:** Working monorepo with both frontend and backend running locally.

### Step 0.1 — Repository Structure

```
flipkart-clone/
├── client/          # Next.js frontend
├── server/          # Express backend
├── .env.example
├── README.md
└── docker-compose.yml
```

### Step 0.2 — Initialize Backend

```bash
mkdir server && cd server
npm init -y
npm install express pg prisma @prisma/client bcryptjs jsonwebtoken \
  cors helmet morgan dotenv zod multer nodemailer uuid
npm install -D typescript ts-node nodemon @types/express @types/node \
  @types/bcryptjs @types/jsonwebtoken @types/cors @types/multer
npx tsc --init
npx prisma init
```

Backend folder structure:
```
server/
├── src/
│   ├── config/         # db.ts, env.ts
│   ├── middleware/      # auth.ts, errorHandler.ts, validate.ts
│   ├── routes/          # auth, products, categories, cart, orders, ...
│   ├── controllers/     # one per resource
│   ├── services/        # business logic layer
│   ├── schemas/         # Zod validation schemas
│   ├── utils/           # email.ts, orderNumber.ts, upload.ts
│   └── index.ts         # Express app entry point
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env
└── package.json
```

### Step 0.3 — Initialize Frontend

```bash
npx create-next-app@latest client --typescript --tailwind --app --src-dir --import-alias "@/*"
cd client
npm install axios zustand @tanstack/react-query swiper \
  react-hot-toast lucide-react clsx
npm install -D @types/node
```

Frontend folder structure:
```
client/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Home / Product Listing
│   │   ├── product/[slug]/   # Product Detail
│   │   ├── cart/             # Shopping Cart
│   │   ├── checkout/         # Checkout
│   │   ├── order-success/    # Order Confirmation
│   │   ├── orders/           # Order History
│   │   ├── wishlist/         # Wishlist
│   │   └── auth/             # Login / Signup
│   ├── components/
│   │   ├── layout/           # Header, Footer, Navbar
│   │   ├── product/          # ProductCard, ProductGrid, Filters
│   │   ├── cart/             # CartItem, CartSummary
│   │   ├── checkout/         # AddressForm, OrderSummary
│   │   └── ui/               # Button, Badge, Skeleton, etc.
│   ├── store/                # Zustand stores
│   │   ├── cartStore.ts
│   │   ├── authStore.ts
│   │   └── wishlistStore.ts
│   ├── hooks/                # useProducts, useCart, useAuth
│   ├── lib/                  # api.ts (axios instance), utils.ts
│   └── types/                # index.ts (all TypeScript types)
└── package.json
```

### Step 0.4 — Docker Compose (Local PostgreSQL)

```yaml
# docker-compose.yml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: flipkart
      POSTGRES_PASSWORD: flipkart123
      POSTGRES_DB: flipkartdb
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
```

Start with: `docker-compose up -d`

---

## Phase 1 — Core Backend: Products & Categories

**Goal:** Working REST API for products and categories with real PostgreSQL data.

### Step 1.1 — Prisma Schema

Convert the SQL schema above into `prisma/schema.prisma`. Key models: `User`, `Category`, `Product`, `ProductImage`, `ProductSpec`, `CartItem`, `Order`, `OrderItem`, `Address`, `WishlistItem`.

Set up relations carefully:
- `Product` → `Category` (many-to-one)
- `Product` → `ProductImage[]` (one-to-many)
- `Product` → `ProductSpec[]` (one-to-many)

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 1.2 — Seed Data

Create `prisma/seed.ts` to populate:
- 8–10 categories (Electronics, Mobiles, Fashion, Home, Appliances, Books, Sports, Toys, Beauty, Grocery)
- 50–100 products spread across categories
- 3–5 images per product (use Unsplash URLs or placeholder image service)
- 5–8 specs per product

Run: `npx ts-node prisma/seed.ts`

### Step 1.3 — Product Controller & Routes

**GET /api/v1/products**
- Accept query params: `category`, `q`, `minPrice`, `maxPrice`, `brand`, `sort`, `page`, `limit`
- Build dynamic Prisma query using `where` clause
- For text search use Prisma's `contains` or raw SQL full-text search
- Return: `{ products, total, page, totalPages }`

**GET /api/v1/products/:slug**
- Fetch product with `include: { images: true, specs: true, category: true }`
- Return full product object

**GET /api/v1/categories**
- Return flat list of all categories with `product_count`

### Step 1.4 — Middleware Setup

```typescript
// src/index.ts
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use(errorHandler)  // global error handler
```

Error handler middleware: catches all thrown errors, returns `{ error: message, code }` JSON.

### Step 1.5 — Test with Postman/Thunder Client

Verify:
- `GET /api/v1/products` returns paginated list
- `GET /api/v1/products?category=mobiles` filters correctly
- `GET /api/v1/products?q=samsung` returns search results
- `GET /api/v1/products/samsung-galaxy-s24` returns full detail

---

## Phase 2 — Frontend Foundation & Product Listing

**Goal:** Flipkart-style homepage with product grid, search bar, category nav, and filters.

### Step 2.1 — Axios API Client

```typescript
// src/lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  withCredentials: true,
})
// Request interceptor: attach JWT from localStorage
// Response interceptor: handle 401 globally
```

### Step 2.2 — TypeScript Types

```typescript
// src/types/index.ts
export type Category = { id: number; name: string; slug: string; icon_url: string }
export type Product = {
  id: number; name: string; slug: string; price: number;
  original_price: number; discount_pct: number; rating: number;
  rating_count: number; stock: number; brand: string;
  category: Category; images: ProductImage[]; specs: ProductSpec[]
}
export type CartItem = { id: number; product: Product; quantity: number }
export type Order = { id: number; order_number: string; status: string; total: number; items: OrderItem[]; placed_at: string }
```

### Step 2.3 — Header Component

Replicate Flipkart's blue header (`#2874f0`):
- **Logo**: "Flipkart" text with yellow italic "Plus" badge
- **Search bar**: Full-width center, magnifying glass icon button
- **Nav links**: Login, Cart (with item count badge), More
- Sticky on scroll

### Step 2.4 — Category Navigation Bar

Horizontal scrollable strip below header:
- Icons + labels for each category
- Active state highlighting
- On click: filters product grid

### Step 2.5 — Product Card Component

Replicate Flipkart's product card exactly:
```
┌─────────────────────┐
│   [Product Image]   │
│                     │
│ Product Name (2-line│
│ truncation)         │
│ ★★★★☆ (1,234)      │
│ ₹12,999             │
│ ₹24,999  47% off    │
└─────────────────────┘
```
- Hover: slight elevation shadow
- Wishlist heart icon (top right on hover)
- Discount badge (green pill)

### Step 2.6 — Product Grid & Listing Page

`/` (Home page):
- Hero banner carousel (promotional banners — static images)
- Category shortcut row with icons
- "Top Deals" section — horizontal scroll
- Main product grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`

Left sidebar (desktop):
- Category filter (checkbox list)
- Price range slider
- Brand filter (checkboxes)
- Customer Rating filter (radio)
- "Clear Filters" link

Search results page (`/search?q=`):
- Same grid but with result count shown
- Sort dropdown: Relevance / Price: Low to High / Price: High to Low / Newest First / Rating

### Step 2.7 — React Query for Data Fetching

```typescript
// src/hooks/useProducts.ts
export const useProducts = (filters: ProductFilters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then(r => r.data),
    keepPreviousData: true,  // smooth pagination
  })
```

Add loading skeletons matching Flipkart's card shape using `animate-pulse`.

### Step 2.8 — Pagination

Bottom of the listing page:
- Page number buttons (Flipkart-style)
- "Previous" / "Next" arrows
- Show "Showing 1–40 of 320 results"

---

## Phase 3 — Product Detail Page

**Goal:** Full product detail page at `/product/[slug]`.

### Step 3.1 — Image Carousel

Use `Swiper.js`:
- Main large image display
- Thumbnail strip below (5–6 thumbnails)
- Click thumbnail → switches main image
- Zoom on hover (CSS transform scale)
- Left/right arrows

### Step 3.2 — Product Info Panel

Right column layout:
```
Brand Name (linked to brand search)
Product Title (H1)
★★★★☆  4.2  (1,234 ratings & 892 reviews)

─────────────────────────────
Special Price
₹12,999  ₹24,999   47% off
─────────────────────────────

Available Offers:
• 10% off on SBI Cards
• Extra ₹500 off on Exchange
• No Cost EMI from ₹1,083/mo

Quantity: [−] [2] [+]

[ADD TO CART]   [BUY NOW]
─────────────────────────────
Delivery: Check pincode [input]
Seller: RetailNet (4.5★)
```

### Step 3.3 — Product Specifications Table

Expandable section below fold:
- Key-value table matching Flipkart's striped rows
- "Read More" button expands full description

### Step 3.4 — Stock Status

- In Stock (green) / Only 3 left (orange) / Out of Stock (red, buttons disabled)
- If out of stock, show "Notify Me" button

### Step 3.5 — Related Products

Horizontal scroll strip:
- "Similar Products" section
- Fetched from `GET /products?category=<same>&limit=10`

---

## Phase 4 — Shopping Cart

**Goal:** Full cart page at `/cart` with item management and price summary.

### Step 4.1 — Cart State with Zustand

```typescript
// src/store/cartStore.ts
interface CartStore {
  items: CartItem[]
  addItem: (product: Product, qty?: number) => void
  updateQty: (itemId: number, qty: number) => void
  removeItem: (itemId: number) => void
  clearCart: () => void
  total: number         // computed
  itemCount: number     // computed
}
```

Strategy: Use Zustand for optimistic UI, sync with backend via React Query mutations. For guests: persist to `localStorage`. For logged-in users: sync to backend.

### Step 4.2 — Cart API Integration

```typescript
// POST /api/v1/cart      — add/update item (upsert)
// PUT  /api/v1/cart/:id  — update quantity
// DELETE /api/v1/cart/:id — remove
```

Backend cart routes check for JWT. If present, use `user_id`. If absent, use `session_id` cookie.

### Step 4.3 — Cart Page Layout

Left (65%): Cart Items List
```
┌────────────────────────────────────────────┐
│ [img] Product Name                         │
│       Brand | Seller: RetailNet            │
│       ₹12,999                              │
│       [−][2][+]   [REMOVE] [SAVE FOR LATER]│
└────────────────────────────────────────────┘
```

Right (35%): Price Details box
```
┌─────────────────────┐
│ PRICE DETAILS       │
│ Price (3 items) ₹X  │
│ Discount        -₹Y │
│ Delivery charges  ₹Z│
│─────────────────────│
│ Total Amount    ₹W  │
│                     │
│  [PLACE ORDER →]    │
└─────────────────────┘
```

### Step 4.4 — Cart Item Controls

- Quantity selector: `−` button (disable at 1), number display, `+` button (cap at stock)
- Remove: triggers DELETE API + removes from Zustand
- Empty cart state: show illustration + "Cart is empty" + "Shop Now" button

---

## Phase 5 — Checkout & Order Placement

**Goal:** Multi-step checkout: Address → Summary → Confirmation.

### Step 5.1 — Checkout Page Layout

Replicate Flipkart's step indicator:
```
① CART → ② ADDRESS → ③ ORDER SUMMARY → ④ PAYMENT
```

**Step 1 — Address Form** (`/checkout/address`):

Fields:
- Full Name, Phone Number, Pincode (auto-fill city/state via pincode API)
- Address Line 1, Address Line 2 (optional), City, State
- Address Type: Home / Work (radio)
- "SAVE AND DELIVER HERE" button

Validation (Zod on frontend + backend):
- Name: required, min 2 chars
- Phone: 10-digit Indian number
- Pincode: 6-digit
- All required fields checked before submit

If logged in: show saved addresses first, option to add new.

### Step 5.2 — Order Summary Step

Display:
- Each cart item (image, name, qty, price)
- Price breakdown (same as cart summary)
- Selected delivery address (edit link)
- Payment method: Cash on Delivery (default), UPI (placeholder)

"CONFIRM ORDER" button → calls `POST /api/v1/orders`

### Step 5.3 — Backend Order Placement

`POST /api/v1/orders` logic:
1. Validate request body (address_id, payment_method)
2. Fetch cart items for user/session
3. Re-validate stock availability for each item
4. Calculate totals server-side (never trust client totals)
5. Begin DB transaction:
   - Insert `orders` row with generated `order_number` (format: `OD{timestamp}{4-digit-random}`)
   - Insert `order_items` rows (snapshot product name/price/image)
   - Decrement `products.stock` for each item
   - Clear cart items
6. Commit transaction
7. Trigger email notification (async, don't block response)
8. Return `{ order_number, total, placed_at }`

### Step 5.4 — Order Confirmation Page

Route: `/order-success?order=OD20240521001`

Display:
```
✓  Order Placed Successfully!

Order ID: OD20240521001

Your order will be delivered by
Mon, 27 May

[Continue Shopping]   [View Orders]
```

Confetti animation on load (use `canvas-confetti` library).

---

## Phase 6 — User Authentication

**Goal:** JWT-based login/signup. Cart merges on login.

### Step 6.1 — Backend Auth

**POST /api/v1/auth/register**
- Validate: name, email (unique check), password (min 8 chars)
- Hash password with `bcrypt` (rounds: 12)
- Insert user
- Return JWT (24h expiry) + user object

**POST /api/v1/auth/login**
- Find user by email
- Compare password with `bcrypt.compare`
- Return JWT + user object
- On login: merge guest cart (by `session_id`) into user cart

**JWT Middleware**
```typescript
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Step 6.2 — Frontend Auth Store

```typescript
// src/store/authStore.ts
interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email, password) => Promise<void>
  register: (name, email, password) => Promise<void>
  logout: () => void
}
```

Persist token to `localStorage`. On app load, rehydrate and validate token via `GET /auth/me`.

### Step 6.3 — Auth Pages

`/auth/login`:
- Email + password fields
- "Login" button
- "New to Flipkart? Create an account" link
- Flipkart's blue/white two-panel layout (left: promo text, right: form)

`/auth/signup`:
- Name, email, password, confirm password
- Password strength indicator
- Terms checkbox

### Step 6.4 — Protected Routes

Use Next.js middleware (`middleware.ts`) to redirect unauthenticated users from `/orders`, `/wishlist`, `/checkout` to `/auth/login?redirect=<path>`. After login, redirect back.

---

## Phase 7 — Good-to-Have Features

### Step 7.1 — Order History

`/orders`:
- Table/list of past orders sorted by date
- Columns: Order ID, Date, Items (thumbnail), Total, Status badge (color-coded)
- Click → `/orders/[orderNumber]` detail page

`/orders/[orderNumber]`:
- Full order detail: items, address, payment method, timeline

Backend: `GET /api/v1/orders` returns orders with `order_items` included.

### Step 7.2 — Wishlist

- Heart icon on every product card and detail page
- Toggle: `POST /wishlist` or `DELETE /wishlist/:productId`
- `/wishlist` page: grid of saved products
- "Move to Cart" button on each wishlist item
- For guests: store wishlist in `localStorage`

### Step 7.3 — Email Notifications (Nodemailer)

Send on: order placed, order shipped, order delivered.

Setup:
```typescript
// src/utils/email.ts
const transporter = nodemailer.createTransport({
  service: 'gmail',  // or SendGrid/Resend in production
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

export const sendOrderConfirmation = async (to: string, order: Order) => {
  await transporter.sendMail({
    from: '"Flipkart Clone" <noreply@flipkartclone.com>',
    to,
    subject: `Order Confirmed! ${order.order_number}`,
    html: orderConfirmationTemplate(order)  // HTML email template
  })
}
```

Call asynchronously after order is saved (don't await, use `.catch(console.error)`).

---

## Phase 8 — Responsive Design & Polish

### Step 8.1 — Mobile Layout

Header:
- Collapse nav links into hamburger menu
- Search bar takes full width
- Bottom navigation bar (Home, Categories, Cart, Account)

Product Grid:
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4–5 columns

Cart / Checkout:
- Stack vertically on mobile (summary below items)

### Step 8.2 — Loading States

- Product grid: skeleton cards (pulse animation)
- Product detail: skeleton layout
- Cart: skeleton rows
- Global loading bar (top of page) on route changes — use `nprogress`

### Step 8.3 — Error States

- 404 page with illustration + back-home button
- API error toast notifications (react-hot-toast)
- Empty states for: no search results, empty cart, empty orders, empty wishlist

### Step 8.4 — Performance

- Next.js `Image` component for all product images (automatic WebP + lazy load)
- React Query caching: `staleTime: 5 * 60 * 1000` (5 min)
- Debounce search input (300ms) to reduce API calls
- Infinite scroll or pagination (choose one, implement well)
- Backend: add DB indexes (already in schema above)

---

## Phase 9 — Testing & QA

### Step 9.1 — Backend Testing (Jest + Supertest)

Test files in `server/src/__tests__/`:
- `auth.test.ts` — register, login, invalid credentials
- `products.test.ts` — listing, filtering, search, detail
- `cart.test.ts` — add, update, remove, clear
- `orders.test.ts` — place order, stock decrement, cart clear

### Step 9.2 — Frontend Testing

- Component tests with `@testing-library/react`
- Test: ProductCard renders correctly, CartItem quantity controls, CheckoutForm validation

### Step 9.3 — Manual QA Checklist

- [ ] Browse products by category
- [ ] Search for a product
- [ ] View product detail, check image carousel
- [ ] Add to cart, update quantity, remove item
- [ ] Complete checkout as guest
- [ ] Complete checkout as logged-in user
- [ ] Verify order confirmation page shows correct order ID
- [ ] Check order history shows placed order
- [ ] Add/remove wishlist items
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)

---

## Phase 10 — Deployment

### Step 10.1 — Database

Use **Neon** (free PostgreSQL serverless) or **Supabase**:
1. Create project → get `DATABASE_URL`
2. `npx prisma migrate deploy` on production DB
3. Run seed script once

### Step 10.2 — Backend (Railway / Render)

1. Push `server/` to GitHub
2. Connect to Railway/Render
3. Set environment variables (see reference below)
4. Start command: `node dist/index.js`
5. Build command: `npx tsc`

### Step 10.3 — Frontend (Vercel)

1. Push `client/` to GitHub
2. Import to Vercel
3. Set `NEXT_PUBLIC_API_URL` env var to backend URL
4. Deploy

### Step 10.4 — Environment Variables in Production

- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (256-bit random)
- Configure CORS origin to Vercel domain
- Use SendGrid API key instead of Gmail for emails

---

## Folder Structure

Final complete structure for reference:

```
flipkart-clone/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Product listing / Home
│   │   │   ├── product/[slug]/page.tsx   # Product detail
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── address/page.tsx
│   │   │   │   └── summary/page.tsx
│   │   │   ├── order-success/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [orderNumber]/page.tsx
│   │   │   ├── wishlist/page.tsx
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       └── signup/page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── CategoryNav.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── MobileBottomNav.tsx
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductSkeleton.tsx
│   │   │   │   ├── FilterSidebar.tsx
│   │   │   │   ├── SortDropdown.tsx
│   │   │   │   └── ImageCarousel.tsx
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.tsx
│   │   │   │   └── PriceSummary.tsx
│   │   │   ├── checkout/
│   │   │   │   ├── AddressForm.tsx
│   │   │   │   ├── AddressCard.tsx
│   │   │   │   └── OrderReview.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── StarRating.tsx
│   │   │       ├── QuantitySelector.tsx
│   │   │       └── EmptyState.tsx
│   │   ├── store/
│   │   │   ├── cartStore.ts
│   │   │   ├── authStore.ts
│   │   │   └── wishlistStore.ts
│   │   ├── hooks/
│   │   │   ├── useProducts.ts
│   │   │   ├── useProduct.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useOrders.ts
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts                  # formatPrice, formatDate, etc.
│   │   └── types/index.ts
│   ├── public/
│   │   ├── flipkart-logo.svg
│   │   └── banners/                      # hero banner images
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validate.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── address.routes.ts
│   │   │   └── wishlist.routes.ts
│   │   ├── controllers/           # (mirror routes structure)
│   │   ├── services/              # (business logic)
│   │   ├── schemas/               # Zod schemas per resource
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables Reference

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://flipkart:flipkart123@localhost:5432/flipkartdb

# Auth
JWT_SECRET=your-super-secret-jwt-key-256-bits
JWT_EXPIRES_IN=24h

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Flipkart Clone <noreply@flipkartclone.com>

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Flipkart
```

---

## Seed Data Strategy

For realistic demo data, the seed script should create:

**Categories (10):**
Electronics, Mobiles, Fashion (Men), Fashion (Women), Home & Furniture, Appliances, Books, Sports & Fitness, Toys, Beauty & Personal Care

**Products (80+ total, ~8 per category):**
- Use real-world product names and specs (e.g. "Samsung Galaxy S24 128GB")
- Generate realistic prices with original_price and discount_pct
- Use Unsplash images: `https://images.unsplash.com/photo-{id}?w=400`
- Vary stock levels (some low, some out of stock)
- Vary ratings 3.5–4.8 with realistic rating counts

**Sample Seed Structure:**
```typescript
const categories = [
  { name: 'Mobiles', slug: 'mobiles', icon_url: '...' },
  // ...
]

const products = [
  {
    name: 'Samsung Galaxy S24 128GB Phantom Black',
    slug: 'samsung-galaxy-s24-128gb-phantom-black',
    price: 74999, original_price: 89999,
    stock: 42, rating: 4.4, rating_count: 12847, brand: 'Samsung',
    category_slug: 'mobiles',
    images: ['url1', 'url2', 'url3'],
    specs: [
      { key: 'Display', value: '6.2" Dynamic AMOLED 2X' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
      // ...
    ]
  },
  // ...
]
```

---

## Timeline Estimate

| Phase | Description | Estimated Time |
|---|---|---|
| Phase 0 | Setup & Scaffolding | 1 day |
| Phase 1 | Core Backend: Products & Categories | 2 days |
| Phase 2 | Frontend: Product Listing Page | 3 days |
| Phase 3 | Product Detail Page | 2 days |
| Phase 4 | Shopping Cart | 2 days |
| Phase 5 | Checkout & Order Placement | 3 days |
| Phase 6 | User Authentication | 2 days |
| Phase 7 | Good-to-Have Features | 3 days |
| Phase 8 | Responsive Design & Polish | 2 days |
| Phase 9 | Testing & QA | 2 days |
| Phase 10 | Deployment | 1 day |
| **Total** | | **~23 days** |

> For a focused developer: Phases 0–5 (core MVP) can be completed in ~2 weeks. Phases 6–10 add another 1–1.5 weeks for a fully polished product.

---

## Key Implementation Notes

1. **Cart merge on login**: When a guest logs in, merge their `session_id` cart into their `user_id` cart. Handle conflicts by taking max quantity.

2. **Server-side price calculation**: Always recalculate order totals on the server from current DB prices. Never trust the client's total.

3. **Stock race conditions**: Use a DB transaction with `SELECT ... FOR UPDATE` when decrementing stock during order placement to prevent overselling.

4. **Image optimization**: Use Next.js `<Image>` with `domains` configured for Unsplash. Serve images through a CDN in production.

5. **Session ID for guests**: Generate a UUID and store in an HttpOnly cookie. This persists the guest cart across page refreshes.

6. **Order number format**: `OD` + `YYYYMMDD` + 4-digit sequence (e.g. `OD202405210042`). Use a DB sequence or UUID-based approach to avoid collisions.

7. **Flipkart color palette**:
   - Primary Blue: `#2874f0`
   - Yellow accent: `#FFE500`
   - Green (discount): `#388e3c`
   - Orange (offers): `#ff6161`
   - Background: `#f1f3f6`
   - Card background: `#ffffff`
