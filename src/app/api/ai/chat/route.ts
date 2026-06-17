import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(req: Request) {
    try {
        const { messages, storeId, domain } = await req.json()
        
        // 1. Fetch store and products to give context to AI
        const store = await prisma.store.findFirst({
            where: { OR: [{ subdomain: domain }, { customDomain: domain }] },
            select: { 
                name: true, 
                email: true, 
                themeConfig: true,
                products: {
                    where: { status: 'ACTIVE' },
                    select: { title: true, price: true, description: true, id: true }
                }
            }
        })

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        let currency = 'USD'
        if (store.themeConfig) {
            try {
                const theme = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
                currency = theme?.branding?.currency || 'USD'
            } catch (e) {}
        }

        const productContext = store.products.map(p => {
            const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(p.price))
            return `- ${p.title}: ${formattedPrice}. ${p.description?.substring(0, 100)}... (Link: /${domain}/product/${p.id})`
        }).join("\n")

        const systemPrompt = `
            You are a helpful, professional AI Sales Assistant for "${store.name}".
            Your goal is to help customers find products and answer questions about the store.
            
            AVAILABLE PRODUCTS:
            ${productContext}
            
            GUIDELINES:
            - Be concise and friendly.
            - If a customer asks about a product, recommend from the list above and provide the link.
            - If you don't know the answer, politely ask them to contact the store at ${store.email || 'their support email'}.
            - Keep responses under 3 sentences unless explaining multiple products.
        `

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        
        // Map conversation history
        const formattedHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am now the sales assistant for " + store.name }] }
        ]

        // Add previous messages (excluding the last one which is the new input)
        for (let i = 0; i < messages.length - 1; i++) {
            formattedHistory.push({
                role: messages[i].role === 'user' ? 'user' : 'model',
                parts: [{ text: messages[i].content }]
            })
        }

        const chat = model.startChat({
            history: formattedHistory
        })

        const lastMessage = messages[messages.length - 1].content
        const result = await chat.sendMessage(lastMessage)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({ text })

    } catch (error: any) {
        console.error("Chat Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
