"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"

export type CartItem = {
    id: string
    title: string
    price: number
    image: string
    quantity: number
    domain: string
    variantId?: string
    variantName?: string
}

type CartContextType = {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, "quantity">) => void
    removeFromCart: (id: string, variantId?: string) => void
    updateQuantity: (id: string, quantity: number, variantId?: string) => void
    clearCart: () => void
    cartTotal: number
    cartCount: number
    isCartOpen: boolean
    setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, domain }: { children: React.ReactNode, domain: string }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true)
            const saved = localStorage.getItem(`quadlix_cart_${domain}`)
            if (saved) {
                try {
                    setItems(JSON.parse(saved))
                } catch (e) {
                    console.error("Failed to parse cart", e)
                }
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [domain])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(`quadlix_cart_${domain}`, JSON.stringify(items))
        }
    }, [items, mounted, domain])

    const addToCart = (product: Omit<CartItem, "quantity">) => {
        setItems(prev => {
            const existing = prev.find(item => 
                item.id === product.id && item.variantId === product.variantId
            )
            if (existing) {
                return prev.map(item => 
                    (item.id === product.id && item.variantId === product.variantId) 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
        toast.success("Added to cart", {
            description: `${product.title}${product.variantName ? ` (${product.variantName})` : ''} was added to your cart.`
        })
    }

    const removeFromCart = (id: string, variantId?: string) => {
        setItems(prev => prev.filter(item => !(item.id === id && item.variantId === variantId)))
    }

    const updateQuantity = (id: string, quantity: number, variantId?: string) => {
        if (quantity < 1) {
            removeFromCart(id, variantId)
            return
        }
        setItems(prev => prev.map(item => 
            (item.id === id && item.variantId === variantId) ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => {
        setItems([])
        localStorage.removeItem(`quadlix_cart_${domain}`)
    }

    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
    const cartCount = items.reduce((count, item) => count + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items, addToCart, removeFromCart, updateQuantity, clearCart, 
            cartTotal, cartCount, isCartOpen, setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
