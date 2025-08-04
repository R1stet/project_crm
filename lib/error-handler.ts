export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function sanitizeError(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }

  if (error instanceof Error) {
    if (error.message.includes('duplicate key value')) {
      return 'This record already exists'
    }
    if (error.message.includes('invalid input syntax')) {
      return 'Invalid data provided'
    }
    if (error.message.includes('permission denied')) {
      return 'You do not have permission to perform this action'
    }
    if (error.message.includes('network')) {
      return 'Network error. Please try again.'
    }
  }

  console.error('Unhandled error:', error)
  return 'An unexpected error occurred. Please try again.'
}

export function logSecurityEvent(event: string, details: Record<string, unknown>): void {
  console.warn(`[SECURITY] ${event}:`, {
    timestamp: new Date().toISOString(),
    ...details
  })
}