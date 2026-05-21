import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { setToken, clearToken } from '@/lib/token'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
}

async function getGuestCart() {
  const { useCartStore } = await import('@/store/cartStore')
  return useCartStore.getState().items.map(i => ({ productId: i.product.id, quantity: i.qty }))
}

async function reloadCartFromServer() {
  const { useCartStore } = await import('@/store/cartStore')
  await useCartStore.getState().loadFromServer()
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', {
          email,
          password,
          guestCart: await getGuestCart(),
        })
        const { user, token } = res.data
        setToken(token)
        set({ user, token, isLoggedIn: true })
        await reloadCartFromServer()
      },

      register: async (name, email, password, phone) => {
        const res = await api.post('/auth/register', {
          name,
          email,
          password,
          phone,
          guestCart: await getGuestCart(),
        })
        const { user, token } = res.data
        setToken(token)
        set({ user, token, isLoggedIn: true })
        await reloadCartFromServer()
      },

      logout: () => {
        clearToken()
        set({ user: null, token: null, isLoggedIn: false })
      },
    }),
    {
      name: 'easyshop-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isLoggedIn: s.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setToken(state.token)
      },
    }
  )
)
