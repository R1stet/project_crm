import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { loginSchema } from '@/lib/validation'

// Server-side rate limiter (in-memory, acceptable for single instance)
const loginAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(key: string): { allowed: boolean; resetTime: number } {
  const now = Date.now()
  const record = loginAttempts.get(key)

  if (!record || now - record.timestamp > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, timestamp: now })
    return { allowed: true, resetTime: now + WINDOW_MS }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, resetTime: record.timestamp + WINDOW_MS }
  }

  record.count++
  return { allowed: true, resetTime: record.timestamp + WINDOW_MS }
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of loginAttempts) {
    if (now - val.timestamp > WINDOW_MS) loginAttempts.delete(key)
  }
}, 5 * 60 * 1000)

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password format' }, { status: 400 })
  }

  const { email, password } = parsed.data

  // Rate limit by IP and email (both must pass)
  const ipCheck = checkRateLimit(`ip:${ip}`)
  const emailCheck = checkRateLimit(`email:${email}`)

  if (!ipCheck.allowed || !emailCheck.allowed) {
    const resetTime = Math.max(ipCheck.resetTime, emailCheck.resetTime)
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.', resetTime },
      { status: 429 },
    )
  }

  // Authenticate via anon key client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  // On success, reset email rate limit
  loginAttempts.delete(`email:${email}`)

  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    user: { id: data.user.id, email: data.user.email },
  })
}
