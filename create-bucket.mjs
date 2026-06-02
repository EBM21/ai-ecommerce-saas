import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient()

async function main() {
  console.log('Creating product-images bucket and RLS policies...')

  try {
    // 1. Create the bucket if it doesn't exist
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('product-images', 'product-images', true)
      ON CONFLICT (id) DO NOTHING;
    `)
    console.log('Bucket "product-images" ensured.')

    // 2. Create RLS Policy to allow public read access
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Access"
      ON storage.objects FOR SELECT
      USING ( bucket_id = 'product-images' );
    `).catch(e => {
       if (!e.message.includes('already exists')) {
           console.error('Policy read creation warning:', e.message);
       }
    })
    console.log('Public read policy ensured.')

    // 3. Create RLS Policy to allow authenticated users to insert
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Auth Insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK ( bucket_id = 'product-images' );
    `).catch(e => {
        if (!e.message.includes('already exists')) {
            console.error('Policy insert creation warning:', e.message);
        }
    })
    console.log('Authenticated insert policy ensured.')
    
    // 4. Update policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Auth Update"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING ( bucket_id = 'product-images' );
    `).catch(e => {
        if (!e.message.includes('already exists')) {
            console.error('Policy update creation warning:', e.message);
        }
    })

    console.log('Successfully set up storage bucket and policies!')
  } catch (error) {
    console.error('Failed to create bucket:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
