import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy - Strengthened for security
  const isDev = process.env.NODE_ENV === 'development'

  const csp = [
    "default-src 'self'",
    // Allow unsafe-eval only in dev for Next.js HMR, remove unsafe-inline in production
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'"
      : "script-src 'self' 'wasm-unsafe-eval'",
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
  
  // Only add upgrade-insecure-requests in production
  if (!isDev) {
    csp.push("upgrade-insecure-requests")
  }

  response.headers.set('Content-Security-Policy', csp.join('; '))

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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}