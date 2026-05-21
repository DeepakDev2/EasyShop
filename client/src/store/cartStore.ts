import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  product: CartProduct
  qty: number
}

interface CartStore {
  items: CartEntry[]
  addItem: (product: Product, qty?: number) => void
  updateQty: (productId: number, qty: number) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
  discount: () => number
  total: () => number
}

const toCartProduct = (p: Product): CartProduct => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  price: p.price,
  originalPrice: p.originalPrice,
  discountPct: p.discountPct,
  brand: p.brand,
  stock: p.stock,
  image: p.images.find(i => i.isPrimary)?.url ?? p.images[0]?.url ?? '',
})

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
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
      },

      updateQty: (productId, qty) => {
        if (qty < 1) { get().removeItem(productId); return }
        set(state => ({
          items: state.items.map(i => i.product.id === productId ? { ...i, qty } : i),
        }))
      },

      removeItem: (productId) => {
        set(state => ({ items: state.items.filter(i => i.product.id !== productId) }))
      },

      clearCart: () => set({ items: [] }),

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
