"use client"
// src/app/dashboard/customizer/page.tsx
// ─── COMPLETE REWRITE — Single source of truth ───────────────────────────────

import { useState, useEffect } from "react"
import {
    ChevronLeft, Save, Monitor, Smartphone, Tablet,
    Plus, Trash2, ArrowUp, ArrowDown, Loader2,
    Image as ImageIcon, Layout, Star, MessageSquare,
    Zap, AlignLeft, Grid, Minus, Upload, Check,
    ChevronDown, Eye, EyeOff,
    Palette, Move, X, Link as LinkIcon, Type,
    Settings, Globe, ShoppingBag
} from "lucide-react"
import Link from "next/link"
import { updateThemeConfig, getThemeConfig, uploadThemeImage } from "./action"

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES  (same structure used by live storefront)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: ThemeConfig = {
    branding: {
        storeName: "My Store",
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
        subheadline: "Engineered for modern living. Discover our curated collection.",
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
        text: "© 2024 All rights reserved.",
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

// ─────────────────────────────────────────────────────────────────────────────
// DEEP MERGE HELPER
// ─────────────────────────────────────────────────────────────────────────────
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
// SECTION PANELS (left sidebar sections)
// ─────────────────────────────────────────────────────────────────────────────
type SectionKey =
    | "branding" | "navigation" | "hero" | "features"
    | "products" | "testimonials" | "faq" | "cta"
    | "banner" | "footer" | "styles"

const SECTIONS: { key: SectionKey; label: string; icon: any }[] = [
    { key: "branding", label: "Branding", icon: Palette },
    { key: "navigation", label: "Navigation", icon: LinkIcon },
    { key: "hero", label: "Hero Section", icon: Layout },
    { key: "features", label: "Features", icon: Grid },
    { key: "products", label: "Products Grid", icon: ShoppingBag },
    { key: "testimonials", label: "Testimonials", icon: Star },
    { key: "faq", label: "FAQ", icon: MessageSquare },
    { key: "cta", label: "Call to Action", icon: Zap },
    { key: "banner", label: "Promo Banner", icon: AlignLeft },
    { key: "footer", label: "Footer", icon: Globe },
    { key: "styles", label: "Global Styles", icon: Settings },
]

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdvancedCustomizer() {
    const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG)
    const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
    const [activeSection, setActiveSection] = useState<SectionKey>("branding")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [uploading, setUploading] = useState<string | null>(null)
    const [storeDomain, setStoreDomain] = useState<string>("")

    // Load config from DB
    useEffect(() => {
        getThemeConfig().then(res => {
            if (res?.success && res.config) {
                const raw = typeof res.config === "string" ? JSON.parse(res.config) : res.config
                setConfig(deepMerge(DEFAULT_CONFIG, raw))
            }
            if (res?.domain) setStoreDomain(res.domain)
            setIsLoading(false)
        })
    }, [])

    // Ctrl+S shortcut
    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave() }
        }
        window.addEventListener("keydown", fn)
        return () => window.removeEventListener("keydown", fn)
    }, [config])

    const handleSave = async () => {
        setIsSaving(true)
        const res = await updateThemeConfig(config)
        if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
        setIsSaving(false)
    }

    const handleUpload = async (field: string, file: File) => {
        setUploading(field)
        const fd = new FormData(); fd.append("file", file)
        const res = await uploadThemeImage(fd)
        if (res.success && res.url) {
            const [section, key] = field.split(".")
            setConfig(p => ({
                ...p,
                [section]: { ...(p as any)[section], [key]: res.url }
            }))
        }
        setUploading(null)
    }

    if (isLoading) return (
        <div style={{ height: "100vh", background: "#030305", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 style={{ width: 32, height: 32, color: "#8b5cf6", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    const previewW = device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px"

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", background: "#040408",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#ececf1",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 99px; }
                input, textarea, select { font-family: inherit; color: #ececf1; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            {/* ══════════════════════ LEFT SIDEBAR ══════════════════════ */}
            <div style={{
                width: 260, flexShrink: 0,
                background: "#07071a",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{
                    height: 56, display: "flex", alignItems: "center",
                    padding: "0 14px", gap: 10, flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <Link href="/dashboard" style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 7,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(236,236,241,0.5)", textDecoration: "none",
                    }}>
                        <ChevronLeft style={{ width: 14, height: 14 }} />
                    </Link>
                    <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>Site Builder</span>
                    {storeDomain && (
                        <a
                            href={`/${storeDomain}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                fontSize: 10, color: "rgba(139,92,246,0.7)",
                                textDecoration: "none", fontWeight: 600,
                                padding: "3px 7px", borderRadius: 5,
                                background: "rgba(139,92,246,0.1)",
                                border: "1px solid rgba(139,92,246,0.2)",
                            }}
                        >Live ↗</a>
                    )}
                </div>

                {/* Section Nav */}
                <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                    {SECTIONS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", gap: 9,
                                padding: "9px 11px", borderRadius: 8, marginBottom: 2,
                                background: activeSection === key ? "rgba(139,92,246,0.15)" : "transparent",
                                border: activeSection === key ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                                color: activeSection === key ? "#a78bfa" : "rgba(236,236,241,0.55)",
                                fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                                transition: "all 0.12s", textAlign: "left",
                            }}
                        >
                            <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Save Button */}
                <div style={{ padding: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#07071a" }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            width: "100%", display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 8, padding: "11px",
                            borderRadius: 8, border: "none", cursor: "pointer",
                            background: saved ? "#10b981" : "#6366f1",
                            color: "#fff", fontSize: 13, fontWeight: 700,
                            transition: "all 0.2s",
                        }}
                    >
                        {isSaving ? <Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />
                            : saved ? <Check style={{ width: 15, height: 15 }} />
                                : <Save style={{ width: 15, height: 15 }} />}
                        {isSaving ? "Saving..." : saved ? "Saved!" : "Save & Publish"}
                    </button>
                    <p style={{ textAlign: "center", fontSize: 10, color: "rgba(236,236,241,0.2)", marginTop: 6 }}>
                        Ctrl+S to save
                    </p>
                </div>
            </div>

            {/* ══════════════════════ EDITOR PANEL ══════════════════════ */}
            <div style={{
                width: 320, flexShrink: 0,
                background: "#09091f",
                borderRight: "1px solid rgba(255,255,255,0.05)",
                display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
                <div style={{
                    height: 56, display: "flex", alignItems: "center",
                    padding: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
                }}>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "rgba(236,236,241,0.4)" }}>
                        {SECTIONS.find(s => s.key === activeSection)?.label}
                    </span>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <EditorPanel
                        section={activeSection}
                        config={config}
                        setConfig={setConfig}
                        uploading={uploading}
                        onUpload={handleUpload}
                    />
                </div>
            </div>

            {/* ══════════════════════ PREVIEW CANVAS ══════════════════════ */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0a0a14" }}>
                {/* Toolbar */}
                <div style={{
                    height: 56, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8, flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(4,4,8,0.8)",
                }}>
                    {(["desktop", "tablet", "mobile"] as const).map(d => (
                        <button key={d} onClick={() => setDevice(d)} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "5px 13px", borderRadius: 7,
                            background: device === d ? "rgba(139,92,246,0.15)" : "transparent",
                            border: device === d ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
                            color: device === d ? "#a78bfa" : "rgba(236,236,241,0.35)",
                            fontSize: 11.5, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                        }}>
                            {d === "desktop" ? <Monitor style={{ width: 12, height: 12 }} />
                                : d === "tablet" ? <Tablet style={{ width: 12, height: 12 }} />
                                    : <Smartphone style={{ width: 12, height: 12 }} />}
                            {d}
                        </button>
                    ))}
                </div>

                {/* Canvas */}
                <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "20px", background: "radial-gradient(ellipse at center, #111128 0%, #040408 100%)" }}>
                    <div style={{
                        width: previewW, maxWidth: "100%", margin: "0 auto",
                        background: config.styles.bgColor,
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: device === "mobile" ? 28 : 10,
                        overflow: "hidden",
                        boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
                        transition: "width 0.3s ease",
                        minHeight: 600,
                        color: config.styles.textColor,
                        fontFamily: config.branding.fontFamily,
                    }}>
                        <PreviewRenderer config={config} />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR PANEL — renders fields for the active section
// ─────────────────────────────────────────────────────────────────────────────
function EditorPanel({
    section, config, setConfig, uploading, onUpload
}: {
    section: SectionKey
    config: ThemeConfig
    setConfig: React.Dispatch<React.SetStateAction<ThemeConfig>>
    uploading: string | null
    onUpload: (field: string, file: File) => void
}) {
    const set = (path: string, value: any) => {
        const keys = path.split(".")
        setConfig(prev => {
            const next = { ...prev }
            let cur: any = next
            for (let i = 0; i < keys.length - 1; i++) {
                cur[keys[i]] = { ...cur[keys[i]] }
                cur = cur[keys[i]]
            }
            cur[keys[keys.length - 1]] = value
            return next
        })
    }

    switch (section) {
        // ── BRANDING ──────────────────────────────────────────────────────────
        case "branding": return <>
            <Field label="Store Name">
                <TextInput value={config.branding.storeName} onChange={v => set("branding.storeName", v)} placeholder="My Awesome Store" />
            </Field>
            <Field label="Logo Image">
                <ImageUpload
                    fieldKey="branding.logoUrl"
                    current={config.branding.logoUrl}
                    uploading={uploading}
                    onUpload={onUpload}
                    label="Upload Logo"
                />
            </Field>
            <Field label="Primary Color">
                <ColorInput value={config.branding.primaryColor} onChange={v => set("branding.primaryColor", v)} />
            </Field>
            <Field label="Secondary Color">
                <ColorInput value={config.branding.secondaryColor} onChange={v => set("branding.secondaryColor", v)} />
            </Field>
            <Field label="Font Family">
                <SelectInput
                    value={config.branding.fontFamily}
                    onChange={v => set("branding.fontFamily", v)}
                    options={["Inter", "Playfair Display", "Poppins", "Montserrat", "Roboto", "DM Sans", "Nunito"]}
                />
            </Field>
        </>

        // ── NAVIGATION ────────────────────────────────────────────────────────
        case "navigation": return <>
            <Toggle label="Sticky Header" value={config.navigation.sticky} onChange={v => set("navigation.sticky", v)} />
            <Toggle label="Show Cart Icon" value={config.navigation.showCart} onChange={v => set("navigation.showCart", v)} />
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <label style={labelStyle}>Nav Links</label>
                <p style={{ fontSize: 10.5, color: "rgba(236,236,241,0.3)", marginBottom: 10 }}>Edit label and URL for each link</p>
                {config.navigation.links.map((link, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <TextInput
                                value={link.label}
                                onChange={v => {
                                    const links = [...config.navigation.links]
                                    links[i] = { ...links[i], label: v }
                                    set("navigation.links", links)
                                }}
                                placeholder="Label"
                            />
                            <button
                                onClick={() => set("navigation.links", config.navigation.links.filter((_, j) => j !== i))}
                                style={{ ...iconBtn, color: "#f87171", flexShrink: 0 }}
                            >
                                <X style={{ width: 12, height: 12 }} />
                            </button>
                        </div>
                        <TextInput
                            value={link.href}
                            onChange={v => {
                                const links = [...config.navigation.links]
                                links[i] = { ...links[i], href: v }
                                set("navigation.links", links)
                            }}
                            placeholder="/page-url"
                        />
                    </div>
                ))}
                <button
                    onClick={() => set("navigation.links", [...config.navigation.links, { label: "New Page", href: "/" }])}
                    style={addBtn}
                >
                    <Plus style={{ width: 11, height: 11 }} /> Add Link
                </button>
            </div>
        </>

        // ── HERO ──────────────────────────────────────────────────────────────
        case "hero": return <>
            <Toggle label="Show Hero Section" value={config.hero.show} onChange={v => set("hero.show", v)} />
            <Field label="Headline">
                <TextareaInput value={config.hero.headline} onChange={v => set("hero.headline", v)} rows={2} />
            </Field>
            <Field label="Subheadline">
                <TextareaInput value={config.hero.subheadline} onChange={v => set("hero.subheadline", v)} rows={3} />
            </Field>
            <Field label="Background Image">
                <ImageUpload fieldKey="hero.bgImage" current={config.hero.bgImage} uploading={uploading} onUpload={onUpload} label="Upload BG Image" />
            </Field>
            <Toggle label="Show Badge" value={config.hero.showBadge} onChange={v => set("hero.showBadge", v)} />
            {config.hero.showBadge && (
                <Field label="Badge Text">
                    <TextInput value={config.hero.badgeText} onChange={v => set("hero.badgeText", v)} />
                </Field>
            )}
            <Field label="Primary Button Text">
                <TextInput value={config.hero.buttonText} onChange={v => set("hero.buttonText", v)} />
            </Field>
            <Field label="Primary Button URL">
                <TextInput value={config.hero.buttonUrl} onChange={v => set("hero.buttonUrl", v)} placeholder="/collection" />
            </Field>
            <Toggle label="Show Secondary Button" value={config.hero.showSecondaryBtn} onChange={v => set("hero.showSecondaryBtn", v)} />
            {config.hero.showSecondaryBtn && (
                <Field label="Secondary Button Text">
                    <TextInput value={config.hero.secondaryBtnText} onChange={v => set("hero.secondaryBtnText", v)} />
                </Field>
            )}
        </>

        // ── FEATURES ──────────────────────────────────────────────────────────
        case "features": return <>
            <Toggle label="Show Features Section" value={config.features.show} onChange={v => set("features.show", v)} />
            <Field label="Title"><TextInput value={config.features.title} onChange={v => set("features.title", v)} /></Field>
            <Field label="Subtitle"><TextInput value={config.features.subtitle} onChange={v => set("features.subtitle", v)} /></Field>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <label style={labelStyle}>Feature Items</label>
                {config.features.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <TextInput value={item.icon} onChange={v => {
                                const items = [...config.features.items]; items[i] = { ...items[i], icon: v }
                                set("features.items", items)
                            }} placeholder="Icon emoji" />
                            <button onClick={() => set("features.items", config.features.items.filter((_, j) => j !== i))} style={{ ...iconBtn, color: "#f87171", flexShrink: 0 }}>
                                <X style={{ width: 12, height: 12 }} />
                            </button>
                        </div>
                        <TextInput value={item.title} onChange={v => {
                            const items = [...config.features.items]; items[i] = { ...items[i], title: v }
                            set("features.items", items)
                        }} placeholder="Feature title" />
                        <div style={{ marginTop: 6 }}>
                            <TextInput value={item.desc} onChange={v => {
                                const items = [...config.features.items]; items[i] = { ...items[i], desc: v }
                                set("features.items", items)
                            }} placeholder="Short description" />
                        </div>
                    </div>
                ))}
                <button onClick={() => set("features.items", [...config.features.items, { icon: "✨", title: "New Feature", desc: "Description here" }])} style={addBtn}>
                    <Plus style={{ width: 11, height: 11 }} /> Add Feature
                </button>
            </div>
        </>

        // ── PRODUCTS ──────────────────────────────────────────────────────────
        case "products": return <>
            <Toggle label="Show Products Section" value={config.productsSection.show} onChange={v => set("productsSection.show", v)} />
            <Field label="Section Title"><TextInput value={config.productsSection.title} onChange={v => set("productsSection.title", v)} /></Field>
            <Field label="Section Subtitle"><TextInput value={config.productsSection.subtitle} onChange={v => set("productsSection.subtitle", v)} /></Field>
            <Field label="Products to Show">
                <NumberInput value={config.productsSection.count} onChange={v => set("productsSection.count", v)} min={2} max={24} />
            </Field>
            <Toggle label="Show View All Button" value={config.productsSection.showViewAll} onChange={v => set("productsSection.showViewAll", v)} />
            {config.productsSection.showViewAll && (
                <Field label="View All Button Text">
                    <TextInput value={config.productsSection.viewAllText} onChange={v => set("productsSection.viewAllText", v)} />
                </Field>
            )}
        </>

        // ── TESTIMONIALS ──────────────────────────────────────────────────────
        case "testimonials": return <>
            <Toggle label="Show Testimonials" value={config.testimonials.show} onChange={v => set("testimonials.show", v)} />
            <Field label="Section Title"><TextInput value={config.testimonials.title} onChange={v => set("testimonials.title", v)} /></Field>
            {config.testimonials.items.map((item, i) => (
                <div key={i} style={{ padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <TextInput value={item.name} onChange={v => {
                            const items = [...config.testimonials.items]; items[i] = { ...items[i], name: v }
                            set("testimonials.items", items)
                        }} placeholder="Customer name" />
                        <button onClick={() => set("testimonials.items", config.testimonials.items.filter((_, j) => j !== i))} style={{ ...iconBtn, color: "#f87171", flexShrink: 0 }}>
                            <X style={{ width: 12, height: 12 }} />
                        </button>
                    </div>
                    <TextInput value={item.role} onChange={v => {
                        const items = [...config.testimonials.items]; items[i] = { ...items[i], role: v }
                        set("testimonials.items", items)
                    }} placeholder="Role / Verified Buyer" />
                    <div style={{ marginTop: 6 }}>
                        <TextareaInput value={item.text} onChange={v => {
                            const items = [...config.testimonials.items]; items[i] = { ...items[i], text: v }
                            set("testimonials.items", items)
                        }} rows={2} placeholder="Review text" />
                    </div>
                    <div style={{ marginTop: 6 }}>
                        <NumberInput value={item.rating} onChange={v => {
                            const items = [...config.testimonials.items]; items[i] = { ...items[i], rating: Math.min(5, Math.max(1, v)) }
                            set("testimonials.items", items)
                        }} min={1} max={5} />
                    </div>
                </div>
            ))}
            <button onClick={() => set("testimonials.items", [...config.testimonials.items, { name: "New Customer", role: "Verified Buyer", text: "Great product!", rating: 5 }])} style={addBtn}>
                <Plus style={{ width: 11, height: 11 }} /> Add Review
            </button>
        </>

        // ── FAQ ───────────────────────────────────────────────────────────────
        case "faq": return <>
            <Toggle label="Show FAQ Section" value={config.faq.show} onChange={v => set("faq.show", v)} />
            <Field label="Section Title"><TextInput value={config.faq.title} onChange={v => set("faq.title", v)} /></Field>
            {config.faq.items.map((item, i) => (
                <div key={i} style={{ padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <TextInput value={item.q} onChange={v => {
                            const items = [...config.faq.items]; items[i] = { ...items[i], q: v }
                            set("faq.items", items)
                        }} placeholder="Question" />
                        <button onClick={() => set("faq.items", config.faq.items.filter((_, j) => j !== i))} style={{ ...iconBtn, color: "#f87171", flexShrink: 0 }}>
                            <X style={{ width: 12, height: 12 }} />
                        </button>
                    </div>
                    <TextareaInput value={item.a} onChange={v => {
                        const items = [...config.faq.items]; items[i] = { ...items[i], a: v }
                        set("faq.items", items)
                    }} rows={2} placeholder="Answer" />
                </div>
            ))}
            <button onClick={() => set("faq.items", [...config.faq.items, { q: "New Question?", a: "Answer here." }])} style={addBtn}>
                <Plus style={{ width: 11, height: 11 }} /> Add FAQ
            </button>
        </>

        // ── CTA ───────────────────────────────────────────────────────────────
        case "cta": return <>
            <Toggle label="Show CTA Section" value={config.cta.show} onChange={v => set("cta.show", v)} />
            <Field label="Headline"><TextInput value={config.cta.headline} onChange={v => set("cta.headline", v)} /></Field>
            <Field label="Subtext"><TextInput value={config.cta.subtext} onChange={v => set("cta.subtext", v)} /></Field>
            <Field label="Button Text"><TextInput value={config.cta.buttonText} onChange={v => set("cta.buttonText", v)} /></Field>
            <Field label="Button URL"><TextInput value={config.cta.buttonUrl} onChange={v => set("cta.buttonUrl", v)} placeholder="/collection" /></Field>
        </>

        // ── BANNER ────────────────────────────────────────────────────────────
        case "banner": return <>
            <Toggle label="Show Promo Banner" value={config.banner.show} onChange={v => set("banner.show", v)} />
            <Field label="Banner Text"><TextareaInput value={config.banner.text} onChange={v => set("banner.text", v)} rows={2} /></Field>
            <Field label="Background Color"><ColorInput value={config.banner.bgColor} onChange={v => set("banner.bgColor", v)} /></Field>
            <Field label="Text Color"><ColorInput value={config.banner.textColor} onChange={v => set("banner.textColor", v)} /></Field>
        </>

        // ── FOOTER ────────────────────────────────────────────────────────────
        case "footer": return <>
            <Field label="Footer Text"><TextInput value={config.footer.text} onChange={v => set("footer.text", v)} /></Field>
            <Toggle label="Show Social Links" value={config.footer.showSocial} onChange={v => set("footer.showSocial", v)} />
            <Field label="Footer Background"><ColorInput value={config.footer.bgColor} onChange={v => set("footer.bgColor", v)} /></Field>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <label style={labelStyle}>Footer Links</label>
                {config.footer.links.map((link, i) => (
                    <div key={i} style={{ marginBottom: 8, padding: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                            <TextInput value={link.label} onChange={v => {
                                const links = [...config.footer.links]; links[i] = { ...links[i], label: v }
                                set("footer.links", links)
                            }} placeholder="Label" />
                            <button onClick={() => set("footer.links", config.footer.links.filter((_, j) => j !== i))} style={{ ...iconBtn, color: "#f87171", flexShrink: 0 }}>
                                <X style={{ width: 12, height: 12 }} />
                            </button>
                        </div>
                        <TextInput value={link.href} onChange={v => {
                            const links = [...config.footer.links]; links[i] = { ...links[i], href: v }
                            set("footer.links", links)
                        }} placeholder="/page-url" />
                    </div>
                ))}
                <button onClick={() => set("footer.links", [...config.footer.links, { label: "New Link", href: "/" }])} style={addBtn}>
                    <Plus style={{ width: 11, height: 11 }} /> Add Footer Link
                </button>
            </div>
        </>

        // ── STYLES ────────────────────────────────────────────────────────────
        case "styles": return <>
            <Field label="Page Background"><ColorInput value={config.styles.bgColor} onChange={v => set("styles.bgColor", v)} /></Field>
            <Field label="Text Color"><ColorInput value={config.styles.textColor} onChange={v => set("styles.textColor", v)} /></Field>
            <Field label="Card Background"><ColorInput value={config.styles.cardBg} onChange={v => set("styles.cardBg", v)} /></Field>
            <Field label="Border Color"><ColorInput value={config.styles.borderColor} onChange={v => set("styles.borderColor", v)} /></Field>
        </>

        default: return null
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW RENDERER — shows a live preview of config
// ─────────────────────────────────────────────────────────────────────────────
function PreviewRenderer({ config }: { config: ThemeConfig }) {
    const c = config
    const primary = c.branding.primaryColor

    return (
        <div style={{ fontFamily: c.branding.fontFamily, background: c.styles.bgColor, color: c.styles.textColor, minHeight: 600 }}>
            {/* Promo Banner */}
            {c.banner.show && (
                <div style={{ background: c.banner.bgColor, color: c.banner.textColor, padding: "10px 24px", textAlign: "center", fontSize: 13, fontWeight: 600 }}>
                    {c.banner.text}
                </div>
            )}

            {/* Navbar */}
            <div style={{
                height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 32px", borderBottom: `1px solid ${c.styles.borderColor}`,
                background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {c.branding.logoUrl
                        ? <img src={c.branding.logoUrl} alt="logo" style={{ height: 32, objectFit: "contain" }} />
                        : <div style={{ width: 32, height: 32, borderRadius: 8, background: primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff" }}>
                            {c.branding.storeName.charAt(0).toUpperCase()}
                        </div>
                    }
                    <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "-0.3px" }}>{c.branding.storeName}</span>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                    {c.navigation.links.map((l, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {l.label}
                        </span>
                    ))}
                </div>
                {c.navigation.showCart && (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShoppingBag style={{ width: 16, height: 16, color: "rgba(255,255,255,0.6)" }} />
                    </div>
                )}
            </div>

            {/* Hero */}
            {c.hero.show && (
                <div style={{
                    padding: "80px 32px", minHeight: 380,
                    backgroundImage: c.hero.bgImage ? `url(${c.hero.bgImage})` : undefined,
                    backgroundSize: "cover", backgroundPosition: "center",
                    position: "relative", overflow: "hidden",
                }}>
                    {c.hero.bgImage && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />}
                    <div style={{ position: "relative", zIndex: 1, maxWidth: 560 }}>
                        {c.hero.showBadge && (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, border: `1px solid ${c.styles.borderColor}`, background: "rgba(255,255,255,0.05)", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: primary, display: "inline-block" }} />
                                {c.hero.badgeText}
                            </div>
                        )}
                        <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.05, marginBottom: 16, letterSpacing: "-1px", background: "linear-gradient(to right, #fff, rgba(255,255,255,0.6))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            {c.hero.headline}
                        </h1>
                        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.6 }}>
                            {c.hero.subheadline}
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <span style={{ padding: "12px 24px", borderRadius: 12, background: "#fff", color: "#000", fontWeight: 700, fontSize: 13 }}>
                                {c.hero.buttonText}
                            </span>
                            {c.hero.showSecondaryBtn && (
                                <span style={{ padding: "12px 24px", borderRadius: 12, border: `1px solid ${c.styles.borderColor}`, fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                                    {c.hero.secondaryBtnText}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Features */}
            {c.features.show && (
                <div style={{ padding: "60px 32px", borderTop: `1px solid ${c.styles.borderColor}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: primary, marginBottom: 8 }}>Features</p>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{c.features.title}</h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>{c.features.subtitle}</p>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(c.features.items.length, 3)}, 1fr)`, gap: 16 }}>
                        {c.features.items.map((item, i) => (
                            <div key={i} style={{ padding: 20, borderRadius: 12, background: c.styles.cardBg, border: `1px solid ${c.styles.borderColor}` }}>
                                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Preview */}
            {c.productsSection.show && (
                <div style={{ padding: "60px 32px", borderTop: `1px solid ${c.styles.borderColor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
                        <div>
                            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{c.productsSection.title}</h2>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{c.productsSection.subtitle}</p>
                        </div>
                        {c.productsSection.showViewAll && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {c.productsSection.viewAllText} →
                            </span>
                        )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} style={{ borderRadius: 16, background: c.styles.cardBg, border: `1px solid ${c.styles.borderColor}`, overflow: "hidden" }}>
                                <div style={{ height: 140, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <ShoppingBag style={{ width: 24, height: 24, color: "rgba(255,255,255,0.15)" }} />
                                </div>
                                <div style={{ padding: "12px 14px" }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: "rgba(255,255,255,0.7)" }}>Product {n}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: primary }}>$29.99</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Testimonials */}
            {c.testimonials.show && (
                <div style={{ padding: "60px 32px", borderTop: `1px solid ${c.styles.borderColor}`, background: "rgba(0,0,0,0.2)" }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 28, textAlign: "center" }}>{c.testimonials.title}</h2>
                    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(c.testimonials.items.length, 3)}, 1fr)`, gap: 14 }}>
                        {c.testimonials.items.map((t, i) => (
                            <div key={i} style={{ padding: 20, borderRadius: 14, background: c.styles.cardBg, border: `1px solid ${c.styles.borderColor}` }}>
                                <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                                    {Array.from({ length: t.rating }).map((_, s) => <Star key={s} style={{ width: 12, height: 12, color: "#fbbf24", fill: "#fbbf24" }} />)}
                                </div>
                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 14 }}>"{t.text}"</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700 }}>{t.name}</div>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FAQ */}
            {c.faq.show && (
                <div style={{ padding: "60px 32px", borderTop: `1px solid ${c.styles.borderColor}` }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>{c.faq.title}</h2>
                    <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
                        {c.faq.items.map((f, i) => (
                            <div key={i} style={{ padding: "16px 20px", borderRadius: 12, background: c.styles.cardBg, border: `1px solid ${c.styles.borderColor}` }}>
                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{f.q}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{f.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA */}
            {c.cta.show && (
                <div style={{ padding: "60px 32px", borderTop: `1px solid ${c.styles.borderColor}`, textAlign: "center" }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 10 }}>{c.cta.headline}</h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>{c.cta.subtext}</p>
                    <span style={{ padding: "14px 32px", borderRadius: 12, background: primary, color: "#fff", fontWeight: 700, fontSize: 14 }}>
                        {c.cta.buttonText}
                    </span>
                </div>
            )}

            {/* Footer */}
            <div style={{ padding: "40px 32px 24px", background: c.footer.bgColor, borderTop: `1px solid ${c.styles.borderColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{c.footer.text}</p>
                    <div style={{ display: "flex", gap: 16 }}>
                        {c.footer.links.map((l, i) => (
                            <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{l.label}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = {
    width: "100%", height: 34, borderRadius: 7, padding: "0 10px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
    color: "#ececf1", fontSize: 12.5, outline: "none",
}
const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 10.5, fontWeight: 600,
    color: "rgba(236,236,241,0.4)", textTransform: "uppercase",
    letterSpacing: "0.5px", marginBottom: 6,
}
const iconBtn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 7,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
}
const addBtn: React.CSSProperties = {
    width: "100%", padding: "8px", borderRadius: 7, background: "transparent",
    border: "1px dashed rgba(139,92,246,0.3)", color: "rgba(139,92,246,0.7)",
    fontSize: 11.5, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
    marginTop: 4,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputSt} />
}

function TextareaInput({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
    return <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={{ ...inputSt, height: "auto", resize: "vertical", padding: "8px 10px" }} />
}

function NumberInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
    return <input type="number" value={value} min={min} max={max} onChange={e => onChange(Number(e.target.value))} style={inputSt} />
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", padding: 2 }} />
            <input value={value} onChange={e => onChange(e.target.value)} style={{ ...inputSt, flex: 1, fontFamily: "monospace", fontSize: 11 }} />
        </div>
    )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputSt, cursor: "pointer" }}>
            {options.map(o => <option key={o} value={o} style={{ background: "#07071a" }}>{o}</option>)}
        </select>
    )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>{label}</label>
            <button onClick={() => onChange(!value)} style={{
                width: 38, height: 21, borderRadius: 99, border: "none",
                background: value ? "#8b5cf6" : "rgba(255,255,255,0.1)",
                cursor: "pointer", transition: "background 0.2s", position: "relative", flexShrink: 0,
            }}>
                <span style={{
                    position: "absolute", top: 2.5,
                    left: value ? "calc(100% - 18px)" : 2.5,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "white", transition: "left 0.2s",
                }} />
            </button>
        </div>
    )
}

function ImageUpload({ fieldKey, current, uploading, onUpload, label }: {
    fieldKey: string; current: string; uploading: string | null;
    onUpload: (field: string, file: File) => void; label?: string
}) {
    const isLoading = uploading === fieldKey
    return (
        <label style={{ display: "block", cursor: "pointer" }}>
            <div style={{
                height: 72, borderRadius: 8, border: "2px dashed rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.02)", display: "flex",
                alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
                {isLoading ? (
                    <Loader2 style={{ width: 18, height: 18, color: "#8b5cf6", animation: "spin 1s linear infinite" }} />
                ) : current ? (
                    <img src={current} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: "rgba(236,236,241,0.25)" }}>
                        <Upload style={{ width: 14, height: 14 }} />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>{label ?? "Upload"}</span>
                    </div>
                )}
            </div>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && onUpload(fieldKey, e.target.files[0])} />
        </label>
    )
}