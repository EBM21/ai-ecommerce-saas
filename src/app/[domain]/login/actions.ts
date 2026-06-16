"use server"

import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

async function getBaseUrl(domain: string) {
    const host = (await headers()).get("host") || ""
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'quadlix.com')
    return (host === baseDomain || host === `app.${baseDomain}`) ? `/${domain}` : ""
}

export async function storefrontLogin(formData: FormData, domain: string, storeId: string) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Ensure customer record exists
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const customer = await prisma.customer.findUnique({
            where: { storeId_email: { storeId, email: user.email! } }
        })
        if (!customer) {
            await prisma.customer.create({
                data: { storeId, email: user.email!, userId: user.id }
            })
        } else if (!customer.userId) {
            await prisma.customer.update({
                where: { id: customer.id },
                data: { userId: user.id }
            })
        }
    }

    const baseUrl = await getBaseUrl(domain)
    revalidatePath(`${baseUrl}/`)
    redirect(`${baseUrl}/account`)
}

export async function storefrontSignup(formData: FormData, domain: string, storeId: string) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const supabase = await createClient()

    const baseUrl = await getBaseUrl(domain)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: name },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${baseUrl}/login`
        }
    })

    if (error) {
        return { error: error.message }
    }

    if (data.user) {
        // Create customer record immediately
        await prisma.customer.upsert({
            where: { storeId_email: { storeId, email: data.user.email! } },
            update: { userId: data.user.id, name },
            create: { storeId, email: data.user.email!, userId: data.user.id, name }
        })
    }

    return { success: true, message: "Check your email to confirm your account." }
}

export async function storefrontLogout(domain: string) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    const baseUrl = await getBaseUrl(domain)
    revalidatePath(`${baseUrl}/`)
    redirect(`${baseUrl || '/'}`)
}
