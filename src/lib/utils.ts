import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStoreUrl(domain: string, path: string = '') {
    // Ensure path starts with a slash if it's not empty and doesn't already have one
    const safePath = path && !path.startsWith('/') ? `/${path}` : path;
    
    if (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))) {
        return `/${domain}${safePath}`
    }
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "quadlix.com").replace(/^\./, '');
    return `https://${domain}.${rootDomain}${safePath}`;
}
