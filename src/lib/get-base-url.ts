import { headers } from "next/headers"

export async function getBaseUrl(domain: string) {
    try {
        const headerList = await headers()
        const host = headerList.get("host") || ""
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
        const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'quadlix.com')
        const isPathBased = host === baseDomain || host === `app.${baseDomain}`
        return isPathBased ? `/${domain}` : ""
    } catch (e) {
        // Fallback for edge cases where headers aren't available
        return `/${domain}`
    }
}
