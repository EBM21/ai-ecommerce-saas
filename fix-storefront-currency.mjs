import fs from 'fs';

function replaceInFile(filePath, regex, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Storefront Product Page
replaceInFile('src/app/[domain]/product/[id]/product-client.tsx', 
  /Number\(currentPrice\)\.toFixed\(2\)/g, 
  "new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(currentPrice))"
);

replaceInFile('src/app/[domain]/product/[id]/product-client.tsx', 
  /Number\(currentComparePrice\)\.toFixed\(2\)/g, 
  "new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(currentComparePrice))"
);

replaceInFile('src/app/[domain]/product/[id]/product-client.tsx', 
  /Number\(p\.price\)\.toFixed\(2\)/g, 
  "new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))"
);

// We must remove hardcoded $
replaceInFile('src/app/[domain]/product/[id]/product-client.tsx', 
  /\$\$\{new Intl/g, 
  "{new Intl"
);

// 2. Cart Drawer
replaceInFile('src/components/cart-drawer.tsx', 
  /\$\{\(item\.price \* item\.quantity\)\.toFixed\(2\)\}/g,
  "{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(item.price * item.quantity)}"
);

replaceInFile('src/components/cart-drawer.tsx', 
  /\$\{cartTotal\.toFixed\(2\)\}/g,
  "{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}"
);

// 3. Checkout Client
replaceInFile('src/app/[domain]/checkout/checkout-client.tsx', 
  /\$\{cartTotal\.toFixed\(2\)\}/g,
  "{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(cartTotal)}"
);

replaceInFile('src/app/[domain]/checkout/checkout-client.tsx', 
  /\$\{\(item\.price \* item\.quantity\)\.toFixed\(2\)\}/g,
  "{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(item.price * item.quantity)}"
);

// 4. Collection Page
replaceInFile('src/app/[domain]/[slug]/page.tsx', 
  /\$\{Number\(p\.price\)\.toFixed\(2\)\}/g,
  "{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))}"
);

// 5. Storefront Landing Page (StoreLayouts - Nova, Minimal, Enigma)
replaceInFile('src/components/store-layouts.tsx', 
  /\$\{Number\(p\.price\)\.toFixed\(2\)\}/g,
  "{new Intl.NumberFormat('en-US', { style: 'currency', currency: theme?.branding?.currency || 'USD' }).format(Number(p.price))}"
);

console.log('Fixed formatting across storefront files');
