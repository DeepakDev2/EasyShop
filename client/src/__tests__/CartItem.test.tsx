import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement('img', { src, alt }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

jest.mock('react-hot-toast', () => ({ default: { success: jest.fn(), error: jest.fn() } }))

const mockRemoveItem = jest.fn()
const mockUpdateQty = jest.fn()
const mockToggle = jest.fn()

jest.mock('@/store/cartStore', () => ({
  useCartStore: () => ({
    removeItem: mockRemoveItem,
    updateQty: mockUpdateQty,
  }),
}))

jest.mock('@/store/wishlistStore', () => ({
  useWishlistStore: () => ({
    isWished: () => false,
    toggle: mockToggle,
  }),
}))

import CartItem from '@/components/cart/CartItem'

const mockEntry = {
  product: {
    id: 1, name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24',
    price: 74999, originalPrice: 89999, discountPct: 17,
    stock: 10, brand: 'Samsung', image: 'https://picsum.photos/400',
    rating: 4.5, ratingCount: 100, category: 'Mobiles',
  },
  qty: 2,
}

describe('CartItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product name', () => {
    render(<CartItem entry={mockEntry} />)
    expect(screen.getByText(/Samsung Galaxy S24/i)).toBeInTheDocument()
  })

  it('renders product brand', () => {
    render(<CartItem entry={mockEntry} />)
    expect(screen.getByText(/Samsung/i)).toBeInTheDocument()
  })

  it('renders the current quantity', () => {
    render(<CartItem entry={mockEntry} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls updateQty with qty+1 when + button clicked', () => {
    render(<CartItem entry={mockEntry} />)
    const buttons = screen.getAllByRole('button')
    const plusBtn = buttons.find(b => b.querySelector('svg'))
    // Find the + button specifically (increase)
    const increaseBtn = screen.getByRole('button', { name: '' }) // relies on icon-only button
    // Use aria or test-ids — fall back to querying by position
    const allBtns = screen.getAllByRole('button')
    // qty + button is the 2nd button in the qty control (after minus)
    fireEvent.click(allBtns[1]) // + button (0=minus, 1=plus)
    expect(mockUpdateQty).toHaveBeenCalledWith(1, 3) // qty 2 + 1 = 3
  })

  it('calls updateQty with qty-1 when - button clicked', () => {
    render(<CartItem entry={mockEntry} />)
    const allBtns = screen.getAllByRole('button')
    fireEvent.click(allBtns[0]) // - button
    expect(mockUpdateQty).toHaveBeenCalledWith(1, 1) // qty 2 - 1 = 1
  })

  it('minus button disabled when qty is 1', () => {
    render(<CartItem entry={{ ...mockEntry, qty: 1 }} />)
    const allBtns = screen.getAllByRole('button')
    expect(allBtns[0]).toBeDisabled()
  })

  it('plus button disabled when qty equals stock', () => {
    render(<CartItem entry={{ ...mockEntry, qty: 10 }} />) // stock = 10
    const allBtns = screen.getAllByRole('button')
    expect(allBtns[1]).toBeDisabled()
  })

  it('calls removeItem when Remove button clicked', () => {
    render(<CartItem entry={mockEntry} />)
    fireEvent.click(screen.getByText(/remove/i))
    expect(mockRemoveItem).toHaveBeenCalledWith(1)
  })

  it('shows Save for Later button', () => {
    render(<CartItem entry={mockEntry} />)
    expect(screen.getByText(/save for later/i)).toBeInTheDocument()
  })

  it('renders discounted price and original price', () => {
    render(<CartItem entry={mockEntry} />)
    expect(screen.getByText(/74,999/)).toBeInTheDocument()
    expect(screen.getByText(/89,999/)).toBeInTheDocument()
  })
})
