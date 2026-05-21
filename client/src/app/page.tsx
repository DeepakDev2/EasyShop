'use client'
import { useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import CategoryNav from '@/components/layout/CategoryNav'
import Footer from '@/components/layout/Footer'
import HeroBanner from '@/components/layout/HeroBanner'
import ProductCard from '@/components/product/ProductCard'
import ProductSkeleton from '@/components/product/ProductSkeleton'
import FilterSidebar from '@/components/product/FilterSidebar'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ProductFilters } from '@/types'
import { parseProductFilters, buildProductSearchUrl } from '@/lib/filters'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, TrendingUp } from 'lucide-react'
import { useState } from 'react'

function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  const filters = useMemo(
    () => parseProductFilters(searchParams),
    [searchParams]
  )

  const updateFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      const current = parseProductFilters(searchParams)
      const next: ProductFilters = { ...current, ...updates, limit: 20 }
      router.push(buildProductSearchUrl(next))
    },
    [searchParams, router]
  )

  const { data: categories = [] } = useCategories()
  const activeCategory = categories.find(c => c.slug === filters.category)

  const isBrowseHome = !filters.category && !filters.q
  const pageTitle = filters.q
    ? `Results for "${filters.q}"`
    : activeCategory
      ? activeCategory.name
      : 'All Products'

  const { data, isLoading, isFetching } = useProducts(filters)
  const products = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const page = filters.page ?? 1

  const { data: dealsData } = useProducts({ sort: 'price_asc', limit: 8, page: 1 })
  const deals = dealsData?.data ?? []

  const activeFiltersCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.brand,
    filters.sort,
  ].filter(Boolean).length

  const showLoadingGrid = isLoading || (isFetching && products.length === 0)

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <CategoryNav />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {isBrowseHome && <HeroBanner />}

        {isBrowseHome && deals.length > 0 && (
          <div className="card p-4 mb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <TrendingUp size={18} className="text-[#fb641b]" /> Top Deals
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {deals.map(p => (
                <div key={p.id} className="shrink-0 w-36">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listing header — changes per category / search */}
        <div className="card px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {filters.q ? 'Search' : filters.category ? 'Category' : 'Shop'}
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              {activeCategory && (
                <span className="text-2xl" aria-hidden>{activeCategory.iconUrl || '📦'}</span>
              )}
              {pageTitle}
            </h1>
            {!showLoadingGrid && (
              <p className="text-sm text-gray-500 mt-0.5">
                <strong className="text-gray-800">{total}</strong> products
                {filters.category && activeCategory ? ` in ${activeCategory.name}` : ''}
              </p>
            )}
          </div>
          {(filters.category || filters.q) && (
            <button
              type="button"
              onClick={() => updateFilters({
                category: undefined,
                q: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                rating: undefined,
                brand: undefined,
                sort: undefined,
                page: 1,
              })}
              className="text-sm text-[#2874f0] font-semibold hover:underline self-start sm:self-center"
            >
              ← Back to all products
            </button>
          )}
        </div>

        <div className="md:hidden mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-[#2874f0] border border-[#2874f0] px-3 py-1.5 rounded"
          >
            <SlidersHorizontal size={16} />
            Filters {activeFiltersCount > 0 && (
              <span className="bg-[#2874f0] text-white text-xs rounded-full px-1.5">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        <div className="flex gap-4">
          <div className="hidden md:block w-64 shrink-0">
            <FilterSidebar filters={filters} onFilterChange={updateFilters} />
          </div>

          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-white overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-gray-800">Filters</h2>
                  <button onClick={() => setShowFilters(false)}><X size={20} /></button>
                </div>
                <FilterSidebar
                  filters={filters}
                  onFilterChange={(f) => { updateFilters(f); setShowFilters(false) }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="card px-4 py-2 mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {showLoadingGrid ? (
                  <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>Showing page <strong>{page}</strong> of <strong>{totalPages}</strong></>
                )}
              </p>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-gray-500">Sort by:</span>
                <select
                  value={filters.sort || ''}
                  onChange={e => updateFilters({
                    sort: (e.target.value as ProductFilters['sort']) || undefined,
                    page: 1,
                  })}
                  className="text-sm border-0 outline-none text-[#2874f0] font-medium cursor-pointer bg-transparent"
                >
                  <option value="">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {showLoadingGrid ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-20 gap-3">
                <span className="text-5xl">{filters.category ? '📦' : '🔍'}</span>
                <p className="text-lg font-semibold text-gray-700">No products found</p>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {filters.category
                    ? `Nothing listed in ${activeCategory?.name ?? 'this category'} yet. Try another category or clear filters.`
                    : 'Try adjusting your filters or search term'}
                </p>
                <button
                  onClick={() => updateFilters({
                    category: undefined,
                    q: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    rating: undefined,
                    brand: undefined,
                    sort: undefined,
                    page: 1,
                  })}
                  className="btn-outline mt-2"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                key={`${filters.category ?? 'all'}-${filters.q ?? ''}-${page}`}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              >
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {totalPages > 1 && !showLoadingGrid && (
              <div className="flex items-center justify-center gap-1 mt-6">
                <button
                  onClick={() => updateFilters({ page: page - 1 })}
                  disabled={page === 1}
                  className="p-2 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => updateFilters({ page: p })}
                    className={`w-9 h-9 rounded text-sm font-medium transition-colors ${
                      page === p ? 'bg-[#2874f0] text-white' : 'hover:bg-white text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => updateFilters({ page: page + 1 })}
                  disabled={page === totalPages}
                  className="p-2 rounded hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6]" />}>
      <HomePage />
    </Suspense>
  )
}
