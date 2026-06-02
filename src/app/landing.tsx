"use client"
// src/app/landing.tsx

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

const FEATURES = [
    {
        num: "01",
        title: "AI Copywriting Engine",
        desc: "Generate conversion-optimized product descriptions, ad copy, and SEO content in seconds. Trained on millions of top-performing listings.",
        tag: "Language Model",
        icon: "✦",
    },
    {
        num: "02",
        title: "Revenue Intelligence",
        desc: "Predictive analytics that surface what's selling, what's stalling, and exactly when to restock — before you need to ask.",
        tag: "Forecasting",
        icon: "◈",
    },
    {
        num: "03",
        title: "Storefront Builder",
        desc: "Launch a fully branded storefront in under 5 minutes. Custom domains, themes, and checkout — zero code required.",
        tag: "No-Code",
        icon: "⬡",
    },
    {
        num: "04",
        title: "AI Image Studio",
        desc: "Transform plain product photos into studio-quality imagery. Remove backgrounds, generate lifestyle shots, batch process hundreds at once.",
        tag: "Computer Vision",
        icon: "◎",
    },
    {
        num: "05",
        title: "Inventory Autopilot",
        desc: "Smart reorder points, supplier alerts, and demand forecasting that keeps your shelves stocked without the spreadsheets.",
        tag: "Automation",
        icon: "⟳",
    },
    {
        num: "06",
        title: "Multi-Channel Sync",
        desc: "One dashboard for every platform. Sync products, orders, and inventory across Shopify, Amazon, Instagram, and more.",
        tag: "Integrations",
        icon: "⬢",
    },
]

const STATS = [
    { value: "$2.4M+", label: "Revenue tracked monthly" },
    { value: "184K", label: "Orders processed" },
    { value: "9,200+", label: "Active merchants" },
    { value: "34%", label: "Average revenue lift" },
]

const TESTIMONIALS = [
    {
        quote: "We replaced three SaaS tools with Quadlix. The AI writes better copy than our team, and setup took less than a day.",
        name: "Sarah Jenkins",
        role: "Founder, Minimalist Wear",
        metric: "3× YoY growth",
        initials: "SJ",
    },
    {
        quote: "Revenue is up 41% since switching. The inventory forecasting alone paid for itself in the first week.",
        name: "Omar Khalid",
        role: "CEO, Urban Threads PK",
        metric: "$180K saved",
        initials: "OK",
    },
    {
        quote: "I launched my entire store in 4 minutes. The AI generated all 60 product descriptions while I had coffee.",
        name: "Priya Nair",
        role: "Solo founder, Luminos",
        metric: "Day 1 sales",
        initials: "PN",
    },
]

const PLANS = [
    {
        name: "Starter",
        price: "$29",
        per: "/mo",
        desc: "Perfect for new merchants finding their footing.",
        features: ["Up to 100 products", "AI copywriting (50/mo)", "Basic analytics", "1 storefront", "Email support"],
        cta: "Start free trial",
        highlight: false,
    },
    {
        name: "Pro",
        price: "$79",
        per: "/mo",
        desc: "For serious merchants ready to scale with AI.",
        features: ["Unlimited products", "AI copywriting (∞)", "Revenue intelligence", "AI image studio", "Multi-channel sync", "Priority support"],
        cta: "Start free trial",
        highlight: true,
        badge: "Most Popular",
    },
    {
        name: "Enterprise",
        price: "Custom",
        per: "",
        desc: "White-glove setup for high-volume operations.",
        features: ["Everything in Pro", "Dedicated AI training", "Custom integrations", "SLA guarantee", "Dedicated CSM"],
        cta: "Talk to sales",
        highlight: false,
    },
]

export default function LandingPage() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const heroRef = useRef<HTMLDivElement>(null)
    const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())
    const featureRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
        window.addEventListener("mousemove", onMove)
        return () => window.removeEventListener("mousemove", onMove)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => {
                const idx = featureRefs.current.indexOf(e.target as HTMLDivElement)
                if (e.isIntersecting && idx !== -1) setVisibleFeatures(prev => new Set([...prev, idx]))
            }),
            { threshold: 0.15 }
        )
        featureRefs.current.forEach(r => r && observer.observe(r))
        return () => observer.disconnect()
    }, [])

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          /* Core dark blue-black palette */
          --bg:          #080b12;
          --bg2:         #0a0e17;
          --surface:     #0d1220;
          --surface2:    #111827;
          --surface3:    #161f30;
          --border:      rgba(99,139,255,0.1);
          --border2:     rgba(99,139,255,0.2);
          --border3:     rgba(99,139,255,0.35);

          /* Text */
          --text:        #e8eaf6;
          --sub:         rgba(232,234,246,0.7);
          --muted:       rgba(232,234,246,0.4);
          --faint:       rgba(232,234,246,0.18);

          /* Accent — electric blue */
          --blue:        #4f8cff;
          --blue2:       #7aa9ff;
          --blue-dim:    rgba(79,140,255,0.12);
          --blue-glow:   rgba(79,140,255,0.2);

          /* Secondary accent — cyan */
          --cyan:        #22d3ee;
          --cyan-dim:    rgba(34,211,238,0.1);

          /* Highlight — soft white-blue */
          --hl:          #a5b4fc;
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        /* Subtle scanline texture */
        body::after {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.04) 2px,
            rgba(0,0,0,0.04) 4px
          );
          pointer-events: none;
          z-index: 999;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 62px;
          background: rgba(8,11,18,0.85);
          backdrop-filter: blur(24px) saturate(1.5);
          border-bottom: 1px solid var(--border);
        }
        .nav::after {
          content: '';
          position: absolute; bottom: 0; left: 48px; right: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue) 30%, var(--cyan) 70%, transparent);
          opacity: 0.25;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .nav-logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--blue-dim);
          border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .nav-logo-mark::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
          opacity: 0.15;
        }
        .nav-logo-mark svg { width: 14px; height: 14px; position: relative; z-index: 1; }
        .nav-logo-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px; font-weight: 700;
          color: var(--text); letter-spacing: 0px;
        }
        .nav-logo-name span { color: var(--blue); }
        .nav-links {
          display: flex; align-items: center; gap: 36px;
          list-style: none;
        }
        .nav-links a {
          font-size: 13px; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.15s; letter-spacing: 0.2px;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-actions { display: flex; align-items: center; gap: 8px; }
        .btn-ghost-sm {
          padding: 7px 16px; border-radius: 7px;
          font-size: 13px; font-weight: 500;
          color: var(--sub);
          border: 1px solid var(--border);
          background: transparent; cursor: pointer;
          text-decoration: none; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost-sm:hover { color: var(--text); border-color: var(--border2); background: var(--blue-dim); }
        .btn-blue {
          padding: 8px 18px; border-radius: 7px;
          font-size: 13px; font-weight: 600;
          color: #fff; text-decoration: none;
          background: var(--blue);
          border: 1px solid rgba(79,140,255,0.5);
          cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 0 20px rgba(79,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .btn-blue:hover { background: var(--blue2); box-shadow: 0 0 32px rgba(79,140,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15); transform: translateY(-1px); }

        /* ── HERO ── */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 48px 80px;
          overflow: hidden;
          text-align: center;
        }

        /* Cursor glow */
        .hero-cursor-glow {
          position: fixed; pointer-events: none; z-index: 2;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(79,140,255,0.07) 0%, transparent 65%);
          transform: translate(-50%, -50%);
          transition: left 0.2s ease, top 0.2s ease;
        }

        /* Grid */
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(99,139,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,139,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 80%);
        }

        /* Orbs */
        .hero-orb-1 {
          position: absolute; top: -15%; left: 50%; transform: translateX(-50%);
          width: 900px; height: 600px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(79,140,255,0.08) 0%, transparent 60%);
          filter: blur(40px); pointer-events: none;
        }
        .hero-orb-2 {
          position: absolute; bottom: -10%; right: -15%;
          width: 600px; height: 500px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 60%);
          filter: blur(60px); pointer-events: none;
        }
        .hero-orb-3 {
          position: absolute; bottom: 10%; left: -10%;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(79,140,255,0.05) 0%, transparent 60%);
          filter: blur(80px); pointer-events: none;
        }

        /* Status badge */
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 5px 14px 5px 8px; border-radius: 100px;
          border: 1px solid var(--border2);
          background: rgba(79,140,255,0.06);
          font-size: 11.5px; font-weight: 500;
          color: var(--blue2); letter-spacing: 0.3px;
          margin-bottom: 28px; position: relative; z-index: 2;
          animation: fadeUp 0.6s ease both;
        }
        .badge-pill {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--blue-dim); border: 1px solid var(--border2);
          color: var(--cyan); font-size: 10px; font-weight: 600;
          padding: 2px 8px; border-radius: 100px; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 6px var(--cyan);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .hero-headline {
          position: relative; z-index: 2;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(48px, 6.5vw, 84px);
          font-weight: 800; line-height: 1.04;
          letter-spacing: -1px;
          color: var(--text);
          max-width: 820px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-headline .accent {
          background: linear-gradient(135deg, var(--blue) 0%, var(--cyan) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-headline .dim { color: var(--muted); }

        .hero-sub {
          position: relative; z-index: 2;
          font-size: 16px; line-height: 1.7; font-weight: 400;
          color: var(--muted); max-width: 500px;
          margin: 22px auto 0;
          animation: fadeUp 0.6s 0.2s ease both;
        }

        .hero-actions {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-top: 36px;
          position: relative; z-index: 2;
          animation: fadeUp 0.6s 0.3s ease both;
          flex-wrap: wrap;
        }
        .btn-hero-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 10px;
          font-size: 14.5px; font-weight: 600;
          color: #fff; text-decoration: none;
          background: var(--blue);
          border: 1px solid rgba(79,140,255,0.4);
          cursor: pointer;
          box-shadow: 0 0 40px rgba(79,140,255,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .btn-hero-primary:hover { background: var(--blue2); transform: translateY(-2px); box-shadow: 0 0 60px rgba(79,140,255,0.45), inset 0 1px 0 rgba(255,255,255,0.15); }
        .btn-hero-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 24px; border-radius: 10px;
          font-size: 14.5px; font-weight: 500;
          color: var(--sub); text-decoration: none;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .btn-hero-ghost:hover { color: var(--text); border-color: var(--border2); background: var(--blue-dim); }

        .hero-social-proof {
          display: flex; align-items: center; justify-content: center; gap: 14px;
          margin-top: 28px; position: relative; z-index: 2;
          animation: fadeUp 0.6s 0.4s ease both;
        }
        .avatars { display: flex; }
        .avatar {
          width: 28px; height: 28px; border-radius: 50%;
          border: 2px solid var(--bg);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 700; color: white;
        }
        .avatar:not(:first-child) { margin-left: -8px; }
        .social-text { font-size: 12.5px; color: var(--muted); }
        .social-text strong { color: var(--sub); font-weight: 600; }

        /* Rating stars */
        .hero-rating {
          display: flex; align-items: center; gap: 6px;
          margin-top: 16px; position: relative; z-index: 2;
          animation: fadeUp 0.6s 0.5s ease both;
          justify-content: center;
        }
        .stars-row { display: flex; gap: 2px; }
        .star-icon { font-size: 11px; color: var(--cyan); }
        .rating-text { font-size: 11.5px; color: var(--muted); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── STATS BAR ── */
        .stats-bar {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          display: grid; grid-template-columns: repeat(4, 1fr);
          position: relative; overflow: hidden;
        }
        .stats-bar::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue) 30%, var(--cyan) 70%, transparent);
          opacity: 0.2;
        }
        .stat-item {
          padding: 30px 36px;
          border-right: 1px solid var(--border);
          text-align: center; position: relative;
        }
        .stat-item:last-child { border-right: none; }
        .stat-item:hover { background: rgba(79,140,255,0.03); }
        .stat-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 34px; font-weight: 800;
          background: linear-gradient(135deg, var(--blue2), var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; line-height: 1;
        }
        .stat-label { font-size: 12px; color: var(--muted); margin-top: 6px; letter-spacing: 0.3px; }

        /* ── SECTION ── */
        .section { padding: 96px 48px; max-width: 1200px; margin: 0 auto; }
        .section-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10.5px; letter-spacing: 2.5px;
          color: var(--blue); text-transform: uppercase;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .section-eyebrow::before {
          content: '';
          display: inline-block; width: 20px; height: 1px;
          background: var(--blue); opacity: 0.6;
        }
        .section-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(30px, 3.5vw, 48px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.6px; color: var(--text);
          max-width: 540px;
        }
        .section-title .accent {
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── FEATURES GRID ── */
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; margin-top: 52px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
        }
        .feature-card {
          background: var(--surface);
          padding: 32px 28px;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease, background 0.2s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover::before { opacity: 0.5; }
        .feature-card.visible { opacity: 1; transform: translateY(0); }
        .feature-card:hover { background: var(--surface3); }

        .feature-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 18px;
        }
        .feature-num {
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: var(--muted);
          letter-spacing: 1.5px;
        }
        .feature-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--blue-dim);
          border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: var(--blue2);
        }
        .feature-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 17px; font-weight: 700;
          color: var(--text); margin-bottom: 10px;
          line-height: 1.25; letter-spacing: 0px;
        }
        .feature-desc { font-size: 13px; color: var(--muted); line-height: 1.7; font-weight: 400; }
        .feature-tag {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 18px;
          font-family: 'DM Mono', monospace;
          font-size: 9.5px; letter-spacing: 1.2px;
          color: var(--cyan);
          background: var(--cyan-dim);
          border: 1px solid rgba(34,211,238,0.15);
          padding: 4px 10px; border-radius: 4px;
          text-transform: uppercase;
        }
        .feature-tag::before { content: '//'; opacity: 0.5; }

        /* ── DASHBOARD PREVIEW ── */
        .preview-section {
          padding: 0 48px 96px;
          max-width: 1200px; margin: 0 auto;
        }
        .preview-frame {
          border: 1px solid var(--border2);
          border-radius: 16px; overflow: hidden;
          background: var(--surface);
          position: relative;
        }
        .preview-frame::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue) 30%, var(--cyan) 70%, transparent);
          opacity: 0.5;
        }
        .preview-topbar {
          height: 40px; background: var(--surface2);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px; padding: 0 16px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-red { background: #ff5f57; }
        .dot-yellow { background: #febc2e; }
        .dot-green { background: #28c840; }
        .preview-url {
          flex: 1; margin: 0 12px;
          background: var(--surface3);
          border: 1px solid var(--border);
          border-radius: 5px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: var(--muted);
        }
        .preview-content {
          padding: 20px;
          display: grid; grid-template-columns: 200px 1fr;
          gap: 12px; min-height: 280px;
        }
        .preview-sidebar {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px; padding: 14px;
        }
        .preview-sidebar-logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 700; color: var(--text);
          margin-bottom: 16px; padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .preview-nav-item {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 8px; border-radius: 6px;
          font-size: 11px; color: var(--muted); margin-bottom: 2px;
          cursor: default;
        }
        .preview-nav-item.active { background: var(--blue-dim); color: var(--blue2); }
        .preview-nav-dot { width: 6px; height: 6px; border-radius: 1px; background: currentColor; opacity: 0.6; }
        .preview-main { display: flex; flex-direction: column; gap: 12px; }
        .preview-cards {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
        }
        .preview-card {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px; padding: 12px;
        }
        .preview-card-label { font-size: 9px; color: var(--muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
        .preview-card-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 18px; font-weight: 700;
          background: linear-gradient(135deg, var(--blue2), var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .preview-chart {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px; padding: 12px; flex: 1;
          display: flex; align-items: flex-end; gap: 5px;
          min-height: 100px;
        }
        .chart-bar {
          flex: 1; border-radius: 4px 4px 0 0;
          background: var(--blue-dim);
          border: 1px solid var(--border2);
          border-bottom: none;
          transition: background 0.2s;
        }
        .chart-bar.hi { background: linear-gradient(to top, rgba(79,140,255,0.3), rgba(34,211,238,0.2)); border-color: rgba(79,140,255,0.3); }

        /* ── TESTIMONIALS ── */
        .testimonials-section {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 96px 48px;
          position: relative; overflow: hidden;
        }
        .testimonials-section::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue) 30%, var(--cyan) 70%, transparent);
          opacity: 0.2;
        }
        .testimonials-inner { max-width: 1200px; margin: 0 auto; }
        .testimonials-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-top: 52px;
        }
        .testimonial-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 26px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .testimonial-card::before {
          content: '"';
          position: absolute; top: -10px; right: 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 80px; font-weight: 800;
          color: var(--blue); opacity: 0.06; line-height: 1;
          pointer-events: none;
        }
        .testimonial-card:hover { border-color: var(--border2); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(79,140,255,0.07); }
        .stars { display: flex; gap: 3px; margin-bottom: 14px; }
        .star-svg { width: 12px; height: 12px; fill: var(--cyan); }
        .testimonial-quote {
          font-size: 13.5px; line-height: 1.7; color: var(--sub);
          font-style: normal; margin-bottom: 20px; font-weight: 400;
        }
        .testimonial-author { display: flex; align-items: center; gap: 10px; }
        .author-avatar {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--blue-dim);
          border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px;
          color: var(--blue2); flex-shrink: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .author-name { font-size: 12.5px; font-weight: 600; color: var(--text); }
        .author-role { font-size: 11px; color: var(--muted); }
        .author-metric {
          margin-left: auto;
          font-family: 'DM Mono', monospace;
          font-size: 10px; color: var(--cyan);
          background: var(--cyan-dim);
          border: 1px solid rgba(34,211,238,0.15);
          padding: 3px 8px; border-radius: 4px; white-space: nowrap;
        }

        /* ── PRICING ── */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-top: 52px;
          align-items: start;
        }
        .plan-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          position: relative; transition: all 0.2s;
        }
        .plan-card:hover { border-color: var(--border2); transform: translateY(-3px); }
        .plan-card.highlight {
          background: linear-gradient(160deg, rgba(79,140,255,0.06) 0%, var(--surface) 50%);
          border-color: rgba(79,140,255,0.3);
          box-shadow: 0 0 60px rgba(79,140,255,0.08), 0 0 0 1px rgba(79,140,255,0.1);
        }
        .plan-card.highlight:hover { border-color: rgba(79,140,255,0.5); }
        .plan-badge-pill {
          position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
          padding: 3px 12px; border-radius: 100px;
          background: var(--blue);
          border: 1px solid rgba(79,140,255,0.5);
          font-size: 10.5px; font-weight: 700;
          color: white; white-space: nowrap;
          box-shadow: 0 0 20px rgba(79,140,255,0.4);
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.3px;
        }
        .plan-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 20px; font-weight: 700;
          color: var(--text); margin-bottom: 4px; letter-spacing: 0px;
        }
        .plan-desc { font-size: 12.5px; color: var(--muted); margin-bottom: 22px; line-height: 1.5; }
        .plan-price {
          display: flex; align-items: baseline; gap: 3px;
          margin-bottom: 22px; padding-bottom: 22px;
          border-bottom: 1px solid var(--border);
        }
        .plan-price-val {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 40px; font-weight: 800; color: var(--text); line-height: 1;
          letter-spacing: -1px;
        }
        .plan-price-per { font-size: 13px; color: var(--muted); }
        .plan-features { list-style: none; margin-bottom: 24px; }
        .plan-feature {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: var(--sub); padding: 6px 0;
          border-bottom: 1px solid rgba(99,139,255,0.04);
        }
        .plan-feature:last-child { border-bottom: none; }
        .plan-feature-check {
          width: 16px; height: 16px; border-radius: 4px;
          background: var(--blue-dim); border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 9px; color: var(--cyan);
        }
        .plan-cta {
          display: block; width: 100%; padding: 11px;
          border-radius: 9px; text-align: center;
          font-size: 13.5px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .plan-cta-primary {
          background: var(--blue);
          color: white; border: 1px solid rgba(79,140,255,0.4);
          box-shadow: 0 0 24px rgba(79,140,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .plan-cta-primary:hover { background: var(--blue2); box-shadow: 0 0 36px rgba(79,140,255,0.4); }
        .plan-cta-ghost {
          background: transparent;
          color: var(--sub); border: 1px solid var(--border);
        }
        .plan-cta-ghost:hover { border-color: var(--border2); color: var(--text); background: var(--blue-dim); }

        /* ── CTA SECTION ── */
        .cta-section {
          padding: 120px 48px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 800px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(79,140,255,0.06) 0%, transparent 65%);
          filter: blur(60px); pointer-events: none;
        }
        .cta-border {
          max-width: 900px; margin: 0 auto;
          border: 1px solid var(--border2);
          border-radius: 24px; padding: 72px 48px;
          background: var(--surface);
          position: relative; overflow: hidden;
        }
        .cta-border::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue) 30%, var(--cyan) 70%, transparent);
          opacity: 0.4;
        }
        .cta-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(36px, 4.5vw, 60px);
          font-weight: 800; line-height: 1.08;
          letter-spacing: -1px; color: var(--text);
          max-width: 620px; margin: 0 auto 16px;
          position: relative; z-index: 1;
        }
        .cta-title .accent {
          background: linear-gradient(135deg, var(--blue), var(--cyan));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cta-sub {
          font-size: 15px; color: var(--muted); max-width: 420px;
          margin: 0 auto 32px; line-height: 1.65;
          position: relative; z-index: 1;
        }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; position: relative; z-index: 1; }
        .cta-note {
          margin-top: 14px; font-size: 11.5px; color: var(--muted);
          display: flex; align-items: center; justify-content: center; gap: 12px;
        }
        .cta-note span { display: flex; align-items: center; gap: 4px; }
        .cta-note-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted); }

        /* ── FOOTER ── */
        .footer {
          border-top: 1px solid var(--border);
          padding: 36px 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          background: var(--surface);
        }
        .footer-logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 700; color: var(--sub);
        }
        .footer-logo span { color: var(--blue); }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-size: 12.5px; color: var(--muted); text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: var(--sub); }
        .footer-copy { font-size: 11.5px; color: var(--faint); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hero { padding: 100px 24px 60px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2) { border-right: none; }
          .stat-item { border-bottom: 1px solid var(--border); }
          .section { padding: 60px 24px; }
          .preview-section { padding: 0 24px 60px; }
          .features-grid { grid-template-columns: 1fr; }
          .testimonials-section { padding: 60px 24px; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 60px 24px; }
          .cta-border { padding: 40px 24px; }
          .footer { padding: 28px 24px; flex-direction: column; text-align: center; }
          .footer-links { justify-content: center; }
          .preview-content { grid-template-columns: 1fr; }
          .preview-sidebar { display: none; }
          .preview-cards { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

            {/* Cursor glow */}
            <div
                className="hero-cursor-glow"
                style={{ left: mousePos.x, top: mousePos.y }}
            />

            {/* ── NAV ── */}
            <nav className="nav">
                <a href="#" className="nav-logo">
                    <div className="nav-logo-mark">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue2)" strokeWidth="2.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <span className="nav-logo-name">Quad<span>lix</span></span>
                </a>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#testimonials">Customers</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#">Docs</a></li>
                </ul>
                <div className="nav-actions">
                    <Link href="/login" className="btn-ghost-sm">Sign in</Link>
                    <Link href="/login" className="btn-blue">Get started →</Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero" ref={heroRef}>
                <div className="hero-grid" />
                <div className="hero-orb-1" />
                <div className="hero-orb-2" />
                <div className="hero-orb-3" />

                <div className="hero-badge">
                    <span className="badge-pill">
                        <span className="badge-dot" />
                        Live
                    </span>
                    AI-powered commerce platform for Pakistan & beyond
                </div>

                <h1 className="hero-headline">
                    Your entire store,<br />
                    run by <span className="accent">artificial</span><br />
                    <span className="dim">intelligence.</span>
                </h1>

                <p className="hero-sub">
                    Quadlix gives every merchant the unfair advantage of AI —
                    from product copy to revenue forecasting, automated and always-on.
                </p>

                <div className="hero-actions">
                    <Link href="/login" className="btn-hero-primary">
                        Launch your store free
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <a href="#features" className="btn-hero-ghost">
                        See how it works
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </a>
                </div>

                <div className="hero-social-proof">
                    <div className="avatars">
                        {["S", "O", "P", "F", "B"].map((l, i) => (
                            <div key={i} className="avatar" style={{
                                background: `linear-gradient(135deg, hsl(${210 + i * 15},70%,40%), hsl(${230 + i * 12},80%,35%))`,
                            }}>{l}</div>
                        ))}
                    </div>
                    <p className="social-text"><strong>9,200+ merchants</strong> already scaling with Quadlix</p>
                </div>

                <div className="hero-rating">
                    <div className="stars-row">
                        {[...Array(5)].map((_, i) => <span key={i} className="star-icon">★</span>)}
                    </div>
                    <span className="rating-text">4.9/5 from 800+ reviews · No credit card required</span>
                </div>
            </section>

            {/* ── STATS ── */}
            <div className="stats-bar">
                {STATS.map(s => (
                    <div key={s.label} className="stat-item">
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── DASHBOARD PREVIEW ── */}
            <div className="preview-section">
                <div className="preview-frame">
                    <div className="preview-topbar">
                        <div className="dot dot-red" />
                        <div className="dot dot-yellow" />
                        <div className="dot dot-green" />
                        <div className="preview-url">app.quadlix.io/dashboard</div>
                    </div>
                    <div className="preview-content">
                        <div className="preview-sidebar">
                            <div className="preview-sidebar-logo">Quadlix</div>
                            {["Dashboard", "Products", "Orders", "Analytics", "AI Studio", "Settings"].map((item, i) => (
                                <div key={i} className={`preview-nav-item ${i === 0 ? "active" : ""}`}>
                                    <div className="preview-nav-dot" />
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="preview-main">
                            <div className="preview-cards">
                                {[
                                    { label: "Revenue", val: "$12,840" },
                                    { label: "Orders", val: "348" },
                                    { label: "Conversion", val: "3.4%" },
                                    { label: "AI Saves", val: "42h" },
                                ].map((c, i) => (
                                    <div key={i} className="preview-card">
                                        <div className="preview-card-label">{c.label}</div>
                                        <div className="preview-card-val">{c.val}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="preview-chart">
                                {[30, 45, 38, 60, 52, 70, 58, 80, 65, 90, 75, 95].map((h, i) => (
                                    <div
                                        key={i}
                                        className={`chart-bar ${h > 65 ? "hi" : ""}`}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FEATURES ── */}
            <div id="features">
                <div className="section">
                    <p className="section-eyebrow">capabilities</p>
                    <h2 className="section-title">
                        Everything you need to sell <span className="accent">smarter</span>
                    </h2>

                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div
                                key={i}
                                className={`feature-card ${visibleFeatures.has(i) ? "visible" : ""}`}
                                ref={el => { featureRefs.current[i] = el }}
                                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
                            >
                                <div className="feature-top">
                                    <div className="feature-num">{f.num}</div>
                                    <div className="feature-icon">{f.icon}</div>
                                </div>
                                <h3 className="feature-title">{f.title}</h3>
                                <p className="feature-desc">{f.desc}</p>
                                <span className="feature-tag">{f.tag}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── TESTIMONIALS ── */}
            <div id="testimonials" className="testimonials-section">
                <div className="testimonials-inner">
                    <p className="section-eyebrow">merchant stories</p>
                    <h2 className="section-title">
                        Real results, <span className="accent">real merchants</span>
                    </h2>
                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <div className="stars">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <svg key={j} className="star-svg" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="testimonial-quote">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{t.initials}</div>
                                    <div>
                                        <div className="author-name">{t.name}</div>
                                        <div className="author-role">{t.role}</div>
                                    </div>
                                    <div className="author-metric">{t.metric}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── PRICING ── */}
            <div id="pricing">
                <div className="section">
                    <p className="section-eyebrow">pricing</p>
                    <h2 className="section-title">
                        Simple pricing, <span className="accent">no surprises</span>
                    </h2>
                    <div className="pricing-grid">
                        {PLANS.map((plan, i) => (
                            <div key={i} className={`plan-card ${plan.highlight ? "highlight" : ""}`}>
                                {plan.badge && <div className="plan-badge-pill">{plan.badge}</div>}
                                <div className="plan-name">{plan.name}</div>
                                <div className="plan-desc">{plan.desc}</div>
                                <div className="plan-price">
                                    <span className="plan-price-val">{plan.price}</span>
                                    {plan.per && <span className="plan-price-per">{plan.per}</span>}
                                </div>
                                <ul className="plan-features">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="plan-feature">
                                            <span className="plan-feature-check">✓</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/login"
                                    className={`plan-cta ${plan.highlight ? "plan-cta-primary" : "plan-cta-ghost"}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-glow" />
                <div className="cta-border">
                    <h2 className="cta-title">
                        Ready to build your <span className="accent">empire?</span>
                    </h2>
                    <p className="cta-sub">
                        Join thousands of merchants who've handed the heavy lifting to AI.
                        Your first 14 days are completely free.
                    </p>
                    <div className="cta-actions">
                        <Link href="/login" className="btn-hero-primary">
                            Start building free
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <a href="#pricing" className="btn-hero-ghost">View pricing</a>
                    </div>
                    <div className="cta-note">
                        <span>✓ No credit card</span>
                        <span className="cta-note-dot" />
                        <span>✓ Cancel anytime</span>
                        <span className="cta-note-dot" />
                        <span>✓ 14-day free trial</span>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-logo">Quad<span>lix</span></div>
                <div className="footer-links">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Docs</a>
                    <a href="#">Status</a>
                    <a href="#">Contact</a>
                </div>
                <div className="footer-copy">© 2024 Quadlix. All rights reserved.</div>
            </footer>
        </>
    )
}