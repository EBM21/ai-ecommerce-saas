import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import CheckoutClient from './checkout-client'
import { getBaseUrl } from '@/lib/get-base-url'
import { VisualBuilderRenderer } from '@/components/visual-builder-renderer'

export default async function CheckoutPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params

    const store = await prisma.store.findFirst({
        where: { OR: [{ subdomain: domain }, { customDomain: domain }] }
    })

    if (!store) notFound()

    const baseUrl = await getBaseUrl(domain)

    // Parse themeConfig for styling
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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (theme?.mode === 'builder') {
        const homeBlocks = theme.pageBlocks?.home ?? theme.blocks ?? []
        let localBlocks = theme.pageBlocks?.checkout ?? []
        
        if (localBlocks.length === 0) {
            localBlocks = [{
                id: 'default-checkout',
                type: 'system-checkout',
                props: {},
                animation: { entrance: 'none', hover: 'none' },
                styles: { paddingTop: '0px', paddingBottom: '0px' }
            }]
        }

        const finalBlocks = [...localBlocks]
        if (!finalBlocks.some(b => b.type.startsWith('header-'))) {
            const h = homeBlocks.find((b: any) => b.type.startsWith('header-'))
            if (h) finalBlocks.unshift(h)
        }
        if (!finalBlocks.some(b => b.type.startsWith('footer-'))) {
            const f = homeBlocks.find((b: any) => b.type.startsWith('footer-'))
            if (f) finalBlocks.push(f)
        }

        return (
            <div style={{
                backgroundColor: theme?.styles?.bgColor || '#ffffff',
                color: theme?.styles?.textColor || '#000000',
                minHeight: '100vh',
                fontFamily: theme?.styles?.bodyFont || 'var(--font-inter)'
            }}>
                <VisualBuilderRenderer 
                    blocks={finalBlocks} 
                    domain={domain} 
                    baseUrl={baseUrl} 
                    theme={theme}
                    bankDetails={store.bankDetails}
                    storeId={store.id}
                />
            </div>
        )
    }

    return <CheckoutClient storeId={store.id} domain={domain} baseUrl={baseUrl} theme={theme} user={user} />
}
