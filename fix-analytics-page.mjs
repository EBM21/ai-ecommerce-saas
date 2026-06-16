import fs from 'fs';

let content = fs.readFileSync('src/app/dashboard/analytics/page.tsx', 'utf8');

// The frontend component needs currency passed to it, or we return formatted strings from action.ts.
// In action.ts, we only returned formatted strings for recentOrders and marketLeaders.
// For totalRev, avgOrderValue, they are passed as numbers.

// We need to fetch currency in the page component.
content = content.replace(
  /const totalRev = metrics\.totalRevenue \|\| 0/,
`const totalRev = metrics.totalRevenue || 0
    let currency = "USD"
    if (store.themeConfig) {
        try {
            const raw = typeof store.themeConfig === 'string' ? JSON.parse(store.themeConfig as string) : store.themeConfig
            currency = raw.branding?.currency || "USD"
        } catch (e) {}
    }
    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val)`
);

content = content.replace(
  /value=\{\`\$\$\{totalRev\.toLocaleString\(\)\}\`\}/g,
  'value={formatMoney(totalRev)}'
);

content = content.replace(
  /value=\{\`\$\$\{metrics\.avgOrderValue\.toFixed\(2\)\}\`\}/g,
  'value={formatMoney(metrics.avgOrderValue)}'
);

content = content.replace(
  /<span className="text-2xl font-black text-indigo-500">\$\{totalRev\.toLocaleString\(\)\}<\/span>/g,
  '<span className="text-2xl font-black text-indigo-500">{formatMoney(totalRev)}</span>'
);

content = content.replace(
  /<title>\{d\.date\}: \$\{d\.value\}<\/title>/g,
  '<title>{d.date}: {formatMoney(d.value)}</title>'
);

fs.writeFileSync('src/app/dashboard/analytics/page.tsx', content, 'utf8');
console.log('Fixed src/app/dashboard/analytics/page.tsx');
