"use client"

import { AIUpload } from "@/components/ai-upload"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  Zap,
  Layers
} from "lucide-react"

export default function AIStudioPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 max-w-5xl mx-auto p-4 md:p-6"
    >
      {/* ── Header Section ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600/20 via-slate-900 to-violet-600/10 border border-white/10 p-8 md:p-12">
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

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Creative</span> Studio
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Upload raw photos and let our neural networks handle the rest.
            From background removal to studio-grade lighting—instantly.
          </p>
        </div>
      </div>

      {/* ── Steps / Workflow Guide ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: ImageIcon, title: "Upload", desc: "Drop your raw product shot" },
          { icon: Wand2, title: "Enhance", desc: "AI removes background & fixes light" },
          { icon: CheckCircle2, title: "Publish", desc: "Ready for your storefront" }
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 transition-hover hover:bg-white/[0.04]">
            <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
              <step.icon className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{step.title}</h4>
              <p className="text-[11px] text-slate-500">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Upload Zone ───────────────────────────────────────── */}
      <div className="relative group">
        {/* Decorative Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

        <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-4 md:p-8 shadow-2xl">
          <AIUpload />
        </div>
      </div>

      {/* ── Bottom Action Bar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="size-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                <Zap className="size-3 text-indigo-400" />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            <span className="text-white font-bold">1,240+</span> images processed today
          </p>
        </div>

        <Link href="/dashboard/products/new">
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 font-bold px-8 rounded-2xl h-14 shadow-xl flex items-center gap-2 group transition-all">
            Create Product with Image
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {/* ── Pro Tips (Optional but Professional) ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="p-6 rounded-[2rem] border border-dashed border-white/10 flex gap-4">
          <Layers className="size-6 text-slate-500 shrink-0" />
          <div>
            <h5 className="text-sm font-bold text-slate-300">Smart Batching</h5>
            <p className="text-xs text-slate-500 mt-1">Upload up to 10 images at once for bulk background removal and resizing.</p>
          </div>
        </div>
        <div className="p-6 rounded-[2rem] border border-dashed border-white/10 flex gap-4">
          <Sparkles className="size-6 text-slate-500 shrink-0" />
          <div>
            <h5 className="text-sm font-bold text-slate-300">Custom Prompts</h5>
            <p className="text-xs text-slate-500 mt-1">Coming soon: Describe the environment you want your product to be in.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}