"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    PlusCircle, Sparkles, Search, Download,
    Layers, Zap, ImageIcon, BrainCircuit, Package,
    Eye, Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getStoreUrl } from "@/lib/utils"

type Product = {
    id: string
    title: string
    description: string
    price: number
    compareAtPrice: number | null
    inventoryCount: number
    status: string
    images: { raw?: string; enhanced?: string } | null
    createdAt: string
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ACTIVE: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400", label: "Active" },
    DRAFT: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400", label: "Draft" },
    ARCHIVED: { bg: "bg-secondary", text: "text-muted-foreground", dot: "bg-white/30", label: "Archived" },
}

export default function ProductsClient({ products = [], domain = "", currency = "USD" }: { products?: Product[], domain?: string, currency?: string }) {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "ARCHIVED">("ALL")

    const safeProducts = Array.isArray(products) ? products : []

    const filtered = safeProducts.filter(p => {
        const matchSearch = p?.title?.toLowerCase().includes(search.toLowerCase()) || false
        const matchFilter = filter === "ALL" || p?.status === filter
        return matchSearch && matchFilter
    })

    const totalValue = safeProducts.reduce((s, p) => s + ((p?.price || 0) * (p?.inventoryCount || 0)), 0)
    const activeCount = safeProducts.filter(p => p?.status === "ACTIVE").length
    const lowStock = safeProducts.filter(p => (p?.inventoryCount || 0) > 0 && (p?.inventoryCount || 0) < 10).length

    const handleExport = () => {
        if (!safeProducts || safeProducts.length === 0) {
            alert("No products to export.")
            return
        }
        
        const headers = ["Product ID", "Title", "Description", "Price", "Compare At Price", "Inventory Count", "Status", "Created At"]
        const csvContent = [
            headers.join(","),
            ...safeProducts.map(p => [
                p.id,
                `"${(p.title || "").replace(/"/g, '""')}"`,
                `"${(p.description || "").replace(/"/g, '""')}"`,
                p.price,
                p.compareAtPrice || "",
                p.inventoryCount,
                p.status,
                `"${new Date(p.createdAt).toLocaleString()}"`
            ].join(","))
        ].join("\n")
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `products_export.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 w-full max-w-7xl mx-auto"
        >
            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Inventory</h1>
                    <p className="text-muted-foreground font-medium">Manage your catalog and monitor AI-optimized assets.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/80 border border-border text-sm font-semibold text-foreground/90 hover:bg-secondary hover:text-foreground transition-all">
                        <Download className="size-4" /> Export CSV
                    </button>
                    <Link href="/dashboard/products/new">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-bold text-foreground shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95">
                            <PlusCircle className="size-4" /> Create Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* ── METRICS BAR ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-card border border-border/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                        <BrainCircuit className="size-5 text-indigo-400" />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-foreground mb-1">{safeProducts.length}</p>
                    <p className="text-xs font-medium text-emerald-400">{activeCount} currently active</p>
                </div>

                <div className="p-6 rounded-[2rem] bg-card border border-border/50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c9a96e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="size-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center mb-4">
                        <Zap className="size-5 text-[#c9a96e]" />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Inventory Value</p>
                    <p className="text-3xl font-bold text-foreground mb-1">{new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(totalValue)}</p>
                    <p className="text-xs font-medium text-emerald-400">Estimated value</p>
                </div>

                <div className={`p-6 rounded-[2rem] relative overflow-hidden group ${lowStock > 0 ? "bg-rose-500/5 border border-rose-500/10" : "bg-card border border-border/50"}`}>
                    <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${lowStock > 0 ? "bg-rose-500/10" : "bg-secondary"}`}>
                        <Layers className={`size-5 ${lowStock > 0 ? "text-rose-400" : "text-muted-foreground"}`} />
                    </div>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${lowStock > 0 ? "text-rose-400/60" : "text-muted-foreground"}`}>Attention Needed</p>
                    <p className="text-3xl font-bold text-foreground mb-1">{lowStock}</p>
                    <p className={`text-xs font-medium ${lowStock > 0 ? "text-rose-400" : "text-muted-foreground"}`}>Items low on stock</p>
                </div>
            </div>

            {/* ── TABLE CARD ── */}
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="px-8 pt-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-bold text-foreground">Product Catalog</CardTitle>
                            <CardDescription className="text-muted-foreground mt-1">
                                {filtered.length} of {safeProducts.length} items showing
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
                            <div className="flex items-center p-1 rounded-xl bg-secondary/50 border border-border/50">
                                {(["ALL", "ACTIVE", "DRAFT", "ARCHIVED"] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${filter === f
                                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                                            : "text-muted-foreground/60 hover:text-foreground/80 border border-transparent"
                                            }`}
                                    >
                                        {f === "ALL" ? "All" : STATUS_STYLES[f]?.label ?? f}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group w-full md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl text-sm text-foreground focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-0 pb-0">
                    <div className="overflow-x-auto min-h-[400px]">
                        <Table>
                            <TableHeader className="bg-secondary/30">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="w-[100px] px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Image</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Product Details</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Price</TableHead>
                                    <TableHead className="hidden md:table-cell px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Stock</TableHead>
                                    <TableHead className="hidden md:table-cell px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Added</TableHead>
                                    <TableHead className="px-8 py-5 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filtered.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={7} className="py-32 text-center">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex flex-col items-center justify-center max-w-sm mx-auto"
                                                >
                                                    <div className="relative mb-6">
                                                        <div className="size-20 rounded-[2rem] bg-secondary/50 flex items-center justify-center border border-border/50">
                                                            <ImageIcon className="size-8 text-foreground/20" />
                                                        </div>
                                                        <Sparkles className="absolute -top-2 -right-2 size-6 text-indigo-400 animate-pulse" />
                                                    </div>
                                                    <h4 className="text-xl font-bold text-foreground mb-2">
                                                        {search ? "No Matches Found" : "Empty Catalog"}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground mb-8">
                                                        {search
                                                            ? `We couldn't find any products matching "${search}".`
                                                            : "Your inventory is currently empty. Add your first product to start generating revenue."}
                                                    </p>
                                                    {!search && (
                                                        <Link href="/dashboard/products/new">
                                                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95">
                                                                <PlusCircle className="size-4" /> Create First Product
                                                            </button>
                                                        </Link>
                                                    )}
                                                </motion.div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((product, i) => {
                                            const style = STATUS_STYLES[product.status] ?? STATUS_STYLES.DRAFT
                                            const imgUrl = product.images?.enhanced || product.images?.raw
                                            const isLow = product.inventoryCount < 10
                                            const addedAt = new Date(product.createdAt).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric"
                                            })

                                            return (
                                                <motion.tr
                                                    key={product.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    className="hover:bg-secondary/50 transition-colors group"
                                                >
                                                    <TableCell className="px-8 py-4">
                                                        <div className="size-14 rounded-2xl overflow-hidden bg-secondary/50 border border-border/50 flex items-center justify-center">
                                                            {imgUrl ? (
                                                                <img src={imgUrl} alt={product.title} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <Package className="size-5 text-foreground/10" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-4 max-w-[280px]">
                                                        <p className="font-bold text-foreground/90 text-[15px] truncate group-hover:text-foreground transition-colors">{product.title}</p>
                                                        {product.description && (
                                                            <p className="text-[13px] text-muted-foreground/60 mt-1 truncate">{product.description}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-transparent ${style.bg} ${style.text}`}>
                                                            <span className={`size-1.5 rounded-full ${style.dot} animate-pulse`} />
                                                            {style.label}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-4">
                                                        <p className="font-bold text-foreground text-[15px]">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(product.price)}</p>
                                                        {product.compareAtPrice && (
                                                            <p className="text-[11px] text-foreground/20 line-through font-medium mt-0.5">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(product.compareAtPrice)}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell px-4 py-4 text-center">
                                                        <span className={`text-[15px] font-bold ${isLow ? "text-rose-400" : "text-foreground"}`}>
                                                            {product.inventoryCount}
                                                        </span>
                                                        {isLow && <p className="text-[10px] text-rose-400/60 font-bold uppercase mt-1 tracking-wider">Low</p>}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell px-4 py-4">
                                                        <p className="text-[13px] font-medium text-muted-foreground/60">{addedAt}</p>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <a href={getStoreUrl(domain, `/product/${product.id}`)} target="_blank" rel="noopener noreferrer">
                                                                <button className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                                                                    <Eye className="size-4" />
                                                                </button>
                                                            </a>
                                                            <Link href={`/dashboard/products/${product.id}/edit`}>
                                                                <button className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400/70 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30">
                                                                    <Pencil className="size-4" />
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            )
                                        })
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}