const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const orders = await prisma.order.findMany();
    console.log('Orders Count:', orders.length);
    if (orders.length > 0) {
        console.log('Total Amount:', orders[0].totalAmount);
        console.log('Number(Total Amount):', Number(orders[0].totalAmount));
        const revThis = orders.reduce((s, o) => s + Number(o.totalAmount ?? 0), 0)
        console.log('Calculated RevThis:', revThis);
    }
}
main().finally(() => prisma.$disconnect());
