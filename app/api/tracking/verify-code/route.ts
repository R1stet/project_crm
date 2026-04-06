import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyOtpSchema } from '@/lib/validation'
import { hashOtp } from '@/lib/otp'

const rateLimits = new Map<string, { count: number; timestamp: number }>()
const MAX_ATTEMPTS = 10
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

  const parsed = verifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ugyldig kode' }, { status: 400 })
  }

  const { email, phoneNumber, code } = parsed.data
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (!checkRateLimit(`verify-ip:${ip}`)) {
    return NextResponse.json(
      { error: 'For mange forsøg. Prøv venligst igen senere.' },
      { status: 429 },
    )
  }

  const supabase = createServerSupabaseClient()

  // Find the latest valid code for this email
  const { data: verification } = await supabase
    .from('verification_codes')
    .select('id, code_hash, attempts')
    .eq('email', email)
    .eq('used', false)
    .lt('attempts', 5)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!verification) {
    return NextResponse.json(
      { error: 'Ugyldig eller udløbet kode. Anmod om en ny kode.' },
      { status: 400 },
    )
  }

  const inputHash = hashOtp(code)

  if (inputHash !== verification.code_hash) {
    // Increment attempts
    await supabase
      .from('verification_codes')
      .update({ attempts: verification.attempts + 1 })
      .eq('id', verification.id)

    return NextResponse.json(
      { error: 'Forkert kode. Prøv igen.' },
      { status: 400 },
    )
  }

  // Mark code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', verification.id)

  // Fetch matching orders
  const { data: orders, error } = await supabase
    .from('customers')
    .select('name, status, dress, expected_delivery_date, wedding_date')
    .eq('email', email)
    .eq('phone_number', phoneNumber)

  if (error || !orders || orders.length === 0) {
    return NextResponse.json(
      { error: 'Ingen ordrer fundet.' },
      { status: 404 },
    )
  }

  return NextResponse.json({ orders })
}
