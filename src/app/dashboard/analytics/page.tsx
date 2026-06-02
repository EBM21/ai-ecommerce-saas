"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    TrendingUp, DollarSign, Package, AlertCircle,
    BrainCircuit, Sparkles, Loader2, Layers, ShoppingBag, ArrowRight
} from "lucide-react"
import { getAnalyticsData } from "../analytics/action"

export default function AnalyticsDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        async function loadAnalytics() {
            const res = await getAnalyticsData()
            if (res?.success) setData(res)
            setIsLoading(false)
        }
        loadAnalytics()
    }, [])

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <BrainCircuit className="size-8 text-indigo-400 animate-pulse" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 size-5 text-violet-400 animate-bounce" />
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Data...</p>
            </div>
        )
    }

    const { metrics, aiInsights } = data

    // Find max value for SVG Chart scaling
    const maxChartValue = Math.max(...metrics.chartData.map((d: any) => d.value), 5) // Minimum scale of 5

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 pb-24 pt-8 font-sans space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Inventory Analytics</h1>
                    <p className="text-white/40 font-medium">Real-time product metrics powered by Quadlix AI.</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60">
                    Last updated: Just now
                </div>
            </div>

            {/* ── AI INSIGHTS CARD ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0c] to-[#12121a] border border-indigo-500/20 p-8 shadow-2xl group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0 space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles className="size-3" /> Gemini 1.5 Pro
                        </div>
                        <h2 className="text-2xl font-black text-white leading-tight">AI Executive<br />Briefing</h2>
                    </div>
                    <div className="flex-1 bg-black/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                        <p className="text-white/80 font-medium leading-relaxed text-sm md:text-base">{aiInsights}</p>
                    </div>
                </div>
            </div>

            {/* ── METRICS GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={DollarSign} color="emerald" title="Est. Inventory Value" value={`$${metrics.inventoryValue.toLocaleString()}`} />
                <MetricCard icon={Layers} color="indigo" title="Total Units in Stock" value={metrics.totalUnits.toLocaleString()} />
                <MetricCard icon={TrendingUp} color="blue" title="Avg. Product Price" value={`$${metrics.avgPrice.toFixed(2)}`} />
                <MetricCard icon={AlertCircle} color="rose" title="Low Stock Alerts" value={metrics.lowStockCount} danger={metrics.lowStockCount > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── BEAUTIFUL SVG LINE/AREA CHART ── */}
                <div className="lg:col-span-2 bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-white">Catalog Growth</h3>
                            <p className="text-xs text-white/40 mt-1">Products added in the last 7 days</p>
                        </div>
                        <span className="text-3xl font-black text-indigo-400">+{metrics.chartData.reduce((a: any, b: any) => a + b.value, 0)}</span>
                    </div>

                    <div className="w-full h-64 relative mt-10">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Data Path Generation */}
                            <path
                                d={`M 0,100 ${metrics.chartData.map((d: any, i: number) => {
                                    const x = (i / (metrics.chartData.length - 1)) * 100;
                                    const y = 100 - ((d.value / maxChartValue) * 80); // 80 to leave padding at top
                                    return `L ${x},${y}`
                                }).join(' ')} L 100,100 Z`}
                                fill="url(#gradientArea)"
                            />
                            <polyline
                                points={metrics.chartData.map((d: any, i: number) => {
                                    const x = (i / (metrics.chartData.length - 1)) * 100;
                                    const y = 100 - ((d.value / maxChartValue) * 80);
                                    return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Data Points */}
                            {metrics.chartData.map((d: any, i: number) => {
                                const x = (i / (metrics.chartData.length - 1)) * 100;
                                const y = 100 - ((d.value / maxChartValue) * 80);
                                return (
                                    <circle key={i} cx={x} cy={y} r="1.5" fill="#0a0a0c" stroke="#818cf8" strokeWidth="0.5" className="hover:r-3 transition-all cursor-pointer">
                                        <title>{d.value} products added</title>
                                    </circle>
                                )
                            })}
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-bold text-white/30 uppercase">
                            {metrics.chartData.map((d: any, i: number) => <span key={i}>{d.date}</span>)}
                        </div>
                    </div>
                </div>

                {/* ── SIDE WIDGETS ── */}
                <div className="flex flex-col gap-6">

                    {/* Status Breakdown */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-white mb-6">Catalog Status</h3>
                        <div className="space-y-4">
                            <StatusRow label="Active" count={metrics.activeProducts} total={metrics.totalProducts} color="bg-emerald-500" />
                            <StatusRow label="Drafts" count={metrics.draftProducts} total={metrics.totalProducts} color="bg-amber-500" />
                            <StatusRow label="Archived" count={metrics.archivedProducts} total={metrics.totalProducts} color="bg-white/20" />
                        </div>
                    </div>

                    {/* Recent Additions */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-6 shadow-xl flex-1 flex flex-col">
                        <h3 className="text-sm font-bold text-white mb-4">Recently Added</h3>
                        <div className="space-y-3 flex-1">
                            {metrics.recentProducts.length > 0 ? metrics.recentProducts.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center"><ShoppingBag className="size-4 text-white/40" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-white line-clamp-1">{p.title}</p>
                                            <p className="text-[10px] font-bold text-white/30 uppercase">{p.timeAgo}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-400">${p.price.toFixed(2)}</span>
                                </div>
                            )) : (
                                <p className="text-xs text-white/30 text-center py-4">No products found.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    )
}

// ── REUSABLE UI COMPONENTS ──

function MetricCard({ icon: Icon, color, title, value, danger }: any) {
    const colorMap: any = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    }
    const theme = colorMap[color]

    return (
        <div className={`p-6 rounded-[2rem] border transition-colors ${danger ? "bg-rose-500/5 border-rose-500/20" : "bg-[#0a0a0c] border-white/5 hover:border-white/10"}`}>
            <div className={`size-12 rounded-2xl flex items-center justify-center border mb-4 ${theme}`}>
                <Icon className="size-6" />
            </div>
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${danger ? "text-rose-400/60" : "text-white/40"}`}>{title}</p>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
    )
}

function StatusRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0
    return (
        <div>
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-white/60 uppercase tracking-widest">{label}</span>
                <span className="text-white">{count}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    )
}