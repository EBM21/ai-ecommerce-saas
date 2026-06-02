// src/types/theme.ts
// ─── Single source of truth for ThemeConfig ──────────────────────────────────
// Import this in both customizer and storefront to keep types in sync.

export type NavLink = { label: string; href: string }

export type ThemeConfig = {
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

export function deepMerge(target: any, source: any): any {
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