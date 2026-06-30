require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
    });

    try {
        await client.connect();
        await client.query(`CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');`);
        console.log("Policy created!");
    } catch(e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
