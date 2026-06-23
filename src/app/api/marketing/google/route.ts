import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    if (!clientId) {
        return new NextResponse(
            "Missing GOOGLE_ADS_CLIENT_ID in environment variables. Please configure your Google Cloud Console App first.", 
            { status: 500 }
        )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/marketing/google/callback`
    const scopes = "https://www.googleapis.com/auth/adwords"

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&access_type=offline&prompt=consent&state=${user.id}`

    return NextResponse.redirect(googleAuthUrl)
}
