import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import DashboardShell from "./dashboard-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // 1. Auth check
    const supabase = await createClient()
    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data.user) {
        redirect("/login")
    }

    const user = data.user

    // 2. Merchant check
    const store = await prisma.store.findFirst({
        where: { ownerId: user.id }
    })

    if (!store) {
        redirect("/onboarding")
    }

    let dbUser = null
    let lowStockProducts: any[] = []
    let hasError = false

    try {
        // 3. User is a merchant, show the shell
        dbUser = await prisma.user.findUnique({ where: { id: user.id } })

        // 4. Notifications (Low Stock)
        lowStockProducts = await prisma.product.findMany({
            where: { storeId: store.id, inventoryCount: { lt: 10 } },
            select: { id: true, title: true, inventoryCount: true },
            orderBy: { inventoryCount: 'asc' }
        })
    } catch (error: any) {
        console.error("CRITICAL: Dashboard Layout Failure", error)
        hasError = true
    }

    if (hasError) {
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
                    <a 
                        href="/dashboard"
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all text-center inline-block"
                    >
                        Try Reconnecting
                    </a>
                </div>
            </div>
        )
    }

    return <DashboardShell user={dbUser || undefined} lowStockProducts={lowStockProducts}>{children}</DashboardShell>
}
