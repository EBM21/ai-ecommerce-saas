'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import dns from 'dns/promises'

// ── CONFIG ──────────────────────────────────────────────────────────────────
// Replace this with your actual server IP or CNAME target
const SERVER_IP = process.env.NEXT_PUBLIC_SERVER_IP || '76.76.21.21' // Example (Vercel)
const CNAME_TARGET = process.env.NEXT_PUBLIC_CNAME_TARGET || 'cname.quadlix.com'

// ── SCHEMAS ─────────────────────────────────────────────────────────────────
const domainSchema = z.string().min(3).regex(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i, 'Invalid domain format')

// ── ACTIONS ─────────────────────────────────────────────────────────────────

/**
 * 🔍 SEARCH / AVAILABILITY CHECK
 * Restricts to .com as per requirements.
 */
export async function searchDomainAvailability(query: string) {
    try {
        const domain = query.toLowerCase().trim()
        if (!domain.endsWith('.com')) return { success: false, error: 'Only .com domains are supported for free provisioning.' }
        
        const validated = domainSchema.parse(domain)

        // Mocking Registrar API call (e.g. GoDaddy, Namecheap)
        // In a real app, you'd fetch(`${API_URL}/available?domain=${validated}`)
        await new Promise(r => setTimeout(r, 800)) // Simulate network lag
        
        // Mock logic: Domains containing 'taken' or 'google' are unavailable
        const isAvailable = !validated.includes('taken') && !validated.includes('google')
        
        return { 
            success: true, 
            available: isAvailable, 
            domain: validated,
            price: isAvailable ? 0 : null // Quadlix covers the cost
        }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * 🎁 PROVISION FREE DOMAIN
 */
export async function provisionFreeDomain(domain: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) return { success: false, error: 'Store not found' }

        // Check availability one last time before "purchasing"
        const check = await searchDomainAvailability(domain)
        if (!check.success || !check.available) return { success: false, error: 'Domain is no longer available.' }

        // MOCK REGISTRATION CALL
        // await registrar.register(domain, quadlix_corporate_billing)

        await prisma.store.update({
            where: { id: store.id },
            data: {
                customDomain: domain,
                customDomainStatus: 'ACTIVE', // Auto-active since we manage it
                isProvisioned: true,
                domainExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            }
        })

        revalidatePath('/dashboard/settings')
        return { success: true, message: `Successfully registered ${domain} for your store!` }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * 🔗 CONNECT EXISTING DOMAIN
 */
export async function setupExistingDomain(domain: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) return { success: false, error: 'Store not found' }

        const validated = domainSchema.parse(domain.toLowerCase().trim())

        // Logic to determine if user should use A or CNAME
        // Usually: root domain (example.com) -> A Record
        // Subdomain (shop.example.com) -> CNAME
        const isSubdomain = validated.split('.').length > 2
        const type = isSubdomain ? 'CNAME' : 'A'
        const value = isSubdomain ? CNAME_TARGET : SERVER_IP

        await prisma.store.update({
            where: { id: store.id },
            data: {
                customDomain: validated,
                customDomainStatus: 'PENDING',
                customDomainVerificationType: type,
                customDomainVerificationValue: value,
                isProvisioned: false
            }
        })

        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * 📡 VERIFY DNS RECORDS
 */
export async function verifyDomainDNS(domain: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({ 
            where: { ownerId: user.id, customDomain: domain } 
        })
        if (!store) return { success: false, error: 'Domain mapping not found' }

        let isVerified = false

        try {
            if (store.customDomainVerificationType === 'A') {
                const records = await dns.resolve4(domain)
                isVerified = records.includes(store.customDomainVerificationValue!)
            } else if (store.customDomainVerificationType === 'CNAME') {
                const records = await dns.resolveCname(domain)
                isVerified = records.includes(store.customDomainVerificationValue!)
            }
        } catch (dnsErr) {
            console.warn("DNS check failed:", dnsErr)
        }

        if (isVerified) {
            await prisma.store.update({
                where: { id: store.id },
                data: { customDomainStatus: 'ACTIVE' }
            })
        }

        revalidatePath('/dashboard/settings')
        return { success: isVerified }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * ❌ REMOVE DOMAIN
 */
export async function removeCustomDomain() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) return { success: false, error: 'Store not found' }

        await prisma.store.update({
            where: { id: store.id },
            data: {
                customDomain: null,
                customDomainStatus: 'INACTIVE',
                customDomainVerificationType: null,
                customDomainVerificationValue: null,
                isProvisioned: false,
                domainExpiresAt: null
            }
        })

        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
