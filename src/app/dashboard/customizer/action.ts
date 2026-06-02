'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateThemeConfig(newConfig: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        // Database mein themeConfig (JSON) update kar rahay hain
        await prisma.store.update({
            where: { id: store.id },
            data: {
                themeConfig: JSON.stringify(newConfig)
            }
        })

        // ── CACHE CLEARING (Ye sabse zaroori hissa hai) ──
        // Ye Next.js ko force karega ke customizer aur live website ka naya data laye
        revalidatePath('/dashboard/customizer')
        revalidatePath('/', 'layout')

        return { success: true }
    } catch (error: any) {
        console.error("Theme save error:", error)
        return { success: false, error: error.message }
    }
}


export async function getThemeConfig() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        // Prisma JSON ko khud handle karta hai, JSON.parse ki zaroorat nahi hoti aksar
        return {
            success: true,
            config: store.themeConfig ? store.themeConfig : null,
            domain: store.subdomain
        }
    } catch (e) {
        console.error(e)
        return { success: false, error: 'Server Error' }
    }
}

export async function uploadThemeImage(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error("No file provided");

        const supabase = await createClient();
        const fileName = `theme-${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}