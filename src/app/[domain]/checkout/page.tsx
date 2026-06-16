import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import CheckoutClient from './checkout-client'
import { getBaseUrl } from '@/lib/get-base-url'

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

    return <CheckoutClient storeId={store.id} domain={domain} baseUrl={baseUrl} theme={theme} user={user} />
}
