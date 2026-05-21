import { ProductFilters } from '@/types'

export function parseProductFilters(searchParams: URLSearchParams): ProductFilters {
  const sort = searchParams.get('sort')
  const validSort = ['price_asc', 'price_desc', 'rating', 'newest'].includes(sort ?? '')
    ? (sort as ProductFilters['sort'])
    : undefined

  return {
    category: searchParams.get('category') || undefined,
    q: searchParams.get('q') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    brand: searchParams.get('brand') || undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    sort: validSort,
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: 20,
  }
}

/** Build homepage URL from a complete filter state */
export function buildProductSearchUrl(filters: ProductFilters): string {
  const params = new URLSearchParams()

  if (filters.category) params.set('category', filters.category)
  if (filters.q) params.set('q', filters.q)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.rating != null) params.set('rating', String(filters.rating))
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.page && filters.page > 1) params.set('page', String(filters.page))

  const qs = params.toString()
  return qs ? `/?${qs}` : '/'
}
