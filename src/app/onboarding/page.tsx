"use client"
// src/app/(dashboard)/onboarding/page.tsx

import { useState } from "react"
import { Sparkles, Check, ChevronRight, Loader2 } from "lucide-react"
import { createStore } from "./actions"

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

  // ✅ FIXED — actually calls createStore
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
      // ✅ createStore server action handles redirect — no router.push needed
    } catch (err: any) {
      console.error("Launch error:", err)
      setError(err.message || "Store creation failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-5 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-violet-500/6 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[480px] bg-[#0e0e1a] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">

        {/* Top */}
        <div className="p-7 pb-0">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
              flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">Quadlix</span>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-0 mb-7">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={`size-7 rounded-full flex items-center justify-center
                    text-[11px] font-bold transition-all duration-300
                    ${i < step
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40"
                      : i === step
                        ? "border-2 border-indigo-500 text-indigo-400 bg-indigo-500/10"
                        : "border-2 border-white/10 text-white/20 bg-white/[0.02]"
                    }`}>
                    {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap
                    ${i === step ? "text-white/60" : "text-white/20"}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-4 transition-all duration-500
                    ${i < step ? "bg-indigo-500/60" : "bg-white/[0.06]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-7 mb-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20
            text-[13px] text-rose-300 font-medium">
            ⚠ {error}
          </div>
        )}

        {/* Body */}
        <div className="px-7 pb-2">

          {/* Step 0 — Store Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[20px] font-bold text-white tracking-tight mb-1">Set up your store</h2>
                <p className="text-[13px] text-white/40">Tell us about your business to get started.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">
                    Store Name
                  </label>
                  <input
                    value={storeName}
                    onChange={e => {
                      setStoreName(e.target.value)
                      setStoreUrl(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                    }}
                    placeholder="My Awesome Store"
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl
                      px-4 text-[13.5px] text-white placeholder:text-white/20
                      outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.04]
                      focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">
                    Store URL
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] text-white/25 select-none">
                      quadlix.com/
                    </span>
                    <input
                      value={storeUrl}
                      onChange={e => setStoreUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="my-store"
                      className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl
                        pl-28 pr-4 text-[13.5px] text-white placeholder:text-white/20
                        outline-none focus:border-indigo-500/60 focus:bg-indigo-500/[0.04]
                        focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl
                      px-4 text-[13.5px] text-white outline-none
                      focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10
                      transition-all appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.value} value={c.value} className="bg-[#1a1a2e] text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Categories */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[20px] font-bold text-white tracking-tight mb-1">What do you sell?</h2>
                <p className="text-[13px] text-white/40">Select your categories. You can add more later.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-[12.5px] font-medium
                      transition-all border
                      ${categories.includes(cat)
                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                        : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/[0.12]"
                      }`}
                  >
                    {categories.includes(cat) && (
                      <Check className="inline size-3 mr-1.5 text-indigo-400" strokeWidth={3} />
                    )}
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Theme */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[20px] font-bold text-white tracking-tight mb-1">Choose a theme</h2>
                <p className="text-[13px] text-white/40">Pick your storefront style. Customizable anytime.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`rounded-xl overflow-hidden border-2 transition-all
                      ${theme === t.id
                        ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                        : "border-white/[0.07] hover:border-white/[0.15]"
                      }`}
                  >
                    <div className="h-16 flex items-end gap-1.5 p-3" style={{ background: t.bg }}>
                      <div className="flex-1 h-5 rounded-sm opacity-60" style={{ background: t.text }} />
                      <div className="flex-1 h-8 rounded-sm" style={{ background: t.accent }} />
                      <div className="flex-1 h-3 rounded-sm opacity-40" style={{ background: t.text }} />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-t border-white/[0.06]">
                      <span className="text-[11.5px] font-semibold text-white/60">{t.label}</span>
                      {theme === t.id && (
                        <div className="size-4 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="size-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Launch */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-4 gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-500/20
                to-violet-500/10 border border-indigo-500/20
                flex items-center justify-center text-3xl">
                🚀
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-white tracking-tight mb-2">You're all set!</h2>
                <p className="text-[13px] text-white/40 leading-relaxed max-w-sm">
                  Your store{" "}
                  <span className="text-white font-semibold">{storeName || "Quadlix Store"}</span>{" "}
                  is ready to launch.
                </p>
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.slice(0, 4).map(c => (
                    <span key={c}
                      className="px-3 py-1 rounded-full text-[11.5px] font-medium
                        bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-7 pt-5">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-white/[0.04] border border-white/[0.07] text-white/50
                hover:text-white/70 hover:border-white/[0.12]
                disabled:opacity-40 transition-all"
            >
              ← Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => { setError(""); setStep(s => s + 1) }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-gradient-to-r from-indigo-500 to-violet-600
                text-white text-[13.5px] font-semibold
                shadow-lg shadow-indigo-500/30
                hover:shadow-indigo-500/50 hover:-translate-y-px transition-all"
            >
              Continue <ChevronRight className="size-4" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-gradient-to-r from-indigo-500 to-violet-600
                text-white text-[13.5px] font-semibold
                shadow-lg shadow-indigo-500/30
                hover:shadow-indigo-500/50 hover:-translate-y-px
                disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed
                transition-all"
            >
              {loading
                ? <><Loader2 className="size-4 animate-spin" /> Creating your store...</>
                : <>Launch My Store 🚀</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}