import { describe, it, expect, vi } from 'vitest'
import { AppError, sanitizeError, logSecurityEvent } from '../error-handler'

describe('AppError', () => {
  it('stores user message and status code', () => {
    const err = new AppError('internal detail', 'User-facing message', 403)
    expect(err.message).toBe('internal detail')
    expect(err.userMessage).toBe('User-facing message')
    expect(err.statusCode).toBe(403)
    expect(err.name).toBe('AppError')
  })

  it('defaults status code to 400', () => {
    const err = new AppError('msg', 'user msg')
    expect(err.statusCode).toBe(400)
  })
})

describe('sanitizeError', () => {
  it('returns userMessage for AppError', () => {
    const err = new AppError('secret', 'Safe message', 500)
    expect(sanitizeError(err)).toBe('Safe message')
  })

  it('handles duplicate key errors', () => {
    expect(sanitizeError(new Error('duplicate key value violates'))).toBe('This record already exists')
  })

  it('handles invalid input errors', () => {
    expect(sanitizeError(new Error('invalid input syntax for type'))).toBe('Invalid data provided')
  })

  it('handles permission errors', () => {
    expect(sanitizeError(new Error('permission denied for table'))).toBe('You do not have permission to perform this action')
  })

  it('handles network errors', () => {
    expect(sanitizeError(new Error('network timeout'))).toBe('Network error. Please try again.')
  })

  it('returns generic message for unknown errors', () => {
    expect(sanitizeError('some string')).toBe('An unexpected error occurred. Please try again.')
    expect(sanitizeError(42)).toBe('An unexpected error occurred. Please try again.')
  })
})

describe('logSecurityEvent', () => {
  it('logs to console.warn with timestamp', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logSecurityEvent('LOGIN_FAILED', { ip: '127.0.0.1' })
    expect(warnSpy).toHaveBeenCalledOnce()
    expect(warnSpy.mock.calls[0][0]).toContain('[SECURITY] LOGIN_FAILED')
    warnSpy.mockRestore()
  })
})
