"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { getStoreTrialStatus } from "../onboarding/actions"
import "./dashboard.css"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "sonner"
import { getStoreUrl } from "@/lib/utils"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2,
  Sparkles, Home, Settings, ChevronLeft, ChevronRight,
  Bell, Search, LogOut, Zap, Command, X, Palette,
  User, CreditCard, HelpCircle, ChevronUp, AlertCircle, Menu
} from "lucide-react"

type NavItem = {
  label: string;
  href: string;
  icon: any;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "AI Studio", href: "/dashboard/ai-studio", icon: Sparkles, badge: "New"},
    ],
  },
  {
    label: "Store",
    items: [
      { label: "Appearance", href: "/dashboard/customizer", icon: Palette },
      { label: "Storefront", href: "/store", icon: Home },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const [userMenu, setUserMenu] = useState(false)
  const [time, setTime] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  
  // Trial States Updated (Days + Hours)
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number} | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [storeDomain, setStoreDomain] = useState<string>("")

  const pathname = usePathname()
  const router = useRouter()

  // Full-screen mode for visual builder (no shell padding/scroll)
  const isCustomizer = pathname.startsWith('/dashboard/customizer')
  const menuRef = useRef<HTMLDivElement>(null)

  // ── Fetch Trial Status (Days & Hours Logic) ──
  useEffect(() => {
    getStoreTrialStatus().then((store: any) => {
      if (store) {
        if (store.subdomain) setStoreDomain(store.subdomain)
        if (store.trialEndsAt) {
          setIsSubscribed(store.subscriptionActive)
          
          const end = new Date(store.trialEndsAt).getTime()
          const now = new Date().getTime()
          const diff = end - now

          if (diff <= 0 && !store.subscriptionActive) {
            setIsExpired(true)
            setTimeLeft({ days: 0, hours: 0 })
          } else {
            // Din aur Ghante calculate kiye
            const d = Math.floor(diff / (1000 * 60 * 60 * 24))
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            setTimeLeft({ days: Math.max(0, d), hours: Math.max(0, h) })
          }
        }
      }
    })
  }, [])

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Clock
  useEffect(() => {
    const tick = () => setTime(
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Keyboard
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(p => !p) }
      if (e.key === "Escape") { setSearchOpen(false); setUserMenu(false) }
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [])

  // Click outside menu
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const currentPage = NAV_GROUPS
    .flatMap(g => g.items)
    .find(i => pathname === i.href || pathname.startsWith(i.href + "/"))
    ?.label ?? "Dashboard"

  const sideW = isMobile ? 0 : (collapsed ? 64 : 240)
  const mobileSideW = 260 // mobile drawer width
  const isBillingPage = pathname === "/dashboard/settings"
  const showBanner = timeLeft !== null && (timeLeft.days > 0 || timeLeft.hours > 0) && !isSubscribed

  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-background">

      {/* ── EXPIRATION BLOCKER MODAL ── */}
      {isExpired && !isBillingPage && (
        <div className="fixed inset-0 z-[9999] bg-background/85 backdrop-blur-xl flex items-center justify-center">
          <div className="bg-card p-10 rounded-3xl max-w-md border border-border text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="size-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Free Trial Expired</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Your 14-day free trial has officially ended. To continue managing your Quadlix store and accessing AI features, please upgrade to a pro plan.
            </p>
            <Link href="/dashboard/settings?tab=billing" className="inline-block bg-indigo-600 text-foreground px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all">
              View Billing & Upgrade
            </Link>
            <button onClick={handleLogout} className="block w-full text-center text-muted-foreground mt-5 text-sm hover:text-foreground transition-colors">
              Sign out of account
            </button>
          </div>
        </div>
      )}

      {/* ── SEARCH MODAL ── */}
      {searchOpen && (
        <div className="search-overlay bg-background/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="search-modal bg-card border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search className="size-4 text-indigo-500/60" />
              <input
                autoFocus
                placeholder="Search products, orders, settings..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5 py-3.5 flex gap-4">
              {[["↵", "select"], ["↑↓", "navigate"], ["Esc", "close"]].map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px] text-foreground/70">{k}</kbd>
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BACKDROP ── */}
      {mobileOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: isMobile ? mobileSideW : sideW,
        display: "flex", flexDirection: "column",
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        transform: isMobile ? (mobileOpen ? 'translateX(0)' : `translateX(-${mobileSideW}px)`) : 'translateX(0)',
        zIndex: isMobile ? 50 : 50, overflow: "hidden",
      }} className="bg-card border-r border-border">
        <div className="sidebar-glow-line" />

        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{
          height: 60, display: "flex", alignItems: "center",
          padding: "0 18px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0, gap: 12, overflow: "hidden",
        }}>
          <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Sparkles className="size-4 text-foreground" strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div className="text-[15px] font-bold text-foreground tracking-tight leading-[1.15] whitespace-nowrap">
                Quadlix
              </div>
              <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono tracking-wider whitespace-nowrap">
                AI Commerce
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 10px 8px" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>
              {!collapsed && (
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/40 px-2.5 mb-1.5 font-mono">
                  {group.label}
                </div>
              )}
              {collapsed && gi > 0 && (
                <div className="h-px mx-2.5 my-3 bg-border/50" />
              )}

              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                const isStoreLink = href === "/store"
                const targetHref = isStoreLink && storeDomain ? getStoreUrl(storeDomain) : href

                const LinkComponent = isStoreLink ? 'a' : Link

                return (
                  <LinkComponent
                    key={href} href={targetHref} {...(!isStoreLink ? { prefetch: true } : { target: "_blank", rel: "noopener noreferrer" })}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={`nav-link ${active ? "active" : ""}`}
                    style={{
                      padding: (!isMobile && collapsed) ? "9px 0" : "8px 10px",
                      justifyContent: (!isMobile && collapsed) ? "center" : "flex-start",
                      color: active ? "var(--foreground)" : "var(--muted-foreground)",
                      gap: 10, marginBottom: 2,
                    }}
                  >
                    {active && (
                      <span style={{
                        position: "absolute", left: 0,
                        top: "50%", transform: "translateY(-50%)",
                        width: 3, height: "55%",
                        background: "linear-gradient(180deg, #c4b5fd 0%, #7c3aed 100%)",
                        borderRadius: "0 3px 3px 0",
                        boxShadow: "2px 0 12px rgba(139,92,246,0.7)",
                      }} />
                    )}

                    <Icon className={`size-4 ${active ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground/60"}`} strokeWidth={active ? 2.5 : 1.75} />

                    {!collapsed && (
                      <span className={`text-[13.5px] ${active ? "font-semibold" : "font-normal"} flex-1 truncate tracking-tight`}>
                        {label}
                      </span>
                    )}

                    {!collapsed && badge && (
                      <span className="ai-badge-pulse text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-foreground tracking-widest uppercase">
                        {badge}
                      </span>
                    )}

                    {collapsed && (
                      <div className="nav-tooltip bg-popover border border-border text-popover-foreground shadow-xl">
                        {label}
                        {badge && (
                          <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-indigo-500 text-foreground">{badge}</span>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="mx-2.5 mb-2.5 p-3 bg-secondary/30 border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="dot-blink size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] flex-shrink-0" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest font-mono">
                AI Models Online
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground/40 font-mono">
              GPT-4o · DALL·E 3 · Claude
            </div>
          </div>
        )}

        {/* ── PLAN STATUS CARD ── */}
        {!collapsed && timeLeft !== null && (
          <div className={`mx-2.5 mb-2.5 p-3 rounded-xl border ${isSubscribed ? "bg-emerald-500/5 border-emerald-500/15" : "bg-amber-500/5 border-amber-500/15"}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                {isSubscribed ? "Pro Plan" : "Free Trial"}
              </span>
              {!isSubscribed && (
                 <Link href="/dashboard/settings?tab=billing" className="text-[10px] font-bold text-amber-500 hover:text-amber-400">Upgrade</Link>
              )}
            </div>

            {isSubscribed ? (
              <div className="text-[10px] text-muted-foreground font-medium">
                Your subscription is active.
              </div>
            ) : (
              <>
                <div className="text-[10px] text-muted-foreground mb-2">
                  Expires in <span className="text-amber-500 font-bold">{timeLeft.days}d {timeLeft.hours}h</span>
                </div>
                <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${Math.max(0, Math.min(100, (timeLeft.days / 14) * 100))}%` }} />
                </div>
              </>
            )}
          </div>
        )}

        <div ref={menuRef} style={{ padding: "8px 10px 10px", borderTop: "1px solid var(--border)", position: "relative" }}>
          {userMenu && (
            <div className={`user-dropdown bg-card border border-border shadow-2xl ${collapsed ? "collapsed" : ""}`}>
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-foreground shadow-lg shadow-indigo-500/30">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">Admin</div>
                    <div className="text-[11px] text-muted-foreground truncate">admin@quadlix.com</div>
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                <button className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <User className="size-4" /> My Profile
                </button>
                <Link href="/dashboard/settings" prefetch={true} className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" onClick={() => setUserMenu(false)}>
                  <Settings className="size-4" /> Account Settings
                </Link>
                <button 
                  onClick={() => { router.push("/dashboard/settings?tab=billing"); setUserMenu(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <CreditCard className="size-4" /> Billing & Plans
                </button>
                <button className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                  <HelpCircle className="size-4" /> Help & Support
                </button>
              </div>

              <div className="h-px bg-border my-1" />

              <div className="p-1.5">
                <button className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-500/10 transition-colors font-medium" onClick={handleLogout} disabled={loggingOut}>
                  <LogOut className="size-4" />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setUserMenu(p => !p)}
            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all ${userMenu ? "bg-secondary" : "hover:bg-secondary/50"}`}
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <div className={`size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-foreground shadow-md shadow-indigo-500/20 flex-shrink-0 border-2 ${userMenu ? "border-indigo-400" : "border-transparent"}`}>
              A
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[13px] font-bold text-foreground truncate">Admin</div>
                  <div className="text-[11px] text-muted-foreground truncate">Store Owner</div>
                </div>
                <ChevronUp className={`size-3.5 text-muted-foreground/40 transition-transform duration-200 ${userMenu ? "" : "rotate-180"}`} />
              </>
            )}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 mt-1 rounded-lg text-muted-foreground/30 hover:text-muted-foreground hover:bg-secondary/50 transition-all text-[11.5px] font-medium"
          >
            {collapsed ? <ChevronRight className="size-3.5" /> : <><ChevronLeft className="size-3.5" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      {isCustomizer ? null : (
        <header
        className="fixed top-0 right-0 z-40 h-[60px] bg-background/90 backdrop-blur-xl border-b border-border flex items-center px-4 md:px-6 gap-3 md:gap-4 transition-all duration-300"
        style={{ left: isMobile ? 0 : sideW }}
      >
        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(p => !p)}
            className="flex md:hidden size-9 rounded-lg border border-border items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        )}

        <div className="flex items-center gap-1.5 text-[13px] min-w-0">
          <span className="hidden sm:block text-muted-foreground/50 font-medium">Quadlix</span>
          <ChevronRight className="hidden sm:block size-3 text-muted-foreground/20" />
          <span className="text-foreground font-bold tracking-tight truncate">{currentPage}</span>
        </div>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 max-w-[320px] h-9 bg-secondary/50 border border-border rounded-xl px-3 flex items-center gap-2.5 hover:bg-secondary hover:border-border/80 transition-all group"
        >
          <Search className="size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/60 shrink-0" />
          <span className="text-[13px] text-muted-foreground/40 flex-1 text-left truncate hidden sm:block">Search everything...</span>
          <span className="text-[13px] text-muted-foreground/40 flex-1 text-left truncate sm:hidden">Search...</span>
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background border border-border shadow-sm shrink-0">
            <Command className="size-2.5 text-muted-foreground/50" />
            <span className="text-[9px] text-muted-foreground/50 font-bold font-mono">K</span>
          </div>
        </button>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block px-3 py-1.5 rounded-lg bg-secondary/50 border border-border font-mono text-[12px] text-muted-foreground/60">
            {time}
          </div>

          <Link
            href="/dashboard/ai-studio"
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/15 transition-all text-indigo-600 dark:text-indigo-400 no-underline shrink-0"
          >
            <Zap className="size-3.5 fill-current" />
            <span className="hidden sm:inline text-[12px] font-bold tracking-tight">AI Studio</span>
          </Link>

          <button 
            onClick={() => toast.info("No new notifications", { description: "You are all caught up!" })}
            className="size-9 rounded-lg bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-secondary transition-all relative"
          >
            <Bell className="size-4" />
            <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-indigo-500 border-2 border-background" />
          </button>

          <ThemeToggle />
        </div>
      </header>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        className="page-wrap bg-background"
        style={{
          flex: 1,
          minHeight: isCustomizer ? "100vh" : undefined,
          height: isCustomizer ? "100vh" : undefined,
          overflow: isCustomizer ? "hidden" : undefined,
          paddingTop: isCustomizer ? 0 : (showBanner ? 100 : 60),
          marginLeft: sideW, // 0 on mobile since sideW=0
          transition: "all 0.26s cubic-bezier(0.4,0,0.2,1)",
          // Expose shell dimensions as CSS vars for the builder
          ['--shell-sidebar-w' as any]: `${sideW}px`,
          ['--shell-topbar-h' as any]: `${showBanner ? 100 : 60}px`,
        }}
      >
        {isCustomizer ? (
          // Full-screen mode: no padding, no scroll for the visual builder
          children
        ) : (
          <>
            <div className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent pointer-events-none z-30 transition-all duration-300"
              style={{ top: showBanner ? 100 : 60, left: sideW }}
            />
            <div className="p-7 md:p-10">
              {children}
            </div>
          </>
        )}
      </main>
    </div>
  )
}