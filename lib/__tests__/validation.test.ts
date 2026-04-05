import { describe, it, expect } from 'vitest'
import { loginSchema, customerSchema, searchSchema, sanitizeSearchQuery } from '../validation'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '12345' })
    expect(result.success).toBe(false)
  })
})

describe('customerSchema', () => {
  const validCustomer = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    status: 'active',
    createdBy: 'user-1',
  }

  it('accepts valid customer with required fields only', () => {
    const result = customerSchema.safeParse(validCustomer)
    expect(result.success).toBe(true)
  })

  it('accepts valid customer with optional fields', () => {
    const result = customerSchema.safeParse({
      ...validCustomer,
      phoneNumber: '+4512345678',
      sizeBryst: 90,
      notes: 'Some notes',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = customerSchema.safeParse({ ...validCustomer, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects negative size values', () => {
    const result = customerSchema.safeParse({ ...validCustomer, sizeBryst: -1 })
    expect(result.success).toBe(false)
  })
})

describe('searchSchema', () => {
  it('accepts valid query', () => {
    const result = searchSchema.safeParse({ query: 'test' })
    expect(result.success).toBe(true)
  })

  it('rejects empty query', () => {
    const result = searchSchema.safeParse({ query: '' })
    expect(result.success).toBe(false)
  })
})

describe('sanitizeSearchQuery', () => {
  it('escapes percent signs', () => {
    expect(sanitizeSearchQuery('100%')).toBe('100\\%')
  })

  it('escapes underscores', () => {
    expect(sanitizeSearchQuery('some_query')).toBe('some\\_query')
  })

  it('escapes backslashes', () => {
    expect(sanitizeSearchQuery('test\\value')).toBe('test\\\\value')
  })

  it('trims whitespace', () => {
    expect(sanitizeSearchQuery('  hello  ')).toBe('hello')
  })

  it('handles combined special characters', () => {
    expect(sanitizeSearchQuery(' %_\\ ')).toBe('\\%\\_\\\\')
  })
})
