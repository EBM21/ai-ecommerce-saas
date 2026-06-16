import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import StorefrontLoginPage from './login-client'

export default async function LoginPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const store = await prisma.store.findFirst({
        where: { OR: [{ subdomain: domain }, { customDomain: domain }] }
    })

    if (!store) notFound()

    // If already logged in, redirect to account
    if (user) {
        redirect(`/account`)
    }

    // Parse themeConfig
    let theme: any = null
    if (store.themeConfig) {
        try {
            theme = typeof store.themeConfig === 'string'
                ? JSON.parse(store.themeConfig as string)
                : store.themeConfig
        } catch (e) {
            console.error("Login Page: theme parse error", e)
        }
    }

    return <StorefrontLoginPage params={{ domain }} storeId={store.id} theme={theme} />
}
