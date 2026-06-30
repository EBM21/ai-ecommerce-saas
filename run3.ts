require('dotenv').config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL
});

async function main() {
    try {
        await prisma.$executeRawUnsafe(`CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');`);
        console.log("Done");
    } catch(e) {
        console.error(e);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
