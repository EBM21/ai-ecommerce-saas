"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot } from "lucide-react"

export function AIChatbot({ storeId, domain, config }: { storeId: string, domain: string, config: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
        { role: 'bot', content: config.welcomeMessage || "Hello! How can I help you today?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ content: userMsg }],
                    storeId,
                    domain
                })
            })

            const data = await res.json()
            if (data.text) {
                setMessages(prev => [...prev, { role: 'bot', content: data.text }])
            } else {
                throw new Error("No response")
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    const primary = config.primaryColor || "#6366f1"

    return (
        <>
            {/* ── TOGGLE BUTTON ── */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 size-14 rounded-full shadow-2xl flex items-center justify-center text-white z-[900] cursor-pointer hover:scale-105 transition-transform"
                style={{ background: primary }}
            >
                <MessageSquare className="size-6" />
            </motion.button>

            {/* ── CHAT WINDOW ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-card border border-border rounded-[2rem] shadow-2xl z-[1000] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 flex items-center justify-between text-white" style={{ background: primary }}>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <Sparkles className="size-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none">{config.name || "AI Assistant"}</h3>
                                    <p className="text-[10px] opacity-70 font-medium uppercase tracking-widest mt-1">Online & AI Powered</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                                        m.role === 'user' 
                                            ? "bg-indigo-500 text-white rounded-tr-none shadow-lg shadow-indigo-500/10" 
                                            : "bg-secondary border border-border text-foreground rounded-tl-none"
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary border border-border p-3 rounded-2xl rounded-tl-none flex gap-1">
                                        <div className="size-1.5 rounded-full bg-muted-foreground/30 animate-bounce" />
                                        <div className="size-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.2s]" />
                                        <div className="size-1.5 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border bg-secondary/30">
                            <form 
                                onSubmit={e => { e.preventDefault(); handleSend() }}
                                className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1 focus-within:border-indigo-500/50 transition-colors"
                            >
                                <input 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 h-10 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 text-indigo-500 hover:text-indigo-400 disabled:opacity-30 transition-colors"
                                >
                                    <Send className="size-4" />
                                </button>
                            </form>
                            <p className="text-[9px] text-center mt-3 text-muted-foreground font-bold uppercase tracking-tighter flex items-center justify-center gap-1">
                                <Bot className="size-2.5" /> Powered by Quadlix AI
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
