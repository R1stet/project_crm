import { randomInt, createHash } from 'crypto'

export function generateOtp(): string {
  return randomInt(100000, 999999).toString()
}

export function hashOtp(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export function verifyOtp(code: string, hash: string): boolean {
  return hashOtp(code) === hash
}
