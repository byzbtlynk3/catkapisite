import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_MAIN_CATEGORIES_STRUCTURE } from '../src/lib/categoryData';
import { INITIAL_PRODUCTS } from '../src/data';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_API_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function upsertCategory(slug: string, name: string, parent_id: string | null) {
  // Check existing
  const { data: existing } = await supabase.from('categories').select('*').eq('slug', slug).limit(1).maybeSingle();
  if (existing && existing.id) {
    const { error } = await supabase.from('categories').update({ name, parent_id, is_active: true, updated_at: new Date().toISOString() }).eq('id', existing.id);
    if (error) console.warn('Failed update category', slug, error.message);
    return existing.id;
  }

  const { data, error } = await supabase.from('categories').insert({ name, slug, parent_id }).select().maybeSingle();
  if (error) {
    console.error('Failed insert category', slug, error.message);
    throw error;
  }
  // @ts-ignore
  return data.id;
}

async function upsertProduct(p: any, category_id: string | null, subcategory_id: string | null) {
  // Try find by name
  const { data: existing } = await supabase.from('products').select('*').ilike('name', p.name).limit(1).maybeSingle();
  const payload = {
    name: p.name,
    description: p.description || p.extendedDescription || null,
    material: Array.isArray(p.materials) ? p.materials.join(', ') : p.material || null,
    dimensions_text: p.specs ? JSON.stringify(p.specs) : p.dimensions_text || null,
    category_id,
    subcategory_id,
    price: p.startingPrice || p.price || 0,
    campaign_price: p.isCampaign ? (p.campaignPrice || null) : null,
    is_published: true,
    updated_at: new Date().toISOString()
  };

  if (existing && existing.id) {
    const { error } = await supabase.from('products').update(payload).eq('id', existing.id);
    if (error) console.warn('Failed update product', p.name, error.message);
    return existing.id;
  }

  const { data, error } = await supabase.from('products').insert(payload).select().maybeSingle();
  if (error) {
    console.error('Failed insert product', p.name, error.message);
    throw error;
  }
  // @ts-ignore
  return data.id;
}

async function insertMedia(product_id: string, url: string, idx: number) {
  if (!url || url.startsWith('data:')) return;
  const { error } = await supabase.from('product_media').insert({ product_id, media_url: url, media_type: url.includes('.mp4') || url.includes('youtube') ? 'video' : 'image', sort_order: idx });
  if (error) console.warn('Failed to insert media', url, error.message);
}

async function main() {
  console.log('Starting import to Supabase at', SUPABASE_URL);

  // Map of slug -> uuid
  const catIdMap: Record<string, string> = {};

  // Upsert main categories and subcategories
  for (const main of DEFAULT_MAIN_CATEGORIES_STRUCTURE) {
    const mainSlug = main.id || slugify(main.name);
    const mainId = await upsertCategory(mainSlug, main.name, null);
    catIdMap[mainSlug] = mainId;
    if (Array.isArray(main.subCategories)) {
      for (const sub of main.subCategories) {
        const subSlug = sub.id || slugify(sub.name);
        const subId = await upsertCategory(subSlug, sub.name, mainId);
        catIdMap[subSlug] = subId;
      }
    }
  }

  console.log('Categories upserted:', Object.keys(catIdMap).length);

  // Upsert products
  for (const p of INITIAL_PRODUCTS as any[]) {
    // Find main category by name
    const mainMatch = DEFAULT_MAIN_CATEGORIES_STRUCTURE.find(m => m.name.toLowerCase() === (p.category || '').toLowerCase());
    let mainSlug = mainMatch ? mainMatch.id : slugify(p.category || '');
    let subSlug = null;
    if (p.subCategory) {
      const subMatch = mainMatch?.subCategories?.find(s => s.name.toLowerCase() === (p.subCategory || '').toLowerCase());
      subSlug = subMatch ? subMatch.id : slugify(p.subCategory || '');
    }

    // Ensure categories exist if unknown
    if (!catIdMap[mainSlug]) {
      const generated = await upsertCategory(mainSlug, p.category || mainSlug, null);
      catIdMap[mainSlug] = generated;
    }
    if (subSlug && !catIdMap[subSlug]) {
      const generated = await upsertCategory(subSlug, p.subCategory || subSlug, catIdMap[mainSlug]);
      catIdMap[subSlug] = generated;
    }

    const productId = await upsertProduct(p, catIdMap[mainSlug] || null, subSlug ? catIdMap[subSlug] : null);
    if (p.images && Array.isArray(p.images)) {
      for (let i = 0; i < p.images.length; i++) {
        await insertMedia(productId, p.images[i], i);
      }
    }
    console.log('Imported product:', p.name);
  }

  console.log('Import complete. Verify in Supabase console.');
  process.exit(0);
}

main().catch((e) => { console.error('Fatal', e); process.exit(1); });
