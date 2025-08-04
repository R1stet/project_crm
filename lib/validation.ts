import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional().nullable(),
  salesperson: z.string().optional().nullable(),
  status: z.string().min(1, 'Status is required'),
  dress: z.string().optional().nullable(),
  maker: z.string().optional().nullable(),
  skraedder: z.string().optional().nullable(),
  sizeBryst: z.number().positive().optional().nullable(),
  sizeTalje: z.number().positive().optional().nullable(),
  sizeHofte: z.number().positive().optional().nullable(),
  sizeArms: z.number().positive().optional().nullable(),
  sizeHeight: z.number().positive().optional().nullable(),
  invoiceStatus: z.string().default('pending'),
  notes: z.string().optional().nullable(),
  weddingDate: z.string().optional().nullable(),
  createdBy: z.string().min(1, 'Created by is required'),
})

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
})

export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_\\]/g, '\\$&').trim()
}

export type LoginInput = z.infer<typeof loginSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type SearchInput = z.infer<typeof searchSchema>