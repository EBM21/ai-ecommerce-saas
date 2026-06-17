"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    Store, Globe, CreditCard, ShieldAlert, Save,
    Loader2, CheckCircle2, Mail, Phone, DollarSign, Zap,
    AlertCircle, Check, Search, Plus, ExternalLink,
    ArrowRight, Copy, RefreshCw, X, ShieldCheck
} from "lucide-react"
import { getStoreSettings, updateStoreSettings, createSubscriptionSession } from "./actions"
import { 
    searchDomainAvailability, setupExistingDomain, 
    provisionFreeDomain, verifyDomainDNS, removeCustomDomain 
} from "./domain-actions"
import { toast } from "sonner"
import { getStoreUrl } from "@/lib/utils"

// ── SUSPENSE WRAPPER ──
export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="h-[80vh] flex items-center justify-center"><Loader2 className="size-10 animate-spin text-indigo-500" /></div>}>
            <SettingsContent />
        </Suspense>
    )
}

function SettingsContent() {
    const searchParams = useSearchParams()
    
    const [activeTab, setActiveTab] = useState<"GENERAL" | "DOMAIN" | "PAYMENTS" | "BILLING" | "ADVANCED">("GENERAL")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUpgrading, setIsUpgrading] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"IDLE" | "SAVED" | "ERROR">("IDLE")
    const [fetchError, setFetchError] = useState<string | null>(null)

    // Store Info
    const [storeId, setStoreId] = useState("")
    const [trialDays, setTrialDays] = useState(0)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [plan, setPlan] = useState("free_trial")

    const [formData, setFormData] = useState({
        general: { storeName: "", email: "", phone: "" },
        domain: { subdomain: "", customDomain: "" },
        payments: { stripePublicKey: "", stripeSecretKey: "" }
    })

    // Domain Specific State
    const [domainData, setDomainData] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [searchResult, setSearchResult] = useState<any>(null)
    const [isProvisioning, setIsProvisioning] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [domainMode, setDomainDataMode] = useState<"VIEW" | "REGISTER" | "CONNECT">("VIEW")

    // ── 1. DATA FETCH ──
    useEffect(() => {
        async function loadData() {
            try {
                const res = await getStoreSettings()
                if (res?.success && res.store) {
                    const s = res.store as any
                    setStoreId(s.id)
                    setPlan(s.plan || "free_trial")
                    setIsSubscribed(s.subscriptionActive || false)
                    setDomainData(s)
                    
                    setFormData({
                        general: { storeName: s.name || "", email: s.email || "", phone: s.phone || "" },
                        domain: { subdomain: s.subdomain || "", customDomain: s.customDomain || "" },
                        payments: { stripePublicKey: s.stripePublicKey || "", stripeSecretKey: s.stripeSecretKey || "" }
                    })

                    if (s.trialEndsAt && !s.subscriptionActive) {
                        const diff = new Date(s.trialEndsAt).getTime() - new Date().getTime()
                        setTrialDays(Math.max(0, Math.ceil(diff / (1000 * 3600 * 24))))
                    }
                } else {
                    setFetchError(res?.error || "Store data not found.")
                }
            } catch (err) {
                setFetchError("Connection timed out.")
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    // ── 2. TAB SWITCHING ──
    useEffect(() => {
        const tab = searchParams.get("tab")?.toUpperCase()
        if (tab && ["GENERAL", "DOMAIN", "PAYMENTS", "BILLING", "ADVANCED"].includes(tab)) {
            setActiveTab(tab as any)
        }
    }, [searchParams])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await updateStoreSettings({
                name: formData.general.storeName,
                email: formData.general.email,
                phone: formData.general.phone,
                subdomain: formData.domain.subdomain,
                customDomain: formData.domain.customDomain,
                stripePublicKey: formData.payments.stripePublicKey,
                stripeSecretKey: formData.payments.stripeSecretKey,
            })
            if (res.success) {
                setSaveStatus("SAVED")
                toast.success("Settings updated successfully")
                setTimeout(() => setSaveStatus("IDLE"), 3000)
            } else {
                toast.error(res.error || "Save failed")
            }
        } catch (e) { toast.error("Network error") } finally { setIsSaving(false) }
    }

    const handleUpgrade = async () => {
        setIsUpgrading(true)
        const res = await createSubscriptionSession(storeId)
        if (res.success && res.url) window.location.href = res.url
        else { toast.error(res.error); setIsUpgrading(false); }
    }

    // ── DOMAIN HANDLERS ──
    const handleSearch = async () => {
        if (!searchQuery.includes('.')) {
            if (!searchQuery.endsWith('.com')) setSearchQuery(searchQuery + ".com")
        }
        setIsSearching(true)
        const res = await searchDomainAvailability(searchQuery)
        setSearchResult(res)
        setIsSearching(false)
    }

    const handleProvision = async (domain: string) => {
        setIsProvisioning(true)
        const res = await provisionFreeDomain(domain)
        if (res.success) {
            toast.success(res.message)
            setDomainDataMode("VIEW")
            window.location.reload()
        } else toast.error(res.error)
        setIsProvisioning(false)
    }

    const handleConnectExisting = async (domain: string) => {
        setIsSaving(true)
        const res = await setupExistingDomain(domain)
        if (res.success) {
            toast.success("Domain added. Please configure your DNS.")
            setDomainDataMode("VIEW")
            window.location.reload()
        } else toast.error(res.error)
        setIsSaving(false)
    }

    const handleVerifyDNS = async () => {
        setIsVerifying(true)
        const res = await verifyDomainDNS(domainData.customDomain)
        if (res.success) toast.success("Domain verified and active!")
        else toast.error("DNS records not found yet. It may take up to 24 hours.")
        setIsVerifying(false)
    }

    const handleRemoveDomain = async () => {
        if (!confirm("Are you sure you want to remove this domain?")) return
        const res = await removeCustomDomain()
        if (res.success) window.location.reload()
    }

    const handleChange = (section: keyof typeof formData, field: string, value: string) => {
        setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
    }

    if (isLoading) return <div className="h-[80vh] flex flex-col items-center justify-center space-y-4"><Loader2 className="size-10 animate-spin text-indigo-500" /><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Environment...</p></div>
    if (fetchError) return <div className="h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4"><ShieldAlert className="size-16 text-rose-500" /><h2 className="text-xl font-bold">Failed to Load</h2><p className="text-muted-foreground">{fetchError}</p></div>

    return (
        <div className="max-w-6xl mx-auto px-6 pb-24 pt-8 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div><h1 className="text-3xl font-extrabold tracking-tight mb-2">Settings</h1><p className="text-muted-foreground text-sm">Manage your brand, domains, and growth.</p></div>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition-all">
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-64 shrink-0">
                    <nav className="flex flex-col gap-2 sticky top-24">
                        <TabButton active={activeTab === "GENERAL"} onClick={() => setActiveTab("GENERAL")} icon={Store} label="General" />
                        <TabButton active={activeTab === "DOMAIN"} onClick={() => setActiveTab("DOMAIN")} icon={Globe} label="Domains" />
                        <TabButton active={activeTab === "PAYMENTS"} onClick={() => setActiveTab("PAYMENTS")} icon={CreditCard} label="Payments" />
                        <TabButton active={activeTab === "BILLING"} onClick={() => setActiveTab("BILLING")} icon={Zap} label="Billing" />
                        <TabButton active={activeTab === "ADVANCED"} onClick={() => setActiveTab("ADVANCED")} icon={ShieldAlert} label="Advanced" danger />
                    </nav>
                </aside>

                <main className="flex-1">
                    <AnimatePresence mode="wait">
                        {/* GENERAL */}
                        {activeTab === "GENERAL" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <SectionHeader title="Brand Details" description="Basic info about your business." />
                                <div className="bg-card border border-border/50 rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                                    <InputField label="Store Name" icon={Store} value={formData.general.storeName} onChange={v => handleChange("general", "storeName", v)} />
                                    <InputField label="Email" icon={Mail} value={formData.general.email} onChange={v => handleChange("general", "email", v)} type="email" />
                                    <InputField label="Phone" icon={Phone} value={formData.general.phone} onChange={v => handleChange("general", "phone", v)} />
                                </div>
                            </motion.div>
                        )}

                        {/* DOMAIN MANAGEMENT */}
                        {activeTab === "DOMAIN" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <SectionHeader title="Domains & Connectivity" description="Connect your own domain or get one for free." />
                                
                                {/* ── SUBDOMAIN INFO ── */}
                                <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Platform URL</h4>
                                    <div className="flex items-center justify-between bg-secondary/50 p-4 rounded-2xl border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Globe className="size-5" /></div>
                                            <div><p className="text-sm font-bold">{formData.domain.subdomain}.quadlix.com</p><p className="text-[10px] text-muted-foreground uppercase font-bold">Standard Subdomain</p></div>
                                        </div>
                                        <a href={getStoreUrl(formData.domain.subdomain)} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-secondary rounded-lg transition-colors"><ExternalLink className="size-4 opacity-40" /></a>
                                    </div>
                                </div>

                                {/* ── CUSTOM DOMAIN LOGIC ── */}
                                {domainData?.customDomain ? (
                                    <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                                        {domainData.customDomainStatus === 'ACTIVE' && <div className="absolute top-0 right-0 bg-emerald-500/10 text-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl">Active & Verified</div>}
                                        
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Custom Domain</h4>
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black tracking-tight">{domainData.customDomain}</h3>
                                                <button onClick={handleRemoveDomain} className="text-xs font-bold text-rose-500 hover:underline">Remove Domain</button>
                                            </div>

                                            {domainData.customDomainStatus === 'PENDING' && (
                                                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-bold text-amber-200">DNS Configuration Required</p>
                                                            <p className="text-xs text-amber-500/70 mt-1">Please add the following record to your domain's DNS settings.</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl font-mono text-[11px]">
                                                        <div><p className="opacity-40 uppercase mb-1">Type</p><p className="font-bold">{domainData.customDomainVerificationType}</p></div>
                                                        <div><p className="opacity-40 uppercase mb-1">Name</p><p className="font-bold">@ (or root)</p></div>
                                                        <div className="flex items-center justify-between">
                                                            <div><p className="opacity-40 uppercase mb-1">Value</p><p className="font-bold truncate">{domainData.customDomainVerificationValue}</p></div>
                                                            <button onClick={() => { navigator.clipboard.writeText(domainData.customDomainVerificationValue); toast.success("Copied!") }} className="p-2 hover:bg-white/10 rounded-lg"><Copy className="size-3" /></button>
                                                        </div>
                                                    </div>
                                                    <button onClick={handleVerifyDNS} disabled={isVerifying} className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-2">
                                                        {isVerifying ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Verify DNS Records
                                                    </button>
                                                </div>
                                            )}

                                            {domainData.isProvisioned && (
                                                <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/30 p-3 rounded-xl">
                                                    <ShieldCheck className="size-4 text-indigo-500" /> Managed by Quadlix • Expires {new Date(domainData.domainExpiresAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* OPTION 1: REGISTER */}
                                        <button onClick={() => setDomainDataMode("REGISTER")} className="group bg-indigo-600/5 border-2 border-indigo-600/20 hover:border-indigo-600 rounded-[2.5rem] p-8 text-left transition-all">
                                            <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/20"><Search className="size-6" /></div>
                                            <h4 className="text-lg font-bold mb-2">Get a Free .com</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed mb-6 opacity-60">We'll pay for your first year. Automated registration and instant setup.</p>
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:gap-4 transition-all">Search Available Domains <ArrowRight className="size-4" /></div>
                                        </button>

                                        {/* OPTION 2: CONNECT */}
                                        <button onClick={() => setDomainDataMode("CONNECT")} className="group bg-card border-2 border-border/50 hover:border-indigo-600 rounded-[2.5rem] p-8 text-left transition-all">
                                            <div className="size-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground mb-6"><ExternalLink className="size-6" /></div>
                                            <h4 className="text-lg font-bold mb-2">Connect Existing</h4>
                                            <p className="text-xs text-muted-foreground leading-relaxed mb-6 opacity-60">Already own a domain? Map it to your store by updating your DNS records.</p>
                                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:gap-4 transition-all">Enter My Domain <ArrowRight className="size-4" /></div>
                                        </button>
                                    </div>
                                )}

                                {/* ── MODALS / OVERLAYS ── */}
                                <AnimatePresence>
                                    {domainMode !== "VIEW" && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl bg-card border border-border rounded-[3rem] p-10 shadow-2xl space-y-8 relative">
                                                <button onClick={() => { setDomainDataMode("VIEW"); setSearchResult(null); setSearchQuery("") }} className="absolute top-8 right-8 p-2 hover:bg-secondary rounded-full transition-colors"><X className="size-5" /></button>
                                                
                                                {domainMode === "REGISTER" ? (
                                                    <>
                                                        <SectionHeader title="Find Your Brand Home" description="Search for a unique .com domain. Quadlix covers the cost." />
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/40" />
                                                                <input 
                                                                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                                                    className="w-full h-14 bg-secondary border border-border rounded-2xl pl-12 pr-4 font-bold focus:border-indigo-600 outline-none" placeholder="yourbrandname.com" 
                                                                />
                                                            </div>
                                                            <button onClick={handleSearch} disabled={isSearching || !searchQuery} className="px-8 h-14 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 disabled:opacity-50 transition-all">
                                                                {isSearching ? <Loader2 className="size-5 animate-spin" /> : "Search"}
                                                            </button>
                                                        </div>

                                                        {searchResult && (
                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border-2 flex items-center justify-between ${searchResult.available ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                                                                <div>
                                                                    <p className="text-lg font-black tracking-tight">{searchResult.domain}</p>
                                                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${searchResult.available ? "text-emerald-500" : "text-rose-500"}`}>{searchResult.available ? "Available" : "Taken"}</p>
                                                                </div>
                                                                {searchResult.available && (
                                                                    <button onClick={() => handleProvision(searchResult.domain)} disabled={isProvisioning} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all flex items-center gap-2">
                                                                        {isProvisioning ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4" /> Claim Free</>}
                                                                    </button>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <SectionHeader title="Connect Existing Domain" description="Enter the domain you already own below." />
                                                        <div className="space-y-6">
                                                            <InputField label="Domain Name" icon={Globe} value={searchQuery} onChange={setSearchQuery} placeholder="example.com" />
                                                            <button onClick={() => handleConnectExisting(searchQuery)} disabled={isSaving || !searchQuery} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                                                                {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Setup DNS Mapping"}
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* PAYMENTS */}
                        {activeTab === "PAYMENTS" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <SectionHeader title="Payment Gateways" description="Configure Stripe to accept credit cards." />
                                <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 space-y-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5"><CreditCard className="size-32" /></div>
                                    <div className="relative z-10 space-y-6 max-w-xl">
                                        <InputField label="Stripe Public Key" icon={CreditCard} value={formData.payments.stripePublicKey} onChange={v => handleChange("payments", "stripePublicKey", v)} placeholder="pk_test_..." />
                                        <InputField label="Stripe Secret Key" icon={ShieldAlert} value={formData.payments.stripeSecretKey} onChange={v => handleChange("payments", "stripeSecretKey", v)} placeholder="sk_test_..." type="password" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* BILLING */}
                        {activeTab === "BILLING" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <SectionHeader title="Billing & Plans" description="Subscription and usage overview." />
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-20" />
                                    <div className="relative bg-card border border-border/50 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl">
                                        <div className="flex flex-col md:flex-row justify-between gap-8">
                                            <div className="space-y-4">
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">{isSubscribed ? "Premium" : "Free Explorer"}</div>
                                                <h2 className="text-4xl font-black uppercase italic">{isSubscribed ? "Quadlix Pro" : "Free Trial"}</h2>
                                                <p className="text-muted-foreground text-sm max-w-xs">{isSubscribed ? "Unlimited everything is unlocked." : `Your trial ends in ${trialDays} days.`}</p>
                                            </div>
                                            <div className="text-5xl font-black tracking-tighter">$29<span className="text-lg text-muted-foreground font-bold">/mo</span></div>
                                        </div>
                                        {!isSubscribed ? (
                                            <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full h-16 mt-12 rounded-2xl bg-indigo-600 text-white font-black text-lg uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                                                {isUpgrading ? <Loader2 className="size-6 animate-spin" /> : <><Zap className="size-5 fill-current" /> Upgrade to Pro</>}
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3 py-4 mt-12 bg-secondary/50 rounded-2xl border border-border/50 text-indigo-400 font-bold uppercase tracking-widest text-sm"><ShieldCheck className="size-5" /> Active</div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <UsageCard label="Products" used={formData.general.storeName ? "12" : "0"} limit={isSubscribed ? "∞" : "50"} pct={24} />
                                    <UsageCard label="AI Studio" used={isSubscribed ? "142" : "3"} limit={isSubscribed ? "∞" : "10"} pct={15} />
                                    <UsageCard label="Monthly Orders" used="8" limit={isSubscribed ? "∞" : "100"} pct={8} />
                                </div>
                            </motion.div>
                        )}

                        {/* ADVANCED */}
                        {activeTab === "ADVANCED" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <SectionHeader title="Danger Zone" description="Irreversible actions for your store." />
                                <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-8 space-y-6">
                                    <h4 className="text-lg font-bold text-foreground mb-1">Delete Store</h4>
                                    <p className="text-sm text-muted-foreground max-w-xl">This will remove all products and customer data. This action is permanent.</p>
                                    <button className="px-8 py-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Delete Everything</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

function SectionHeader({ title, description }: { title: string, description: string }) { return ( <div className="mb-6"><h2 className="text-xl font-bold text-foreground">{title}</h2><p className="text-sm text-muted-foreground mt-1">{description}</p></div> ) }
function TabButton({ active, onClick, icon: Icon, label, danger }: { active: boolean, onClick: () => void, icon: any, label: string, danger?: boolean }) { return ( <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all w-full text-left border ${active ? (danger ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400") : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/50"}`}><Icon className="size-4" />{label}</button> ) }
function InputField({ label, icon: Icon, value, onChange, placeholder, type = "text" }: { label: string, icon: any, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) { return ( <div><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 block ml-1">{label}</label><div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"><Icon className="size-4" /></div><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 h-12 text-sm font-medium focus:border-indigo-500 outline-none transition-all" /></div></div> ) }
function UsageCard({ label, used, limit, pct }: { label: string, used: string, limit: string, pct: number }) { return ( <div className="bg-card border border-border/50 p-6 rounded-3xl space-y-4 shadow-sm"><div className="flex justify-between items-end"><div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p><p className="text-xl font-black">{used} <span className="text-xs text-muted-foreground font-medium">/ {limit}</span></p></div><div className="text-[10px] font-bold text-indigo-400">{pct}%</div></div><div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} /></div></div> ) }
