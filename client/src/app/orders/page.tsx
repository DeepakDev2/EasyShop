'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useAuthStore } from '@/store/authStore'
import { formatPrice, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { Package } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('easyshop_token'))
    if (!isLoggedIn && !hasToken) {
      router.push('/auth/login?redirect=%2Forders')
      return
    }
    if (!isLoggedIn) return
    api.get('/orders/my').then(r => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [isLoggedIn, router])
  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">My Orders</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="card h-32 skeleton" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="card flex flex-col items-center py-20 gap-3">
            <Package size={48} className="text-gray-200" />
            <p className="text-lg font-semibold text-gray-600">No orders yet</p>
            <Link href="/" className="btn-secondary px-8 py-2.5 rounded-sm inline-block mt-2">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block card p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.placedAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.orderItems?.slice(0, 2).map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 bg-gray-50 rounded shrink-0">
                        {item.productImg
                          ? <Image src={item.productImg} alt={item.productName} fill className="object-contain p-1" />
                          : <Package size={24} className="text-gray-300 m-auto" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(Number(item.unitPrice))}</p>
                      </div>
                    </div>
                  ))}
                  {order.orderItems?.length > 2 && (
                    <p className="text-xs text-gray-400">+{order.orderItems.length - 2} more item(s)</p>
                  )}
                </div>

                <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">Total: {formatPrice(Number(order.total))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
