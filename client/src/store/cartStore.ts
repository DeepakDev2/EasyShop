import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Product } from '@/types'

export interface CartProduct {
  id: number
  name: string
  slug: string
  price: number
  originalPrice: number | null
  discountPct: number
  brand: string | null
  stock: number
  image: string
}

export interface CartEntry {
  cartItemId?: number
  product: CartProduct
  qty: number
}

interface CartStore {
  items: CartEntry[]
  addItem: (product: Product, qty?: number) => Promise<void>
  updateQty: (productId: number, qty: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  clearCart: () => Promise<void>
  loadFromServer: () => Promise<void>
  itemCount: () => number
  subtotal: () => number
  discount: () => number
  total: () => number
}

const toCartProduct = (p: Product): CartProduct => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  price: Number(p.price),
  originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
  discountPct: p.discountPct,
  brand: p.brand,
  stock: p.stock,
  image: p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url ?? '',
})

const fromServerItem = (row: {
  id: number
  quantity: number
  product: {
    id: number
    name: string
    slug: string
    price: unknown
    originalPrice: unknown
    stock: number
    brand: string | null
    images: { url: string; isPrimary: boolean }[]
  }
}): CartEntry => {
  const p = row.product
  const price = Number(p.price)
  const originalPrice = p.originalPrice != null ? Number(p.originalPrice) : null
  const discountPct = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0
  return {
    cartItemId: row.id,
    qty: row.quantity,
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price,
      originalPrice,
      discountPct,
      brand: p.brand,
      stock: p.stock,
      image: p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url ?? '',
    },
  }
}

const isLoggedIn = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('easyshop-auth') ?? '{}')
    return Boolean(auth?.state?.isLoggedIn && auth?.state?.token)
  } catch {
    return false
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      loadFromServer: async () => {
        if (!isLoggedIn()) return
        try {
          const res = await api.get('/cart')
          set({ items: res.data.data.map(fromServerItem) })
        } catch {
          /* keep local cart on failure */
        }
      },

      addItem: async (product, qty = 1) => {
        const previousItems = get().items

        // 1. Optimistic update
        set(state => {
          const existing = state.items.find(i => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, qty: Math.min(product.stock, i.qty + qty) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product: toCartProduct(product), qty }] }
        })

        // 2. Background sync
        if (isLoggedIn()) {
          try {
            const res = await api.post('/cart', { productId: product.id, quantity: qty })
            const serverItem = res.data.data
            if (serverItem?.id) {
              set(state => ({
                items: state.items.map(i =>
                  i.product.id === product.id ? { ...i, cartItemId: serverItem.id } : i
                ),
              }))
            }
          } catch {
            // Rollback on failure
            set({ items: previousItems })
          }
        }
      },

      updateQty: async (productId, qty) => {
        if (qty < 1) { await get().removeItem(productId); return }
        const entry = get().items.find(i => i.product.id === productId)
        if (!entry) return

        const previousQty = entry.qty

        // 1. Optimistic update
        set(state => ({
          items: state.items.map(i => i.product.id === productId ? { ...i, qty } : i),
        }))

        // 2. Background sync
        if (isLoggedIn() && entry.cartItemId) {
          try {
            await api.put(`/cart/${entry.cartItemId}`, { quantity: qty })
          } catch {
            // Rollback on failure
            set(state => ({
              items: state.items.map(i => i.product.id === productId ? { ...i, qty: previousQty } : i),
            }))
            await get().loadFromServer()
          }
        }
      },

      removeItem: async (productId) => {
        const entry = get().items.find(i => i.product.id === productId)
        if (!entry) return

        const previousItems = get().items

        // 1. Optimistic update
        set(state => ({ items: state.items.filter(i => i.product.id !== productId) }))

        // 2. Background sync
        if (isLoggedIn() && entry.cartItemId) {
          try {
            await api.delete(`/cart/${entry.cartItemId}`)
          } catch {
            // Rollback on failure
            set({ items: previousItems })
            await get().loadFromServer()
          }
        }
      },

      clearCart: async () => {
        if (isLoggedIn()) {
          try { await api.delete('/cart') } catch { /* ignore */ }
        }
        set({ items: [] })
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + (i.product.originalPrice ?? i.product.price) * i.qty, 0),

      discount: () => {
        const s = get()
        return s.subtotal() - s.total()
      },

      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    }),
    { name: 'easyshop-cart' }
  )
)
