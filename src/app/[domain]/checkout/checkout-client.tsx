"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import Link from "next/link"
import { ArrowLeft, Loader2, Lock, CheckCircle2 } from "lucide-react"
import { placeOrder } from "./action"
import { createClient } from "@/utils/supabase/client"

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 800
                let width = img.width
                let height = img.height

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width)
                    width = MAX_WIDTH
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                // Compress to JPEG with 70% quality to ensure it easily fits under Next.js 1MB limit
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
                resolve(dataUrl)
            }
            img.onerror = (error) => reject(error)
        }
        reader.onerror = (error) => reject(error)
    })
}

export default function CheckoutClient({ storeId, domain, theme, user, baseUrl, blockProps, bankDetails }: { storeId: string, domain: string, theme: any, user?: any, baseUrl: string, blockProps?: any, bankDetails?: string | null }) {
    const { items, cartTotal, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD')
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null)

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
        const phone = formData.get("phone") as string

        const newErrors: Record<string, string> = {}
        if (!name || name.trim().length < 2) newErrors.name = "Name is required"
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Valid email is required"
        if (!phone || phone.trim().length < 5) newErrors.phone = "Valid phone number is required"
        if (!address || address.trim().length < 5) newErrors.address = "Valid address is required"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)

        if (paymentMethod === 'BANK_TRANSFER' && !screenshotFile && storeId !== "preview") {
            setErrors(prev => ({ ...prev, screenshot: "Please upload your payment screenshot." }))
            setLoading(false)
            return
        }

        let screenshotUrl = null
        if (paymentMethod === 'BANK_TRANSFER' && screenshotFile && storeId !== "preview") {
            try {
                // Compress and convert file to base64 to bypass any storage bucket/RLS issues
                // This also ensures the payload is well under the 1MB Server Action limit
                screenshotUrl = await compressImage(screenshotFile)
            } catch (err: any) {
                setErrors(prev => ({ ...prev, screenshot: "Failed to process screenshot." }))
                setLoading(false)
                return
            }
        }

        const orderData = {
            storeId,
            baseUrl, // Ensure baseUrl is passed for Stripe success/cancel URLs
            customerName: name,
            customerEmail: email,
            phone,
            address,
            paymentMethod,
            paymentScreenshot: screenshotUrl,
            totalAmount: cartTotal,
            items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price, title: i.title, variantId: i.variantId, variantName: i.variantName })) 
        }

        if (storeId === "preview") {
            setTimeout(() => {
                clearCart()
                setSuccess(true)
                setLoading(false)
            }, 1500)
            return
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
            alert("Failed to place order: " + res.error)
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="py-24 flex flex-col items-center justify-center px-6 text-center">
                <div className="size-24 rounded-full flex items-center justify-center mb-8 shadow-2xl" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                    <CheckCircle2 className="size-12" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Order Confirmed!</h1>
                <p className="opacity-60 max-w-lg mb-10 text-lg">Thank you for your purchase. We've sent a confirmation email to you with the order details.</p>
                <Link href={baseUrl || "/"} className="px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                    Continue Shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
            <div className="max-w-5xl mx-auto">
                <Link href={baseUrl || "/"} className="inline-flex items-center gap-3 mb-12 opacity-50 hover:opacity-100 transition-opacity font-bold uppercase tracking-widest text-xs">
                    <ArrowLeft className="size-4" /> Return to Store
                </Link>

                {items.length === 0 ? (
                    <div className="text-center py-32 rounded-[3rem] shadow-sm" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                        <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter">Your cart is empty</h2>
                        <Link href={baseUrl || "/"} className="inline-block px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-transform" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                            Go Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                        {/* Checkout Form */}
                        <div className="lg:col-span-7">
                            <div className="flex items-end justify-between mb-10 border-b pb-6" style={{ borderColor }}>
                                <h2 className="text-4xl font-black tracking-tighter">{blockProps?.title || "Checkout"}</h2>
                                {!user && (
                                    <Link href={`${baseUrl}/login`} className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                                        Sign in for faster checkout
                                    </Link>
                                )}
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 opacity-60">Full Name</label>
                                    <input 
                                        name="name" type="text"
                                        defaultValue={user?.user_metadata?.full_name || ""}
                                        className="w-full p-5 rounded-2xl outline-none transition-all font-medium text-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.name ? 'red' : borderColor}`, color: textColor, '--tw-ring-color': primaryColor } as any} 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-widest">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 opacity-60">Email Address</label>
                                    <input 
                                        name="email" type="email"
                                        defaultValue={user?.email || ""}
                                        className="w-full p-5 rounded-2xl outline-none transition-all font-medium text-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.email ? 'red' : borderColor}`, color: textColor, '--tw-ring-color': primaryColor } as any} 
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-widest">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 opacity-60">Phone Number</label>
                                    <input 
                                        name="phone" type="tel"
                                        placeholder="+1 234 567 8900"
                                        className="w-full p-5 rounded-2xl outline-none transition-all font-medium text-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.phone ? 'red' : borderColor}`, color: textColor, '--tw-ring-color': primaryColor } as any} 
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-widest">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest mb-3 opacity-60">Shipping Address</label>
                                    <textarea 
                                        name="address" rows={4}
                                        className="w-full p-5 rounded-2xl outline-none transition-all resize-none font-medium text-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
                                        style={{ backgroundColor: cardBg, border: `1px solid ${errors.address ? 'red' : borderColor}`, color: textColor, '--tw-ring-color': primaryColor } as any} 
                                    />
                                    {errors.address && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-widest">{errors.address}</p>}
                                </div>

                                <div className="pt-6 border-t" style={{ borderColor }}>
                                    <h3 className="text-xl font-black mb-6">Payment Method</h3>
                                    
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer border-2 transition-all hover:bg-black/5" style={{ borderColor: paymentMethod === 'COD' ? primaryColor : borderColor, backgroundColor: paymentMethod === 'COD' ? `${primaryColor}10` : cardBg, color: textColor }}>
                                            <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-5 h-5 accent-indigo-600" style={{ accentColor: primaryColor }} />
                                            <div>
                                                <p className="font-bold text-lg">Cash on Delivery</p>
                                                <p className="text-sm opacity-60">Pay when you receive your order</p>
                                            </div>
                                        </label>

                                        {bankDetails && (
                                            <label className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer border-2 transition-all hover:bg-black/5" style={{ borderColor: paymentMethod === 'BANK_TRANSFER' ? primaryColor : borderColor, backgroundColor: paymentMethod === 'BANK_TRANSFER' ? `${primaryColor}10` : cardBg, color: textColor }}>
                                                <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="w-5 h-5 accent-indigo-600" style={{ accentColor: primaryColor }} />
                                                <div>
                                                    <p className="font-bold text-lg">Online Bank Transfer</p>
                                                    <p className="text-sm opacity-60">Transfer to our account and upload proof</p>
                                                </div>
                                            </label>
                                        )}
                                    </div>

                                    {paymentMethod === 'BANK_TRANSFER' && bankDetails && (
                                        <div className="mt-6 p-6 rounded-2xl space-y-6" style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}20` }}>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Merchant Account Details</p>
                                                <div className="p-4 rounded-xl whitespace-pre-wrap font-medium" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                                                    {bankDetails}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Upload Payment Screenshot</p>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                                                    className="w-full p-4 rounded-xl outline-none transition-all cursor-pointer font-medium"
                                                    style={{ backgroundColor: cardBg, border: `1px solid ${errors.screenshot ? 'red' : borderColor}`, color: textColor }}
                                                />
                                                {errors.screenshot && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-widest">{errors.screenshot}</p>}
                                                {screenshotFile && <p className="text-xs mt-2 opacity-60">Selected: {screenshotFile.name}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 mt-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                                    style={{ backgroundColor: primaryColor, color: "#fff", boxShadow: `0 20px 40px -15px ${primaryColor}80` }}
                                >
                                    {loading ? <Loader2 className="size-6 animate-spin" /> : <><Lock className="size-5" /> {blockProps?.buttonText || "Place Order"} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</>}
                                </button>
                                
                                <p className="text-center text-xs opacity-40 mt-6 flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                                    <Lock className="size-3" /> {blockProps?.guaranteeText || "100% secure encrypted payment"}
                                </p>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-5 p-10 rounded-[3rem] sticky top-8 shadow-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                            <h3 className="text-2xl font-black mb-8 tracking-tighter">Order Summary</h3>
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
                            <div className="border-t pt-6 space-y-4" style={{ borderColor }}>
                                <div className="flex justify-between text-sm opacity-60 font-bold uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm opacity-60 font-bold uppercase tracking-widest">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-black">FREE</span>
                                </div>
                                <div className="flex justify-between text-2xl font-black pt-6 border-t mt-4" style={{ borderColor }}>
                                    <span>Total</span>
                                    <span style={{ color: primaryColor }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

