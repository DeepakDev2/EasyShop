'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Product, ProductFilters, PaginatedResponse } from '@/types'

export const useProducts = (filters: ProductFilters) =>
  useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== null)
      )
      const res = await api.get('/products', { params })
      const { products, total, page, limit, totalPages } = res.data
      return { data: products, total, page, limit, totalPages }
    },
    placeholderData: (prev) => prev,
  })

export const useProduct = (slug: string) =>
  useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/products/${slug}`)
      return res.data.data
    },
    enabled: !!slug,
  })
