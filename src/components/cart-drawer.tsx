"use client"

import { useCart } from "@/lib/cart-context"
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ThemeConfig } from "@/types/theme-types"

export function CartDrawer({ domain, theme, baseUrl = "" }: { domain: string, theme?: Partial<ThemeConfig>, baseUrl?: string }) {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart()

    const primaryColor = theme?.branding?.primaryColor || "#6366f1"
    const bgColor = theme?.styles?.bgColor || "#ffffff"
    const textColor = theme?.styles?.textColor || "#000000"
    const borderColor = theme?.styles?.borderColor || "rgba(0,0,0,0.1)"
    const cardBg = theme?.styles?.cardBg || "#f9fafb"

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md z-[999] shadow-2xl flex flex-col"
                        style={{ backgroundColor: bgColor, color: textColor, borderLeft: `1px solid ${borderColor}` }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor }}>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingBag className="size-5" /> Your Cart
                            </h2>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer text-current"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                                    <ShoppingBag className="size-16" />
                                    <p className="text-lg font-medium">Your cart is empty</p>
                                    <button 
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 px-6 py-2 rounded-full font-semibold border-none cursor-pointer"
                                        style={{ backgroundColor: primaryColor, color: "#fff" }}
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                                        <div className="size-20 shrink-0 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                                                    {item.variantName && (
                                                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-wider mt-0.5">
                                                            {item.variantName}
                                                        </p>
                                                    )}
                                                </div>
                                                <button onClick={() => removeFromCart(item.id, item.variantId)} className="p-1 opacity-50 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer text-current">
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId)} className="p-1 hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer text-current">
                                                        <Minus className="size-3" />
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId)} className="p-1 hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer text-current">
                                                        <Plus className="size-3" />
                                                    </button>
                                                </div>
                                                <span className="font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t" style={{ borderColor, backgroundColor: cardBg }}>
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-sm font-semibold opacity-70">Subtotal</span>
                                    <span className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</span>
                                </div>
                                <p className="text-xs opacity-50 mb-6 text-center">Shipping & taxes calculated at checkout.</p>
                                <Link 
                                    href={`${baseUrl}/checkout`}
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity no-underline"
                                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                                >
                                    Proceed to Checkout <ArrowRight className="size-5" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
