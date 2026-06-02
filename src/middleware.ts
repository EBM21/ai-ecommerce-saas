import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Define the base domains (we'll assume localhost:3000 for local dev, and nexus.app for prod)
  // In a real app, this should be an environment variable
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'nexus.app')

  // Parse the subdomain
  let currentHost = hostname.replace(`.${baseDomain}`, "")
  
  // If the hostname equals the base domain (no subdomain), currentHost will be the baseDomain itself
  // If there's a custom domain, it will be the full custom domain
  
  // If this is the main SaaS dashboard (no subdomain or 'app' subdomain)
  if (currentHost === baseDomain || currentHost === 'app') {
    // We are on the SaaS dashboard. Run the auth middleware.
    return await updateSession(request)
  }

  // Otherwise, we are on a Storefront (a subdomain like mystore.localhost:3000 or customdomain.com)
  // Rewrite the request to our dynamic storefront route
  
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
