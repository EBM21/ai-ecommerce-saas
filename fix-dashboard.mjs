import fs from 'fs';

let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// 1. Get currency
content = content.replace(
  /const now = new Date\(\)/,
`let currency = "USD"
  if (store.themeConfig) {
      try {
          const raw = typeof store.themeConfig === 'string'
              ? JSON.parse(store.themeConfig as string)
              : store.themeConfig
          currency = raw.branding?.currency || "USD"
      } catch (e) { }
  }
  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(val)
  const formatMoneyNoDecimals = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val)

  const now = new Date()`
);

// 2. Replace hardcoded $ with formatMoney
content = content.replace(
  /amount: \`\$\$\{Number\(o\.totalAmount \?\? 0\)\.toLocaleString\(\)\}\`,/g,
  'amount: formatMoney(Number(o.totalAmount ?? 0)),'
);

content = content.replace(
  /revenue: \`\$\$\{p\.orderItems\.reduce\(\(s: number, oi: any\) => s \+ Number\(oi\.price \?\? oi\.unitPrice \?\? 0\), 0\)\.toLocaleString\(\)\}\`,/g,
  'revenue: formatMoney(p.orderItems.reduce((s: number, oi: any) => s + Number(oi.priceAtPurchase ?? oi.price ?? oi.unitPrice ?? 0), 0)),'
);

content = content.replace(
  /value: \`\$\$\{revThis\.toLocaleString\(undefined, \{ maximumFractionDigits: 0 \}\)\}\`,/g,
  'value: formatMoneyNoDecimals(revThis),'
);

fs.writeFileSync('src/app/dashboard/page.tsx', content, 'utf8');
console.log('Fixed src/app/dashboard/page.tsx');
