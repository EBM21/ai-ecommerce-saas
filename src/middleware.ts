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

  let currentHost = hostname

  if (isLocal) {
    // For local development, support subdomains (e.g., mystore.localhost)
    currentHost = hostname.replace(`.localhost`, "")
    currentHost = currentHost.replace(`localhost`, "") // fallback if just localhost
    currentHost = currentHost.replace(`127.0.0.1`, "") 

    // If it's just localhost (no subdomain), it's the dashboard
    if (currentHost === "") {
        return await updateSession(request)
    }
  } else {
    // ── Dashboard cases ──
    const isDashboard =
        hostname === `app.${rootDomain}` ||
        hostname === `quadlify.${rootDomain}` ||
        hostname === rootDomain ||
        hostname.endsWith('.vercel.app') ||
        hostname.endsWith('.railway.app') ||
        hostname.endsWith('.ngrok-free.app') ||
        hostname.endsWith('.ngrok.io') ||
        hostname.endsWith('.loca.lt') // localtunnel

    if (isDashboard) {
        return await updateSession(request)
    }

    currentHost = hostname.replace(`.${rootDomain}`, "")
  }

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