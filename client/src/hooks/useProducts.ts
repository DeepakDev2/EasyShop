'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Product, ProductFilters, PaginatedResponse } from '@/types'

const filterSnapshot = (f: ProductFilters) =>
  JSON.stringify({
    category: f.category,
    q: f.q,
    minPrice: f.minPrice,
    maxPrice: f.maxPrice,
    brand: f.brand,
    rating: f.rating,
    sort: f.sort,
    page: f.page,
    limit: f.limit,
  })

export const useProducts = (filters: ProductFilters) =>
  useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', filterSnapshot(filters)],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== null)
      )
      const res = await api.get('/products', { params })
      const { products, total, page, limit, totalPages } = res.data
      return { data: products, total, page, limit, totalPages }
    },
    placeholderData: (prev, prevQuery) => {
      if (!prev || !prevQuery) return undefined
      const prevKey = prevQuery.queryKey[1] as string | undefined
      const prevFilters = prevKey ? (JSON.parse(prevKey) as ProductFilters) : null
      if (!prevFilters) return undefined
      const sameListing =
        prevFilters.category === filters.category &&
        prevFilters.q === filters.q &&
        prevFilters.minPrice === filters.minPrice &&
        prevFilters.maxPrice === filters.maxPrice &&
        prevFilters.brand === filters.brand &&
        prevFilters.rating === filters.rating &&
        prevFilters.sort === filters.sort
      return sameListing ? prev : undefined
    },
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
