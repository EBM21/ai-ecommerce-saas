"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BuilderBlock, AnimationType, HoverEffect, ThemeConfig } from '@/types/theme-types'
import Link from 'next/link'
import { 
    ArrowRight, Star, ShoppingBag, CheckCircle2, 
    Shield, Zap, Globe, MessageSquare, GripVertical, 
    Trash2, Settings2, Plus, Move, Menu 
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ProductClient from '@/app/[domain]/product/[id]/product-client'
import CheckoutClient from '@/app/[domain]/checkout/checkout-client'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getSafeImg(p: any) {
    try {
        if (!p || !p.images) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        
        const raw = p.images
        const imgs = typeof raw === 'string' ? JSON.parse(raw) : raw
        
        if (Array.isArray(imgs)) {
            const first = imgs[0]
            if (typeof first === 'string') return first
            if (typeof first === 'object' && first !== null) return first.enhanced || first.raw || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
            return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        }
        if (typeof imgs === 'object' && imgs !== null) {
            return imgs.enhanced || imgs.raw || Object.values(imgs).find(v => typeof v === 'string') || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
        }
        return typeof raw === 'string' ? raw : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    } catch { 
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' 
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const entranceVariants = {
    none: { opacity: 1 },
    'fade-in': { opacity: [0, 1] },
    'slide-up': { opacity: [0, 1], y: [40, 0] },
    'zoom-in': { opacity: [0, 1], scale: [0.8, 1] },
    'bounce': { opacity: [0, 1], y: [-20, 10, 0] },
    'rotate': { opacity: [0, 1], rotate: [-10, 0] }
}

const hoverVariants = {
    none: {},
    'scale': { scale: 1.02 },
    'lift': { y: -5 },
    'glow': { filter: 'brightness(1.1)' },
    'grayscale-to-color': { filter: 'grayscale(0)' }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

const BlockWrapper = ({ 
    block, 
    children, 
    isEditMode, 
    onDelete, 
    onSelect, 
    isSelected,
    onAddBelow
}: { 
    block: BuilderBlock, 
    children: React.ReactNode, 
    isEditMode?: boolean,
    onDelete?: (id: string) => void,
    onSelect?: (id: string) => void,
    isSelected?: boolean,
    onAddBelow?: (id: string) => void
}) => {
    const anim = block.animation || { entrance: 'none', hover: 'none' }
    const s = block.styles || {}

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id, disabled: !isEditMode })

    const dragStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : 'auto'
    }
    
    // Structural blocks (headers/footers) manage their own padding
    const isStructural = block.type.startsWith('header-') || block.type.startsWith('footer-')
    const defaultPadding = isStructural ? '0px' : '80px'

    return (
        <div ref={setNodeRef} style={dragStyle} className="relative group/block w-full">
            <motion.section
                id={block.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onClick={() => isEditMode && onSelect?.(block.id)}
                transition={{ duration: 0.8, delay: anim.delay || 0, ease: [0.22, 1, 0.36, 1] }}
                variants={{
                    hidden: (entranceVariants as any)[anim.entrance] === entranceVariants.none ? {} : { opacity: 0, y: 20 },
                    visible: (entranceVariants as any)[anim.entrance] || entranceVariants.none
                }}
                whileHover={!isEditMode ? (hoverVariants as any)[anim.hover] : {}}
                style={{
                    paddingTop: s.paddingTop ?? defaultPadding,
                    paddingBottom: s.paddingBottom ?? defaultPadding,
                    backgroundColor: s.backgroundColor,
                    color: s.textColor,
                    borderWidth: s.borderColor ? '1px' : '0px',
                    borderColor: s.borderColor,
                    borderRadius: s.borderRadius,
                    cursor: isEditMode ? 'pointer' : 'default'
                }}
                className={`relative overflow-hidden transition-all ${isEditMode && isSelected ? 'ring-4 ring-primary ring-inset' : ''} ${isEditMode ? 'hover:bg-primary/5' : ''}`}
            >
                {children}

                {/* ── EDIT HANDLES ── */}
                {isEditMode && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover/block:opacity-100 transition-opacity z-30">
                        <div className="flex bg-card border border-border shadow-2xl rounded-2xl overflow-hidden p-1 backdrop-blur-md">
                            <div {...attributes} {...listeners} className="p-2 text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-secondary rounded-xl transition-colors">
                                <Move className="size-4" />
                            </div>
                            <div className="w-px h-4 bg-border my-auto mx-1" />
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSelect?.(block.id) }}
                                className={`p-2 hover:bg-secondary rounded-xl transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                <Settings2 className="size-4" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete?.(block.id) }}
                                className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.section>

            {/* ── ADD BUTTON BETWEEN BLOCKS ── */}
            {isEditMode && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-40 opacity-0 group-hover/block:opacity-100 transition-all scale-75 group-hover/block:scale-100">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddBelow?.(block.id) }}
                        className="size-8 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

export function VisualBuilderRenderer({ 
    blocks, 
    products, 
    domain, 
    baseUrl = "",
    isEditMode = false,
    activeBlockId,
    onDeleteBlock,
    onSelectBlock,
    onAddBlock,
    theme,
    bankDetails
}: { 
    blocks: BuilderBlock[], 
    products?: any[], 
    domain?: string, 
    baseUrl?: string,
    isEditMode?: boolean,
    activeBlockId?: string | null,
    onDeleteBlock?: (id: string) => void,
    onSelectBlock?: (id: string) => void,
    onAddBlock?: (type: string, index: number) => void,
    theme: ThemeConfig,
    bankDetails?: string | null
}) {
    if (!blocks || blocks.length === 0) return null

    return (
        <div className="flex flex-col w-full">
            {blocks.map((block, index) => (
                <RenderBlock 
                    key={block.id} 
                    block={block} 
                    products={products} 
                    domain={domain} 
                    baseUrl={baseUrl} 
                    isEditMode={isEditMode}
                    isSelected={activeBlockId === block.id}
                    onDelete={onDeleteBlock}
                    onSelect={onSelectBlock}
                    onAddBelow={(blockId) => onAddBlock?.('text-hero', blocks.findIndex(b => b.id === blockId) + 1)}
                    theme={theme}
                    bankDetails={bankDetails}
                />
            ))}
        </div>
    )
}

function RenderBlock({ 
    block, 
    products, 
    domain, 
    baseUrl,
    isEditMode,
    isSelected,
    onDelete,
    onSelect,
    onAddBelow,
    theme,
    bankDetails
}: { 
    block: BuilderBlock, 
    products?: any[], 
    domain?: string, 
    baseUrl?: string,
    isEditMode?: boolean,
    isSelected?: boolean,
    onDelete?: (id: string) => void,
    onSelect?: (id: string) => void,
    onAddBelow?: (id: string) => void,
    theme: ThemeConfig,
    bankDetails?: string | null
}) {
    return (
        <BlockWrapper 
            block={block} 
            isEditMode={isEditMode} 
            isSelected={isSelected} 
            onDelete={onDelete} 
            onSelect={onSelect}
            onAddBelow={onAddBelow}
        >
            <InnerRenderer 
                type={block.type} 
                props={block.props} 
                products={products} 
                domain={domain}
                baseUrl={baseUrl} 
                theme={theme} 
                isEditMode={isEditMode}
                bankDetails={bankDetails}
            />
        </BlockWrapper>
    )
}

function InnerRenderer({ type, props: p, products, domain, baseUrl, theme, isEditMode, bankDetails }: any) {
    const currency = theme?.branding?.currency || 'USD'
    const format = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v)

    switch (type) {
        case 'system-product-details':
            const sampleProduct = products && products.length > 0 ? products[0] : {
                id: 'dummy',
                title: 'Sample Product',
                price: 99.99,
                description: 'This is a sample product for preview purposes.',
                variants: []
            }
            
            // Reconstruct images for ProductClient (if it's array format, or object, or empty)
            let imageArray: string[] = []
            if (sampleProduct.images) {
                try {
                    const parsed = typeof sampleProduct.images === 'string' ? JSON.parse(sampleProduct.images) : sampleProduct.images
                    if (Array.isArray(parsed)) {
                        imageArray = parsed.map((item: any) => {
                            if (typeof item === 'string') return item;
                            if (typeof item === 'object' && item !== null) return item.enhanced || item.raw;
                            return null;
                        }).filter(Boolean)
                    } else if (typeof parsed === 'object') {
                        if (parsed.enhanced) imageArray.push(parsed.enhanced)
                        if (parsed.raw) imageArray.push(parsed.raw)
                        Object.values(parsed).forEach(v => {
                            if (typeof v === 'string' && !imageArray.includes(v)) imageArray.push(v)
                        })
                    }
                } catch(e) {}
            }
            if (imageArray.length === 0) imageArray.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80')

            return (
                <div style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}>
                    <ProductClient product={sampleProduct} images={imageArray} domain={domain || "preview"} theme={theme} blockProps={p} />
                </div>
            )

        case 'system-checkout':
            return (
                <div style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}>
                    <CheckoutClient storeId="preview" domain={domain || "preview"} baseUrl={baseUrl} theme={theme} blockProps={p} bankDetails={bankDetails} />
                </div>
            )

        case 'hero-modern':
            return (
                <div className="max-w-7xl mx-auto px-6 text-center">
                    {p.badge && <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">{p.badge}</span>}
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">{p.headline}</h1>
                    <p className="text-xl opacity-60 max-w-2xl mx-auto mb-12 font-medium">{p.subheadline}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={`${baseUrl}${p.buttonUrl}`} className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest no-underline shadow-2xl shadow-primary/40 hover:scale-105 transition-transform">{p.buttonText}</Link>
                        {p.secondaryButtonText && <Link href={`${baseUrl}${p.secondaryButtonUrl}`} className="px-10 py-5 border border-border rounded-2xl font-black uppercase tracking-widest no-underline hover:bg-secondary transition-colors">{p.secondaryButtonText}</Link>}
                    </div>
                </div>
            )

        case 'hero-split':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{p.headline}</h1>
                        <p className="text-xl opacity-60 mb-8">{p.subheadline}</p>
                        <Link href={`${baseUrl}${p.buttonUrl}`} className="px-8 py-4 bg-primary text-white rounded-xl font-bold inline-block no-underline">{p.buttonText}</Link>
                    </div>
                    <div className="aspect-square rounded-3xl overflow-hidden border border-border">
                        <img src={p.imageUrl} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                </div>
            )

        case 'hero-centered':
            return (
                <div className="relative rounded-[3rem] overflow-hidden bg-black mx-4 flex items-center justify-center text-center shadow-2xl" style={{ minHeight: '600px' }}>
                    <img src={p.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                    <div className="relative z-10 p-10 max-w-3xl">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">{p.headline}</h1>
                        <p className="text-xl text-white/80 mb-10 font-medium">{p.subheadline}</p>
                        <Link href={`${baseUrl}${p.buttonUrl}`} className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform inline-block no-underline shadow-xl">{p.buttonText}</Link>
                    </div>
                </div>
            )

        case 'hero-brutalist':
            return (
                <div className="max-w-7xl mx-auto px-6 py-20 border-b-8 border-r-8 border-foreground bg-background mb-10 overflow-hidden relative">
                    <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase text-foreground mb-10 break-words">{p.headline}</h1>
                    <p className="text-2xl md:text-4xl font-bold uppercase tracking-widest max-w-3xl mb-12" style={{ color: "var(--theme-primary, #ec4899)" }}>{p.subheadline}</p>
                    <Link href={`${baseUrl}${p.buttonUrl}`} className="inline-block px-12 py-6 bg-foreground text-background text-xl md:text-2xl font-black uppercase tracking-widest hover:-translate-y-2 hover:translate-x-2 transition-transform shadow-[8px_8px_0px_0px_var(--theme-primary,#ec4899)]">{p.buttonText}</Link>
                </div>
            )

        case 'hero-video':
            return (
                <div className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
                    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
                        <source src={p.videoUrl || "https://player.vimeo.com/external/459389137.sd.mp4?s=d6f8dc51656c0ba2d10ffb573a6e3860bb6321ee&profile_id=164&oauth2_token_id=57447761"} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="relative z-10 text-center max-w-5xl px-6">
                        <h1 className="text-5xl md:text-8xl font-black tracking-widest uppercase text-white mb-8">{p.headline}</h1>
                        <p className="text-xl md:text-2xl font-light text-white/90 mb-12">{p.subheadline}</p>
                        <Link href={`${baseUrl}${p.buttonUrl}`} className="inline-block px-10 py-5 border border-white text-white backdrop-blur-sm bg-white/10 hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-widest shadow-2xl">{p.buttonText}</Link>
                    </div>
                </div>
            )

        case 'features-grid':
            return (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">{p.title}</h2>
                        <p className="opacity-50 font-medium">{p.subtitle}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(p.items || []).map((item: any, i: number) => (
                            <div key={i} className="p-10 rounded-[2.5rem] border border-border bg-card/50 backdrop-blur-xl transition-all hover:border-primary/50">
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 text-2xl shadow-inner">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p className="opacity-60 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'features-list':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-5xl font-black mb-6 tracking-tighter">{p.title}</h2>
                        <p className="text-xl opacity-50 max-w-md">{p.subtitle}</p>
                    </div>
                    <div className="space-y-6">
                        {(p.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex gap-6 items-start p-6 rounded-3xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0 text-xl">{i + 1}</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="opacity-60 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'product-catalog':
            const displayProducts = products?.slice(0, p.count || 8) || []
            return (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-16">
                        <div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase italic">{p.title}</h2>
                            <p className="opacity-40 font-medium mt-2">{p.subtitle}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayProducts.map((prod: any) => (
                            <Link key={prod.id} href={`${baseUrl}/product/${prod.id}`} className="no-underline group">
                                <div className="aspect-square rounded-[2rem] overflow-hidden border border-border bg-card mb-6 transition-all group-hover:scale-[1.02] shadow-sm group-hover:shadow-xl">
                                    <img src={getSafeImg(prod)} className="w-full h-full object-cover" alt={prod.title} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{prod.title}</h3>
                                <p className="font-black text-primary">{format(Number(prod.price))}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )

        case 'product-slider':
            const sliderProds = products?.slice(0, p.count || 6) || []
            return (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic">{p.title}</h2>
                        <div className="flex gap-2">
                             <button className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">&larr;</button>
                             <button className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors">&rarr;</button>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x custom-scrollbar">
                        {sliderProds.map((prod: any) => (
                            <Link key={prod.id} href={`${baseUrl}/product/${prod.id}`} className="min-w-[300px] snap-center group no-underline">
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-card mb-6 border border-border relative">
                                    <img src={getSafeImg(prod)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{prod.title}</h3>
                                <p className="text-primary font-black tracking-widest">{format(Number(prod.price))}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )

        case 'product-masonry':
            const masonryProds = products?.slice(0, p.count || 6) || []
            return (
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <h2 className="text-5xl font-black mb-16 tracking-tighter text-center uppercase">{p.title}</h2>
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                        {masonryProds.map((prod: any, i: number) => (
                            <Link key={prod.id} href={`${baseUrl}/product/${prod.id}`} className="block break-inside-avoid group no-underline">
                                <div className={`w-full ${i % 2 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'} overflow-hidden bg-secondary mb-4 relative`}>
                                    <img src={getSafeImg(prod)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={prod.title} />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs">View Product</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg mt-4">{prod.title}</h3>
                                <p className="text-muted-foreground">{format(Number(prod.price))}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )

        case 'testimonial-slider':
             return (
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-16">{p.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(p.items || []).map((t: any, i: number) => (
                            <div key={i} className="p-10 bg-secondary/30 rounded-[2.5rem] text-left border border-border hover:bg-secondary/50 transition-colors">
                                <div className="flex gap-1 text-amber-400 mb-6">
                                    {[...Array(5)].map((_, i) => <Star key={i} className={`size-4 ${i < t.rating ? 'fill-current' : 'opacity-20'}`} />)}
                                </div>
                                <p className="text-xl font-medium mb-10 italic leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center font-black text-primary text-lg">{t.name[0]}</div>
                                    <div><p className="font-bold text-base">{t.name}</p><p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-0.5">{t.role}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'pricing-simple':
            return (
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-5xl font-black mb-16 tracking-tighter uppercase italic">{p.title}</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {(p.plans || []).map((plan: any, i: number) => (
                            <div key={i} className="p-12 rounded-[3rem] border border-border bg-card/50 backdrop-blur-md hover:border-primary/50 transition-colors shadow-sm hover:shadow-2xl">
                                <h3 className="text-2xl font-black uppercase tracking-widest opacity-60 mb-6">{plan.name}</h3>
                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <span className="text-2xl font-bold opacity-50">{currency === "USD" ? "$" : currency}</span>
                                    <span className="text-7xl font-black tracking-tighter">{plan.price.replace('$', '').replace(currency, '')}</span>
                                </div>
                                <div className="h-px w-12 bg-border mx-auto mb-8" />
                                <p className="opacity-80 mb-10 font-medium">{plan.features}</p>
                                <button className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-primary/20">Select Plan</button>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'faq-accordion':
            return (
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl font-black mb-12 text-center tracking-tighter uppercase italic">{p.title}</h2>
                    <div className="space-y-4">
                        {(p.questions || []).map((q: any, i: number) => (
                            <div key={i} className="p-8 rounded-3xl border border-border bg-card hover:border-primary/30 transition-colors group cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-xl">{q.q}</h3>
                                    <div className="size-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">+</div>
                                </div>
                                <p className="opacity-60 leading-relaxed pr-10">{q.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'text-image-left':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="w-12 h-2 bg-primary rounded-full" />
                        <h2 className="text-5xl font-black tracking-tighter leading-none">{p.title}</h2>
                        <p className="text-xl opacity-60 leading-relaxed">{p.content}</p>
                    </div>
                    <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-border shadow-2xl relative">
                         <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                </div>
            )

        case 'text-image-right':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div className="aspect-[4/3] rounded-[3rem] overflow-hidden border border-border shadow-2xl relative order-2 md:order-1">
                         <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-8 order-1 md:order-2">
                        <div className="w-12 h-2 bg-primary rounded-full" />
                        <h2 className="text-5xl font-black tracking-tighter leading-none">{p.title}</h2>
                        <p className="text-xl opacity-60 leading-relaxed">{p.content}</p>
                    </div>
                </div>
            )

        case 'cta-banner':
            return (
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative rounded-[3rem] bg-primary p-16 md:p-24 text-center overflow-hidden shadow-[0_40px_100px_rgba(99,102,241,0.3)]">
                            <div className="absolute top-0 right-0 size-[500px] bg-white/10 blur-[120px] rounded-full -mr-40 -mt-40" />
                            <div className="absolute bottom-0 left-0 size-[300px] bg-black/10 blur-[100px] rounded-full -ml-20 -mb-20" />
                            <div className="relative z-10">
                                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-10 leading-none">{p.headline}</h2>
                                <p className="text-white/80 text-xl mb-14 max-w-2xl mx-auto font-medium">{p.subtext}</p>
                                <Link href={`${baseUrl}${p.buttonUrl}`} className="inline-flex items-center gap-4 px-14 py-6 bg-white text-primary rounded-[2rem] font-black uppercase tracking-widest no-underline hover:scale-105 active:scale-95 transition-all shadow-2xl">{p.buttonText} <ArrowRight className="size-6" /></Link>
                            </div>
                    </div>
                </div>
            )

        case 'header-nova':
            return (
                <div className="w-full border-b border-border bg-card/80 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">{theme.branding.storeName[0]}</div>
                            <span className="font-bold text-sm truncate max-w-[150px]">{theme.branding.storeName}</span>
                        </div>
                        <nav className="hidden md:flex gap-6">
                            {p.links?.map((l: any, i: number) => <Link key={i} href={`${baseUrl}${l.href}`} className="text-xs font-bold opacity-60 hover:opacity-100 no-underline transition-opacity">{l.label}</Link>)}
                        </nav>
                        <button className="md:hidden p-2 opacity-60"><Menu className="size-5" /></button>
                    </div>
                </div>
            )

        case 'header-minimal':
            return (
                <div className="w-full border-b border-border bg-background">
                    <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
                        <span className="text-lg md:text-xl font-light tracking-[0.2em] md:tracking-[0.3em] uppercase truncate max-w-[200px]">{theme.branding.storeName}</span>
                        <nav className="hidden md:flex gap-10">
                            {p.links?.map((l: any, i: number) => <Link key={i} href={`${baseUrl}${l.href}`} className="text-[10px] font-bold uppercase tracking-widest no-underline opacity-60 hover:opacity-100 transition-opacity">{l.label}</Link>)}
                        </nav>
                        <button className="md:hidden p-2 opacity-60"><Menu className="size-5" /></button>
                    </div>
                </div>
            )

        case 'header-centered':
            return (
                <div className="w-full border-b border-border bg-background py-8">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-6">
                        <span className="text-3xl md:text-5xl font-serif tracking-widest uppercase text-foreground">{theme.branding.storeName}</span>
                        <nav className="hidden md:flex gap-8 border-t border-border pt-6 w-full justify-center">
                            {p.links?.map((l: any, i: number) => <Link key={i} href={`${baseUrl}${l.href}`} className="text-xs font-bold uppercase tracking-[0.2em] no-underline opacity-50 hover:opacity-100 transition-all">{l.label}</Link>)}
                        </nav>
                        <button className="md:hidden p-2 opacity-60"><Menu className="size-5" /></button>
                    </div>
                </div>
            )

        case 'footer-nova':
            return (
                <div className="max-w-7xl mx-auto px-6 py-12 flex justify-between items-center border-t border-border">
                    <p className="text-xs opacity-40 font-bold uppercase tracking-widest">{p.text}</p>
                    <div className="flex gap-4">
                        <div className="size-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all italic font-serif">f</div>
                        <div className="size-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all italic font-serif">t</div>
                    </div>
                </div>
            )

        case 'footer-minimal':
            return (
                <div className="py-16 text-center space-y-6 bg-secondary/30 border-t border-border">
                    <span className="text-xl font-light tracking-[0.4em] uppercase block text-foreground">{theme.branding.storeName}</span>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.text}</p>
                </div>
            )

        case 'footer-enigma':
            return (
                <div className="py-32 bg-black border-t border-white/5 text-white">
                    <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-end gap-12">
                        <div>
                            <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-8">{theme.branding.storeName}<span className="text-red-600">.</span></h2>
                            <p className="text-white/30 text-sm font-bold uppercase tracking-widest max-w-xs leading-relaxed">{p.text}</p>
                        </div>
                        <div className="flex gap-10">
                            <span className="text-xl font-black italic uppercase tracking-tighter text-white/20 hover:text-white cursor-pointer transition-colors">Privacy</span>
                            <span className="text-xl font-black italic uppercase tracking-tighter text-white/20 hover:text-white cursor-pointer transition-colors">Terms</span>
                        </div>
                    </div>
                </div>
            )

        default:
            return (
                <div className="p-20 text-center border-4 border-dashed border-border rounded-[3rem] m-10 opacity-30 flex flex-col items-center gap-4">
                    <Zap className="size-10" />
                    <p className="font-bold uppercase tracking-widest text-xs">Unknown Block: {type}</p>
                </div>
            )
    }
}
