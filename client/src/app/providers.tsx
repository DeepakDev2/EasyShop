'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

function AuthValidator() {
  const { isLoggedIn, token, logout } = useAuthStore()
  useEffect(() => {
    if (!isLoggedIn || !token) return
    // Validate token against server on every app load
    api.get('/auth/me').catch(() => {
      logout() // token is invalid/expired — clear client state
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      <AuthValidator />
      {children}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </QueryClientProvider>
  )
}
