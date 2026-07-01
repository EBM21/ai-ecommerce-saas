"use client"

import { useState, useEffect } from "react"
import { Loader2, CreditCard, Building, User, Hash, Save, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import { getPaymentSettings, updateBankDetails } from "./action"
import { toast } from "sonner"

const BANKS = [
    "Meezan Bank",
    "Habib Bank Limited (HBL)",
    "United Bank Limited (UBL)",
    "Bank Alfalah",
    "Standard Chartered",
    "Allied Bank",
    "MCB Bank",
    "SadaPay",
    "NayaPay",
    "EasyPaisa",
    "JazzCash"
]

export default function PaymentsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [bankName, setBankName] = useState("Meezan Bank")
    const [accountTitle, setAccountTitle] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [proofs, setProofs] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        const res = await getPaymentSettings()
        if (res.success) {
            setProofs(res.paymentProofs || [])
            if (res.bankDetails) {
                // Try to parse from formatted text if possible
                const lines = res.bankDetails.split('\n')
                let parsedBank = "Meezan Bank"
                let parsedTitle = ""
                let parsedNum = ""
                
                lines.forEach((line: string) => {
                    if (line.startsWith("Bank Name: ")) parsedBank = line.replace("Bank Name: ", "")
                    if (line.startsWith("Account Title: ")) parsedTitle = line.replace("Account Title: ", "")
                    if (line.startsWith("Account Number: ")) parsedNum = line.replace("Account Number: ", "")
                })

                if (parsedTitle || parsedNum) {
                    setBankName(parsedBank)
                    setAccountTitle(parsedTitle)
                    setAccountNumber(parsedNum)
                } else {
                    // Fallback if they entered manual text previously
                    setAccountTitle("Previous Details")
                    setAccountNumber(res.bankDetails)
                }
            }
        } else {
            toast.error(res.error)
        }
        setIsLoading(false)
    }

    const handleSave = async () => {
        if (!accountTitle || !accountNumber) {
            toast.error("Account Title and Number are required")
            return
        }

        setIsSaving(true)
        const formattedDetails = `Bank Name: ${bankName}\nAccount Title: ${accountTitle}\nAccount Number: ${accountNumber}`
        
        const res = await updateBankDetails(formattedDetails)
        if (res.success) {
            toast.success("Bank details updated successfully")
        } else {
            toast.error(res.error)
        }
        setIsSaving(false)
    }

    if (isLoading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="size-10 animate-spin text-indigo-500" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Payments...</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 pb-24 pt-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Payments & Transfers</h1>
                    <p className="text-muted-foreground text-sm">Manage your bank accounts and verify customer payments.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Bank Account Settings */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Building className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Bank Account Details</h2>
                                <p className="text-xs text-muted-foreground mt-1 opacity-80">Where customers will send money</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 block ml-1">Select Bank</label>
                                <div className="relative">
                                    <select 
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border rounded-xl pl-4 pr-10 h-14 text-sm font-medium focus:border-indigo-500 outline-none transition-all appearance-none"
                                    >
                                        {BANKS.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/40">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 block ml-1">Account Title</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"><User className="size-4" /></div>
                                    <input 
                                        type="text" 
                                        value={accountTitle}
                                        onChange={(e) => setAccountTitle(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 h-14 text-sm font-medium focus:border-indigo-500 outline-none transition-all" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 block ml-1">Account Number / IBAN</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"><Hash className="size-4" /></div>
                                    <input 
                                        type="text" 
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="03001234567 or PK..."
                                        className="w-full bg-secondary/50 border border-border rounded-xl pl-11 pr-4 h-14 text-sm font-medium focus:border-indigo-500 outline-none transition-all" 
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="w-full h-14 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {isSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />} Save Account Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment Proofs */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-card border border-border/50 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CreditCard className="size-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Recent Payment Proofs</h2>
                                    <p className="text-xs text-muted-foreground mt-1 opacity-80">Screenshots uploaded by customers</p>
                                </div>
                            </div>
                            <button onClick={loadData} className="p-3 bg-secondary/50 hover:bg-secondary rounded-xl transition-all border border-border text-muted-foreground">
                                <RefreshCw className="size-4" />
                            </button>
                        </div>

                        {proofs.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4 py-10 opacity-50">
                                <AlertCircle className="size-12" />
                                <p className="text-sm font-medium">No payment proofs uploaded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 max-h-[600px]">
                                {proofs.map((proof) => (
                                    <div key={proof.id} className="bg-secondary/30 rounded-2xl border border-border overflow-hidden flex flex-col group">
                                        <div className="p-4 border-b border-border/50 flex justify-between items-start bg-card/50">
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{proof.displayId}</p>
                                                <p className="text-xs text-muted-foreground">{proof.customerName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-sm text-emerald-500">Rs. {proof.amount.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{new Date(proof.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="relative aspect-[3/4] bg-black/5 flex items-center justify-center overflow-hidden">
                                            <img src={proof.screenshot} alt={`Proof ${proof.displayId}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <a href={proof.screenshot} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100">
                                                <div className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-xl">
                                                    View Full Image <ExternalLink className="size-3" />
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
