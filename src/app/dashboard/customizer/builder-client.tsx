"use client"

import React, { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import {
    DndContext,
    closestCenter,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    UniqueIdentifier,
    useDroppable,
    useDraggable,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { ThemeToggle } from "@/components/theme-toggle"
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Layout, Type, Image as ImageIcon, MousePointer2,
    Layers, Zap, Palette, Plus, Trash2, GripVertical,
    ChevronRight, ChevronDown, Settings2, Eye, Save,
    Play, Sparkles, MessageSquare, ShoppingBag, Star,
    CheckCircle2, Shield, X, ArrowLeft, RefreshCw,
    PlusCircle, Move, AlignCenter, Sliders, Monitor,
    Tablet, Smartphone, Globe, FileText, Home, Link,
    Minus, Lock, Unlock, CornerDownLeft, CornerUpRight,
    ChevronUp, Settings, Columns, SquareDot, Bold,
    Italic, AlignLeft, AlignRight, AlignJustify,
    ArrowUpDown, Maximize, Minimize, MoreVertical,
    Copy, EyeOff, Check, Hash, Baseline, Link2
} from 'lucide-react'
import { ThemeConfig, BuilderBlock, AnimationType, HoverEffect, NavLink } from '@/types/theme-types'
import { VisualBuilderRenderer } from '@/components/visual-builder-renderer'
import { toast } from 'sonner'
import { updateThemeConfig, createCustomPage, deleteCustomPage } from './action'
import { getStoreUrl } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK LIBRARY — Organized by category
// ─────────────────────────────────────────────────────────────────────────────
type BlockTemplate = {
    type: string
    label: string
    icon: React.ElementType
    color: string
    defaultProps: Record<string, any>
    defaultStyles?: Record<string, any>
    defaultAnimation?: any
}

type BlockCategory = {
    label: string
    icon: React.ElementType
    blocks: BlockTemplate[]
}

const BLOCK_CATEGORIES: BlockCategory[] = [
    {
        label: 'Structure',
        icon: Layout,
        blocks: [
            {
                type: 'header-nova', label: 'Nova Header', icon: AlignCenter, color: 'from-sky-500/20 to-sky-600/20',
                defaultProps: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' }
            },
            {
                type: 'header-minimal', label: 'Minimal Header', icon: AlignCenter, color: 'from-indigo-500/20 to-indigo-600/20',
                defaultProps: { showLogo: true, links: [{ label: 'Catalog', href: '/collection' }] },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' }
            },
            {
                type: 'footer-nova', label: 'Nova Footer', icon: Layout, color: 'from-violet-500/20 to-violet-600/20',
                defaultProps: { text: `© ${new Date().getFullYear()} My Store`, showSocial: true },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' }
            },
            {
                type: 'footer-minimal', label: 'Minimal Footer', icon: Layout, color: 'from-purple-500/20 to-purple-600/20',
                defaultProps: { text: `© ${new Date().getFullYear()}. All rights reserved.`, centered: true },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' }
            },
            {
                type: 'footer-enigma', label: 'Enigma Footer', icon: Layout, color: 'from-fuchsia-500/20 to-fuchsia-600/20',
                defaultProps: { text: 'EST. MMXXIV', accent: 'red' },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' }
            },
        ]
    },
    {
        label: 'Hero',
        icon: Zap,
        blocks: [
            {
                type: 'hero-modern', label: 'Modern Hero', icon: Zap, color: 'from-amber-500/20 to-orange-500/20',
                defaultProps: { headline: 'Future of Commerce', subheadline: 'Launch your AI storefront in minutes.', buttonText: 'Get Started', buttonUrl: '/collection', badge: 'Next-Gen v4.0' },
                defaultStyles: { paddingTop: '160px', paddingBottom: '160px' },
                defaultAnimation: { entrance: 'slide-up', hover: 'none' }
            },
            {
                type: 'hero-split', label: 'Split Hero', icon: Columns, color: 'from-yellow-500/20 to-amber-500/20',
                defaultProps: { headline: 'Elegant & Bold', subheadline: 'Create a lasting impression.', buttonText: 'Discover', buttonUrl: '/collection', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' },
                defaultStyles: { paddingTop: '80px', paddingBottom: '80px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
            {
                type: 'hero-centered', label: 'Centered Hero', icon: AlignCenter, color: 'from-orange-500/20 to-red-500/20',
                defaultProps: { headline: 'Minimalist Design', subheadline: 'Focus on what matters.', buttonText: 'Shop All', buttonUrl: '/collection', bgImage: 'https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=1600' },
                defaultStyles: { paddingTop: '200px', paddingBottom: '200px', textColor: '#ffffff' },
                defaultAnimation: { entrance: 'zoom-in', hover: 'none' }
            },
        ]
    },
    {
        label: 'Products',
        icon: ShoppingBag,
        blocks: [
            {
                type: 'product-catalog', label: 'Product Grid', icon: ShoppingBag, color: 'from-emerald-500/20 to-green-500/20',
                defaultProps: { title: 'Curated Goods', subtitle: 'Hand-picked for quality.', count: 4 },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'zoom-in', hover: 'scale' }
            },
            {
                type: 'product-slider', label: 'Product Slider', icon: ArrowUpDown, color: 'from-teal-500/20 to-emerald-500/20',
                defaultProps: { title: 'Trending Now', count: 6 },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'slide-up', hover: 'none' }
            },
        ]
    },
    {
        label: 'Content',
        icon: FileText,
        blocks: [
            {
                type: 'features-grid', label: 'Features Grid', icon: Layout, color: 'from-blue-500/20 to-cyan-500/20',
                defaultProps: { title: 'Why Choose Us?', subtitle: 'Engineered for conversion.', items: [{ icon: '⚡', title: 'Lightning Fast', desc: '99+ PageSpeed.' }, { icon: '🤖', title: 'AI Driven', desc: 'Smart assistants.' }, { icon: '🎨', title: 'Customizable', desc: 'Your brand, your rules.' }] },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'lift' }
            },
            {
                type: 'features-list', label: 'Features List', icon: CheckCircle2, color: 'from-cyan-500/20 to-blue-500/20',
                defaultProps: { title: 'Core Features', subtitle: 'Everything you need.', items: [{ title: 'Fast', desc: 'Optimized for speed.' }, { title: 'Secure', desc: 'Bank-level security.' }] },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'slide-up', hover: 'none' }
            },
            {
                type: 'text-image-left', label: 'Text + Image (Left)', icon: ImageIcon, color: 'from-fuchsia-500/20 to-pink-500/20',
                defaultProps: { title: 'Our Story', content: 'We build things that matter.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
            {
                type: 'text-image-right', label: 'Text + Image (Right)', icon: ImageIcon, color: 'from-pink-500/20 to-rose-500/20',
                defaultProps: { title: 'Our Mission', content: 'Empowering creators worldwide.', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
            {
                type: 'faq-accordion', label: 'FAQ', icon: MessageSquare, color: 'from-teal-500/20 to-cyan-500/20',
                defaultProps: { title: 'Common Questions', questions: [{ q: 'Is it free?', a: 'Yes, basic is free forever.' }, { q: 'Can I cancel?', a: 'Anytime, no questions asked.' }] },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
            {
                type: 'contact-simple', label: 'Contact', icon: MessageSquare, color: 'from-cyan-500/20 to-sky-500/20',
                defaultProps: { title: 'Get in Touch', email: 'hello@example.com' },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'slide-up', hover: 'none' }
            },
        ]
    },
    {
        label: 'Social Proof',
        icon: Star,
        blocks: [
            {
                type: 'testimonial-slider', label: 'Testimonials', icon: Star, color: 'from-purple-500/20 to-violet-500/20',
                defaultProps: { title: 'Customer Stories', items: [{ name: 'Alex River', role: 'Founder', text: 'This changed how we sell.', rating: 5 }, { name: 'Sarah Jin', role: 'Designer', text: 'Cleanest interface ever.', rating: 5 }] },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
            {
                type: 'testimonial-grid', label: 'Review Grid', icon: Star, color: 'from-violet-500/20 to-purple-500/20',
                defaultProps: { title: 'Wall of Love', items: [{ text: 'Incredible product!', name: 'John Doe', role: 'CEO' }, { text: 'Outstanding service.', name: 'Jane Smith', role: 'CTO' }] },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
        ]
    },
    {
        label: 'Marketing',
        icon: MousePointer2,
        blocks: [
            {
                type: 'cta-banner', label: 'CTA Banner', icon: MousePointer2, color: 'from-rose-500/20 to-pink-500/20',
                defaultProps: { headline: 'Ready to scale?', subtext: 'Join 10,000+ merchants today.', buttonText: 'Start Trial', buttonUrl: '/login' },
                defaultStyles: { paddingTop: '120px', paddingBottom: '120px' },
                defaultAnimation: { entrance: 'bounce', hover: 'glow' }
            },
            {
                type: 'pricing-simple', label: 'Pricing', icon: Shield, color: 'from-red-500/20 to-rose-500/20',
                defaultProps: { title: 'Simple Pricing', plans: [{ name: 'Basic', price: '$9', features: '1 Project' }, { name: 'Pro', price: '$29', features: 'Unlimited' }] },
                defaultStyles: { paddingTop: '100px', paddingBottom: '100px' },
                defaultAnimation: { entrance: 'slide-up', hover: 'none' }
            },
        ]
    },
    {
        label: 'System',
        icon: Settings,
        blocks: [
            {
                type: 'system-product-details', label: 'Product Details', icon: ShoppingBag, color: 'from-blue-500/20 to-indigo-500/20',
                defaultProps: {
                    addToCartText: 'Add to Cart',
                    buyNowText: 'Buy it now',
                    shippingTitle: 'Global Shipping',
                    shippingDesc: 'Free delivery on premium orders.',
                    secureTitle: 'Secure Checkout',
                    secureDesc: 'Encrypted and safe payments.'
                },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
            {
                type: 'system-checkout', label: 'Checkout', icon: Lock, color: 'from-green-500/20 to-emerald-500/20',
                defaultProps: {
                    title: 'Checkout',
                    buttonText: 'Place Order',
                    guaranteeText: '100% secure payment processing'
                },
                defaultStyles: { paddingTop: '0px', paddingBottom: '0px' },
                defaultAnimation: { entrance: 'fade-in', hover: 'none' }
            },
        ]
    },
]

// Flat map for quick lookup
const ALL_BLOCK_TEMPLATES: Record<string, BlockTemplate> = {}
BLOCK_CATEGORIES.forEach(cat => cat.blocks.forEach(b => { ALL_BLOCK_TEMPLATES[b.type] = b }))

function createBlockFromTemplate(type: string): BuilderBlock {
    const tpl = ALL_BLOCK_TEMPLATES[type]
    if (!tpl) throw new Error(`Unknown block type: ${type}`)
    return {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type,
        props: JSON.parse(JSON.stringify(tpl.defaultProps || {})),
        animation: JSON.parse(JSON.stringify(tpl.defaultAnimation || { entrance: 'none', hover: 'none' })),
        styles: JSON.parse(JSON.stringify(tpl.defaultStyles || { paddingTop: '80px', paddingBottom: '80px' }))
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR DRAGGABLE ELEMENT CARD
// ─────────────────────────────────────────────────────────────────────────────
function DraggableBlockCard({ template, onHover, onLeave }: { template: BlockTemplate, onHover?: () => void, onLeave?: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `template::${template.type}`,
        data: { kind: 'template', blockType: template.type }
    })
    const Icon = template.icon
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none
                ${isDragging ? 'opacity-30 scale-95' : 'border-border bg-card/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/5'}
            `}
        >
            <div className={`w-full aspect-[3/2] rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform`}>
                <Icon className="size-4 text-foreground/70" />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight line-clamp-1 w-full">
                {template.label}
            </span>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS DROPPABLE ZONE (between blocks)
// ─────────────────────────────────────────────────────────────────────────────
function CanvasDropZone({ index, isOver }: { index: number; isOver: boolean }) {
    const { setNodeRef, isOver: localOver } = useDroppable({ id: `dropzone::${index}` })
    const active = isOver || localOver
    return (
        <div ref={setNodeRef} className={`relative h-2 mx-4 transition-all duration-200 ${active ? 'h-16' : ''}`}>
            <div className={`absolute inset-0 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center
                ${active ? 'border-primary bg-primary/5 opacity-100' : 'border-transparent opacity-0'}`}>
                {active && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Plus className="size-3" /> Drop here
                    </span>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS SORTABLE BLOCK WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function SortableCanvasBlock({
    block, isSelected, onSelect, onDelete, onDuplicate, children
}: {
    block: BuilderBlock
    isSelected: boolean
    onSelect: () => void
    onDelete: () => void
    onDuplicate: () => void
    children: React.ReactNode
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: block.id,
        data: { kind: 'block', blockId: block.id }
    })
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : undefined,
    }
    return (
        <div ref={setNodeRef} style={style} className="relative group/block w-full">
            {/* Selection border */}
            <div
                onClick={onSelect}
                className={`relative cursor-pointer transition-all duration-150 ${isSelected ? 'ring-2 ring-primary ring-inset ring-offset-0' : 'hover:ring-1 hover:ring-primary/30 hover:ring-inset'}`}
            >
                {children}

                {/* Floating toolbar */}
                <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 transition-all duration-150 pointer-events-none
                    ${isSelected || false ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover/block:opacity-100 group-hover/block:pointer-events-auto'}`}>
                    <div className="flex bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-xl overflow-hidden">
                        <div {...attributes} {...listeners}
                            className="p-2 text-muted-foreground cursor-grab active:cursor-grabbing hover:bg-secondary hover:text-foreground transition-colors"
                            onClick={e => e.stopPropagation()}>
                            <Move className="size-3.5" />
                        </div>
                        <div className="w-px bg-border" />
                        <button onClick={e => { e.stopPropagation(); onSelect() }}
                            className={`p-2 transition-colors hover:bg-secondary ${isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Settings2 className="size-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); onDuplicate() }}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                            <Copy className="size-3.5" />
                        </button>
                        <div className="w-px bg-border" />
                        <button onClick={e => { e.stopPropagation(); onDelete() }}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 transition-colors">
                            <Trash2 className="size-3.5" />
                        </button>
                    </div>
                </div>

                {/* Block type label */}
                {isSelected && (
                    <div className="absolute top-2 left-2 z-40">
                        <span className="px-2 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                            {block.type.replace(/-/g, ' ')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER ITEM (in layer panel)
// ─────────────────────────────────────────────────────────────────────────────
function LayerItem({ block, isActive, onSelect, onDelete }: {
    block: BuilderBlock
    isActive: boolean
    onSelect: () => void
    onDelete: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
    const Icon = ALL_BLOCK_TEMPLATES[block.type]?.icon || SquareDot
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
            onClick={onSelect}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1
                ${isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary border border-transparent'}`}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <GripVertical className="size-3" />
            </div>
            <div className={`size-6 rounded-md flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-secondary'}`}>
                <Icon className="size-3 text-muted-foreground" />
            </div>
            <span className="flex-1 text-[11px] font-semibold capitalize truncate">{block.type.replace(/-/g, ' ')}</span>
            <button onClick={e => { e.stopPropagation(); onDelete() }}
                className="size-5 rounded-md flex items-center justify-center text-rose-500 opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 transition-all">
                <Trash2 className="size-2.5" />
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROL HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function ControlLabel({ children }: { children: React.ReactNode }) {
    return <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">{children}</label>
}

function ColorControl({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
    return (
        <div>
            <ControlLabel>{label}</ControlLabel>
            <div className="flex gap-2">
                <div className="relative shrink-0">
                    <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                        className="size-8 rounded-lg overflow-hidden border border-border bg-transparent cursor-pointer opacity-0 absolute inset-0 z-10" />
                    <div className="size-8 rounded-lg border border-border shadow-sm" style={{ background: value || '#000000' }} />
                </div>
                <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
                    placeholder="inherit"
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
            </div>
        </div>
    )
}

function TextControl({ label, value, onChange, rows = 1, placeholder }: { label: string; value?: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
    return (
        <div>
            <ControlLabel>{label}</ControlLabel>
            {rows > 1 ? (
                <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none transition-colors resize-none" />
            ) : (
                <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none transition-colors" />
            )}
        </div>
    )
}

function SelectControl({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div>
            <ControlLabel>{label}</ControlLabel>
            <select value={value || ''} onChange={e => onChange(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer">
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    )
}

function SpacingControl({ label, topKey, rightKey, bottomKey, leftKey, values, onChange, linked = false }: {
    label: string
    topKey: string
    rightKey: string
    bottomKey: string
    leftKey: string
    values: Record<string, string | undefined>
    onChange: (key: string, val: string) => void
    linked?: boolean
}) {
    const [isLinked, setIsLinked] = useState(linked)

    const handleChange = (key: string, val: string) => {
        if (isLinked) {
            onChange(topKey, val)
            onChange(rightKey, val)
            onChange(bottomKey, val)
            onChange(leftKey, val)
        } else {
            onChange(key, val)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <ControlLabel>{label}</ControlLabel>
                <button onClick={() => setIsLinked(!isLinked)}
                    className={`size-5 rounded-md flex items-center justify-center transition-colors ${isLinked ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}>
                    {isLinked ? <Lock className="size-2.5" /> : <Unlock className="size-2.5" />}
                </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
                {[
                    { key: topKey, placeholder: 'T' },
                    { key: rightKey, placeholder: 'R' },
                    { key: bottomKey, placeholder: 'B' },
                    { key: leftKey, placeholder: 'L' },
                ].map(({ key, placeholder }) => (
                    <div key={key} className="relative">
                        <input type="text" value={values[key] || ''} onChange={e => handleChange(key, e.target.value)}
                            placeholder={placeholder}
                            className="w-full bg-secondary border border-border rounded-lg px-2 py-2 text-[10px] font-mono text-center focus:border-primary focus:outline-none transition-colors" />
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-1 px-0.5">
                {['Top', 'Right', 'Bottom', 'Left'].map(s => (
                    <span key={s} className="text-[8px] text-muted-foreground w-1/4 text-center">{s}</span>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV LINKS EDITOR — dedicated editor for header navigation links
// ─────────────────────────────────────────────────────────────────────────────
function NavLinksEditor({
    links,
    onChange,
    storeId,
    config,
    onPagesChange,
}: {
    links: { label: string; href: string }[]
    onChange: (links: { label: string; href: string }[]) => void
    storeId: string
    config: ThemeConfig
    onPagesChange: (pages: ThemeConfig['customPages']) => void
}) {
    const [creatingFor, setCreatingFor] = useState<number | null>(null)
    const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // All known pages (system + custom)
    const allPages = [
        { slug: 'home', title: 'Home', href: '/' },
        { slug: 'collection', title: 'All Products', href: '/collection' },
        ...(config.customPages || []).map(p => ({ slug: p.slug, title: p.title, href: `/${p.slug}` }))
    ]

    const addLink = () => {
        const newLink = { label: 'New Link', href: '/new-page' }
        onChange([...links, newLink])
    }

    const updateLink = (idx: number, field: 'label' | 'href', val: string) => {
        const updated = links.map((l, i) => i === idx ? { ...l, [field]: val } : l)
        onChange(updated)
    }

    const removeLink = (idx: number) => onChange(links.filter((_, i) => i !== idx))

    // Auto-create page when href doesn't match any existing page
    const handleCreatePage = async (idx: number, href: string) => {
        const slug = slugify(href.replace(/^\//, ''))
        if (!slug) return
        const title = links[idx]?.label || slug
        setCreatingFor(idx)
        try {
            const res = await createCustomPage(storeId, slug, title)
            if (res.success) {
                // Update the href to the clean slug
                const updated = links.map((l, i) => i === idx ? { ...l, href: `/${slug}` } : l)
                onChange(updated)
                onPagesChange([...(config.customPages || []), { slug, title, content: '' }])
                toast.success(`Page "${title}" created and linked! ✨`)
            } else {
                toast.error(res.error || 'Failed to create page')
            }
        } finally {
            setCreatingFor(null)
        }
    }

    const isKnownPage = (href: string) =>
        allPages.some(p => p.href === href || href === '/' + p.slug)

    return (
        <div className="space-y-2">
            {links.map((link, idx) => {
                const hrefSlug = link.href.replace(/^\//, '')
                const known = isKnownPage(link.href)
                const isExternal = link.href.startsWith('http')
                const creating = creatingFor === idx

                return (
                    <div key={idx} className="rounded-xl border border-border bg-secondary/40 overflow-hidden">
                        {/* Link header row */}
                        <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={link.label}
                                    onChange={e => updateLink(idx, 'label', e.target.value)}
                                    placeholder="Label"
                                    className="w-full bg-transparent text-xs font-bold border-none outline-none placeholder:text-muted-foreground/50"
                                />
                            </div>
                            <button
                                onClick={() => removeLink(idx)}
                                className="size-4 flex items-center justify-center text-rose-400 hover:text-rose-500 transition-colors shrink-0"
                            >
                                <X className="size-3" />
                            </button>
                        </div>

                        {/* URL row */}
                        <div className="px-3 pb-2.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 bg-background rounded-lg border border-border px-2.5 py-1.5">
                                {isExternal ? (
                                    <Globe className="size-3 text-muted-foreground shrink-0" />
                                ) : (
                                    <Link2 className="size-3 text-muted-foreground shrink-0" />
                                )}
                                <input
                                    type="text"
                                    value={link.href}
                                    onChange={e => updateLink(idx, 'href', e.target.value)}
                                    placeholder="/page-slug or https://..."
                                    className="flex-1 bg-transparent text-[10px] font-mono border-none outline-none min-w-0"
                                />
                                {/* Status indicator */}
                                {!isExternal && (
                                    known
                                        ? <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                        : <div className="size-2 rounded-full bg-amber-400 shrink-0" />
                                )}
                            </div>

                            {/* Quick-select existing pages */}
                            <div className="flex flex-wrap gap-1">
                                {allPages.map(p => (
                                    <button
                                        key={p.slug}
                                        onClick={() => updateLink(idx, 'href', p.href)}
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest transition-colors ${
                                            link.href === p.href
                                                ? 'bg-primary text-white'
                                                : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        {p.title}
                                    </button>
                                ))}
                            </div>

                            {/* Auto-create page button for unknown internal URLs */}
                            {!isExternal && !known && hrefSlug && hrefSlug !== 'new-page' && (
                                <button
                                    onClick={() => handleCreatePage(idx, link.href)}
                                    disabled={creating}
                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {creating
                                        ? <RefreshCw className="size-2.5 animate-spin" />
                                        : <PlusCircle className="size-2.5" />
                                    }
                                    {creating ? 'Creating...' : `Create page "/${hrefSlug}"`}
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}

            {links.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-3 opacity-50">No links yet. Add one below.</p>
            )}

            <button
                onClick={addLink}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
                <Plus className="size-3" /> Add Nav Link
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PROP EDITOR (smart, handles arrays)
// ─────────────────────────────────────────────────────────────────────────────
function BlockContentEditor({ block, onUpdateProp, storeId, config, onPagesChange }: {
    block: BuilderBlock
    onUpdateProp: (key: string, value: any) => void
    storeId: string
    config: ThemeConfig
    onPagesChange: (pages: ThemeConfig['customPages']) => void
}) {
    const props = block.props

    return (
        <div className="space-y-5">
            {Object.entries(props).map(([key, value]) => {
                // ── LINKS ARRAY (nav links for header blocks) ──
                const isLinksField = key === 'links' && Array.isArray(value) &&
                    (value.length === 0 || (typeof value[0] === 'object' && ('href' in value[0] || 'label' in value[0])))

                if (isLinksField) {
                    return (
                        <div key={key}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-1.5 rounded-full bg-primary" />
                                <ControlLabel>Navigation Links</ControlLabel>
                            </div>
                            <NavLinksEditor
                                links={value as { label: string; href: string }[]}
                                onChange={v => onUpdateProp(key, v)}
                                storeId={storeId}
                                config={config}
                                onPagesChange={onPagesChange}
                            />
                        </div>
                    )
                }

                // ── GENERIC ARRAY (items, features, etc.) ──
                if (Array.isArray(value)) {
                    // Infer a sensible default shape from the first item
                    const firstItem = value[0]
                    const defaultItem = firstItem && typeof firstItem === 'object'
                        ? Object.fromEntries(Object.keys(firstItem).map(k => [k, '']))
                        : firstItem !== undefined ? '' : { title: '', desc: '' }

                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                                <ControlLabel>{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</ControlLabel>
                                <button
                                    onClick={() => onUpdateProp(key, [...value, defaultItem])}
                                    className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                                    <Plus className="size-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {(value as any[]).map((item, idx) => (
                                    <div key={idx} className="p-3 bg-secondary/50 rounded-xl border border-border/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Item {idx + 1}</span>
                                            <button
                                                onClick={() => onUpdateProp(key, value.filter((_: any, i: number) => i !== idx))}
                                                className="size-4 flex items-center justify-center text-rose-400 hover:text-rose-500 transition-colors">
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                        {typeof item === 'object' && item !== null ? (
                                            <div className="space-y-2">
                                                {Object.entries(item).map(([iKey, iVal]) => (
                                                    <div key={iKey}>
                                                        <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1 block">{iKey}</label>
                                                        <input
                                                            type="text"
                                                            value={String(iVal || '')}
                                                            onChange={e => {
                                                                const updated = [...value]
                                                                updated[idx] = { ...item, [iKey]: e.target.value }
                                                                onUpdateProp(key, updated)
                                                            }}
                                                            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] focus:border-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <input type="text" value={String(item || '')}
                                                onChange={e => {
                                                    const updated = [...value]
                                                    updated[idx] = e.target.value
                                                    onUpdateProp(key, updated)
                                                }}
                                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] focus:border-primary focus:outline-none transition-colors"
                                            />
                                        )}
                                    </div>
                                ))}
                                {value.length === 0 && (
                                    <p className="text-[10px] text-muted-foreground text-center py-3 opacity-50">No items yet</p>
                                )}
                            </div>
                        </div>
                    )
                }

                // Boolean toggle
                if (typeof value === 'boolean') {
                    return (
                        <div key={key} className="flex items-center justify-between">
                            <ControlLabel>{key.replace(/([A-Z])/g, ' $1')}</ControlLabel>
                            <button
                                onClick={() => onUpdateProp(key, !value)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-secondary border border-border'}`}
                            >
                                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    )
                }

                // Number
                if (typeof value === 'number') {
                    return (
                        <div key={key}>
                            <ControlLabel>{key.replace(/([A-Z])/g, ' $1')}</ControlLabel>
                            <input type="number" value={value}
                                onChange={e => onUpdateProp(key, parseInt(e.target.value, 10))}
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                    )
                }

                // Image URL
                if (typeof value === 'string' && (key.toLowerCase().includes('image') || key.toLowerCase().includes('img') || key.toLowerCase().includes('bg') || key.toLowerCase().includes('logo'))) {
                    return (
                        <div key={key}>
                            <ControlLabel>{key.replace(/([A-Z])/g, ' $1')}</ControlLabel>
                            {value && <img src={value} alt="" className="w-full h-24 object-cover rounded-xl mb-2 border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                            <input type="text" value={value || ''}
                                onChange={e => onUpdateProp(key, e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                    )
                }

                // URL
                if (typeof value === 'string' && (key.toLowerCase().includes('url') || key.toLowerCase().includes('href') || key.toLowerCase().includes('link'))) {
                    return (
                        <div key={key}>
                            <ControlLabel>{key.replace(/([A-Z])/g, ' $1')}</ControlLabel>
                            <div className="flex gap-2 items-center">
                                <Link className="size-3.5 text-muted-foreground shrink-0" />
                                <input type="text" value={value || ''}
                                    onChange={e => onUpdateProp(key, e.target.value)}
                                    placeholder="/path or https://..."
                                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                            </div>
                        </div>
                    )
                }

                // Regular string
                if (typeof value === 'string') {
                    const isLong = value.length > 80 || key.toLowerCase().includes('content') || key.toLowerCase().includes('description') || key.toLowerCase().includes('text')
                    return (
                        <div key={key}>
                            <ControlLabel>{key.replace(/([A-Z])/g, ' $1')}</ControlLabel>
                            {isLong ? (
                                <textarea value={value}
                                    onChange={e => onUpdateProp(key, e.target.value)}
                                    rows={3}
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none transition-colors resize-none" />
                            ) : (
                                <input type="text" value={value}
                                    onChange={e => onUpdateProp(key, e.target.value)}
                                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none transition-colors" />
                            )}
                        </div>
                    )
                }

                return null
            })}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK STYLE EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function BlockStyleEditor({ block, onUpdateStyle }: {
    block: BuilderBlock
    onUpdateStyle: (key: string, value: string) => void
}) {
    const s = block.styles || {}
    const [bgMode, setBgMode] = useState<'color' | 'image' | 'gradient'>('color')

    return (
        <div className="space-y-8">
            {/* Layout */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Layout</span>
                </div>
                <div className="space-y-4">
                    <SpacingControl
                        label="Padding"
                        topKey="paddingTop" rightKey="paddingRight" bottomKey="paddingBottom" leftKey="paddingLeft"
                        values={s as any}
                        onChange={onUpdateStyle}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <ControlLabel>Max Width</ControlLabel>
                            <input type="text" value={s.maxWidth || ''} onChange={e => onUpdateStyle('maxWidth', e.target.value)}
                                placeholder="100%" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <ControlLabel>Min Height</ControlLabel>
                            <input type="text" value={s.minHeight || ''} onChange={e => onUpdateStyle('minHeight', e.target.value)}
                                placeholder="auto" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Background */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-1.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Background</span>
                </div>
                <div className="flex gap-1 mb-4 p-1 bg-secondary rounded-xl">
                    {(['color', 'image'] as const).map(m => (
                        <button key={m} onClick={() => setBgMode(m)}
                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${bgMode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                            {m}
                        </button>
                    ))}
                </div>
                {bgMode === 'color' && <ColorControl label="Background Color" value={s.backgroundColor} onChange={v => onUpdateStyle('backgroundColor', v)} />}
                {bgMode === 'image' && (
                    <div className="space-y-3">
                        <TextControl label="Image URL" value={s.backgroundImage?.replace(/url\(['"]?|['"]?\)/g, '')} onChange={v => onUpdateStyle('backgroundImage', `url('${v}')`)} placeholder="https://..." />
                        <SelectControl label="Size" value={s.backgroundSize} onChange={v => onUpdateStyle('backgroundSize', v)}
                            options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: '100% 100%', label: 'Stretch' }, { value: 'auto', label: 'Auto' }]} />
                        <SelectControl label="Position" value={s.backgroundPosition} onChange={v => onUpdateStyle('backgroundPosition', v)}
                            options={[{ value: 'center', label: 'Center' }, { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} />
                    </div>
                )}
            </div>

            {/* Typography */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Typography</span>
                </div>
                <div className="space-y-4">
                    <ColorControl label="Text Color" value={s.textColor} onChange={v => onUpdateStyle('textColor', v)} />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <ControlLabel>Font Size</ControlLabel>
                            <input type="text" value={s.fontSize || ''} onChange={e => onUpdateStyle('fontSize', e.target.value)}
                                placeholder="inherit" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                        <SelectControl label="Font Weight" value={s.fontWeight} onChange={v => onUpdateStyle('fontWeight', v)}
                            options={[
                                { value: '', label: 'Inherit' },
                                { value: '400', label: 'Normal' },
                                { value: '500', label: 'Medium' },
                                { value: '600', label: 'Semibold' },
                                { value: '700', label: 'Bold' },
                                { value: '800', label: 'Extrabold' },
                                { value: '900', label: 'Black' }
                            ]} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <ControlLabel>Letter Spacing</ControlLabel>
                            <input type="text" value={s.letterSpacing || ''} onChange={e => onUpdateStyle('letterSpacing', e.target.value)}
                                placeholder="normal" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <ControlLabel>Line Height</ControlLabel>
                            <input type="text" value={s.lineHeight || ''} onChange={e => onUpdateStyle('lineHeight', e.target.value)}
                                placeholder="normal" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Border */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-1.5 rounded-full bg-purple-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Border</span>
                </div>
                <div className="space-y-4">
                    <ColorControl label="Border Color" value={s.borderColor} onChange={v => onUpdateStyle('borderColor', v)} />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <ControlLabel>Border Width</ControlLabel>
                            <input type="text" value={s.borderWidth || ''} onChange={e => onUpdateStyle('borderWidth', e.target.value)}
                                placeholder="0px" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <ControlLabel>Border Radius</ControlLabel>
                            <input type="text" value={s.borderRadius || ''} onChange={e => onUpdateStyle('borderRadius', e.target.value)}
                                placeholder="0px" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Effects */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Effects</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <ControlLabel>Opacity</ControlLabel>
                        <div className="flex items-center gap-3">
                            <input type="range" min="0" max="1" step="0.01" value={parseFloat(s.opacity || '1')}
                                onChange={e => onUpdateStyle('opacity', e.target.value)}
                                className="flex-1 accent-primary" />
                            <span className="text-xs font-mono w-10 text-right">{parseFloat(s.opacity || '1').toFixed(2)}</span>
                        </div>
                    </div>
                    <TextControl label="Box Shadow" value={s.boxShadow} onChange={v => onUpdateStyle('boxShadow', v)}
                        placeholder="0 4px 20px rgba(0,0,0,0.1)" />
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SETTINGS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function GlobalSettingsPanel({ config, onUpdate }: { config: ThemeConfig; onUpdate: (path: string, value: any) => void }) {
    const [activeSection, setActiveSection] = useState<'brand' | 'typo' | 'header' | 'footer' | 'site'>('brand')

    const sections = [
        { id: 'brand', label: 'Brand', icon: Palette },
        { id: 'typo', label: 'Typography', icon: Type },
        { id: 'header', label: 'Header', icon: AlignCenter },
        { id: 'footer', label: 'Footer', icon: Layout },
        { id: 'site', label: 'Site', icon: Globe },
    ] as const

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-border">
                <div className="flex gap-1">
                    {sections.map(s => {
                        const Icon = s.icon
                        return (
                            <button key={s.id} onClick={() => setActiveSection(s.id)}
                                className={`flex-1 py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-center
                                    ${activeSection === s.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                                <Icon className="size-3.5" />
                                <span className="text-[8px] font-bold uppercase tracking-widest hidden sm:block">{s.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {activeSection === 'brand' && (
                    <div className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Brand Colors</h3>
                        <ColorControl label="Primary Color" value={config.branding.primaryColor}
                            onChange={v => onUpdate('branding.primaryColor', v)} />
                        <ColorControl label="Secondary Color" value={config.branding.secondaryColor}
                            onChange={v => onUpdate('branding.secondaryColor', v)} />
                        <ColorControl label="Accent Color" value={config.styles.accentColor}
                            onChange={v => onUpdate('styles.accentColor', v)} />
                        <div className="pt-2 border-t border-border">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Brand Identity</h3>
                            <TextControl label="Store Name" value={config.branding.storeName}
                                onChange={v => onUpdate('branding.storeName', v)} />
                            <div className="mt-4">
                                <TextControl label="Logo URL" value={config.branding.logoUrl}
                                    onChange={v => onUpdate('branding.logoUrl', v)} placeholder="https://..." />
                                {config.branding.logoUrl && <img src={config.branding.logoUrl} alt="logo" className="mt-2 h-10 object-contain rounded border border-border" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'typo' && (
                    <div className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Typography</h3>
                        <SelectControl label="Heading Font" value={config.styles.headingFont || config.branding.fontFamily}
                            onChange={v => onUpdate('styles.headingFont', v)}
                            options={[
                                { value: 'Inter', label: 'Inter' },
                                { value: 'Outfit', label: 'Outfit' },
                                { value: 'Syne', label: 'Syne' },
                                { value: 'DM Sans', label: 'DM Sans' },
                                { value: 'Space Grotesk', label: 'Space Grotesk' },
                                { value: 'Playfair Display', label: 'Playfair Display' },
                                { value: 'Cormorant', label: 'Cormorant' },
                                { value: 'Bebas Neue', label: 'Bebas Neue' },
                                { value: 'Oswald', label: 'Oswald' },
                            ]} />
                        <SelectControl label="Body Font" value={config.styles.bodyFont || config.branding.fontFamily}
                            onChange={v => onUpdate('styles.bodyFont', v)}
                            options={[
                                { value: 'Inter', label: 'Inter' },
                                { value: 'Outfit', label: 'Outfit' },
                                { value: 'DM Sans', label: 'DM Sans' },
                                { value: 'Nunito', label: 'Nunito' },
                                { value: 'Lato', label: 'Lato' },
                                { value: 'Source Sans 3', label: 'Source Sans 3' },
                            ]} />
                    </div>
                )}

                {activeSection === 'header' && (
                    <div className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Header Settings</h3>
                        <div className="flex items-center justify-between">
                            <ControlLabel>Sticky Header</ControlLabel>
                            <button onClick={() => onUpdate('navigation.sticky', !config.navigation.sticky)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${config.navigation.sticky ? 'bg-primary' : 'bg-secondary border border-border'}`}>
                                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${config.navigation.sticky ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <ControlLabel>Show Cart Icon</ControlLabel>
                            <button onClick={() => onUpdate('navigation.showCart', !config.navigation.showCart)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${config.navigation.showCart ? 'bg-primary' : 'bg-secondary border border-border'}`}>
                                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${config.navigation.showCart ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <ControlLabel>Navigation Links</ControlLabel>
                                <button onClick={() => onUpdate('navigation.links', [...config.navigation.links, { label: 'New Page', href: '/new' }])}
                                    className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                                    <Plus className="size-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {config.navigation.links.map((link, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input type="text" value={link.label}
                                            onChange={e => {
                                                const updated = [...config.navigation.links]
                                                updated[i] = { ...link, label: e.target.value }
                                                onUpdate('navigation.links', updated)
                                            }}
                                            className="flex-1 bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none transition-colors"
                                            placeholder="Label" />
                                        <input type="text" value={link.href}
                                            onChange={e => {
                                                const updated = [...config.navigation.links]
                                                updated[i] = { ...link, href: e.target.value }
                                                onUpdate('navigation.links', updated)
                                            }}
                                            className="flex-1 bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none transition-colors"
                                            placeholder="/path" />
                                        <button onClick={() => onUpdate('navigation.links', config.navigation.links.filter((_, j) => j !== i))}
                                            className="size-6 flex items-center justify-center text-rose-400 hover:text-rose-500 transition-colors shrink-0">
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'footer' && (
                    <div className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Footer Settings</h3>
                        <TextControl label="Copyright Text" value={config.footer.text}
                            onChange={v => onUpdate('footer.text', v)} />
                        <div className="flex items-center justify-between">
                            <ControlLabel>Show Social Icons</ControlLabel>
                            <button onClick={() => onUpdate('footer.showSocial', !config.footer.showSocial)}
                                className={`relative w-10 h-5 rounded-full transition-colors ${config.footer.showSocial ? 'bg-primary' : 'bg-secondary border border-border'}`}>
                                <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${config.footer.showSocial ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                        <ColorControl label="Footer Background" value={config.footer.bgColor} onChange={v => onUpdate('footer.bgColor', v)} />
                    </div>
                )}

                {activeSection === 'site' && (
                    <div className="space-y-5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Site-Wide Settings</h3>
                        <ColorControl label="Site Background" value={config.styles.bgColor} onChange={v => onUpdate('styles.bgColor', v)} />
                        <ColorControl label="Default Text Color" value={config.styles.textColor} onChange={v => onUpdate('styles.textColor', v)} />
                        <ColorControl label="Card Background" value={config.styles.cardBg} onChange={v => onUpdate('styles.cardBg', v)} />
                        <ColorControl label="Border Color" value={config.styles.borderColor} onChange={v => onUpdate('styles.borderColor', v)} />
                        <SelectControl label="Currency" value={config.branding.currency || 'USD'}
                            onChange={v => onUpdate('branding.currency', v)}
                            options={[
                                { value: 'USD', label: 'USD ($)' },
                                { value: 'EUR', label: 'EUR (€)' },
                                { value: 'GBP', label: 'GBP (£)' },
                                { value: 'JPY', label: 'JPY (¥)' },
                                { value: 'CAD', label: 'CAD ($)' },
                                { value: 'AUD', label: 'AUD ($)' },
                                { value: 'INR', label: 'INR (₹)' },
                            ]} />
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGES PANEL
// ─────────────────────────────────────────────────────────────────────────────
function PagesPanel({
    config, storeId, currentPage, onPageChange, onConfigUpdate
}: {
    config: ThemeConfig
    storeId: string
    currentPage: string
    onPageChange: (slug: string) => void
    onConfigUpdate: (newConfig: ThemeConfig) => void
}) {
    const [newPageTitle, setNewPageTitle] = useState('')
    const [newPageSlug, setNewPageSlug] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

    const slugify = (v: string) => v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const handleCreate = async () => {
        if (!newPageSlug || !newPageTitle) return
        setIsCreating(true)
        const res = await createCustomPage(storeId, newPageSlug, newPageTitle)
        if (res.success) {
            toast.success(`Page "${newPageTitle}" created!`)
            onConfigUpdate({
                ...config,
                customPages: [...(config.customPages || []), { slug: newPageSlug, title: newPageTitle, content: '' }],
                pageBlocks: { ...(config.pageBlocks || {}), [newPageSlug]: [] },
                navigation: {
                    ...config.navigation,
                    links: [...(config.navigation?.links || []), { label: newPageTitle, href: `/${newPageSlug}` }]
                }
            })
            onPageChange(newPageSlug)
            setNewPageTitle('')
            setNewPageSlug('')
            setShowForm(false)
        } else {
            toast.error(res.error || 'Failed to create page')
        }
        setIsCreating(false)
    }

    const handleDelete = async (slug: string) => {
        setDeletingSlug(slug)
        const res = await deleteCustomPage(storeId, slug)
        if (res.success) {
            toast.success('Page deleted')
            const newPageBlocks = { ...(config.pageBlocks || {}) }
            delete newPageBlocks[slug]
            onConfigUpdate({
                ...config,
                customPages: (config.customPages || []).filter(p => p.slug !== slug),
                pageBlocks: newPageBlocks,
                navigation: {
                    ...config.navigation,
                    links: (config.navigation?.links || []).filter(l => l.href !== `/${slug}`)
                }
            })
            if (currentPage === slug) onPageChange('home')
        } else {
            toast.error(res.error || 'Failed to delete page')
        }
        setDeletingSlug(null)
    }

    const pages = [
        { slug: 'home', title: 'Home', isSystem: true },
        ...(config.customPages || []).map(p => ({ ...p, isSystem: false }))
    ]

    return (
        <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pages</span>
                <button onClick={() => setShowForm(!showForm)}
                    className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
                    {showForm ? <X className="size-3" /> : <Plus className="size-3" />}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="p-3 bg-secondary/50 rounded-xl border border-border space-y-3 mb-3">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">New Page</h4>
                            <div>
                                <ControlLabel>Page Title</ControlLabel>
                                <input type="text" value={newPageTitle}
                                    onChange={e => { setNewPageTitle(e.target.value); setNewPageSlug(slugify(e.target.value)) }}
                                    placeholder="About Us"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs focus:border-primary focus:outline-none transition-colors" />
                            </div>
                            <div>
                                <ControlLabel>URL Slug</ControlLabel>
                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground text-xs">/</span>
                                    <input type="text" value={newPageSlug}
                                        onChange={e => setNewPageSlug(slugify(e.target.value))}
                                        placeholder="about-us"
                                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors" />
                                </div>
                            </div>
                            <button onClick={handleCreate} disabled={isCreating || !newPageSlug || !newPageTitle}
                                className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
                                {isCreating ? <RefreshCw className="size-3 animate-spin" /> : <Plus className="size-3" />}
                                Create Page
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-1">
                {pages.map(page => (
                    <div key={page.slug}
                        onClick={() => onPageChange(page.slug)}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                            ${currentPage === page.slug ? 'bg-primary/10 border border-primary/30 text-primary' : 'hover:bg-secondary border border-transparent text-foreground'}`}
                    >
                        {page.isSystem ? <Home className="size-3.5 shrink-0 opacity-70" /> : <FileText className="size-3.5 shrink-0 opacity-70" />}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{page.title}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">/{page.slug === 'home' ? '' : page.slug}</p>
                        </div>
                        {!page.isSystem && (
                            <button
                                onClick={e => { e.stopPropagation(); handleDelete(page.slug) }}
                                disabled={deletingSlug === page.slug}
                                className="size-5 flex items-center justify-center text-rose-400 opacity-100 hover:text-rose-500 transition-all shrink-0 disabled:opacity-50"
                            >
                                {deletingSlug === page.slug ? <RefreshCw className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VISUAL BUILDER
// ─────────────────────────────────────────────────────────────────────────────
type Device = 'desktop' | 'tablet' | 'mobile'
type LeftTab = 'elements' | 'pages' | 'layers'
type RightTab = 'content' | 'style' | 'animate'

export default function VisualBuilder({
    initialConfig, products, storeId, storeDomain
}: {
    initialConfig: ThemeConfig
    products: any[]
    storeId: string
    storeDomain?: string
}) {
    const [mounted, setMounted] = useState(false)
    const [config, setConfig] = useState<ThemeConfig>(initialConfig)
    const [currentPage, setCurrentPage] = useState<string>('home')
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
    const [device, setDevice] = useState<Device>('desktop')
    const [isPreview, setIsPreview] = useState(false)
    const [leftTab, setLeftTab] = useState<LeftTab>('layers')
    const [rightTab, setRightTab] = useState<RightTab>('content')
    const [isSaving, startSave] = useTransition()
    const [activeDragId, setActiveDragId] = useState<string | null>(null)
    const [activeDragData, setActiveDragData] = useState<any>(null)
    const [overDropzone, setOverDropzone] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [previewTemplate, setPreviewTemplate] = useState<BlockTemplate | null>(null)
    // Responsive panel visibility
    const [leftPanelOpen, setLeftPanelOpen] = useState(true)
    const [rightPanelOpen, setRightPanelOpen] = useState(true)
    const canvasRef = useRef<HTMLDivElement>(null)

    useEffect(() => { setMounted(true) }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Get blocks for current page
    const getCurrentBlocks = useCallback((): BuilderBlock[] => {
        const homeBlocks = config.pageBlocks?.home ?? config.blocks ?? []
        if (currentPage === 'home') return homeBlocks

        let localBlocks = config.pageBlocks?.[currentPage] ?? []
        
        // Auto-inject system blocks if the page is empty, to match storefront behavior
        if (localBlocks.length === 0) {
            if (currentPage === 'checkout') {
                localBlocks = [{
                    id: 'default-checkout',
                    type: 'system-checkout',
                    props: {},
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }]
            } else if (currentPage === 'product') {
                localBlocks = [{
                    id: 'default-product',
                    type: 'system-product-details',
                    props: {},
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }]
            }
        }
        
        // Dynamic global header/footer
        const globalHeader = homeBlocks.find(b => b.type.startsWith('header-'))
        const globalFooter = homeBlocks.find(b => b.type.startsWith('footer-'))
        const hasHeader = localBlocks.some(b => b.type.startsWith('header-'))
        const hasFooter = localBlocks.some(b => b.type.startsWith('footer-'))

        let finalBlocks = [...localBlocks]
        if (globalHeader && !hasHeader) finalBlocks.unshift(globalHeader)
        if (globalFooter && !hasFooter) finalBlocks.push(globalFooter)

        return finalBlocks
    }, [config, currentPage])

    // Set blocks for current page
    const setCurrentBlocks = useCallback((blocks: BuilderBlock[] | ((prev: BuilderBlock[]) => BuilderBlock[])) => {
        setConfig(prev => {
            const currentBlocks = currentPage === 'home'
                ? (prev.pageBlocks?.home ?? prev.blocks ?? [])
                : (prev.pageBlocks?.[currentPage] ?? [])
            const newBlocks = typeof blocks === 'function' ? blocks(currentBlocks) : blocks
            const newPageBlocks = { ...(prev.pageBlocks || {}), [currentPage]: newBlocks }
            return {
                ...prev,
                blocks: currentPage === 'home' ? newBlocks : prev.blocks,
                pageBlocks: newPageBlocks
            }
        })
    }, [currentPage])

    const currentBlocks = getCurrentBlocks()
    const activeBlock = currentBlocks.find(b => b.id === activeBlockId)

    // Config deep update helper
    const updateConfigPath = useCallback((path: string, value: any) => {
        setConfig(prev => {
            const keys = path.split('.')
            const updated = JSON.parse(JSON.stringify(prev))
            let cursor: any = updated
            for (let i = 0; i < keys.length - 1; i++) {
                cursor = cursor[keys[i]] = cursor[keys[i]] ?? {}
            }
            cursor[keys[keys.length - 1]] = value
            return updated
        })
    }, [])

    // Block operations
    const addBlock = useCallback((type: string, insertAtIndex?: number) => {
        const block = createBlockFromTemplate(type)
        setCurrentBlocks(prev => {
            const next = [...prev]
            if (insertAtIndex !== undefined) {
                next.splice(insertAtIndex, 0, block)
            } else {
                next.push(block)
            }
            return next
        })
        setActiveBlockId(block.id)
        toast.success(`Added ${ALL_BLOCK_TEMPLATES[type]?.label || type}`)
    }, [setCurrentBlocks])

    const deleteBlock = useCallback((id: string) => {
        setCurrentBlocks(prev => prev.filter(b => b.id !== id))
        if (activeBlockId === id) setActiveBlockId(null)
    }, [setCurrentBlocks, activeBlockId])

    const duplicateBlock = useCallback((id: string) => {
        setCurrentBlocks(prev => {
            const idx = prev.findIndex(b => b.id === id)
            if (idx === -1) return prev
            const orig = prev[idx]
            const copy: BuilderBlock = {
                ...JSON.parse(JSON.stringify(orig)),
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
            }
            const next = [...prev]
            next.splice(idx + 1, 0, copy)
            return next
        })
        toast.success('Section duplicated')
    }, [setCurrentBlocks])

    const updateBlockProp = useCallback((id: string, key: string, value: any) => {
        setConfig(prev => {
            const next = { ...prev, pageBlocks: { ...prev.pageBlocks } }
            // Sync across all pages if it's a header or footer (global)
            let isGlobal = false
            for (const page in next.pageBlocks) {
                if (next.pageBlocks[page]?.find(b => b.id === id && (b.type.startsWith('header-') || b.type.startsWith('footer-')))) {
                    isGlobal = true; break
                }
            }
            if (isGlobal) {
                for (const page in next.pageBlocks) {
                    next.pageBlocks[page] = next.pageBlocks[page]?.map(b => b.id === id ? { ...b, props: { ...b.props, [key]: value } } : b)
                }
                return next
            }
            // Otherwise, just update current page
            next.pageBlocks[currentPage] = (next.pageBlocks[currentPage] ?? []).map(b => b.id === id ? { ...b, props: { ...b.props, [key]: value } } : b)
            return next
        })
    }, [currentPage])

    const updateBlockStyle = useCallback((id: string, key: string, value: string) => {
        setConfig(prev => {
            const next = { ...prev, pageBlocks: { ...prev.pageBlocks } }
            let isGlobal = false
            for (const page in next.pageBlocks) {
                if (next.pageBlocks[page]?.find(b => b.id === id && (b.type.startsWith('header-') || b.type.startsWith('footer-')))) {
                    isGlobal = true; break
                }
            }
            if (isGlobal) {
                for (const page in next.pageBlocks) {
                    next.pageBlocks[page] = next.pageBlocks[page]?.map(b => b.id === id ? { ...b, styles: { ...(b.styles || {}), [key]: value } } : b)
                }
                return next
            }
            next.pageBlocks[currentPage] = (next.pageBlocks[currentPage] ?? []).map(b => b.id === id ? { ...b, styles: { ...(b.styles || {}), [key]: value } } : b)
            return next
        })
    }, [currentPage])

    const updateBlockAnim = useCallback((id: string, key: string, value: any) => {
        setConfig(prev => {
            const next = { ...prev, pageBlocks: { ...prev.pageBlocks } }
            let isGlobal = false
            for (const page in next.pageBlocks) {
                if (next.pageBlocks[page]?.find(b => b.id === id && (b.type.startsWith('header-') || b.type.startsWith('footer-')))) {
                    isGlobal = true; break
                }
            }
            if (isGlobal) {
                for (const page in next.pageBlocks) {
                    next.pageBlocks[page] = next.pageBlocks[page]?.map(b => b.id === id ? { ...b, animation: { ...(b.animation || { entrance: 'none', hover: 'none' }), [key]: value } } : b)
                }
                return next
            }
            next.pageBlocks[currentPage] = (next.pageBlocks[currentPage] ?? []).map(b => b.id === id ? { ...b, animation: { ...(b.animation || { entrance: 'none', hover: 'none' }), [key]: value } } : b)
            return next
        })
    }, [currentPage])

    // DnD handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string)
        setActiveDragData(event.active.data?.current)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const overId = event.over?.id as string
        if (overId?.startsWith('dropzone::')) {
            setOverDropzone(overId)
        } else {
            setOverDropzone(null)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveDragId(null)
        setActiveDragData(null)
        setOverDropzone(null)

        if (!over) return

        const activeData = active.data?.current
        const overId = over.id as string

        // Dragging from sidebar library
        if (activeData?.kind === 'template') {
            let insertIndex: number | undefined
            if (overId.startsWith('dropzone::')) {
                insertIndex = parseInt(overId.split('::')[1], 10)
            } else {
                // Dropped onto a block — insert after it
                const overBlockIdx = currentBlocks.findIndex(b => b.id === overId)
                insertIndex = overBlockIdx >= 0 ? overBlockIdx + 1 : undefined
            }
            addBlock(activeData.blockType, insertIndex)
            return
        }

        // Reordering existing blocks
        if (activeData?.kind === 'block' && active.id !== over.id) {
            setCurrentBlocks(prev => {
                const oldIndex = prev.findIndex(b => b.id === active.id)
                let newIndex = prev.findIndex(b => b.id === over.id)
                if (overId.startsWith('dropzone::')) {
                    newIndex = parseInt(overId.split('::')[1], 10)
                }
                if (oldIndex === -1 || newIndex === -1) return prev
                return arrayMove(prev, oldIndex, newIndex)
            })
        }
    }

    const handleSave = () => {
        startSave(async () => {
            const res = await updateThemeConfig(storeId, config)
            if (res.success) toast.success('Storefront published successfully! ✨')
            else toast.error('Save failed: ' + res.error)
        })
    }

    const deviceWidths: Record<Device, string> = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px',
    }

    const filteredCategories = BLOCK_CATEGORIES.map(cat => ({
        ...cat,
        blocks: cat.blocks.filter(b =>
            !searchQuery ||
            b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.blocks.length > 0)

    if (!mounted) return (
        <div
            className="flex items-center justify-center gap-4"
            style={{ position: 'absolute', inset: 0, background: 'var(--background)' }}
        >
            <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-8 text-primary animate-pulse" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Loading Builder...</p>
        </div>
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {/* Builder takes full height of the shell main area — shell sets this to overflow:hidden + no padding */}
            <div className="flex flex-col bg-background" style={{ height: '100%', width: '100%' }}>

                {/* ── TOP BAR ── */}
                <div className="flex-none border-b border-border flex items-center gap-2 px-3 py-2 bg-card/90 backdrop-blur-md z-30" style={{ minHeight: 52 }}>
                    {/* Left: back + page selector */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <a href="/dashboard"
                            className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
                        >
                            <ArrowLeft className="size-4" />
                        </a>

                        {/* Page selector */}
                        <div className="flex items-center gap-1 bg-secondary border border-border rounded-lg px-2 py-1.5 min-w-0 max-w-[90px] sm:max-w-[160px] xl:max-w-[220px]">
                            <Globe className="size-3 text-muted-foreground shrink-0 hidden sm:block" />
                            <select
                                value={currentPage}
                                onChange={e => { setCurrentPage(e.target.value); setActiveBlockId(null) }}
                                className="bg-transparent text-[10px] sm:text-xs font-semibold border-none outline-none cursor-pointer min-w-0 w-full truncate"
                            >
                                <option value="home">Home</option>
                                <option value="product">Product Details</option>
                                <option value="checkout">Checkout</option>
                                {(config.customPages || []).map(p => (
                                    <option key={p.slug} value={p.slug}>{p.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                        </div>

                        {storeDomain && (
                            <a
                                href={getStoreUrl(storeDomain, currentPage !== 'home' ? `/${currentPage}` : '')}
                                target="_blank"
                                className="hidden lg:flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors shrink-0"
                            >
                                <Eye className="size-3" />
                                Live
                            </a>
                        )}
                    </div>

                    {/* Center: device toggles */}
                    <div className="hidden sm:flex gap-0.5 bg-secondary rounded-lg p-1 border border-border shrink-0">
                        {([
                            { id: 'desktop', icon: Monitor, label: 'Desktop' },
                            { id: 'tablet', icon: Tablet, label: 'Tablet' },
                            { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                        ] as { id: Device, icon: React.ElementType, label: string }[]).map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => setDevice(id)} title={label}
                                className={`size-7 rounded-md flex items-center justify-center transition-all ${
                                    device === id ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                <Icon className="size-3.5" />
                            </button>
                        ))}
                    </div>

                    {/* Right: panel toggles + preview + publish */}
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {/* Mobile: toggle left panel */}
                        <button
                            onClick={() => setLeftPanelOpen(p => !p)}
                            className="flex xl:hidden size-8 rounded-lg border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
                            title="Toggle Elements"
                        >
                            <Layout className="size-3.5" />
                        </button>
                        {/* Mobile: toggle right panel */}
                        {activeBlock && (
                            <button
                                onClick={() => setRightPanelOpen(p => !p)}
                                className="flex xl:hidden size-8 rounded-lg border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
                                title="Toggle Properties"
                            >
                                <Settings2 className="size-3.5" />
                            </button>
                        )}

                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        <button onClick={() => setIsPreview(!isPreview)}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                                isPreview
                                    ? 'bg-primary/10 text-primary border-primary/30'
                                    : 'border-border text-muted-foreground hover:text-foreground'
                            }`}>
                            {isPreview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                            <span className="hidden sm:block">{isPreview ? 'Edit' : 'Preview'}</span>
                        </button>

                        <button onClick={handleSave} disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-black hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-primary/20 shrink-0">
                            {isSaving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                            <span>Publish</span>
                        </button>
                    </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div className="flex flex-1 overflow-hidden min-h-0 relative">

                    {/* ── LEFT SIDEBAR ── */}
                    <AnimatePresence initial={false}>
                        {!isPreview && leftPanelOpen && (
                            <motion.aside
                                key="left-panel"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 'var(--left-panel-w, 256px)', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="absolute xl:relative h-full left-0 shadow-2xl xl:shadow-none border-r border-border flex flex-col bg-card/50 backdrop-blur-xl shrink-0 z-20 overflow-hidden"
                                style={{ ['--left-panel-w' as any]: '256px', width: 256 }}
                            >
                                {/* Tab Bar */}
                                <div className="flex border-b border-border shrink-0">
                                    {([
                                        { id: 'elements', icon: Layout, label: 'Elements' },
                                        { id: 'pages', icon: FileText, label: 'Pages' },
                                        { id: 'layers', icon: Layers, label: 'Layers' },
                                    ] as { id: LeftTab, icon: React.ElementType, label: string }[]).map(({ id, icon: Icon, label }) => (
                                        <button key={id} onClick={() => setLeftTab(id)}
                                            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[7px] font-black uppercase tracking-widest transition-all border-b-2
                                                ${leftTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                            <Icon className="size-3.5" />
                                            <span className="hidden sm:block">{label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                    <AnimatePresence mode="wait">
                                        {/* Elements Tab */}
                                        {leftTab === 'elements' && (
                                            <motion.div key="elements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
                                                {/* Search */}
                                                <div className="relative mb-3">
                                                    <input
                                                        type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                                        placeholder="Search blocks..."
                                                        className="w-full bg-secondary border border-border rounded-lg pl-7 pr-3 py-2 text-xs focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                    <Sparkles className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                                                    {searchQuery && (
                                                        <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                                                            <X className="size-3 text-muted-foreground hover:text-foreground" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Block categories */}
                                                <div className="space-y-4">
                                                    {filteredCategories.map(cat => {
                                                        const CatIcon = cat.icon
                                                        return (
                                                            <div key={cat.label}>
                                                                <div className="flex items-center gap-1.5 mb-2">
                                                                    <CatIcon className="size-2.5 text-muted-foreground" />
                                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">{cat.label}</span>
                                                                </div>
                                                                    <div className="grid grid-cols-2 gap-1.5">
                                                                        {cat.blocks.map(tpl => (
                                                                            <DraggableBlockCard 
                                                                                key={tpl.type} 
                                                                                template={tpl} 
                                                                                onHover={() => setPreviewTemplate(tpl)}
                                                                                onLeave={() => setPreviewTemplate(null)}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Pages Tab */}
                                        {leftTab === 'pages' && (
                                            <motion.div key="pages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <PagesPanel
                                                    config={config}
                                                    storeId={storeId}
                                                    currentPage={currentPage}
                                                    onPageChange={(slug) => { setCurrentPage(slug); setActiveBlockId(null) }}
                                                    onConfigUpdate={setConfig}
                                                />
                                            </motion.div>
                                        )}

                                        {/* Layers Tab */}
                                        {leftTab === 'layers' && (
                                            <motion.div key="layers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-3 shrink-0">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                        {currentPage === 'home' ? 'Home' : (config.customPages.find(p => p.slug === currentPage)?.title || currentPage)} — {currentBlocks.length}
                                                    </span>
                                                    <button onClick={() => setLeftTab('elements')} className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-md transition-colors">
                                                        <Plus className="size-3" />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">Add Section</span>
                                                    </button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                                                    {currentBlocks.length === 0 ? (
                                                        <div className="text-center py-10 opacity-30">
                                                            <Layers className="size-6 mx-auto mb-2" />
                                                            <p className="text-xs font-bold">No sections</p>
                                                        </div>
                                                    ) : (
                                                        <SortableContext items={currentBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                                            {currentBlocks.map(block => (
                                                                <LayerItem
                                                                    key={block.id}
                                                                    block={block}
                                                                    isActive={activeBlockId === block.id}
                                                                    onSelect={() => { setActiveBlockId(block.id); setRightPanelOpen(true) }}
                                                                    onDelete={() => deleteBlock(block.id)}
                                                                />
                                                            ))}
                                                        </SortableContext>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* ── CANVAS ── */}
                    <main
                        className={`flex-1 relative min-w-0 overflow-hidden transition-colors duration-300 ${
                            isPreview ? 'bg-background' : 'bg-secondary/40'
                        }`}
                    >
                        {/* ── PREVIEW OVERLAY ── */}
                        <AnimatePresence>
                            {previewTemplate && !activeDragId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-6 top-6 z-50 pointer-events-none rounded-xl overflow-hidden shadow-2xl border border-border bg-background"
                                    style={{ width: 800, height: 450, transformOrigin: 'top left', transform: 'scale(0.4)' }}
                                >
                                    <div className="w-full h-full overflow-hidden relative">
                                        <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl z-[-1]" />
                                        <VisualBuilderRenderer 
                                            blocks={[createBlockFromTemplate(previewTemplate.type)]} 
                                            theme={config} 
                                            products={products} 
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div
                            className="absolute inset-0 overflow-y-auto"
                            style={{ scrollbarWidth: 'thin' }}
                            ref={canvasRef}
                        >
                            {/* Canvas frame */}
                            <div className={`flex flex-col items-center w-full min-h-full ${
                                isPreview ? '' : 'py-6 px-4'
                            }`}>
                                <motion.div
                                    layout
                                    style={{ width: isPreview ? '100%' : deviceWidths[device], maxWidth: '100%' }}
                                    className={`transition-all duration-400 ${
                                        isPreview
                                            ? 'w-full'
                                            : 'rounded-xl border border-border/60 bg-background shadow-xl shadow-black/5 overflow-hidden relative'
                                    }`}
                                >
                                    {/* Scoped CSS — applied ONLY inside .preview-canvas, not to :root */}
                                    <style>{`
                                        .preview-canvas {
                                            --primary: ${config.branding.primaryColor};
                                            --background: ${config.styles.bgColor};
                                            --foreground: ${config.styles.textColor};
                                            --card: ${config.styles.cardBg};
                                            --border: ${config.styles.borderColor};
                                            background-color: ${config.styles.bgColor};
                                            color: ${config.styles.textColor};
                                        }
                                    `}</style>

                                    {/* Top drop zone when empty */}
                                    {currentBlocks.length === 0 && (
                                        <CanvasDropZone index={0} isOver={overDropzone === 'dropzone::0'} />
                                    )}

                                    <SortableContext items={currentBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                        {currentBlocks.map((block, index) => {
                                            const s = block.styles || {}
                                            const blockStyle: React.CSSProperties = {
                                                paddingTop: s.paddingTop,
                                                paddingBottom: s.paddingBottom,
                                                paddingLeft: s.paddingLeft,
                                                paddingRight: s.paddingRight,
                                                backgroundColor: s.backgroundColor,
                                                backgroundImage: s.backgroundImage,
                                                backgroundSize: s.backgroundSize || 'cover',
                                                backgroundPosition: s.backgroundPosition || 'center',
                                                color: s.textColor,
                                                fontSize: s.fontSize,
                                                fontFamily: s.fontFamily,
                                                fontWeight: s.fontWeight as any,
                                                letterSpacing: s.letterSpacing,
                                                lineHeight: s.lineHeight,
                                                borderWidth: s.borderWidth,
                                                borderStyle: s.borderWidth ? 'solid' : undefined,
                                                borderColor: s.borderColor,
                                                borderRadius: s.borderRadius,
                                                opacity: s.opacity ? parseFloat(s.opacity) : undefined,
                                                boxShadow: s.boxShadow,
                                                maxWidth: s.maxWidth,
                                                minHeight: s.minHeight,
                                            }

                                            return (
                                                <React.Fragment key={block.id}>
                                                    {!isPreview && <CanvasDropZone index={index} isOver={overDropzone === `dropzone::${index}`} />}

                                                    <SortableCanvasBlock
                                                        block={block}
                                                        isSelected={activeBlockId === block.id}
                                                        onSelect={() => {
                                                            setActiveBlockId(block.id)
                                                            setRightPanelOpen(true)
                                                        }}
                                                        onDelete={() => deleteBlock(block.id)}
                                                        onDuplicate={() => duplicateBlock(block.id)}
                                                    >
                                                        <div style={blockStyle} className="w-full preview-canvas">
                                                            <VisualBuilderRenderer
                                                                blocks={[block]}
                                                                products={products}
                                                                domain={storeDomain || ""}
                                                                baseUrl={storeDomain ? `/${storeDomain}` : ""}
                                                                isEditMode={!isPreview}
                                                                activeBlockId={activeBlockId}
                                                                onDeleteBlock={deleteBlock}
                                                                onSelectBlock={id => setActiveBlockId(id)}
                                                                onAddBlock={(type, idx) => addBlock(type, idx)}
                                                                theme={config}
                                                            />
                                                        </div>
                                                    </SortableCanvasBlock>

                                                    {!isPreview && index === currentBlocks.length - 1 && (
                                                        <CanvasDropZone index={index + 1} isOver={overDropzone === `dropzone::${index + 1}`} />
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </SortableContext>

                                    {/* Empty state */}
                                    {currentBlocks.length === 0 && !isPreview && (
                                        <div className="flex flex-col items-center justify-center py-24 sm:py-32 text-center px-8">
                                            <div className="size-20 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center mb-5">
                                                <Sparkles className="size-8 text-primary/40 animate-pulse" />
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight mb-2 opacity-40">Drop to Build</h3>
                                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6 opacity-60">
                                                Drag elements from the left panel onto this canvas, or click below to start.
                                            </p>
                                            <button onClick={() => addBlock('hero-modern')}
                                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 text-xs">
                                                <PlusCircle className="size-4" />
                                                Start with Hero
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </main>

                    {/* ── RIGHT PANEL ── */}
                    <AnimatePresence initial={false}>
                        {!isPreview && rightPanelOpen && (
                            <motion.aside
                                key="right-panel"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 280, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="border-l border-border flex flex-col bg-card/50 backdrop-blur-xl shrink-0 z-20 overflow-hidden absolute xl:relative h-full right-0 shadow-2xl xl:shadow-none"
                                style={{ width: 280 }}
                            >
                                {activeBlock ? (
                                    <>
                                        {/* Block header */}
                                        <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                                    {(() => { const Icon = ALL_BLOCK_TEMPLATES[activeBlock.type]?.icon || SquareDot; return <Icon className="size-3 text-primary" /> })()}
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest truncate">{activeBlock.type.replace(/-/g, ' ')}</p>
                                            </div>
                                            <button onClick={() => setActiveBlockId(null)}
                                                className="size-5 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                                                <X className="size-3" />
                                            </button>
                                        </div>

                                        {/* Tab bar */}
                                        <div className="flex border-b border-border shrink-0 px-2 pt-1.5 gap-0.5">
                                            {([
                                                { id: 'content', label: 'Content', icon: Type },
                                                { id: 'style', label: 'Style', icon: Palette },
                                                { id: 'animate', label: 'Motion', icon: Play },
                                            ] as { id: RightTab, label: string, icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
                                                <button key={id} onClick={() => setRightTab(id)}
                                                    className={`flex-1 flex items-center justify-center gap-1 pb-2 text-[8px] font-black uppercase tracking-widest transition-all border-b-2
                                                        ${rightTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                                                    <Icon className="size-2.5" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Panel content */}
                                        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
                                            <AnimatePresence mode="wait">
                                                {rightTab === 'content' && (
                                                    <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <BlockContentEditor
                                                            block={activeBlock}
                                                            onUpdateProp={(k, v) => updateBlockProp(activeBlock.id, k, v)}
                                                            storeId={storeId}
                                                            config={config}
                                                            onPagesChange={pages => setConfig(prev => ({ ...prev, customPages: pages }))}
                                                        />
                                                    </motion.div>
                                                )}
                                                {rightTab === 'style' && (
                                                    <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <BlockStyleEditor
                                                            block={activeBlock}
                                                            onUpdateStyle={(k, v) => updateBlockStyle(activeBlock.id, k, v)}
                                                        />
                                                    </motion.div>
                                                )}
                                                {rightTab === 'animate' && (
                                                    <motion.div key="animate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="size-1.5 rounded-full bg-primary" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Entrance</span>
                                                            </div>
                                                            <SelectControl label="Animation" value={activeBlock.animation?.entrance || 'none'}
                                                                onChange={v => updateBlockAnim(activeBlock.id, 'entrance', v)}
                                                                options={[
                                                                    { value: 'none', label: 'None' },
                                                                    { value: 'fade-in', label: 'Fade In' },
                                                                    { value: 'slide-up', label: 'Slide Up' },
                                                                    { value: 'zoom-in', label: 'Zoom In' },
                                                                    { value: 'bounce', label: 'Bounce' },
                                                                    { value: 'rotate', label: 'Rotate' },
                                                                ]} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="size-1.5 rounded-full bg-amber-400" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hover</span>
                                                            </div>
                                                            <SelectControl label="Hover Effect" value={activeBlock.animation?.hover || 'none'}
                                                                onChange={v => updateBlockAnim(activeBlock.id, 'hover', v)}
                                                                options={[
                                                                    { value: 'none', label: 'None' },
                                                                    { value: 'scale', label: 'Scale' },
                                                                    { value: 'lift', label: 'Lift (Float Up)' },
                                                                    { value: 'glow', label: 'Glow' },
                                                                    { value: 'grayscale-to-color', label: 'Grayscale → Color' },
                                                                ]} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="size-1.5 rounded-full bg-emerald-400" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Timing</span>
                                                            </div>
                                                            <ControlLabel>Delay (seconds)</ControlLabel>
                                                            <div className="flex items-center gap-3">
                                                                <input type="range" min="0" max="2" step="0.1"
                                                                    value={activeBlock.animation?.delay || 0}
                                                                    onChange={e => updateBlockAnim(activeBlock.id, 'delay', parseFloat(e.target.value))}
                                                                    className="flex-1 accent-primary" />
                                                                <span className="text-xs font-mono w-8 text-right">{(activeBlock.animation?.delay || 0).toFixed(1)}s</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </>
                                ) : (
                                    /* Global Settings when no block selected */
                                    <>
                                        <div className="px-4 py-3 border-b border-border shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
                                                    <Settings className="size-3 text-primary" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Global Settings</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <GlobalSettingsPanel config={config} onUpdate={updateConfigPath} />
                                        </div>
                                    </>
                                )}
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── DRAG OVERLAY ── */}
            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } })
            }}>
                {activeDragId && activeDragData?.kind === 'template' && (() => {
                    const tpl = ALL_BLOCK_TEMPLATES[activeDragData.blockType]
                    if (!tpl) return null
                    const Icon = tpl.icon
                    return (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-primary bg-card shadow-2xl shadow-primary/20 backdrop-blur-md pointer-events-none`}>
                            <div className={`size-10 rounded-xl bg-gradient-to-br ${tpl.color} flex items-center justify-center`}>
                                <Icon className="size-5 text-foreground/70" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">{tpl.label}</p>
                                <p className="text-[9px] text-muted-foreground mt-0.5">Drop to add</p>
                            </div>
                        </div>
                    )
                })()}
                {activeDragId && activeDragData?.kind === 'block' && (
                    <div className="px-4 py-3 rounded-2xl border-2 border-primary bg-primary/10 shadow-2xl pointer-events-none">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">Moving Section...</p>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}
