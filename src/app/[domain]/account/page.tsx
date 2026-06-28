import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { storefrontLogout } from "../login/actions"
import { headers } from "next/headers"

async function getBaseUrl(domain: string) {
    const hostHeader = (await headers()).get("host") || ""
    const host = hostHeader.split(":")[0]
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
    const baseDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (isLocal ? 'localhost:3000' : 'quadlix.com')
    return (host === baseDomain || host === `app.${baseDomain}`) ? `/${domain}` : ""
}

export default async function AccountPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const baseUrl = await getBaseUrl(domain)

    if (!user) {
        redirect(`${baseUrl}/login`)
    }

    const store = await prisma.store.findFirst({
        where: { OR: [{ subdomain: domain }, { customDomain: domain }] }
    })

    if (!store) notFound()

    const orders = await prisma.order.findMany({
        where: {
            storeId: store.id,
            customer: { userId: user.id }
        },
        include: {
            orderItems: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Parse themeConfig
    let theme: any = null
    if (store.themeConfig) {
        try {
            theme = typeof store.themeConfig === 'string'
                ? JSON.parse(store.themeConfig as string)
                : store.themeConfig
        } catch (e) {
            console.error("Account Page: theme parse error", e)
        }
    }

    const primaryColor = theme?.branding?.primaryColor || "#6366f1"
    const cardBg = theme?.styles?.cardBg || "#f9fafb"
    const borderColor = theme?.styles?.borderColor || "rgba(0,0,0,0.1)"

    const handleLogout = storefrontLogout.bind(null, domain)

    return (
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">My Account</h1>
                    <p className="opacity-60 font-medium">Manage your orders and account settings.</p>
                </div>
                <form action={handleLogout}>
                    <button 
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-secondary text-sm font-bold hover:bg-secondary/80 transition-all"
                    >
                        <LogOut className="size-4" /> Sign Out
                    </button>
                </form>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                {/* ── PROFILE WIDGET ── */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[2.5rem] border shadow-xl" style={{ backgroundColor: cardBg, borderColor }}>
                        <div className="size-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-6 shadow-lg" style={{ background: primaryColor }}>
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg">{user.user_metadata?.full_name || "Customer"}</h3>
                            <p className="text-sm opacity-50 font-medium">{user.email}</p>
                        </div>
                        <div className="mt-8 pt-8 border-t space-y-4" style={{ borderColor }}>
                             <div className="flex items-center gap-3 text-sm font-bold">
                                <Package className="size-4 opacity-40" /> {orders.length} Total Orders
                             </div>
                        </div>
                    </div>
                </div>

                {/* ── ORDER HISTORY ── */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                        <Clock className="size-5 opacity-40" /> Order History
                    </h2>

                    {orders.length === 0 ? (
                        <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <ShoppingBag className="size-12" />
                            <p className="font-medium text-lg">No orders yet.</p>
                            <Link href={`/${domain}`} className="text-sm font-bold hover:underline" style={{ color: primaryColor }}>Start Shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div 
                                    key={order.id} 
                                    className="p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md"
                                    style={{ backgroundColor: cardBg, borderColor }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                                            <Package className="size-6 opacity-30" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5">Order #{order.id.slice(-8).toUpperCase()}</p>
                                            <p className="text-sm font-bold">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right">
                                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-0.5">Total</p>
                                            <p className="font-black">{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(order.totalAmount))}</p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            order.status === 'PAID' || order.status === 'FULFILLED' 
                                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
