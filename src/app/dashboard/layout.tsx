import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import DashboardShell from "./dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    try {
        // 1. Auth check
        const supabase = await createClient()
        const { data, error: authError } = await supabase.auth.getUser()

        if (authError || !data.user) {
            return redirect("/login")
        }

        const user = data.user

        // 2. Merchant check
        const store = await prisma.store.findFirst({
            where: { ownerId: user.id }
        })

        if (!store) {
            return redirect("/onboarding")
        }

        // 3. User is a merchant, show the shell
        return <DashboardShell>{children}</DashboardShell>
        
    } catch (error: any) {
        // ── IMPORTANT: Bubble up Next.js control flow errors ──
        if (
            error?.digest?.includes('NEXT_REDIRECT') || 
            error?.message?.includes('NEXT_REDIRECT') ||
            error?.digest === 'DYNAMIC_SERVER_USAGE' ||
            error?.message?.includes('Dynamic server usage')
        ) {
            throw error
        }
        
        console.error("CRITICAL: Dashboard Layout Failure", error)
        
        // Final fallback UI
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background text-foreground p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard Connection Error</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We couldn't establish a secure connection to your store dashboard. This usually happens due to a temporary database timeout.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all"
                    >
                        Try Reconnecting
                    </button>
                </div>
            </div>
        )
    }
}
