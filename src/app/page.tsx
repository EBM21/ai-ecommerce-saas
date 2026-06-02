import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import LandingPage from "./landing"

// ✅ Yeh line add karo — page ko dynamic banao
export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const store = await prisma.store.findFirst({ where: { ownerId: user.id } })
    if (!store) redirect("/onboarding")
    redirect("/dashboard")
  }

  return <LandingPage />
}