import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limit state
const trackingLimiter = new Map<string, { count: number; timestamp: number }>()
const TRACKING_LIMIT = 30
const TRACKING_WINDOW = 60_000 // 1 minute

const loginLimiter = new Map<string, { count: number; timestamp: number }>()
const LOGIN_LIMIT = 10
const LOGIN_WINDOW = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(
  limiter: Map<string, { count: number; timestamp: number }>,
  key: string,
  limit: number,
  window: number,
): boolean {
  const now = Date.now()
  const record = limiter.get(key)

  if (!record || now - record.timestamp > window) {
    limiter.set(key, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

function cleanupLimiter(limiter: Map<string, { count: number; timestamp: number }>, window: number) {
  if (limiter.size > 10000) {
    const now = Date.now()
    for (const [key, val] of limiter) {
      if (now - val.timestamp > window) limiter.delete(key)
    }
  }
}

export function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // Rate limit tracking route
  if (request.nextUrl.pathname.startsWith('/track/')) {
    cleanupLimiter(trackingLimiter, TRACKING_WINDOW)
    if (!checkRateLimit(trackingLimiter, ip, TRACKING_LIMIT, TRACKING_WINDOW)) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // Rate limit login API
  if (request.nextUrl.pathname === '/api/auth/login' && request.method === 'POST') {
    cleanupLimiter(loginLimiter, LOGIN_WINDOW)
    if (!checkRateLimit(loginLimiter, ip, LOGIN_LIMIT, LOGIN_WINDOW)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }
  }

  const isDev = process.env.NODE_ENV === 'development'

  // Per-request nonce for CSP. In production we use 'nonce-…' + 'strict-dynamic'
  // so Next.js's streaming inline scripts (self.__next_f.push(...)) can execute
  // without 'unsafe-inline'. Next.js auto-applies this nonce to its scripts when
  // it sees the CSP header on the incoming request.
  const nonce = btoa(crypto.randomUUID())

  const csp = [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'"
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.app",
    "font-src 'self' https://fonts.gstatic.com https://*.vercel.app data:",
    "img-src 'self' data: https: blob: https://*.vercel.app https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.vercel.app https://*.googleapis.com" + (isDev ? " ws://localhost:* http://localhost:*" : ""),
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' data: blob:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ]

  if (!isDev) {
    csp.push("upgrade-insecure-requests")
  }

  const cspValue = csp.join('; ')

  // Forward the nonce + CSP to Next.js via request headers so it applies the
  // nonce to its inline scripts. This also opts the route into dynamic
  // rendering, which is required because the nonce changes per request.
  const requestHeaders = new Headers(request.headers)
  if (!isDev) {
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('content-security-policy', cspValue)
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Content-Security-Policy', cspValue)

  // Permissions Policy - Allow camera for same-origin (needed for camera capture feature)
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(), interest-cohort=()'
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
