import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next is the path to redirect to after successful auth
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
       console.error("Auth callback error:", error.message)
    }
    
    if (!error) {
      // Determine if we are running locally based on the origin
      const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
      
      // If we are passing a full URL in next, just redirect to it
      if (next.startsWith('http')) {
         return NextResponse.redirect(next)
      }

      // If next is a relative path, and we are not locally developing and want to enforce a scheme
      // The origin from the request might have correct port but maybe http instead of https on some proxies
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not verify email`)
}
