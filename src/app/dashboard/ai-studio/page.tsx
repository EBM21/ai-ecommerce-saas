"use client"

import { useState } from "react"
import { AIUpload } from "@/components/ai-upload"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { processAIImage } from "./actions"
import { toast } from "sonner"
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers,
  Download,
  ExternalLink,
  Plus
} from "lucide-react"

export default function AIStudioPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [originalUrl, setRawUrl] = useState<string | null>(null)

  const handleProcess = async (url: string) => {
    setRawUrl(url)
    setIsProcessing(true)
    try {
      const result = await processAIImage(url, 'remove-bg')
      if (result.success && result.processedUrl) {
        setProcessedUrl(result.processedUrl)
        if (result.isDemo) {
          toast.info("Demo Mode Active", { description: result.message })
        } else {
          toast.success("AI Processing Complete!")
        }
      } else {
        toast.error("AI Error", { description: result.error })
      }
    } catch (e: any) {
      toast.error("Failed to process image")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-6"
    >
      {/* ── Header Section ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600/20 via-card to-violet-600/10 border border-border p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wand2 className="size-32 rotate-12 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Sparkles className="size-5 text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em]">Next-Gen Editing</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Creative</span> Studio
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Upload raw photos and let our neural networks handle the rest.
            From background removal to studio-grade lighting—instantly.
          </p>
        </div>
      </div>

      {/* ── Main Workspace ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 relative group">
        <AnimatePresence mode="wait">
          {processedUrl ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative aspect-[4/3] sm:aspect-video rounded-[2.5rem] overflow-hidden border border-emerald-500/20 bg-card shadow-2xl">
                 <img src={processedUrl} alt="AI Result" className="size-full object-contain" />
                 <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                    <CheckCircle2 className="size-3.5" /> High Fidelity Result
                 </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 bg-secondary/50 border border-border p-6 rounded-[2rem]">
                  <Button 
                    variant="outline" 
                    onClick={() => {setProcessedUrl(null); setRawUrl(null)}}
                    className="rounded-xl h-12 px-6 font-bold"
                  >
                    Discard & Retry
                  </Button>
                  <a href={processedUrl} target="_blank" rel="noreferrer" className="no-underline">
                    <Button variant="secondary" className="rounded-xl h-12 px-6 font-bold gap-2">
                       <Download className="size-4" /> Download PNG
                    </Button>
                  </a>
                  <Link href={`/dashboard/products/new?image=${encodeURIComponent(processedUrl)}`} className="no-underline">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-xl h-12 px-8 font-bold gap-2 text-white">
                       <Plus className="size-4" /> Create Listing with this Image
                    </Button>
                  </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
               {/* Decorative Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              
              <div className="relative bg-card border border-border rounded-[2.5rem] p-4 md:p-8 shadow-2xl">
                <AIUpload onProcess={handleProcess} isProcessing={isProcessing} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Workflow Steps ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: ImageIcon, title: "Upload", desc: "Drop your raw product shot" },
          { icon: Wand2, title: "Enhance", desc: "AI removes background & fixes light" },
          { icon: CheckCircle2, title: "Publish", desc: "Ready for your storefront" }
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-secondary/30 border border-border/50 transition-hover hover:bg-secondary/50">
            <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
              <step.icon className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
              <p className="text-[11px] text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pro Tips (Optional but Professional) ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="p-6 rounded-[2rem] border border-dashed border-border flex gap-4">
          <Layers className="size-6 text-muted-foreground shrink-0" />
          <div>
            <h5 className="text-sm font-bold text-foreground">Smart Batching</h5>
            <p className="text-xs text-muted-foreground mt-1">Upload up to 10 images at once for bulk background removal and resizing.</p>
          </div>
        </div>
        <div className="p-6 rounded-[2rem] border border-dashed border-border flex gap-4">
          <Sparkles className="size-6 text-muted-foreground shrink-0" />
          <div>
            <h5 className="text-sm font-bold text-foreground">Custom Prompts</h5>
            <p className="text-xs text-muted-foreground mt-1">Coming soon: Describe the environment you want your product to be in.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}