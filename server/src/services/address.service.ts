import { prisma } from '../config/db'
import { createError } from '../middleware/errorHandler'

export const getUserAddresses = async (userId: number) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
  })
}

export const createAddress = async (userId: number, data: {
  fullName: string; phone: string; line1: string; line2?: string
  city: string; state: string; pincode: string; type?: string; isDefault?: boolean
}) => {
  // If setting as default, unset previous default first
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  }
  return prisma.address.create({
    data: { ...data, userId, isDefault: data.isDefault ?? false },
  })
}

export const updateAddress = async (addressId: number, userId: number, data: {
  fullName?: string; phone?: string; line1?: string; line2?: string
  city?: string; state?: string; pincode?: string; type?: string; isDefault?: boolean
}) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address) throw createError('Address not found', 404, 'NOT_FOUND')
  if (address.userId !== userId) throw createError('Access denied', 403, 'FORBIDDEN')

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  }
  return prisma.address.update({ where: { id: addressId }, data })
}

export const deleteAddress = async (addressId: number, userId: number) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address) throw createError('Address not found', 404, 'NOT_FOUND')
  if (address.userId !== userId) throw createError('Access denied', 403, 'FORBIDDEN')
  await prisma.address.delete({ where: { id: addressId } })
}

export const setDefault = async (addressId: number, userId: number) => {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address) throw createError('Address not found', 404, 'NOT_FOUND')
  if (address.userId !== userId) throw createError('Access denied', 403, 'FORBIDDEN')
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } })
  return prisma.address.update({ where: { id: addressId }, data: { isDefault: true } })
}
