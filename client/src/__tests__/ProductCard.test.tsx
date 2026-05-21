import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}))

// Mock next/image to render a plain <img>
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) =>
    React.createElement('img', { src, alt, ...props }),
}))

// Mock zustand stores
jest.mock('@/store/cartStore', () => ({
  useCartStore: () => ({
    addItem: jest.fn(),
    itemCount: () => 2,
    items: [],
  }),
}))

jest.mock('@/store/wishlistStore', () => ({
  useWishlistStore: () => ({
    isWished: () => false,
    toggle: jest.fn(),
  }),
}))

import ProductCard from '@/components/product/ProductCard'

const mockProduct = {
  id: 1,
  name: 'Samsung Galaxy S24 Ultra 5G Smartphone',
  slug: 'samsung-galaxy-s24',
  price: 74999,
  originalPrice: 89999,
  discountPct: 17,
  rating: 4.5,
  ratingCount: 1234,
  stock: 50,
  brand: 'Samsung',
  image: 'https://picsum.photos/400',
  category: 'Mobiles',
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/Samsung Galaxy S24 Ultra/i)).toBeInTheDocument()
  })

  it('renders the discounted price', () => {
    render(<ProductCard product={mockProduct} />)
    // Price in Indian format
    expect(screen.getByText(/74,999/)).toBeInTheDocument()
  })

  it('renders the original (strikethrough) price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/89,999/)).toBeInTheDocument()
  })

  it('renders the discount percentage', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/17%\s*off/i)).toBeInTheDocument()
  })

  it('renders the star rating badge', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
  })

  it('renders rating count', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/1,234/)).toBeInTheDocument()
  })

  it('links to the product detail page', () => {
    render(<ProductCard product={mockProduct} />)
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href')?.includes('samsung-galaxy-s24'))).toBe(true)
  })

  it('shows "Out of Stock" badge when stock is 0', () => {
    render(<ProductCard product={{ ...mockProduct, stock: 0 }} />)
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('does not show discount if no original price', () => {
    render(<ProductCard product={{ ...mockProduct, originalPrice: 0, discountPct: 0 }} />)
    expect(screen.queryByText(/% off/i)).not.toBeInTheDocument()
  })
})
