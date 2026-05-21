import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { useAuthStore } from './authStore'

interface WishlistStore {
  ids: number[]
  load: () => Promise<void>
  toggle: (productId: number) => Promise<boolean>
  isWished: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      load: async () => {
        if (!useAuthStore.getState().isLoggedIn) return
        try {
          const res = await api.get('/wishlist')
          set({ ids: res.data.data.map((p: { id: number }) => p.id) })
        } catch { /* silently fail */ }
      },

      toggle: async (productId: number) => {
        if (!useAuthStore.getState().isLoggedIn) return false
        try {
          const res = await api.post(`/wishlist/${productId}`)
          const { added } = res.data
          set(state => ({
            ids: added ? [...state.ids, productId] : state.ids.filter(id => id !== productId),
          }))
          return added
        } catch { return false }
      },

      isWished: (productId: number) => get().ids.includes(productId),
    }),
    { name: 'easyshop-wishlist' }
  )
)
