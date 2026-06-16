"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { storefrontLogin, storefrontSignup } from "./actions"
import { Loader2, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function StorefrontLoginPage({ params, storeId, theme }: { params: any, storeId: string, theme: any }) {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const domain = params.domain
    const primaryColor = theme?.branding?.primaryColor || "#6366f1"
    const bgColor = theme?.styles?.bgColor || "#ffffff"
    const textColor = theme?.styles?.textColor || "#000000"
    const cardBg = theme?.styles?.cardBg || "#f9fafb"
    const borderColor = theme?.styles?.borderColor || "rgba(0,0,0,0.1)"

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const res: any = isLogin 
            ? await storefrontLogin(formData, domain, storeId)
            : await storefrontSignup(formData, domain, storeId)

        if (res?.error) {
            setMessage({ type: 'error', text: res.error })
            setIsLoading(false)
        } else if (res?.success) {
            setMessage({ type: 'success', text: res.message! })
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[80vh]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div 
                    className="p-8 md:p-10 rounded-[2.5rem] shadow-2xl border transition-all"
                    style={{ backgroundColor: cardBg, borderColor }}
                >
                    <div className="text-center mb-10">
                        <div 
                            className="size-14 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                            style={{ background: primaryColor }}
                        >
                            <User className="size-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h1>
                        <p className="text-sm opacity-60 font-medium">
                            {isLogin ? `Sign in to your ${theme?.branding?.storeName} account.` : "Join our community and track your orders."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 opacity-30" />
                                    <input 
                                        name="name" required type="text" placeholder="John Doe"
                                        className="w-full h-12 pl-11 pr-4 rounded-xl outline-none border focus:ring-4 transition-all text-sm font-medium"
                                        style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 opacity-30" />
                                <input 
                                    name="email" required type="email" placeholder="name@example.com"
                                    className="w-full h-12 pl-11 pr-4 rounded-xl outline-none border focus:ring-4 transition-all text-sm font-medium"
                                    style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 opacity-30" />
                                <input 
                                    name="password" required type="password" placeholder="••••••••"
                                    className="w-full h-12 pl-11 pr-4 rounded-xl outline-none border focus:ring-4 transition-all text-sm font-medium"
                                    style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                                />
                            </div>
                        </div>

                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-4 rounded-xl text-xs font-bold text-center ${
                                    message.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                }`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        <button 
                            disabled={isLoading}
                            className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                            style={{ backgroundColor: primaryColor, color: "#fff" }}
                        >
                            {isLoading ? <Loader2 className="size-5 animate-spin" /> : (
                                <>{isLogin ? "Sign In" : "Register"} <ArrowRight className="size-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t text-center" style={{ borderColor }}>
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest"
                        >
                            {isLogin ? "New customer? Create an account" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter">
                        <ShieldCheck className="size-3" /> Secure SSL
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter">
                        <Sparkles className="size-3" /> AI Protected
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
