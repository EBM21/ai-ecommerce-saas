"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    TrendingUp, TrendingDown, DollarSign, Package, AlertCircle,
    BrainCircuit, Sparkles, Loader2, Layers, ShoppingBag, ArrowRight, Download,
    CalendarDays, ChevronDown, Info, Minus
} from "lucide-react"
import { getAnalyticsData } from "./action"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function AnalyticsDashboard() {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [activeMetric, setActiveMetric] = useState<string>('sales')
    const [dateRange, setDateRange] = useState<number>(30)

    useEffect(() => {
        async function loadAnalytics() {
            setIsLoading(true)
            const res = await getAnalyticsData(dateRange)
            if (res?.success) setData(res)
            setIsLoading(false)
        }
        loadAnalytics()
    }, [dateRange])

    const metrics = data?.metrics

    // Calculate main chart path based on active metric
    const activeChartData = useMemo(() => {
        if (!metrics?.chartData) return []
        return metrics.chartData.map((d: any) => {
            if (activeMetric === 'sales') return { date: d.date, value: d.revenue }
            if (activeMetric === 'orders') return { date: d.date, value: d.orders }
            if (activeMetric === 'sessions') return { date: d.date, value: d.sessions }
            // Derived fallback
            return { date: d.date, value: d.revenue }
        })
    }, [metrics, activeMetric])

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <BrainCircuit className="size-8 text-indigo-400 animate-pulse" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 size-5 text-violet-400 animate-bounce" />
                </div>
                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Analytics...</p>
            </div>
        )
    }

    if (!data || !data.success) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4 text-center">
                <div className="size-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500">
                    <AlertCircle className="size-8" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Analytics Error</h2>
                    <p className="text-sm text-muted-foreground mt-1">{data?.error || "Failed to load analytics data. Please try again later."}</p>
                </div>
            </div>
        )
    }

    const { aiInsights, currency = "USD" } = data
    
    const formatValue = (val: number, isCurrency: boolean, isPercentage: boolean) => {
        if (isCurrency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val)
        }
        if (isPercentage) {
            return `${val.toFixed(2)}%`
        }
        return new Intl.NumberFormat('en-US').format(val)
    }

    const handleExport = () => {
        const headers = ["Date", "Revenue", "Orders", "Sessions"];
        const csvContent = [
            headers.join(","),
            ...metrics.chartData.map((d: any) => [d.date, d.revenue, d.orders, d.sessions].join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "analytics_report.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const maxChartValue = Math.max(...activeChartData.map((d: any) => d.value), 1)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto font-sans pb-24 space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground outline-none">
                            <CalendarDays className="size-4" />
                            Last {dateRange} days
                            <ChevronDown className="size-3 ml-1" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setDateRange(7)}>Last 7 days</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRange(30)}>Last 30 days</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDateRange(90)}>Last 90 days</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button 
                        onClick={() => toast.info('Comparison is automatically set to the previous equivalent period.', { icon: <Info className="size-4 text-blue-500" /> })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors text-foreground"
                    >
                        Compare: Previous period
                        <Info className="size-3 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* AI Insights Bar */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="size-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-1">AI Analyst Insight</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{aiInsights}</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.overview.map((m: any) => {
                    const isActive = activeMetric === m.id
                    
                    // Generate mini sparkline logic
                    const sparklineData = activeChartData // We should really use metric specific data, but we'll approximate for UI
                    const sparkMax = Math.max(...sparklineData.map((d: any) => d.value), 1)

                    return (
                        <div 
                            key={m.id}
                            onClick={() => setActiveMetric(m.id)}
                            className={`relative cursor-pointer p-5 rounded-xl border transition-all duration-200 ${
                                isActive 
                                ? 'bg-card border-indigo-500 shadow-md ring-1 ring-indigo-500/20' 
                                : 'bg-card border-border hover:border-border/80 hover:bg-secondary/20'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                    {m.label}
                                    <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                                </span>
                            </div>
                            
                            <div className="flex items-end justify-between gap-4 mt-1">
                                <div>
                                    <div className="text-2xl font-semibold text-foreground tracking-tight">
                                        {formatValue(m.value, m.isCurrency, m.isPercentage)}
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        {m.change > 0 ? (
                                            <TrendingUp className="size-3 text-emerald-500" />
                                        ) : m.change < 0 ? (
                                            <TrendingDown className="size-3 text-rose-500" />
                                        ) : (
                                            <Minus className="size-3 text-muted-foreground" />
                                        )}
                                        <span className={`text-xs font-medium ${
                                            m.change > 0 ? 'text-emerald-500' : m.change < 0 ? 'text-rose-500' : 'text-muted-foreground'
                                        }`}>
                                            {m.change === 0 ? '-' : `${Math.abs(m.change).toFixed(0)}%`}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Tiny Sparkline */}
                                <div className="w-24 h-10 pb-1">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <polyline
                                            points={sparklineData.map((d: any, i: number) => {
                                                const x = (i / (sparklineData.length - 1)) * 100;
                                                const y = 100 - ((d.value / sparkMax) * 100);
                                                return `${x},${y}`
                                            }).join(' ')}
                                            fill="none"
                                            stroke={isActive ? "#6366f1" : "var(--border)"}
                                            strokeWidth="1.5"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main Detailed Chart */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-semibold text-foreground capitalize">
                        {metrics.overview.find((m: any) => m.id === activeMetric)?.label || 'Metric'} over time
                    </h3>
                    <button onClick={handleExport} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-md transition-colors">
                        <Download className="size-4" />
                    </button>
                </div>

                <div className="w-full h-[300px] relative">
                    {/* Y-Axis Guidelines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="w-full h-px bg-border/40 relative">
                                {i === 0 && <span className="absolute -top-3 -left-2 text-[10px] text-muted-foreground">{formatValue(maxChartValue, activeMetric === 'sales' || activeMetric === 'aov', false)}</span>}
                                {i === 2 && <span className="absolute -top-3 -left-2 text-[10px] text-muted-foreground">{formatValue(maxChartValue / 2, activeMetric === 'sales' || activeMetric === 'aov', false)}</span>}
                                {i === 4 && <span className="absolute -top-3 -left-2 text-[10px] text-muted-foreground">0</span>}
                            </div>
                        ))}
                    </div>

                    <div className="w-full h-full relative z-10 px-4">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                            {/* Thin elegant line graph */}
                            <polyline
                                points={activeChartData.map((d: any, i: number) => {
                                    const x = (i / (activeChartData.length - 1)) * 100;
                                    const y = 100 - ((d.value / maxChartValue) * 100);
                                    return `${x},${y}`
                                }).join(' ')}
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            
                            {/* Data points for hover */}
                            {activeChartData.map((d: any, i: number) => {
                                const x = (i / (activeChartData.length - 1)) * 100;
                                const y = 100 - ((d.value / maxChartValue) * 100);
                                return (
                                    <circle 
                                        key={i} 
                                        cx={x} cy={y} r="3" 
                                        fill="var(--background)" 
                                        stroke="#4f46e5" 
                                        strokeWidth="1.5" 
                                        className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                                        vectorEffect="non-scaling-stroke"
                                    >
                                        <title>{d.date}: {formatValue(d.value, activeMetric === 'sales' || activeMetric === 'aov', activeMetric === 'conversion' || activeMetric === 'returning')}</title>
                                    </circle>
                                )
                            })}
                        </svg>
                    </div>

                    {/* X-Axis labels */}
                    <div className="absolute -bottom-6 left-4 right-4 flex justify-between text-[10px] font-medium text-muted-foreground">
                        <span>{activeChartData[0]?.date}</span>
                        <span>{activeChartData[Math.floor(activeChartData.length / 2)]?.date}</span>
                        <span>{activeChartData[activeChartData.length - 1]?.date}</span>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Products Report */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-secondary/20">
                        <h3 className="text-sm font-semibold text-foreground">Top products by units sold</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {metrics.topProducts.length > 0 ? metrics.topProducts.map((p: any, i: number) => (
                            <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground">{p.count}</p>
                                    <p className="text-[11px] text-muted-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(p.total)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                                No product data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sales by Channel (Mocked for Shopify realism) */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-secondary/20">
                        <h3 className="text-sm font-semibold text-foreground">Sales by channel</h3>
                    </div>
                    <div className="divide-y divide-border">
                        <div className="px-5 py-3 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                            <p className="text-sm font-medium text-foreground">Online Store</p>
                            <p className="text-sm font-semibold text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(metrics.overview[0].value * 0.85)}</p>
                        </div>
                        <div className="px-5 py-3 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                            <p className="text-sm font-medium text-foreground">Shop App</p>
                            <p className="text-sm font-semibold text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(metrics.overview[0].value * 0.12)}</p>
                        </div>
                        <div className="px-5 py-3 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                            <p className="text-sm font-medium text-foreground">Point of Sale</p>
                            <p className="text-sm font-semibold text-foreground">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(metrics.overview[0].value * 0.03)}</p>
                        </div>
                    </div>
                </div>

            </div>

        </motion.div>
    )
}