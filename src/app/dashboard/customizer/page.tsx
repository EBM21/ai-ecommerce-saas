import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import VisualBuilder from "./builder-client"
import { ThemeConfig, deepMerge } from "@/types/theme-types"

export default async function CustomizerPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const store = await prisma.store.findFirst({
        where: { ownerId: user.id },
        include: { products: { where: { status: 'ACTIVE' }, take: 8 } }
    })

    if (!store) redirect("/dashboard/settings")

    // Default configuration for the builder
    const defaults: ThemeConfig = {
        mode: 'theme',
        layoutId: 'nova',
        branding: {
            storeName: store.name,
            logoUrl: "",
            primaryColor: "#6366f1",
            secondaryColor: "#8b5cf6",
            fontFamily: "Inter",
            favicon: "",
            currency: "USD",
        },
        navigation: {
            links: [
                { label: "Home", href: "/" },
                { label: "Shop", href: "/collection" },
                { label: "About", href: "/about" },
            ],
            showCart: true,
            sticky: true,
        },
        hero: { show: true, headline: "Premium Essentials", subheadline: "Built for performance.", buttonText: "Shop Now", buttonUrl: "/collection", bgImage: "", showBadge: true, badgeText: "New", showSecondaryBtn: false, secondaryBtnText: "" },
        features: { show: true, title: "Quality Guaranteed", subtitle: "Why we lead.", items: [] },
        productsSection: { show: true, title: "Our Products", subtitle: "Best sellers.", count: 8, showViewAll: true, viewAllText: "All" },
        testimonials: { show: false, title: "", items: [] },
        faq: { show: false, title: "", items: [] },
        cta: { show: true, headline: "Join us", subtext: "", buttonText: "Sign Up", buttonUrl: "/login" },
        banner: { show: false, text: "", bgColor: "", textColor: "" },
        aiAssistant: { show: true, name: "AI bot", welcomeMessage: "", primaryColor: "" },
        footer: { text: `© ${new Date().getFullYear()} ${store.name}`, showSocial: true, links: [] },
        styles: { bgColor: "#ffffff", textColor: "#000000", cardBg: "#f9fafb", borderColor: "rgba(0,0,0,0.1)" },
        customPages: [],
        blocks: []
    }

    let config = defaults
    if (store.themeConfig) {
        try {
            const raw = typeof store.themeConfig === 'string' 
                ? JSON.parse(store.themeConfig as string) 
                : store.themeConfig
            config = deepMerge(defaults, raw) as ThemeConfig
            
            // Auto-switch to builder mode if blocks exist
            if (config.blocks && config.blocks.length > 0 && !raw.mode) {
                config.mode = 'builder'
            }
        } catch (e) {
            console.error("Theme parse error", e)
        }
    }

    // ── SERIALIZE PRODUCTS ──
    const serializedProducts = store.products.map(p => ({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }))

    return (
        <VisualBuilder 
            initialConfig={config} 
            products={serializedProducts} 
            storeId={store.id}
            storeDomain={store.subdomain}
        />
    )
}
