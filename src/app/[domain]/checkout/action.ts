"use server"

import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { z } from 'zod'

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Invalid product ID'),
  variantId: z.string().optional().nullable(),
  variantName: z.string().optional().nullable(),
  quantity: z.preprocess((val) => typeof val === 'string' ? parseInt(val, 10) : val, z.number().int().positive('Quantity must be greater than 0')),
  price: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number().min(0, 'Price cannot be negative')),
  title: z.string().min(1, 'Product title is required'),
})

const placeOrderSchema = z.object({
  storeId: z.string().min(1, 'Invalid store ID'),
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  totalAmount: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number().min(0, 'Total amount cannot be negative')),
  address: z.string().min(1, 'Address is required'),
  baseUrl: z.string().optional(),
  domain: z.string().min(1, 'Domain is required').optional(),
  paymentMethod: z.string().default('COD'),
  paymentScreenshot: z.string().optional().nullable(),
  items: z.array(orderItemSchema).nonempty('Order must contain at least one item'),
})

import { createClient } from "@/utils/supabase/server"

export async function placeOrder(orderData: any) {
    try {
        const validated = placeOrderSchema.safeParse(orderData)
        if (!validated.success) {
            return { success: false, error: validated.error.issues.map((err: any) => err.message).join(', ') }
        }
        const data = validated.data

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const store = await prisma.store.findUnique({
            where: { id: data.storeId }
        })

        if (!store) {
            return { success: false, error: "Store not found" }
        }

        // If checking out with dummy product, simulate success
        if (data.items.some(item => item.productId === 'dummy')) {
            return { success: true, orderId: "dummy-order-" + Date.now() }
        }

        // 1 & 2. Find/create customer and create order in a single transaction
        const { order } = await prisma.$transaction(async (tx) => {
            let customer = await tx.customer.findUnique({
                where: {
                    storeId_email: {
                        storeId: data.storeId,
                        email: data.customerEmail
                    }
                }
            })

            if (!customer) {
                customer = await tx.customer.create({
                    data: {
                        storeId: data.storeId,
                        email: data.customerEmail,
                        name: data.customerName,
                        phone: data.phone,
                        userId: user?.id || null
                    }
                })
            } else {
                customer = await tx.customer.update({
                    where: { id: customer.id },
                    data: { 
                        userId: (!customer.userId && user) ? user.id : customer.userId, 
                        name: data.customerName,
                        phone: data.phone
                    }
                })
            }

            const order = await tx.order.create({
                data: {
                    storeId: data.storeId,
                    customerId: customer.id,
                    totalAmount: data.totalAmount,
                    status: "PENDING",
                    paymentMethod: data.paymentMethod,
                    paymentScreenshot: data.paymentScreenshot,
                    shippingAddress: { address: data.address },
                    orderItems: {
                        create: data.items.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId || null,
                            variantName: item.variantName || null,
                            quantity: item.quantity,
                            priceAtPurchase: item.price
                        }))
                    }
                }
            })

            return { customer, order }
        })

        // 3. Initiate Payment (Stripe) only if paymentMethod is STRIPE and store has Stripe keys
        if (data.paymentMethod !== 'STRIPE') {
            return { success: true, orderId: order.id }
        }

        if (store.stripeSecretKey) {
            try {
                const stripe = new Stripe(store.stripeSecretKey, {
                    apiVersion: "2024-06-20" as any // Use latest or known version
                })

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ["card"],
                    mode: "payment",
                    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${data.baseUrl || '/'}?success=true`,
                    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${data.baseUrl || ''}/checkout?canceled=true`,
                    customer_email: data.customerEmail,
                    client_reference_id: order.id,
                    line_items: data.items.map((item) => ({
                        price_data: {
                            currency: "usd", // default to USD
                            product_data: {
                                name: `${item.title}${item.variantName ? ` (${item.variantName})` : ''}`,
                            },
                            unit_amount: Math.round(item.price * 100), // Stripe expects cents
                        },
                        quantity: item.quantity,
                    })),
                })

                // Update order with payment intent / session id
                await prisma.order.update({
                    where: { id: order.id },
                    data: { stripePaymentIntentId: session.id }
                })

                return { success: true, url: session.url }
            } catch (stripeError: any) {
                console.error("Stripe session creation failed, marking order as cancelled:", stripeError)
                await prisma.order.update({
                    where: { id: order.id },
                    data: { status: "CANCELLED" }
                })
                return { success: false, error: "Payment setup failed: " + stripeError.message }
            }
        }

        return { success: true, orderId: order.id }
    } catch (e: any) {
        console.error("Order creation failed:", e)
        return { success: false, error: e.message }
    }
}
