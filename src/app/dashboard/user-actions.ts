"use server"

import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserProfile(data: { name?: string, avatarUrl?: string }) {
    try {
        const supabase = await createClient()
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData.user) {
            return { success: false, error: "Unauthorized" }
        }

        const user = await prisma.user.update({
            where: { id: authData.user.id },
            data: {
                name: data.name,
                avatarUrl: data.avatarUrl,
            }
        })

        revalidatePath("/dashboard", "layout")
        return { success: true, user }
    } catch (error: any) {
        console.error("Failed to update user profile:", error)
        return { success: false, error: error.message }
    }
}
