import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Sparkles, Star, Shield, Globe, ChevronDown, CheckCircle2, Zap, Layout, MessageSquare, Plus, User, LogIn, Menu, X, Search, ShoppingCart, Lock } from 'lucide-react'
import { ThemeConfig, NavLink } from '@/types/theme-types'
import { CartButton } from './cart-button'

interface LayoutProps {
    theme: ThemeConfig
    products?: any[]
    domain?: string
    user?: any
    isPreview?: boolean
    children?: React.ReactNode
    baseUrl?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getImg(p: any) {
    try {
        if (!p.images) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images
        return imgs?.enhanced || imgs?.raw || (Array.isArray(imgs) ? imgs[0] : imgs) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    } catch { return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' }
}

const NavLinkItem = ({ href, children, className, isPreview, domain, style, baseUrl = "" }: any) => {
    // Determine base url to use. If isPreview is true, we want it to be empty so it's a relative dummy link.
    const _base = isPreview ? "" : baseUrl
    const finalHref = href.startsWith('http') ? href : `${_base}${href.startsWith('/') ? '' : '/'}${href}`
    if (isPreview) return <span className={className} style={style}>{children}</span>
    return <Link href={finalHref} className={className} style={style}>{children}</Link>
}

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 NOVA THEME (Modern/Glassmorphism/Futuristic)
// ─────────────────────────────────────────────────────────────────────────────
export function NovaHeader({ theme, user, domain, isPreview, baseUrl }: LayoutProps & { baseUrl?: string }) {
    const { branding, navigation, styles } = theme
    const primary = branding.primaryColor

    return (
        <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: styles.borderColor, background: `${styles.bgColor}cc` }}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/" className="flex items-center gap-3 no-underline">
                    {branding.logoUrl ? <img src={branding.logoUrl} className="h-8" /> : <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">{branding.storeName[0]}</div>}
                    <span className="font-bold text-xl tracking-tight" style={{ color: styles.textColor }}>{branding.storeName}</span>
                </NavLinkItem>
                <nav className="hidden md:flex items-center gap-8">
                    {navigation.links.map((l, i) => <NavLinkItem key={i} isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={l.href} className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity no-underline" style={{ color: styles.textColor }}>{l.label}</NavLinkItem>)}
                </nav>
                <div className="flex items-center gap-6">
                    {user ? <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/account" className="opacity-60 hover:opacity-100" style={{ color: styles.textColor }}><User className="size-5" /></NavLinkItem> : <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/login" className="opacity-60 hover:opacity-100" style={{ color: styles.textColor }}><LogIn className="size-5" /></NavLinkItem>}
                    {navigation.showCart && <CartButton primary={primary} />}
                </div>
            </div>
        </header>
    )
}

export function NovaLayout({ theme, products, domain, isPreview, baseUrl }: LayoutProps) {
    const { hero, productsSection, styles, branding, cta } = theme
    const primary = branding.primaryColor
    const productsToRender = products || []

    return (
        <div className="flex-1">
            {hero.show && (
                <section className="relative py-32 md:py-48 border-b" style={{ borderColor: styles.borderColor }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none opacity-20" style={{ background: `radial-gradient(ellipse at top, ${primary}, transparent 70%)` }} />
                    <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                        {hero.showBadge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-10 shadow-xl" style={{ borderColor: styles.borderColor, background: styles.cardBg }}>{hero.badgeText}</div>}
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-none" style={{ color: styles.textColor }}>{hero.headline}</h1>
                        <p className="text-xl md:text-2xl opacity-50 max-w-2xl mx-auto mb-16 font-medium">{hero.subheadline}</p>
                        <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={hero.buttonUrl} className="inline-flex items-center gap-3 px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-widest no-underline transition-all hover:scale-105 active:scale-95" style={{ background: primary, color: '#fff', boxShadow: `0 20px 60px ${primary}50` }}>{hero.buttonText} <ArrowRight className="size-5" /></NavLinkItem>
                    </div>
                </section>
            )}

            <div className="w-full border-b py-6 overflow-hidden flex bg-secondary/30" style={{ borderColor: styles.borderColor }}>
                <div className="flex items-center gap-16 px-6 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] opacity-30">
                            <Sparkles className="size-4" /> Next-Gen AI Commerce
                            <span className="mx-4 opacity-20">/</span>
                            <Shield className="size-4" /> Military Grade Security
                            <span className="mx-4 opacity-20">/</span>
                            <Globe className="size-4" /> Orbital Logistics
                        </div>
                    ))}
                </div>
            </div>

            {productsSection.show && (
                <section className="py-32 max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-20">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">Core Selection</h2>
                            <p className="text-lg opacity-40 font-medium">{productsSection.subtitle}</p>
                        </div>
                        {productsSection.showViewAll && <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/collection" className="px-6 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest no-underline hover:bg-secondary transition-all" style={{ borderColor: styles.borderColor, color: styles.textColor }}>{productsSection.viewAllText}</NavLinkItem>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {productsToRender.slice(0, productsSection.count).map(p => (
                            <NavLinkItem key={p.id} isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={`/product/${p.id}`} className="no-underline group">
                                <div className="aspect-square rounded-[3rem] overflow-hidden border mb-8 transition-all group-hover:rounded-[1rem] group-hover:scale-[1.03] shadow-2xl relative" style={{ borderColor: styles.borderColor, background: styles.cardBg }}>
                                    <img src={getImg(p)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                        <span className="text-white font-black text-xl">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))}</span>
                                    </div>
                                </div>
                                <h3 className="font-black text-xl mb-1 tracking-tight">{p.title}</h3>
                                <p className="font-bold text-indigo-400 uppercase text-[10px] tracking-widest">Available Now</p>
                            </NavLinkItem>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚪ MINIMAL THEME (Elegant/High-Fashion/Spacious)
// ─────────────────────────────────────────────────────────────────────────────
export function MinimalHeader({ theme, user, domain, isPreview, baseUrl }: LayoutProps & { baseUrl?: string }) {
    const { branding, navigation } = theme
    return (
        <header className="bg-white border-b border-gray-100 h-24">
            <div className="max-w-7xl mx-auto px-10 h-full flex items-center justify-between">
                <nav className="flex-1 hidden md:flex gap-12">
                    {navigation.links.slice(0, 3).map((l, i) => <NavLinkItem key={i} isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={l.href} className="text-[10px] font-bold uppercase tracking-[0.3em] text-black no-underline hover:opacity-50 transition-opacity">{l.label}</NavLinkItem>)}
                </nav>
                <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/" className="text-3xl font-light tracking-[0.4em] uppercase text-black no-underline">{branding.storeName}</NavLinkItem>
                <div className="flex-1 flex justify-end items-center gap-10">
                    <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={user ? "/account" : "/login"} className="text-black hover:opacity-50"><User className="size-5 stroke-[1]" /></NavLinkItem>
                    {navigation.showCart && <CartButton primary="#000" />}
                </div>
            </div>
        </header>
    )
}

export function MinimalLayout({ theme, products, domain, isPreview, baseUrl }: LayoutProps) {
    const { hero, productsSection, branding } = theme
    const productsToRender = products || []

    return (
        <div className="flex-1 bg-white text-black" style={{ fontFamily: branding.fontFamily }}>
            {hero.show && (
                <section className="py-48 md:py-64 px-10 max-w-7xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-black mb-14 max-w-4xl leading-[0.9]">{hero.headline}</h1>
                    <p className="text-lg md:text-xl text-gray-400 font-light mb-20 max-w-2xl leading-relaxed italic">{hero.subheadline}</p>
                    <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={hero.buttonUrl} className="inline-block px-16 py-6 bg-black text-white no-underline uppercase text-[9px] font-bold tracking-[0.4em] hover:bg-gray-900 transition-all shadow-2xl">{hero.buttonText}</NavLinkItem>
                </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 h-[600px] border-y border-gray-100">
                <div className="border-r border-gray-100 flex flex-col justify-center p-20 space-y-8">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Curation 01</span>
                     <h2 className="text-5xl font-light leading-tight">Selected Artifacts for the Modern Individual.</h2>
                     <p className="text-gray-400 font-light leading-relaxed">Each piece is hand-picked to ensure the highest standard of aesthetic and functional harmony.</p>
                </div>
                <div className="bg-gray-50 flex items-center justify-center p-20">
                     <img src={getImg(productsToRender[0])} className="max-h-full grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl" />
                </div>
            </div>

            {productsSection.show && (
                <section className="py-40 max-w-7xl mx-auto px-10">
                    <div className="flex justify-between items-baseline mb-24">
                        <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-gray-300">{productsSection.title}</h2>
                        <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/collection" className="text-[9px] font-bold uppercase tracking-widest text-black no-underline hover:opacity-50">View all</NavLinkItem>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                        {productsToRender.slice(0, productsSection.count).map(p => (
                            <NavLinkItem key={p.id} isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={`/product/${p.id}`} className="no-underline group text-center">
                                <div className="aspect-[2/3] bg-gray-50 mb-10 overflow-hidden relative">
                                    <img src={getImg(p)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                                </div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-3">{p.title}</h3>
                                <p className="text-[11px] text-gray-400 font-light tracking-widest">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))}</p>
                            </NavLinkItem>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// 🌑 ENIGMA THEME (Bold/Luxury/High-Contrast)
// ─────────────────────────────────────────────────────────────────────────────
export function EnigmaHeader({ theme, user, domain, isPreview, baseUrl }: LayoutProps & { baseUrl?: string }) {
    const { branding, navigation } = theme
    return (
        <header className="bg-black border-b border-white/5 h-28 flex items-center px-10 md:px-20 justify-between sticky top-0 z-50 backdrop-blur-md bg-black/90">
            <div className="flex items-center gap-16">
                <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href="/" className="text-4xl font-black italic uppercase tracking-tighter text-white no-underline">
                    {branding.storeName}<span className="text-red-600">.</span>
                </NavLinkItem>
                <nav className="hidden lg:flex gap-10">
                   {navigation.links.map((l, i) => <NavLinkItem key={i} isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={l.href} className="text-[10px] font-black uppercase italic text-white/30 hover:text-white transition-colors no-underline tracking-widest">{l.label}</NavLinkItem>)}
                </nav>
            </div>
            <div className="flex items-center gap-10 text-white">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <Search className="size-3.5 opacity-40" />
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-20">Find Anything</span>
                </div>
                <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={user ? "/account" : "/login"} className="text-white hover:text-red-600 transition-colors"><User className="size-5" /></NavLinkItem>
                {navigation.showCart && <CartButton primary="#fff" />}
            </div>
        </header>
    )
}

export function EnigmaLayout({ theme, products, domain, isPreview, baseUrl }: LayoutProps) {
    const { hero, productsSection, branding, cta } = theme
    const productsToRender = products || []

    return (
        <div className="flex-1 bg-black text-white" style={{ fontFamily: branding.fontFamily }}>
            {hero.show && (
                <section className="relative min-h-screen flex flex-col justify-end p-10 md:p-24 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale scale-110" style={{ backgroundImage: hero.bgImage ? `url(${hero.bgImage})` : 'none' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    {/* Floating Accent */}
                    <div className="absolute top-20 right-20 size-64 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />

                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px w-20 bg-red-600" />
                            <span className="text-xs font-black uppercase tracking-[0.4em] text-red-600">Established MMXXIV</span>
                        </div>
                        <h1 className="text-7xl md:text-[14vw] font-black italic uppercase leading-[0.75] tracking-[calc(-0.04em)] mb-16 drop-shadow-2xl">{hero.headline}</h1>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-16 border-t border-white/10 pt-16">
                            <p className="text-2xl md:text-3xl max-w-2xl font-bold italic opacity-40 leading-tight">{hero.subheadline}</p>
                            <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={hero.buttonUrl} className="group relative">
                                <div className="size-48 md:size-64 rounded-full border-2 border-white/20 flex items-center justify-center transition-all group-hover:border-red-600 group-hover:scale-105">
                                    <div className="size-40 md:size-56 rounded-full bg-white text-black flex flex-col items-center justify-center gap-2 group-hover:bg-red-600 group-hover:text-white transition-all shadow-2xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest">{hero.buttonText}</span>
                                        <ArrowRight className="size-6" />
                                    </div>
                                </div>
                            </NavLinkItem>
                        </div>
                    </div>
                </section>
            )}

            {productsSection.show && (
                <section className="py-48 px-10 md:px-24 bg-[#0a0a0a]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-32">
                        <h2 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none">The Goods<span className="text-red-600">.</span></h2>
                        <p className="max-w-xs text-sm font-bold uppercase tracking-widest opacity-20 leading-relaxed">A ruthless pursuit of perfection. Browse the latest drops from our secret laboratory.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-px bg-white/5 border border-white/5 shadow-[0_0_80px_rgba(0,0,0,1)]">
                        {productsToRender.slice(0, productsSection.count).map((p, i) => (
                            <NavLinkItem key={p.id} isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={`/product/${p.id}`} className="flex flex-col md:flex-row items-center justify-between p-12 md:p-20 bg-black hover:bg-red-600 transition-all duration-500 group no-underline">
                                <div className="flex items-center gap-12 md:gap-24">
                                    <span className="text-3xl font-black opacity-10 group-hover:opacity-40 transition-opacity">0{i+1}</span>
                                    <h3 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter transition-all group-hover:translate-x-8">{p.title}</h3>
                                </div>
                                <div className="flex items-center gap-16 mt-10 md:mt-0">
                                    <span className="text-4xl font-black tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))}</span>
                                    <div className="size-20 md:size-32 rounded-full border-4 border-current flex items-center justify-center group-hover:rotate-45 transition-all">
                                        <ArrowRight className="size-12" />
                                    </div>
                                </div>
                            </NavLinkItem>
                        ))}
                    </div>
                </section>
            )}

            {cta.show && (
                <section className="py-64 text-center px-10 border-t border-white/5 relative group cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 transition-all duration-700 group-hover:scale-110">
                        <h2 className="text-8xl md:text-[16vw] font-black uppercase italic tracking-[calc(-0.06em)] leading-[0.8] mb-12">Take It Now</h2>
                        <NavLinkItem isPreview={isPreview} baseUrl={baseUrl} domain={domain} href={cta.buttonUrl} className="inline-block px-24 py-8 border-[12px] border-white text-white font-black text-3xl md:text-5xl uppercase italic tracking-tighter hover:bg-white hover:text-red-600 transition-all no-underline">
                            {cta.buttonText}
                        </NavLinkItem>
                    </div>
                </section>
            )}
        </div>
    )
}
