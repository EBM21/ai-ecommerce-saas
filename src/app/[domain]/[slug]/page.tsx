import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ThemeConfig, deepMerge } from "@/types/theme-types"
import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react"
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
        hero: { show: false, headline: "", subheadline: "", buttonText: "", buttonUrl: "", bgImage: "", showBadge: false, badgeText: "", showSecondaryBtn: false, secondaryBtnText: "" },
        features: { show: false, title: "", subtitle: "", items: [] },
        productsSection: { show: false, title: "", subtitle: "", count: 0, showViewAll: false, viewAllText: "" },
        testimonials: { show: false, title: "", items: [] },
        faq: { show: false, title: "", items: [] },
        cta: { show: false, headline: "", subtext: "", buttonText: "", buttonUrl: "" },
        banner: { show: false, text: "", bgColor: "", textColor: "" },
        aiAssistant: { show: false, name: "", welcomeMessage: "", primaryColor: "" },
        footer: { text: "", showSocial: false, links: [], bgColor: "" },
        styles: { bgColor: "#030305", textColor: "#f0eff8", cardBg: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" },
        customPages: [
            { slug: "about", title: "About Us", content: "<p>Welcome to our store. We provide the best products.</p>" }
        ],
        blocks: [],
        pageBlocks: {}
    }
}

function getImg(p: any) {
    try {
        if (!p.images) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
        return imgs?.enhanced || imgs?.raw || (Array.isArray(imgs) ? imgs[0] : imgs) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    } catch { return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }
}

export default async function DynamicStorePage({
    params,
}: {
    params: Promise<{ domain: string, slug: string }>
}) {
    const { domain, slug } = await params

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

    const { styles, layoutId, customPages, mode, blocks, pageBlocks } = theme
    const rawProducts = store.products || []

    // ── SERIALIZE PRODUCTS FOR CLIENT COMPONENTS ──
    const products = rawProducts.map(p => ({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }))

    // ── CHECK FOR BUILDER PAGE BLOCKS (highest priority) ──
    // If this slug has builder blocks saved via the visual builder, render them
    const slugBlocks = pageBlocks?.[slug]
    if (slugBlocks !== undefined) {
        // Dynamic Global Header/Footer Injection
        const allBlocks = [...(blocks || []), ...Object.values(pageBlocks || {}).flat()]
        const globalHeader = allBlocks.find((b: any) => b.type?.startsWith('header-'))
        const globalFooter = allBlocks.find((b: any) => b.type?.startsWith('footer-'))
        
        let finalBlocks = [...slugBlocks]
        if (globalHeader && !finalBlocks.some(b => b.type.startsWith('header-'))) {
            finalBlocks.unshift(globalHeader)
        }
        if (globalFooter && !finalBlocks.some(b => b.type.startsWith('footer-'))) {
            finalBlocks.push(globalFooter)
        }

        return (
            <div className="flex flex-col min-h-screen">
                <VisualBuilderRenderer
                    theme={theme}
                    blocks={finalBlocks}
                    products={products}
                    domain={domain}
                    baseUrl={baseUrl}
                />
            </div>
        )
    }

    // ── NATIVE COLLECTION PAGE ──
    if (slug === 'collection') {        
        if (blocks && blocks.length > 0) {
            return <VisualBuilderRenderer theme={theme} blocks={blocks} products={products} domain={domain} baseUrl={baseUrl} />
        }

        return (
            <div className="flex-1 py-20 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4" style={{ fontFamily: layoutId === 'enigma' ? 'italic' : 'inherit', textTransform: layoutId === 'minimal' ? 'uppercase' : 'none' }}>
                            All Products
                        </h1>
                        <p className="text-xl opacity-50">Browse our complete catalog.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map(p => (
                        <Link key={p.id} href={`${baseUrl}/product/${p.id}`} className="no-underline group block transition-transform hover:-translate-y-2">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border relative mb-4 shadow-sm group-hover:shadow-xl transition-all" style={{ borderColor: styles.borderColor, background: styles.cardBg }}>
                                <img src={getImg(p)} alt={p.title} className="w-full h-full object-cover grayscale-0 transition-all duration-700 group-hover:scale-105" />
                            </div>
                            <h3 className="font-bold text-lg mb-1" style={{ color: styles.textColor }}>{p.title}</h3>
                            <p className="font-medium opacity-60">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))}</p>
                        </Link>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <p>No products found in this collection.</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // ── CUSTOM DYNAMIC PAGES (legacy content) ──
    const customPage = customPages?.find((p: any) => p.slug === slug)
    
    if (!customPage) {
        notFound()
    }

    return (
        <div className="flex-1 py-20 px-6 max-w-4xl mx-auto w-full">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 border-b pb-8" style={{ borderColor: styles.borderColor }}>
                {customPage.title}
            </h1>
            <div 
                className="prose prose-lg dark:prose-invert max-w-none" 
                style={{ color: styles.textColor }}
                dangerouslySetInnerHTML={{ __html: customPage.content }} 
            />
        </div>
    )
}
