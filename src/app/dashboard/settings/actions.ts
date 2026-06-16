'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from "stripe"
import { z } from 'zod'

// Helper function to get Stripe instance only when needed
function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
        apiVersion: "2024-06-20" as any,
    })
}

const updateStoreSettingsSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name must be 100 characters or less'),
  subdomain: z.string()
    .min(1, 'Subdomain is required')
    .max(50, 'Subdomain must be 50 characters or less')
    .transform(val => val.toLowerCase())
    .refine((val) => /^[a-z0-9-]+$/.test(val), 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .refine((val) => !['app', 'admin', 'www', 'api', 'dashboard', 'main'].includes(val), {
      message: 'This subdomain is reserved',
    }),
  customDomain: z.string().nullable().optional().transform(val => val && val.trim() !== '' ? val.trim() : null),
  email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val),
  phone: z.string().nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val),
  stripePublicKey: z.string().nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val),
  stripeSecretKey: z.string().nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val),
})

export async function getStoreSettings() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        // ── SERIALIZE DATA TO CLEAN PLAIN OBJECT ──
        // This avoids issues with Decimal types or complex Prisma structures
        return { 
            success: true, 
            store: {
                id: store.id,
                name: store.name,
                subdomain: store.subdomain,
                customDomain: store.customDomain,
                email: store.email,
                phone: store.phone,
                stripePublicKey: store.stripePublicKey,
                stripeSecretKey: store.stripeSecretKey,
                plan: store.plan,
                trialEndsAt: store.trialEndsAt?.toISOString() || null,
                subscriptionActive: store.subscriptionActive,
                customDomainStatus: store.customDomainStatus,
                customDomainVerificationType: store.customDomainVerificationType,
                customDomainVerificationValue: store.customDomainVerificationValue,
                isProvisioned: store.isProvisioned,
                domainExpiresAt: store.domainExpiresAt?.toISOString() || null
            }
        }
    } catch (error: any) {
        console.error("Settings fetch error:", error)
        return { success: false, error: 'Server connection failed.' }
    }
}

export async function updateStoreSettings(data: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        const validated = updateStoreSettingsSchema.safeParse(data)
        if (!validated.success) {
            return { success: false, error: validated.error.issues.map((err: z.ZodIssue) => err.message).join(', ') }
        }

        const settings = validated.data

        await prisma.store.update({
            where: { id: store.id },
            data: {
                name: settings.name,
                subdomain: settings.subdomain,
                customDomain: settings.customDomain,
                email: settings.email,
                phone: settings.phone,
                stripePublicKey: settings.stripePublicKey,
                stripeSecretKey: settings.stripeSecretKey,
            }
        })

        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error: any) {
        console.error("Settings save error:", error)
        return { success: false, error: error.message }
    }
}

export async function createSubscriptionSession(storeId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store || store.ownerId !== user.id) {
            return { success: false, error: 'Store not found' }
        }

        const stripe = getStripe()
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Quadlix Pro Plan',
                            description: 'Unlimited products, orders, and premium AI features.',
                        },
                        unit_amount: 2900, // $29.00
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?tab=billing&success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?tab=billing&canceled=true`,
            metadata: {
                storeId: store.id,
                userId: user.id,
                plan: 'pro'
            }
        })

        return { success: true, url: session.url }

    } catch (error: any) {
        console.error("Stripe Session Error:", error)
        return { success: false, error: error.message }
    }
}
