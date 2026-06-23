"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getMarketingData, launchAdCampaign, connectPlatform, toggleCampaignStatus, deleteCampaign } from "./actions"
import { toast } from "sonner"
import Link from "next/link"
import {
    Megaphone, Target, DollarSign, Loader2, Sparkles,
    CheckCircle2, AlertCircle, BarChart3, Image as ImageIcon, 
    BrainCircuit, Search, Play, Pause, ExternalLink, Plus, Trash2
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MarketingPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [hasMeta, setHasMeta] = useState(false)
    const [hasGoogle, setHasGoogle] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isPending, startTransition] = useTransition()
    
    // New Campaign Form State
    const [isCreating, setIsCreating] = useState(false)
    const [platform, setPlatform] = useState<"META" | "GOOGLE">("META")
    const [selectedProduct, setSelectedProduct] = useState<string>("")
    const [budget, setBudget] = useState<number>(1000)
    const [objective, setObjective] = useState<"SALES" | "TRAFFIC">("SALES")
    
    const [isLaunching, setIsLaunching] = useState(false)
    const [launchStep, setLaunchStep] = useState<string>("")

    async function loadData() {
        const res = await getMarketingData()
        if (res?.success) {
            setIsSubscribed(res.isSubscribed)
            setHasMeta(res.hasMeta)
            setHasGoogle(res.hasGoogle)
            setProducts(res.products)
            setCampaigns(res.campaigns)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleConnect = async (plat: "META" | "GOOGLE") => {
        toast.loading(`Connecting to ${plat}...`, { id: 'connect' })
        const res = await connectPlatform(plat)
        if (res.success) {
            toast.success(res.message, { id: 'connect' })
            loadData()
        } else {
            toast.error(res.error, { id: 'connect' })
        }
    }

    const handleLaunch = async () => {
        if (!selectedProduct) {
            toast.error("Please select a product to advertise")
            return
        }

        setIsLaunching(true)
        setLaunchStep("Analyzing product for optimal targeting...")
        await new Promise(r => setTimeout(r, 1200))
        
        setLaunchStep("AI generating high-converting ad copy...")
        await new Promise(r => setTimeout(r, 1500))
        
        setLaunchStep(`Connecting to ${platform === 'META' ? 'Meta' : 'Google'} Ads API...`)
        await new Promise(r => setTimeout(r, 1200))
        
        setLaunchStep("Deploying campaign...")
        const res = await launchAdCampaign({
            platform,
            productId: selectedProduct,
            budget,
            objective
        })

        if (res.success) {
            toast.success(res.message)
            setSelectedProduct("")
            setBudget(1000)
            setIsCreating(false)
            loadData()
        } else {
            toast.error(res.error || "Failed to launch campaign")
        }
        setIsLaunching(false)
        setLaunchStep("")
    }

    const handleToggleStatus = (id: string, currentStatus: string) => {
        startTransition(async () => {
            const res = await toggleCampaignStatus(id, currentStatus)
            if (res.success) {
                toast.success(`Campaign ${res.newStatus.toLowerCase()}`)
                loadData()
            } else {
                toast.error(res.error)
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) return
        startTransition(async () => {
            const res = await deleteCampaign(id)
            if (res.success) {
                toast.success("Campaign deleted")
                loadData()
            } else {
                toast.error(res.error)
            }
        })
    }

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="size-10 animate-spin text-indigo-500" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Marketing Engine...</p>
            </div>
        )
    }

    if (!isSubscribed) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 py-12">
                <div className="relative rounded-[3rem] bg-card border border-border overflow-hidden shadow-2xl p-10 text-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-600/10 pointer-events-none" />
                    <div className="size-24 mx-auto rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner">
                        <Megaphone className="size-12 text-indigo-500" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-6">Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI Ads</span></h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Automate your entire marketing strategy. Run real AI-optimized campaigns on Meta and Google directly from your dashboard. Requires Quadlix Pro.
                    </p>
                    <Link href="/dashboard/settings?tab=billing">
                        <button className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:scale-105 transition-all">
                            Upgrade to Pro Plan
                        </button>
                    </Link>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 md:px-6 pb-24 pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                            <Sparkles className="size-4 text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Marketing Hub</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Marketing & Ads</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage Meta and Google Ads, track ROI, and scale your business.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${isCreating ? 'bg-secondary text-foreground hover:bg-secondary/80' : 'bg-indigo-600 text-white shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95'}`}
                    >
                        {isCreating ? 'Cancel' : <><Plus className="size-4" /> New Campaign</>}
                    </button>
                </div>
            </div>

            {/* Integrations Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="p-6 rounded-[2rem] border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${hasMeta ? 'bg-blue-500/10' : 'bg-secondary'}`}>
                            <svg viewBox="0 0 36 36" className={`size-6 fill-current ${hasMeta ? 'text-blue-500' : 'text-muted-foreground'}`} xmlns="http://www.w3.org/2000/svg"><path d="M15 15.65v4.71h-3.4v-4.71H8.62v-3.79h2.98v-2.47c0-2.46 1.18-6.31 6.31-6.31h4.63v3.68h-3.37c-1.12 0-2.18.57-2.18 2.39v2.71h5.36l-.75 3.79h-4.6V33h-3.4V15.65z"/></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Meta Ads</h3>
                            <p className="text-xs text-muted-foreground">{hasMeta ? 'Connected & Active' : 'Not connected'}</p>
                        </div>
                    </div>
                    {!hasMeta ? (
                        <a href="/api/marketing/meta" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors text-center">Connect</a>
                    ) : (
                        <CheckCircle2 className="size-5 text-blue-500" />
                    )}
                </div>
                <div className="p-6 rounded-[2rem] border border-border bg-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${hasGoogle ? 'bg-rose-500/10' : 'bg-secondary'}`}>
                            <Search className={`size-6 ${hasGoogle ? 'text-rose-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Google Ads</h3>
                            <p className="text-xs text-muted-foreground">{hasGoogle ? 'Connected & Active' : 'Not connected'}</p>
                        </div>
                    </div>
                    {!hasGoogle ? (
                        <a href="/api/marketing/google" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors text-center">Connect</a>
                    ) : (
                        <CheckCircle2 className="size-5 text-rose-500" />
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isCreating ? (
                    <motion.div 
                        key="create"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {/* New Campaign Builder UI */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 pb-10 border-b border-border/50">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6">1. Select Network</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setPlatform("META")}
                                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${platform === 'META' ? 'bg-blue-500/10 border-blue-500' : 'bg-secondary/50 border-border'}`}
                                        >
                                            <span className={`font-bold ${platform === 'META' ? 'text-blue-500' : 'text-foreground'}`}>Meta Ads</span>
                                        </button>
                                        <button 
                                            onClick={() => setPlatform("GOOGLE")}
                                            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${platform === 'GOOGLE' ? 'bg-rose-500/10 border-rose-500' : 'bg-secondary/50 border-border'}`}
                                        >
                                            <span className={`font-bold ${platform === 'GOOGLE' ? 'text-rose-500' : 'text-foreground'}`}>Google Ads</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                                    <h3 className="text-lg font-bold text-foreground mb-6">2. Select Product</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {products.map((p) => (
                                            <button 
                                                key={p.id}
                                                onClick={() => setSelectedProduct(p.id)}
                                                className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left ${selectedProduct === p.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-secondary/30 border-border/50 hover:bg-secondary'}`}
                                            >
                                                <div className="size-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                                    {p.image ? <img src={p.image} alt={p.title} className="size-full object-cover" /> : <ImageIcon className="size-5 opacity-30" />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={`text-sm font-bold truncate ${selectedProduct === p.id ? 'text-indigo-400' : 'text-foreground'}`}>{p.title}</p>
                                                    <p className="text-xs text-muted-foreground">Rs {p.price}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-foreground">3. Daily Budget & Objective</h3>
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg font-bold text-sm flex items-center gap-1 border border-emerald-500/20">
                                            Rs {budget}
                                        </div>
                                    </div>
                                    <input type="range" min="500" max="50000" step="500" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-8" />
                                    
                                    <div className="flex gap-4">
                                        <button onClick={() => setObjective("SALES")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${objective === 'SALES' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-secondary text-muted-foreground'}`}>Maximize Sales</button>
                                        <button onClick={() => setObjective("TRAFFIC")} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${objective === 'TRAFFIC' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-secondary text-muted-foreground'}`}>Drive Traffic</button>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-indigo-900/40 to-card border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl sticky top-24">
                                    <h3 className="text-xl font-black text-foreground mb-6">Launch Settings</h3>
                                    <button onClick={handleLaunch} disabled={isLaunching || !selectedProduct} className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {isLaunching ? <><Loader2 className="size-5 animate-spin" /> Deploying...</> : <><Sparkles className="size-4" /> Launch Campaign</>}
                                    </button>
                                    <AnimatePresence>
                                        {isLaunching && launchStep && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-xs font-bold text-indigo-400 animate-pulse">
                                                {launchStep}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-foreground">Campaign Reports</h2>
                        </div>

                        {campaigns.length === 0 ? (
                            <div className="text-center py-20 bg-card border border-border rounded-[2.5rem]">
                                <BarChart3 className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-foreground mb-2">No Active Campaigns</h3>
                                <p className="text-muted-foreground text-sm">Create your first ad campaign to see realtime analytics here.</p>
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-secondary/30">
                                            <TableRow className="border-border/50 hover:bg-transparent">
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Campaign</TableHead>
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</TableHead>
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Spend</TableHead>
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Reach (Impr)</TableHead>
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Clicks</TableHead>
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Sales</TableHead>
                                                <TableHead className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-border/50">
                                            {campaigns.map((c) => (
                                                <TableRow key={c.id} className="hover:bg-secondary/30 transition-colors">
                                                    <TableCell className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-8 rounded-lg flex items-center justify-center ${c.platform === 'META' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                                {c.platform === 'META' ? <svg viewBox="0 0 36 36" className="size-4 fill-current"><path d="M15 15.65v4.71h-3.4v-4.71H8.62v-3.79h2.98v-2.47c0-2.46 1.18-6.31 6.31-6.31h4.63v3.68h-3.37c-1.12 0-2.18.57-2.18 2.39v2.71h5.36l-.75 3.79h-4.6V33h-3.4V15.65z"/></svg> : <Search className="size-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-foreground">{c.name}</p>
                                                                <p className="text-xs text-muted-foreground">Budget: Rs {c.budget}/day</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}>
                                                            {c.status === 'ACTIVE' && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                                            {c.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-mono text-sm">Rs {c.spend.toFixed(2)}</TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-mono text-sm">{c.impressions.toLocaleString()}</TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-mono text-sm">{c.clicks.toLocaleString()}</TableCell>
                                                    <TableCell className="px-6 py-4 text-right font-mono text-sm">{c.conversions.toLocaleString()}</TableCell>
                                                    <TableCell className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleToggleStatus(c.id, c.status)}
                                                            disabled={isPending}
                                                            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                                                            title={c.status === 'ACTIVE' ? 'Pause Campaign' : 'Resume Campaign'}
                                                        >
                                                            {c.status === 'ACTIVE' ? <Pause className="size-4" /> : <Play className="size-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(c.id)}
                                                            disabled={isPending}
                                                            className="p-2 ml-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all disabled:opacity-50"
                                                            title="Delete Campaign"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
