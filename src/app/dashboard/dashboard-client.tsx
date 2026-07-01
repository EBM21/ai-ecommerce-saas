"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    TrendingUp, TrendingDown, Package, ShoppingBag,
    BarChart2, Sparkles, Plus, Download,
    ArrowUpRight, Clock, BrainCircuit, Zap,
    MousePointerClick, Search, Filter
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────
type StatItem = { value: string; change: string; up: boolean }
type Order = { id: string; customer: string; product: string; amount: string; status: string; time: string }
type TopProduct = { name: string; sales: number; revenue: string; pct: number }

type ChartItem = { height: number; value: string; month: string }

type Props = {
    storeName: string
    stats: {
        revenue: StatItem
        orders: StatItem
        products: StatItem
        conversion: StatItem
    }
    chartData: ChartItem[]
    recentOrders: Order[]
    topProducts: TopProduct[]
}

const STATUS_STYLES: Record<string, string> = {
    Delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Processing: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    Shipped: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function DashboardClient({
    storeName, stats, chartData, recentOrders, topProducts
}: Props) {
    const [hoverBar, setHoverBar] = useState<number | null>(null)

    const handleExport = () => {
        if (!recentOrders || recentOrders.length === 0) {
            alert("No recent orders to export.")
            return
        }
        
        const headers = ["Order ID", "Customer", "Status", "Amount", "Time"]
        const csvContent = [
            headers.join(","),
            ...recentOrders.map(o => [
                o.id,
                `"${o.customer}"`,
                o.status,
                `"${o.amount}"`,
                `"${o.time}"`
            ].join(","))
        ].join("\n")
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${storeName.replace(/\s+/g, '_')}_recent_orders.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 p-2"
        >
            {/* ── Header Section ───────────────────────────────────────────── */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Admin</span> 👋
                        </h1>
                        <div className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                            AI Active
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Analyzing <span className="text-foreground font-medium">{storeName}</span>'s performance in real-time.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="hidden sm:flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 transition-all text-sm">
                        <Download className="size-4" /> Export Data
                    </button>
                    <Link href="/dashboard/products/new"
                        className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all hover:scale-[1.02]">
                        <Plus className="size-4" /> Create Listing
                    </Link>
                </div>
            </header>

            {/* ── AI Insights Banner (The "AI-Based" Feel) ────────────────── */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 border border-border p-6 flex items-center justify-between shadow-sm">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-2">
                            <BrainCircuit className="size-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">AI Strategy Insight</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Inventory Alert: High Demand Expected</h3>
                        <p className="text-sm text-muted-foreground max-w-md">Based on last month's trends, your top products might run out in 12 days. AI suggests restocking by Friday.</p>
                    </div>
                    <Zap className="absolute right-[-20px] top-[-20px] size-40 text-indigo-500/10 -rotate-12" />
                </div>
                <div className="rounded-3xl bg-card border border-border p-6 flex flex-col justify-center shadow-sm">
                    <div className="text-rose-500 dark:text-rose-400 flex items-center gap-2 mb-1">
                        <MousePointerClick className="size-4" />
                        <span className="text-xs font-bold">Ad Optimization</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Conversion rate is up 12% after AI-suggested title updates.</p>
                </div>
            </section>

            {/* ── Dynamic Stats ───────────────────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: "Revenue", val: stats.revenue, icon: TrendingUp, col: "text-emerald-500 dark:text-emerald-400", bg: "hover:shadow-emerald-500/10" },
                    { label: "Orders", val: stats.orders, icon: ShoppingBag, col: "text-indigo-500 dark:text-indigo-400", bg: "hover:shadow-indigo-500/10" },
                    { label: "Products", val: stats.products, icon: Package, col: "text-amber-500 dark:text-amber-400", bg: "hover:shadow-amber-500/10" },
                    { label: "Conversion", val: stats.conversion, icon: BarChart2, col: "text-rose-500 dark:text-rose-400", bg: "hover:shadow-rose-500/10" }
                ].map((item, idx) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={idx}
                        className={`group relative bg-card backdrop-blur-md border border-border p-6 rounded-[2rem] transition-all hover:border-primary/20 shadow-sm ${item.bg}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-secondary border border-border">
                                <item.icon className={`size-5 ${item.col}`} />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${item.val.up ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                                {item.val.up ? '+' : '-'}{item.val.change}
                            </span>
                        </div>
                        <h4 className="text-sm text-muted-foreground font-medium">{item.label}</h4>
                        <p className="text-2xl font-bold text-foreground mt-1 tracking-tight">{item.val.value}</p>
                    </motion.div>
                ))}
            </section>

            {/* ── Main Analytics & Side Panels ────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left: Revenue Chart */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Revenue Performance</h3>
                                <p className="text-xs text-muted-foreground">AI-powered trend forecasting active</p>
                            </div>
                            <select className="bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs text-foreground outline-none">
                                <option>Last 12 Months</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2 h-48 group/chart">
                            {chartData.map((d, i) => (
                                <div key={i} className="relative flex-1 group">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${d.height}%` }}
                                        onMouseEnter={() => setHoverBar(i)}
                                        onMouseLeave={() => setHoverBar(null)}
                                        className={`w-full rounded-t-xl transition-all duration-300 relative ${hoverBar === i ? 'bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-indigo-500/20'
                                            }`}
                                    />
                                    {hoverBar === i && (
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-xl z-20 whitespace-nowrap border border-border">
                                            {d.month}: {d.value}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 px-1">
                            {chartData.map((d, i) => <span key={i} className="text-[10px] text-muted-foreground font-medium">{d.month[0]}</span>)}
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">Live Transactions</h3>
                            <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Full Audit Log</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/50 text-[10px] uppercase tracking-widest text-muted-foreground">
                                    <tr>
                                        <th className="px-8 py-4">Order ID</th>
                                        <th className="px-8 py-4">Customer</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOrders.map((o, i) => (
                                        <tr key={i} className="hover:bg-secondary/30 transition-colors group">
                                            <td className="px-8 py-4 text-sm font-mono text-muted-foreground">{o.id}</td>
                                            <td className="px-8 py-4 text-sm font-medium text-foreground">{o.customer}</td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLES[o.status] || 'bg-secondary text-muted-foreground'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-sm font-bold text-foreground text-right">{o.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right: AI Actions & Top Products */}
                <div className="flex flex-col gap-6">
                    {/* Professional AI Studio Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-foreground relative overflow-hidden shadow-2xl">
                        <Sparkles className="absolute top-4 right-4 size-12 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">AI Creative Studio</h3>
                        <p className="text-indigo-100 text-xs mb-6 leading-relaxed">Let AI rewrite your product SEO and generate high-conversion images in seconds.</p>
                        <div className="space-y-3 mb-8">
                            {["Smart Descriptions", "Image Enhancement", "SEO Tuning"].map(action => (
                                <div key={action} className="flex items-center gap-2 text-xs font-medium bg-secondary/80 rounded-xl p-2 px-3">
                                    <div className="size-1.5 rounded-full bg-primary shadow-sm" /> {action}
                                </div>
                            ))}
                        </div>
                        <Link href="/dashboard/ai-studio" className="block w-full text-center bg-white text-indigo-600 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                            Launch Studio
                        </Link>
                    </div>

                    {/* Top Products Glass List */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
                        <h3 className="text-md font-bold text-foreground mb-4 px-2">Market Leaders</h3>
                        <div className="space-y-4">
                            {topProducts.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-all">
                                    <div className="size-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">{p.sales} sales this week</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{p.revenue}</p>
                                        <div className="w-12 h-1 bg-secondary rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${p.pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    )
}