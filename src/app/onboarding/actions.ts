'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function createStore(data: {
  name: string
  subdomain: string
  themeConfig?: any
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { name, subdomain, themeConfig } = data

  if (!name || !subdomain) throw new Error('Name and subdomain are required')

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
      data: { ownerId: user.id, name, subdomain, themeConfig, trialEndsAt } as any,
    })
  } catch (e: any) {
    if (e.code === 'P2002') throw new Error('This URL is already taken. Please choose another.')
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
    select: { trialEndsAt: true, subscriptionActive: true } as any
  })
  
  return store
}