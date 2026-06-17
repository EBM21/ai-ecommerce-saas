import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // ── Env-configured root domain (set this on Vercel!) ──
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ".quadlix.com"

  // ── Detect if we're running locally ──
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // ── On local: always dashboard (no subdomain routing locally) ──
  if (isLocal) {
    return await updateSession(request)
  }

  // ── Strip the root domain suffix to get the subdomain ──
  // e.g. "mystore.quadlix.com" → "mystore"
  // e.g. "quadlix.com" → "quadlix.com" (no change = no subdomain)
  const withoutRoot = hostname.replace(`.${rootDomain}`, "")

  // ── Dashboard cases ──
  // 1. Exact root domain: quadlix.com
  // 2. App subdomain: app.quadlix.com
  // 3. No subdomain stripped (unknown domain or Vercel preview URL)
  const isDashboard =
    hostname === rootDomain ||
    hostname === `app.${rootDomain}` ||
    withoutRoot === hostname || // no subdomain stripped = root or unknown host
    hostname.endsWith('.vercel.app') // all Vercel preview/deployment URLs → dashboard

  if (isDashboard) {
    return await updateSession(request)
  }

  // ── Storefront Subdomain Logic ──
  const currentHost = withoutRoot // e.g. "mystore"

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