import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditProductClient from "../edit/edit-client"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // Database se purana product fetch kar rahay hain
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: true,
            categories: true
        }
    })

    // Agar product delete ho chuka hai ya ID ghalat hai
    if (!product) {
        notFound()
    }

    // Data ko safe format mein convert karna
    const formattedProduct = {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []),
        variants: product.variants.map(v => ({
            ...v,
            price: v.price ? Number(v.price) : ""
        }))
    }

    return (
        <div className="max-w-4xl mx-auto w-full px-6">
            <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-widest mb-8">
                <ChevronLeft className="size-4" /> Back to Inventory
            </Link>

            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-foreground mb-2">Edit Product</h1>
                <p className="text-muted-foreground font-medium">Update details, pricing, and inventory for {product.title}.</p>
            </div>

            {/* Ye client component form handle karega */}
            <EditProductClient product={formattedProduct} />
        </div>
    )
}