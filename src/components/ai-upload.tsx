"use client"

import { useState } from "react"
import { Upload, ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function AIUpload({ onComplete }: { onComplete?: (raw: string, enhanced: string | null) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Direct Frontend to Supabase Upload (Fastest & Best for Vercel)
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `product-${Date.now()}.${fileExt}`

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

      const uploadedUrl = publicUrlData.publicUrl
      setRawImageUrl(uploadedUrl)

      // Pass the URL back to the parent form
      if (onComplete) {
        onComplete(uploadedUrl, null)
      }

    } catch (err: any) {
      console.error("Upload failed:", err)
      setError(err.message || "Something went wrong during upload.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      {rawImageUrl && !isUploading ? (
        // ── Success State (Uploaded Image Preview) ──
        <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#050508] group">
          <img src={rawImageUrl} alt="Product preview" className="object-cover w-full h-full" />

          {/* Overlay to upload a different image */}
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
            <Upload className="size-8 text-white mb-2" />
            <span className="text-sm font-bold text-white">Replace Image</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>

          <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xl">
            <CheckCircle2 className="size-3.5" /> Uploaded
          </div>
        </div>
      ) : (
        // ── Upload State ──
        <label className={`flex flex-col items-center justify-center w-full aspect-[4/3] sm:aspect-video border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isUploading ? 'bg-indigo-500/5 border-indigo-500/20' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            {isUploading ? (
              <>
                <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Loader2 className="size-7 text-indigo-400 animate-spin" />
                </div>
                <p className="mb-2 text-sm font-bold text-white">Uploading to Cloud...</p>
                <p className="text-xs text-white/40">Securing your visual asset</p>
              </>
            ) : (
              <>
                <div className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <ImageIcon className="size-6 text-white/40" />
                </div>
                <p className="mb-2 text-sm font-bold text-white">
                  Click or drag image to upload
                </p>
                <p className="text-xs text-white/40">Supports PNG, JPG or WEBP (Max 5MB)</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        </label>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
          {error}
        </div>
      )}
    </div>
  )
}