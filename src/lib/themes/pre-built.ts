import { ThemeConfig, BuilderBlock } from "@/types/theme-types"

export interface PreBuiltTheme {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    config: ThemeConfig;
}

function createBaseConfig(name: string, primaryColor: string, font: string, bgColor: string = "#ffffff", textColor: string = "#000000", layoutId: 'nova' | 'minimal' | 'enigma' = 'nova'): ThemeConfig {
    return {
        mode: 'builder',
        layoutId,
        branding: { storeName: name, logoUrl: "", primaryColor, secondaryColor: "#111111", fontFamily: font, favicon: "" },
        navigation: { links: [{label: "Home", href: "/"}, {label: "Catalog", href: "/collection"}], showCart: true, sticky: true },
        hero: { show: false, headline: "", subheadline: "", buttonText: "", buttonUrl: "", bgImage: "", showBadge: false, badgeText: "", showSecondaryBtn: false, secondaryBtnText: "" },
        features: { show: false, title: "", subtitle: "", items: [] },
        productsSection: { show: false, title: "", subtitle: "", count: 4, showViewAll: false, viewAllText: "" },
        testimonials: { show: false, title: "", items: [] },
        faq: { show: false, title: "", items: [] },
        cta: { show: false, headline: "", subtext: "", buttonText: "", buttonUrl: "" },
        banner: { show: false, text: "", bgColor: primaryColor, textColor: "#ffffff" },
        aiAssistant: { show: true, name: "AI Assistant", welcomeMessage: "Hi! How can I help you shop today?", primaryColor },
        footer: { text: `© 2026 ${name}. All rights reserved.`, showSocial: true, links: [] },
        styles: { bgColor, textColor, cardBg: bgColor === '#ffffff' ? '#f5f5f5' : '#1a1a1a', borderColor: bgColor === '#ffffff' ? '#e5e5e5' : '#333333', headingFont: font, bodyFont: font, primaryColor },
        customPages: [],
        blocks: []
    }
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const PRE_BUILT_THEMES: PreBuiltTheme[] = [
    {
        id: "theme-tech-nova",
        name: "Tech Nova",
        description: "A sleek, dark-mode focused theme perfect for modern gadgets and tech accessories.",
        previewImage: "https://images.unsplash.com/photo-1550009158-9fdf6c8bea23?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Tech Nova", "#3b82f6", "Inter", "#0a0a0a", "#f8fafc"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-modern",
                    props: {
                        headline: "The Future of Tech",
                        subheadline: "Discover the latest gadgets and accessories to elevate your digital life.",
                        buttonText: "Shop Collection",
                        buttonUrl: "/collection",
                        imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.7
                    },
                    animation: { entrance: "fade-in", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "features-grid",
                    props: {
                        title: "Why Choose Us",
                        subtitle: "Premium tech gear with unmatched support",
                        items: [
                            { icon: "Zap", title: "Fast Shipping", desc: "Next day delivery on all items." },
                            { icon: "Shield", title: "Secure Checkout", desc: "256-bit encryption for your security." },
                            { icon: "Headset", title: "24/7 Support", desc: "Our AI assistant is always here to help." }
                        ]
                    },
                    animation: { entrance: "slide-up", hover: "lift" },
                    styles: { backgroundColor: "#111111", paddingTop: "60px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "Trending Gear",
                        subtitle: "Our most popular tech accessories",
                        count: 4,
                        viewAllText: "View All Products"
                    },
                    animation: { entrance: "fade-in", hover: "scale" },
                    styles: { paddingTop: "60px", paddingBottom: "60px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-nova',
                    props: { text: "© 2026 Tech Nova", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-beauty-blush",
        name: "Beauty Blush",
        description: "Soft, elegant, and clean. Designed for cosmetics, skincare, and beauty brands.",
        previewImage: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Beauty Blush", "#ec4899", "Playfair Display", "#fffdfd", "#333333", "minimal"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-minimal',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-centered",
                    props: {
                        headline: "Pure Elegance",
                        subheadline: "Organic, cruelty-free skincare for your natural beauty.",
                        buttonText: "Shop Skincare",
                        buttonUrl: "/collection",
                        bgImage: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.4
                    },
                    animation: { entrance: "slide-up", hover: "none" },
                    styles: { textColor: "#111", fontFamily: "Playfair Display" }
                },
                {
                    id: generateId(),
                    type: "product-slider",
                    props: {
                        title: "Best Sellers",
                        subtitle: "Loved by thousands of women worldwide",
                        count: 4,
                        viewAllText: "Discover More"
                    },
                    animation: { entrance: "fade-in", hover: "glow" },
                    styles: { backgroundColor: "#fff5f7", paddingTop: "80px", paddingBottom: "80px" }
                },
                {
                    id: generateId(),
                    type: "testimonial-slider",
                    props: {
                        title: "Real Results",
                        items: [
                            { name: "Sarah J.", role: "Verified Buyer", text: "My skin has never felt this hydrated and glowing!", rating: 5 },
                            { name: "Emily W.", role: "Beauty Blogger", text: "The absolute best skincare routine I've ever tried.", rating: 5 }
                        ]
                    },
                    animation: { entrance: "fade-in", hover: "lift" },
                    styles: { paddingTop: "60px", paddingBottom: "60px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-minimal',
                    props: { text: "© 2026 Beauty Blush", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-urban-street",
        name: "Urban Street",
        description: "Bold, edgy, and high-contrast. The perfect vibe for streetwear and fashion apparel.",
        previewImage: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Urban Street", "#ef4444", "Oswald", "#18181b", "#ffffff", "enigma"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-split",
                    props: {
                        headline: "NEW DROP. NEW RULES.",
                        subheadline: "Redefining streetwear for the modern generation.",
                        buttonText: "EXPLORE COLLECTION",
                        buttonUrl: "/collection",
                        imageUrl: "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.6
                    },
                    animation: { entrance: "zoom-in", hover: "none" },
                    styles: { fontWeight: "900", letterSpacing: "2px" }
                },
                {
                    id: generateId(),
                    type: "cta-banner",
                    props: {
                        headline: "🔥 FREE SHIPPING ON ALL ORDERS OVER $100 🔥",
                        subtext: "Limited time offer.",
                        buttonText: "SHOP NOW",
                        buttonUrl: "/collection"
                    },
                    animation: { entrance: "none", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "LATEST ARRIVALS",
                        subtitle: "",
                        count: 8,
                        viewAllText: "VIEW ALL"
                    },
                    animation: { entrance: "slide-up", hover: "grayscale-to-color" },
                    styles: { paddingTop: "80px", paddingBottom: "40px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-enigma',
                    props: { text: "© 2026 Urban Street", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-home-haven",
        name: "Home Haven",
        description: "Warm, inviting, and spacious. Great for furniture, home decor, and interior design stores.",
        previewImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Home Haven", "#d97706", "Lora", "#fdfbf7", "#2c1e16", "minimal"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-minimal',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-modern",
                    props: {
                        headline: "Make Your House a Home",
                        subheadline: "Curated furniture and decor to bring warmth to your living spaces.",
                        buttonText: "Shop Furniture",
                        buttonUrl: "/collection",
                        bgImage: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.3
                    },
                    animation: { entrance: "fade-in", hover: "none" },
                    styles: { textColor: "#2c1e16" }
                },
                {
                    id: generateId(),
                    type: "features-grid",
                    props: {
                        title: "Our Guarantee",
                        subtitle: "",
                        items: [
                            { icon: "Truck", title: "Free Delivery", desc: "On all large furniture items." },
                            { icon: "RefreshCw", title: "30-Day Returns", desc: "Not satisfied? Send it back." },
                            { icon: "Award", title: "Premium Quality", desc: "Crafted with the finest materials." }
                        ]
                    },
                    animation: { entrance: "slide-up", hover: "none" },
                    styles: { backgroundColor: "#f5ece3", paddingTop: "60px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "Featured Collections",
                        subtitle: "Explore our latest living room sets",
                        count: 4,
                        viewAllText: "View Catalog"
                    },
                    animation: { entrance: "fade-in", hover: "lift" },
                    styles: { paddingTop: "80px", paddingBottom: "80px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-minimal',
                    props: { text: "© 2026 Home Haven", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-fitness-pro",
        name: "Fitness Pro",
        description: "Energetic and dynamic. Perfect for gym wear, supplements, and fitness equipment.",
        previewImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Fitness Pro", "#10b981", "Roboto", "#0f172a", "#f8fafc", "enigma"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-split",
                    props: {
                        headline: "PUSH YOUR LIMITS",
                        subheadline: "High-performance gear for high-performance athletes.",
                        buttonText: "SHOP EQUIPMENT",
                        buttonUrl: "/collection",
                        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.7
                    },
                    animation: { entrance: "slide-up", hover: "none" },
                    styles: { textTransform: "uppercase", fontWeight: "bold" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "TOP RATED GEAR",
                        subtitle: "",
                        count: 4,
                        viewAllText: "SEE ALL"
                    },
                    animation: { entrance: "fade-in", hover: "scale" },
                    styles: { paddingTop: "60px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "cta-banner",
                    props: {
                        headline: "JOIN THE PRO CLUB",
                        subtext: "Get 20% off your first order and exclusive access to new drops.",
                        buttonText: "SIGN UP NOW",
                        buttonUrl: "/account"
                    },
                    animation: { entrance: "zoom-in", hover: "glow" },
                    styles: { backgroundColor: "#10b981", textColor: "#ffffff", paddingTop: "80px", paddingBottom: "80px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-enigma',
                    props: { text: "© 2026 Fitness Pro", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-minimal-store",
        name: "Minimalist Essentials",
        description: "A clean, distraction-free design that lets your products speak for themselves.",
        previewImage: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Essentials", "#000000", "Inter", "#ffffff", "#000000", "minimal"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-minimal',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-centered",
                    props: {
                        headline: "Less is More.",
                        subheadline: "Thoughtfully designed everyday essentials.",
                        buttonText: "Shop Now",
                        buttonUrl: "/collection",
                        bgImage: "https://images.unsplash.com/photo-1499939667766-4afceb292d05?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.1
                    },
                    animation: { entrance: "fade-in", hover: "none" },
                    styles: { textColor: "#000" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "New Arrivals",
                        subtitle: "",
                        count: 8,
                        viewAllText: "Shop All"
                    },
                    animation: { entrance: "slide-up", hover: "lift" },
                    styles: { paddingTop: "100px", paddingBottom: "100px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-minimal',
                    props: { text: "© 2026 Essentials", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-luxe-jewelry",
        name: "Luxe Jewelry",
        description: "Sophisticated and luxurious. Crafted for fine jewelry and luxury watches.",
        previewImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Luxe", "#d4af37", "Cinzel", "#000000", "#ffffff", "enigma"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-modern",
                    props: {
                        headline: "Timeless Elegance",
                        subheadline: "Exquisite pieces crafted to perfection.",
                        buttonText: "View Collection",
                        buttonUrl: "/collection",
                        imageUrl: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.6
                    },
                    animation: { entrance: "fade-in", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "features-grid",
                    props: {
                        title: "The Luxe Promise",
                        subtitle: "",
                        items: [
                            { icon: "Gem", title: "Certified Diamonds", desc: "Conflict-free and ethically sourced." },
                            { icon: "Shield", title: "Lifetime Warranty", desc: "We stand by our craftsmanship." },
                            { icon: "Gift", title: "Luxury Packaging", desc: "Every piece arrives in a beautiful box." }
                        ]
                    },
                    animation: { entrance: "slide-up", hover: "glow" },
                    styles: { backgroundColor: "#111111", paddingTop: "80px", paddingBottom: "80px" }
                },
                {
                    id: generateId(),
                    type: "product-slider",
                    props: {
                        title: "Signature Collection",
                        subtitle: "",
                        count: 4,
                        viewAllText: "Discover All"
                    },
                    animation: { entrance: "fade-in", hover: "scale" },
                    styles: { paddingTop: "80px", paddingBottom: "80px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-enigma',
                    props: { text: "© 2026 Luxe", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-organic-market",
        name: "Organic Market",
        description: "Fresh and vibrant. Perfect for organic foods, grocery delivery, and wellness products.",
        previewImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Organic Market", "#16a34a", "Poppins", "#f0fdf4", "#064e3b"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-split",
                    props: {
                        headline: "Fresh to Your Door",
                        subheadline: "100% organic, locally sourced produce and groceries.",
                        buttonText: "Shop Fresh",
                        buttonUrl: "/collection",
                        imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=2000&q=80",
                        overlayOpacity: 0.4
                    },
                    animation: { entrance: "zoom-in", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "Farm Fresh Picks",
                        subtitle: "Picked today, delivered tomorrow.",
                        count: 8,
                        viewAllText: "Browse Aisles"
                    },
                    animation: { entrance: "slide-up", hover: "lift" },
                    styles: { paddingTop: "60px", paddingBottom: "60px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-nova',
                    props: { text: "© 2026 Organic Market", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-cyberpunk-edge",
        name: "Cyberpunk Edge",
        description: "High contrast, brutalist design. Perfect for underground fashion, techwear, or edgy electronics.",
        previewImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Cyber Edge", "#a855f7", "Courier New", "#000000", "#10b981", "enigma"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-brutalist",
                    props: {
                        headline: "NEON DREAMS",
                        subheadline: "Gear up for the next century. Unapologetic style.",
                        buttonText: "JACK IN",
                        buttonUrl: "/collection"
                    },
                    animation: { entrance: "none", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "product-masonry",
                    props: {
                        title: "LATEST DROPS",
                        count: 6
                    },
                    animation: { entrance: "fade-in", hover: "glow" }
                },
                {
                    id: generateId(),
                    type: "text-image-left",
                    props: {
                        title: "NO COMPROMISE",
                        content: "Our materials are sourced from the outer rims. Built to last through the apocalypse and look good doing it.",
                        image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=1000&q=80"
                    },
                    animation: { entrance: "slide-up", hover: "none" },
                    styles: { paddingTop: "80px", paddingBottom: "80px" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-enigma',
                    props: { text: "© 2026 Cyber Edge", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-zen-spa",
        name: "Zen Spa & Wellness",
        description: "Calm, soothing aesthetics. Ideal for spa services, essential oils, and wellness products.",
        previewImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Zen Wellness", "#0f766e", "Lora", "#f0fdf4", "#134e4a", "minimal"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-minimal',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-video",
                    props: {
                        headline: "Find Your Center",
                        subheadline: "Holistic wellness products crafted with mindfulness.",
                        buttonText: "Explore Remedies",
                        buttonUrl: "/collection",
                        videoUrl: "https://player.vimeo.com/external/517090025.sd.mp4?s=d003fba8e678972d7f3ffef5e1ed4f53ecf92c10&profile_id=164&oauth2_token_id=57447761"
                    },
                    animation: { entrance: "fade-in", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "features-list",
                    props: {
                        title: "The Path to Wellness",
                        subtitle: "Our guiding principles for a better you.",
                        items: [
                            { title: "100% Natural", desc: "No artificial additives, ever." },
                            { title: "Sustainably Sourced", desc: "We protect the earth that heals us." },
                            { title: "Cruelty Free", desc: "Tested on humans, loved by humans." }
                        ]
                    },
                    animation: { entrance: "slide-up", hover: "none" },
                    styles: { paddingTop: "100px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "product-slider",
                    props: {
                        title: "Calming Rituals",
                        count: 6
                    },
                    animation: { entrance: "fade-in", hover: "none" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-minimal',
                    props: { text: "© 2026 Zen Wellness", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-gourmet-delights",
        name: "Gourmet Delights",
        description: "Rich and elegant. Tailored for fine wines, artisan chocolates, and luxury foods.",
        previewImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Gourmet", "#9f1239", "Playfair Display", "#1c1917", "#f5f5f4", "enigma"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-centered",
                    props: {
                        headline: "A Taste of Luxury",
                        subheadline: "Indulge in our curated selection of artisanal delicacies.",
                        buttonText: "View Menu",
                        buttonUrl: "/collection",
                        bgImage: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=2000&q=80"
                    },
                    animation: { entrance: "zoom-in", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "text-image-right",
                    props: {
                        title: "Masterfully Crafted",
                        content: "Every item in our collection is selected by world-renowned sommeliers and chefs.",
                        image: "https://images.unsplash.com/photo-1559564114-569b0a41703e?auto=format&fit=crop&w=1000&q=80"
                    },
                    animation: { entrance: "slide-up", hover: "none" },
                    styles: { paddingTop: "80px", paddingBottom: "40px" }
                },
                {
                    id: generateId(),
                    type: "product-masonry",
                    props: {
                        title: "Our Cellar",
                        count: 6
                    },
                    animation: { entrance: "fade-in", hover: "scale" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-enigma',
                    props: { text: "© 2026 Gourmet", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-adventure-gear",
        name: "Adventure Gear",
        description: "Rugged and earthy. Built for outdoor equipment, camping gear, and exploration apparel.",
        previewImage: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Adventure Co", "#b45309", "Inter", "#fafaf9", "#292524"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-split",
                    props: {
                        headline: "ANSWER THE CALL",
                        subheadline: "Equipment that survives whatever the wild throws at you.",
                        buttonText: "GEAR UP",
                        buttonUrl: "/collection",
                        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80"
                    },
                    animation: { entrance: "slide-up", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "features-grid",
                    props: {
                        title: "Built Tough",
                        items: [
                            { icon: "Shield", title: "Weatherproof", desc: "Rain, snow, or mud - you stay dry." },
                            { icon: "Globe", title: "Global Shipping", desc: "We deliver wherever your expedition starts." },
                            { icon: "CheckCircle2", title: "Lifetime Warranty", desc: "If it breaks, we replace it." }
                        ]
                    },
                    animation: { entrance: "zoom-in", hover: "none" },
                    styles: { backgroundColor: "#e7e5e4", paddingTop: "60px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "product-slider",
                    props: {
                        title: "Top Rated Gear",
                        count: 6
                    },
                    animation: { entrance: "fade-in", hover: "lift" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-nova',
                    props: { text: "© 2026 Adventure Co", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-playful-kids",
        name: "Playful Kids",
        description: "Bright, colorful, and fun. Great for toys, children's clothing, and subscription boxes.",
        previewImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("Playful", "#0284c7", "Quicksand", "#fffbeb", "#1e3a8a"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-modern",
                    props: {
                        headline: "Where Imagination Lives!",
                        subheadline: "Educational toys and games to spark endless creativity.",
                        buttonText: "Shop Toys",
                        buttonUrl: "/collection"
                    },
                    animation: { entrance: "bounce", hover: "none" },
                    styles: { backgroundColor: "#fef08a", paddingTop: "120px", paddingBottom: "120px" }
                },
                {
                    id: generateId(),
                    type: "product-catalog",
                    props: {
                        title: "Fun Favorites",
                        count: 8
                    },
                    animation: { entrance: "fade-in", hover: "scale" },
                    styles: { paddingTop: "60px", paddingBottom: "40px" }
                },
                {
                    id: generateId(),
                    type: "pricing-simple",
                    props: {
                        title: "Monthly Surprise Boxes",
                        plans: [
                            { name: "Explorer", price: "$29", features: "3 toys a month + activity guide" },
                            { name: "Genius", price: "$49", features: "5 toys a month + 2 books" }
                        ]
                    },
                    animation: { entrance: "slide-up", hover: "lift" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-nova',
                    props: { text: "© 2026 Playful", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-artisan-crafts",
        name: "Artisan Crafts",
        description: "Warm, textured, and authentic. Designed for handmade goods, pottery, and vintage items.",
        previewImage: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("The Artisan", "#9a3412", "Merriweather", "#f5f5f4", "#431407", "minimal"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-minimal',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "text-image-left",
                    props: {
                        title: "Crafted by Hand, Loved by Heart",
                        content: "Discover unique, one-of-a-kind pieces made by skilled artisans from around the world.",
                        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=80"
                    },
                    animation: { entrance: "fade-in", hover: "none" },
                    styles: { paddingTop: "100px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "product-masonry",
                    props: {
                        title: "Latest Creations",
                        count: 6
                    },
                    animation: { entrance: "slide-up", hover: "grayscale-to-color" }
                },
                {
                    id: generateId(),
                    type: "testimonial-slider",
                    props: {
                        title: "What They Say",
                        items: [
                            { name: "Anna K.", role: "Collector", text: "The craftsmanship is unparalleled. Truly beautiful.", rating: 5 },
                            { name: "Mark R.", role: "Interior Designer", text: "Perfect pieces that add soul to any room.", rating: 5 }
                        ]
                    },
                    animation: { entrance: "fade-in", hover: "none" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-minimal',
                    props: { text: "© 2026 The Artisan", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    },
    {
        id: "theme-future-saas",
        name: "Future SaaS B2B",
        description: "Professional, sharp, and data-driven. The ultimate theme for software, digital products, and B2B services.",
        previewImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        config: {
            ...createBaseConfig("CloudSync", "#4f46e5", "Inter", "#0f172a", "#f8fafc", "enigma"),
            blocks: [
                {
                    id: generateId(),
                    type: 'header-nova',
                    props: { showLogo: true, links: [{ label: 'Shop', href: '/collection' }, { label: 'About', href: '/about' }] },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                },
                {
                    id: generateId(),
                    type: "hero-centered",
                    props: {
                        headline: "Scale Without Limits",
                        subheadline: "The enterprise platform designed for hyperspeed growth.",
                        buttonText: "Start Free Trial",
                        buttonUrl: "/account",
                        bgImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80"
                    },
                    animation: { entrance: "zoom-in", hover: "none" }
                },
                {
                    id: generateId(),
                    type: "pricing-simple",
                    props: {
                        title: "Transparent Pricing",
                        plans: [
                            { name: "Starter", price: "$49", features: "Up to 5 users, basic analytics" },
                            { name: "Enterprise", price: "$199", features: "Unlimited users, dedicated support" }
                        ]
                    },
                    animation: { entrance: "slide-up", hover: "lift" },
                    styles: { paddingTop: "80px", paddingBottom: "60px" }
                },
                {
                    id: generateId(),
                    type: "faq-accordion",
                    props: {
                        title: "Common Questions",
                        questions: [
                            { q: "Is there a setup fee?", a: "No, setup is completely free on all plans." },
                            { q: "Can I cancel anytime?", a: "Yes, we do not lock you into long-term contracts." },
                            { q: "Do you offer custom integrations?", a: "Enterprise plans include custom API support." }
                        ]
                    },
                    animation: { entrance: "fade-in", hover: "none" }
                }
            ,
                {
                    id: generateId(),
                    type: 'footer-enigma',
                    props: { text: "© 2026 CloudSync", showSocial: true },
                    animation: { entrance: 'none', hover: 'none' },
                    styles: { paddingTop: '0px', paddingBottom: '0px' }
                }
            ]
        }
    }
]
