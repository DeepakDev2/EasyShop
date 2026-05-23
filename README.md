# EasyShop 🛍️

A full-stack e-commerce platform built with Next.js, Express.js, and PostgreSQL (Neon).

## Screenshots

<div align="center">
  <!-- TODO: Replace the 'src' links below with your actual screenshot URLs -->
  <img src="https://drive.google.com/file/d/1o0sLCe36golKgKiAi8UL0lN3_e0W2I7X/view" alt="Home Page" width="800" />
  <p><i>Home Page</i></p>
</div>

<br />

<div align="center">
  <!-- TODO: Replace the 'src' links below with your actual screenshot URLs -->
  <img src="https://via.placeholder.com/400x300?text=Product+Details" alt="Product Page" width="395" />
  <img src="https://via.placeholder.com/400x300?text=Shopping+Cart" alt="Cart Page" width="395" />
</div>

<br />
## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TailwindCSS, Zustand, React Query |
| Backend | Node.js, Express.js, Prisma ORM |
| Database | PostgreSQL 15 (Neon serverless) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Package Manager | pnpm (monorepo workspaces) |

## Project Structure

```
easyshop/
├── client/          # Next.js 14 frontend
├── server/          # Express.js REST API backend
├── .env.example     # Environment variable template
├── pnpm-workspace.yaml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- Neon PostgreSQL account (https://neon.tech)

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd easyshop
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example server/.env
   cp .env.example client/.env.local
   # Edit both files with your actual values
   ```

3. **Set up the database**
   ```bash
   cd server
   pnpm prisma migrate dev --name init
   pnpm prisma db seed
   ```

4. **Run the development servers**
   ```bash
   # From root — runs both client and server in parallel
   pnpm dev

   # Or individually:
   pnpm dev:server   # http://localhost:5000
   pnpm dev:client   # http://localhost:3000
   ```

## API Base URL

`http://localhost:5000/api/v1`

## Color Palette

| Name | Hex |
|---|---|
| Primary Blue | `#2874f0` |
| Yellow Accent | `#FFE500` |
| Green (Discount) | `#388e3c` |
| Orange (Offers) | `#ff6161` |
| Background | `#f1f3f6` |
| Card BG | `#ffffff` |

