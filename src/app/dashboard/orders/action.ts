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

        // 3. Data ko serialize karein (Frontend k liye clean format)
        const formattedOrders = orders.map((order: { id: string; customer: { name: any; email: any }; totalAmount: any; status: any; orderItems: any[]; createdAt: { toISOString: () => any } }) => ({
            id: order.id,
            // UUID lamba hota hai, UI k liye chota display ID bana rahe hain
            displayId: `ORD-${order.id.slice(0, 6).toUpperCase()}`,
            customerName: order.customer?.name || 'Guest User',
            customerEmail: order.customer?.email || 'No email',
            totalAmount: Number(order.totalAmount), // Decimal ko Number mein convert kiya
            status: order.status, // PENDING, PAID, FULFILLED, CANCELLED
            // Har item ki quantity ko sum kar rahay hain
            itemsCount: order.orderItems.reduce((total: any, item: { quantity: any }) => total + item.quantity, 0),
            createdAt: order.createdAt.toISOString()
        }))

        return { success: true, data: formattedOrders }
    } catch (error) {
        console.error("Orders fetch karne mein masla aya:", error)
        return { success: false, error: 'Failed to fetch orders' }
    }
}