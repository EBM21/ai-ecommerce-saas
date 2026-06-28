"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Loader2, DollarSign, Package, AlertCircle, ImageIcon, Upload, Plus, Layers, Trash2, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { updateProduct } from "../../new/actions"
import { getStoreCategories, createCategory } from "../../category-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Variant = {
    name: string
    sku: string
    price: string
    inventory: string
}

export default function EditProductClient({ product }: { product: any }) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: product.title,
        description: product.description || "",
        price: product.price,
        compareAtPrice: product.compareAtPrice || "",
        inventoryCount: product.inventoryCount,
        status: product.status,
        images: product.images || []
    })

    // ── VARIANTS & CATEGORIES ──
    const [variants, setVariants] = useState<Variant[]>(product.variants || [])
    const [allCategories, setAllCategories] = useState<any[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>(product.categories?.map((c: any) => c.id) || [])
    const [newCatName, setNewCatName] = useState('')
    const [isCreatingCat, setIsCreatingCat] = useState(false)

    useEffect(() => {
        getStoreCategories().then(setAllCategories)
    }, [])

    const addVariant = () => setVariants([...variants, { name: '', sku: '', price: '', inventory: '' }])
    const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i))
    const updateVariantField = (i: number, field: keyof Variant, val: string) => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // ── IMAGE UPLOAD LOGIC ──
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingImage(true)
        setError(null)

        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `product-edit-${Date.now()}.${fileExt}`

            const { data, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            const newImageUrl = publicUrlData.publicUrl

            // Update state with new image
            setFormData(prev => ({
                ...prev,
                images: {
                    raw: newImageUrl,
                    enhanced: newImageUrl // Assuming we are replacing both with the new raw image
                }
            }))
        } catch (err: any) {
            console.error("Upload error:", err)
            setError("Failed to upload image: " + err.message)
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)

        try {
            const res = await updateProduct(product.id, {
                ...formData,
                variants,
                categories: selectedCategories
            })

            if (!res.success) throw new Error(res.error)

            router.push("/dashboard/products")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to update product")
        } finally {
            setIsSaving(false)
        }
    }

    const currentImage = Array.isArray(formData.images) ? (formData.images[0]?.enhanced || formData.images[0]?.raw) : (formData.images.enhanced || formData.images.raw)

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-8 pb-20"
        >

            <div className="grid md:grid-cols-3 gap-8">
                {/* ── LEFT: BASIC INFO ── */}
                <div className="md:col-span-2 space-y-8">
                    <div className="p-8 rounded-[2rem] bg-card border border-border/50 space-y-6 shadow-xl">
                        <div>
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Product Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-secondary border border-border rounded-xl px-4 h-12 text-sm text-foreground font-medium focus:border-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                className="w-full bg-secondary border border-border rounded-xl p-4 text-sm text-foreground font-medium focus:border-indigo-500/50 outline-none transition-all resize-none custom-scrollbar"
                            />
                        </div>
                    </div>

                    {/* Product Variants */}
                    <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2rem] shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-secondary/20 p-8">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Layers className="size-5 text-muted-foreground" /> Variants (Sizes, Colors, etc.)
                                </CardTitle>
                                <Button type="button" onClick={addVariant} variant="outline" size="sm" className="rounded-xl gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all">
                                    <Plus className="size-4" /> Add Variant
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {variants.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
                                    <p className="text-sm text-muted-foreground">No variants added yet. This is a singular product.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {variants.map((v, i) => (
                                        <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-secondary/30 border border-border relative group">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Option Name</label>
                                                <input value={v.name} onChange={e => updateVariantField(i, 'name', e.target.value)} placeholder="e.g. XL / Blue" className="w-full h-9 bg-secondary border border-border rounded-lg px-3 text-xs text-foreground outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-muted-foreground/60">SKU</label>
                                                <input value={v.sku} onChange={e => updateVariantField(i, 'sku', e.target.value)} placeholder="PROD-001" className="w-full h-9 bg-secondary border border-border rounded-lg px-3 text-xs text-foreground outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Price Override</label>
                                                <input value={v.price} type="number" onChange={e => updateVariantField(i, 'price', e.target.value)} placeholder="Optional" className="w-full h-9 bg-secondary border border-border rounded-lg px-3 text-xs text-foreground outline-none" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Stock</label>
                                                <div className="flex items-center gap-2">
                                                    <input value={v.inventory} type="number" onChange={e => updateVariantField(i, 'inventory', e.target.value)} placeholder="0" className="w-full h-9 bg-secondary border border-border rounded-lg px-3 text-xs text-foreground outline-none" />
                                                    <Button type="button" onClick={() => removeVariant(i)} variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 shrink-0">
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── RIGHT: MEDIA & CATEGORIES ── */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[2rem] bg-card border border-border/50 space-y-6 shadow-xl flex flex-col">
                        <h3 className="flex items-center gap-2 text-foreground font-bold mb-2"><ImageIcon className="size-4 text-pink-400" /> Product Image</h3>

                        <label className="relative flex-1 w-full aspect-square border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-secondary/50 transition-all overflow-hidden flex flex-col items-center justify-center group">
                            {isUploadingImage ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="size-8 text-indigo-400 animate-spin" />
                                    <span className="text-xs font-bold text-muted-foreground">Uploading...</span>
                                </div>
                            ) : currentImage ? (
                                <>
                                    <img src={currentImage} alt="Product" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-3 bg-secondary rounded-full backdrop-blur-md mb-2"><Upload className="size-5 text-foreground" /></div>
                                        <span className="text-xs font-bold text-foreground uppercase tracking-widest">Replace Image</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
                                    <ImageIcon className="size-8 mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Click to upload</span>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                        </label>
                    </div>

                    {/* Categories Card */}
                    <Card className="bg-card/60 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <CardHeader className="bg-secondary/50 border-b border-border/50 p-6">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-tighter">
                                Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Select Categories</label>
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
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-3 block">Quick Create Category</label>
                                <div className="flex gap-2">
                                    <input 
                                        value={newCatName} 
                                        onChange={e => setNewCatName(e.target.value)} 
                                        placeholder="Name..." 
                                        className="flex-1 h-10 bg-secondary/50 border border-border text-xs rounded-xl px-3 text-foreground outline-none" 
                                    />
                                    <Button 
                                        type="button" 
                                        onClick={handleCreateCategory} 
                                        disabled={isCreatingCat || !newCatName} 
                                        className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 shrink-0"
                                    >
                                        {isCreatingCat ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-4" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── BOTTOM: PRICING & INVENTORY ── */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-card border border-border/50 space-y-6 shadow-xl">
                    <h3 className="flex items-center gap-2 text-foreground font-bold mb-4"><DollarSign className="size-4 text-indigo-400" /> Pricing</h3>
                    <div>
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Price ($)</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-secondary border border-border rounded-xl px-4 h-12 text-sm text-foreground font-medium focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Compare at Price ($)</label>
                        <input type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="w-full bg-secondary border border-border rounded-xl px-4 h-12 text-sm text-foreground font-medium focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-card border border-border/50 space-y-6 shadow-xl">
                    <h3 className="flex items-center gap-2 text-foreground font-bold mb-4"><Package className="size-4 text-emerald-400" /> Inventory & Status</h3>
                    <div>
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Stock Count</label>
                        <input type="number" name="inventoryCount" value={formData.inventoryCount} onChange={handleChange} required className="w-full bg-secondary border border-border rounded-xl px-4 h-12 text-sm text-foreground font-medium focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Product Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-secondary border border-border rounded-xl px-4 h-12 text-sm text-foreground font-medium focus:border-indigo-500/50 outline-none transition-all appearance-none">
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="size-4" /> {error}
                </div>
            )}

            {/* Floating Save Button */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                <button
                    type="submit"
                    disabled={isSaving || isUploadingImage}
                    className="flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-black uppercase tracking-widest text-foreground shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                    {isSaving ? "Saving Changes..." : "Save Product"}
                </button>
            </div>
        </motion.form>
    )
}