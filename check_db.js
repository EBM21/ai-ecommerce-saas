const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.dir(stores.map(s => ({ name: s.name, currency: s.themeConfig?.branding?.currency, theme: s.themeConfig?.layoutId })), {depth: null});
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.dir(users);
  await prisma.$disconnect();
}
check();
