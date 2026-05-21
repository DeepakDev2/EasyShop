import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    qty: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, 'Cart cannot be empty'),
  address: z.object({
    fullName: z.string().min(2),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
    line1: z.string().min(5),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  }),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
