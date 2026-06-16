'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative('Price cannot be negative'),
  compareAtPrice: z.number().nonnegative('Compare-at price cannot be negative').optional().nullable(),
  inventoryCount: z.number().int('Inventory count must be an integer').nonnegative('Inventory count cannot be negative'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  images: z.any().optional().nullable(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().optional().nullable(),
    price: z.number().nonnegative('Variant price cannot be negative').optional().nullable(),
    inventory: z.number().int().nonnegative('Variant inventory cannot be negative').default(0),
  })).optional().default([]),
  categories: z.array(z.string().uuid('Invalid category ID')).optional().default([]),
})

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
  const imagesDataStr = formData.get('imagesData') as string
  const variantsDataStr = formData.get('variantsData') as string
  const categoriesDataStr = formData.get('categoriesData') as string

  let imagesData = []
  let variantsData = []
  let categoriesData = []

  try {
    imagesData = imagesDataStr ? JSON.parse(imagesDataStr) : []
    variantsData = variantsDataStr ? JSON.parse(variantsDataStr) : []
    categoriesData = categoriesDataStr ? JSON.parse(categoriesDataStr) : []
  } catch (parseError: any) {
    return { error: 'Invalid JSON format in variants, images, or categories.' }
  }

  const validated = productSchema.safeParse({
    title,
    description,
    price: isNaN(price) ? undefined : price,
    compareAtPrice: (compareAtPrice === null || isNaN(compareAtPrice)) ? null : compareAtPrice,
    inventoryCount: isNaN(inventoryCount) ? undefined : inventoryCount,
    status,
    images: imagesData.length > 0 ? imagesData : { raw: rawImageUrl || null, enhanced: enhancedImageUrl || null },
    variants: variantsData,
    categories: categoriesData,
  })

  if (!validated.success) {
    return { error: validated.error.issues.map((err: any) => err.message).join(', ') }
  }

  const product = validated.data

  try {
    await prisma.product.create({
      data: {
        storeId: store.id,
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        inventoryCount: product.inventoryCount,
        status: product.status,
        images: product.images,
        variants: {
          create: product.variants.map((v: any) => ({
            name: v.name,
            sku: v.sku || null,
            price: v.price,
            inventory: v.inventory
          }))
        },
        categories: {
          connect: product.categories.map((id: string) => ({ id }))
        }
      },
    })

    revalidatePath('/dashboard/products')
  } catch (error: any) {
    console.error('Failed to create product:', error)
    return { error: 'Failed to create product: ' + error.message }
  }

  redirect('/dashboard/products')
}

export async function updateProduct(id: string, data: any) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    let imagesData = typeof data.images === 'string' ? JSON.parse(data.images) : data.images
    let variantsData = typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants
    let categoriesData = typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories

    // Pre-process variants to ensure price and inventory are numbers before zod validation
    if (Array.isArray(variantsData)) {
      variantsData = variantsData.map((v: any) => ({
        ...v,
        price: v.price === '' || v.price === null || v.price === undefined ? null : (typeof v.price === 'string' ? parseFloat(v.price) : v.price),
        inventory: v.inventory === '' || v.inventory === null || v.inventory === undefined ? 0 : (typeof v.inventory === 'string' ? parseInt(v.inventory, 10) : v.inventory),
      }))
    }

    const price = typeof data.price === 'string' ? parseFloat(data.price) : data.price
    const compareAtPrice = (data.compareAtPrice === null || data.compareAtPrice === '' || isNaN(parseFloat(data.compareAtPrice))) ? null : (typeof data.compareAtPrice === 'string' ? parseFloat(data.compareAtPrice) : data.compareAtPrice)
    const inventoryCount = typeof data.inventoryCount === 'string' ? parseInt(data.inventoryCount, 10) : data.inventoryCount

    const validated = productSchema.safeParse({
      title: data.title,
      description: data.description,
      price: isNaN(price) ? undefined : price,
      compareAtPrice,
      inventoryCount: isNaN(inventoryCount) ? undefined : inventoryCount,
      status: data.status,
      images: imagesData,
      variants: variantsData,
      categories: categoriesData,
    })

    if (!validated.success) {
      return { success: false, error: validated.error.issues.map((err: any) => err.message).join(', ') }
    }

    const product = validated.data

    await prisma.product.update({
      where: { id },
      data: {
        title: product.title,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        inventoryCount: product.inventoryCount,
        status: product.status,
        images: product.images,
        // Update variants: delete all and recreate
        variants: {
          deleteMany: {},
          create: product.variants.map((v: any) => ({
            name: v.name,
            sku: v.sku || null,
            price: v.price,
            inventory: v.inventory
          }))
        },
        // Update categories: set new ones
        categories: {
          set: product.categories.map((id: string) => ({ id }))
        }
      }
    })

    revalidatePath('/dashboard/products')
    revalidatePath(`/dashboard/products/${id}/edit`)
    return { success: true }
  } catch (error: any) {
    console.error('Update error:', error)
    return { success: false, error: error.message }
  }
}

    export async function deleteProduct(id: string) {
    try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    await prisma.product.delete({ where: { id } })

    revalidatePath('/dashboard/products')
    return { success: true }
    } catch (error: any) {
    return { success: false, error: error.message }
    }
    }