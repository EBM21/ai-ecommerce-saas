"use server"

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPaymentSettings() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        // Fetch recent payment proofs
        const paymentProofs = await prisma.order.findMany({
            where: {
                storeId: store.id,
                paymentMethod: 'BANK_TRANSFER',
                paymentScreenshot: { not: null }
            },
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return { 
            success: true, 
            bankDetails: store.bankDetails,
            paymentProofs: paymentProofs.map(p => ({
                id: p.id,
                displayId: `ORD-${p.id.slice(0, 8).toUpperCase()}`,
                amount: Number(p.totalAmount),
                screenshot: p.paymentScreenshot,
                date: p.createdAt.toISOString(),
                customerName: p.customer?.name || "Guest",
                status: p.status
            }))
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateBankDetails(bankDetails: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return { success: false, error: 'Unauthorized' }

        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) return { success: false, error: 'Store not found' }

        await prisma.store.update({
            where: { id: store.id },
            data: { bankDetails }
        })

        revalidatePath('/dashboard/payments')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
