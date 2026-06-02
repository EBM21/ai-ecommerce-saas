'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
                }
            }
        })

        if (!store) return { success: false, error: 'Store not found' }

        const products = store.products || []

        // ── 1. ACTUAL METRICS CALCULATION ──
        const totalProducts = products.length
        const activeProducts = products.filter(p => p.status === 'ACTIVE').length
        const draftProducts = products.filter(p => p.status === 'DRAFT').length
        const archivedProducts = products.filter(p => p.status === 'ARCHIVED').length

        const inventoryValue = products.reduce((acc, p) => acc + (Number(p.price) * p.inventoryCount), 0)
        const totalUnits = products.reduce((acc, p) => acc + p.inventoryCount, 0)
        const avgPrice = totalProducts > 0 ? (products.reduce((acc, p) => acc + Number(p.price), 0) / totalProducts) : 0
        const lowStockCount = products.filter(p => p.inventoryCount > 0 && p.inventoryCount < 10).length

        // ── 2. REAL CHART DATA (Last 7 Days Product Activity) ──
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        })

        const chartData = last7Days.map(date => {
            const countForDate = products.filter(p => p.createdAt.toISOString().split('T')[0] === date).length;
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                value: countForDate
            }
        })

        const recentProducts = products.slice(0, 4).map(p => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            status: p.status,
            timeAgo: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }))

        const metrics = {
            totalProducts, activeProducts, draftProducts, archivedProducts,
            inventoryValue, totalUnits, avgPrice, lowStockCount, chartData, recentProducts
        }

        // ── 3. GEMINI AI INTEGRATION ──
        let aiInsights = "Analyzing your inventory..."
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
            const prompt = `
        You are a business consultant for Quadlix stores. Store metrics:
        - Products: ${totalProducts} (Active: ${activeProducts}, Draft: ${draftProducts})
        - Total Inventory Value: $${inventoryValue}
        - Total Units in Stock: ${totalUnits}
        - Avg Product Price: $${avgPrice.toFixed(2)}
        - Items Low on Stock: ${lowStockCount}
        
        Write exactly 2 concise, professional sentences giving actionable advice. No greetings, just pure insights.
      `
            const result = await model.generateContent(prompt)
            aiInsights = result.response.text()
        } catch (aiError) {
            console.error("Gemini AI Error:", aiError)
            aiInsights = "Your inventory is being tracked accurately. Keep expanding your catalog to drive more value."
        }

        return { success: true, metrics, aiInsights }
    } catch (error: any) {
        return { success: false, error: 'Server error' }
    }
}