'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStoreSettings() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        return { success: true, store }
    } catch (error: any) {
        console.error("Settings fetch error:", error)
        return { success: false, error: 'Server error' }
    }
}

export async function updateStoreSettings(data: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        // Database mein actual data save ho raha hai
        await prisma.store.update({
            where: { id: store.id },
            data: {
                name: data.name,
                subdomain: data.subdomain,
                customDomain: data.customDomain,
                // Note: Agar aapke schema mein ye neechay wale fields nahi hain tou 
                // schema.prisma mein add kar lijiye ga (e.g. email String?, phone String?)
                // email: data.email,
                // phone: data.phone,
                // stripePublicKey: data.stripePublicKey,
                // stripeSecretKey: data.stripeSecretKey,
            }
        })

        revalidatePath('/dashboard/settings')
        return { success: true }
    } catch (error: any) {
        console.error("Settings save error:", error)
        return { success: false, error: error.message }
    }
}