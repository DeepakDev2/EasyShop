'use client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShoppingCart, Zap, Star, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus, Heart, ThumbsUp, Trash2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import ImageCarousel from '@/components/product/ImageCarousel'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'
import SpecsTable from '@/components/product/SpecsTable'
import ProductCard from '@/components/product/ProductCard'
import { useProduct } from '@/hooks/useProducts'
import { useProductReviews, useCanReview, useSubmitReview, useDeleteReview } from '@/hooks/useReviews'
import { formatPrice } from '@/lib/utils'
import { lookupPincode } from '@/lib/pincode'

function RatingStar({ rating }: { rating: number }) {
  const color = rating >= 4 ? 'bg-[#388e3c]' : rating >= 3 ? 'bg-[#ff9f00]' : 'bg-[#ff6161]'
  return (
    <span className={`inline-flex items-center gap-1 text-white text-sm font-semibold px-2 py-0.5 rounded ${color}`}>
      {rating} <Star size={12} fill="white" />
    </span>
  )
}

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="skeleton aspect-square rounded" />
        <div className="space-y-4">
          {[80, 60, 40, 30, 50, 40].map((w, i) => (
            <div key={i} className={`skeleton h-5 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { data: product, isLoading, isError } = useProduct(slug)
  const [qty, setQty] = useState(1)
  const [pincode, setPincode] = useState('')
  const [pincodeCity, setPincodeCity] = useState<string | null>(null)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewPage, setReviewPage] = useState(1)

  const addItem = useCartStore(s => s.addItem)
  const { toggle, isWished } = useWishlistStore()
  const { isLoggedIn } = useAuthStore()

  // Reviews — must be called before any early returns (Rules of Hooks)
  const productId = product?.id ?? 0
  const { data: reviewsData } = useProductReviews(productId, reviewPage)
  const { data: canReviewData } = useCanReview(productId)
  const submitReview = useSubmitReview(productId)
  const deleteReview = useDeleteReview(productId)

  if (isLoading) return <><Header /><Skeleton /></>
  if (isError || !product) return (
    <><Header />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Product not found</h1>
        <Link href="/" className="btn-outline mt-4 inline-block">Back to Home</Link>
      </div>
    </>
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related: any[] = (product as any).related ?? []

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewRating === 0) { toast.error('Please select a star rating'); return }
    try {
      const existing = canReviewData?.existingReview
      await submitReview.mutateAsync({ rating: reviewRating, title: reviewTitle || undefined, body: reviewBody })
      toast.success(existing ? 'Review updated!' : 'Review submitted!')
      setReviewRating(0); setReviewTitle(''); setReviewBody('')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Could not submit review'
      toast.error(msg)
    }
  }

  const offers = [
    { icon: '🏦', text: '10% off on SBI Cards, up to ₹1,500' },
    { icon: '🔄', text: 'Extra ₹500 off on Exchange' },
    { icon: '📱', text: 'No Cost EMI from ₹' + Math.round(product.price / 12).toLocaleString('en-IN') + '/mo' },
  ]

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-[#2874f0]">Home</Link>
        <ChevronRight size={12} />
        {product.category && (
          <><Link href={`/?category=${product.category.slug}`} className="hover:text-[#2874f0]">{product.category.name}</Link>
          <ChevronRight size={12} /></>
        )}
        <span className="text-gray-700 truncate max-w-xs">{product.name}</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Main product section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded shadow-sm overflow-hidden">
          {/* Left — Image Carousel */}
          <div className="p-6 border-r border-gray-100">
            <ImageCarousel images={product.images} />

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={() => { addItem(product, qty); toast.success('Added to cart!', { icon: '🛒' }); }}
                    className="flex-1 flex items-center justify-center gap-2 btn-primary"
                  >
                    <ShoppingCart size={18} /> ADD TO CART
                  </button>
                  <button
                    onClick={() => { addItem(product, qty); router.push('/cart') }}
                    className="flex-1 flex items-center justify-center gap-2 btn-secondary"
                  >
                    <Zap size={18} /> BUY NOW
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toast('We\'ll notify you when this is back in stock! 🔔', { icon: '🔔', duration: 4000 })}
                  className="flex-1 flex items-center justify-center gap-2 btn-outline py-3"
                >
                  🔔 Notify Me When Available
                </button>
              )}
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="p-6 space-y-4">
            {/* Brand + Title */}
            {product.brand && (
              <Link href={`/?brand=${product.brand}`} className="text-sm text-[#2874f0] hover:underline font-medium">
                {product.brand}
              </Link>
            )}
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-medium text-gray-900 leading-snug flex-1">{product.name}</h1>
              <button
                onClick={async () => {
                  const added = await toggle(product.id)
                  toast(added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist', { icon: added ? '❤️' : '🤍' })
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Add to wishlist">
                <Heart size={22} className={isWished(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>
            </div>

            {/* Rating */}
            {product.ratingCount > 0 && (
              <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                <RatingStar rating={product.rating} />
                <span className="text-sm text-gray-500">
                  {product.ratingCount.toLocaleString('en-IN')} ratings
                </span>
              </div>
            )}

            {/* Price */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Special Price</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="text-base font-semibold text-[#388e3c]">{product.discountPct}% off</span>
                  </>
                )}
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-sm text-[#ff6161] mt-1 font-medium">Only {product.stock} left!</p>
              )}
              {product.stock === 0 && (
                <p className="text-sm text-red-600 mt-1 font-semibold">Out of Stock</p>
              )}
            </div>

            {/* Offers */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800 mb-2">Available Offers</p>
              <ul className="space-y-1.5">
                {offers.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span>{o.icon}</span>
                    <span>{o.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold border-x border-gray-300">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1 hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery check */}
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Delivery</p>
              <div className="flex gap-2 items-center">
                <input
                  type="text" maxLength={6} placeholder="Enter Pincode"
                  value={pincode} onChange={e => { setPincode(e.target.value.replace(/\D/, '')); setPincodeCity(null) }}
                  className="input-base w-36 text-sm"
                />
                <button
                  disabled={pincode.length !== 6 || pincodeLoading}
                  onClick={async () => {
                    setPincodeLoading(true)
                    setPincodeCity(null)
                    try {
                      const result = await lookupPincode(pincode)
                      setPincodeCity(`${result.city}, ${result.state}`)
                    } catch {
                      toast.error('Pincode not found')
                    } finally {
                      setPincodeLoading(false)
                    }
                  }}
                  className="text-[#2874f0] text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {pincodeLoading
                    ? <span className="w-3.5 h-3.5 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin inline-block" />
                    : 'Check'}
                </button>
              </div>
              {pincodeCity
                ? <p className="text-xs text-[#388e3c] mt-1.5 font-medium">
                    <Truck size={11} className="inline mr-1" />
                    Delivery available to {pincodeCity} · Usually 3–5 days
                  </p>
                : <p className="text-xs text-gray-500 mt-1.5">
                    <Truck size={11} className="inline mr-1" />
                    Usually delivered in 3–5 days
                  </p>
              }
            </div>

            {/* Guarantees */}
            <div className="flex gap-6 text-xs text-gray-600">
              <div className="flex flex-col items-center gap-1">
                <Shield size={20} className="text-[#2874f0]" />
                <span className="text-center">1 Year<br/>Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={20} className="text-[#2874f0]" />
                <span className="text-center">7 Day<br/>Return</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck size={20} className="text-[#2874f0]" />
                <span className="text-center">Free<br/>Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="card p-4 mt-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {product.specs?.length > 0 && (
          <div className="mt-3">
            <SpecsTable specs={product.specs} />
          </div>
        )}

        {/* ── Reviews & Ratings ───────────────────────────────────────────── */}
        <div className="mt-3 card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ratings &amp; Reviews</h2>

          {/* Rating summary */}
          {reviewsData && reviewsData.total > 0 && (
            <div className="flex gap-8 mb-6 pb-6 border-b border-gray-100">
              {/* Big score */}
              <div className="flex flex-col items-center justify-center min-w-[90px]">
                <span className="text-5xl font-bold text-gray-900">{product.rating.toFixed(1)}</span>
                <div className="flex mt-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(product.rating) ? 'fill-[#388e3c] text-[#388e3c]' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-xs text-gray-400 mt-1">{product.ratingCount.toLocaleString('en-IN')} ratings</span>
              </div>

              {/* Bar breakdown */}
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(star => {
                  const count = reviewsData.ratingBreakdown[star] ?? 0
                  const pct = reviewsData.total > 0 ? Math.round((count / reviewsData.total) * 100) : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-3 text-right">{star}</span>
                      <Star size={10} className="fill-[#388e3c] text-[#388e3c]" />
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-[#388e3c] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Write / edit review */}
          {isLoggedIn && canReviewData && (
            canReviewData.canReview ? (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {canReviewData.hasReviewed ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  {/* Star picker */}
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button"
                        onMouseEnter={() => setReviewHover(s)}
                        onMouseLeave={() => setReviewHover(0)}
                        onClick={() => setReviewRating(s)}
                        className="p-0.5 focus:outline-none"
                      >
                        <Star size={28}
                          className={(reviewHover || reviewRating) >= s
                            ? 'fill-[#ff9f00] text-[#ff9f00]'
                            : 'text-gray-300'}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        {['','Poor','Fair','Good','Very Good','Excellent'][reviewRating]}
                      </span>
                    )}
                  </div>
                  <input
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    placeholder="Review title (optional)"
                    maxLength={150}
                    className="input-base text-sm"
                  />
                  <textarea
                    required minLength={20}
                    value={reviewBody}
                    onChange={e => setReviewBody(e.target.value)}
                    placeholder="Share your experience with this product (min 20 characters)..."
                    rows={3}
                    className="input-base text-sm resize-none"
                  />
                  <button type="submit" disabled={submitReview.isPending}
                    className="btn-secondary px-6 py-2 rounded-sm text-sm">
                    {submitReview.isPending ? 'Submitting...' : canReviewData.hasReviewed ? 'Update Review' : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              !canReviewData.hasReviewed && (
                <p className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                  <ThumbsUp size={14} className="text-[#2874f0]" />
                  Purchase this product to write a review
                </p>
              )
            )
          )}

          {/* Review list */}
          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div className="space-y-5">
              {reviewsData.reviews.map(review => {
                const firstName = review.user.name.split(' ')[0]
                const lastInitial = review.user.name.split(' ')[1]?.[0]
                const isOwn = canReviewData?.existingReview?.id === review.id
                return (
                  <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-white text-xs font-semibold px-2 py-0.5 rounded ${
                            review.rating >= 4 ? 'bg-[#388e3c]' : review.rating >= 3 ? 'bg-[#ff9f00]' : 'bg-[#ff6161]'
                          }`}>
                            {review.rating} <Star size={10} fill="white" />
                          </span>
                          {review.title && <span className="text-sm font-semibold text-gray-800">{review.title}</span>}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span className="font-medium text-gray-600">{firstName}{lastInitial ? ` ${lastInitial}.` : ''}</span>
                          {review.verifiedPurchase && (
                            <span className="text-[#388e3c] font-medium">✓ Verified Purchase</span>
                          )}
                          <span>·</span>
                          <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      {isOwn && (
                        <button
                          onClick={async () => {
                            await deleteReview.mutateAsync(review.id)
                            toast.success('Review deleted')
                          }}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          title="Delete review"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Pagination */}
              {reviewsData.total > 10 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button disabled={reviewPage === 1}
                    onClick={() => setReviewPage(p => p - 1)}
                    className="text-sm text-[#2874f0] disabled:text-gray-300 font-medium">
                    ← Previous
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {reviewPage} of {Math.ceil(reviewsData.total / 10)}
                  </span>
                  <button disabled={reviewPage >= Math.ceil(reviewsData.total / 10)}
                    onClick={() => setReviewPage(p => p + 1)}
                    className="text-sm text-[#2874f0] disabled:text-gray-300 font-medium">
                    Next →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {related.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
