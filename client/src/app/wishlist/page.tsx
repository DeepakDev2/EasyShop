'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { Product } from '@/types'

export default function WishlistPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const { toggle } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('easyshop_token'))
    if (!isLoggedIn && !hasToken) {
      router.push('/auth/login?redirect=%2Fwishlist')
      return
    }
    if (!isLoggedIn) return
    api.get('/wishlist').then(r => setProducts(r.data.data)).finally(() => setLoading(false))
  }, [isLoggedIn, router])

  const remove = async (product: Product) => {
    await toggle(product.id)
    setProducts(prev => prev.filter(p => p.id !== product.id))
    toast('Removed from Wishlist', { icon: '🤍' })
  }

  const moveToCart = (product: Product) => {
    addItem(product)
    remove(product)
    toast.success('Moved to Cart 🛒')
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Heart size={22} className="text-red-500 fill-red-500" /> My Wishlist
          {products.length > 0 && <span className="text-base font-normal text-gray-500">({products.length} item{products.length > 1 ? 's' : ''})</span>}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="card h-64 skeleton" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="card flex flex-col items-center py-20 gap-3">
            <Heart size={56} className="text-gray-200" />
            <p className="text-lg font-semibold text-gray-600">Your wishlist is empty</p>
            <p className="text-sm text-gray-400">Save items you love by clicking the ❤ button</p>
            <Link href="/" className="btn-secondary px-8 py-2.5 rounded-sm inline-block mt-2">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => {
              const img = product.images?.find(i => i.isPrimary)?.url ?? product.images?.[0]?.url ?? ''
              return (
                <div key={product.id} className="card overflow-hidden group">
                  <div className="relative aspect-square bg-gray-50">
                    <Link href={`/product/${product.slug}`}>
                      <Image src={img} alt={product.name} fill className="object-cover p-2 group-hover:scale-105 transition-transform duration-300" />
                    </Link>
                    <button onClick={() => remove(product)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white shadow-sm text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-3">
                    <Link href={`/product/${product.slug}`}>
                      <p className="text-sm text-gray-800 font-medium line-clamp-2 mb-1">{product.name}</p>
                    </Link>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.discountPct > 0 && (
                        <span className="text-xs text-[#388e3c] font-semibold">{product.discountPct}% off</span>
                      )}
                    </div>
                    <button onClick={() => moveToCart(product)} disabled={product.stock === 0}
                      className="btn-primary w-full py-2 rounded-sm text-sm disabled:opacity-50">
                      {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
