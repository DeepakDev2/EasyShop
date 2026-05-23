'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import api from '@/lib/api'
import { setToken } from '@/lib/token'
import NavigationProgress from '@/components/layout/NavigationProgress'

function AuthValidator() {
  const { isLoggedIn, token, logout } = useAuthStore()
  const loadFromServer = useCartStore(s => s.loadFromServer)
  const loadWishlist = useWishlistStore(s => s.load)

  useEffect(() => {
    if (!isLoggedIn || !token) return
    setToken(token)
    api.get('/auth/me')
      .then(() => {
        loadFromServer()
        loadWishlist()
      })
      .catch(() => logout())
  }, [isLoggedIn, token, logout, loadFromServer, loadWishlist])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProgress />
      <AuthValidator />
      {children}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </QueryClientProvider>
  )
}
