import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const userId = searchParams.get("state")

    if (!code || !userId) {
        return new NextResponse("Invalid request: Missing code or state", { status: 400 })
    }

    const clientId = process.env.META_CLIENT_ID
    const clientSecret = process.env.META_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/marketing/meta/callback`

    if (!clientId || !clientSecret) {
        return new NextResponse("Missing Meta App credentials in environment variables.", { status: 500 })
    }

    try {
        // Real exchange of code for access token
        const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`)
        
        const tokenData = await tokenRes.json()

        if (tokenData.error) {
            console.error("Meta OAuth Error:", tokenData.error)
            return new NextResponse(`Meta Error: ${tokenData.error.message}`, { status: 400 })
        }

        const accessToken = tokenData.access_token

        // In a full implementation, you would also fetch the ad account ID via the Graph API here.
        // For now, we save the real token securely to the DB.
        const store = await prisma.store.findFirst({ where: { ownerId: userId } })
        
        if (store) {
            await prisma.store.update({
                where: { id: store.id },
                data: { metaAccessToken: accessToken }
            })
        }

        // Redirect back to dashboard marketing page
        return NextResponse.redirect(new URL("/dashboard/marketing?connected=meta", request.url))
    } catch (e: any) {
        return new NextResponse(`Internal Error: ${e.message}`, { status: 500 })
    }
}
