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
    ARCHIVED: { bg: "bg-white/5", text: "text-white/40", dot: "bg-white/30", label: "Archived" },
}

export default function ProductsClient({ products = [] }: { products?: Product[] }) {
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
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Inventory</h1>
                    <p className="text-white/40 font-medium">Manage your catalog and monitor AI-optimized assets.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-all">
                        <Download className="size-4" /> Export CSV
                    </button>
                    <Link href="/dashboard/products/new">
                        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95">
                            <PlusCircle className="size-4" /> Create Product
                        </button>
                    </Link>
                </div>
            </div>

            {/* ── METRICS BAR ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-[#0a0a0c] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                        <BrainCircuit className="size-5 text-indigo-400" />
                    </div>
                    <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-white mb-1">{safeProducts.length}</p>
                    <p className="text-xs font-medium text-emerald-400">{activeCount} currently active</p>
                </div>

                <div className="p-6 rounded-[2rem] bg-[#0a0a0c] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c9a96e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="size-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center mb-4">
                        <Zap className="size-5 text-[#c9a96e]" />
                    </div>
                    <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Inventory Value</p>
                    <p className="text-3xl font-bold text-white mb-1">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs font-medium text-emerald-400">Estimated value</p>
                </div>

                <div className={`p-6 rounded-[2rem] relative overflow-hidden group ${lowStock > 0 ? "bg-rose-500/5 border border-rose-500/10" : "bg-[#0a0a0c] border border-white/5"}`}>
                    <div className={`size-10 rounded-xl flex items-center justify-center mb-4 ${lowStock > 0 ? "bg-rose-500/10" : "bg-white/5"}`}>
                        <Layers className={`size-5 ${lowStock > 0 ? "text-rose-400" : "text-white/40"}`} />
                    </div>
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${lowStock > 0 ? "text-rose-400/60" : "text-white/40"}`}>Attention Needed</p>
                    <p className="text-3xl font-bold text-white mb-1">{lowStock}</p>
                    <p className={`text-xs font-medium ${lowStock > 0 ? "text-rose-400" : "text-white/40"}`}>Items low on stock</p>
                </div>
            </div>

            {/* ── TABLE CARD ── */}
            <Card className="bg-[#0a0a0c]/80 backdrop-blur-xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="px-8 pt-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <CardTitle className="text-2xl font-bold text-white">Product Catalog</CardTitle>
                            <CardDescription className="text-white/40 mt-1">
                                {filtered.length} of {safeProducts.length} items showing
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
                            <div className="flex items-center p-1 rounded-xl bg-white/[0.02] border border-white/5">
                                {(["ALL", "ACTIVE", "DRAFT", "ARCHIVED"] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${filter === f
                                            ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                                            : "text-white/30 hover:text-white/60 border border-transparent"
                                            }`}
                                    >
                                        {f === "ALL" ? "All" : STATUS_STYLES[f]?.label ?? f}
                                    </button>
                                ))}
                            </div>

                            <div className="relative group w-full md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-11 h-11 bg-white/[0.02] border-white/5 rounded-xl text-sm text-white focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-0 pb-0">
                    <div className="overflow-x-auto min-h-[400px]">
                        <Table>
                            <TableHeader className="bg-white/[0.01]">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="w-[100px] px-8 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Image</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Product Details</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Price</TableHead>
                                    <TableHead className="hidden md:table-cell px-4 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest text-center">Stock</TableHead>
                                    <TableHead className="hidden md:table-cell px-4 py-5 text-[11px] font-bold text-white/40 uppercase tracking-widest">Added</TableHead>
                                    <TableHead className="px-8 py-5 text-right text-[11px] font-bold text-white/40 uppercase tracking-widest">Actions</TableHead>
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
                                                        <div className="size-20 rounded-[2rem] bg-white/[0.02] flex items-center justify-center border border-white/5">
                                                            <ImageIcon className="size-8 text-white/20" />
                                                        </div>
                                                        <Sparkles className="absolute -top-2 -right-2 size-6 text-indigo-400 animate-pulse" />
                                                    </div>
                                                    <h4 className="text-xl font-bold text-white mb-2">
                                                        {search ? "No Matches Found" : "Empty Catalog"}
                                                    </h4>
                                                    <p className="text-sm text-white/40 mb-8">
                                                        {search
                                                            ? `We couldn't find any products matching "${search}".`
                                                            : "Your inventory is currently empty. Add your first product to start generating revenue."}
                                                    </p>
                                                    {!search && (
                                                        <Link href="/dashboard/products/new">
                                                            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm shadow-xl hover:bg-neutral-200 transition-colors active:scale-95">
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
                                                    className="hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <TableCell className="px-8 py-4">
                                                        <div className="size-14 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                                            {imgUrl ? (
                                                                <img src={imgUrl} alt={product.title} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <Package className="size-5 text-white/10" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-4 max-w-[280px]">
                                                        <p className="font-bold text-white/90 text-[15px] truncate group-hover:text-white transition-colors">{product.title}</p>
                                                        {product.description && (
                                                            <p className="text-[13px] text-white/30 mt-1 truncate">{product.description}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-transparent ${style.bg} ${style.text}`}>
                                                            <span className={`size-1.5 rounded-full ${style.dot} animate-pulse`} />
                                                            {style.label}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-4">
                                                        <p className="font-bold text-white text-[15px]">${product.price.toFixed(2)}</p>
                                                        {product.compareAtPrice && (
                                                            <p className="text-[11px] text-white/20 line-through font-medium mt-0.5">${product.compareAtPrice.toFixed(2)}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell px-4 py-4 text-center">
                                                        <span className={`text-[15px] font-bold ${isLow ? "text-rose-400" : "text-white"}`}>
                                                            {product.inventoryCount}
                                                        </span>
                                                        {isLow && <p className="text-[10px] text-rose-400/60 font-bold uppercase mt-1 tracking-wider">Low</p>}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell px-4 py-4">
                                                        <p className="text-[13px] font-medium text-white/30">{addedAt}</p>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Link href={`/dashboard/products/${product.id}`}>
                                                                <button className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] text-white/40 hover:text-white transition-all">
                                                                    <Eye className="size-4" />
                                                                </button>
                                                            </Link>
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