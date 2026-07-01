"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    TrendingUp, DollarSign, Package, AlertCircle,
    BrainCircuit, Sparkles, Loader2, Layers, ShoppingBag, ArrowRight, Download
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
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Intelligence...</p>
            </div>
        )
    }

    const { metrics, aiInsights, currency = "USD" } = data
    const totalRev = metrics.totalRevenue || 0
    
    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)

    // Find max value for SVG Chart scaling
    const maxChartValue = Math.max(...metrics.chartData.map((d: any) => d.value), 100)

    const handleExport = () => {
        const headers = ["Date", "Revenue"];
        const csvContent = [
            headers.join(","),
            ...metrics.chartData.map((d: any) => [d.date, d.value].join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "revenue_analytics.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }; 

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-6 pb-24 pt-8 font-sans space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Revenue Analytics</h1>
                    <p className="text-muted-foreground font-medium">Tracking sales performance and AI-driven growth metrics.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-secondary border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="size-3" /> Export Data
                    </button>
                    <div className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 rounded-xl bg-secondary border border-border text-xs font-bold text-muted-foreground text-center">
                        Real-time Pipeline Active
                    </div>
                </div>
            </div>

            {/* ── AI INSIGHTS CARD ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-indigo-500/20 p-8 shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-shrink-0 space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                            <Sparkles className="size-3" /> Gemini 1.5 Flash
                        </div>
                        <h2 className="text-2xl font-black text-foreground leading-tight">AI Sales<br />Strategist</h2>
                    </div>
                    <div className="flex-1 bg-secondary/50 border border-border/50 p-6 rounded-3xl backdrop-blur-md">
                        <p className="text-foreground/80 font-medium leading-relaxed text-sm md:text-base italic">"{aiInsights}"</p>
                    </div>
                </div>
            </div>

            {/* ── METRICS GRID ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={DollarSign} color="emerald" title="Total Revenue" value={formatMoney(totalRev)} />
                <MetricCard icon={ShoppingBag} color="indigo" title="Orders Completed" value={metrics.totalOrders.toLocaleString()} />
                <MetricCard icon={TrendingUp} color="blue" title="Avg. Order Value" value={formatMoney(metrics.avgOrderValue)} />
                <MetricCard icon={AlertCircle} color="rose" title="Stock Alerts" value={metrics.lowStockCount} danger={metrics.lowStockCount > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── REVENUE TREND CHART ── */}
                <div className="lg:col-span-2 bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Revenue Trend</h3>
                            <p className="text-xs text-muted-foreground mt-1">Growth overview over the last 7 days</p>
                        </div>
                        <span className="text-2xl font-black text-indigo-500">{formatMoney(totalRev)}</span>
                    </div>

                    <div className="w-full h-64 relative mt-10">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            <path
                                d={`M 0,100 ${metrics.chartData.map((d: any, i: number) => {
                                    const x = (i / (metrics.chartData.length - 1)) * 100;
                                    const y = 100 - ((d.value / maxChartValue) * 80);
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
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {metrics.chartData.map((d: any, i: number) => {
                                const x = (i / (metrics.chartData.length - 1)) * 100;
                                const y = 100 - ((d.value / maxChartValue) * 80);
                                return (
                                    <circle key={i} cx={x} cy={y} r="2" fill="var(--background)" stroke="#6366f1" strokeWidth="1" className="cursor-pointer hover:r-3 transition-all">
                                        <title>{d.date}: {formatMoney(d.value)}</title>
                                    </circle>
                                )
                            })}
                        </svg>

                        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {metrics.chartData.map((d: any, i: number) => <span key={i}>{d.date}</span>)}
                        </div>
                    </div>
                </div>

                {/* ── MARKET LEADERS ── */}
                <div className="flex flex-col gap-6">
                    <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-xl flex-1">
                        <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                            <TrendingUp className="size-4 text-emerald-500" /> Market Leaders
                        </h3>
                        <div className="space-y-6">
                            {metrics.marketLeaders.length > 0 ? metrics.marketLeaders.map((p: any, i: number) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold text-foreground line-clamp-1">{p.title}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground">{p.sales} units sold</p>
                                        </div>
                                        <span className="text-xs font-black text-emerald-500">{p.revenue}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }} animate={{ width: `${p.pct}%` }}
                                            className="h-full bg-indigo-500 rounded-full" 
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-xs text-muted-foreground italic">No sales data recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-card border border-border/50 rounded-[2rem] p-6 shadow-xl">
                        <h3 className="text-sm font-bold text-foreground mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {metrics.recentOrders.length > 0 ? metrics.recentOrders.map((o: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-secondary flex items-center justify-center font-mono text-[10px] font-bold text-muted-foreground">
                                            #{o.id}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground">{o.amount}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${
                                                o.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>{o.status}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="size-3 text-muted-foreground/30" />
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground text-center py-4">No recent orders.</p>
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
        <div className={`p-6 rounded-[2rem] border transition-colors ${danger ? "bg-rose-500/5 border-rose-500/20" : "bg-card border-border/50 hover:border-border"}`}>
            <div className={`size-12 rounded-2xl flex items-center justify-center border mb-4 ${theme}`}>
                <Icon className="size-6" />
            </div>
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${danger ? "text-rose-400/60" : "text-foreground/40"}`}>{title}</p>
            <p className="text-3xl font-black text-foreground">{value}</p>
        </div>
    )
}

function StatusRow({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0
    return (
        <div>
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-foreground/60 uppercase tracking-widest">{label}</span>
                <span className="text-foreground">{count}</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
            </div>
            </div>
            )
            }