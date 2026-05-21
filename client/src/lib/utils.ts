export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)

export const formatDate = (dateStr: string): string =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))

export const getDiscountColor = (pct: number): string => {
  if (pct >= 50) return 'text-green-600'
  if (pct >= 20) return 'text-green-500'
  return 'text-green-500'
}

export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ')

export const truncate = (text: string, len: number): string =>
  text.length <= len ? text : text.slice(0, len) + '…'

export const getPrimaryImage = (images: { url: string; isPrimary: boolean }[]): string => {
  const primary = images.find(i => i.isPrimary)
  return primary?.url ?? images[0]?.url ?? '/placeholder.png'
}
