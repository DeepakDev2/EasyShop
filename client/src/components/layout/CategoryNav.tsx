'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'

export default function CategoryNav() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category') || ''
  const { data: categories = [] } = useCategories()

  const handleClick = (slug: string) => {
    if (slug === activeCategory) router.push('/')
    else router.push(`/?category=${slug}`)
  }

  return (
    <div className="bg-white shadow-sm sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-2">
          <button
            onClick={() => router.push('/')}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded min-w-fit transition-colors ${
              !activeCategory ? 'text-[#2874f0] border-b-2 border-[#2874f0]' : 'text-gray-600 hover:text-[#2874f0]'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-medium whitespace-nowrap">All</span>
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat.slug)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded min-w-fit transition-colors ${
                activeCategory === cat.slug
                  ? 'text-[#2874f0] border-b-2 border-[#2874f0]'
                  : 'text-gray-600 hover:text-[#2874f0]'
              }`}
            >
              <span className="text-xl">{cat.iconUrl || '📦'}</span>
              <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
