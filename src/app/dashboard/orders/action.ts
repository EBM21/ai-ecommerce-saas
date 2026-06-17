'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function getOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // 1. User ka store find karein
        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) {
            return { success: false, error: 'Store not found' }
        }

        // 2. Orders fetch karein with relations (Customer + Items)
        const orders = await prisma.order.findMany({
            where: { storeId: store.id },
            include: {
                customer: true,    // Customer ki details k liye
                orderItems: true   // Total items count k liye
            },
            orderBy: { createdAt: 'desc' }
        })

        // Extract currency from themeConfig
        let currency = 'USD'
        if (store.themeConfig) {
            try {
                const theme = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
                currency = theme?.branding?.currency || 'USD'
            } catch (e) {}
        }

        // 3. Data ko serialize karein (Frontend k liye clean format)
        const formattedOrders = orders.map((order: any) => ({
            id: order.id,
            displayId: `ORD-${order.id.slice(0, 6).toUpperCase()}`,
            customerName: order.customer?.name || 'Guest User',
            customerEmail: order.customer?.email || 'No email',
            totalAmount: Number(order.totalAmount),
            status: order.status,
            itemsCount: order.orderItems.reduce((total: any, item: any) => total + item.quantity, 0),
            createdAt: order.createdAt.toISOString(),
            shippingAddress: order.shippingAddress
        }))

        return { success: true, data: formattedOrders, currency }
    } catch (error) {
        console.error("Orders fetch karne mein masla aya:", error)
        return { success: false, error: 'Failed to fetch orders' }
    }
}

export async function updateOrderStatus(orderId: string, status: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED') {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteOrder(orderId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        await prisma.order.delete({
            where: { id: orderId }
        })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getOrderDetails(orderId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: true,
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!order) return { success: false, error: 'Order not found' }

        return { 
            success: true, 
            data: {
                ...order,
                totalAmount: Number(order.totalAmount),
                orderItems: order.orderItems.map(item => ({
                    ...item,
                    priceAtPurchase: Number(item.priceAtPurchase),
                    productTitle: item.product.title
                }))
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}