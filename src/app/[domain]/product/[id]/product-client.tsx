"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft, Sparkles, Star, CheckCircle2, Shield, Lock, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export default function ProductClient({ 
  product, 
  images, 
  domain,
  theme,
  blockProps
}: { 
  product: any, 
  images: string[], 
  domain: string,
  theme: any,
  blockProps?: any
}) {
  const router = useRouter()
  const { addToCart, setIsCartOpen } = useCart()
  const [mainImage, setMainImage] = useState(images[0])
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // ── VARIANT SELECTION ──
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variants[0] : null)

  const currentPrice = selectedVariant?.price || product.price
  const currentComparePrice = selectedVariant?.price ? null : product.compareAtPrice

  const handleAddToCart = () => {
    setIsAdding(true)
    setTimeout(() => {
      setIsAdding(false)
      setAdded(true)
      addToCart({
        id: product.id,
        title: product.title,
        price: Number(currentPrice),
        image: mainImage,
        domain,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name
      })
      setTimeout(() => {
        setAdded(false)
        setIsCartOpen(true)
      }, 500)
    }, 600)
  }

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: Number(currentPrice),
      image: mainImage,
      domain,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name
    })
    router.push(`/${domain}/checkout`)
  }

  const layoutId = theme?.layoutId || 'nova'

  // ─────────────────────────────────────────────────────────────────────────────
  // MINIMAL PRODUCT LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  if (layoutId === 'minimal') {
    return (
      <div className="flex-1 bg-background text-foreground py-20 px-10">
        <div className="max-w-7xl mx-auto">
          <Link href={`/${domain}`} className="inline-flex items-center gap-2 opacity-40 hover:opacity-100 transition-colors text-[10px] font-bold uppercase tracking-[0.3em] mb-20 no-underline" style={{ color: "currentColor" }}>
            <ArrowLeft className="size-3" /> Back
          </Link>
          <div className="grid md:grid-cols-2 gap-32 items-start">
            <div className="space-y-4">
               <div className="aspect-[3/4] bg-secondary/30 overflow-hidden">
                  <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
               </div>
               <div className="flex gap-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <div key={i} onClick={() => setMainImage(img)} className={`size-24 bg-secondary/30 cursor-pointer border ${mainImage === img ? 'border-foreground' : 'border-transparent opacity-50'}`}>
                       <img src={img} alt={`${product.title} gallery ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
            </div>
            <div className="space-y-12">
               <div className="space-y-4">
                  <h1 className="text-5xl font-light tracking-tight">{product.title}</h1>
                  <p className="text-2xl font-light opacity-50">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(currentPrice))}</p>
               </div>
               {hasVariants && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">Select Option</p>
                    <div className="flex flex-wrap gap-3">
                       {product.variants.map((v: any) => (
                         <button key={v.id} onClick={() => setSelectedVariant(v)} className={`px-8 py-3 border text-[11px] font-bold uppercase tracking-widest transition-all ${selectedVariant?.id === v.id ? 'bg-foreground text-background border-foreground' : 'bg-transparent text-foreground border-border hover:border-foreground'}`}>
                           {v.name}
                         </button>
                       ))}
                    </div>
                  </div>
               )}
               <div className="prose prose-sm opacity-60 leading-relaxed font-light" style={{ color: "currentColor" }}>
                 {product.description}
               </div>
               <div className="space-y-3 pt-8">
                 <button onClick={handleAddToCart} disabled={isAdding || added} className="w-full h-16 bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all flex items-center justify-center">
                    {isAdding ? "Adding..." : added ? "Added" : (blockProps?.addToCartText || "Add to Bag")}
                 </button>
                 <button onClick={handleBuyNow} className="w-full h-16 border border-foreground text-foreground text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-foreground/5 transition-all">
                    {blockProps?.buyNowText || "Checkout Now"}
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ENIGMA PRODUCT LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  if (layoutId === 'enigma') {
    return (
      <div className="flex-1 bg-background text-foreground py-20 px-6 md:px-20">
        <Link href={`/${domain}`} className="inline-flex items-center gap-3 opacity-20 hover:text-red-600 transition-colors text-xs font-black uppercase italic tracking-widest mb-16 no-underline" style={{ color: "currentColor" }}>
          <ArrowLeft className="size-4" /> Return to Lineup
        </Link>
        <div className="grid lg:grid-cols-2 gap-20 items-start">
           <div className="sticky top-32 space-y-6">
              <div className="aspect-square bg-card border border-border relative overflow-hidden group">
                  <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-8 left-8 bg-red-600 px-4 py-1 text-[10px] font-black uppercase italic tracking-widest text-white">Enigma Core</div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div key={i} onClick={() => setMainImage(img)} className={`aspect-square bg-card border cursor-pointer transition-all ${mainImage === img ? 'border-red-600 scale-105' : 'border-border opacity-30 hover:opacity-100'}`}>
                       <img src={img} alt={`${product.title} gallery ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>
           </div>
           <div className="space-y-16">
              <div className="space-y-4 border-l-4 border-red-600 pl-10">
                 <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">{product.title}</h1>
                 <p className="text-4xl font-black italic opacity-40 tracking-tighter">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(currentPrice))}</p>
              </div>
              {hasVariants && (
                 <div className="space-y-6">
                   <p className="text-xs font-black uppercase italic tracking-[0.3em] opacity-20">The Selection</p>
                   <div className="grid grid-cols-2 gap-3">
                      {product.variants.map((v: any) => (
                        <button key={v.id} onClick={() => setSelectedVariant(v)} className={`h-16 border-2 font-black uppercase italic tracking-widest transition-all ${selectedVariant?.id === v.id ? 'bg-foreground text-background border-foreground' : 'bg-transparent text-foreground border-border hover:border-foreground'}`}>
                          {v.name}
                        </button>
                      ))}
                   </div>
                 </div>
              )}
              <div className="text-xl font-medium italic opacity-50 leading-relaxed max-w-xl">
                 {product.description}
              </div>
              <div className="flex flex-col gap-4">
                 <button onClick={handleAddToCart} disabled={isAdding || added || product.inventoryCount === 0} className={`h-20 font-black uppercase italic text-xl tracking-tighter transition-all flex items-center justify-center gap-4 ${product.inventoryCount === 0 ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white active:scale-95"}`}>
                    {product.inventoryCount === 0 ? "Out of Stock" : isAdding ? "Analyzing..." : added ? "Success" : (blockProps?.addToCartText || "Forge Order")} {product.inventoryCount > 0 && <ShoppingCart className="size-6" />}
                 </button>
                 <button onClick={handleBuyNow} disabled={product.inventoryCount === 0} className={`h-20 border-4 font-black uppercase italic text-xl tracking-tighter transition-all flex items-center justify-center gap-4 ${product.inventoryCount === 0 ? "border-zinc-800 text-zinc-600 cursor-not-allowed" : "border-foreground hover:bg-foreground hover:text-background text-foreground active:scale-95"}`}>
                    {product.inventoryCount === 0 ? "Unavailable" : (blockProps?.buyNowText || "Instant Acquisition")} {product.inventoryCount > 0 && <ArrowRight className="size-6" />}
                 </button>
              </div>
              <div className="grid grid-cols-2 gap-px bg-foreground/10 border border-border">
                  <div className="p-8 bg-background flex flex-col gap-2">
                     <Shield className="size-5 text-red-600" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Encrypted</p>
                  </div>
                  <div className="p-8 bg-background flex flex-col gap-2">
                     <Lock className="size-5 text-red-600" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Verified</p>
                  </div>
              </div>
           </div>
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🚀 NOVA PRODUCT LAYOUT (Default)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <Link href={`/${domain}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[13px] font-bold uppercase tracking-widest mb-10 no-underline">
          <ArrowLeft className="size-4" /> Back to Collection
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="space-y-6 sticky top-28">
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-card border border-border group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={mainImage}
                alt={product.title}
                className="object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
              />
              <div className="absolute top-6 right-6 bg-secondary/80 backdrop-blur-md border border-border/80 text-foreground px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                <Sparkles className="size-3" /> Quadlix Verified
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`size-20 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                      mainImage === img 
                      ? "border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105" 
                      : "border border-border bg-secondary opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={img} className="object-cover w-full h-full" alt={`${product.title} view ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col pt-4 md:pt-10">
            <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Star className="size-3.5 fill-current" /> Top Rated
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground">
              {product.title}
            </h1>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(currentPrice))}
              </span>
              {currentComparePrice && (
                <span className="text-xl text-muted-foreground/60 line-through font-medium mb-1">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(currentComparePrice))}
                </span>
              )}
            </div>

            {/* ── VARIANT PICKER ── */}
            {hasVariants && (
              <div className="mb-10 space-y-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Select Option</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
                        selectedVariant?.id === v.id
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-secondary border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="prose prose-neutral dark:prose-invert max-w-none mb-12 text-muted-foreground text-lg leading-relaxed whitespace-pre-line font-medium">
              {product.description || "Premium product details are currently being updated."}
            </div>

            <div className="flex flex-col gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding || added || product.inventoryCount === 0}
                className={`relative group w-full h-16 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 overflow-hidden transition-all shadow-xl ${
                  product.inventoryCount === 0
                  ? "bg-secondary text-muted-foreground/50 cursor-not-allowed border border-border"
                  : added 
                  ? "bg-emerald-500 text-white" 
                  : "bg-primary text-primary-foreground active:scale-95 hover:bg-primary/90"
                }`}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {product.inventoryCount === 0 ? (
                    "Out of Stock"
                  ) : isAdding ? (
                    <span className="animate-spin border-2 border-current border-t-transparent rounded-full size-5" />
                  ) : added ? (
                    <><CheckCircle2 className="size-5" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="size-5" /> {blockProps?.addToCartText || "Add to Cart"}</>
                  )}
                </span>
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={product.inventoryCount === 0}
                className={`w-full h-16 rounded-2xl border font-bold text-lg transition-all ${
                  product.inventoryCount === 0 
                  ? "bg-transparent border-border/50 text-muted-foreground/30 cursor-not-allowed" 
                  : "bg-secondary/50 border-border text-foreground hover:bg-secondary hover:border-border/80 active:scale-95"
                }`}
              >
                {blockProps?.buyNowText || "Buy it now"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-border pt-10">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                  <Truck className="size-5 text-foreground/80" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">{blockProps?.shippingTitle || "Global Shipping"}</h4>
                  <p className="text-xs text-muted-foreground">{blockProps?.shippingDesc || "Free delivery on premium orders."}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                  <ShieldCheck className="size-5 text-foreground/80" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-1">{blockProps?.secureTitle || "Secure Checkout"}</h4>
                  <p className="text-xs text-muted-foreground">{blockProps?.secureDesc || "Encrypted and safe payments."}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
