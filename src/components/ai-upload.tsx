"use client"

import { useState } from "react"
import { Upload, ImageIcon, Loader2, CheckCircle2, Wand2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function AIUpload({ onComplete, onProcess, isProcessing = false }: { 
  onComplete?: (raw: string, enhanced: string | null) => void,
  onProcess?: (url: string) => void,
  isProcessing?: boolean
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `product-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
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

      if (onComplete) {
        onComplete(uploadedUrl, null)
      }

    } catch (err) {
      console.error("Upload failed:", err)
      const errMsg = err instanceof Error ? err.message : "Something went wrong during upload."
      setError(errMsg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full">
      {rawImageUrl && !isUploading ? (
        // ── Success State (Uploaded Image Preview) ──
        <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden border border-border bg-card group">
          <img src={rawImageUrl} alt="Product preview" className="object-cover w-full h-full" />

          {/* Processing Overlay */}
          {isProcessing && (
             <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <Loader2 className="size-10 text-white animate-spin mb-4" />
                <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse text-center px-6">
                   Neural Engine removing background...
                </p>
             </div>
          )}

          {/* Actions Overlay */}
          {!isProcessing && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm z-10">
              <button 
                onClick={() => onProcess?.(rawImageUrl)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Wand2 className="size-4" /> Remove Background
              </button>
              
              <label className="flex items-center gap-2 text-white/60 hover:text-white cursor-pointer transition-colors text-xs font-bold uppercase tracking-widest">
                <Upload className="size-4" /> Replace Image
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          )}

          <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xl z-30">
            <CheckCircle2 className="size-3.5" /> {isProcessing ? 'Processing' : 'Uploaded'}
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