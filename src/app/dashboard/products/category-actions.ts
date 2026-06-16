'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function getStoreCategories() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })
        if (!store) return []

        const categories = await prisma.category.findMany({
            where: { storeId: store.id },
            orderBy: { name: 'asc' }
        })

        return categories
    } catch (e) {
        console.error(e)
        return []
    }
}

import { z } from 'zod'

const createCategorySchema = z.string().min(1, 'Category name is required').max(50, 'Category name must be 50 characters or less')

export async function createCategory(name: string) {
    try {
        const validatedName = createCategorySchema.safeParse(name)
        if (!validatedName.success) {
            return { success: false, error: validatedName.error.issues.map((issue: z.ZodIssue) => issue.message).join(', ') }
        }
        const nameVal = validatedName.data

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })
        if (!store) return { success: false, error: 'Store not found' }

        const slug = nameVal.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        
        const category = await prisma.category.create({
            data: {
                storeId: store.id,
                name: nameVal,
                slug
            }
        })

        return { success: true, category }
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { success: false, error: 'A category with this name already exists.' }
        }
        return { success: false, error: e.message }
    }
}
