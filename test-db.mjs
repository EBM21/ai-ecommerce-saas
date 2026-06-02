import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing DB connection to verify user data capability...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to Postgres!');
    const res = await client.query('SELECT NOW()');
    console.log('Current DB Time:', res.rows[0]);
  } catch (err) {
    console.error('❌ Failed to connect to DB:', err.message);
  } finally {
    await client.end();
  }
}

main();
