import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

dotenv.config();

const dbUrl = process.env.SUPABASE_DATABASE_URL;
if (!dbUrl) { console.error('SUPABASE_DATABASE_URL not set'); process.exit(1); }

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  const sqlPath = fileURLToPath(new URL('./fix_product_ids.sql', import.meta.url));
  const sql = await fs.readFile(sqlPath, 'utf8');
  await client.query(sql);
  console.log('OK - products.id ve product_media.product_id TEXT yapildi');
  await client.end();
}

main().catch((e) => { console.error('HATA:', e.message || e); process.exit(1); });