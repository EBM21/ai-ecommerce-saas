import { headers } from "next/headers"

export async function getBaseUrl(domain: string) {
    try {
        const headerList = await headers()
        const host = headerList.get("host") || ""
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
        
        let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "quadlix.com"
        // Strip leading dot if it exists just in case
        rootDomain = rootDomain.startsWith('.') ? rootDomain.substring(1) : rootDomain
        
        const isDashboard = 
            host === `quadlify.${rootDomain}` ||
            host === rootDomain || 
            host.endsWith('.vercel.app') || 
            isLocal

        // If we are on the dashboard or local, we need path-based routing (e.g. /storename) to preview stores.
        // If we are on a custom domain/subdomain, we are at the root (/) and don't need the path.
        return isDashboard ? `/${domain}` : ""
    } catch (e) {
        // Fallback for edge cases
        return `/${domain}`
    }
}
