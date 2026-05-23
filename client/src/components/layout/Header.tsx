'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, ShoppingCart, User, ChevronDown, LogOut, X, Menu, Heart, Package } from 'lucide-react'
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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/80 shadow-sm transition-all duration-300">

      {/* ── Main row ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0 group" onClick={() => setMenuOpen(false)}>
          <div className="flex flex-col leading-none">
            <span className="text-[#2874f0] font-extrabold text-2xl tracking-tight transition-transform group-hover:scale-[1.02] duration-200">
              EasyShop
            </span>
            <span className="text-xs font-semibold italic bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent mt-0.5">
              Explore Plus ✦
            </span>
          </div>
        </Link>

        {/* Premium Pill-Shaped Desktop Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="flex items-center bg-gray-100/80 border border-gray-200 hover:border-gray-300 focus-within:border-[#2874f0] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 rounded-full overflow-hidden w-full transition-all duration-200 px-3.5 py-1.5">
            <Search size={16} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for products, brands, and categories..."
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none placeholder-gray-400"
            />
            {query.trim() && (
              <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 mr-1.5" aria-label="Clear query">
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Action icons & Account details */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Mobile search toggle */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Open search"
          >
            <Search size={20} />
          </button>

          {/* Cart Icon Button */}
          <Link href="/cart" className="relative text-gray-600 p-2.5 hover:bg-gray-100 rounded-full transition-all flex items-center justify-center" aria-label="Cart">
            <ShoppingCart size={20} />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#ff6161] text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5 shadow-sm border border-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-3">
            {mounted && isLoggedIn && user ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen(v => !v)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-1.5 hover:bg-gray-100 text-gray-700 font-semibold text-sm px-3.5 py-2 rounded-full border border-gray-200 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] uppercase font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${accountOpen ? 'rotate-180 text-[#2874f0]' : ''}`} />
                </button>
                
                {accountOpen && (
                  <div role="menu" className="absolute top-full right-0 pt-2 w-52 z-[60] animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-xl text-gray-700 text-sm border border-gray-100 overflow-hidden py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Logged in as</p>
                        <p className="font-bold text-gray-800 truncate text-xs">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                      >
                        <Package size={15} className="text-gray-400" /> My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                      >
                        <Heart size={15} className="text-gray-400" /> My Wishlist
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { logout(); setAccountOpen(false); router.push('/') }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-500 transition-colors border-t border-gray-100 font-semibold"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-1.5 hover:bg-blue-50 text-[#2874f0] border border-blue-200 font-bold text-sm px-5 py-1.5 rounded-full transition-colors">
                <User size={15} /> Login
              </Link>
            )}
          </nav>

          {/* Mobile Hamburguer Toggle */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Search Overlay (smooth slide down) ── */}
      {showMobileSearch && (
        <div className="sm:hidden absolute inset-x-0 top-0 bg-white border-b border-gray-200 z-10 flex items-center px-4 h-16 animate-fadeIn">
          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-gray-100 border border-gray-200 rounded-full overflow-hidden px-3.5 py-1.5">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              ref={mobileInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="flex-1 text-sm text-gray-800 bg-transparent outline-none"
            />
            {query.trim() && (
              <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </form>
          <button onClick={() => setShowMobileSearch(false)} className="text-gray-500 font-semibold text-sm ml-3.5 hover:text-gray-800 transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* ── Mobile menu drawer ── */}
      {mounted && menuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 shadow-xl py-2 animate-fadeIn absolute w-full left-0 z-40">
          {isLoggedIn && user ? (
            <>
              <div className="px-5 py-3 bg-blue-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2874f0] text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-semibold">Welcome back,</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                </div>
              </div>
              <Link href="/orders" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                📂 My Orders
              </Link>
              <Link href="/wishlist" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                ❤️ My Wishlist
              </Link>
              <button onClick={() => { logout(); router.push('/'); setMenuOpen(false) }}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-red-500 hover:bg-red-50 w-full transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <div className="px-5 py-4 flex flex-col gap-2.5">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="w-full text-center text-white bg-[#2874f0] py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                className="w-full text-center text-[#2874f0] border border-blue-200 py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
