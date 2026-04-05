import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Use dynamic import to avoid the module-level setInterval side effect in some envs
describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests within the limit', async () => {
    const { loginRateLimiter } = await import('../rate-limiter')
    loginRateLimiter.reset('test-user')

    const result = loginRateLimiter.check('test-user')
    expect(result.allowed).toBe(true)
    expect(result.remainingAttempts).toBe(4)
  })

  it('blocks after exceeding max attempts', async () => {
    const { loginRateLimiter } = await import('../rate-limiter')
    loginRateLimiter.reset('block-user')

    for (let i = 0; i < 5; i++) {
      loginRateLimiter.check('block-user')
    }

    const result = loginRateLimiter.check('block-user')
    expect(result.allowed).toBe(false)
    expect(result.remainingAttempts).toBe(0)
  })

  it('resets after the time window', async () => {
    const { loginRateLimiter } = await import('../rate-limiter')
    loginRateLimiter.reset('time-user')

    for (let i = 0; i < 5; i++) {
      loginRateLimiter.check('time-user')
    }

    // Advance past the 15-minute window
    vi.advanceTimersByTime(16 * 60 * 1000)

    const result = loginRateLimiter.check('time-user')
    expect(result.allowed).toBe(true)
  })
})
