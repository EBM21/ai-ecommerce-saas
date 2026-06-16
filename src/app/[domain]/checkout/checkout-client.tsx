"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react"
import { placeOrder } from "./action"

export default function CheckoutClient({ storeId, domain, theme, user, baseUrl }: { storeId: string, domain: string, theme: any, user?: any, baseUrl: string }) {
    const { items, cartTotal, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const primaryColor = theme?.branding?.primaryColor || "#6366f1"
    const bgColor = theme?.styles?.bgColor || "#ffffff"
    const textColor = theme?.styles?.textColor || "#000000"
    const borderColor = theme?.styles?.borderColor || "rgba(0,0,0,0.1)"
    const cardBg = theme?.styles?.cardBg || "#f9fafb"

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const address = formData.get("address") as string

        let newErrors: Record<string, string> = {}
        if (!name || name.trim().length < 2) newErrors.name = "Name is required"
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Valid email is required"
        if (!address || address.trim().length < 5) newErrors.address = "Valid address is required"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)

        const orderData = {
            storeId,
            baseUrl, // Ensure baseUrl is passed for Stripe success/cancel URLs
            customerName: name,
            customerEmail: email,
            address,
            totalAmount: cartTotal,
            items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price, title: i.title, variantId: i.variantId, variantName: i.variantName })) 
        }

        const res = await placeOrder(orderData)
        if (res.success) {
            clearCart()
            if (res.url) {
                window.location.href = res.url
            } else {
                setSuccess(true)
            }
        } else {
            alert("Failed to place order. Please try again.")
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: bgColor, color: textColor }}>
                <div className="size-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                    <CheckCircle2 className="size-10" />
                </div>
                <h1 className="text-3xl font-extrabold mb-4">Order Confirmed!</h1>
                <p className="opacity-70 max-w-md mb-8">Thank you for your purchase. We've sent a confirmation email to you with the order details.</p>
                <Link href={baseUrl || "/"} className="px-8 py-4 rounded-xl font-bold" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="max-w-4xl mx-auto">
                <Link href={baseUrl || "/"} className="inline-flex items-center gap-2 mb-8 opacity-70 hover:opacity-100 transition-opacity font-semibold">
                    <ArrowLeft className="size-4" /> Return to Store
                </Link>

                {items.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                        <Link href={baseUrl || "/"} className="inline-block px-6 py-3 rounded-xl font-bold" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                            Go Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Checkout Form */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-extrabold">Checkout</h2>
                                {!user && (
                                    <Link href={`${baseUrl}/login`} className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                                        Sign in for faster checkout
                                    </Link>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 opacity-80">Full Name</label>
                                    <input 
                                        name="name" type="text"
                                        defaultValue={user?.user_metadata?.full_name || ""}
                                        className="w-full p-4 rounded-xl outline-none transition-all"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.name ? 'red' : borderColor}`, color: textColor }} 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 opacity-80">Email Address</label>
                                    <input 
                                        name="email" type="email"
                                        defaultValue={user?.email || ""}
                                        className="w-full p-4 rounded-xl outline-none transition-all"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.email ? 'red' : borderColor}`, color: textColor }} 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 opacity-80">Shipping Address</label>
                                    <textarea 
                                        name="address" rows={3}
                                        className="w-full p-4 rounded-xl outline-none transition-all resize-none"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.address ? 'red' : borderColor}`, color: textColor }} 
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-1 font-bold">{errors.address}</p>}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 mt-4 transition-opacity hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor, color: "#fff" }}
                                >
                                    {loading ? <Loader2 className="size-5 animate-spin" /> : <><Lock className="size-4" /> Place Order - {new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</>}
                                </button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="p-8 rounded-3xl sticky top-8" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="size-16 rounded-lg overflow-hidden shrink-0 bg-black/5 dark:bg-white/5">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                                            <p className="text-xs opacity-60">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-bold text-sm">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-3" style={{ borderColor }}>
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm opacity-80">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t" style={{ borderColor }}>
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

