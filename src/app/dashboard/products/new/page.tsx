"use client"

import { useActionState, useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { createProduct } from './actions'
import { generateProductCopy } from './ai-actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIUpload } from "@/components/ai-upload"
import { Sparkles, Loader2, Package, Coins, Zap, ArrowLeft, Save, Trash2, ImageIcon } from "lucide-react"
import Link from "next/link"

// Type for multiple images
type ProductImage = {
  raw: string;
  enhanced: string | null;
}

export default function NewProductPage() {
  // @ts-ignore
  const [state, formAction, pending] = useActionState(createProduct, null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiContext, setAiContext] = useState('')

  // ── ARRAY STATE FOR MULTIPLE IMAGES ──
  const [images, setImages] = useState<ProductImage[]>([])

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  // Nayi image upload hone par array mein add kar dega
  const handleImageComplete = (raw: string, enhanced: string | null) => {
    setImages(prev => [...prev, { raw, enhanced }])
  }

  // Specific image ko list se nikalne ke liye
  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleGenerateCopy = async () => {
    setIsGenerating(true)
    setGenerationError(null)
    // AI Copywriter ke liye pehli image use karenge (agar available hai)
    const targetImage = images[0]?.enhanced || images[0]?.raw || undefined
    const result = await generateProductCopy(aiContext, targetImage)

    if (result.success && result.data) {
      setTitle(result.data.title)
      setDescription(result.data.description)
    } else {
      setGenerationError(result.error || "Failed to generate copy")
    }
    setIsGenerating(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 relative font-sans"
    >
      {/* Background Glows */}
      <div className="absolute -top-20 -right-20 size-[400px] bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/2 -left-20 size-[300px] bg-violet-500/10 blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <Link href="/dashboard/products" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-6">
            <ArrowLeft className="size-4" /> Back to Inventory
          </Link>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Create Product</h2>
          <p className="text-white/40 font-medium">Engineer your product listing with Quadlix AI Intelligence.</p>
        </div>
      </div>

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

        {/* Left Column: Intelligence & Core Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* AI Copywriter Card */}
          <Card className="bg-[#0e0e1a]/40 backdrop-blur-xl border-indigo-500/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/5">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="size-5 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-white">AI Copywriter</CardTitle>
                  <CardDescription className="text-white/40">Provide a few keywords or an image for instant results.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="e.g., Premium silk scarf with floral patterns..."
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  className="h-12 bg-white/[0.03] border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-indigo-500/50 transition-all"
                />
                <Button
                  type="button"
                  onClick={handleGenerateCopy}
                  disabled={isGenerating || (!aiContext && images.length === 0)}
                  className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                  {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                  Generate
                </Button>
              </div>
              {generationError && (
                <div className="flex items-center gap-2 text-rose-400 text-sm font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                  <p>{generationError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Information */}
          <Card className="bg-[#0a0a0c]/60 backdrop-blur-xl border-white/5 rounded-[2rem] shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="size-5 text-white/40" /> Product Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-white/50 text-xs font-bold uppercase tracking-widest">Product Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title generated by AI..."
                  className="h-12 bg-white/[0.02] border-white/10 rounded-xl text-lg font-semibold text-white focus:border-white/20"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-white/50 text-xs font-bold uppercase tracking-widest">Story & Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="The description will be composed here..."
                  className="bg-white/[0.02] border-white/10 rounded-2xl text-white/80 leading-relaxed focus:border-white/20 custom-scrollbar"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="bg-[#0a0a0c]/60 backdrop-blur-xl border-white/5 rounded-[2rem] shadow-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Coins className="size-5 text-white/40" /> Economics & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="price" className="text-white/50 text-xs font-bold uppercase tracking-widest">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" className="h-12 bg-white/[0.02] border-white/10 rounded-xl font-bold text-indigo-400" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="compareAtPrice" className="text-white/50 text-xs font-bold uppercase tracking-widest">Market Value ($)</Label>
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" placeholder="0.00" className="h-12 bg-white/[0.02] border-white/10 rounded-xl text-white/40" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="inventoryCount" className="text-white/50 text-xs font-bold uppercase tracking-widest">Available Units</Label>
                <Input id="inventoryCount" name="inventoryCount" type="number" placeholder="100" className="h-12 bg-white/[0.02] border-white/10 rounded-xl font-mono" required />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Media, Status & Controls */}
        <div className="space-y-8">

          {/* Media Card (UPDATED FOR MULTIPLE IMAGES) */}
          <Card className="bg-[#0a0a0c]/60 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
            <CardHeader className="bg-white/[0.02] border-b border-white/5">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
                Visual Assets ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">

              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <AnimatePresence>
                    {images.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 group shadow-lg"
                      >
                        <img
                          src={img.enhanced || img.raw}
                          alt={`Product Image ${idx + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-rose-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="rounded-[2rem] overflow-hidden border border-dashed border-white/10 bg-white/[0.01] p-4 group hover:bg-white/[0.03] transition-all">
                <div className="[&>div]:grid-cols-1 [&>div>div]:border-none [&>div>div>div]:p-0 [&>div>div>div:last-child]:pt-4">
                  {/* key prop is used to reset the uploader component if needed, or allow consecutive uploads */}
                  <AIUpload key={images.length} onComplete={handleImageComplete} />
                </div>
              </div>

              {/* ── HIDDEN INPUTS FOR BACKEND ── */}
              {/* Fallback for old schema if required by actions.ts */}
              <input type="hidden" name="rawImageUrl" value={images[0]?.raw || ''} />
              <input type="hidden" name="enhancedImageUrl" value={images[0]?.enhanced || ''} />
              {/* Array stringified for supporting multiple images */}
              <input type="hidden" name="imagesData" value={JSON.stringify(images)} />

            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="bg-[#0a0a0c]/80 backdrop-blur-xl border-white/10 rounded-[2.5rem] shadow-2xl">
            <CardContent className="pt-8 space-y-6">
              {state?.error && (
                <div className="text-xs font-bold text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                  {state.error}
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="status" className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Publishing Status</Label>
                <select id="status" name="status" className="flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer appearance-none">
                  <option value="DRAFT" className="bg-[#0a0a0c]">Draft (Private)</option>
                  <option value="ACTIVE" className="bg-[#0a0a0c]">Active (Published)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-neutral-200 font-bold text-md gap-3 shadow-xl shadow-white/5 transition-all active:scale-95"
              >
                {pending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <Save className="size-5" /> Save Architecture
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-2 rounded-full bg-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Optimization Tip</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Upload multiple angles of your product. The AI Copywriter will analyze the first visual cue for a more accurate description.
            </p>
          </div>

        </div>
      </form>
    </motion.div>
  )
}