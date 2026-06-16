// src/app/(dashboard)/page.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // ── Store — ownerId (not userId) ──────────────────────────────────────────
  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
  })
  if (!store) redirect("/onboarding")

  // ── Date ranges ───────────────────────────────────────────────────────────
  let currency = "USD"
  if (store.themeConfig) {
      try {
          const raw = typeof store.themeConfig === 'string'
              ? JSON.parse(store.themeConfig as string)
              : store.themeConfig
          currency = raw.branding?.currency || "USD"
      } catch (e) { }
  }
  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(val)
  const formatMoneyNoDecimals = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val)

  const now = new Date()
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // ── Parallel queries ──────────────────────────────────────────────────────
  const [
    ordersThisMonth,
    ordersLastMonth,
    recentOrders,
    totalProducts,
    newProductsThisMonth,
    topProducts,
  ] = await Promise.all([

    // Orders this month
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: startThisMonth }, status: { in: ['PAID', 'FULFILLED'] } },
    }),

    // Orders last month
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: startLastMonth, lte: endLastMonth }, status: { in: ['PAID', 'FULFILLED'] } },
    }),

    // Recent 5 orders with items + product name
    prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        orderItems: {
          include: { product: true },
          take: 1,
        },
      },
    }),

    // Total products count
    prisma.product.count({ where: { storeId: store.id } }),

    // New products this month
    prisma.product.count({
      where: { storeId: store.id, createdAt: { gte: startThisMonth }, status: 'ACTIVE' },
    }),

    // Top products by sales
    prisma.product.findMany({
      where: { storeId: store.id },
      include: { orderItems: { where: { order: { status: { in: ['PAID', 'FULFILLED'] } } } } },
      orderBy: { orderItems: { _count: "desc" } },
      take: 4,
    }),
  ])

  // ── Revenue calculations ──────────────────────────────────────────────────
  const revThis = ordersThisMonth.reduce((s: number, o: any) => s + Number(o.totalAmount ?? 0), 0)
  const revLast = ordersLastMonth.reduce((s: number, o: any) => s + Number(o.totalAmount ?? 0), 0)
  const revDiff = revLast === 0 ? (revThis > 0 ? 100 : 0) : ((revThis - revLast) / revLast) * 100
  const ordDiff = ordersLastMonth.length === 0 ? (ordersThisMonth.length > 0 ? 100 : 0) : ((ordersThisMonth.length - ordersLastMonth.length) / ordersLastMonth.length) * 100
  const conv = totalProducts === 0 ? 0 : (ordersThisMonth.length / totalProducts) * 100

  // ── Monthly chart — last 12 months ────────────────────────────────────────
  const monthlyRaw = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
      const end = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 0)
      const rows = await prisma.order.findMany({
        where: { storeId: store.id, createdAt: { gte: start, lte: end }, status: { in: ['PAID', 'FULFILLED'] } },
      })
      return rows.reduce((s: number, o: any) => s + Number(o.totalAmount ?? 0), 0)
    })
  )
  const maxRev = Math.max(...monthlyRaw, 1)
  const chartData = monthlyRaw.map((v: number, i: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    const month = d.toLocaleString('default', { month: 'short' })
    return {
      height: Math.max(Math.round((v / maxRev) * 95), 4),
      value: formatMoney(v),
      month
    }
  })

  // ── Format recent orders ──────────────────────────────────────────────────
  const formattedOrders = recentOrders.map((o: any) => ({
    id: `#${o.id.slice(-4).toUpperCase()}`,
    customer: o.customerName ?? o.customerEmail ?? o.customer ?? "Unknown",
    product: o.orderItems?.[0]?.product?.title ?? "—", // name ki jagah title kiya
    amount: formatMoney(Number(o.totalAmount ?? 0)),
    status: o.status,
    time: timeAgo(o.createdAt),
  }))

  // ── Format top products ───────────────────────────────────────────────────
  const maxSales = Math.max(...topProducts.map((p: any) => p.orderItems.length), 1)
  const formattedTop = topProducts.map((p: any) => ({
    name: p.title, // Yahan bhi p.name ki jagah p.title aayega
    sales: p.orderItems.length,
    revenue: formatMoney(p.orderItems.reduce((s: number, oi: any) => s + Number(oi.priceAtPurchase ?? oi.price ?? oi.unitPrice ?? 0), 0)),
    pct: Math.max(Math.round((p.orderItems.length / maxSales) * 95), 4),
  }))

  return (
    <DashboardClient
      storeName={store.name}
      stats={{
        revenue: {
          value: formatMoneyNoDecimals(revThis),
          change: `${revDiff >= 0 ? "+" : ""}${revDiff.toFixed(1)}%`,
          up: revDiff >= 0,
        },
        orders: {
          value: ordersThisMonth.length.toLocaleString(),
          change: `${ordDiff >= 0 ? "+" : ""}${ordDiff.toFixed(1)}%`,
          up: ordDiff >= 0,
        },
        products: {
          value: totalProducts.toLocaleString(),
          change: `+${newProductsThisMonth} this month`,
          up: true,
        },
        conversion: {
          value: `${conv.toFixed(2)}%`,
          change: "this month",
          up: true,
        },
      }}
      chartData={chartData}
      recentOrders={formattedOrders}
      topProducts={formattedTop}
    />
  )
}

// ── Helper ────────────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}