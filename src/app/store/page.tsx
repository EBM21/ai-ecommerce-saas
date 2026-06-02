import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"

export default async function StoreRedirectPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // User ka store find karein
    const store = await prisma.store.findFirst({
        where: { ownerId: user.id }
    })

    // Agar store hai tou uske subdomain par redirect kar dein
    if (store && store.subdomain) {
        redirect(`/${store.subdomain}`)
    }

    // Agar store nahi hai tou wapis dashboard (ya create store page) par bhej dein
    redirect("/dashboard/settings") // Ya jahan aap store create karwate hain
}