'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

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
    throw new Error(validated.error.issues.map(issue => issue.message).join(', '))
  }

  const { name, subdomain, themeConfig } = validated.data

  // Ensure user row exists
  await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email! },
    create: { id: user.id, email: user.email! },
  })

  // Calculate Trial End Date (Current Date + 14 Days)
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  // Create store
  try {
    await prisma.store.create({
      data: {
        ownerId: user.id,
        name,
        subdomain,
        themeConfig: themeConfig as Prisma.InputJsonValue,
        trialEndsAt
      },
    })
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      throw new Error('This URL is already taken. Please choose another.')
    }
    throw new Error('Failed to create store. Please try again.')
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
    select: { trialEndsAt: true, subscriptionActive: true, subdomain: true }
  })
  
  return store
}