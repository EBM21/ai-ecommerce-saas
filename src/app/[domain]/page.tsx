import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { NovaLayout, MinimalLayout, EnigmaLayout } from '@/components/store-layouts'
import { ThemeConfig, deepMerge } from "@/types/theme-types"
import { getBaseUrl } from "@/lib/get-base-url"
import { VisualBuilderRenderer } from '@/components/visual-builder-renderer'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────
function getDefaultConfig(storeName: string): ThemeConfig {
    return {
        mode: 'theme',
        layoutId: 'nova',
        branding: {
            storeName,
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
        hero: {
            show: true,
            headline: "Premium Essentials",
            subheadline: `Discover the finest collection from ${storeName}.`,
            buttonText: "Shop Now",
            buttonUrl: "/collection",
            bgImage: "",
            showBadge: true,
            badgeText: "New Collection",
            showSecondaryBtn: true,
            secondaryBtnText: "Our Story",
        },
        features: {
            show: true,
            title: "Why Choose Us",
            subtitle: "Built different, for people who care.",
            items: [
                { icon: "⚡", title: "Fast Delivery", desc: "Same day shipping available" },
                { icon: "🔒", title: "Secure Payment", desc: "256-bit SSL encryption" },
                { icon: "♻️", title: "Easy Returns", desc: "30-day hassle-free returns" },
            ],
        },
        productsSection: {
            show: true,
            title: "New Arrivals",
            subtitle: "Curated selections updated weekly.",
            count: 8,
            showViewAll: true,
            viewAllText: "View Catalog",
        },
        testimonials: {
            show: true,
            title: "Loved by Customers",
            items: [
                { name: "Sarah K.", role: "Verified Buyer", text: "Absolutely love this product! Best purchase I made this year.", rating: 5 },
                { name: "Ahmed R.", role: "Verified Buyer", text: "Premium quality, fast delivery. Will order again.", rating: 5 },
                { name: "Maria L.", role: "Verified Buyer", text: "The packaging was beautiful and product exceeded expectations.", rating: 5 },
            ],
        },
        faq: {
            show: false,
            title: "Frequently Asked Questions",
            items: [
                { q: "What is your return policy?", a: "We offer 30-day free returns." },
                { q: "How long does shipping take?", a: "Standard delivery takes 3-5 business days." },
            ],
        },
        cta: {
            show: true,
            headline: "Ready to get started?",
            subtext: "Join thousands of happy customers.",
            buttonText: "Shop Now",
            buttonUrl: "/collection",
        },
        banner: {
            show: false,
            text: "🎉 Free shipping on orders over $50! Use code: FREESHIP",
            bgColor: "#6366f1",
            textColor: "#ffffff",
        },
        aiAssistant: {
            show: true,
            name: "Shop Assistant",
            welcomeMessage: "Hello! How can I help you find the perfect product today?",
            primaryColor: "#6366f1",
        },
        footer: {
            text: `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`,
            showSocial: true,
            links: [
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
            ],
            bgColor: "#030305",
        },
        styles: {
            bgColor: "#030305",
            textColor: "#f0eff8",
            cardBg: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.08)",
        },
        customPages: [
            { slug: "about", title: "About Us", content: "<p>Welcome to our store. We provide the best products.</p>" }
        ],
        blocks: []
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default async function StorefrontHomepage({
    params,
}: {
    params: Promise<{ domain: string }>
}) {
    const { domain } = await params

    const store = await prisma.store.findFirst({
        where: { OR: [{ subdomain: domain }, { customDomain: domain }] },
        include: {
            products: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!store) notFound()

    const rawProducts = store.products || []

    // ── SERIALIZE PRODUCTS FOR CLIENT COMPONENTS ──
    const products = rawProducts.map(p => ({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }))

    const baseUrl = await getBaseUrl(domain)
    
    // Parse & merge config
    const defaults = getDefaultConfig(store.name)
    let theme: ThemeConfig = defaults
    if (store.themeConfig) {
        try {
            const raw = typeof store.themeConfig === 'string'
                ? JSON.parse(store.themeConfig as string)
                : store.themeConfig
            theme = deepMerge(defaults, raw) as ThemeConfig
        } catch (e) {
            console.error("Theme parse error:", e)
        }
    }

    const { layoutId, mode, blocks, pageBlocks } = theme

    // Prefer pageBlocks.home (multi-page builder), then fallback to legacy blocks
    const homeBlocks = pageBlocks?.['home'] ?? blocks

    return (
        <>
            <style>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
                :root {
                    --primary: ${theme.branding.primaryColor};
                    --background: ${theme.styles.bgColor};
                    --foreground: ${theme.styles.textColor};
                }
            `}</style>
            
            {homeBlocks && homeBlocks.length > 0 ? (
                <VisualBuilderRenderer theme={theme} blocks={homeBlocks} products={products} domain={domain} baseUrl={baseUrl} />
            ) : (
                <>
                    {layoutId === 'minimal' ? (
                        <MinimalLayout theme={theme} products={products} domain={domain} baseUrl={baseUrl} />
                    ) : layoutId === 'enigma' ? (
                        <EnigmaLayout theme={theme} products={products} domain={domain} baseUrl={baseUrl} />
                    ) : (
                        <NovaLayout theme={theme} products={products} domain={domain} baseUrl={baseUrl} />
                    )}
                </>
            )}
        </>
    )
}
