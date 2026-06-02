import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define the base domains
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isVercel = hostname.endsWith('quadlix.com') // <-- Vercel domain ko identify kiya
  
  const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'quadlix.com')

  // Parse the subdomain
  let currentHost = hostname.replace(`.${baseDomain}`, "")
  
  // ── Main SaaS Dashboard Check ──
  // Agar URL Vercel ka hai, base domain hai, ya 'app' subdomain hai
  if (currentHost === baseDomain || currentHost === 'app' || isVercel) {
    // We are on the SaaS dashboard. Run the auth middleware.
    return await updateSession(request)
  }

  // ── Storefront Subdomain Logic ──
  // Exclude static assets and api routes from rewrite
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Rewrite to /[domain]/[path]
  url.pathname = `/${currentHost}${url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 