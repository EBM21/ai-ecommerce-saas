import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    const clientId = process.env.META_CLIENT_ID
    if (!clientId) {
        return new NextResponse(
            "Missing META_CLIENT_ID in environment variables. Please configure your Meta Developer App first.", 
            { status: 500 }
        )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/marketing/meta/callback`
    const scopes = ["ads_management", "ads_read", "business_management"].join(",")

    const metaAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${user.id}`

    return NextResponse.redirect(metaAuthUrl)
}
