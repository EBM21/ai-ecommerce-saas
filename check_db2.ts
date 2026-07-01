import prisma from './src/lib/prisma';
async function check() {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.dir(stores.map(s => ({ name: s.name, currency: s.themeConfig?.branding?.currency, theme: s.themeConfig?.layoutId })), {depth: null});
  process.exit(0);
}
check();
