'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { PRE_BUILT_THEMES } from '@/lib/themes/pre-built'

const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name must be 100 characters or less'),
  subdomain: z.string()
    .min(1, 'Subdomain is required')
    .max(50, 'Subdomain must be 50 characters or less')
    .transform(val => val.toLowerCase())
    .refine((val) => /^[a-z0-9-]+$/.test(val), 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .refine((val) => !['app', 'admin', 'www', 'api', 'dashboard', 'main'].includes(val), {
      message: 'This subdomain is reserved',
    }),
  themeConfig: z.unknown().optional(),
})

export async function createStore(data: {
  name: string
  subdomain: string
  themeConfig?: unknown
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const validated = createStoreSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues.map(issue => issue.message).join(', ') }
  }

  const { name, subdomain, themeConfig } = validated.data

  // Ensure user row exists safely
  try {
    const userEmail = user.email || `no-email-${user.id}@quadlix.com`
    
    // Fix for dev environments: If email exists but with a different ID (e.g. Supabase was reset but Prisma wasn't)
    const existing = await prisma.user.findUnique({ where: { email: userEmail } })
    if (existing && existing.id !== user.id) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { email: `archived-${Date.now()}-${existing.email}` }
      })
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: userEmail },
      create: { id: user.id, email: userEmail },
    })
  } catch (err: any) {
    console.error("USER UPSERT ERROR:", err)
    return { error: `Failed to synchronize user account: ${err?.message || err}` }
  }

  // Calculate Trial End Date (Current Date + 14 Days)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  const rawThemeConfig: any = themeConfig || {}
  const themeMap: Record<string, string> = {
    'dark-minimal': 'theme-minimal-store',
    'light-clean': 'theme-beauty-blush',
    'warm-earthy': 'theme-home-haven',
    'neon-bold': 'theme-urban-street',
  }
  const mappedThemeId = themeMap[rawThemeConfig.theme] || 'theme-minimal-store'
  const prebuilt = PRE_BUILT_THEMES.find(t => t.id === mappedThemeId) || PRE_BUILT_THEMES[0]

  const finalThemeConfig = {
    ...prebuilt.config,
    branding: {
      ...prebuilt.config.branding,
      storeName: name,
      currency: rawThemeConfig.currency || 'USD'
    }
  }

  // Create store
  try {
    await prisma.store.create({
      data: {
        ownerId: user.id,
        name,
        subdomain,
        themeConfig: finalThemeConfig as unknown as Prisma.InputJsonObject,
        trialEndsAt
      },
    })
  } catch (e: any) {
    console.error("STORE CREATE ERROR:", e)
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return { error: 'This URL is already taken. Please choose another.' }
    }
    return { error: `Failed to create store: ${e?.message || 'Unknown database error'}` }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function getStoreTrialStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    select: { trialEndsAt: true, subscriptionActive: true, subdomain: true, customDomain: true, customDomainStatus: true }
  })
  
  return store
}