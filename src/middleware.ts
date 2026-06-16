import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define the base domains
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'quadlix.com')

  // Parse the subdomain
  const currentHost = hostname.replace(`.${baseDomain}`, "")
  
  // ── Main SaaS Dashboard Check ──
  // We are on the dashboard if:
  // 1. Host is exactly the base domain (e.g., quadlix.com)
  // 2. Host is the 'app' subdomain (e.g., app.quadlix.com)
  // 3. Or it's the specific Vercel deployment URL (if configured)
  const isDashboard = hostname === baseDomain || hostname === `app.${baseDomain}` || hostname === 'ai-ecommerce-saas.vercel.app'

  if (isDashboard) {
    // We are on the SaaS dashboard. Run the auth middleware.
    return await updateSession(request)
  }

  // ── Storefront Subdomain Logic ──
  // Exclude static assets and api routes from rewrite
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith(`/${currentHost}`) // Prevent double rewrite
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