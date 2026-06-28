"use client"

import { useState, useRef } from "react"
import { User, Settings, CreditCard, HelpCircle, LogOut, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { updateUserProfile } from "@/app/dashboard/user-actions"
import { toast } from "sonner"
import Image from "next/image"

export function UserProfileHeader({ user }: { user?: { id: string, name: string | null, email: string, avatarUrl: string | null } }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const [profileModalOpen, setProfileModalOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const router = useRouter()
    
    // Profile Edit State
    const [name, setName] = useState(user?.name || "")
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    
    const handleLogout = async () => {
        setLoggingOut(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file.")
            return
        }

        setIsUploading(true)
        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrlData.publicUrl)
            toast.success("Avatar uploaded successfully!")
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error("Failed to upload avatar.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            const res = await updateUserProfile({ name, avatarUrl })
            if (res.success) {
                toast.success("Profile updated successfully")
                setProfileModalOpen(false)
            } else {
                toast.error(res.error || "Failed to update profile")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="relative">
            {/* Header Button */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
            >
                {user?.avatarUrl || avatarUrl ? (
                    <img 
                        src={avatarUrl || user?.avatarUrl || ""} 
                        alt="User Logo" 
                        className="size-7 rounded-full object-cover shadow-md border border-white/20 dark:border-black/20"
                    />
                ) : (
                    <div className="size-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/20 dark:border-black/20 shrink-0">
                        {(user?.name || "A").charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="text-sm font-semibold truncate max-w-[100px] hidden sm:block">
                    {user?.name || "Admin"}
                </span>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-3">
                                {user?.avatarUrl || avatarUrl ? (
                                    <img 
                                        src={avatarUrl || user?.avatarUrl || ""} 
                                        alt="User Logo" 
                                        className="size-10 rounded-full object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                                        {(user?.name || "A").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-foreground truncate">{user?.name || "Admin"}</div>
                                    <div className="text-[11px] text-muted-foreground truncate">{user?.email || "admin@quadlix.com"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-1.5">
                            <button 
                                onClick={() => { setMenuOpen(false); setProfileModalOpen(true); }}
                                className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                            >
                                <User className="size-4" /> Edit Profile
                            </button>
                            <Link href="/dashboard/settings" className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>
                                <Settings className="size-4" /> Account Settings
                            </Link>
                            <Link href="/dashboard/settings?tab=billing" className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" onClick={() => setMenuOpen(false)}>
                                <CreditCard className="size-4" /> Billing & Plans
                            </Link>
                        </div>

                        <div className="h-px bg-border my-0.5" />

                        <div className="p-1.5">
                            <button onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 transition-colors font-medium">
                                <LogOut className="size-4" />
                                {loggingOut ? "Signing out..." : "Sign Out"}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Profile Edit Modal */}
            {profileModalOpen && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/10">
                            <h3 className="font-bold text-lg">Edit Profile</h3>
                            <button onClick={() => setProfileModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="size-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group cursor-pointer">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="size-24 rounded-full object-cover border-2 border-border" />
                                    ) : (
                                        <div className="size-24 rounded-full bg-secondary flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                            {(name || "A").charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        {isUploading ? <Loader2 className="size-6 text-white animate-spin" /> : <Upload className="size-6 text-white" />}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} disabled={isUploading} />
                                    </label>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Profile Logo</p>
                                    <p className="text-xs text-muted-foreground mt-1">Click image to upload new logo</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <input 
                                    type="email" 
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 outline-none text-muted-foreground opacity-70"
                                />
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/10">
                            <button 
                                onClick={() => setProfileModalOpen(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveProfile}
                                disabled={isSaving || isUploading}
                                className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="size-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
