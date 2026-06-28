import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import CategoriesClient from "./categories-client"

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.id },
    select: { id: true, customDomain: true, subdomain: true }
  })

  if (!store) {
    return <div className="p-8 text-foreground">Please create a store first.</div>
  }

  const categories = await prisma.category.findMany({
    where: { storeId: store.id },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const formattedCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    productCount: c._count.products,
    createdAt: c.createdAt.toISOString()
  }))

  return <CategoriesClient categories={formattedCategories} domain={store.customDomain || store.subdomain} />
}
