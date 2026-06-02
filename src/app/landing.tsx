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
    },
    {
        num: "02",
        title: "Revenue Intelligence",
        desc: "Predictive analytics that surface what's selling, what's stalling, and exactly when to restock — before you need to ask.",
        tag: "Forecasting",
    },
    {
        num: "03",
        title: "Storefront Builder",
        desc: "Launch a fully branded storefront in under 5 minutes. Custom domains, themes, and checkout — zero code required.",
        tag: "No-Code",
    },
    {
        num: "04",
        title: "AI Image Studio",
        desc: "Transform plain product photos into studio-quality imagery. Remove backgrounds, generate lifestyle shots, batch process hundreds at once.",
        tag: "Computer Vision",
    },
    {
        num: "05",
        title: "Inventory Autopilot",
        desc: "Smart reorder points, supplier alerts, and demand forecasting that keeps your shelves stocked without the spreadsheets.",
        tag: "Automation",
    },
    {
        num: "06",
        title: "Multi-Channel Sync",
        desc: "One dashboard for every platform. Sync products, orders, and inventory across Shopify, Amazon, Instagram, and more.",
        tag: "Integrations",
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
    },
    {
        quote: "Revenue is up 41% since switching. The inventory forecasting alone paid for itself in the first week.",
        name: "Omar Khalid",
        role: "CEO, Urban Threads PK",
        metric: "$180K saved",
    },
    {
        quote: "I launched my entire store in 4 minutes. The AI generated all 60 product descriptions while I had coffee.",
        name: "Priya Nair",
        role: "Solo founder, Luminos",
        metric: "Day 1 sales",
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
    const [scrollY, setScrollY] = useState(0)
    const heroRef = useRef<HTMLDivElement>(null)
    const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set())
    const featureRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
        const onScroll = () => setScrollY(window.scrollY)
        window.addEventListener("mousemove", onMove)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll) }
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #06060c;
          --surface:   #0d0d18;
          --surface2:  #13131f;
          --border:    rgba(255,255,255,0.07);
          --border2:   rgba(255,255,255,0.12);
          --text:      #f0eff8;
          --muted:     rgba(240,239,248,0.4);
          --sub:       rgba(240,239,248,0.65);
          --gold:      #c9a96e;
          --gold2:     #e8c990;
          --indigo:    #6366f1;
          --violet:    #8b5cf6;
          --glow:      rgba(99,102,241,0.15);
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }

        /* Noise overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 1000;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 64px;
          background: rgba(6,6,12,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          transition: background 0.3s;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .nav-logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-mark svg { width: 16px; height: 16px; }
        .nav-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700;
          color: var(--text); letter-spacing: -0.3px;
        }
        .nav-links {
          display: flex; align-items: center; gap: 32px;
          list-style: none;
        }
        .nav-links a {
          font-size: 13.5px; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.15s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .btn-ghost-sm {
          padding: 7px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          color: var(--sub); border: 1px solid var(--border);
          background: transparent; cursor: pointer;
          text-decoration: none; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost-sm:hover { color: var(--text); border-color: var(--border2); }
        .btn-gold {
          padding: 8px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          color: #0a0a12;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          border: none; cursor: pointer; text-decoration: none;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 20px rgba(201,169,110,0.3);
        }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(201,169,110,0.45); }

        /* HERO */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 48px 80px;
          overflow: hidden;
          text-align: center;
        }
        .hero-cursor-glow {
          position: fixed; pointer-events: none; z-index: 2;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%);
          transform: translate(-50%, -50%);
          transition: left 0.15s ease, top 0.15s ease;
          filter: blur(20px);
        }
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%);
        }
        .hero-glow-1 {
          position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
          width: 800px; height: 500px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 65%);
          filter: blur(60px); pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute; bottom: 0; right: -10%;
          width: 500px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(201,169,110,0.08) 0%, transparent 65%);
          filter: blur(80px); pointer-events: none;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px;
          border: 1px solid rgba(201,169,110,0.25);
          background: rgba(201,169,110,0.06);
          font-size: 11.5px; font-weight: 600;
          color: var(--gold); letter-spacing: 0.5px;
          margin-bottom: 28px; position: relative; z-index: 2;
          animation: fadeUp 0.7s ease both;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--gold); animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }

        .hero-headline {
          position: relative; z-index: 2;
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 7vw, 88px);
          font-weight: 900; line-height: 1.02;
          letter-spacing: -2px;
          color: var(--text);
          max-width: 900px;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .hero-headline em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 50%, #f5dfa0 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          position: relative; z-index: 2;
          font-size: 17px; line-height: 1.65;
          color: var(--muted); max-width: 520px;
          margin: 20px auto 0;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        .hero-actions {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; margin-top: 36px;
          position: relative; z-index: 2;
          animation: fadeUp 0.7s 0.3s ease both;
          flex-wrap: wrap;
        }
        .btn-hero-primary {
          display: inline-flex; align-items: center; gap-8px;
          padding: 14px 32px; border-radius: 12px;
          font-size: 15px; font-weight: 600;
          color: #06060c; text-decoration: none;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
          border: none; cursor: pointer;
          box-shadow: 0 8px 32px rgba(201,169,110,0.35);
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          gap: 8px;
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(201,169,110,0.5); }
        .btn-hero-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          font-size: 15px; font-weight: 500;
          color: var(--sub); text-decoration: none;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .btn-hero-ghost:hover { color: var(--text); border-color: var(--border2); background: rgba(255,255,255,0.07); }

        .hero-social-proof {
          display: flex; align-items: center; justify-content: center; gap: 16px;
          margin-top: 32px; position: relative; z-index: 2;
          animation: fadeUp 0.7s 0.4s ease both;
        }
        .avatars { display: flex; }
        .avatar {
          width: 30px; height: 30px; border-radius: 50%;
          border: 2px solid var(--bg);
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          margin-left: -8px; first:margin-left: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white;
        }
        .avatar:first-child { margin-left: 0; }
        .social-text { font-size: 12.5px; color: var(--muted); }
        .social-text strong { color: var(--sub); font-weight: 600; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* STATS BAR */
        .stats-bar {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          display: grid; grid-template-columns: repeat(4, 1fr);
        }
        .stat-item {
          padding: 32px 40px;
          border-right: 1px solid var(--border);
          text-align: center;
        }
        .stat-item:last-child { border-right: none; }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; line-height: 1;
        }
        .stat-label { font-size: 12.5px; color: var(--muted); margin-top: 6px; }

        /* FEATURES */
        .section { padding: 100px 48px; max-width: 1200px; margin: 0 auto; }
        .section-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px; letter-spacing: 2px;
          color: var(--gold); text-transform: uppercase;
          margin-bottom: 12px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -1px; color: var(--text);
          max-width: 560px;
        }
        .section-title em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; margin-top: 56px;
          border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          background: var(--border);
        }
        .feature-card {
          background: var(--surface);
          padding: 36px 32px;
          transition: background 0.2s;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease, background 0.2s;
        }
        .feature-card.visible { opacity: 1; transform: translateY(0); }
        .feature-card:hover { background: var(--surface2); }
        .feature-num {
          font-family: 'DM Mono', monospace;
          font-size: 11px; color: var(--gold);
          letter-spacing: 1px; margin-bottom: 20px;
        }
        .feature-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          color: var(--text); margin-bottom: 10px;
          line-height: 1.2;
        }
        .feature-desc { font-size: 13.5px; color: var(--muted); line-height: 1.65; }
        .feature-tag {
          display: inline-block; margin-top: 20px;
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 1px;
          color: var(--indigo);
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          padding: 4px 10px; border-radius: 4px;
          text-transform: uppercase;
        }

        /* TESTIMONIALS */
        .testimonials-section {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 100px 48px;
        }
        .testimonials-inner { max-width: 1200px; margin: 0 auto; }
        .testimonials-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px; margin-top: 56px;
        }
        .testimonial-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 16px; padding: 28px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .testimonial-card:hover { border-color: var(--border2); transform: translateY(-3px); }
        .stars { display: flex; gap: 3px; margin-bottom: 16px; }
        .star { width: 14px; height: 14px; color: var(--gold); fill: var(--gold); }
        .testimonial-quote {
          font-size: 14px; line-height: 1.7; color: var(--sub);
          font-style: italic; margin-bottom: 20px;
        }
        .testimonial-author { display: flex; align-items: center; gap: 12px; }
        .author-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px; color: white; flex-shrink: 0;
        }
        .author-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .author-role { font-size: 11.5px; color: var(--muted); }
        .author-metric {
          margin-left: auto;
          font-family: 'DM Mono', monospace;
          font-size: 10.5px; color: var(--gold);
          background: rgba(201,169,110,0.08);
          border: 1px solid rgba(201,169,110,0.2);
          padding: 3px 8px; border-radius: 4px;
        }

        /* PRICING */
        .pricing-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 20px; margin-top: 56px;
          align-items: start;
        }
        .plan-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px; padding: 32px;
          position: relative; transition: all 0.2s;
        }
        .plan-card:hover { border-color: var(--border2); transform: translateY(-3px); }
        .plan-card.highlight {
          background: linear-gradient(160deg, rgba(99,102,241,0.08) 0%, var(--surface) 60%);
          border-color: rgba(99,102,241,0.35);
          box-shadow: 0 0 60px rgba(99,102,241,0.1);
        }
        .plan-badge-pill {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          padding: 4px 14px; border-radius: 100px;
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          font-size: 11px; font-weight: 700;
          color: white; white-space: nowrap;
          box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        }
        .plan-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          color: var(--text); margin-bottom: 4px;
        }
        .plan-desc { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
        .plan-price {
          display: flex; align-items: baseline; gap: 4px;
          margin-bottom: 24px;
        }
        .plan-price-val {
          font-family: 'Playfair Display', serif;
          font-size: 44px; font-weight: 900; color: var(--text); line-height: 1;
        }
        .plan-price-per { font-size: 14px; color: var(--muted); }
        .plan-features { list-style: none; space-y: 10px; margin-bottom: 28px; }
        .plan-feature {
          display: flex; align-items: center; gap: 10px;
          font-size: 13.5px; color: var(--sub); padding: 5px 0;
        }
        .plan-feature-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--gold); flex-shrink: 0;
        }
        .plan-cta {
          display: block; width: 100%; padding: 12px;
          border-radius: 10px; text-align: center;
          font-size: 14px; font-weight: 600;
          cursor: pointer; text-decoration: none;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .plan-cta-primary {
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          color: white; border: none;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35);
        }
        .plan-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.5); }
        .plan-cta-ghost {
          background: transparent;
          color: var(--sub); border: 1px solid var(--border);
        }
        .plan-cta-ghost:hover { border-color: var(--border2); color: var(--text); }

        /* CTA SECTION */
        .cta-section {
          padding: 120px 48px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 700px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 65%);
          filter: blur(60px); pointer-events: none;
        }
        .cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 900; line-height: 1.05;
          letter-spacing: -1.5px; color: var(--text);
          max-width: 700px; margin: 0 auto 20px;
          position: relative; z-index: 1;
        }
        .cta-title em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold), var(--gold2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cta-sub {
          font-size: 16px; color: var(--muted); max-width: 440px;
          margin: 0 auto 36px; line-height: 1.6;
          position: relative; z-index: 1;
        }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; position: relative; z-index: 1; }

        /* FOOTER */
        .footer {
          border-top: 1px solid var(--border);
          padding: 40px 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-logo {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: var(--sub);
        }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: var(--sub); }
        .footer-copy { font-size: 12px; color: var(--muted); }

        @media (max-width: 900px) {
          .nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hero { padding: 100px 24px 60px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stat-item { border-right: none; border-bottom: 1px solid var(--border); }
          .section { padding: 60px 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .testimonials-section { padding: 60px 24px; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .cta-section { padding: 80px 24px; }
          .footer { padding: 32px 24px; flex-direction: column; text-align: center; }
          .footer-links { justify-content: center; }
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="#06060c" strokeWidth="2.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <span className="nav-logo-name">Quadlix</span>
                </a>
                <ul className="nav-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#testimonials">Customers</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#">Docs</a></li>
                </ul>
                <div className="nav-actions">
                    <Link href="/login" className="btn-ghost-sm">Sign in</Link>
                    <Link href="/login" className="btn-gold">Start free →</Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero" ref={heroRef}>
                <div className="hero-grid" />
                <div className="hero-glow-1" />
                <div className="hero-glow-2" />

                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    AI-powered commerce — now in Pakistan & beyond
                </div>

                <h1 className="hero-headline">
                    Your entire store,<br />
                    run by <em>artificial</em><br />
                    intelligence.
                </h1>

                <p className="hero-sub">
                    Quadlix gives every merchant the unfair advantage of AI —
                    from product copy to revenue forecasting, automated and
                    always-on.
                </p>

                <div className="hero-actions">
                    <Link href="/login" className="btn-hero-primary">
                        Launch your store free
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <a href="#features" className="btn-hero-ghost">
                        See how it works
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 9l-7 7-7-7" />
                        </svg>
                    </a>
                </div>

                <div className="hero-social-proof">
                    <div className="avatars">
                        {["S", "B", "F", "O", "P"].map((l, i) => (
                            <div key={i} className="avatar" style={{
                                background: `linear-gradient(135deg, hsl(${220 + i * 20},70%,55%), hsl(${260 + i * 15},70%,45%))`,
                                marginLeft: i === 0 ? 0 : -8
                            }}>{l}</div>
                        ))}
                    </div>
                    <p className="social-text"><strong>9,200+ merchants</strong> already scaling with Quadlix</p>
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

            {/* ── FEATURES ── */}
            <div id="features">
                <div className="section">
                    <p className="section-eyebrow">// capabilities</p>
                    <h2 className="section-title">
                        Everything you need to sell <em>smarter</em>
                    </h2>

                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div
                                key={i}
                                className={`feature-card ${visibleFeatures.has(i) ? "visible" : ""}`}
                                ref={el => { featureRefs.current[i] = el }}
                                style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
                            >
                                <div className="feature-num">{f.num}</div>
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
                    <p className="section-eyebrow">// merchant stories</p>
                    <h2 className="section-title">
                        Real results, <em>real merchants</em>
                    </h2>
                    <div className="testimonials-grid">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <div className="stars">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <svg key={j} className="star" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="testimonial-quote">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{t.name[0]}</div>
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
                    <p className="section-eyebrow">// pricing</p>
                    <h2 className="section-title">
                        Simple pricing, <em>no surprises</em>
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
                                            <span className="plan-feature-dot" />
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
                <h2 className="cta-title">
                    Ready to build your <em>empire?</em>
                </h2>
                <p className="cta-sub">
                    Join thousands of merchants who've handed the heavy lifting to AI.
                    Your first 14 days are completely free.
                </p>
                <div className="cta-actions">
                    <Link href="/login" className="btn-hero-primary">
                        Start building free
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                    <a href="#pricing" className="btn-hero-ghost">View pricing</a>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-logo">Quadlix</div>
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