import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password })
        const { user, token } = res.data
        localStorage.setItem('easyshop_token', token)
        set({ user, token, isLoggedIn: true })
      },

      register: async (name, email, password, phone) => {
        const res = await api.post('/auth/register', { name, email, password, phone })
        const { user, token } = res.data
        localStorage.setItem('easyshop_token', token)
        set({ user, token, isLoggedIn: true })
      },

      logout: () => {
        localStorage.removeItem('easyshop_token')
        set({ user: null, token: null, isLoggedIn: false })
      },
    }),
    { name: 'easyshop-auth', partialize: (s) => ({ user: s.user, token: s.token, isLoggedIn: s.isLoggedIn }) }
  )
)
