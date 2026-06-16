import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import ProductsClient from "./products-client"

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. User ka store find karein
  const store = await prisma.store.findFirst({
    where: { ownerId: user.id }
  })

  if (!store) {
    return <div className="p-8 text-foreground">Please create a store first.</div>
  }

  // 2. Database se products fetch karein
  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Data format karein taake Client Component mein error na aaye
  const formattedProducts = products.map((p: { id: any; title: any; description: any; price: any; compareAtPrice: any; inventoryCount: any; status: any; images: any; createdAt: { toISOString: () => any; }; }) => ({
    id: p.id,
    title: p.title,
    description: p.description || "",
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    inventoryCount: p.inventoryCount,
    status: p.status,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || null),
    createdAt: p.createdAt.toISOString()
  }))

  // 4. Client component ko data pass karein
  return <ProductsClient products={formattedProducts} domain={store.customDomain || store.subdomain} />
}