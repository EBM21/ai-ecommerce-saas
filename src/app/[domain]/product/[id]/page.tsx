import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductClient from './product-client'

export async function generateMetadata({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) return { title: 'Product Not Found' }

  return {
    title: `${product.title} | Premium Edition`,
    description: product.description?.substring(0, 150),
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ domain: string, id: string }>
}) {
  const { domain, id } = await params

  // Verify the store exists
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { subdomain: domain },
        { customDomain: domain }
      ]
    }
  })

  if (!store) notFound()

  const product = await prisma.product.findFirst({
    where: {
      id,
      storeId: store.id,
      status: 'ACTIVE'
    }
  })

  if (!product) notFound()

  // Safely parse the images JSON into a clean Array
  let imageArray: string[] = []
  
  if (product.images) {
    try {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
      
      // Agar database mein images pehle se Array hain (e.g. ["url1", "url2"])
      if (Array.isArray(parsed)) {
        imageArray = parsed
      } 
      // Agar database mein images object hain (e.g. { raw: "url", enhanced: "url" })
      else if (typeof parsed === 'object') {
        if (parsed.enhanced) imageArray.push(parsed.enhanced)
        if (parsed.raw) imageArray.push(parsed.raw)
        
        // Agar uske ilawa bhi koi images hain object mein
        Object.values(parsed).forEach(v => {
          if (typeof v === 'string' && !imageArray.includes(v)) {
            imageArray.push(v)
          }
        })
      }
    } catch (e) { 
      console.error("Image parsing error", e)
    }
  }

  // Agar product ki koi image na ho toh default laga dein
  if (imageArray.length === 0) {
    imageArray.push('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80')
  }

  // Naye Client Component ko call karein aur saara processed data pass kar dein
  return (
    <ProductClient 
      product={product} 
      images={imageArray} 
      domain={domain} 
    />
  )
} 