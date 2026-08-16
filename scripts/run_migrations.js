import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function maskDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return 'not set';
  return databaseUrl.replace(/(postgres(?:ql)?:\/\/)([^:]+):([^@]+)@/, '$1$2:***@');
}

function buildCandidates(databaseUrl) {
  const candidates = new Set();
  const add = (value) => {
    if (!value) return;
    candidates.add(value);
  };

  add(databaseUrl);

  try {
    const parsed = new URL(databaseUrl);
    const password = parsed.password;
    const user = decodedURIComponent(parsed.username || '');
    const host = parsed.hostname;
    const pathname = parsed.pathname || '/postgres';

    if (host.includes('pooler.supabase.com')) {
      const ref = user.includes('.') ? user.split('.').slice(1).join('.') : user;
      const directHost = ref ? `db.${ref}.supabase.co` : 'db.localhost';
      add(`postgresql://${user}:${password}@${directHost}:5432${pathname}?sslmode=require`);
      add(`postgresql://postgres:${password}@${directHost}:5432/postgres?sslmode=require`);
      add(`postgresql://${user}:${password}@${host}:6543${pathname}?pgbouncer=true&sslmode=require`);
      add(`postgresql://${user}:${password}@${host}:5432${pathname}?pgbouncer=true&sslmode=require`);
    }

    if (host.startsWith('db.')) {
      add(`postgresql://${user}:${password}@${host}:5432${pathname}?sslmode=require`);
      const ref = host.replace(/^db\./, '').replace(/\.supabase\.co$/, '');
      if (ref) {
        add(`postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres?sslmode=require`);
        add(`postgresql://postgres.${ref}:${password}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require`);
      }
    }
  } catch {
    // ignore invalid URL parse; fallback to the raw configured value only
  }

  return [...candidates];
}

async function withClient(connectionString, onConnected) {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    return await onConnected(client);
  } finally {
    await client.end();
  }
}

async function main() {
  const sqlPath = fileURLToPath(new URL('../supabase_migration.sql', import.meta.url));
  const rlsPath = fileURLToPath(new URL('./supabase_rls.sql', import.meta.url));
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL or SUPABASE_DATABASE_URL not set. Cannot run migrations.');
    process.exit(1);
  }

  const candidates = buildCandidates(databaseUrl);
  console.log('Attempting database connection using the following candidate URLs:');
  for (const value of candidates) {
    console.log('-', maskDatabaseUrl(value));
  }

  let lastError = null;
  for (const connectionString of candidates) {
    try {
      await withClient(connectionString, async (client) => {
        console.log('Connected to database. Running migration SQL...');
        const sql = await fs.readFile(sqlPath, 'utf8');
        await client.query(sql);
        console.log('Migration SQL executed. Applying RLS policies...');
        try {
          const rls = await fs.readFile(rlsPath, 'utf8');
          await client.query(rls);
          console.log('RLS policies applied.');
        } catch (e) {
          console.warn('Failed to apply RLS sql:', e.message || e);
        }
        console.log('Migrations complete.');
      });
      return;
    } catch (e) {
      lastError = e;
      console.warn('Connection attempt failed:', maskDatabaseUrl(connectionString), '\nReason:', e.message || e);
    }
  }

  console.error('Migration error: unable to connect with any detected Supabase URL format.');
  console.error(lastError?.message || lastError || 'Unknown error');
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
