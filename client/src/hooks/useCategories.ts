'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Category } from '@/types'

export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data.data
    },
  })
