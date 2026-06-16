import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import Stripe from "stripe"
import { headers } from "next/headers"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    try {
        // We need to find the store first to get the correct secret key
        // However, standard Stripe Webhooks use a single signing secret.
        // For a Multi-tenant SaaS with custom keys, you usually use a Platform Secret
        // or look up the tenant by the Stripe Account ID in the metadata.
        
        // For this MVP, we will use a global STRIPE_WEBHOOK_SECRET
        // but we'll extract the storeId from the session metadata to know which DB record to update.
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
            apiVersion: "2024-06-20" as any
        })

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        )

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session
            
            // ── Case A: SaaS Merchant Upgrade (Subscription) ──
            if (session.mode === "subscription" && session.metadata?.storeId) {
                const storeId = session.metadata.storeId
                await prisma.store.update({
                    where: { id: storeId },
                    data: { 
                        subscriptionActive: true,
                        plan: "pro",
                        trialEndsAt: null // Trial is over once subscribed
                    }
                })
                console.log(`🚀 Store ${storeId} upgraded to PRO via Webhook.`)
            } 
            
            // ── Case B: Storefront Customer Checkout (One-time Payment) ──
            else {
                const orderId = session.client_reference_id
                if (orderId) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { 
                            status: "PAID",
                            stripePaymentIntentId: session.payment_intent as string
                        }
                    })
                    console.log(`✅ Order ${orderId} marked as PAID via Webhook.`)
                }
            }
        }

        return NextResponse.json({ received: true }, { status: 200 })

    } catch (err: any) {
        console.error(`❌ Webhook Error: ${err.message}`)
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }
}
