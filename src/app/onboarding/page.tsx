"use client"

import { useState } from "react"
import { Sparkles, Check, ChevronRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createStore } from "./actions"
import { ThemeToggle } from "@/components/theme-toggle"

const STEPS = ["Store Info", "Products", "Theme", "Launch"]

const CATEGORIES = [
  "Fashion & Apparel", "Electronics", "Home & Living",
  "Beauty & Health", "Sports & Outdoor", "Food & Beverages",
  "Books & Media", "Other",
]

const THEMES = [
  { id: "dark-minimal", label: "Dark Minimal", bg: "#0a0a0f", accent: "#6f5aff", text: "#f0f0f8" },
  { id: "light-clean", label: "Light Clean", bg: "#ffffff", accent: "#3b82f6", text: "#111827" },
  { id: "warm-earthy", label: "Warm Earthy", bg: "#faf8f3", accent: "#d97706", text: "#1c1917" },
  { id: "neon-bold", label: "Neon Bold", bg: "#0f0f1a", accent: "#00e5a0", text: "#ff5a8a" },
]

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "PKR", label: "PKR — Pakistani Rupee" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "AED", label: "AED — UAE Dirham" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [storeName, setStoreName] = useState("")
  const [storeUrl, setStoreUrl] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [categories, setCategories] = useState<string[]>([])
  const [theme, setTheme] = useState("dark-minimal")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleCat = (c: string) =>
    setCategories(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])

  const handleLaunch = async () => {
    if (!storeName.trim()) {
      setError("Store name is required")
      setStep(0)
      return
    }
    if (!storeUrl.trim()) {
      setError("Store URL is required")
      setStep(0)
      return
    }

    setLoading(true)
    setError("")

    try {
      await createStore({
        name: storeName.trim(),
        subdomain: storeUrl.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        themeConfig: { theme, currency, categories },
      })
    } catch (err) {
      console.error("Launch error:", err)
      const errMsg = err instanceof Error ? err.message : "Store creation failed. Please try again."
      setError(errMsg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 relative overflow-hidden selection:bg-indigo-500/20">
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Premium background ambient glows */}
      <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/4 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-violet-500/6 dark:bg-violet-500/3 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative w-full max-w-[480px] bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/[0.02]"
      >
        {/* Top Header */}
        <div className="p-7 pb-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-foreground tracking-tight select-none">Quadlix</span>
          </div>

          {/* Steps Navigation Bar */}
          <div className="flex items-center gap-0 mb-7">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
                  <div className={`size-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                    i < step
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : i === step
                        ? "border-2 border-indigo-500 text-indigo-500 dark:text-indigo-400 bg-indigo-500/10"
                        : "border-2 border-border text-muted-foreground/30 bg-secondary/30"
                  }`}>
                    {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium transition-colors duration-300 ${
                    i === step ? "text-foreground font-semibold" : "text-muted-foreground/40"
                  }`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 mb-4 overflow-hidden bg-border relative">
                    <motion.div 
                      initial={{ left: "-100%" }}
                      animate={{ left: i < step ? "0%" : "-100%" }}
                      transition={{ duration: 0.35 }}
                      className="absolute inset-0 bg-indigo-500" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-7 mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[13px] text-rose-600 dark:text-rose-400 font-medium"
            >
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Body Container with height constraint and transition */}
        <div className="px-7 pb-2 min-h-[300px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* Step 0 — Store Info */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 w-full"
              >
                <div>
                  <h2 className="text-[20px] font-bold text-foreground tracking-tight mb-1">Set up your store</h2>
                  <p className="text-[13px] text-muted-foreground">Tell us about your business to get started.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                      Store Name
                    </label>
                    <input
                      value={storeName}
                      onChange={e => {
                        setStoreName(e.target.value)
                        setStoreUrl(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                      }}
                      placeholder="My Awesome Store"
                      className="w-full h-11 bg-secondary/40 border border-border rounded-xl px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.02] focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                      Store URL
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13.5px] text-muted-foreground/35 select-none font-medium">
                        quadlix.com/
                      </span>
                      <input
                        value={storeUrl}
                        onChange={e => setStoreUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="my-store"
                        className="w-full h-11 bg-secondary/40 border border-border rounded-xl pl-[92px] pr-4 text-[13.5px] text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.02] focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full h-11 bg-secondary/40 border border-border rounded-xl px-4 text-[13.5px] text-foreground outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.value} value={c.value} className="bg-card text-foreground">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1 — Categories */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 w-full"
              >
                <div>
                  <h2 className="text-[20px] font-bold text-foreground tracking-tight mb-1">What do you sell?</h2>
                  <p className="text-[13px] text-muted-foreground">Select your categories. You can add more later.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => {
                    const isSelected = categories.includes(cat)
                    return (
                      <motion.button
                        key={cat}
                        whileHover={{ scale: 1.02, y: -0.5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCat(cat)}
                        className={`text-left px-4 py-3 rounded-xl text-[12.5px] font-semibold border transition-all duration-200 cursor-pointer flex items-center ${
                          isSelected
                            ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-300"
                            : "bg-secondary/20 border-border/80 text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        {isSelected && (
                          <Check className="size-3.5 mr-2 text-indigo-500 shrink-0" strokeWidth={3} />
                        )}
                        {cat}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Theme */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 w-full"
              >
                <div>
                  <h2 className="text-[20px] font-bold text-foreground tracking-tight mb-1">Choose a theme</h2>
                  <p className="text-[13px] text-muted-foreground">Pick your storefront style. Customizable anytime.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(t => {
                    const isSelected = theme === t.id
                    return (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTheme(t.id)}
                        className={`rounded-xl overflow-hidden border-2 text-left transition-all duration-200 w-full cursor-pointer relative ${
                          isSelected
                            ? "border-indigo-500 shadow-md shadow-indigo-500/10"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        <div className="h-14 flex items-end gap-1.5 p-2.5" style={{ background: t.bg }}>
                          <div className="flex-1 h-4 rounded-sm opacity-60" style={{ background: t.text }} />
                          <div className="flex-1 h-7 rounded-sm" style={{ background: t.accent }} />
                          <div className="flex-1 h-3 rounded-sm opacity-40" style={{ background: t.text }} />
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-secondary/40 border-t border-border">
                          <span className="text-[11px] font-bold text-muted-foreground/80">{t.label}</span>
                          {isSelected && (
                            <div className="size-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                              <Check className="size-2.5 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Launch */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center text-center py-4 gap-4 w-full"
              >
                <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl shadow-inner shadow-white/10 select-none animate-bounce">
                  🚀
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-foreground tracking-tight mb-2">You&apos;re all set!</h2>
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-sm">
                    Your store{" "}
                    <span className="text-foreground font-bold">{storeName || "Quadlix Store"}</span>{" "}
                    is ready to launch.
                  </p>
                </div>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                    {categories.slice(0, 4).map(c => (
                      <span 
                        key={c}
                        className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 border border-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center gap-3 p-7 pt-5">
          {step > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(s => s - 1)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-secondary/50 border border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 transition-all cursor-pointer"
            >
              Back
            </motion.button>
          )}

          {step < 3 ? (
            <motion.button
              whileHover={{ scale: 1.01, y: -0.5 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => { setError(""); setStep(s => s + 1) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[13px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all cursor-pointer"
            >
              Continue <ChevronRight className="size-4" strokeWidth={2.5} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01, y: loading ? 0 : -0.5 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              onClick={handleLaunch}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[13px] font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-white" />
                  Creating your store...
                </>
              ) : (
                <>Launch My Store 🚀</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}