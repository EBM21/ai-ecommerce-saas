'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateThemeConfig(storeId: string, newConfig: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store || store.ownerId !== user.id) return { success: false, error: 'Unauthorized' }

        await prisma.store.update({
            where: { id: storeId },
            data: {
                themeConfig: typeof newConfig === 'string' ? newConfig : JSON.stringify(newConfig)
            }
        })

        revalidatePath('/dashboard/customizer')
        revalidatePath('/', 'layout')
        revalidatePath('/[domain]', 'layout')
        revalidatePath('/[domain]/[slug]', 'layout')

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

/**
 * Create a new custom page and initialize its blocks entry in pageBlocks.
 * The slug must be unique within the store.
 */
export async function createCustomPage(storeId: string, slug: string, title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store || store.ownerId !== user.id) return { success: false, error: 'Unauthorized' }

        // Parse existing config
        let config: any = {}
        if (store.themeConfig) {
            try {
                config = typeof store.themeConfig === 'string'
                    ? JSON.parse(store.themeConfig as string)
                    : store.themeConfig
            } catch { config = {} }
        }

        // Check for duplicate slug
        const existingPages: any[] = config.customPages || []
        if (slug === 'home' || existingPages.some((p: any) => p.slug === slug)) {
            return { success: false, error: `Page with slug "${slug}" already exists` }
        }

        // Add to customPages
        const updatedPages = [...existingPages, { slug, title, content: '' }]

        // Add to pageBlocks
        const existingPageBlocks: Record<string, any[]> = config.pageBlocks || {}
        const updatedPageBlocks = { ...existingPageBlocks, [slug]: [] }

        const updatedConfig = {
            ...config,
            customPages: updatedPages,
            pageBlocks: updatedPageBlocks
        }

        await prisma.store.update({
            where: { id: storeId },
            data: { themeConfig: JSON.stringify(updatedConfig) }
        })

        revalidatePath('/dashboard/customizer')
        revalidatePath('/[domain]/[slug]', 'layout')

        return { success: true, slug, title }
    } catch (error: any) {
        console.error("createCustomPage error:", error)
        return { success: false, error: error.message }
    }
}

/**
 * Delete a custom page and its blocks.
 */
export async function deleteCustomPage(storeId: string, slug: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const store = await prisma.store.findUnique({ where: { id: storeId } })
        if (!store || store.ownerId !== user.id) return { success: false, error: 'Unauthorized' }

        let config: any = {}
        if (store.themeConfig) {
            try {
                config = typeof store.themeConfig === 'string'
                    ? JSON.parse(store.themeConfig as string)
                    : store.themeConfig
            } catch { config = {} }
        }

        const updatedPages = (config.customPages || []).filter((p: any) => p.slug !== slug)
        const updatedPageBlocks = { ...(config.pageBlocks || {}) }
        delete updatedPageBlocks[slug]

        const updatedConfig = { ...config, customPages: updatedPages, pageBlocks: updatedPageBlocks }

        await prisma.store.update({
            where: { id: storeId },
            data: { themeConfig: JSON.stringify(updatedConfig) }
        })

        revalidatePath('/dashboard/customizer')
        revalidatePath('/[domain]/[slug]', 'layout')

        return { success: true }
    } catch (error: any) {
        console.error("deleteCustomPage error:", error)
        return { success: false, error: error.message }
    }
}
