"use client"

import { useState } from 'react'
import { PRE_BUILT_THEMES } from '@/lib/themes/pre-built'
import { applyTheme } from './actions'
import { toast } from 'sonner'
import { Palette, CheckCircle2, MonitorSmartphone, Wand2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ThemesClient() {
    const [applying, setApplying] = useState<string | null>(null)
    const router = useRouter()

    const handleApply = async (themeId: string) => {
        setApplying(themeId)
        try {
            const res = await applyTheme(themeId)
            if (res.success) {
                toast.success('Theme applied successfully!')
                router.push('/dashboard/customizer')
            } else {
                toast.error(res.error || 'Failed to apply theme')
            }
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setApplying(null)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Theme Library</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Choose a professionally designed theme to jumpstart your store, or build from scratch using our Visual Builder.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.push('/dashboard/customizer')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-all"
                    >
                        <Wand2 className="size-4" />
                        Visual Builder
                    </button>
                    <button 
                        onClick={() => router.push('/dashboard/customizer')} // Since the customizer allows starting from scratch by clearing blocks
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Plus className="size-4" />
                        Start from Scratch
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {PRE_BUILT_THEMES.map((theme) => (
                    <div key={theme.id} className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
                        {/* Preview Image */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                            <img 
                                src={theme.previewImage} 
                                alt={theme.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Hover Actions */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                                <button
                                    onClick={() => handleApply(theme.id)}
                                    disabled={applying !== null}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-bold shadow-2xl transition-colors"
                                >
                                    {applying === theme.id ? (
                                        <span className="flex items-center gap-2">
                                            <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Applying...
                                        </span>
                                    ) : (
                                        <>
                                            <Palette className="size-4" />
                                            Apply Theme
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <h3 className="text-xl font-bold tracking-tight text-foreground">{theme.name}</h3>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <MonitorSmartphone className="size-3" />
                                    Responsive
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                {theme.description}
                            </p>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                                    <div className="size-3 rounded-full" style={{ backgroundColor: theme.config.styles.primaryColor }} />
                                    {theme.config.styles.headingFont}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                                    <div className="flex gap-0.5">
                                        <div className="size-3 rounded-l-full" style={{ backgroundColor: theme.config.styles.bgColor }} />
                                        <div className="size-3 rounded-r-full" style={{ backgroundColor: theme.config.styles.textColor }} />
                                    </div>
                                    Colors
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
