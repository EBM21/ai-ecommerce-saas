"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Store, Globe, CreditCard, ShieldAlert, Save,
    Loader2, CheckCircle2, ExternalLink, Mail, Phone, DollarSign
} from "lucide-react"
import { getStoreSettings, updateStoreSettings } from "../settings/action"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"GENERAL" | "DOMAIN" | "PAYMENTS" | "ADVANCED">("GENERAL")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVED" | "ERROR">("IDLE")

    // Empty state jo database se bhar jayega
    const [formData, setFormData] = useState({
        general: { storeName: "", email: "", phone: "", currency: "USD" },
        domain: { subdomain: "", customDomain: "" },
        payments: { stripePublicKey: "", stripeSecretKey: "" }
    })

    // ── 1. DATABASE SE DATA FETCH KAREIN ──
    useEffect(() => {
        async function loadSettings() {
            const res = await getStoreSettings()
            if (res?.success && res.store) {
                setFormData({
                    general: {
                        storeName: res.store.name || "",
                        email: (res.store as any).email || "", // Type casting taake error na aaye
                        phone: (res.store as any).phone || "",
                        currency: "USD",
                    },
                    domain: {
                        subdomain: res.store.subdomain || "",
                        customDomain: res.store.customDomain || "",
                    },
                    payments: {
                        stripePublicKey: (res.store as any).stripePublicKey || "",
                        stripeSecretKey: (res.store as any).stripeSecretKey || "",
                    }
                })
            }
            setIsLoading(false)
        }
        loadSettings()
    }, [])

    const handleChange = (section: keyof typeof formData, field: string, value: string) => {
        setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
        setSaveStatus("IDLE")
    }

    // ── 2. DATABASE MEIN DATA SAVE KAREIN ──
    const handleSave = async () => {
        setIsSaving(true)
        const res = await updateStoreSettings({
            name: formData.general.storeName,
            email: formData.general.email,
            phone: formData.general.phone,
            subdomain: formData.domain.subdomain,
            customDomain: formData.domain.customDomain,
            stripePublicKey: formData.payments.stripePublicKey,
            stripeSecretKey: formData.payments.stripeSecretKey,
        })

        setIsSaving(false)
        if (res.success) {
            setSaveStatus("SAVED")
            setTimeout(() => setSaveStatus("IDLE"), 3000)
        } else {
            setSaveStatus("ERROR")
            alert("Save failed: " + res.error)
        }
    }

    if (isLoading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="size-10 animate-spin text-indigo-500" /></div>

    return (
        <div className="max-w-6xl mx-auto px-6 pb-24 pt-8 font-sans">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Store Settings</h1>
                    <p className="text-white/40 font-medium">Manage your store preferences, domains, and payment gateways.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg ${saveStatus === "SAVED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40"}`}
                >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : saveStatus === "SAVED" ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
                    {saveStatus === "SAVED" ? "Settings Saved" : "Save Changes"}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">

                {/* ── SIDEBAR TABS ── */}
                <aside className="lg:w-64 shrink-0">
                    <nav className="flex flex-col gap-2 sticky top-24">
                        <TabButton active={activeTab === "GENERAL"} onClick={() => setActiveTab("GENERAL")} icon={Store} label="General Settings" />
                        <TabButton active={activeTab === "DOMAIN"} onClick={() => setActiveTab("DOMAIN")} icon={Globe} label="Domains & URLs" />
                        <TabButton active={activeTab === "PAYMENTS"} onClick={() => setActiveTab("PAYMENTS")} icon={CreditCard} label="Payment Providers" />
                        <div className="h-px w-full bg-white/5 my-2" />
                        <TabButton active={activeTab === "ADVANCED"} onClick={() => setActiveTab("ADVANCED")} icon={ShieldAlert} label="Danger Zone" danger />
                    </nav>
                </aside>

                {/* ── CONTENT AREA ── */}
                <main className="flex-1">
                    <AnimatePresence mode="wait">

                        {/* GENERAL SETTINGS */}
                        {activeTab === "GENERAL" && (
                            <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <SectionHeader title="Store Details" description="Basic information about your business." />
                                <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Store Name" icon={Store} value={formData.general.storeName} onChange={(val) => handleChange("general", "storeName", val)} />
                                        <InputField label="Store Currency" icon={DollarSign} value={formData.general.currency} onChange={(val) => handleChange("general", "currency", val)} placeholder="e.g. USD, PKR" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField label="Support Email" icon={Mail} value={formData.general.email} onChange={(val) => handleChange("general", "email", val)} type="email" placeholder="contact@brand.com" />
                                        <InputField label="Support Phone" icon={Phone} value={formData.general.phone} onChange={(val) => handleChange("general", "phone", val)} placeholder="+1 234 567 890" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* DOMAIN SETTINGS */}
                        {activeTab === "DOMAIN" && (
                            <motion.div key="domain" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <SectionHeader title="Domains" description="Manage how customers access your store." />

                                <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 space-y-6">
                                    <div>
                                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">Quadlix Subdomain</label>
                                        <div className="flex items-center">
                                            <input
                                                value={formData.domain.subdomain}
                                                onChange={(e) => handleChange("domain", "subdomain", e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-l-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none"
                                            />
                                            <div className="h-12 px-4 bg-white/5 border border-l-0 border-white/10 rounded-r-xl flex items-center text-sm text-white/40 font-mono">
                                                .quadlix.com
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest block">Custom Domain (Pro)</label>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    value={formData.domain.customDomain}
                                                    onChange={(e) => handleChange("domain", "customDomain", e.target.value)}
                                                    placeholder="e.g. www.yourbrand.com"
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none"
                                                />
                                            </div>

                                            {/* DNS Setup Guide */}
                                            {formData.domain.customDomain && (
                                                <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-sm">
                                                    <h4 className="font-bold text-indigo-400 mb-2">DNS Configuration Setup</h4>
                                                    <p className="text-white/60 mb-4 text-xs">To connect your domain, log in to your domain provider (e.g. GoDaddy, Namecheap) and add this record:</p>
                                                    <div className="bg-black/50 rounded-lg p-3 grid grid-cols-3 gap-4 text-xs font-mono text-white/80">
                                                        <div><span className="text-white/40 block mb-1">Type</span>CNAME</div>
                                                        <div><span className="text-white/40 block mb-1">Name</span>www</div>
                                                        <div><span className="text-white/40 block mb-1">Value</span>cname.quadlix.com</div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* PAYMENTS SETTINGS */}
                        {activeTab === "PAYMENTS" && (
                            <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <SectionHeader title="Payment Gateways" description="Configure Stripe to accept credit cards securely." />
                                <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5"><CreditCard className="size-32" /></div>
                                    <div className="relative z-10 space-y-6 max-w-xl">
                                        <InputField label="Stripe Public Key" icon={CreditCard} value={formData.payments.stripePublicKey} onChange={(val) => handleChange("payments", "stripePublicKey", val)} placeholder="pk_live_..." />
                                        <InputField label="Stripe Secret Key" icon={ShieldAlert} value={formData.payments.stripeSecretKey} onChange={(val) => handleChange("payments", "stripeSecretKey", val)} placeholder="sk_live_..." type="password" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ADVANCED SETTINGS */}
                        {activeTab === "ADVANCED" && (
                            <motion.div key="advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <SectionHeader title="Danger Zone" description="Irreversible actions." />
                                <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 space-y-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">Delete Store</h4>
                                        <p className="text-sm text-white/40 max-w-xl">Once deleted, all data will be wiped.</p>
                                    </div>
                                    <button className="px-6 py-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-sm border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                                        Permanently Delete
                                    </button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

// ── UI COMPONENTS ──
function SectionHeader({ title, description }: { title: string, description: string }) {
    return (
        <div className="mb-6"><h2 className="text-xl font-bold text-white">{title}</h2><p className="text-sm text-white/40 mt-1">{description}</p></div>
    )
}

function TabButton({ active, onClick, icon: Icon, label, danger }: { active: boolean, onClick: () => void, icon: any, label: string, danger?: boolean }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left ${active ? danger ? "bg-rose-500/10 text-rose-500" : "bg-white/10 text-white" : "text-white/40 hover:bg-white/5"}`}>
            <Icon className={`size-4 ${active ? (danger ? "text-rose-500" : "text-indigo-400") : ""}`} />{label}
        </button>
    )
}

function InputField({ label, icon: Icon, value, onChange, placeholder, type = "text" }: { label: string, icon: any, value: string, onChange: (val: string) => void, placeholder?: string, type?: string }) {
    return (
        <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3 block">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><Icon className="size-4" /></div>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 h-12 text-sm text-white font-medium focus:border-indigo-500/50 outline-none placeholder:text-white/20" />
            </div>
        </div>
    )
}