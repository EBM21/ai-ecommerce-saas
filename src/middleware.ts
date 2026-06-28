import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  // Extract host header and strip any port number
  const hostHeader = request.headers.get("host") || ""
  const hostname = hostHeader.split(":")[0]

  // ── Env-configured root domain (set this on Vercel to quadlix.com) ──
  let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "quadlix.com"
  rootDomain = rootDomain.startsWith('.') ? rootDomain.substring(1) : rootDomain

  // ── Detect if we're running locally ──
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // ── On local: always dashboard (no subdomain routing locally) ──
  if (isLocal) {
    return await updateSession(request)
  }

  // ── Dashboard cases ──
  // 1. App subdomain: quadlify.quadlix.com
  // 2. Exact root domain: quadlix.com
  // 3. Vercel preview URL
  const isDashboard =
    hostname === `quadlify.${rootDomain}` ||
    hostname === rootDomain ||
    hostname.endsWith('.vercel.app')

  if (isDashboard) {
    return await updateSession(request)
  }

  // ── Storefront Subdomain Logic ──
  // Strip the root domain suffix to get the subdomain
  // e.g. "mystore.quadlix.com" → "mystore"
  const currentHost = hostname.replace(`.${rootDomain}`, "")

  // Pass through Next.js internals and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/favicon.ico' ||
    url.pathname.startsWith(`/${currentHost}`) // Prevent double rewrite
  ) {
    return NextResponse.next()
  }

  // Rewrite storefront: /path → /[domain]/path
  url.pathname = `/${currentHost}${url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}