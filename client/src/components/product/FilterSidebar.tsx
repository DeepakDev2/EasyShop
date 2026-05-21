'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'
import { ProductFilters } from '@/types'

interface Props { filters: ProductFilters; onFilterChange: (f: Partial<ProductFilters>) => void }

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
]

const RATINGS = [4, 3, 2]

export default function FilterSidebar({ filters, onFilterChange }: Props) {
  const { data: categories = [] } = useCategories()

  const clearAll = () => onFilterChange({ category: undefined, minPrice: undefined, maxPrice: undefined, rating: undefined, sort: undefined, brand: undefined, q: undefined, page: 1 })

  return (
    <aside className="card p-4 space-y-5 sticky top-32 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        <button onClick={clearAll} className="text-xs text-[#2874f0] hover:underline font-medium">Clear All</button>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
        <div className="space-y-1.5">
          {categories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.slug}
                onChange={() => onFilterChange({ category: cat.slug, page: 1 })}
                className="accent-[#2874f0]"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#2874f0] transition-colors">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Min" min={0}
            value={filters.minPrice ?? ''}
            onChange={e => onFilterChange({ minPrice: e.target.value ? +e.target.value : undefined, page: 1 })}
            className="input-base w-1/2 text-xs"
          />
          <input
            type="number" placeholder="Max" min={0}
            value={filters.maxPrice ?? ''}
            onChange={e => onFilterChange({ maxPrice: e.target.value ? +e.target.value : undefined, page: 1 })}
            className="input-base w-1/2 text-xs"
          />
        </div>
      </div>

      {/* Customer Rating */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Customer Rating</h4>
        <div className="space-y-1.5">
          {RATINGS.map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio" name="rating"
                checked={filters.rating === r}
                onChange={() => onFilterChange({ rating: r, page: 1 })}
                className="accent-[#2874f0]"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#2874f0]">{r}★ & above</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sort By</h4>
        <div className="space-y-1.5">
          {SORT_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio" name="sort"
                checked={filters.sort === opt.value}
                onChange={() => onFilterChange({ sort: opt.value as ProductFilters['sort'], page: 1 })}
                className="accent-[#2874f0]"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#2874f0]">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
