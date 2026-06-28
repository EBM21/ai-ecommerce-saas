import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { CartProvider } from '@/lib/cart-context'
import { CartDrawer } from '@/components/cart-drawer'
import { StoreHeader } from '@/components/store-header'
import { createClient } from '@/utils/supabase/server'
import { AIChatbot } from '@/components/ai-chatbot'
import { ThemeConfig } from '@/types/theme-types'
import { NovaHeader, MinimalHeader, EnigmaHeader } from '@/components/store-layouts'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getBaseUrl } from '@/lib/get-base-url'

export const dynamic = 'force-dynamic'

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ domain: string }>
}) {
    const { domain } = await params

    const store = await prisma.store.findFirst({
        where: { OR: [{ subdomain: domain }, { customDomain: domain }] }
    })

    if (!store) notFound()

    // ── Calculate Base URL for Links ──
    const baseUrl = await getBaseUrl(domain)

    // Parse themeConfig
    let theme: any = null
    if (store.themeConfig) {
        try {
            theme = typeof store.themeConfig === 'string'
                ? JSON.parse(store.themeConfig as string)
                : store.themeConfig
        } catch (e) {
            console.error("Layout: theme parse error", e)
        }
    }

    let policies: any = { privacy: "", refund: "", terms: "", shipping: "" }
    if (store.policies) {
        try {
            policies = typeof store.policies === 'string'
                ? JSON.parse(store.policies as string)
                : store.policies
        } catch (e) {}
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { layoutId, blocks, pageBlocks } = theme || {}
    // Check both legacy blocks AND new multi-page builder blocks
    const allPageBlocks: any[] = [
        ...(blocks || []),
        ...Object.values(pageBlocks || {}).flat()
    ]
    const isBuilder = allPageBlocks.length > 0
    const hasBuilderHeader = allPageBlocks.some((b: any) => b.type?.startsWith('header-'))
    const hasBuilderFooter = allPageBlocks.some((b: any) => b.type?.startsWith('footer-'))

    return (
        <CartProvider domain={domain}>
            <div 
                className="min-h-screen flex flex-col"
                style={{
                    backgroundColor: theme?.styles?.bgColor || '#ffffff',
                    color: theme?.styles?.textColor || '#000000',
                    // @ts-ignore
                    '--background': theme?.styles?.bgColor || '#ffffff',
                    '--foreground': theme?.styles?.textColor || '#000000',
                    '--card': theme?.styles?.cardBg || 'rgba(255,255,255,0.03)',
                    '--border': theme?.styles?.borderColor || 'rgba(255,255,255,0.08)',
                    '--primary': theme?.branding?.primaryColor || '#6366f1',
                }}
            >
                {/* ── HEADER ── */}
                {hasBuilderHeader ? null : (
                    <StoreHeader theme={theme} user={user} domain={domain} baseUrl={baseUrl} />
                )}
                
                <main className="flex-1 flex flex-col">
                    {children}
                </main>

                {/* ── FOOTER ── */}
                {hasBuilderFooter ? null : (
                    <StoreFooter theme={theme} domain={domain} baseUrl={baseUrl} policies={policies} />
                )}
            </div>

            <CartDrawer domain={domain} theme={theme} baseUrl={baseUrl} />
            {theme?.aiAssistant?.show && (
                <AIChatbot storeId={store.id} domain={domain} config={theme.aiAssistant} />
            )}
        </CartProvider>
    )
}

function StoreFooter({ theme, domain, baseUrl = "", policies }: { theme: ThemeConfig, domain: string, baseUrl?: string, policies?: any }) {
    const { footer, styles, layoutId } = theme
    
    const policyLinks = []
    if (policies?.privacy) policyLinks.push({ label: 'Privacy Policy', href: '/policies/privacy' })
    if (policies?.refund) policyLinks.push({ label: 'Refund Policy', href: '/policies/refund' })
    if (policies?.terms) policyLinks.push({ label: 'Terms of Service', href: '/policies/terms' })
    if (policies?.shipping) policyLinks.push({ label: 'Shipping Policy', href: '/policies/shipping' })

    const allLinks = [...(footer?.links || []), ...policyLinks]
    
    // Minimal Footer
    if (layoutId === 'minimal') {
        return (
            <footer className="py-24 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-10 flex flex-col items-center gap-12">
                    <span className="text-2xl font-light tracking-[0.4em] uppercase">{theme.branding.storeName}</span>
                    <div className="flex gap-12">
                        {allLinks.map((l, i) => (
                            <Link key={i} href={`${baseUrl}${l.href.startsWith('/') ? '' : '/'}${l.href}`} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 no-underline hover:text-black">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{footer.text}</p>
                </div>
            </footer>
        )
    }

    // Enigma Footer
    if (layoutId === 'enigma') {
        return (
            <footer className="py-32 bg-black border-t border-white/5 text-white">
                <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-end gap-12">
                    <div>
                        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-8">{theme.branding.storeName}<span className="text-red-600">.</span></h2>
                        <p className="text-white/30 text-sm font-bold uppercase tracking-widest max-w-xs leading-relaxed">{footer.text}</p>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                        {allLinks.map((l, i) => (
                            <Link key={i} href={`${baseUrl}${l.href.startsWith('/') ? '' : '/'}${l.href}`} className="text-xl font-black italic uppercase tracking-tighter text-white/20 hover:text-white no-underline transition-colors">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        )
    }

    // Default Nova Footer
    return (
        <footer className="py-16 border-t" style={{ borderColor: styles.borderColor, background: footer.bgColor || styles.bgColor }}>
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="font-black text-xl tracking-tighter uppercase italic">{theme.branding.storeName}</span>
                    <p className="text-xs opacity-40 font-bold uppercase tracking-widest">{footer.text}</p>
                </div>
                <div className="flex gap-8 flex-wrap justify-center md:justify-end">
                    {allLinks.map((l, i) => (
                        <Link key={i} href={`${baseUrl}${l.href.startsWith('/') ? '' : '/'}${l.href}`} className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 no-underline transition-all" style={{ color: styles.textColor }}>
                            {l.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}
