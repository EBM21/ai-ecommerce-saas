import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Invalid product ID'),
  variantId: z.string().optional().nullable(),
  variantName: z.string().optional().nullable(),
  quantity: z.preprocess((val) => typeof val === 'string' ? parseInt(val, 10) : val, z.number().int().positive('Quantity must be greater than 0')),
  price: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number().min(0, 'Price cannot be negative')),
  title: z.string().min(1, 'Product title is required'),
})

const placeOrderSchema = z.object({
  storeId: z.string().min(1, 'Invalid store ID'),
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(5, 'Phone number is required'),
  totalAmount: z.preprocess((val) => typeof val === 'string' ? parseFloat(val) : val, z.number().min(0, 'Total amount cannot be negative')),
  address: z.string().min(1, 'Address is required'),
  baseUrl: z.string().optional(),
  domain: z.string().min(1, 'Domain is required').optional(),
  items: z.array(orderItemSchema).nonempty('Order must contain at least one item'),
});

async function run() {
    const store = await prisma.store.findFirst();
    if (!store) {
        console.log("No store found");
        return;
    }

    const orderData = {
        storeId: store.id,
        customerName: "Test User",
        customerEmail: "test@example.com",
        phone: "1234567890",
        address: "123 Test St",
        totalAmount: 99.99,
        items: [{
            productId: "dummy",
            quantity: 1,
            price: 99.99,
            title: "Test Product"
        }]
    };

    console.log("Validating...");
    const validated = placeOrderSchema.safeParse(orderData);
    if (!validated.success) {
        console.error("Validation Failed:", validated.error.issues);
    } else {
        console.log("Validation Passed");
    }
}

run().catch(console.error).finally(() => prisma.$disconnect());
