const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.store.updateMany({
        data: { subscriptionActive: true }
    });
    console.log(res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
