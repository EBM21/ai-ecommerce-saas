import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');
        `);
        return NextResponse.json({ success: true, message: "Policy created!" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
