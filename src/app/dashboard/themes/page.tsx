import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ThemesClient from './themes-client'

export const dynamic = 'force-dynamic'

export default async function ThemesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const store = await prisma.store.findFirst({
        where: { ownerId: user.id }
    })

    if (!store) redirect('/onboarding')

    if (store.themeConfig) {
        try {
            const parsed = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
            if (parsed.branding?.storeName) {
            }
        } catch(e) {}
    }

    return <ThemesClient />
}
