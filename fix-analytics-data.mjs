import fs from 'fs';

let content = fs.readFileSync('src/app/dashboard/analytics/action.ts', 'utf8');

content = content.replace(
  /return \{ success: true, metrics, aiInsights \}/,
  'return { success: true, metrics, aiInsights, currency }'
);

fs.writeFileSync('src/app/dashboard/analytics/action.ts', content, 'utf8');

let pageContent = fs.readFileSync('src/app/dashboard/analytics/page.tsx', 'utf8');
pageContent = pageContent.replace(
  /const \{ metrics, aiInsights \} = data/,
  'const { metrics, aiInsights, currency = "USD" } = data'
);
pageContent = pageContent.replace(
  /let currency = "USD"[\s\S]*?catch \(e\) \{\}\n    \}/,
  ''
);

fs.writeFileSync('src/app/dashboard/analytics/page.tsx', pageContent, 'utf8');
console.log('Fixed analytics data structure');
