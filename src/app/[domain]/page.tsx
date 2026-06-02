import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ArrowRight, ShoppingBag, Sparkles, Star, Shield, Globe, ChevronDown } from 'lucide-react'
import Link from 'next/link'

// ─────────────────────────────────────────────────────────────────────────────
// Same ThemeConfig type as customizer — single source of truth
// (In production, move this to a shared types file e.g. @/types/theme.ts)
// ─────────────────────────────────────────────────────────────────────────────
type NavLink = { label: string; href: string }

type ThemeConfig = {
    branding: {
        storeName: string
        logoUrl: string
        primaryColor: string
        secondaryColor: string
        fontFamily: string
        favicon: string
    }
    navigation: {
        links: NavLink[]
        showCart: boolean
        sticky: boolean
    }
    hero: {
        show: boolean
        headline: string
        subheadline: string
        buttonText: string
        buttonUrl: string
        bgImage: string
        showBadge: boolean
        badgeText: string
        showSecondaryBtn: boolean
        secondaryBtnText: string
    }
    features: {
        show: boolean
        title: string
        subtitle: string
        items: { icon: string; title: string; desc: string }[]
    }
    productsSection: {
        show: boolean
        title: string
        subtitle: string
        count: number
        showViewAll: boolean
        viewAllText: string
    }
    testimonials: {
        show: boolean
        title: string
        items: { name: string; role: string; text: string; rating: number }[]
    }
    faq: {
        show: boolean
        title: string
        items: { q: string; a: string }[]
    }
    cta: {
        show: boolean
        headline: string
        subtext: string
        buttonText: string
        buttonUrl: string
    }
    banner: {
        show: boolean
        text: string
        bgColor: string
        textColor: string
    }
    footer: {
        text: string
        showSocial: boolean
        links: NavLink[]
        bgColor: string
    }
    styles: {
        bgColor: string
        textColor: string
        cardBg: string
        borderColor: string
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS (same as customizer so fallback is always consistent)
// ─────────────────────────────────────────────────────────────────────────────
function getDefaultConfig(storeName: string): ThemeConfig {
    return {
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
                { q: "What is your return policy?", a: "We offer 30-day hassle-free returns on all products." },
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
    }
}

function deepMerge(target: any, source: any): any {
    if (!source) return target
    const result = { ...target }
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] ?? {}, source[key])
        } else if (source[key] !== undefined) {
            result[key] = source[key]
        }
    }
    return result
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

    const products = store.products
    const featuredProduct = products[0]

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

    const { branding, navigation, hero, features, productsSection, testimonials, faq, cta, banner, footer, styles } = theme
    const primary = branding.primaryColor

    return (
        <div
            style={{
                fontFamily: `'${branding.fontFamily}', system-ui, sans-serif`,
                background: styles.bgColor,
                color: styles.textColor,
            }}
            className="min-h-screen flex flex-col"
        >
            {/* ── GOOGLE FONTS ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=${branding.fontFamily.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900&display=swap');
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
                .faq-item summary { cursor: pointer; list-style: none; }
                .faq-item summary::-webkit-details-marker { display: none; }
            `}</style>

            {/* ── PROMO BANNER ── */}
            {banner.show && (
                <div style={{ background: banner.bgColor, color: banner.textColor, padding: "10px 24px", textAlign: "center", fontSize: 14, fontWeight: 600 }}>
                    {banner.text}
                </div>
            )}

            {/* ── HEADER ── */}
            <header
                className={navigation.sticky ? "sticky top-0 z-50" : ""}
                style={{
                    borderBottom: `1px solid ${styles.borderColor}`,
                    background: `color-mix(in srgb, ${styles.bgColor} 85%, transparent)`,
                    backdropFilter: "blur(20px)",
                }}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 no-underline" style={{ color: styles.textColor }}>
                        {branding.logoUrl ? (
                            <img src={branding.logoUrl} alt={branding.storeName} className="h-9 object-contain" />
                        ) : (
                            <div
                                className="size-10 rounded-xl flex items-center justify-center font-black text-lg text-white"
                                style={{ background: primary }}
                            >
                                {branding.storeName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="font-extrabold text-xl tracking-tight">{branding.storeName}</span>
                    </Link>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navigation.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="text-sm font-semibold transition-colors"
                                style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Cart */}
                    {navigation.showCart && (
                        <button className="relative" style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                            <ShoppingBag className="size-5" />
                            <span
                                className="absolute -top-1.5 -right-1.5 size-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                                style={{ background: primary }}
                            >0</span>
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1">

                {/* ── HERO ── */}
                {hero.show && (
                    <section
                        className="relative min-h-[85vh] flex items-center border-b"
                        style={{
                            borderColor: styles.borderColor,
                            backgroundImage: hero.bgImage ? `url(${hero.bgImage})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        {hero.bgImage && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />}

                        {/* Glow */}
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none opacity-20"
                            style={{ background: `radial-gradient(ellipse at top, ${primary}, transparent 60%)` }}
                        />

                        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full py-24">
                            <div>
                                {/* Badge */}
                                {hero.showBadge && (
                                    <div
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold mb-6 uppercase tracking-widest"
                                        style={{ borderColor: styles.borderColor, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                                    >
                                        <span className="size-2 rounded-full" style={{ background: primary, animation: "pulse 2s infinite" }} />
                                        {hero.badgeText}
                                    </div>
                                )}

                                {/* Headline */}
                                <h1
                                    className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.03]"
                                    style={{ background: "linear-gradient(to right, #fff, rgba(255,255,255,0.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                                >
                                    {hero.headline}
                                </h1>

                                <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                                    {hero.subheadline}
                                </p>

                                <div className="flex items-center gap-4 flex-wrap">
                                    <Link
                                        href={hero.buttonUrl}
                                        className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-2xl text-sm transition-transform active:scale-95 no-underline"
                                        style={{ background: "#fff", color: "#000", boxShadow: "0 0 30px rgba(255,255,255,0.15)" }}
                                    >
                                        {hero.buttonText} <ArrowRight className="size-4" />
                                    </Link>
                                    {hero.showSecondaryBtn && (
                                        <button
                                            className="px-8 py-4 font-bold rounded-2xl border text-sm transition-colors"
                                            style={{ borderColor: styles.borderColor, color: "rgba(255,255,255,0.7)", background: "transparent", cursor: "pointer" }}
                                        >
                                            {hero.secondaryBtnText}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Featured Product Card */}
                            <div
                                className="relative rounded-[2.5rem] overflow-hidden border group"
                                style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.02)", borderColor: styles.borderColor }}
                            >
                                {featuredProduct ? (
                                    <>
                                        <img
                                            src={(() => {
                                                try {
                                                    const imgs = typeof featuredProduct.images === 'string' ? JSON.parse(featuredProduct.images) : featuredProduct.images as any
                                                    return imgs?.enhanced || imgs?.raw || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
                                                } catch { return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }
                                            })()}
                                            alt="Featured"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div
                                            className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl flex justify-between items-center border"
                                            style={{ background: `${styles.bgColor}cc`, backdropFilter: "blur(12px)", borderColor: styles.borderColor }}
                                        >
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Featured</p>
                                                <p className="font-bold text-white">{featuredProduct.title}</p>
                                            </div>
                                            <Link
                                                href={`/${domain}/product/${featuredProduct.id}`}
                                                className="size-10 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 transition-transform no-underline"
                                            >
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                        <Sparkles className="size-12 mb-4" style={{ color: "rgba(255,255,255,0.1)" }} />
                                        <p style={{ color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>Store visuals loading...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── TRUST MARQUEE ── */}
                <div className="w-full border-b py-5 overflow-hidden flex" style={{ borderColor: styles.borderColor, background: "rgba(255,255,255,0.01)" }}>
                    <div className="flex items-center gap-12 px-6 whitespace-nowrap" style={{ animation: "marquee 20s linear infinite" }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
                                <Star className="size-4" style={{ color: `${primary}80` }} /> Premium Quality
                                <span className="mx-4" style={{ color: "rgba(255,255,255,0.1)" }}>•</span>
                                <Shield className="size-4" style={{ color: "#34d39980" }} /> Secure Checkout
                                <span className="mx-4" style={{ color: "rgba(255,255,255,0.1)" }}>•</span>
                                <Globe className="size-4" style={{ color: "#60a5fa80" }} /> Global Shipping
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FEATURES ── */}
                {features.show && (
                    <section className="py-24 border-b" style={{ borderColor: styles.borderColor }}>
                        <div className="max-w-7xl mx-auto px-6">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: primary }}>Why Us</p>
                            <h2 className="text-4xl font-extrabold tracking-tight mb-3">{features.title}</h2>
                            <p className="text-lg mb-12" style={{ color: "rgba(255,255,255,0.4)" }}>{features.subtitle}</p>
                            <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(features.items.length, 4)}`}>
                                {features.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="p-6 rounded-2xl border transition-all"
                                        style={{ background: styles.cardBg, borderColor: styles.borderColor }}
                                    >
                                        <div className="text-3xl mb-4">{item.icon}</div>
                                        <h3 className="font-bold text-base mb-2">{item.title}</h3>
                                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── PRODUCTS GRID ── */}
                {productsSection.show && (
                    <section id="collection" className="py-24 border-b" style={{ borderColor: styles.borderColor }}>
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col md:flex-row items-end justify-between mb-14 gap-6">
                                <div>
                                    <h2 className="text-4xl font-extrabold tracking-tight mb-2">{productsSection.title}</h2>
                                    <p className="text-lg" style={{ color: "rgba(255,255,255,0.4)" }}>{productsSection.subtitle}</p>
                                </div>
                                {productsSection.showViewAll && (
                                    <Link
                                        href={`/${domain}/collection`}
                                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full border no-underline"
                                        style={{ borderColor: styles.borderColor, color: styles.textColor, background: styles.cardBg }}
                                    >
                                        {productsSection.viewAllText} <ArrowRight className="size-4" />
                                    </Link>
                                )}
                            </div>

                            {products.length === 0 ? (
                                <div className="text-center py-32 rounded-[2.5rem] border border-dashed" style={{ background: styles.cardBg, borderColor: styles.borderColor }}>
                                    <ShoppingBag className="size-16 mx-auto mb-6" style={{ color: "rgba(255,255,255,0.15)" }} />
                                    <h3 className="text-xl font-bold mb-2">No products yet</h3>
                                    <p style={{ color: "rgba(255,255,255,0.4)" }}>Products are being sourced. Check back soon.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {products.slice(0, productsSection.count).map(product => {
                                        let displayImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
                                        try {
                                            const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images as any
                                            displayImage = imgs?.enhanced || imgs?.raw || displayImage
                                        } catch { }
                                        return (
                                            <Link key={product.id} href={`/${domain}/product/${product.id}`} className="group block no-underline">
                                                <div
                                                    className="p-3 rounded-[2rem] border transition-all duration-300 group-hover:border-white/20"
                                                    style={{ background: styles.cardBg, borderColor: styles.borderColor }}
                                                >
                                                    <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-4 relative" style={{ background: "rgba(255,255,255,0.03)" }}>
                                                        <img
                                                            src={displayImage}
                                                            alt={product.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div
                                                            className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold"
                                                            style={{ background: `${styles.bgColor}cc`, backdropFilter: "blur(8px)", color: styles.textColor }}
                                                        >
                                                            ${Number(product.price).toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="px-2 pb-2">
                                                        <h3 className="font-bold text-sm line-clamp-1 mb-1" style={{ color: styles.textColor }}>{product.title}</h3>
                                                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>In Stock: {product.inventoryCount}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ── TESTIMONIALS ── */}
                {testimonials.show && (
                    <section className="py-24 border-b" style={{ background: "rgba(0,0,0,0.2)", borderColor: styles.borderColor }}>
                        <div className="max-w-7xl mx-auto px-6">
                            <h2 className="text-4xl font-extrabold tracking-tight text-center mb-14">{testimonials.title}</h2>
                            <div className={`grid gap-6 grid-cols-1 md:grid-cols-${Math.min(testimonials.items.length, 3)}`}>
                                {testimonials.items.map((review, i) => (
                                    <div
                                        key={i}
                                        className="p-8 rounded-[2rem] border"
                                        style={{ background: styles.cardBg, borderColor: styles.borderColor }}
                                    >
                                        <div className="flex items-center gap-1 mb-5">
                                            {Array.from({ length: review.rating }).map((_, s) => (
                                                <Star key={s} className="size-4 fill-[#c9a96e] text-[#c9a96e]" />
                                            ))}
                                        </div>
                                        <p className="leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>"{review.text}"</p>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="size-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                                                style={{ background: primary }}
                                            >
                                                {review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{review.name}</p>
                                                <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{review.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── FAQ ── */}
                {faq.show && (
                    <section className="py-24 border-b" style={{ borderColor: styles.borderColor }}>
                        <div className="max-w-3xl mx-auto px-6">
                            <h2 className="text-4xl font-extrabold tracking-tight text-center mb-12">{faq.title}</h2>
                            <div className="flex flex-col gap-3">
                                {faq.items.map((item, i) => (
                                    <details
                                        key={i}
                                        className="faq-item group p-5 rounded-2xl border"
                                        style={{ background: styles.cardBg, borderColor: styles.borderColor }}
                                    >
                                        <summary className="flex items-center justify-between font-bold text-base">
                                            {item.q}
                                            <ChevronDown className="size-4 shrink-0 ml-4 transition-transform group-open:rotate-180" style={{ color: primary }} />
                                        </summary>
                                        <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── CTA ── */}
                {cta.show && (
                    <section className="py-24 border-b" style={{ borderColor: styles.borderColor }}>
                        <div className="max-w-2xl mx-auto px-6 text-center">
                            <h2 className="text-4xl font-black tracking-tight mb-4">{cta.headline}</h2>
                            <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>{cta.subtext}</p>
                            <Link
                                href={cta.buttonUrl}
                                className="inline-flex items-center gap-2 px-10 py-4 font-bold rounded-2xl text-sm text-white no-underline transition-opacity hover:opacity-90"
                                style={{ background: `linear-gradient(135deg, ${primary}, ${branding.secondaryColor})`, boxShadow: `0 0 40px ${primary}40` }}
                            >
                                {cta.buttonText} <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>
                )}

            </main>

            {/* ── FOOTER ── */}
            <footer style={{ background: footer.bgColor, borderTop: `1px solid ${styles.borderColor}` }}>
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: primary }}>
                                {branding.storeName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>{branding.storeName}</span>
                        </div>

                        {/* Footer Links */}
                        <div className="flex items-center gap-6 flex-wrap justify-center">
                            {footer.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.href}
                                    className="text-xs font-medium no-underline hover:opacity-100 transition-opacity"
                                    style={{ color: "rgba(255,255,255,0.35)" }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Copyright */}
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{footer.text}</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}