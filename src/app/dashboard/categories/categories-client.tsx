"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, PlusCircle, Search, Trash2, Loader2, Sparkles, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createCategory, deleteCategory } from "../products/category-actions"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
  slug: string
  description: string
  productCount: number
  createdAt: string
}

export default function CategoriesClient({ categories = [], domain = "" }: { categories?: Category[], domain?: string }) {
  const [search, setSearch] = useState("")
  const [newCatName, setNewCatName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const router = useRouter()
  const safeCategories = Array.isArray(categories) ? categories : []
  
  const filtered = safeCategories.filter(c => 
    c?.name?.toLowerCase().includes(search.toLowerCase()) || false
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    
    setIsCreating(true)
    const res = await createCategory(newCatName)
    setIsCreating(false)
    
    if (res.success) {
      toast.success(`Category "${newCatName}" created successfully!`)
      setNewCatName("")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to create category")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"? Products in this category will not be deleted, just removed from the category.`)) {
      return
    }

    setDeletingId(id)
    const res = await deleteCategory(id)
    setDeletingId(null)

    if (res.success) {
      toast.success(`Category deleted successfully!`)
      router.refresh()
    } else {
      toast.error(res.error || "Failed to delete category")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-8 w-full max-w-7xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Categories</h1>
          <p className="text-muted-foreground font-medium">Organize your products into collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Category Form */}
        <div className="lg:col-span-1">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 rounded-[2.5rem] shadow-xl sticky top-24">
                <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="text-xl font-bold">Add New Category</CardTitle>
                    <CardDescription>Create a new collection to group similar products.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Category Name</label>
                            <Input 
                                placeholder="e.g. Summer Collection" 
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                                className="h-12 bg-secondary/50 border-border/50 rounded-xl"
                                required
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isCreating || !newCatName.trim()}
                            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                        >
                            {isCreating ? <Loader2 className="size-5 animate-spin" /> : <><PlusCircle className="size-4 mr-2" /> Create Category</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
            <Card className="bg-card/80 backdrop-blur-xl border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="px-8 pt-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-xl font-bold">All Categories</CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Search categories..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 h-11 bg-secondary/50 border-border/50 rounded-xl text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <div className="overflow-x-auto min-h-[300px]">
                        <Table>
                            <TableHeader className="bg-secondary/30">
                                <TableRow className="border-border/50">
                                    <TableHead className="px-8 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Name</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Products</TableHead>
                                    <TableHead className="px-4 py-5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Created</TableHead>
                                    <TableHead className="px-8 py-5 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filtered.length === 0 ? (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={4} className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                    <div className="size-16 rounded-[2rem] bg-secondary/50 flex items-center justify-center mb-6">
                                                        <Layers className="size-6 text-foreground/30" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-foreground mb-2">
                                                        {search ? "No Categories Found" : "No Categories Yet"}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {search ? "Try a different search term." : "Create your first category from the left panel."}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((cat, i) => (
                                            <motion.tr
                                                key={cat.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: i * 0.02 }}
                                                className="hover:bg-secondary/50 transition-colors group"
                                            >
                                                <TableCell className="px-8 py-5">
                                                    <p className="font-bold text-foreground/90 text-[15px]">{cat.name}</p>
                                                    <p className="text-[12px] text-muted-foreground/60 mt-0.5">/{cat.slug}</p>
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold">
                                                        <Package className="size-3.5" /> {cat.productCount}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-5">
                                                    <p className="text-[13px] font-medium text-muted-foreground/60">
                                                        {new Date(cat.createdAt).toLocaleDateString()}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="px-8 py-5 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(cat.id, cat.name)}
                                                        disabled={deletingId === cat.id}
                                                        className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400/80 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30 opacity-0 group-hover:opacity-100"
                                                    >
                                                        {deletingId === cat.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                                    </button>
                                                </TableCell>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </motion.div>
  )
}
