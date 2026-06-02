import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

// Layout simply reads themeConfig for navbar — the homepage page.tsx renders everything else.
// Nav links with correct hrefs are now fully controlled from the customizer.

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

    // NOTE: Header is now rendered inside storefront-page.tsx (homepage) to get full
    // control from themeConfig (sticky, showCart, logoUrl, primaryColor, etc).
    // This layout just provides the html shell.
    // If you have inner pages (product, collection) that also need the navbar,
    // you can render it here the same way as the homepage does.

    return (
        <>
            {children}
        </>
    )
}