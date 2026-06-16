"use client"

import { useCart } from "@/lib/cart-context"
import { ShoppingBag } from "lucide-react"

export function CartButton({ primary }: { primary: string }) {
    const { cartCount, setIsCartOpen } = useCart()
    
    return (
        <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative cursor-pointer bg-transparent border-none p-1 transition-opacity hover:opacity-70"
            style={{ color: "currentColor" }}
        >
            <ShoppingBag className="size-5" />
            <span
                className="absolute -top-1 -right-1 size-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-sm"
                style={{ background: primary }}
            >
                {cartCount}
            </span>
        </button>
    )
}
