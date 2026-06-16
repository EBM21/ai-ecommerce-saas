"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Image as ImageIcon, 
  Cpu, 
  Zap, 
  Star, 
  Check, 
  ArrowRight, 
  ChevronDown,
  BarChart3,
  ShoppingBag,
  Clock,
  Layout,
  Smartphone,
  ArrowUpRight
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const FEATURES = [
  {
    num: "01",
    title: "AI Copywriting Engine",
    desc: "Generate conversion-optimized product descriptions, ad copy, and SEO content in seconds. Trained on millions of top-performing listings.",
    tag: "Language Model",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Revenue Intelligence",
    desc: "Predictive analytics that surface what's selling, what's stalling, and exactly when to restock — before you need to ask.",
    tag: "Forecasting",
    icon: TrendingUp,
  },
  {
    num: "03",
    title: "Storefront Builder",
    desc: "Launch a fully branded storefront in under 5 minutes. Custom domains, themes, and checkout — zero code required.",
    tag: "No-Code",
    icon: Layers,
  },
  {
    num: "04",
    title: "AI Image Studio",
    desc: "Transform plain product photos into studio-quality imagery. Remove backgrounds, generate lifestyle shots, batch process hundreds at once.",
    tag: "Computer Vision",
    icon: ImageIcon,
  },
  {
    num: "05",
    title: "Inventory Autopilot",
    desc: "Smart reorder points, supplier alerts, and demand forecasting that keeps your shelves stocked without the spreadsheets.",
    tag: "Automation",
    icon: Cpu,
  },
  {
    num: "06",
    title: "Multi-Channel Sync",
    desc: "One dashboard for every platform. Sync products, orders, and inventory across Shopify, Amazon, Instagram, and more.",
    tag: "Integrations",
    icon: Zap,
  },
]

const STATS = [
  { value: "$2.4M+", label: "Revenue tracked monthly" },
  { value: "184K", label: "Orders processed" },
  { value: "9,200+", label: "Active merchants" },
  { value: "34%", label: "Average revenue lift" },
]

const TESTIMONIALS = [
  {
    quote: "We replaced three SaaS tools with Quadlix. The AI writes better copy than our team, and setup took less than a day.",
    name: "Sarah Jenkins",
    role: "Founder, Minimalist Wear",
    metric: "3× YoY growth",
    initials: "SJ",
  },
  {
    quote: "Revenue is up 41% since switching. The inventory forecasting alone paid for itself in the first week.",
    name: "Omar Khalid",
    role: "CEO, Urban Threads PK",
    metric: "$180K saved",
    initials: "OK",
  },
  {
    quote: "I launched my entire store in 4 minutes. The AI generated all 60 product descriptions while I had coffee.",
    name: "Priya Nair",
    role: "Solo founder, Luminos",
    metric: "Day 1 sales",
    initials: "PN",
  },
]

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    per: "/mo",
    desc: "Perfect for new merchants finding their footing.",
    features: ["Up to 100 products", "AI copywriting (50/mo)", "Basic analytics", "1 storefront", "Email support"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$79",
    per: "/mo",
    desc: "For serious merchants ready to scale with AI.",
    features: ["Unlimited products", "AI copywriting (∞)", "Revenue intelligence", "AI image studio", "Multi-channel sync", "Priority support"],
    cta: "Start free trial",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    desc: "White-glove setup for high-volume operations.",
    features: ["Everything in Pro", "Dedicated AI training", "Custom integrations", "SLA guarantee", "Dedicated CSM"],
    cta: "Talk to sales",
    highlight: false,
  },
]

export default function LandingPage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mouseX, mouseY])

  const springX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 100, damping: 15 } 
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-indigo-500/30">
      {/* Dynamic Cursor Glow (Framer Motion Performance Optimized) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 opacity-40 dark:opacity-30 transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(500px circle at ${springX}px ${springY}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
        }}
      />

      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.556_0_0/5%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.556_0_0/5%)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* ── NAV BAR ── */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight">
              Quad<span className="text-indigo-500">lix</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {["features", "testimonials", "pricing"].map((item) => (
              <li key={item}>
                <a 
                  href={`#${item}`} 
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground capitalize transition-colors duration-150"
                >
                  {item}
                </a>
              </li>
            ))}
            <li>
              <a 
                href="#" 
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                Docs
              </a>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/login" 
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border/60 hover:bg-secondary/40 rounded-xl transition-all duration-200"
            >
              Sign in
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-50 border border-indigo-500/20 hover:border-indigo-400/30 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Get started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[350px] md:h-[500px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/4 blur-[100px] md:blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[400px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/3 blur-[90px] md:blur-[120px] pointer-events-none" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center"
        >
          {/* Live Status Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-secondary/50 backdrop-blur-sm text-xs font-medium text-indigo-600 dark:text-indigo-400 shadow-sm mb-8"
          >
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-cyan-500"></span>
            </span>
            Live: AI-powered commerce platform for Pakistan & beyond
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="font-sans text-5xl md:text-8xl font-extrabold tracking-tight leading-[1.03] text-foreground max-w-4xl"
          >
            Your entire store,<br />
            run by <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">artificial</span><br />
            <span className="text-muted-foreground/50">intelligence.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg text-muted-foreground max-w-xl mt-6 leading-relaxed"
          >
            Quadlix gives every merchant the unfair advantage of AI —
            from product copy to revenue forecasting, automated and always-on.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-50 border border-indigo-500/20 hover:border-indigo-400/30 rounded-2xl shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              Launch your store free
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-foreground border border-border/80 bg-secondary/35 hover:bg-secondary/60 rounded-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              See how it works
              <ChevronDown className="size-4 text-muted-foreground" />
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-12"
          >
            <div className="flex -space-x-2.5">
              {["S", "O", "P", "F", "B"].map((l, i) => (
                <div 
                  key={i} 
                  className="size-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, hsl(${210 + i * 15},70%,45%), hsl(${230 + i * 12},80%,38%))`,
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">9,200+ merchants</span> already scaling with Quadlix
            </p>
          </motion.div>

          {/* Star Review */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 mt-4"
          >
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3 fill-cyan-500 text-cyan-500" />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground/80">
              4.9/5 from 800+ reviews · No credit card required
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-border/40 bg-secondary/15 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {STATS.map((s, i) => (
            <div key={i} className="py-8 px-6 text-center hover:bg-secondary/10 transition-colors duration-150">
              <div className="font-sans text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl border border-border/80 bg-card shadow-2xl shadow-indigo-500/[0.02] overflow-hidden"
        >
          {/* Top mock window bar */}
          <div className="h-11 bg-secondary/45 border-b border-border/40 flex items-center px-4 gap-2">
            <div className="size-2.5 rounded-full bg-rose-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
            <div className="flex-1 max-w-md mx-auto h-6 bg-background border border-border/40 rounded-lg flex items-center justify-center text-[10px] font-mono text-muted-foreground select-none">
              app.quadlix.com/dashboard
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[350px] bg-background">
            {/* Sidebar Mock */}
            <div className="hidden md:block bg-secondary/15 border-r border-border/40 p-4">
              <div className="font-bold text-xs text-foreground/80 mb-6 px-2">Store Manager</div>
              <div className="space-y-1">
                {[
                  { name: "Dashboard", active: true },
                  { name: "Products" },
                  { name: "Orders" },
                  { name: "Analytics" },
                  { name: "AI Studio" },
                  { name: "Settings" }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold select-none cursor-default ${
                      item.active 
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                  >
                    <div className={`size-1.5 rounded-full ${item.active ? "bg-indigo-500" : "bg-muted-foreground/30"}`} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Mock */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Cards row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Revenue", val: "$12,840" },
                  { label: "Orders", val: "348" },
                  { label: "Conversion", val: "3.4%" },
                  { label: "AI Saves", val: "42h" },
                ].map((c, i) => (
                  <div key={i} className="bg-secondary/20 border border-border/40 rounded-2xl p-4">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {c.label}
                    </div>
                    <div className="text-xl font-extrabold text-foreground mt-1.5 tracking-tight">
                      {c.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Mock */}
              <div className="flex flex-col gap-4 flex-1">
                <div className="text-xs font-bold text-muted-foreground select-none">Weekly Sales Performance</div>
                <div className="flex items-end gap-1.5 md:gap-2.5 h-36 md:h-48 border-b border-l border-border/40 p-2 relative">
                  {[30, 45, 38, 60, 52, 70, 58, 80, 65, 90, 75, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.04, type: "spring" as const, stiffness: 100, damping: 15 }}
                      className={`flex-1 rounded-t-lg relative group transition-colors duration-200 ${
                        h > 65 
                          ? "bg-gradient-to-t from-indigo-500 to-cyan-500 dark:from-indigo-600 dark:to-cyan-400 shadow-md shadow-indigo-500/10" 
                          : "bg-indigo-500/20 hover:bg-indigo-500/35"
                      }`}
                    >
                      {/* Tooltip on hover bar */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Level: {h}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-border/40">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-indigo-500 font-bold">capabilities</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3 max-w-lg">
            Everything you need to sell <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">smarter</span>
          </h2>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-card border border-border/70 hover:border-indigo-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-500/[0.02] transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground/40">{f.num}</span>
                    <div className="size-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="size-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-5 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1 rounded-lg">
                    {f.tag}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="py-24 border-y border-border/40 bg-secondary/15 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-indigo-500 font-bold">merchant stories</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">
              Real results, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">real merchants</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/[0.01] transition-all relative overflow-hidden"
              >
                {/* Big decorative quotes sign */}
                <span className="absolute top-1 right-5 text-[80px] font-serif font-black text-indigo-500/5 select-none pointer-events-none">“</span>
                
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3 fill-cyan-500 text-cyan-500" />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed italic select-none">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border/40">
                  <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 font-sans">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{t.role}</div>
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-wide font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded">
                    {t.metric}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-indigo-500 font-bold">pricing</p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-3">
            Simple pricing, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">no surprises</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 relative ${
                plan.highlight 
                  ? "border-indigo-500 bg-indigo-500/[0.02] shadow-xl shadow-indigo-500/[0.03] scale-100 md:scale-105 z-10" 
                  : "border-border/80 bg-card shadow-sm hover:border-border"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 border border-indigo-400/30 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                  {plan.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{plan.desc}</p>
                
                <div className="flex items-baseline gap-1 mt-5 pb-5 border-b border-border/40">
                  <span className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{plan.price}</span>
                  {plan.per && <span className="text-xs text-muted-foreground">{plan.per}</span>}
                </div>

                <ul className="space-y-3 mt-6">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <div className="size-4 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
                        <Check className="size-2.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/login"
                  className={`block w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/15"
                      : "bg-secondary/60 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA HERO BOX ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-border/80 bg-card p-8 md:p-14 text-center relative overflow-hidden shadow-xl"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-indigo-500/8 dark:bg-indigo-500/4 blur-[60px]" />

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-lg mx-auto">
            Ready to build your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">empire?</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-4 max-w-sm mx-auto leading-relaxed">
            Join thousands of merchants who've handed the heavy lifting to AI.
            Your first 14 days are completely free.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-50 border border-indigo-500/20 hover:border-indigo-400/30 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200"
            >
              Start building free
              <ArrowRight className="size-3.5" />
            </Link>
            <a 
              href="#pricing" 
              className="px-5 py-3 text-xs font-semibold text-foreground border border-border/80 bg-secondary/35 hover:bg-secondary/60 rounded-xl transition-all duration-200"
            >
              View pricing
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-semibold text-muted-foreground/60 mt-8">
            <span className="flex items-center gap-1"><Check className="size-3 text-cyan-500" /> No credit card</span>
            <span className="flex items-center gap-1"><Check className="size-3 text-cyan-500" /> Cancel anytime</span>
            <span className="flex items-center gap-1"><Check className="size-3 text-cyan-500" /> 14-day free trial</span>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 bg-secondary/15 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-sans font-bold text-sm tracking-tight text-muted-foreground">
            Quad<span className="text-indigo-500">lix</span>
          </div>
          
          <div className="flex gap-6">
            {["Privacy", "Terms", "Docs", "Status", "Contact"].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="text-[10px] text-muted-foreground/40 font-mono">
            © 2026 Quadlix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}