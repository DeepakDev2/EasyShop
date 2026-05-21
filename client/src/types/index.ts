// ─── Shared Types for EasyShop ────────────────────────────────────────────────

export type Category = {
  id: number
  name: string
  slug: string
  iconUrl: string | null
  parentId: number | null
  _count?: { products: number }
}

export type ProductImage = {
  id: number
  url: string
  isPrimary: boolean
  displayOrder: number
}

export type ProductSpec = {
  id: number
  specKey: string
  specValue: string
  displayOrder: number
}

export type Product = {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  originalPrice: number | null
  discountPct: number
  stock: number
  rating: number
  ratingCount: number
  brand: string | null
  isActive: boolean
  createdAt: string
  category: Category | null
  images: ProductImage[]
  specs: ProductSpec[]
}

export type User = {
  id: number
  name: string
  email: string
  phone: string | null
  role: 'customer' | 'admin'
  createdAt: string
}

export type Address = {
  id: number
  userId: number
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export type CartItem = {
  id: number
  product: Product
  quantity: number
}

export type OrderItem = {
  id: number
  productId: number | null
  productName: string
  productImg: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export type Order = {
  id: number
  orderNumber: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  discount: number
  deliveryCharge: number
  total: number
  paymentMethod: string
  paymentStatus: string
  placedAt: string
  address: Address | null
  orderItems: OrderItem[]
}

export type WishlistItem = {
  id: number
  productId: number
  product: Product
  addedAt: string
}

// ─── API Response Types ───────────────────────────────────────────────────────
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type ApiError = {
  success: false
  error: string
  code: string
  details?: { field: string; message: string }[]
}

// ─── Filter Types ─────────────────────────────────────────────────────────────
export type ProductFilters = {
  category?: string
  q?: string
  minPrice?: number
  maxPrice?: number
  brand?: string
  rating?: number
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}
