'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

export async function getAnalyticsData() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id },
            include: {
                products: {
                    orderBy: { createdAt: 'desc' }
                },
                orders: {
                    include: { orderItems: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!store) return { success: false, error: 'Store not found' }

        let currency = "USD"
        if (store.themeConfig) {
            try {
                const raw = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
                currency = raw.branding?.currency || "USD"
            } catch (e) { }
        }
        const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(val)
        
        const products = store.products || []
        const orders = store.orders || []

        // ── 1. ACTUAL METRICS CALCULATION ──
        const totalProducts = products.length
        const activeProducts = products.filter(p => p.status === 'ACTIVE').length
        
        // Sales Metrics
        const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'FULFILLED')
        const totalRevenue = paidOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0)
        const totalOrders = paidOrders.length
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0
        const lowStockCount = products.filter(p => p.inventoryCount > 0 && p.inventoryCount < 10).length

        // ── 2. REAL CHART DATA (Last 7 Days Revenue Trend) ──
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        })

        const chartData = last7Days.map(date => {
            const revenueForDate = paidOrders
                .filter(o => o.createdAt.toISOString().split('T')[0] === date)
                .reduce((acc, o) => acc + Number(o.totalAmount), 0);
            
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                value: revenueForDate
            }
        })

        // Market Leaders (Top 4 Products)
        const productSales: Record<string, { title: string, total: number, count: number }> = {}
        paidOrders.forEach(order => {
            order.orderItems.forEach(item => {
                if (!productSales[item.productId]) {
                    const p = products.find(p => p.id === item.productId)
                    productSales[item.productId] = { title: p?.title || 'Unknown', total: 0, count: 0 }
                }
                productSales[item.productId].total += Number(item.priceAtPurchase) * item.quantity
                productSales[item.productId].count += item.quantity
            })
        })

        const marketLeaders = Object.values(productSales)
            .sort((a, b) => b.total - a.total)
            .slice(0, 4)
            .map(p => ({
                title: p.title,
                sales: p.count,
                revenue: formatMoney(p.total),
                pct: Math.min(100, (p.total / (totalRevenue || 1)) * 100)
            }))

        const metrics = {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            activeProducts,
            lowStockCount,
            chartData,
            marketLeaders,
            recentOrders: orders.slice(0, 5).map(o => ({
                id: o.id.slice(-8).toUpperCase(),
                customer: 'Customer', // Would fetch actual customer name in real app
                status: o.status,
                amount: formatMoney(Number(o.totalAmount))
            }))
        }

        // ── 3. GEMINI AI INTEGRATION ──
        let aiInsights = "Analyzing your sales data..."
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const prompt = `
        You are a business consultant for Quadlix stores. Store metrics:
        - Total Revenue: ${formatMoney(totalRevenue)}
        - Total Orders: ${totalOrders}
        - Avg Order Value: ${formatMoney(avgOrderValue)}
        - Active Products: ${activeProducts}
        - Items Low on Stock: ${lowStockCount}
        
        Write exactly 2 concise, professional sentences giving actionable advice to increase revenue or optimize inventory based on these numbers. No greetings, just pure insights.
      `
            const result = await model.generateContent(prompt)
            aiInsights = result.response.text()
        } catch (aiError) {
            console.error("Gemini AI Error:", aiError)
            aiInsights = "Your sales are being tracked accurately. Focus on replenishing low-stock items to maintain momentum."
        }

        return { success: true, metrics, aiInsights, currency }
    } catch (error: any) {
        console.error("Analytics error:", error)
        return { success: false, error: 'Server error' }
    }
}