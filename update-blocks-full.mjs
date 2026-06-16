import fs from 'fs';

const clientPath = 'src/app/dashboard/customizer/builder-client.tsx';
let clientContent = fs.readFileSync(clientPath, 'utf8');

const additionalTemplates = `
    'hero-split': {
        type: 'hero-split',
        props: { headline: 'Elegant & Bold', subheadline: 'Create a lasting impression.', buttonText: 'Discover', buttonUrl: '/collection', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' },
        animation: { entrance: 'fade-in', hover: 'none' },
        styles: { paddingTop: '80px', paddingBottom: '80px' }
    },
    'hero-centered': {
        type: 'hero-centered',
        props: { headline: 'Minimalist Design', subheadline: 'Focus on what matters.', buttonText: 'Shop All', buttonUrl: '/collection', bgImage: 'https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=1600' },
        animation: { entrance: 'zoom-in', hover: 'none' },
        styles: { paddingTop: '200px', paddingBottom: '200px', textColor: '#ffffff' }
    },
    'features-list': {
        type: 'features-list',
        props: { title: 'Core Features', subtitle: 'Everything you need to succeed.', items: [{ title: 'Fast', desc: 'Optimized for speed.' }, { title: 'Secure', desc: 'Bank-level security.' }] },
        animation: { entrance: 'slide-up', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'features-cards': {
        type: 'features-cards',
        props: { title: 'Capabilities', items: [{ title: 'Design', desc: 'Stunning layouts.' }, { title: 'Scale', desc: 'Grow without limits.' }] },
        animation: { entrance: 'fade-in', hover: 'lift' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'product-slider': {
        type: 'product-slider',
        props: { title: 'Trending Now', count: 6 },
        animation: { entrance: 'slide-up', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'product-featured': {
        type: 'product-featured',
        props: { title: 'Deal of the Day' },
        animation: { entrance: 'zoom-in', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'testimonial-grid': {
        type: 'testimonial-grid',
        props: { title: 'Wall of Love', items: [{ text: 'Incredible.', name: 'John Doe', role: 'CEO' }, { text: 'Outstanding.', name: 'Jane Smith', role: 'CTO' }] },
        animation: { entrance: 'fade-in', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'pricing-simple': {
        type: 'pricing-simple',
        props: { title: 'Simple Pricing', plans: [{ name: 'Basic', price: '$9', features: '1 Project' }, { name: 'Pro', price: '$29', features: 'Unlimited' }] },
        animation: { entrance: 'slide-up', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'faq-accordion': {
        type: 'faq-accordion',
        props: { title: 'Common Questions', questions: [{ q: 'Is it free?', a: 'Yes, basic is free.' }, { q: 'Can I cancel?', a: 'Anytime.' }] },
        animation: { entrance: 'fade-in', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'contact-simple': {
        type: 'contact-simple',
        props: { title: 'Get in Touch', email: 'hello@example.com' },
        animation: { entrance: 'slide-up', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'text-image-left': {
        type: 'text-image-left',
        props: { title: 'Our Story', content: 'We build things that matter.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' },
        animation: { entrance: 'fade-in', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
    'text-image-right': {
        type: 'text-image-right',
        props: { title: 'Our Mission', content: 'Empowering creators worldwide.', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800' },
        animation: { entrance: 'fade-in', hover: 'none' },
        styles: { paddingTop: '100px', paddingBottom: '100px' }
    },
`;

clientContent = clientContent.replace(
    /const BLOCK_TEMPLATES: Record<string, Partial<BuilderBlock>> = \{/,
    \`const BLOCK_TEMPLATES: Record<string, Partial<BuilderBlock>> = {\\n\${additionalTemplates}\`
);

// Add icons for new types
const additionalIcons = \`
                                        {type.startsWith('hero-') && <Zap className="size-4 text-amber-500" />}
                                        {type.startsWith('features-') && <Layout className="size-4 text-blue-500" />}
                                        {type.startsWith('product-') && <ShoppingBag className="size-4 text-emerald-500" />}
                                        {type.startsWith('testimonial-') && <MessageSquare className="size-4 text-purple-500" />}
                                        {type.startsWith('pricing-') && <Shield className="size-4 text-rose-500" />}
                                        {type.startsWith('faq-') && <CheckCircle2 className="size-4 text-teal-500" />}
                                        {type.startsWith('contact-') && <MessageSquare className="size-4 text-cyan-500" />}
                                        {type.startsWith('text-image-') && <ImageIcon className="size-4 text-fuchsia-500" />}
\`;

clientContent = clientContent.replace(
    /\{type === 'hero-modern' && <Zap className="size-4 text-amber-500" \/>\}/,
    additionalIcons
);

clientContent = clientContent.replace(/\{type === 'features-grid' && <Layout className="size-4 text-blue-500" \/>\}/, '');
clientContent = clientContent.replace(/\{type === 'product-catalog' && <ShoppingBag className="size-4 text-emerald-500" \/>\}/, '');
clientContent = clientContent.replace(/\{type === 'testimonial-slider' && <MessageSquare className="size-4 text-purple-500" \/>\}/, '');


fs.writeFileSync(clientPath, clientContent, 'utf8');

const rendererPath = 'src/components/visual-builder-renderer.tsx';
let rendererContent = fs.readFileSync(rendererPath, 'utf8');

const additionalRenderers = \`
        case 'hero-split':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{p.headline}</h1>
                        <p className="text-xl opacity-60 mb-8">{p.subheadline}</p>
                        <Link href={\`\${baseUrl}\${p.buttonUrl}\`} className="px-8 py-4 bg-primary text-white rounded-xl font-bold">{p.buttonText}</Link>
                    </div>
                    <div className="aspect-square rounded-3xl overflow-hidden">
                        <img src={p.imageUrl} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                </div>
            )
        case 'hero-centered':
            return (
                <div className="relative rounded-[3rem] overflow-hidden bg-black mx-4 flex items-center justify-center text-center" style={{ minHeight: '600px' }}>
                    <img src={p.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="relative z-10 p-10">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">{p.headline}</h1>
                        <p className="text-2xl text-white/80 mb-10 max-w-2xl mx-auto">{p.subheadline}</p>
                        <Link href={\`\${baseUrl}\${p.buttonUrl}\`} className="px-10 py-5 bg-white text-black rounded-full font-black uppercase">{p.buttonText}</Link>
                    </div>
                </div>
            )
        case 'features-list':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-black mb-4">{p.title}</h2>
                        <p className="text-xl opacity-50">{p.subtitle}</p>
                    </div>
                    <div className="space-y-8">
                        {(p.items || []).map((item: any, i: number) => (
                            <div key={i} className="flex gap-4">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">{i + 1}</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="opacity-60">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'product-slider':
            const sliderProds = products?.slice(0, p.count || 6) || []
            return (
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-black mb-10">{p.title}</h2>
                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x custom-scrollbar">
                        {sliderProds.map((prod: any) => (
                            <Link key={prod.id} href={\`\${baseUrl}/product/\${prod.id}\`} className="min-w-[280px] snap-center group no-underline">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-card mb-4 border border-border">
                                    <img src={getSafeImg(prod)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <h3 className="font-bold">{prod.title}</h3>
                                <p className="text-primary">{format(Number(prod.price))}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )
        case 'pricing-simple':
            return (
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-16">{p.title}</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {(p.plans || []).map((plan: any, i: number) => (
                            <div key={i} className="p-10 rounded-3xl border border-border bg-card">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-5xl font-black mb-8">{plan.price}</p>
                                <p className="opacity-60 mb-8">{plan.features}</p>
                                <button className="w-full py-4 rounded-xl bg-primary text-white font-bold">Select Plan</button>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'faq-accordion':
            return (
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-black mb-10 text-center">{p.title}</h2>
                    <div className="space-y-4">
                        {(p.questions || []).map((q: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl border border-border bg-card">
                                <h3 className="font-bold text-lg mb-2">{q.q}</h3>
                                <p className="opacity-60">{q.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case 'text-image-left':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black">{p.title}</h2>
                        <p className="text-lg opacity-70 leading-relaxed">{p.content}</p>
                    </div>
                    <div className="aspect-square rounded-[3rem] overflow-hidden border border-border">
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                </div>
            )
        case 'text-image-right':
            return (
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="aspect-square rounded-[3rem] overflow-hidden border border-border order-2 md:order-1">
                        <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-6 order-1 md:order-2">
                        <h2 className="text-4xl font-black">{p.title}</h2>
                        <p className="text-lg opacity-70 leading-relaxed">{p.content}</p>
                    </div>
                </div>
            )
\`;

rendererContent = rendererContent.replace(
    /switch \(type\) \{/,
    \`switch (type) {\\n\${additionalRenderers}\`
);

fs.writeFileSync(rendererPath, rendererContent, 'utf8');
