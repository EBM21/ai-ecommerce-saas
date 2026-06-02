'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

// ✅ useActionState requires (prevState, formData) — prevState is FIRST arg
export async function createProduct(prevState: any, formData: FormData) {
  if (!formData) return { error: 'Form data is missing.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
  })
  if (!store) redirect('/onboarding')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const compareAtPrice = formData.get('compareAtPrice')
    ? parseFloat(formData.get('compareAtPrice') as string)
    : null
  const inventoryCount = parseInt(formData.get('inventoryCount') as string, 10)
  const status = formData.get('status') as 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  const rawImageUrl = formData.get('rawImageUrl') as string
  const enhancedImageUrl = formData.get('enhancedImageUrl') as string

  if (!title || isNaN(price) || isNaN(inventoryCount)) {
    return { error: 'Title, price and inventory are required.' }
  }

  try {
    await prisma.product.create({
      data: {
        storeId: store.id,
        title,
        description,
        price,
        compareAtPrice,
        inventoryCount,
        status: status || 'DRAFT',
        images: { raw: rawImageUrl || null, enhanced: enhancedImageUrl || null },
      },
    })

    revalidatePath('/dashboard/products')
  } catch (error: any) {
    console.error('Failed to create product:', error)
    return { error: 'Failed to create product. Please try again.' }
  }

  redirect('/dashboard/products')
}