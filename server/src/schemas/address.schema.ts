import { z } from 'zod'

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  type: z.enum(['home', 'work']).optional(),
  isDefault: z.boolean().optional(),
})
