import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const userId = searchParams.get("state")

    if (!code || !userId) {
        return new NextResponse("Invalid request: Missing code or state", { status: 400 })
    }

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/marketing/google/callback`

    if (!clientId || !clientSecret) {
        return new NextResponse("Missing Google App credentials in environment variables.", { status: 500 })
    }

    try {
        // Real exchange of code for access token
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code"
            })
        })
        
        const tokenData = await tokenRes.json()

        if (tokenData.error) {
            console.error("Google OAuth Error:", tokenData.error)
            return new NextResponse(`Google Error: ${tokenData.error_description || tokenData.error}`, { status: 400 })
        }

        const accessToken = tokenData.access_token
        const refreshToken = tokenData.refresh_token

        const store = await prisma.store.findFirst({ where: { ownerId: userId } })
        
        if (store) {
            await prisma.store.update({
                where: { id: store.id },
                data: { 
                    googleAdsToken: accessToken,
                    googleAdsRefreshToken: refreshToken
                }
            })
        }

        // Redirect back to dashboard marketing page
        return NextResponse.redirect(new URL("/dashboard/marketing?connected=google", request.url))
    } catch (e: any) {
        return new NextResponse(`Internal Error: ${e.message}`, { status: 500 })
    }
}
