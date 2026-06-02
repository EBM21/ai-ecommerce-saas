"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Loader2, DollarSign, Package, AlertCircle, ImageIcon, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

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
        images: product.images || { raw: null, enhanced: null }
    })

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
            // Yahan aap apna Update Server Action call karenge
            // Example: await updateProduct(product.id, formData)

            // Filhaal dummy delay lagaya hai demo k liye:
            await new Promise(resolve => setTimeout(resolve, 1000))

            router.push("/dashboard/products")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to update product")
        } finally {
            setIsSaving(false)
        }
    }

    const currentImage = formData.images.enhanced || formData.images.raw

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-8 pb-20"
        >

            <div className="grid md:grid-cols-3 gap-8">
                {/* ── LEFT: BASIC INFO ── */}
                <div className="md:col-span-2 p-8 rounded-[2rem] bg-[#0a0a0c] border border-white/5 space-y-6 shadow-xl">
                    <div>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Product Title</label>
                        <input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white font-medium focus:border-indigo-500/50 outline-none transition-all resize-none custom-scrollbar"
                        />
                    </div>
                </div>

                {/* ── RIGHT: IMAGE UPLOAD ── */}
                <div className="p-8 rounded-[2rem] bg-[#0a0a0c] border border-white/5 space-y-6 shadow-xl flex flex-col">
                    <h3 className="flex items-center gap-2 text-white font-bold mb-2"><ImageIcon className="size-4 text-pink-400" /> Product Image</h3>

                    <label className="relative flex-1 w-full aspect-square border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-all overflow-hidden flex flex-col items-center justify-center group">
                        {isUploadingImage ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="size-8 text-indigo-400 animate-spin" />
                                <span className="text-xs font-bold text-white/50">Uploading...</span>
                            </div>
                        ) : currentImage ? (
                            <>
                                <img src={currentImage} alt="Product" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-3 bg-black/60 rounded-full backdrop-blur-md mb-2"><Upload className="size-5 text-white" /></div>
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">Replace Image</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-white/30">
                                <ImageIcon className="size-8 mb-2" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Click to upload</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                    </label>
                </div>
            </div>

            {/* ── BOTTOM: PRICING & INVENTORY ── */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2rem] bg-[#0a0a0c] border border-white/5 space-y-6 shadow-xl">
                    <h3 className="flex items-center gap-2 text-white font-bold mb-4"><DollarSign className="size-4 text-indigo-400" /> Pricing</h3>
                    <div>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Price ($)</label>
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Compare at Price ($)</label>
                        <input type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-[#0a0a0c] border border-white/5 space-y-6 shadow-xl">
                    <h3 className="flex items-center gap-2 text-white font-bold mb-4"><Package className="size-4 text-emerald-400" /> Inventory & Status</h3>
                    <div>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Stock Count</label>
                        <input type="number" name="inventoryCount" value={formData.inventoryCount} onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Product Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none transition-all appearance-none">
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
                    className="flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                    {isSaving ? "Saving Changes..." : "Save Product"}
                </button>
            </div>
        </motion.form>
    )
}