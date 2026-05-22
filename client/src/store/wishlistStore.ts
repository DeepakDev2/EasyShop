import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

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
        const isLoggedIn = useAuthStore.getState().isLoggedIn
        const already = get().ids.includes(productId)

        // Guest wishlist — just store locally
        if (!isLoggedIn) {
          set(state => ({
            ids: already ? state.ids.filter(id => id !== productId) : [...state.ids, productId],
          }))
          return !already
        }

        // Logged in — optimistic update, revert on error
        set(state => ({
          ids: already ? state.ids.filter(id => id !== productId) : [...state.ids, productId],
        }))

        try {
          const res = await api.post(`/wishlist/${productId}`)
          const { added } = res.data
          // Reconcile with server truth
          set(state => ({
            ids: added
              ? Array.from(new Set([...state.ids, productId]))
              : state.ids.filter(id => id !== productId),
          }))
          return added
        } catch {
          // Revert optimistic update
          set(state => ({
            ids: already ? [...state.ids, productId] : state.ids.filter(id => id !== productId),
          }))
          toast.error('Could not update wishlist')
          return already
        }
      },

      isWished: (productId: number) => get().ids.includes(productId),
    }),
    { name: 'easyshop-wishlist' }
  )
)
