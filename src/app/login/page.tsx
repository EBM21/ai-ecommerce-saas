"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { toast } from 'sonner'
import {
  Loader2, ArrowRight, Sparkles, Zap, BarChart3,
  Package, ChevronRight, CheckCircle2, Eye, EyeOff
} from 'lucide-react'
import { login, signup } from './actions'

// ─── Live ticker data shown on right panel ───────────────────────────────────
const TICKER_ITEMS = [
  { store: 'UrbanThreads', event: 'AI image generated', time: '2s ago', dot: '#22c55e' },
  { store: 'NovaSkin Co.', event: 'Copy rewritten', time: '8s ago', dot: '#a78bfa' },
  { store: 'LuxeWear', event: 'SEO optimized', time: '14s ago', dot: '#38bdf8' },
  { store: 'Marblecraft', event: 'Pricing suggested', time: '21s ago', dot: '#fb923c' },
  { store: 'SoleMate', event: 'Inventory synced', time: '35s ago', dot: '#22c55e' },
  { store: 'GlassHaus', event: 'Ad copy drafted', time: '47s ago', dot: '#a78bfa' },
]

const FEATURES = [
  { icon: Sparkles, label: 'AI Copywriting', desc: 'Generate listings in seconds' },
  { icon: BarChart3, label: 'Revenue Intelligence', desc: 'Predictive sales analytics' },
  { icon: Package, label: 'Inventory AI', desc: 'Smart restocking alerts' },
  { icon: Zap, label: 'Instant Storefront', desc: 'Launch in under 5 minutes' },
]

// ─── Animated noise/grain overlay as SVG data URI ───────────────────────────
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationPending, setVerificationPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)
  const [tickerIdx, setTickerIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Rotate feature pill every 2.5s
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(i => (i + 1) % FEATURES.length), 2500)
    return () => clearInterval(t)
  }, [])

  // Rotate ticker every 3s
  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_ITEMS.length), 3000)
    return () => clearInterval(t)
  }, [])

  // Minimal star-field canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random(),
    }))
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.a += 0.003 * (Math.random() > 0.5 ? 1 : -1)
        s.a = Math.max(0.1, Math.min(0.8, s.a))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.a})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setIsLoading(true)
    try {
      if (isLogin) {
        const result = await login({ email, password })
        if (!result.success) toast.error(result.error || 'Failed to sign in')
        else { toast.success('Welcome back!'); window.location.href = '/' }
      } else {
        const result = await signup({ email, password })
        if (!result.success) toast.error(result.error || 'Failed to create account')
        else {
          toast.success(result.message || 'Account created!')
          if (result.message?.includes('Check your email')) setVerificationPending(true)
          else window.location.href = '/'
        }
      }
    } catch { toast.error('An unexpected error occurred') }
    finally { setIsLoading(false) }
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: '#080810', fontFamily: "'Inter var', 'Inter', sans-serif" }}
    >
      {/* ══════════════════════════════════════════════════════════════════
          LEFT — Form panel
      ══════════════════════════════════════════════════════════════════ */}
      <div className="relative flex flex-col flex-1 min-h-screen z-10">

        {/* Subtle left-panel vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 0% 50%, rgba(99,102,241,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-10 pt-9 pb-0">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div
              className="size-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 0 24px rgba(99,102,241,0.45)',
              }}
            >
              <Sparkles className="size-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-white font-semibold text-[17px] tracking-tight">Quadlix</span>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full ml-1"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              AI Commerce
            </span>
          </div>

          {/* Toggle link */}
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-[13px] transition-colors"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            {isLogin ? 'New here?' : 'Have an account?'}
            <span style={{ color: '#818cf8', fontWeight: 500 }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </span>
            <ChevronRight className="size-3.5" style={{ color: '#818cf8' }} />
          </button>
        </div>

        {/* Main form area */}
        <div className="relative flex-1 flex items-center justify-center px-8 md:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px]"
          >
            <AnimatePresence mode="wait">
              {verificationPending ? (
                /* ── Email sent state ── */
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="text-center space-y-7"
                >
                  <div
                    className="size-20 mx-auto rounded-3xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    <CheckCircle2 className="size-9" style={{ color: '#818cf8' }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Check your inbox</h2>
                    <p className="text-[15px] leading-relaxed" style={{ color: '#6b7280' }}>
                      We sent a link to{' '}
                      <span style={{ color: '#a5b4fc', fontWeight: 500 }}>{email}</span>.
                      <br />Click it to activate your store.
                    </p>
                  </div>
                  <PremiumButton
                    onClick={() => { setVerificationPending(false); setIsLogin(true) }}
                    variant="ghost"
                  >
                    Back to sign in
                  </PremiumButton>
                </motion.div>
              ) : (
                /* ── Auth form ── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-8"
                >
                  {/* Heading */}
                  <div className="space-y-2">
                    <motion.div
                      key={isLogin ? 'login-label' : 'signup-label'}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 mb-3"
                    >
                      <span
                        className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                        style={{ color: '#6366f1' }}
                      >
                        {isLogin ? 'Welcome back' : 'Get started free'}
                      </span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.2)' }} />
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={isLogin ? 'h-login' : 'h-signup'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="text-[38px] font-bold tracking-tight leading-[1.1]"
                        style={{ color: '#f9fafb' }}
                      >
                        {isLogin ? (
                          <>Sign in to<br /><span style={{ color: '#818cf8' }}>your store</span></>
                        ) : (
                          <>Launch your<br /><span style={{ color: '#818cf8' }}>AI storefront</span></>
                        )}
                      </motion.h1>
                    </AnimatePresence>
                    <p className="text-[14px] mt-2" style={{ color: '#4b5563' }}>
                      {isLogin
                        ? 'Enter your credentials to continue to the dashboard.'
                        : 'Join 9,200+ merchants scaling with AI-powered commerce.'}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email field */}
                    <PremiumField
                      id="email" label="Email address" type="email"
                      value={email} onChange={setEmail}
                      disabled={isLoading} placeholder="you@brand.com"
                    />

                    {/* Password field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="password"
                          className="text-[12px] font-medium tracking-wide"
                          style={{ color: '#6b7280' }}
                        >
                          PASSWORD
                        </label>
                        {isLogin && (
                          <a
                            href="#"
                            className="text-[12px] font-medium transition-colors"
                            style={{ color: '#6366f1' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#6366f1')}
                          >
                            Forgot password?
                          </a>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          disabled={isLoading}
                          placeholder="••••••••••••"
                          required
                          className="w-full h-12 rounded-xl px-4 pr-12 text-[14px] outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#f9fafb',
                            caretColor: '#818cf8',
                          }}
                          onFocus={e => {
                            e.target.style.border = '1px solid rgba(99,102,241,0.6)'
                            e.target.style.background = 'rgba(99,102,241,0.05)'
                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'
                          }}
                          onBlur={e => {
                            e.target.style.border = '1px solid rgba(255,255,255,0.08)'
                            e.target.style.background = 'rgba(255,255,255,0.04)'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: '#4b5563' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                        >
                          {showPassword
                            ? <EyeOff className="size-4" />
                            : <Eye className="size-4" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full h-12 rounded-xl font-semibold text-[15px] text-white overflow-hidden flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          boxShadow: '0 0 32px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                      >
                        {/* Shine sweep */}
                        <span
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
                            backgroundSize: '200% 100%',
                            animation: 'shine 3s infinite',
                          }}
                        />
                        {isLoading
                          ? <Loader2 className="size-5 animate-spin" />
                          : (
                            <>
                              {isLogin ? 'Continue to dashboard' : 'Create my store'}
                              <ArrowRight className="size-4" strokeWidth={2.5} />
                            </>
                          )
                        }
                      </motion.button>
                    </div>

                    {/* Social proof row (signup only) */}
                    <AnimatePresence>
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 pt-1"
                        >
                          <div className="flex -space-x-2">
                            {['?u=1', '?u=2', '?u=3'].map((u, i) => (
                              <img
                                key={i}
                                src={`https://i.pravatar.cc/32${u}`}
                                className="size-7 rounded-full ring-2"
                                style={{ ringColor: '#080810' }}
                                alt=""
                              />
                            ))}
                          </div>
                          <p className="text-[12px]" style={{ color: '#4b5563' }}>
                            <span style={{ color: '#9ca3af', fontWeight: 500 }}>9,200+ merchants</span> already on Quadlix
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Terms */}
                    <p className="text-[11px] text-center" style={{ color: '#374151' }}>
                      By continuing, you agree to our{' '}
                      <a href="#" style={{ color: '#4b5563', textDecoration: 'underline' }}>Terms</a>
                      {' '}and{' '}
                      <a href="#" style={{ color: '#4b5563', textDecoration: 'underline' }}>Privacy Policy</a>.
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom security badge */}
        <div className="relative flex items-center justify-center gap-6 px-10 pb-8">
          {['SOC 2 Type II', 'GDPR', 'AES-256'].map(badge => (
            <div key={badge} className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-[11px]" style={{ color: '#374151' }}>{badge}</span>
            </div>
          ))}
        </div>

        {/* Shine keyframe */}
        <style>{`
          @keyframes shine {
            0%   { background-position: -200% 0 }
            100% { background-position: 200% 0  }
          }
          input::placeholder { color: #374151 }
        `}</style>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT — Visual panel (hidden on mobile)
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-1 relative flex-col overflow-hidden"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.04)' }}
      >
        {/* Star canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.5 }}
        />

        {/* Ambient glows */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-10%', right: '-10%',
            width: 600, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '0%', left: '10%',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: NOISE }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col h-full p-10 gap-6">

          {/* TOP: Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex gap-2 flex-wrap"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                animate={{
                  background: i === activeFeature
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  borderColor: i === activeFeature
                    ? 'rgba(99,102,241,0.5)'
                    : 'rgba(255,255,255,0.06)',
                }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <f.icon
                  className="size-3.5"
                  style={{ color: i === activeFeature ? '#818cf8' : '#4b5563' }}
                  strokeWidth={2}
                />
                <span
                  className="text-[12px] font-medium"
                  style={{ color: i === activeFeature ? '#c7d2fe' : '#4b5563' }}
                >
                  {f.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CENTER: Main hero content */}
          <div className="flex-1 flex flex-col justify-center gap-8">

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-green-400 tracking-wide">
                  AI models running live
                </span>
              </div>

              <h2
                className="text-[44px] font-bold leading-[1.08] tracking-tight"
                style={{ color: '#f9fafb' }}
              >
                Your entire store,<br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #818cf8 0%, #c4b5fd 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  run by AI.
                </span>
              </h2>

              <p className="text-[15px] leading-relaxed max-w-[380px]" style={{ color: '#4b5563' }}>
                Quadlix uses frontier AI to write your product copy, generate imagery,
                forecast inventory, and optimize pricing — automatically.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { val: '$2.4M+', lbl: 'Revenue tracked' },
                { val: '184K', lbl: 'Orders processed' },
                { val: '9,200', lbl: 'Active merchants' },
              ].map(s => (
                <div
                  key={s.lbl}
                  className="rounded-2xl p-4 flex flex-col gap-1"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    className="text-[26px] font-bold tracking-tight"
                    style={{ color: '#f9fafb' }}
                  >
                    {s.val}
                  </span>
                  <span className="text-[12px]" style={{ color: '#4b5563' }}>{s.lbl}</span>
                </div>
              ))}
            </motion.div>

            {/* Live activity ticker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#6b7280' }}>
                  LIVE ACTIVITY
                </span>
              </div>
              <div className="overflow-hidden" style={{ height: 60 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tickerIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-center gap-3 px-4 h-full"
                  >
                    <div
                      className="size-2 rounded-full flex-shrink-0"
                      style={{ background: TICKER_ITEMS[tickerIdx].dot }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-white truncate">
                        {TICKER_ITEMS[tickerIdx].store}
                      </p>
                      <p className="text-[12px] truncate" style={{ color: '#4b5563' }}>
                        {TICKER_ITEMS[tickerIdx].event}
                      </p>
                    </div>
                    <span className="text-[11px] flex-shrink-0" style={{ color: '#374151' }}>
                      {TICKER_ITEMS[tickerIdx].time}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM: Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="size-3.5" viewBox="0 0 20 20" fill="#f59e0b">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-[15px] leading-relaxed mb-5" style={{ color: '#9ca3af' }}>
              "We replaced three SaaS tools with Quadlix. The AI writes better copy than our team,
              our revenue is up 34%, and setup took less than a day."
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Sarah Jenkins"
                className="size-10 rounded-full object-cover"
                style={{ border: '2px solid rgba(99,102,241,0.3)' }}
              />
              <div>
                <p className="text-[13px] font-semibold text-white">Sarah Jenkins</p>
                <p className="text-[12px]" style={{ color: '#4b5563' }}>Founder, Minimalist Wear · 3× YoY growth</p>
              </div>
              <div
                className="ml-auto px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#4ade80',
                }}
              >
                Verified customer
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared sub-components ───────────────────────────────────────────────────
function PremiumField({
  id, label, type = 'text', value, onChange, disabled, placeholder,
}: {
  id: string; label: string; type?: string; value: string
  onChange: (v: string) => void; disabled: boolean; placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[12px] font-medium tracking-wide block"
        style={{ color: '#6b7280' }}
      >
        {label.toUpperCase()}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        required
        className="w-full h-12 rounded-xl px-4 text-[14px] outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f9fafb',
          caretColor: '#818cf8',
        }}
        onFocus={e => {
          e.target.style.border = '1px solid rgba(99,102,241,0.6)'
          e.target.style.background = 'rgba(99,102,241,0.05)'
          e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'
        }}
        onBlur={e => {
          e.target.style.border = '1px solid rgba(255,255,255,0.08)'
          e.target.style.background = 'rgba(255,255,255,0.04)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}

function PremiumButton({
  children, onClick, variant = 'primary',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full h-12 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all"
      style={
        variant === 'primary'
          ? {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            boxShadow: '0 0 32px rgba(99,102,241,0.4)',
          }
          : {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#9ca3af',
          }
      }
    >
      {children}
    </motion.button>
  )
}