class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  check(identifier: string): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now - record.firstAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now })
      return {
        allowed: true,
        remainingAttempts: this.maxAttempts - 1,
        resetTime: now + this.windowMs
      }
    }

    if (record.count >= this.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.firstAttempt + this.windowMs
      }
    }

    record.count++
    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - record.count,
      resetTime: record.firstAttempt + this.windowMs
    }
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.attempts.entries()) {
      if (now - record.firstAttempt > this.windowMs) {
        this.attempts.delete(key)
      }
    }
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000)

setInterval(() => {
  loginRateLimiter.cleanup()
}, 5 * 60 * 1000)