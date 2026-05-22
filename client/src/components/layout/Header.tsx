'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, ShoppingCart, User, ChevronDown, LogOut, X, Menu } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export default function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const itemCount = useCartStore(s => s.itemCount())
  const { user, isLoggedIn, logout } = useAuthStore()

  // Prevent hydration mismatch — only show client-dependent UI after mount
  useEffect(() => { setMounted(true) }, [])

  // Focus mobile search input when shown
  useEffect(() => {
    if (showMobileSearch) mobileInputRef.current?.focus()
  }, [showMobileSearch])

  // Close account menu on outside click or Escape
  useEffect(() => {
    if (!accountOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [accountOpen])


  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setShowMobileSearch(false)
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`)
    else router.push('/')
  }, [query, router])

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5dc9 100%)' }}>

      {/* ── Main row ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-4">

        {/* Logo — always visible */}
        <Link href="/" className="flex flex-col leading-none shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="text-white font-bold text-lg sm:text-xl tracking-tight">EasyShop</span>
          <span className="text-[#FFE500] text-[10px] sm:text-xs italic font-medium hidden sm:block">
            Explore <span className="text-white">Plus</span> ✦
          </span>
        </Link>

        {/* Desktop search bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-2xl">
          <div className="flex items-center bg-white rounded-sm overflow-hidden shadow-sm w-full">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none placeholder-gray-400"
            />
            <button type="submit" className="px-4 py-2 text-[#2874f0] hover:bg-blue-50 transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Mobile: search toggle + spacer */}
        <div className="flex-1 sm:hidden" />

        {/* Mobile: search icon button */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="sm:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Open search"
        >
          <Search size={22} />
        </button>

        {/* Cart — always visible */}
        <Link href="/cart" className="relative text-white p-2 hover:bg-white/10 rounded transition-colors" aria-label="Cart">
          <ShoppingCart size={22} />
          {mounted && itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#ff6161] text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-white text-sm font-medium">
          {mounted && isLoggedIn && user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(v => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors py-1 px-1 rounded hover:bg-white/10"
              >
                <User size={16} />
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown size={12} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute top-full right-0 pt-1 w-48 z-[60]"
                >
                  <div className="bg-white rounded shadow-lg text-gray-700 text-sm border border-gray-100 overflow-hidden">
                    <Link
                      href="/orders"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50"
                    >
                      📦 My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      role="menuitem"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50"
                    >
                      ❤️ Wishlist
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { logout(); setAccountOpen(false); router.push('/') }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-gray-50 text-red-500 border-t border-gray-100"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
              <User size={16} /> Login
            </Link>
          )}
        </nav>

        {/* Mobile: hamburger (shows account links) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden text-white p-2 hover:bg-white/10 rounded transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile search overlay ── */}
      {showMobileSearch && (
        <div className="sm:hidden absolute inset-0 bg-[#2874f0] z-10 flex items-center px-3 h-14">
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white rounded-sm overflow-hidden">
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, brands…"
              className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none"
            />
            <button type="submit" className="px-3 py-2 text-[#2874f0]"><Search size={18} /></button>
          </form>
          <button onClick={() => setShowMobileSearch(false)} className="text-white ml-2 p-1">
            <X size={22} />
          </button>
        </div>
      )}

      {/* ── Mobile dropdown menu ── */}
      {mounted && menuOpen && (
        <div className="md:hidden bg-white border-t border-blue-200 shadow-lg">
          {isLoggedIn && user ? (
            <>
              <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
                <User size={16} className="text-[#2874f0]" />
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
              </div>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                📦 My Orders
              </Link>
              <Link href="/wishlist" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                ❤️ Wishlist
              </Link>
              <button onClick={() => { logout(); router.push('/'); setMenuOpen(false) }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 w-full">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div className="px-4 py-4 flex gap-3">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center btn-secondary py-2.5 rounded-sm text-sm">Login</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center btn-outline py-2.5 text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
