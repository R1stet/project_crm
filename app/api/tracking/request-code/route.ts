import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { trackingLookupSchema } from '@/lib/validation'
import { generateOtp, hashOtp } from '@/lib/otp'
import { sendOtpEmail } from '@/lib/email'

const rateLimits = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 3
const WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const record = rateLimits.get(key)

  if (!record || now - record.timestamp > WINDOW_MS) {
    rateLimits.set(key, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false
  }

  record.count++
  return true
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateLimits) {
    if (now - val.timestamp > WINDOW_MS) rateLimits.delete(key)
  }
}, 5 * 60 * 1000)

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = trackingLookupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ugyldig email eller telefonnummer' }, { status: 400 })
  }

  const { email, phoneNumber } = parsed.data
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (!checkRateLimit(`otp-ip:${ip}`) || !checkRateLimit(`otp-email:${email}`)) {
    return NextResponse.json(
      { error: 'For mange forsøg. Prøv venligst igen senere.' },
      { status: 429 },
    )
  }

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({ success: true })

  try {
    const supabase = createServerSupabaseClient()

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .eq('phone_number', phoneNumber)
      .limit(1)
      .single()

    if (!customer) {
      return successResponse
    }

    const code = generateOtp()
    const codeHash = hashOtp(code)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase.from('verification_codes').insert({
      email,
      phone_number: phoneNumber,
      code_hash: codeHash,
      expires_at: expiresAt,
    })

    await sendOtpEmail(email, code)
  } catch {
    // Swallow errors to maintain consistent response
  }

  return successResponse
}
