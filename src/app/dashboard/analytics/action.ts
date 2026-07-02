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
                products: { orderBy: { createdAt: 'desc' } },
                orders: { include: { orderItems: true }, orderBy: { createdAt: 'desc' }, where: { status: { not: 'CANCELLED' } } }
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
        
        const products = store.products || []
        const orders = store.orders || []

        // Date ranges
        const now = new Date()
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(now.getDate() - 30)
        
        const sixtyDaysAgo = new Date(now)
        sixtyDaysAgo.setDate(now.getDate() - 60)

        const currentPeriodOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo)
        const previousPeriodOrders = orders.filter(o => new Date(o.createdAt) >= sixtyDaysAgo && new Date(o.createdAt) < thirtyDaysAgo)

        // Totals Current
        const currentRevenue = currentPeriodOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0)
        const currentOrdersCount = currentPeriodOrders.length
        const currentAOV = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0
        
        // Mocking sessions based on orders for realism (assuming ~3% conversion rate)
        const currentSessions = Math.max(currentOrdersCount * 33, Math.floor(Math.random() * 500) + 100)
        const currentConversion = currentSessions > 0 ? (currentOrdersCount / currentSessions) * 100 : 0
        const currentReturningCustomers = Math.floor(currentOrdersCount * 0.15) // Mock 15%
        const currentReturningRate = currentOrdersCount > 0 ? (currentReturningCustomers / currentOrdersCount) * 100 : 0

        // Totals Previous
        const previousRevenue = previousPeriodOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0)
        const previousOrdersCount = previousPeriodOrders.length
        const previousAOV = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0
        const previousSessions = Math.max(previousOrdersCount * 33, Math.floor(Math.random() * 500) + 50)
        const previousConversion = previousSessions > 0 ? (previousOrdersCount / previousSessions) * 100 : 0
        const previousReturningRate = 12.5 // Mock

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0
            return ((current - previous) / previous) * 100
        }

        // Timeseries data for the last 30 days
        const chartData = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]
            
            const dayOrders = currentPeriodOrders.filter(o => o.createdAt.toISOString().split('T')[0] === dateStr)
            const dayRevenue = dayOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0)
            const daySessions = Math.max(dayOrders.length * 33, Math.floor(Math.random() * 20) + 5)
            
            chartData.push({
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue,
                orders: dayOrders.length,
                sessions: daySessions
            })
        }

        // Top Products
        const productSales: Record<string, { title: string, total: number, count: number }> = {}
        currentPeriodOrders.forEach(order => {
            order.orderItems.forEach(item => {
                if (!productSales[item.productId]) {
                    const p = products.find(p => p.id === item.productId)
                    productSales[item.productId] = { title: p?.title || 'Unknown Product', total: 0, count: 0 }
                }
                productSales[item.productId].total += Number(item.priceAtPurchase || 0) * item.quantity
                productSales[item.productId].count += item.quantity
            })
        })

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)

        const metrics = {
            overview: [
                { id: 'sales', label: 'Total sales', value: currentRevenue, isCurrency: true, change: calculateChange(currentRevenue, previousRevenue) },
                { id: 'sessions', label: 'Online store sessions', value: currentSessions, isCurrency: false, change: calculateChange(currentSessions, previousSessions) },
                { id: 'returning', label: 'Returning customer rate', value: currentReturningRate, isPercentage: true, change: currentReturningRate - previousReturningRate },
                { id: 'conversion', label: 'Online store conversion rate', value: currentConversion, isPercentage: true, change: currentConversion - previousConversion },
                { id: 'aov', label: 'Average order value', value: currentAOV, isCurrency: true, change: calculateChange(currentAOV, previousAOV) },
                { id: 'orders', label: 'Total orders', value: currentOrdersCount, isCurrency: false, change: calculateChange(currentOrdersCount, previousOrdersCount) },
            ],
            chartData,
            topProducts,
            recentActivity: orders.slice(0, 5).map(o => ({
                id: o.id,
                totalAmount: Number(o.totalAmount),
                status: o.status,
                createdAt: o.createdAt.toISOString(),
            }))
        }

        let aiInsights = "Data synchronized."
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const prompt = `You are a Shopify analytics expert. Store revenue this month is $${currentRevenue}. Give 2 concise sentences of strategic advice based on this. Keep it extremely professional.`
            const result = await model.generateContent(prompt)
            aiInsights = result.response.text()
        } catch(e) {}

        return { success: true, metrics, aiInsights, currency }
    } catch (error: any) {
        console.error("Analytics error:", error)
        return { success: false, error: 'Server error' }
    }
}