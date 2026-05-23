'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import Header from '@/components/layout/Header'
import CartItemCard from '@/components/cart/CartItem'
import PriceSummary from '@/components/cart/PriceSummary'
import { useCartStore } from '@/store/cartStore'

import { Suspense } from 'react'

function CartPageContent() {
  const { items } = useCartStore()

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">
          My Cart {items.length > 0 && <span className="text-base font-normal text-gray-500">({items.length} item{items.length > 1 ? 's' : ''})</span>}
        </h1>

        {items.length === 0 ? (
          /* Empty State */
          <div className="card flex flex-col items-center justify-center py-20 gap-4">
            <ShoppingCart size={64} className="text-gray-200" />
            <h2 className="text-xl font-semibold text-gray-600">Your cart is empty!</h2>
            <p className="text-sm text-gray-400">Add items to it now</p>
            <Link href="/" className="btn-secondary mt-2 px-8 py-2.5 rounded-sm inline-block">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 items-start">
            {/* Cart Items */}
            <div className="flex-1 space-y-3">
              {items.map(entry => (
                <CartItemCard key={entry.product.id} entry={entry} />
              ))}

              {/* Continue shopping */}
              <div className="card p-4 flex justify-end">
                <Link href="/" className="btn-secondary px-12 py-3 rounded-sm inline-block">
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Price Summary */}
            <div className="w-80 shrink-0 hidden md:block">
              <PriceSummary />
            </div>
          </div>
        )}

        {/* Mobile price summary */}
        {items.length > 0 && (
          <div className="md:hidden mt-4">
            <PriceSummary />
          </div>
        )}
      </main>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6]" />}>
      <CartPageContent />
    </Suspense>
  )
}
