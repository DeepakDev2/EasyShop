'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import confetti from 'canvas-confetti'

function SuccessContent() {
  const params = useSearchParams()
  const orderNumber = params.get('order')
  const total = params.get('total')
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  useEffect(() => {
    const fire = (opts: confetti.Options) => confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, ...opts })
    setTimeout(() => {
      fire({ colors: ['#2874f0', '#FFE500', '#fb641b', '#388e3c'] })
      setTimeout(() => fire({ angle: 60, origin: { x: 0 } }), 200)
      setTimeout(() => fire({ angle: 120, origin: { x: 1 } }), 400)
    }, 300)
  }, [])

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center px-4">
      <div className="card p-10 max-w-lg w-full text-center space-y-5">
        {/* Animated checkmark */}
        <div className="w-20 h-20 rounded-full bg-[#388e3c]/10 flex items-center justify-center mx-auto animate-bounce-once">
          <svg viewBox="0 0 52 52" className="w-14 h-14">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#388e3c" strokeWidth="2" />
            <path fill="none" stroke="#388e3c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h1>
          <p className="text-gray-500 mt-1 text-sm">Sit back & relax while we process your order</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-left">
          {orderNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-semibold text-gray-800">#{orderNumber}</span>
            </div>
          )}
          {total && (
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-semibold text-gray-800">₹{Number(total).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Est. Delivery</span>
            <span className="font-semibold text-[#388e3c]">{deliveryDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment</span>
            <span className="font-semibold text-[#ff9f00]">Cash on Delivery</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center pt-1">
          <Link href="/orders" className="btn-secondary px-7 py-2.5 rounded-sm inline-block">My Orders</Link>
          <Link href="/" className="btn-outline px-7 py-2.5 inline-block">Shop More</Link>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center"><p>Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  )
}
