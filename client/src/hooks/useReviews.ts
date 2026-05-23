'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { ReviewsResponse, CanReviewResponse, Review } from '@/types'
import { useAuthStore } from '@/store/authStore'

export const useProductReviews = (productId: number, page = 1, limit = 10) =>
  useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId, page],
    queryFn: async () => {
      const res = await api.get(`/reviews/product/${productId}`, { params: { page, limit } })
      return res.data.data
    },
    enabled: productId > 0,
  })

export const useCanReview = (productId: number) => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  return useQuery<CanReviewResponse>({
    queryKey: ['can-review', productId],
    queryFn: async () => {
      const res = await api.get(`/reviews/can-review/${productId}`)
      return res.data.data
    },
    enabled: isLoggedIn && productId > 0,
  })
}

export const useSubmitReview = (productId: number) => {
  const qc = useQueryClient()
  return useMutation<Review, Error, { rating: number; title?: string; body: string }>({
    mutationFn: async (input) => {
      const res = await api.post('/reviews', { productId, ...input })
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] })
      qc.invalidateQueries({ queryKey: ['can-review', productId] })
      qc.invalidateQueries({ queryKey: ['product'] })
    },
  })
}

export const useDeleteReview = (productId: number) => {
  const qc = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async (reviewId) => {
      await api.delete(`/reviews/${reviewId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] })
      qc.invalidateQueries({ queryKey: ['can-review', productId] })
      qc.invalidateQueries({ queryKey: ['product'] })
    },
  })
}
