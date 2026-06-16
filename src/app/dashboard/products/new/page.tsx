"use client"

import { useActionState, useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from 'next/navigation'
import { createProduct } from './actions'
import { generateProductCopy } from './ai-actions'
import { getStoreCategories, createCategory } from '../category-actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIUpload } from "@/components/ai-upload"
import { Sparkles, Loader2, Package, Coins, Zap, ArrowLeft, Save, Trash2, ImageIcon, Plus, Layers, Check } from "lucide-react"
import Link from "next/link"

// Type for multiple images
type ProductImage = {
  raw: string;
  enhanced: string | null;
}

type Variant = {
  name: string
  sku: string
  price: string
  inventory: string
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <NewProductContent />
    </Suspense>
  )
}

function NewProductContent() {
  // @ts-ignore
  const [state, formAction, pending] = useActionState(createProduct, null)
  const searchParams = useSearchParams()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [aiContext, setAiContext] = useState('')

  // ── ARRAY STATE FOR MULTIPLE IMAGES ──
  const [images, setImages] = useState<ProductImage[]>([])

  useEffect(() => {
    const prefillImg = searchParams.get('image')
    if (prefillImg) {
      setImages([{ raw: prefillImg, enhanced: prefillImg }])
    }
  }, [searchParams])

  // ── VARIANTS & CATEGORIES ──
  const [variants, setVariants] = useState<Variant[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [isCreatingCat, setIsCreatingCat] = useState(false)

  useEffect(() => {
    getStoreCategories().then(setAllCategories)
  }, [])

  const addVariant = () => setVariants([...variants, { name: '', sku: '', price: '', inventory: '' }])
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i))
  const updateVariant = (i: number, field: keyof Variant, val: string) => {
    const next = [...variants]
    next[i][field] = val
    setVariants(next)
  }

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setIsCreatingCat(true)
    const res = await createCategory(newCatName)
    if (res.success && res.category) {
      setAllCategories([...allCategories, res.category])
      setSelectedCategories([...selectedCategories, res.category.id])
      setNewCatName('')
    }
    setIsCreatingCat(false)
  }

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
          <Link href="/dashboard/products" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-widest mb-6">
            <ArrowLeft className="size-4" /> Back to Inventory
          </Link>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Create Product</h2>
          <p className="text-muted-foreground font-medium">Engineer your product listing with Quadlix AI Intelligence.</p>
        </div>
      </div>

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

        {/* Left Column: Intelligence & Core Details */}
        <div className="lg:col-span-2 space-y-8">

          {/* AI Copywriter Card */}
          <Card className="bg-card/40 backdrop-blur-xl border-indigo-500/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/5">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-border/50 pb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="size-5 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">AI Copywriter</CardTitle>
                  <CardDescription className="text-muted-foreground">Provide a few keywords or an image for instant results.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="e.g., Premium silk scarf with floral patterns..."
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  className="h-12 bg-secondary/80 border-border rounded-xl text-foreground placeholder:text-foreground/20 focus:border-indigo-500/50 transition-all"
                />
                <Button
                  type="button"
                  onClick={handleGenerateCopy}
                  disabled={isGenerating || (!aiContext && images.length === 0)}
                  className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-foreground font-bold gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
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
          <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2rem] shadow-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="size-5 text-muted-foreground" /> Product Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Product Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title generated by AI..."
                  className="h-12 bg-secondary/50 border-border rounded-xl text-lg font-semibold text-foreground focus:border-border"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Story & Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="The description will be composed here..."
                  className="bg-secondary/50 border-border rounded-2xl text-foreground/90 leading-relaxed focus:border-border custom-scrollbar"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2rem] shadow-xl">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Coins className="size-5 text-muted-foreground" /> Economics & Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="price" className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Price ($)</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="0.00" className="h-12 bg-secondary/50 border-border rounded-xl font-bold text-indigo-400" required />
              </div>
              <div className="space-y-3">
                <Label htmlFor="compareAtPrice" className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Market Value ($)</Label>
                <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" placeholder="0.00" className="h-12 bg-secondary/50 border-border rounded-xl text-muted-foreground" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="inventoryCount" className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Available Units</Label>
                <Input id="inventoryCount" name="inventoryCount" type="number" placeholder="100" className="h-12 bg-secondary/50 border-border rounded-xl font-mono" required />
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2rem] shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-secondary/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Layers className="size-5 text-muted-foreground" /> Variants (Sizes, Colors, etc.)
                </CardTitle>
                <Button type="button" onClick={addVariant} variant="outline" size="sm" className="rounded-xl gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all">
                  <Plus className="size-4" /> Add Variant
                </Button>
              </div>
              <CardDescription className="text-muted-foreground text-xs mt-1">Create multiple options for this product with specific SKUs and stock levels.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {variants.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-sm text-muted-foreground">No variants added yet. This is a singular product.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-secondary/30 border border-border relative group">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">Option Name</Label>
                        <Input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="e.g. XL / Blue" className="h-9 bg-secondary border-border text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">SKU</Label>
                        <Input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="PROD-001" className="h-9 bg-secondary border-border text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">Price Override</Label>
                        <Input value={v.price} type="number" onChange={e => updateVariant(i, 'price', e.target.value)} placeholder="Optional" className="h-9 bg-secondary border-border text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">Stock</Label>
                        <div className="flex items-center gap-2">
                          <Input value={v.inventory} type="number" onChange={e => updateVariant(i, 'inventory', e.target.value)} placeholder="0" className="h-9 bg-secondary border-border text-xs" />
                          <Button type="button" onClick={() => removeVariant(i)} variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-500/10">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input type="hidden" name="variantsData" value={JSON.stringify(variants)} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Media, Status & Controls */}
        <div className="space-y-8">

          {/* Media Card (UPDATED FOR MULTIPLE IMAGES) */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl">
            <CardHeader className="bg-secondary/50 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tighter">
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
                        className="relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary group shadow-lg"
                      >
                        <img
                          src={img.enhanced || img.raw}
                          alt={`Product Image ${idx + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-secondary text-foreground/90 hover:text-rose-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="rounded-[2rem] overflow-hidden border border-dashed border-border bg-secondary/30 p-4 group hover:bg-secondary/80 transition-all">
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

          {/* Categories Card */}
          <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl">
            <CardHeader className="bg-secondary/50 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tighter">
                Collections & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Select Collections</Label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold transition-all border flex items-center gap-1.5 ${
                        selectedCategories.includes(cat.id)
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-secondary border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      {selectedCategories.includes(cat.id) && <Check className="size-3" />}
                      {cat.name}
                    </button>
                  ))}
                  {allCategories.length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">No collections created yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-3 block">Quick Create Collection</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newCatName} 
                    onChange={e => setNewCatName(e.target.value)} 
                    placeholder="New collection name..." 
                    className="h-10 bg-secondary/50 border-border text-xs rounded-xl" 
                  />
                  <Button 
                    type="button" 
                    onClick={handleCreateCategory} 
                    disabled={isCreatingCat || !newCatName} 
                    className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  >
                    {isCreatingCat ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-4" />}
                  </Button>
                </div>
              </div>
              <input type="hidden" name="categoriesData" value={JSON.stringify(selectedCategories)} />
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="bg-card/80 backdrop-blur-xl border-border rounded-[2.5rem] shadow-2xl">
            <CardContent className="pt-8 space-y-6">
              {state?.error && (
                <div className="text-xs font-bold text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                  {state.error}
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="status" className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Publishing Status</Label>
                <select id="status" name="status" className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-secondary/80 px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer appearance-none">
                  <option value="DRAFT" className="bg-card">Draft (Private)</option>
                  <option value="ACTIVE" className="bg-card">Active (Published)</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-md gap-3 shadow-xl shadow-white/5 transition-all active:scale-95"
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
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload multiple angles of your product. The AI Copywriter will analyze the first visual cue for a more accurate description.
            </p>
          </div>

        </div>
      </form>
    </motion.div>
  )
}