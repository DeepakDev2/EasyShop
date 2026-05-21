'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

const NAV = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/?categories=true', icon: Grid, label: 'Categories' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/auth/login', icon: User, label: 'Account' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const itemCount = useCartStore(s => s.itemCount())
  const isAuth = pathname.startsWith('/auth')
  if (isAuth) return null

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0])
          const isCart = href === '/cart'
          return (
            <Link key={label} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                active ? 'text-[#2874f0]' : 'text-gray-400'
              }`}>
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#fb641b] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className={active ? 'font-semibold' : ''}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
