import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductClient from './product-client'
import { VisualBuilderRenderer } from '@/components/visual-builder-renderer'
import { getBaseUrl } from '@/lib/get-base-url'

export async function generateMetadata({ params }: { params: Promise<{ domain: string, id: string }> }) {
  const { domain, id } = await params

  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) return { title: 'Product Not Found' }

  const seo = typeof product.seoMeta === 'string' ? JSON.parse(product.seoMeta) : (product.seoMeta || {})

  return {
    title: seo.title || `${product.title} | Premium Edition`,
    description: seo.description || product.description?.substring(0, 160),
    keywords: seo.keywords || undefined,
    openGraph: {
      title: seo.title || product.title,
      description: seo.description || product.description?.substring(0, 160),
      images: Array.isArray(product.images) ? product.images[0] : undefined
    }
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

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true }
  })

  if (!product || product.storeId !== store.id || product.status !== 'ACTIVE') notFound()

  // Ensure price fields are numbers for the client
  const formattedProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    variants: product.variants.map(v => ({
      ...v,
      price: v.price ? Number(v.price) : null
    }))
  }

  // Safely parse the images JSON into a clean Array
  let imageArray: string[] = []
  
  if (product.images) {
    try {
      const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
      
      // Agar database mein images pehle se Array hain (e.g. ["url1", "url2"] ya [{raw: "url"}])
      if (Array.isArray(parsed)) {
        imageArray = parsed.map((item: any) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            return item.enhanced || item.raw;
          }
          return null;
        }).filter(Boolean);
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

  // Parse & merge config
  const defaults = { layoutId: 'nova' } // Basic fallback
  let theme: any = defaults
  if (store.themeConfig) {
    try {
      theme = typeof store.themeConfig === 'string'
        ? JSON.parse(store.themeConfig as string)
        : store.themeConfig
    } catch (e) {
      console.error("Product Page: theme parse error", e)
    }
  }

  // ── BUILDER MODE SUPPORT ──
  const baseUrl = await getBaseUrl(domain)
  if (theme?.mode === 'builder') {
      const homeBlocks = theme.pageBlocks?.home ?? theme.blocks ?? []
      let localBlocks = theme.pageBlocks?.product ?? []
      
      if (localBlocks.length === 0) {
          localBlocks = [{
              id: 'default-product',
              type: 'system-product-details',
              props: {},
              animation: { entrance: 'none', hover: 'none' },
              styles: { paddingTop: '0px', paddingBottom: '0px' }
          }]
      }

      let finalBlocks = [...localBlocks]
      if (!finalBlocks.some(b => b.type.startsWith('header-'))) {
          const h = homeBlocks.find((b: any) => b.type.startsWith('header-'))
          if (h) finalBlocks.unshift(h)
      }
      if (!finalBlocks.some(b => b.type.startsWith('footer-'))) {
          const f = homeBlocks.find((b: any) => b.type.startsWith('footer-'))
          if (f) finalBlocks.push(f)
      }

      return (
          <div style={{
              backgroundColor: theme?.styles?.bgColor || '#ffffff',
              color: theme?.styles?.textColor || '#000000',
              minHeight: '100vh',
              fontFamily: theme?.styles?.bodyFont || 'var(--font-inter)'
          }}>
              <VisualBuilderRenderer 
                  blocks={finalBlocks} 
                  products={[formattedProduct]} 
                  domain={domain} 
                  baseUrl={baseUrl} 
                  theme={theme}
              />
          </div>
      )
  }

  // Naye Client Component ko call karein aur saara processed data pass kar dein
  return (
    <ProductClient 
      product={formattedProduct} 
      images={imageArray} 
      domain={domain} 
      theme={theme}
    />
  )
} 
 