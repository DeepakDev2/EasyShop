export const computeDiscountPct = (price: number, originalPrice: number | null): number => {
  if (!originalPrice || originalPrice <= 0) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `OD${date}${random}`
}

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatProduct = (product: any) => {
  const price = Number(product.price)
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null
  return {
    ...product,
    price,
    originalPrice,
    rating: Number(product.rating),
    discountPct: computeDiscountPct(price, originalPrice),
  }
}
