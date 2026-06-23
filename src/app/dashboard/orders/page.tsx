"use client"

import React, { useState, useEffect } from "react"
import {
    Search, Filter, Download, MoreHorizontal,
    Eye, Truck, CheckCircle2, Clock, XCircle, ArrowUpRight, Loader2, Package,
    ChevronDown, User, MapPin, Mail, Trash2, X, ExternalLink, ShoppingBag
} from "lucide-react"
import { getOrders, updateOrderStatus, deleteOrder, getOrderDetails } from "../orders/action"
import { toast } from "sonner"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [orders, setOrders] = useState<any[]>([])
    const [currency, setCurrency] = useState('USD')
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isFetchingDetails, setIsFetchingDetails] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const result = await getOrders()
        if (result.success && result.data) {
            setOrders(result.data)
            if (result.currency) setCurrency(result.currency)
        }
        setLoading(false)
    }

    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)

    const handleStatusUpdate = async (orderId: string, newStatus: any) => {
        setUpdatingId(orderId)
        const res = await updateOrderStatus(orderId, newStatus)
        if (res.success) {
            toast.success("Order status updated")
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus })
            }
        } else {
            toast.error("Failed to update status")
        }
        setUpdatingId(null)
    }

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order? This cannot be undone.")) return
        
        const res = await deleteOrder(orderId)
        if (res.success) {
            toast.success("Order deleted")
            setOrders(prev => prev.filter(o => o.id !== orderId))
            setIsDetailsOpen(false)
        } else {
            toast.error("Failed to delete order")
        }
    }

    const handleViewDetails = async (orderId: string) => {
        setIsFetchingDetails(true)
        setIsDetailsOpen(true)
        const res = await getOrderDetails(orderId)
        if (res.success) {
            setSelectedOrder(res.data)
        } else {
            toast.error("Failed to load order details")
            setIsDetailsOpen(false)
        }
        setIsFetchingDetails(false)
    }

    const handleEmailCustomer = (email: string) => {
        window.location.href = `mailto:${email}?subject=Update regarding your order`
    }

    const handleExport = () => {
        if (!orders || orders.length === 0) {
            toast.error("No orders to export")
            return
        }
        
        const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Status", "Items Count", "Total Amount"]
        const csvContent = [
            headers.join(","),
            ...orders.map(o => [
                o.displayId || o.id,
                `"${new Date(o.createdAt).toLocaleString()}"`,
                `"${o.customerName}"`,
                `"${o.customerEmail}"`,
                o.status,
                o.itemsCount,
                o.totalAmount
            ].join(","))
        ].join("\n")
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `orders_export.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const filteredOrders = orders.filter(order =>
        order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )

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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-1">Orders</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage and fulfill your customer orders efficiently.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/80 border border-border text-sm font-semibold text-foreground/90 hover:bg-secondary hover:text-foreground transition-all">
                        <Download className="size-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-foreground shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all">
                        Create Order <ArrowUpRight className="size-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", val: orders.length.toString(), sub: "All time" },
                    { label: "Pending Fulfillment", val: orders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length.toString(), sub: "Requires attention" },
                    { label: "Total Revenue", val: formatMoney(orders.reduce((acc, curr) => acc + curr.totalAmount, 0)), sub: "Generated so far" },
                    { label: "Fulfilled", val: orders.filter(o => o.status === 'FULFILLED').length.toString(), sub: "Successfully completed" },
                ].map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-card border border-border relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</div>
                        <div className="text-3xl font-bold text-foreground mb-1">{stat.val}</div>
                        <div className="text-xs font-medium text-emerald-400">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 bg-secondary/30">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/80 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 h-10 rounded-xl bg-secondary/80 border border-border text-sm font-semibold text-foreground/90 hover:bg-secondary hover:text-foreground transition-all shrink-0">
                        <Filter className="size-4" />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                            <Loader2 className="size-8 animate-spin mb-4 text-indigo-500" />
                            <p>Loading your orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                            <Package className="size-12 mb-4 opacity-20" />
                            <p>No orders found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-secondary/50 border-b border-border text-muted-foreground">
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
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-secondary/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span 
                                                onClick={() => handleViewDetails(order.id)}
                                                className="font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors cursor-pointer"
                                            >
                                                {order.displayId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-foreground/80">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{order.customerName}</span>
                                                <span className="text-xs text-muted-foreground">{order.customerEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {updatingId === order.id ? (
                                                <Loader2 className="size-4 animate-spin text-indigo-500" />
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="outline-none">
                                                        <StatusBadge status={order.status} />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="bg-card border-border rounded-xl shadow-2xl">
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PENDING')} className="text-xs font-bold uppercase tracking-widest text-amber-500 focus:bg-amber-500/10 cursor-pointer">Mark Pending</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PAID')} className="text-xs font-bold uppercase tracking-widest text-indigo-500 focus:bg-indigo-500/10 cursor-pointer">Mark Paid</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'FULFILLED')} className="text-xs font-bold uppercase tracking-widest text-emerald-500 focus:bg-emerald-500/10 cursor-pointer">Mark Fulfilled</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="text-xs font-bold uppercase tracking-widest text-rose-500 focus:bg-rose-500/10 cursor-pointer">Mark Cancelled</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-foreground/80">{order.itemsCount} items</td>
                                        <td className="px-6 py-4 font-semibold text-foreground">
                                            {formatMoney(order.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleViewDetails(order.id)}
                                                    className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all shadow-sm"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all shadow-sm outline-none">
                                                        <MoreHorizontal className="size-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card border-border rounded-xl shadow-2xl">
                                                        <DropdownMenuItem onClick={() => handleEmailCustomer(order.customerEmail)} className="text-xs font-bold gap-2 cursor-pointer focus:bg-secondary">
                                                            <Mail className="size-3.5" /> Email Customer
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleViewDetails(order.id)} className="text-xs font-bold gap-2 cursor-pointer focus:bg-secondary">
                                                            <MapPin className="size-3.5" /> View Details
                                                        </DropdownMenuItem>
                                                        <div className="h-px bg-border my-1" />
                                                        <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-xs font-bold gap-2 cursor-pointer text-rose-500 focus:bg-rose-500/10">
                                                            <Trash2 className="size-3.5" /> Delete Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <SheetContent className="w-full sm:max-w-xl bg-card border-l border-border overflow-y-auto">
                    <SheetHeader className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <Package className="size-6 text-indigo-500" />
                                    {selectedOrder?.id ? `ORD-${selectedOrder.id.slice(0, 8).toUpperCase()}` : "Order Details"}
                                </SheetTitle>
                                <SheetDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                    {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ""}
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {isFetchingDetails ? (
                        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="size-10 text-indigo-500 animate-spin" />
                            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Fetching records...</p>
                        </div>
                    ) : selectedOrder && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Order Status</p>
                                    <StatusBadge status={selectedOrder.status} />
                                </div>
                                <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Total Paid</p>
                                    <p className="font-black text-2xl text-foreground">{formatMoney(selectedOrder.totalAmount)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                                    <User className="size-3.5" /> Customer Identity
                                </h4>
                                <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500 text-lg">
                                            {selectedOrder.customer?.name?.[0] || "G"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{selectedOrder.customer?.name || "Guest"}</p>
                                            <p className="text-sm text-muted-foreground">{selectedOrder.customer?.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleEmailCustomer(selectedOrder.customer?.email)}
                                        className="w-full h-11 rounded-xl bg-secondary border border-border text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
                                    >
                                        <Mail className="size-4" /> Message Customer
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                                    <MapPin className="size-3.5" /> Delivery Address
                                </h4>
                                <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">
                                    <p className="text-sm font-medium text-foreground leading-relaxed">
                                        {selectedOrder.shippingAddress?.address || "No shipping address provided."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pb-10">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                                    <ShoppingBag className="size-3.5" /> Order Manifest
                                </h4>
                                <div className="space-y-3">
                                    {selectedOrder.orderItems?.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center border border-border">
                                                    <Package className="size-5 opacity-30" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{item.productTitle}</p>
                                                    {item.variantName && (
                                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{item.variantName}</p>
                                                    )}
                                                    <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} × {formatMoney(item.priceAtPurchase)}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm">{formatMoney(item.quantity * item.priceAtPurchase)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
