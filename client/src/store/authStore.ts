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

const setTokenCookie = (token: string) => {
  document.cookie = `easyshop_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
}

const clearTokenCookie = () => {
  document.cookie = 'easyshop_token=; path=/; max-age=0; SameSite=Lax'
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
        setTokenCookie(token)
        set({ user, token, isLoggedIn: true })
      },

      register: async (name, email, password, phone) => {
        const res = await api.post('/auth/register', { name, email, password, phone })
        const { user, token } = res.data
        localStorage.setItem('easyshop_token', token)
        setTokenCookie(token)
        set({ user, token, isLoggedIn: true })
      },

      logout: () => {
        localStorage.removeItem('easyshop_token')
        clearTokenCookie()
        set({ user: null, token: null, isLoggedIn: false })
      },
    }),
    { name: 'easyshop-auth', partialize: (s) => ({ user: s.user, token: s.token, isLoggedIn: s.isLoggedIn }) }
  )
)
