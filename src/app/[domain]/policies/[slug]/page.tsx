import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ThemeConfig, deepMerge } from "@/types/theme-types"
import { getBaseUrl } from "@/lib/get-base-url"

export const dynamic = 'force-dynamic'

export default async function PolicyPage({
    params,
}: {
    params: Promise<{ domain: string, slug: string }>
}) {
    const { domain, slug } = await params

    const store = await prisma.store.findFirst({
        where: { OR: [{ subdomain: domain }, { customDomain: domain }] },
    })

    if (!store) notFound()

    // Parse policies
    let policies: any = { privacy: "", refund: "", terms: "", shipping: "" }
    if (store.policies) {
        try {
            policies = typeof store.policies === 'string'
                ? JSON.parse(store.policies as string)
                : store.policies
        } catch (e) {}
    }

    const content = policies[slug as keyof typeof policies]
    
    if (!content) {
        notFound()
    }

    // Parse & merge config for styles
    let theme: any = null
    if (store.themeConfig) {
        try {
            theme = typeof store.themeConfig === 'string'
                ? JSON.parse(store.themeConfig as string)
                : store.themeConfig
        } catch (e) {}
    }

    const styles = theme?.styles || { bgColor: "#ffffff", textColor: "#000000", borderColor: "rgba(0,0,0,0.1)" }

    const titles: Record<string, string> = {
        privacy: "Privacy Policy",
        refund: "Refund Policy",
        terms: "Terms of Service",
        shipping: "Shipping Policy"
    }

    return (
        <div className="flex-1 py-20 px-6 max-w-4xl mx-auto w-full min-h-screen">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-12 border-b pb-8" style={{ borderColor: styles.borderColor }}>
                {titles[slug] || "Policy"}
            </h1>
            <div 
                className="prose prose-lg dark:prose-invert max-w-none whitespace-pre-line leading-relaxed font-medium" 
                style={{ color: styles.textColor }}
            >
                {content}
            </div>
        </div>
    )
}
