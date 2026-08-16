Supabase import & RLS helper scripts

Usage

- Create a Supabase project and run `supabase_migration.sql` in the SQL editor (or via psql).
- Set environment variables locally before running the import script:

  - `SUPABASE_URL` — your Supabase URL
  - `SUPABASE_SERVICE_ROLE_KEY` — your service role key (keep secret)

You can copy the provided `.env.example` to a local `.env` file and fill in the values before running scripts or starting the server.

- To run the import script (TypeScript), install `ts-node` and run:

  npm install -D ts-node typescript @types/node
  npx ts-node scripts/import_local_to_supabase.ts

Notes
- The import script upserts categories (uses `src/lib/categoryData.ts`), then upserts products from `src/data.ts`.
- Product images that are remote HTTP URLs will be inserted into `product_media`. Base64 data URLs are skipped (use admin upload endpoint to upload those).
- After import, run `scripts/supabase_rls.sql` in Supabase SQL editor to enable basic RLS policies for public read access.

Security
- Never commit your `SUPABASE_SERVICE_ROLE_KEY` to source control. Use CI/CD secrets or environment variables in your hosting provider.
