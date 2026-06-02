"use client"

import React, { useState, useEffect } from "react"
import {
    Search, Filter, Download, MoreHorizontal,
    Eye, Truck, CheckCircle2, Clock, XCircle, ArrowUpRight, Loader2, Package
} from "lucide-react"
import { getOrders } from "../orders/action"

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const result = await getOrders()
            if (result.success && result.data) {
                setOrders(result.data)
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const filteredOrders = orders.filter(order =>
        order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Aapke Prisma Enums k mutabiq Status Badge
    const StatusBadge = ({ status }: { status: string }) => {
        const styles: Record<string, string> = {
            FULFILLED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            PAID: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
            PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        }

        const Icons: Record<string, any> = {
            FULFILLED: CheckCircle2,
            PAID: Truck,
            PENDING: Clock,
            CANCELLED: XCircle,
        }

        const Icon = Icons[status] || Clock

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${styles[status] || styles.PENDING}`}>
                <Icon className="size-3" />
                {status}
            </div>
        )
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">Orders</h1>
                    <p className="text-sm text-white/50 font-medium">Manage and fulfill your customer orders efficiently.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-all">
                        <Download className="size-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all">
                        Create Order <ArrowUpRight className="size-4" />
                    </button>
                </div>
            </div>

            {/* ── METRICS BAR ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", val: orders.length.toString(), sub: "All time" },
                    { label: "Pending Fulfillment", val: orders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length.toString(), sub: "Requires attention" },
                    { label: "Total Revenue", val: `$${orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}`, sub: "Generated so far" },
                    { label: "Fulfilled", val: orders.filter(o => o.status === 'FULFILLED').length.toString(), sub: "Successfully completed" },
                ].map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2">{stat.label}</div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.val}</div>
                        <div className="text-xs font-medium text-emerald-400">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── TABLE SECTION ── */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c] overflow-hidden flex flex-col">

                <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center gap-4 bg-white/[0.01]">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 h-10 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-all shrink-0">
                        <Filter className="size-4" />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-white/40">
                            <Loader2 className="size-8 animate-spin mb-4 text-indigo-500" />
                            <p>Loading your orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-white/40">
                            <Package className="size-12 mb-4 opacity-20" />
                            <p>No orders found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/[0.02] border-b border-white/10 text-white/40">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order ID</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Items</th>
                                    <th className="px-6 py-4 font-semibold">Total</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-indigo-300 group-hover:text-indigo-400 transition-colors cursor-pointer">
                                                {order.displayId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/60">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{order.customerName}</span>
                                                <span className="text-xs text-white/40">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-white/60">{order.itemsCount} items</td>
                                        <td className="px-6 py-4 font-semibold text-white">
                                            ${order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                                    <Eye className="size-4" />
                                                </button>
                                                <button className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                                    <MoreHorizontal className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}