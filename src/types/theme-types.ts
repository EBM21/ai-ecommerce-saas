// src/types/theme-types.ts
// ─── Single source of truth for Visual Builder & Themes ──────────────────────

export type NavLink = { label: string; href: string }

export type AnimationType = 'none' | 'fade-in' | 'slide-up' | 'zoom-in' | 'bounce' | 'rotate'
export type HoverEffect = 'none' | 'scale' | 'glow' | 'lift' | 'grayscale-to-color'

export interface BuilderBlock {
    id: string
    type: string // 'hero' | 'features' | 'products' | 'testimonial' | 'faq' | 'cta' | 'video' | 'newsletter'
    props: Record<string, any>
    animation?: {
        entrance: AnimationType
        hover: HoverEffect
        delay?: number
    }
    styles?: {
        // Spacing
        paddingTop?: string
        paddingBottom?: string
        paddingLeft?: string
        paddingRight?: string
        marginTop?: string
        marginBottom?: string
        // Sizing
        maxWidth?: string
        minHeight?: string
        // Background
        backgroundColor?: string
        backgroundImage?: string
        backgroundSize?: string
        backgroundPosition?: string
        // Text
        textColor?: string
        fontFamily?: string
        fontSize?: string
        fontWeight?: string
        letterSpacing?: string
        lineHeight?: string
        // Border
        borderRadius?: string
        borderColor?: string
        borderWidth?: string
        // Effects
        opacity?: string
        boxShadow?: string
    }
}

export interface ThemeConfig {
    mode: 'theme' | 'builder' // Added to switch between old theme-presets and new free-form builder
    layoutId: 'nova' | 'minimal' | 'enigma'
    
    // Legacy Theme Config (Preserved for compatibility)
    branding: {
        storeName: string
        logoUrl: string
        primaryColor: string
        secondaryColor: string
        fontFamily: string
        favicon: string
        currency?: string
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
    aiAssistant: {
        show: boolean
        name: string
        welcomeMessage: string
        primaryColor: string
    }
    footer: {
        text: string
        showSocial: boolean
        links: NavLink[]
        bgColor?: string
    }
    styles: {
        bgColor: string
        textColor: string
        cardBg: string
        borderColor: string
        // Global typography & colors
        headingFont?: string
        bodyFont?: string
        primaryColor?: string
        secondaryColor?: string
        accentColor?: string
    }
    customPages: {
        slug: string
        title: string
        content: string
    }[]

    // 🚀 BUILDER BLOCKS 🚀
    blocks: BuilderBlock[] // Homepage blocks (legacy compat)
    
    // 🚀 MULTI-PAGE BLOCKS 🚀
    // Maps page slug → builder blocks (e.g. 'home', 'about', 'contact', etc.)
    pageBlocks?: Record<string, BuilderBlock[]>
}

export function deepMerge(target: any, source: any) {
    const result = { ...target }
    if (!source) return result

    for (const key in source) {
        const sourceVal = source[key]
        const targetVal = target[key]

        if (sourceVal && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
            result[key] = deepMerge(targetVal ?? {}, sourceVal)
        } else if (sourceVal !== undefined) {
            result[key] = sourceVal
        }
    }
    return result
}
