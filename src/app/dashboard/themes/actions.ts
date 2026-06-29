'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { PRE_BUILT_THEMES } from '@/lib/themes/pre-built'

export async function applyTheme(themeId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const themeToApply = PRE_BUILT_THEMES.find(t => t.id === themeId)
        if (!themeToApply) throw new Error('Theme not found')

        const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
        if (!store) throw new Error('Store not found')

        // Keep the user's actual store name and logo if they already exist,
        // but override the rest of the config with the theme template
        
        let existingConfig: any = {}
        if (store.themeConfig) {
            existingConfig = typeof store.themeConfig === 'string' 
                ? JSON.parse(store.themeConfig) 
                : store.themeConfig
        }

        const newConfig = {
            ...themeToApply.config,
            branding: {
                ...themeToApply.config.branding,
                storeName: existingConfig?.branding?.storeName || store.name,
                logoUrl: existingConfig?.branding?.logoUrl || "",
                currency: existingConfig?.branding?.currency || "USD"
            }
        }

        await prisma.store.update({
            where: { id: store.id },
            data: { themeConfig: newConfig as unknown as Prisma.InputJsonValue }
        })

        revalidatePath('/dashboard/themes')
        revalidatePath('/dashboard/customizer')
        return { success: true }
    } catch (e: any) {
        console.error("Theme application error:", e)
        return { success: false, error: e.message }
    }
}
