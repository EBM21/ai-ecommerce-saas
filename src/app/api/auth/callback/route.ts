import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as any
  const next = searchParams.get('next') ?? '/dashboard'
  
  let error = null

  if (code) {
    const supabase = await createClient()
    const { error: codeError } = await supabase.auth.exchangeCodeForSession(code)
    error = codeError
  } else if (token_hash && type) {
    const supabase = await createClient()
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    error = otpError
  } else {
    // Neither code nor token_hash provided
    return NextResponse.redirect(`${origin}/login?error=Invalid link`)
  }

  if (error) {
    console.error("Auth callback error:", error.message)
    return NextResponse.redirect(`${origin}/login?error=Could not verify email: ${error.message}`)
  }
    
  // If we are passing a full URL in next, just redirect to it
  if (next.startsWith('http')) {
     return NextResponse.redirect(next)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
