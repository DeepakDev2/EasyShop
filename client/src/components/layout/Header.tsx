'use client'
import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const itemCount = useCartStore(s => s.itemCount())

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`)
    else router.push('/')
  }, [query, router])

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5dc9 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none min-w-fit">
          <span className="text-white font-bold text-xl tracking-tight">EasyShop</span>
          <span className="text-[#FFE500] text-xs italic font-medium">
            Explore <span className="text-white">Plus</span> ✦
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="flex items-center bg-white rounded-sm overflow-hidden shadow-sm">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="px-4 py-2 text-[#2874f0] hover:bg-blue-50 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
          <Link href="/auth/login" className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
            <User size={16} /> Login
          </Link>
          <Link href="/cart" className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors relative">
            <ShoppingCart size={16} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2.5 -right-3 bg-[#ff6161] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <button className="flex items-center gap-1 hover:text-yellow-300 transition-colors">
            More <ChevronDown size={14} />
          </button>
        </nav>
      </div>
    </header>
  )
}
