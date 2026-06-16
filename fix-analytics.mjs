import fs from 'fs';

let content = fs.readFileSync('src/app/dashboard/analytics/action.ts', 'utf8');

content = content.replace(
  /const products = store\.products \|\| \[\]/,
`let currency = "USD"
        if (store.themeConfig) {
            try {
                const raw = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig) : store.themeConfig
                currency = raw.branding?.currency || "USD"
            } catch (e) { }
        }
        const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(val)
        
        const products = store.products || []`
);

content = content.replace(
  /revenue: \`\$\$\{p\.total\.toLocaleString\(\)\}\`,/g,
  'revenue: formatMoney(p.total),'
);

content = content.replace(
  /amount: \`\$\$\{Number\(o\.totalAmount\)\.toFixed\(2\)\}\`/g,
  'amount: formatMoney(Number(o.totalAmount))'
);

content = content.replace(
  /totalRevenue,/g,
  'totalRevenue,'
);

// We need to pass the formatted values to the frontend, so the frontend doesn't hardcode $
// Wait, the frontend in analytics/page.tsx has hardcoded `$`. Let's check analytics/page.tsx
fs.writeFileSync('src/app/dashboard/analytics/action.ts', content, 'utf8');
console.log('Fixed src/app/dashboard/analytics/action.ts');
