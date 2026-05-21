import axios from 'axios'
import { getToken } from '@/lib/token'

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const getAuthToken = (): string | null => {
  const direct = getToken()
  if (direct) return direct
  try {
    const raw = localStorage.getItem('easyshop-auth')
    if (!raw) return null
    return JSON.parse(raw)?.state?.token ?? null
  } catch {
    return null
  }
}

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global 401 handler — clear all auth state
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      import('@/store/authStore').then(({ useAuthStore }) => useAuthStore.getState().logout())
    }
    return Promise.reject(err)
  }
)

export default api
