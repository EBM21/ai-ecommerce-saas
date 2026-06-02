import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'

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

  // Safely parse the images JSON
  let images: any = { raw: null, enhanced: null }
  if (product.images) {
    try {
      images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
    } catch (e) { }
  }

  const displayImage = images.enhanced || images.raw || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'

  return (
    <div className="min-h-screen bg-[#030305] text-[#f0eff8] selection:bg-indigo-500/30">

      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">

        {/* Back Navigation */}
        <Link href={`/${domain}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[13px] font-bold uppercase tracking-widest mb-10">
          <ArrowLeft className="size-4" /> Back to Collection
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">

          {/* ── LEFT: PRODUCT VISUALS ── */}
          <div className="space-y-6 sticky top-28">
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-[#050508] border border-white/5 group shadow-2xl">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <img
                src={displayImage}
                alt={product.title}
                className="object-cover w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
              />

              {/* Premium Badge */}
              <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                <Sparkles className="size-3" /> Quadlix Verified
              </div>
            </div>

            {/* Thumbnail Gallery (If both exist) */}
            {images.raw && images.enhanced && (
              <div className="flex gap-4 px-2">
                <div className="size-20 rounded-2xl overflow-hidden border-2 border-indigo-500 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-105 transition-all">
                  <img src={images.enhanced} className="object-cover w-full h-full" alt="Enhanced Edition" />
                </div>
                <div className="size-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 cursor-pointer opacity-50 hover:opacity-100 hover:scale-105 transition-all">
                  <img src={images.raw} className="object-cover w-full h-full" alt="Raw Original" />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: PRODUCT INTELLIGENCE ── */}
          <div className="flex flex-col pt-4 md:pt-10">

            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Star className="size-3.5 fill-indigo-400" /> Top Rated
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
              {product.title}
            </h1>

            <div className="flex items-end gap-4 mb-10">
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                ${Number(product.price).toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xl text-white/30 line-through font-medium mb-1">
                  ${Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="prose prose-invert max-w-none mb-12 text-white/50 text-lg leading-relaxed whitespace-pre-line font-medium">
              {product.description || "Premium product details are currently being updated."}
            </div>

            {/* ── CALL TO ACTION ── */}
            <div className="flex flex-col gap-4 mb-12">
              <button className="relative group w-full h-16 rounded-2xl bg-white text-black font-extrabold text-lg flex items-center justify-center gap-3 overflow-hidden transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <span className="relative z-10 flex items-center gap-3">
                  <ShoppingCart className="size-5" /> Add to Cart
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-bold text-lg hover:bg-white/[0.06] hover:border-white/20 transition-all active:scale-95">
                Buy it now
              </button>
            </div>

            {/* ── TRUST SIGNALS ── */}
            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-10">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Truck className="size-5 text-white/60" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Global Shipping</h4>
                  <p className="text-xs text-white/40">Free delivery on premium orders.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 text-white/60" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Secure Checkout</h4>
                  <p className="text-xs text-white/40">Encrypted and safe payments.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}