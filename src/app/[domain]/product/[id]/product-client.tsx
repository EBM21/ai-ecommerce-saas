"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, ShieldCheck, Truck, ArrowLeft, Sparkles, Star, CheckCircle2 } from "lucide-react"

export default function ProductClient({ 
  product, 
  images, 
  domain 
}: { 
  product: any, 
  images: string[], 
  domain: string 
}) {
  const [mainImage, setMainImage] = useState(images[0])
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // Add to Cart Logic
  const handleAddToCart = () => {
    setIsAdding(true)
    
    // Yahan aap apne asal Cart State/Context ko call karenge.
    // Filhal testing ke liye hum 1 second ka loading effect de rahe hain.
    setTimeout(() => {
      setIsAdding(false)
      setAdded(true)
      
      // 3 second baad button wapis normal ho jayega
      setTimeout(() => setAdded(false), 3000)
    }, 1000)
  }

  const handleBuyNow = () => {
    // Direct checkout page par bhejney ka logic
    alert("Redirecting to checkout...")
  }

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

          {/* ── LEFT: PRODUCT VISUALS (ACTIVE SLIDER) ── */}
          <div className="space-y-6 sticky top-28">
            <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-[#050508] border border-white/5 group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={mainImage}
                alt={product.title}
                className="object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
              />
              <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                <Sparkles className="size-3" /> Quadlix Verified
              </div>
            </div>

            {/* Thumbnail Gallery Slider */}
            {images.length > 1 && (
              <div className="flex gap-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`size-20 shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                      mainImage === img 
                      ? "border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105" 
                      : "border border-white/10 bg-white/5 opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={img} className="object-cover w-full h-full" alt={`${product.title} view ${idx + 1}`} />
                  </div>
                ))}
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

            {/* ── ACTIVE CALL TO ACTION BUTTONS ── */}
            <div className="flex flex-col gap-4 mb-12">
              <button 
                onClick={handleAddToCart}
                disabled={isAdding || added}
                className={`relative group w-full h-16 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3 overflow-hidden transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] ${
                  added 
                  ? "bg-emerald-500 text-white" 
                  : "bg-white text-black active:scale-95"
                }`}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isAdding ? (
                    <span className="animate-spin border-2 border-black border-t-transparent rounded-full size-5" />
                  ) : added ? (
                    <><CheckCircle2 className="size-5" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="size-5" /> Add to Cart</>
                  )}
                </span>
                {!added && !isAdding && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              <button 
                onClick={handleBuyNow}
                className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-bold text-lg hover:bg-white/[0.06] hover:border-white/20 transition-all active:scale-95"
              >
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