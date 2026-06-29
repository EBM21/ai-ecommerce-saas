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

    // Find current theme structure if possible
    let currentThemeName = "Custom"
    if (store.themeConfig) {
        try {
            const parsed = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
            if (parsed.branding?.storeName) {
                // Not ideal, but we can't easily track the exact theme ID right now unless we added it to the model
                // But it's okay, we can just show what is currently applied based on some heuristic or just "Custom".
            }
        } catch(e) {}
    }

    return <ThemesClient />
}
