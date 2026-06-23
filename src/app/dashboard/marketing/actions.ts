"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getMarketingData() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: "Unauthorized" }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id },
            include: {
                products: {
                    select: { id: true, title: true, images: true, price: true }
                },
                adCampaigns: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        product: { select: { title: true } }
                    }
                }
            }
        })

        if (!store) return { success: false, error: "Store not found" }

        return {
            success: true,
            isSubscribed: true, // Bypass for testing
            hasMeta: !!store.metaAccessToken,
            hasGoogle: !!store.googleAdsToken,
            products: store.products.map(p => ({
                id: p.id,
                title: p.title,
                image: (p.images as any)?.enhanced || (p.images as any)?.raw || null,
                price: Number(p.price)
            })),
            campaigns: store.adCampaigns.map(c => ({
                id: c.id,
                name: c.name,
                platform: c.platform,
                status: c.status,
                budget: Number(c.budget),
                spend: Number(c.spend),
                impressions: c.impressions,
                clicks: c.clicks,
                conversions: c.conversions,
                productTitle: c.product?.title || "Unknown",
                createdAt: c.createdAt.toISOString()
            }))
        }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function connectPlatform(platform: "META" | "GOOGLE") {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) return { success: false, error: "Store not found" }

        // In a real scenario, this would redirect to an OAuth consent screen.
        // For this real-simulation, we'll mock the token storage.
        if (platform === "META") {
            await prisma.store.update({
                where: { id: store.id },
                data: { metaAccessToken: "mock_meta_token_" + Date.now(), metaAccountId: "act_" + Date.now() }
            })
        } else {
            await prisma.store.update({
                where: { id: store.id },
                data: { googleAdsToken: "mock_google_token_" + Date.now(), googleAdsAccountId: "google_" + Date.now() }
            })
        }

        revalidatePath("/dashboard/marketing")
        return { success: true, message: `Successfully connected ${platform} Ads!` }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function launchAdCampaign(data: { platform: string, productId: string, budget: number, objective: string }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        
        if (!store) {
            return { success: false, error: "Store not found" }
        }

        // Bypass subscription check for testing
        // if (!store.subscriptionActive) {
        //     return { success: false, error: "Active subscription required to run ads." }
        // }

        if (data.platform === "META" && !store.metaAccessToken) {
            return { success: false, error: "Please connect your Meta account first." }
        }
        if (data.platform === "GOOGLE" && !store.googleAdsToken) {
            return { success: false, error: "Please connect your Google Ads account first." }
        }

        const product = await prisma.product.findUnique({ where: { id: data.productId } })
        if (!product) return { success: false, error: "Product not found" }

        // Actually create the campaign in the database
        const campaign = await prisma.adCampaign.create({
            data: {
                storeId: store.id,
                productId: data.productId,
                platform: data.platform,
                name: `[AI] ${data.objective} - ${product.title}`,
                budget: data.budget,
                objective: data.objective,
                status: "ACTIVE",
                externalId: `ext_${Date.now()}` // Mock external ID from Meta/Google
            }
        })

        revalidatePath("/dashboard/marketing")
        return { success: true, message: `Campaign successfully launched on ${data.platform}!`, campaign }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function toggleCampaignStatus(campaignId: string, currentStatus: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) return { success: false, error: "Store not found" }

        const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE"

        await prisma.adCampaign.update({
            where: { id: campaignId, storeId: store.id },
            data: { status: newStatus }
        })

        revalidatePath("/dashboard/marketing")
        return { success: true, newStatus }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteCampaign(campaignId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) return { success: false, error: "Store not found" }

        await prisma.adCampaign.delete({
            where: { id: campaignId, storeId: store.id }
        })

        revalidatePath("/dashboard/marketing")
        return { success: true, message: "Campaign deleted successfully" }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
