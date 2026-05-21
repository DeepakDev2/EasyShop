import { prisma } from '../config/db'

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })
  return categories.map(({ _count, ...cat }) => ({ ...cat, productCount: _count.products }))
}

export const getCategoryBySlug = async (slug: string) => {
  return prisma.category.findUnique({ where: { slug } })
}
