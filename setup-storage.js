const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Adding policy to storage.objects...");
        await prisma.$executeRawUnsafe(`
            CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');
        `);
        console.log("Policy created successfully!");
    } catch (err) {
        console.error("Error creating policy (may already exist):", err.message);
    }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
