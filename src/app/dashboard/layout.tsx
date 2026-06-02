"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import "./dashboard.css"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart2,
  Sparkles, Home, Settings, ChevronLeft, ChevronRight,
  Bell, Search, LogOut, Zap, Command, X, Palette,
  User, CreditCard, HelpCircle, ChevronUp,
} from "lucide-react"


type NavItem = {
  label: string;
  href: string;
  icon: any;
  badge?: string; // <-- '?' ka matlab hai ye optional hai
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

// 👇 2. NAV_GROUPS ke sath : NavGroup[] lagayen 👇
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState("")
  const [userMenu, setUserMenu] = useState(false)
  const [time, setTime] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

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

  const sideW = collapsed ? 64 : 240

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#040408" }}>

      {/* ── SEARCH MODAL ── */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <Search style={{ width: 15, height: 15, color: "rgba(139,92,246,0.6)", flexShrink: 0 }} />
              <input
                autoFocus
                placeholder="Search products, orders, settings..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontSize: 14.5, color: "#ececf1", fontFamily: "'Inter', sans-serif",
                }}
              />
              <button onClick={() => setSearchOpen(false)} style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: 4, borderRadius: 6, color: "rgba(236,236,241,0.3)", display: "flex",
              }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <div style={{ padding: "10px 18px 14px", display: "flex", gap: 18 }}>
              {[["↵", "select"], ["↑↓", "navigate"], ["Esc", "close"]].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 11.5, color: "rgba(236,236,241,0.3)"
                }}>
                  <span style={{
                    padding: "2px 6px", borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
                    color: "rgba(236,236,241,0.45)",
                  }}>{k}</span>
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: sideW,
        background: "#07071a",
        display: "flex", flexDirection: "column",
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 50, overflow: "hidden",
      }}>
        <div className="sidebar-glow-line" />

        {/* Ambient top orb */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        {/* ── Logo ── */}
        <div style={{
          height: 60, display: "flex", alignItems: "center",
          padding: collapsed ? "0 18px" : "0 18px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0, gap: 12, overflow: "hidden",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}>
            <Sparkles style={{ width: 15, height: 15, color: "white" }} strokeWidth={2} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: 15, fontWeight: 700, color: "#ececf1",
                letterSpacing: "-0.4px", lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}>Quadlix</div>
              <div style={{
                fontSize: 10, color: "rgba(139,92,246,0.6)",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.5px", whiteSpace: "nowrap",
              }}>AI Commerce</div>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "16px 10px 8px" }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>

              {/* Group label */}
              {!collapsed && (
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.8px", textTransform: "uppercase",
                  color: "rgba(236,236,241,0.22)",
                  padding: "0 10px 6px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {group.label}
                </div>
              )}
              {collapsed && gi > 0 && (
                <div style={{
                  height: 1, margin: "8px 10px 12px",
                  background: "rgba(255,255,255,0.06)",
                }} />
              )}

              {group.items.map(({ label, href, icon: Icon, badge }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={true}
                    className={`nav-link ${active ? "active" : ""}`}
                    style={{
                      padding: collapsed ? "9px 0" : "8px 10px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      color: active ? "#ececf1" : "rgba(236,236,241,0.4)",
                      gap: 10, marginBottom: 2,
                    }}
                  >
                    {/* Active indicator */}
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

                    <Icon style={{
                      flexShrink: 0, width: 16, height: 16,
                      color: active ? "#a78bfa" : "currentColor",
                      transition: "color 0.15s",
                    }} strokeWidth={active ? 2.5 : 1.75} />

                    {!collapsed && (
                      <span style={{
                        fontSize: 13.5, fontWeight: active ? 500 : 400,
                        flex: 1, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                        letterSpacing: "-0.1px",
                      }}>
                        {label}
                      </span>
                    )}

                    {/* Badge */}
                    {!collapsed && badge && (
                      <span className="ai-badge-pulse" style={{
                        fontSize: 9, fontWeight: 700,
                        padding: "2px 6px", borderRadius: 99,
                        background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                        color: "white", letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}>
                        {badge}
                      </span>
                    )}

                    {/* Tooltip */}
                    {collapsed && (
                      <div className="nav-tooltip" style={{
                        position: "absolute", left: "calc(100% + 12px)",
                        padding: "7px 12px", borderRadius: 8,
                        background: "#12122a",
                        border: "1px solid rgba(139,92,246,0.18)",
                        color: "#ececf1", fontSize: 12.5, fontWeight: 500,
                        whiteSpace: "nowrap", pointerEvents: "none",
                        opacity: 0, transition: "opacity 0.15s",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        zIndex: 99,
                      }}>
                        {label}
                        {badge && (
                          <span style={{
                            marginLeft: 6, fontSize: 9, fontWeight: 700,
                            padding: "1px 5px", borderRadius: 99,
                            background: "#8b5cf6", color: "white",
                          }}>{badge}</span>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── AI Status pill ── */}
        {!collapsed && (
          <div style={{
            margin: "0 10px 10px", padding: "10px 12px",
            background: "rgba(139,92,246,0.05)",
            border: "1px solid rgba(139,92,246,0.12)",
            borderRadius: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
              <span className="dot-blink" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#10b981", flexShrink: 0,
                boxShadow: "0 0 6px rgba(16,185,129,0.6)",
              }} />
              <span style={{
                fontSize: 10.5, fontWeight: 600,
                color: "rgba(236,236,241,0.5)",
                fontFamily: "'JetBrains Mono', monospace",
              }}>AI Models Online</span>
            </div>
            <div style={{
              fontSize: 10.5, color: "rgba(236,236,241,0.22)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>GPT-4o · DALL·E 3 · Claude</div>
          </div>
        )}

        {/* ── User section with dropdown ── */}
        <div
          ref={menuRef}
          style={{
            padding: "8px 10px 10px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            position: "relative",
          }}
        >
          {/* User dropdown menu */}
          {userMenu && (
            <div className={`user-dropdown ${collapsed ? "collapsed" : ""}`}>
              {/* User info header */}
              <div style={{
                padding: "14px 14px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "white",
                    boxShadow: "0 0 14px rgba(139,92,246,0.4)",
                  }}>A</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ececf1" }}>Admin</div>
                    <div style={{ fontSize: 11, color: "rgba(236,236,241,0.35)" }}>admin@quadlix.com</div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: "6px 0" }}>
                <button className="dropdown-item">
                  <User style={{ width: 14, height: 14, flexShrink: 0 }} />
                  My Profile
                </button>
                <Link href="/dashboard/settings" prefetch={true} className="dropdown-item" onClick={() => setUserMenu(false)}>
                  <Settings style={{ width: 14, height: 14, flexShrink: 0 }} />
                  Account Settings
                </Link>
                <button className="dropdown-item">
                  <CreditCard style={{ width: 14, height: 14, flexShrink: 0 }} />
                  Billing & Plans
                </button>
                <button className="dropdown-item">
                  <HelpCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                  Help & Support
                </button>
              </div>

              <div className="dropdown-sep" />

              <div style={{ padding: "6px 0 8px" }}>
                <button
                  className="dropdown-item danger"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          )}

          {/* User trigger button */}
          <button
            onClick={() => setUserMenu(p => !p)}
            style={{
              width: "100%", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center",
              gap: 10, padding: collapsed ? "8px 0" : "8px 10px",
              borderRadius: 10, justifyContent: collapsed ? "center" : "flex-start",
              background: userMenu ? "rgba(139,92,246,0.08)" : "transparent",
              transition: "background 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => {
              if (!userMenu) e.currentTarget.style.background = "rgba(255,255,255,0.05)"
            }}
            onMouseLeave={e => {
              if (!userMenu) e.currentTarget.style.background = "transparent"
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white",
              boxShadow: "0 0 12px rgba(139,92,246,0.35)",
              border: userMenu ? "2px solid rgba(139,92,246,0.5)" : "2px solid transparent",
              transition: "border 0.15s",
            }}>A</div>

            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#ececf1",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>Admin</div>
                  <div style={{
                    fontSize: 11, color: "rgba(236,236,241,0.3)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>Store Owner</div>
                </div>
                <ChevronUp style={{
                  width: 14, height: 14,
                  color: "rgba(236,236,241,0.25)",
                  transform: userMenu ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 0.2s",
                  flexShrink: 0,
                }} />
              </>
            )}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: "100%", padding: "6px 0", marginTop: 4,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              borderRadius: 8, border: "none",
              background: "transparent", cursor: "pointer",
              color: "rgba(236,236,241,0.2)", fontSize: 11.5,
              transition: "all 0.15s", fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "rgba(236,236,241,0.55)"
              e.currentTarget.style.background = "rgba(255,255,255,0.04)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(236,236,241,0.2)"
              e.currentTarget.style.background = "transparent"
            }}
          >
            {collapsed
              ? <ChevronRight style={{ width: 14, height: 14 }} />
              : <><ChevronLeft style={{ width: 14, height: 14 }} /><span>Collapse</span></>
            }
          </button>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      <header style={{
        position: "fixed", top: 0, right: 0, zIndex: 40, height: 60,
        left: sideW,
        background: "rgba(4,4,8,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center",
        padding: "0 24px", gap: 16,
        transition: "left 0.26s cubic-bezier(0.4,0,0.2,1)",
      }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span style={{ color: "rgba(236,236,241,0.3)" }}>Quadlix</span>
          <ChevronRight style={{ width: 12, height: 12, color: "rgba(236,236,241,0.15)" }} />
          <span style={{ color: "#ececf1", fontWeight: 500 }}>{currentPage}</span>
        </div>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="topbar-search-btn"
          style={{
            flex: 1, maxWidth: 300, height: 34,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 9, padding: "0 12px",
            display: "flex", alignItems: "center", gap: 8,
            cursor: "text", transition: "all 0.15s",
          }}
        >
          <Search style={{ width: 13, height: 13, color: "rgba(236,236,241,0.22)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "rgba(236,236,241,0.2)", flex: 1, textAlign: "left" }}>
            Search...
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 2,
            padding: "2px 5px", borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <Command style={{ width: 9, height: 9, color: "rgba(236,236,241,0.25)" }} />
            <span style={{
              fontSize: 9.5, color: "rgba(236,236,241,0.25)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>K</span>
          </div>
        </button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>

          {/* Clock */}
          <div style={{
            padding: "4px 10px", borderRadius: 7,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, color: "rgba(236,236,241,0.35)",
          }}>{time}</div>

          {/* AI Studio shortcut */}
          <Link
            href="/dashboard/ai-studio"
            prefetch={true}
            className="ai-studio-btn"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 8,
              background: "rgba(139,92,246,0.08)",
              border: "1px solid rgba(139,92,246,0.2)",
              textDecoration: "none", transition: "all 0.15s",
            }}
          >
            <Zap style={{ width: 12, height: 12, color: "#a78bfa" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>AI Studio</span>
          </Link>

          {/* Notifications */}
          <button
            className="icon-btn"
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
              transition: "all 0.15s", color: "rgba(236,236,241,0.38)",
            }}
          >
            <Bell style={{ width: 15, height: 15 }} />
            <span style={{
              position: "absolute", top: 7, right: 7,
              width: 6, height: 6, borderRadius: "50%",
              background: "#8b5cf6", border: "1.5px solid #040408",
            }} />
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main
        className="page-wrap"
        style={{
          flex: 1, minHeight: "100vh", paddingTop: 60,
          marginLeft: sideW,
          transition: "margin-left 0.26s cubic-bezier(0.4,0,0.2,1)",
          background: "#040408",
        }}
      >
        <div style={{
          position: "fixed", top: 60, left: sideW, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.1) 50%, transparent 100%)",
          pointerEvents: "none", zIndex: 30,
          transition: "left 0.26s cubic-bezier(0.4,0,0.2,1)",
        }} />
        <div style={{ padding: "28px 28px" }}>
          {children}
        </div>
      </main>
    </div>
  )
}