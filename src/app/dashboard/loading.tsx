import { Loader2, Sparkles } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="w-full h-[70vh] flex flex-col items-center justify-center gap-4 font-sans">
            <div className="relative">
                {/* Glowing Box */}
                <div className="size-16 rounded-2xl bg-[#0a0a0c] flex items-center justify-center border border-white/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    <Loader2 className="size-8 text-indigo-500 animate-spin" />
                </div>
                {/* Sparkle Decoration */}
                <Sparkles className="absolute -top-2 -right-2 size-5 text-violet-400 animate-pulse" />
            </div>

            {/* Loading Text */}
            <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse mt-2">
                Loading Data...
            </p>
        </div>
    )
}