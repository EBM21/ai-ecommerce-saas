import { headers } from "next/headers"

export async function getBaseUrl(domain: string) {
    try {
        const headerList = await headers()
        const host = headerList.get("host") || ""
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
        
        let rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ""
        if (!rootDomain) {
            rootDomain = isLocal ? 'localhost:3000' : 'quadlix.com'
        }
        // Strip leading dot if it exists for exact matches
        const cleanRoot = rootDomain.startsWith('.') ? rootDomain.substring(1) : rootDomain
        
        const withoutRoot = host.replace(rootDomain.startsWith('.') ? rootDomain : `.${rootDomain}`, "")
        
        const isPathBased = 
            host === cleanRoot || 
            host === `app.${cleanRoot}` || 
            withoutRoot === host || 
            host.endsWith('.vercel.app') || 
            isLocal
            
        return isPathBased ? `/${domain}` : ""
    } catch (e) {
        // Fallback for edge cases where headers aren't available
        return `/${domain}`
    }
}
