import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    await prisma.$executeRawUnsafe(`CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');`)
    console.log("Done")
}
main().catch(console.error)
