import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Supabase admin client (requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server env)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
let adminSupabase: any = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('Supabase admin client configured');
} else {
  console.log('Supabase admin client NOT configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server env to enable DB sync.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use((req, res, next) => {
  if (process.env.VERCEL && req.body !== undefined) {
    next();
    return;
  }
  express.json({ limit: '12mb' })(req, res, next);
});
// Configure CORS: allow specific origin from env or allow all in development
const allowedOrigin = process.env.ALLOWED_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : '*');
if (allowedOrigin) {
  app.use(cors({ origin: allowedOrigin, credentials: true }));
} else {
  app.use(cors());
}

// Simple in-memory stores for OTPs and temporary tokens
const otpStore: Map<string, { hash: string; expiresAt: number; attempts: number; lastSentAt: number }> = new Map();
const otpVerifiedTokens: Map<string, { phone: string; expiresAt: number }> = new Map();
const sessions: Map<string, { username: string; expiresAt: number }> = new Map();

const OTP_TTL_MS = 1000 * 60 * 5;         // OTP valid 5 minutes
const OTP_RESEND_COOLDOWN_MS = 1000 * 60; // 60 seconds before resend
const OTP_MAX_ATTEMPTS = 5;               // max wrong-code attempts before invalidation

const ADMIN_FILE = path.join(process.cwd(), 'admin.json');

async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

// Ensure the admin user exists (seeded from ADMIN_USERNAME / ADMIN_PASSWORD env vars).
// Uses scrypt hashed credentials — password is NEVER stored in plain text.
async function ensureAdminFile() {
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
  const providedPass = process.env.ADMIN_PASSWORD;

  // If Supabase is configured, ensure admin user exists in DB (production source of truth).
  if (adminSupabase) {
    try {
      const { data: existing } = await adminSupabase.from('admins').select('*').eq('username', adminUsername).limit(1).maybeSingle();
      if (existing && existing.id) {
        // If ADMIN_PASSWORD env is provided, re-hash/update so env stays source of truth.
        if (providedPass) {
          const { salt, hash } = await hashPassword(providedPass);
          const { error } = await adminSupabase.from('admins').update({ salt, hash }).eq('id', existing.id);
          if (error) throw error;
          console.log('Admin password re-hashed from env');
        }
        return;
      }
      if (!providedPass) {
        if (process.env.NODE_ENV === 'production') {
          console.error('ADMIN_PASSWORD env var must be set in production to initialize admin user in DB.');
          throw new Error('Missing ADMIN_PASSWORD in production');
        }
        return;
      }
      const { salt, hash } = await hashPassword(providedPass);
      const { error } = await adminSupabase.from('admins').upsert({ username: adminUsername, salt, hash }, { onConflict: 'username' });
      if (error) throw error;
      console.log('Admin user ensured in DB:', adminUsername);
      return;
    } catch (dbErr) {
      console.error('Failed to ensure admin in DB:', dbErr);
      throw dbErr;
    }
  }

  // Fallback: local admin.json (development / no Supabase configured)
  try {
    const raw = await fs.readFile(ADMIN_FILE, 'utf8');
    const existing = JSON.parse(raw);
    if (existing && existing.username === adminUsername) {
      if (providedPass) {
        const { salt, hash } = await hashPassword(providedPass);
        existing.salt = salt;
        existing.hash = hash;
        await fs.writeFile(ADMIN_FILE, JSON.stringify(existing, null, 2), 'utf8');
      }
      return;
    }
  } catch (e) {
    // file missing - fall through and create it
  }

  if (!providedPass) {
    if (process.env.NODE_ENV === 'production') {
      console.error('ADMIN_PASSWORD env var must be set in production to initialize admin user.');
      throw new Error('Missing ADMIN_PASSWORD in production');
    }
    return;
  }
  const { salt, hash } = await hashPassword(providedPass);
  const content = { username: adminUsername, salt, hash };
  await fs.writeFile(ADMIN_FILE, JSON.stringify(content, null, 2), 'utf8');
}

async function verifyAdminCredentials(username: string, password: string) {
  try {
    // If Supabase admin client available, verify against admins table
    if (adminSupabase) {
      const { data, error } = await adminSupabase.from('admins').select('*').eq('username', username).limit(1).maybeSingle();
      if (error) {
        console.error('Admin DB lookup error', error);
        return false;
      }
      if (!data) return false;
      const hash = crypto.scryptSync(password, data.salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(data.hash, 'hex'));
    }

    const raw = await fs.readFile(ADMIN_FILE, 'utf8');
    const obj = JSON.parse(raw);
    if (obj.username !== username) return false;
    const hash = crypto.scryptSync(password, obj.salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(obj.hash, 'hex'));
  } catch (e) {
    return false;
  }
}

async function updateAdminPassword(username: string, newPassword: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  const content = { username, salt, hash };
  if (adminSupabase) {
    // upsert into admins table
    const { error } = await adminSupabase.from('admins').upsert({ username, salt, hash }, { onConflict: 'username' });
    if (error) throw error;
    return;
  }
  await fs.writeFile(ADMIN_FILE, JSON.stringify(content, null, 2), 'utf8');
}

// Allowed admin phones (without formatting)
const AUTH_PHONES = ['05441373321', '05352194789'];

// Helper to send SMS via provider - currently supports Twilio if installed and configured
async function sendSmsViaProvider(phone: string, message: string) {
  const provider = process.env.SMS_PROVIDER;
  if (!provider) {
    console.log('SMS provider not configured, logging message instead:', phone, message);
    return { ok: true, provider: 'none' };
  }
  if (provider === 'twilio') {
    try {
      const twilioPkg = await import('twilio');
      const client = twilioPkg.default(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);
      const from = process.env.SMS_FROM || undefined;
      await client.messages.create({ body: message, from, to: phone });
      return { ok: true, provider: 'twilio' };
    } catch (e) {
      console.error('Twilio send error', e);
      return { ok: false, error: String(e) };
    }
  }
  // Other providers can be added similarly
  console.log('Unsupported SMS_PROVIDER:', provider);
  return { ok: false, error: 'Unsupported provider' };
}

// Helper to obtain a GoogleGenAI instance safely if key exists
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// 1. CHATBOT ASSISTANT API ENDPOINT
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Mesaj alanı zorunludur.' });
    return;
  }

  const systemInstruction = `Sen ÇAT KAPI Firmasının resmi ve akıllı Yapay Zeka Asistanısın.
  Mersin Akdeniz İlçesi Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A adresinde imalat yapan, kurucunuz ve baş usta/zanaatkarınız Nuri Yanık (Nuri Usta / Nuri Bey) liderliğindeki özel imalat ahşap marangozluk, kapı, mutfak dolabı, vestiyer, gardırop, tv ünitesi, banyo dolabı, duşakabin, lavabo, klozet, fayans, seramik, mermer/granit/kuvars tezgah imalathanesisiniz.

  MUTLAKA UYULMASI GEREKEN DOĞRULUK VE YÖNLENDİRME KURALLARI:
  1. HALÜSİNASYON YAPMA: Gerçek dışı ürün, fiyat veya mağaza stok bilgisi UYDURMA. Emin olmadığın konularda kesin bilgi verme.
  2. Sadece sana sağlanan GERÇEK ve AKTİF yönetim paneli ürün listesindeki ürünleri temel al.
  3. Aranan ürün, fiyat veya teknik detay yönetim paneli verisinde YOKSA veya emin değilsen, tahmin yürütmek yerine doğrudan Nuri Usta ile iletişime geçmesini öner (WhatsApp: 0535 219 47 89, Telefon: 0535 219 47 89 veya İletişim Sayfası).
  4. DÜKKAN VE İMALAT HAKKINDA: ÇAT KAPI'nın kendi imalatı olan özel ölçü üretim, ücretsiz yerinde keşif ve ölçü alma süreci, teslimat ve montaj garantisi, birinci sınıf monoblok MDF ve İtalyan Sayerlack ipek mat lake cila kullanımı hakkında doğru bilgiler ver.
  5. KATEGORİLER: İç Kapılar, Çelik Kapılar, Mutfak Dolapları, Gardırop, Vestiyer, TV Üniteleri, Banyo Dolapları, Duşakabin, Lavabo, Klozet, Fayans, Seramik, Mermer / Granit / Kuvars Tezgahlar konularında detaylı ve doğru yönlendirmeler yap.
  6. ÜRÜN YÖNLENDİRMESİ: Müşteri bir ürün veya kategori sorduğunda (örneğin "Beyaz lake kapı", "MDF mutfak dolabı", "Vestiyer modelleri"), ilgili kategorideki aktif ürünleri öne çıkar ve kullanıcıyı ilgili kategoriye yönlendir.
  7. İLETİŞİM YÖNLENDİRMESİ: İstenildiğinde veya net bilgi verilemeyen durumlarda kullanıcıya WhatsApp (0535 219 47 89), Telefon (0535 219 47 89) ve İletişim Sayfası kanallarını sun.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Local highly intelligent carpentry knowledge response engine if API key is not yet set
      const msgLower = message.toLowerCase();
      let responseText = '';

      if (msgLower.includes('mdf') && (msgLower.includes('suntalam') || msgLower.includes('suntalamla'))) {
        responseText = `MDF (Orta Yoğunlukta Lif Levha) ve Suntalam (Yonga Levha) marangozlukta sıkça karşılaştırılan iki malzemedir. \n\n**MDF Nedir?** \nOdun liflerinin fırınlanıp yapıştırıcılar yardımıyla preslenmesiyle elde edilir. İç yapısı çok yoğun ve pürüzsüzdür. Suya, neme karşı dayanımı katbekat yüksektir. Vida tutma mukavemeti kusursuzdur. \n\n**Suntalam Nedir?** \nTalaş parçalarının preslenmesiyle yapılır. İç yapısı boşluklu olduğu için neme maruz kaldığında hızlıca şişme ve dökülme yapabilir, vidaları zamanla gevşeyebilir. \n\n*Biz Çat Kapı olarak mutfak gövdelerinde, oda kapılarında ve banyo dolaplarında yalnızca monoblok neme dayanıklı E1 sertifikalı kalın MDF paneller kullanıyoruz. Uzun vadeli lüks kalitemizin sırrı buradadır.* Nuri Bey ile detaylı teknik detayları görüşmek için **0535 219 47 89** numaralı hattan arayabilir veya doğrudan WhatsApp butonu ile iletişime geçebilirsiniz.`;
      } else if (msgLower.includes('mdf')) {
        responseText = `Evet, Çat Kapı olarak imal ettiğimiz mutfak dolapları, kapılar, vestiyerler ve diğer tüm özel üretim mobilyalarımızın ana gövdesini ve kapaklarını **birinci sınıf monoblok MDF (Medium Density Fiberboard)** kullanarak üretiyoruz. MDF üzerine uyguladığımız astar zımpara sistemi ve fırınlanmış İpek Mat Lake saten boyası sayesinde ömür boyu sararmayan ve nemden etkilenmeyen kusursuz zeminler elde ediyoruz.`;
      } else if (msgLower.includes('çelik kapı') || msgLower.includes('celik kapi')) {
        responseText = `Çelik kapı satın alırken en çok dikkat etmeniz gereken hususlar şunlardır:\n\n1. **Sac Kalınlığı:** Gövdede en az 1.5 - 2 mm galvaniz bütün çelik kullanılmalıdır.\n2. **Kilit Güvenliği:** Kale Monoblok veya çok noktalı emniyet kilit mili zırh plakaları tercih edilmelidir.\n3. **Isı ve Ses Yalıtımı:** Kanat içerisinin taşyünü ve sızdırmazlık contalarıyla doldurulmuş olması gerekir.\n\n*Çat Kapı markalı Armor çelik kapılarımızda, Mersin'in zorlu nem iklimine dayanıklı suya mukavim marin ahşap kompozit kaplamalar ve Kale Kilit monoblok çelik sistemleri bizzat Nuri Usta'nın montaj güvencesiyle sunulmaktadır.*`;
      } else if (msgLower.includes('vestiyer') || msgLower.includes('portmanto')) {
        responseText = `Mersin antrelerinde şık bir vestiyer tasarlarken şu üç unsura dikkat edilmelidir:\n1. **Tavan Sıfır Tasarım:** Toz birikimini önlemek ve depolama alanını artırmak için vestiyer tavana kadar sıfırlanmalıdır.\n2. **Gönye ve Pano Koruması:** Elektrik sigorta kutusu ve internet panelleri vestiyer içinde gizlenmeli ancak müdahaleye açık olmalıdır.\n3. **Derinlik ve Havandırma:** Palto ve kabanlar için derinlik en az 55-60 cm olmalı, ayakkabılıkların neme karşı gizli arkalık havalandırma menfezleri bulunmalıdır.\n\nNuri Bey bizzat evinize konuk olup lazerle milimetrik ölçüleri çıkarıp vestiyer planınızı çizebilir! Doğrudan WhatsApp veya telefon üzerinden randevu isteyebilirsiniz.`;
      } else if (msgLower.includes('mutfak') && (msgLower.includes('küçük') || msgLower.includes('renk'))) {
        responseText = `Dar ve küçük mutfaklar için önereceğimiz en iyi tüyolar şunlardır:\n- **Renk Paleti:** İpek mat Linen Beyazı, İnci Grisi veya yumuşak Grej tonları mutfağı ferah ve aydınlık gösterir.\n- **Kapak Profili:** Kesintisiz ve kalabalık hissi vermeyen 'Gola' (Gizli Kulpsuz) profil modelleri alan genişletir.\n- **Dikey Kazanım:** Üst dolapları tavana sıfırlayarak %35 daha fazla depolama kazanırken dikey çizgileri uzatmış olursunuz.\n\nÇat Kapı atölyemizde bizzat sizin mutfak ölçünüze göre özel yerleşim planı çiziyoruz. Hızlı teklif almak için tasarım modülümüzü kullanabilirsiniz!`;
      } else {
        responseText = `Merhaba! Mersin Akdeniz'deki Çat Kapı imalat atölyemize hoş geldiniz. \n\nBen yapay zeka asistanınızım. Kurucumuz **Nuri Yanık Bey** yönetimindeki atölyemizde ürettiğimiz özel tasarım kapılar, mutfaklar, vestiyerler, gardıroplar, şık ayakkabılıklar ve dekoratif üniteler hakkında bana dilediğinizi sorabilirsiniz. \n\n*Size şunlarda yardımcı olabilirim:*\n- Suntalam ile MDF arasındaki teknik farklar,\n- Banyo, mutfak dolabı ve kapı ölçülerinin doğru alınması,\n- Evinize en uygun renk ve malzeme kartelası seçimi.\n\nBize ayrıca [Instagram](https://instagram.com/catyapii) hesabımızdan ulaşabilir ya da doğrudan randevu için WhatsApp hattımızı (**0535 219 47 89**) kullanabilirsiniz!`;
      }

      res.json({ text: responseText, localEngine: true });
      return;
    }

    // Convert history format to the format required by the GoogleGenAI chats API if applicable
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text || '' });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({ error: 'Sistem şu anda yanıt veremiyor. Lütfen daha sonra tekrar deneyin.' });
  }
});

// --- ADMIN AUTH & SMS OTP ENDPOINTS ---

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Eksik parametre' });
  await ensureAdminFile();
  const ok = await verifyAdminCredentials(username, password);
  if (!ok) return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 8;
  if (adminSupabase) {
    // store session in DB
    try {
      const { error } = await adminSupabase.from('admin_sessions').insert([{ token, username, expires_at: new Date(expiresAt).toISOString() }]);
      if (error) throw error;
      res.json({ token });
      return;
    } catch (e:any) {
      console.error('Failed to create admin session in DB', e);
      return res.status(500).json({ error: 'Session oluşturulamadı' });
    }
  }

  sessions.set(token, { username, expiresAt });
  res.json({ token });
});

// Admin logout: invalidate the session token (both DB-backed and in-memory)
app.post('/api/admin/logout', async (req, res) => {
  const auth = req.headers?.authorization || '';
  const m: RegExpMatchArray | null = String(auth).match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(400).json({ error: 'Token eksik' });
  const token = m[1];
  if (adminSupabase) {
    try {
      await adminSupabase.from('admin_sessions').delete().eq('token', token);
    } catch (e) {
      console.error('Logout delete session error', e);
    }
  }
  sessions.delete(token);
  res.json({ ok: true });
});

app.post('/api/sms/send-otp', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone || !AUTH_PHONES.includes(phone)) return res.status(400).json({ error: 'Yetkili numara değil veya eksik.' });
  const existing = otpStore.get(phone);
  // 60-second resend cooldown to prevent SMS spamming
  if (existing && Date.now() - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000);
    return res.status(429).json({ error: `Yeni kod göndermek için ${waitSec} saniye bekleyin.`, retryAfterSec: waitSec });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const salt = crypto.randomBytes(8).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(code).digest('hex');
  otpStore.set(phone, { hash: salt + ':' + hash, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, lastSentAt: Date.now() });
  const msg = `Çat Kapı doğrulama kodunuz: ${code}`;
  try {
    const result = await sendSmsViaProvider(phone, msg);
    if (!result.ok) return res.status(500).json({ error: 'SMS sağlayıcısına bağlanılamadı: ' + (result.error || '') });
    res.json({ ok: true });
  } catch (e:any) {
    console.error('SMS send error', e);
    res.status(500).json({ error: 'SMS gönderilirken hata oluştu.' });
  }
});

app.post('/api/sms/verify-otp', async (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: 'Eksik parametre' });
  const entry = otpStore.get(phone);
  if (!entry) return res.status(400).json({ error: 'Kod gönderilmemiş veya süresi dolmuş.' });
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(phone);
    return res.status(400).json({ error: 'Doğrulama kodunun süresi doldu.' });
  }
  const [salt, stored] = entry.hash.split(':');
  const h = crypto.createHmac('sha256', salt).update(code).digest('hex');
  entry.attempts = (entry.attempts || 0) + 1;
  if (h !== stored) {
    otpStore.set(phone, entry);
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(phone);
      return res.status(429).json({ error: 'Çok fazla hatalı deneme. Lütfen tekrar kod isteyin.' });
    }
    return res.status(400).json({ error: `Doğrulama kodu hatalı (kalan deneme: ${OTP_MAX_ATTEMPTS - entry.attempts}).` });
  }
  // success
  otpStore.delete(phone);
  const otpToken = crypto.randomBytes(24).toString('hex');
  otpVerifiedTokens.set(otpToken, { phone, expiresAt: Date.now() + 1000 * 60 * 10 });
  res.json({ otpToken });
});

app.post('/api/admin/change-password', async (req, res) => {
  const { username, newPassword, otpToken } = req.body || {};
  if (!username || !newPassword || !otpToken) return res.status(400).json({ error: 'Eksik parametre' });
  const v = otpVerifiedTokens.get(otpToken);
  if (!v || v.expiresAt < Date.now()) return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş OTP token.' });
  // allow change
  try {
    await updateAdminPassword(username, newPassword);
    otpVerifiedTokens.delete(otpToken);
    res.json({ ok: true });
  } catch (e:any) {
    console.error('Password change error', e);
    res.status(500).json({ error: 'Şifre güncellenemedi.' });
  }
});

// Helper: require admin session from Authorization header
async function requireAdmin(req: any, res: any) {
  const auth = req.headers?.authorization || '';
  const m: RegExpMatchArray | null = String(auth).match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];
  // If adminSupabase available, check admin_sessions table first
  if (adminSupabase) {
    try {
      // Note: admin_sessions.expires_at stored as timestamptz
      const { data } = await adminSupabase.from('admin_sessions').select('*').eq('token', token).limit(1).maybeSingle();
      if (!data) return null;
      const expiresAt = new Date(data.expires_at).getTime();
      if (expiresAt < Date.now()) {
        await adminSupabase.from('admin_sessions').delete().eq('token', token);
        return null;
      }
      return { token, username: data.username };
    } catch (e) {
      console.error('Admin session lookup error', e);
      return null;
    }
  }

  const s = sessions.get(token);
  if (!s) return null;
  if (s.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, username: s.username };
}

// Public endpoints: products & categories (reads published products)
app.get('/api/public/products', async (req, res) => {
  try {
    if (!adminSupabase) {
      // Fallback: return local data file
      const data = await fs.readFile(path.join(__dirname, 'src', 'data.ts'), 'utf8');
      // crude extraction: look for INITIAL_PRODUCTS export
      const match = data.match(/INITIAL_PRODUCTS\s*=\s*(\[([\s\S]*?)\]);/m);
      if (match) {
        // Not executing TS - return empty to avoid unsafe eval
        return res.json([]);
      }
      return res.json([]);
    }

    const { data: products } = await adminSupabase.from('products').select('*').order('created_at', { ascending: false });
    const { data: media } = await adminSupabase.from('product_media').select('*').order('sort_order', { ascending: true });
    const { data: categories } = await adminSupabase.from('categories').select('*');

    const catMap: Record<string, any> = {};
    (categories || []).forEach((c:any) => { catMap[String(c.id)] = c; });

    const out = (products || []).filter((p:any) => p.is_published).map((p:any) => {
      const medias = (media || []).filter((m:any) => String(m.product_id) === String(p.id)).map((m:any) => ({ url: m.media_url, type: m.media_type }));
      const categoryObj = catMap[String(p.category_id)] || null;
      const subObj = catMap[String(p.subcategory_id)] || null;
      const categoryParent = categoryObj && categoryObj.parent_id ? (catMap[String(categoryObj.parent_id)] ? catMap[String(categoryObj.parent_id)].name : null) : null;
      // Fallback: use category/subCategory names stored in metadata (set by syncProducts/syncCatalog)
      const meta = p.metadata || {};
      const categoryName = (categoryObj ? categoryObj.name : null) || meta.category || null;
      const subCategoryName = (subObj ? subObj.name : null) || meta.subCategory || null;
      return {
        ...p,
        category: categoryName,
        subCategory: subCategoryName,
        category_id: p.category_id,
        subcategory_id: p.subcategory_id,
        category_parent: categoryParent,
        // Fiyat: Supabase'teki `price`/`campaign_price` alanlarını sitenin beklediği `startingPrice`/`campaignPrice`'a çevir.
        // Bu olmadan "Fiyat Alınız" görünüyordu.
        startingPrice: Number(p.price) > 0 ? Number(p.price) : undefined,
        campaignPrice: Number(p.campaign_price) > 0 ? Number(p.campaign_price) : undefined,
        isCampaign: !!p.is_campaign || Number(p.campaign_price) > 0,
        materials: p.material ? String(p.material).split(/\r?\n/).map((value: string) => value.trim()).filter(Boolean) : [],
        dimensions: p.dimensions_text || meta['Ölçüler'] || meta['Ölçü'] || undefined,
        specs: meta,
        priceDisplayMode: p.price_display_mode || 'numeric',
        price: p.price ?? null,
        images: medias.map(m => m.url),
        media: medias
      };
    });

    res.json(out);
  } catch (e:any) {
    console.error('Public products error', e);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.get('/api/public/categories', async (req, res) => {
  try {
    if (!adminSupabase) return res.json([]);
    const { data: categories } = await adminSupabase.from('categories').select('*').order('sort_order', { ascending: true });
    res.json(categories || []);
  } catch (e:any) {
    console.error('Public categories error', e);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Admin sync endpoints used by frontend App.tsx
app.post('/api/admin/syncProducts', async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!adminSupabase) return res.status(500).json({ error: 'Supabase admin client not configured' });
  const { products } = req.body || {};
  if (!Array.isArray(products)) return res.status(400).json({ error: 'Invalid payload' });
  try {
    // FULL product sync: map every frontend field to DB columns so nothing is lost
    // IMPORTANT: Admin panel uses frontend ids like "main-123" / "sub-456".
    // Supabase categories.id is UUID; FK constraint fails for non-UUID.
    // We store category/subCategory NAMES in metadata and null-out invalid category ids.
    const isUuid = (v:any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
    const payload = products.map((p:any) => ({
      id: p.id || undefined,
      name: p.name,
      product_code: p.productCode || null,
      description: p.description || p.extendedDescription || null,
      material: Array.isArray(p.materials) ? p.materials.join('\n') : (p.material || null),
      dimensions_text: typeof p.dimensions === 'object' ? JSON.stringify(p.dimensions) : (p.dimensions || p.dimensions_text || null),
      category_id: isUuid(p.categoryId) ? p.categoryId : null,
      subcategory_id: isUuid(p.subCategoryId) ? p.subCategoryId : null,
      price: p.startingPrice ?? p.price ?? 0,
      campaign_price: p.campaignPrice ?? p.campaign_price ?? null,
      price_display_mode: p.priceDisplayMode || 'numeric',
      is_campaign: !!p.isCampaign || !!p.campaignPrice,
      is_new: !!p.isNew,
      is_published: !p.isHidden && !p.is_hidden,
      is_hidden: !!p.isHidden,
      cover_image_index: p.coverImageIndex || 0,
      stock_status: p.stockStatus || 'Sipariş Üzerine Üretiliyor',
      brand: p.brand || null,
      metadata: { ...(p.specs || {}), category: p.category, subCategory: p.subCategory },
      updated_at: new Date().toISOString()
    }));

    const { error } = await adminSupabase.from('products').upsert(payload, { onConflict: 'id' });
    if (error) throw error;

    // DELETE products that are no longer in the admin panel list (permanent delete)
    // This fixes: "Yönetim panelinden sildiğim ürün normal sitede silinmiyor"
    try {
      const incomingIds = products.map((p:any) => p && p.id).filter(Boolean);
      const { data: existingRows } = await adminSupabase.from('products').select('id');
      const existingIds = (existingRows || []).map((r:any) => String(r.id));
      const toDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await adminSupabase.from('product_media').delete().in('product_id', toDelete);
        await adminSupabase.from('products').delete().in('id', toDelete);
        console.log('Deleted removed products:', toDelete);
      }
    } catch (delErr:any) {
      console.error('Deleting removed products error:', delErr?.message || delErr);
    }

    // Also replace product_media so images appear on the live site
    for (const p of products) {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const pid = p.id;
      if (!pid) continue;
      await adminSupabase.from('product_media').delete().eq('product_id', pid);
      for (let i = 0; i < imgs.length; i++) {
        const url = imgs[i];
        if (!url || url.startsWith('data:')) continue;
        const isVideo = /\.(mp4|mov|webm)(?:[?#].*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url) || /^data:video\//i.test(url);
        await adminSupabase.from('product_media').insert({
          product_id: pid,
          media_url: url,
          media_type: isVideo ? 'video' : 'image',
          sort_order: i,
          is_cover: i === (p.coverImageIndex || 0)
        });
      }
    }

    res.json({ ok: true });
  } catch (e:any) {
    console.error('Sync products error', e);
    res.status(500).json({ error: String(e) });
  }
});

// Helper: ensure site_settings table exists using raw pg connection (auto-create)
async function ensureSiteSettingsTable() {
  const dbUrl = process.env.SUPABASE_DATABASE_URL;
  if (!dbUrl) return;
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(`
      create table if not exists site_settings (
        id integer primary key default 1,
        settings_json jsonb not null default '{}'::jsonb,
        updated_at timestamptz not null default now()
      );
    `);
    console.log('site_settings table ensured via pg');
  } catch (e:any) {
    console.error('ensureSiteSettingsTable error:', e?.message || e);
  } finally {
    await client.end().catch(() => {});
  }
}

app.post('/api/admin/syncSettings', async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!adminSupabase) return res.status(500).json({ error: 'Supabase admin client not configured' });
  const { settings } = req.body || {};
  if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Invalid payload' });
  try {
    // Ensure site_settings table exists (auto-create if missing)
    try { await adminSupabase.from('site_settings').select('id').limit(1); } catch (tableErr:any) {
      if (tableErr && (String(tableErr.message || '').includes('does not exist') || String(tableErr.code || '').includes('42P01'))) {
        await ensureSiteSettingsTable();
      }
    }
    // Upsert into site_settings table (singleton row id=1)
    const { error } = await adminSupabase.from('site_settings').upsert(
      { id: 1, settings_json: settings, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
    if (error) {
      // If table still missing, try creating it then retry
      await ensureSiteSettingsTable();
      const retry = await adminSupabase.from('site_settings').upsert(
        { id: 1, settings_json: settings, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
      if (retry.error) {
        console.error('Sync settings upsert error:', retry.error);
        return res.status(500).json({ error: String(retry.error.message || retry.error) });
      }
    }
    res.json({ ok: true });
  } catch (e:any) {
    console.error('Sync settings error', e);
    res.status(500).json({ error: String(e) });
  }
});

// Public settings endpoint returns the site settings to visitors
app.get('/api/public/settings', async (req, res) => {
  try {
    if (!adminSupabase) return res.json(null);
    const { data } = await adminSupabase.from('site_settings').select('*').eq('id', 1).limit(1).maybeSingle();
    if (!data) return res.json(null);
    res.json(data.settings_json || null);
  } catch (e:any) {
    console.error('Public settings error', e);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

app.post('/api/admin/syncCategories', async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!adminSupabase) return res.status(500).json({ error: 'Supabase admin client not configured' });
  const { categories } = req.body || {};
  if (!Array.isArray(categories)) return res.status(400).json({ error: 'Invalid payload' });
  try {
    // Accept either array of objects or array of strings
    const slugify = (input = '') => String(input)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const payload = categories.map((c:any) => {
      if (typeof c === 'string') {
        return { id: undefined, name: c, slug: slugify(c), parent_id: null, sort_order: 0, is_active: true };
      }
      return {
        id: c.id || undefined,
        name: c.name || String(c),
        slug: c.slug || (c.name ? slugify(c.name) : slugify(String(c))),
        parent_id: c.parent_id || null,
        sort_order: typeof c.sort_order === 'number' ? c.sort_order : 0,
        is_active: typeof c.is_active === 'boolean' ? c.is_active : true
      };
    });

    const { error } = await adminSupabase.from('categories').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    res.json({ ok: true });
  } catch (e:any) {
    console.error('Sync categories error', e);
    res.status(500).json({ error: String(e) });
  }
});

// FULL CATALOG SYNC: persists categories (with parent hierarchy), products, and media
// to Supabase. This is the source of truth for all customer-facing data.
app.post('/api/admin/syncCatalog', async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!adminSupabase) return res.status(500).json({ error: 'Supabase admin client not configured' });

  const { categories, products } = req.body || {};
  if (!Array.isArray(products)) return res.status(400).json({ error: 'Invalid payload' });

  const slugify = (input = '') => String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  try {
    // ---- 1. CATEGORIES: upsert full tree with parent_id links ----
    const categoryRows: any[] = [];
    if (Array.isArray(categories)) {
      categories.forEach((main: any, mainIdx: number) => {
        categoryRows.push({
          id: main.id || undefined,
          name: main.name || String(main),
          slug: main.slug || (main.id && main.id.startsWith('main-') ? slugify(main.name || 'kategori') : main.id) || slugify(main.name || 'kategori'),
          parent_id: null,
          sort_order: mainIdx,
          is_active: main.isActive !== false
        });
        (main.subCategories || []).forEach((sub: any, subIdx: number) => {
          categoryRows.push({
            id: sub.id || undefined,
            name: sub.name || String(sub),
            slug: sub.slug || (sub.id && sub.id.startsWith('sub-') ? slugify(sub.name || 'alt') : sub.id) || slugify(sub.name || 'alt'),
            parent_id: main.id || null,
            sort_order: subIdx,
            is_active: sub.isActive !== false
          });
        });
      });
    }
    if (categoryRows.length > 0) {
      const { error: catErr } = await adminSupabase.from('categories').upsert(categoryRows, { onConflict: 'id' });
      if (catErr) throw catErr;
    }

    // ---- 2. PRODUCTS: upsert full product list ----
    // IMPORTANT: Admin panel uses frontend ids like "main-123" / "sub-456".
    // Supabase categories.id is UUID; FK constraint fails for non-UUID.
    const isUuid = (v:any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ''));
    const productRows = products.map((p:any) => ({
      id: p.id || undefined,
      name: p.name,
      product_code: p.productCode || null,
      description: p.description || p.extendedDescription || null,
      material: Array.isArray(p.materials) ? p.materials.join('\n') : (p.material || null),
      dimensions_text: typeof p.dimensions === 'object' ? JSON.stringify(p.dimensions) : (p.dimensions || p.dimensions_text || null),
      category_id: isUuid(p.categoryId) ? p.categoryId : null,
      subcategory_id: isUuid(p.subCategoryId) ? p.subCategoryId : null,
      price: p.startingPrice ?? p.price ?? 0,
      campaign_price: p.campaignPrice ?? p.campaign_price ?? null,
      price_display_mode: p.priceDisplayMode || 'numeric',
      is_campaign: !!p.isCampaign || !!p.campaignPrice,
      is_new: !!p.isNew,
      is_published: !p.isHidden,
      is_hidden: !!p.isHidden,
      cover_image_index: p.coverImageIndex || 0,
      stock_status: p.stockStatus || 'Sipariş Üzerine Üretiliyor',
      brand: p.brand || null,
      metadata: { ...(p.specs || {}), category: p.category, subCategory: p.subCategory },
      updated_at: new Date().toISOString()
    }));

    if (productRows.length > 0) {
      const { error: prodErr } = await adminSupabase.from('products').upsert(productRows, { onConflict: 'id' });
      if (prodErr) throw prodErr;
    }

    // ---- 3. PRODUCT MEDIA: replace media for each product with current images ----
    for (const p of products) {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const pid = p.id;
      if (!pid) continue;
      await adminSupabase.from('product_media').delete().eq('product_id', pid);
      for (let i = 0; i < imgs.length; i++) {
        const url = imgs[i];
        if (!url || url.startsWith('data:')) continue;
        const isVideo = /\.(mp4|mov|webm)(?:[?#].*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url) || /^data:video\//i.test(url);
        await adminSupabase.from('product_media').insert({
          product_id: pid,
          media_url: url,
          media_type: isVideo ? 'video' : 'image',
          sort_order: i,
          is_cover: i === (p.coverImageIndex || 0)
        });
      }
    }

    res.json({ ok: true, categoriesSynced: categoryRows.length, productsSynced: productRows.length });
  } catch (e:any) {
    console.error('Sync catalog error', e);
    res.status(500).json({ error: String(e) });
  }
});

// Admin media upload (base64) -> Supabase Storage
app.post('/api/admin/upload-media', async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!adminSupabase) return res.status(500).json({ error: 'Supabase admin client not configured' });
  const { product_id, filename, fileBase64, mediaType, folder } = req.body || {};
  if (!filename || !fileBase64) return res.status(400).json({ error: 'Missing params' });
  try {
    // Ensure bucket exists (best-effort)
    try { await adminSupabase.storage.createBucket('product-media', { public: true }); } catch (e) { /* ignore if exists */ }
    const buf = Buffer.from(fileBase64, 'base64');
    // folder: 'product' (varsayılan), 'site' (hero/tanıtım), vb.
    const isSite = folder === 'site';
    const basePath = isSite ? 'site-media' : (product_id || 'general');
    const filePath = `${basePath}/${Date.now()}-${filename}`;
    const { error: uploadErr } = await adminSupabase.storage.from('product-media').upload(filePath, buf, { contentType: mediaType || 'application/octet-stream', upsert: false });
    if (uploadErr) throw uploadErr;
    const { data: urlData } = adminSupabase.storage.from('product-media').getPublicUrl(filePath);
    const mediaUrl = urlData?.publicUrl || '';
    // Ürün medyası ise → product_media tablosu atomatik dbs
    if (product_id && !isSite) {
      const { error: dbErr } = await adminSupabase.from('product_media').insert([{ product_id, media_url: mediaUrl, media_type: mediaType || 'image', sort_order: 0 }]);
      if (dbErr) console.error('Insert product_media error', dbErr);
    }
    res.json({ ok: true, url: mediaUrl });
  } catch (e:any) {
    console.error('Upload media error', e);
    res.status(500).json({ error: String(e) });
  }
});

// SUPABASE STATUS: quick health check for admin usage (requires admin session)
app.get('/api/admin/supabase-status', async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!adminSupabase) return res.json({ configured: false, bucketExists: false, message: 'Supabase admin client not configured' });
  try {
    // Try a lightweight list against the storage bucket to detect presence and permissions
    const { data, error } = await adminSupabase.storage.from('product-media').list('', { limit: 1 });
    const bucketExists = !error;
    res.json({ configured: true, bucketExists, error: error ? String(error.message || error) : null });
  } catch (e:any) {
    console.error('Supabase status check error', e);
    res.status(500).json({ configured: true, bucketExists: false, error: String(e) });
  }
});

// 2. AI-POWERED DESIGN IMAGE ANALYZER ENDPOINT
app.post('/api/gemini/analyze', async (req, res) => {
  const base64Data = req.body.imageBase64 || req.body.imageBytes;
  const mimeType = req.body.mimeType;

  if (!base64Data) {
    res.status(400).json({ error: 'Fotoğraf verisi (base64) gönderilmedi.' });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Elegant local fallback description in the schema-compliant format for instant usability
    res.json({
      analysis: {
        productType: 'kitchen',
        recommendedMaterial: 'İpek Mat Akrilik Lake MDF',
        recommendedColor: 'Mersin Adaçayı Yeşili',
        estimatedPrice: 32000,
        deliveryWeeks: 3,
        explanation: 'Yüklediğiniz lüks tasarım Provence tarzında bir meşe/lake eşleşmesine benzemektedir. Çat Kapı atölyemizde bu modeli ipek mat lake saten boyalı lüks gövdeli olarak ölçünüze göre hayata geçirebiliyoruz.',
        matchedColorHex: '#707F71'
      },
      localEngine: true
    });
    return;
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: base64Data
      }
    };

    const textPart = {
      text: `Lütfen bu yüklenen mobilya, kapı veya iç mimari tasarım görselini profesyonel bir zanaatkar gözüyle analiz et.
      Şu bilgileri sağlayan son derece şık, dürüst ve açıklayıcı bilgileri doldurarak belirtilen JSON şemasına uygun çıktı üret:
      
      - productType: Saptanan en yakın ürün kategorisi ID değeri. Şu seçeneklerden biri olmalıdır: 'door', 'steel-door', 'kitchen', 'wardrobe', 'cloakroom', 'tv-unit', 'shoe-rack', 'pantry', 'desk', 'bookshelf', 'bathroom', 'shower', 'bedroom', 'youth-room', 'dining-table', 'decorative-shelf'.
      - recommendedMaterial: En lüks, sağlam ve neme dayanıklı sonuç için önerdiğin hammadde terimi. Atölyemizde sadece yüksek yoğunluklu neme dayanıklı MDF kullandığımızı vurgula.
      - recommendedColor: Görseldeki renge en yakın Türkçe renk ismi (Örn: Kuzey Mat Beyazı, Mersin Adaçayı Yeşili, Asil Antrasit vb.)
      - estimatedPrice: Atölyede butik üretim tahmini fiyat bedeli (Örn: 28000). Sayı olmalıdır.
      - deliveryWeeks: Kaç haftada el işçiliğiyle teslim edilip kurulabileceği bilgisi (Örn: 3). Sayı olmalıdır.
      - explanation: Çözüm önerilerin, tasarım detayları, lake boyasının kalitesi ve mühürlenme aşamalarını içeren marangozluk teknik açıklaması (Türkçe).
      - matchedColorHex: Bu saptanan renge en yakın Hex kodu girmelisin (Örn: '#707F71').`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productType: { type: Type.STRING },
            recommendedMaterial: { type: Type.STRING },
            recommendedColor: { type: Type.STRING },
            estimatedPrice: { type: Type.INTEGER },
            deliveryWeeks: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            matchedColorHex: { type: Type.STRING }
          },
          required: ["productType", "recommendedMaterial", "recommendedColor", "estimatedPrice", "deliveryWeeks", "explanation", "matchedColorHex"]
        }
      }
    });

    let resultJson = {};
    try {
      resultJson = JSON.parse((response.text || '').trim());
    } catch (e) {
      // In case parsing fails, create a safe object
      resultJson = {
        productType: 'kitchen',
        recommendedMaterial: 'İpek Mat Akrilik Lake MDF',
        recommendedColor: 'Mersin Adaçayı Yeşili',
        estimatedPrice: 38000,
        deliveryWeeks: 3,
        explanation: response.text || '',
        matchedColorHex: '#707F71'
      };
    }

    res.json({ analysis: resultJson });
  } catch (err: any) {
    console.error('Gemini image analysis error:', err);
    res.status(500).json({ error: 'Görsel analiz edilirken bir hata oluştu. Lütfen dosya boyutunu veya formatını kontrol edin.' });
  }
});

// 3. AI 3D DESIGN ENHANCER & PHOTOREALISTIC RENDER ADVISOR ENDPOINT
app.post('/api/gemini/enhance-design', async (req, res) => {
  const { category, style, dimensions, material, color, parts, lighting } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    // Intelligent fallback AI architectural evaluation response
    res.json({
      enhancement: {
        aestheticScore: 9.6,
        styleName: style || 'Modern Lüks',
        proportionalRatioFeedback: `${category || 'Ürün'} tasarımı ${dimensions?.w || 240}x${dimensions?.h || 220} cm ölçüleri ile seçilen ${style || 'Modern'} konsepte mükemmel bir milimetrik simetri ve ergonomi sağlamaktadır. Alt plint ve üst taç birleşim alanları fırınlanmış İpek Mat Lake gövdeye özel olarak güçlendirilmiştir.`,
        styleAdvice: `${style || 'Modern'} tarzın gerektirdiği kesintisiz yalın çizgileri korumak adına Gola gizli profil kapak kulpları ve fırınlanmış Sayerlack lake astar uygulanmalıdır.`,
        suggestedAddons: [
          'Kapak altına 3000K Sıcak Gün Işığı Gizli LED Şerit',
          'Teleskopik Sessiz Frenli Blum Ray Sistemli Çekmece',
          'Bronz Reflekte Camlı Vitrin Bölmesi'
        ],
        materialAdvice: `${material || 'MDF'} malzemesi neme ve esnemeye karşı en yüksek dirence sahiptir. Çat Kapı atölyesinde E1 kalite sertifikalı monoblok MDF üzerinde 3 kat astar zımpara uygulaması yapılacaktır.`,
        photorealisticLightingDescription: `Stüdyo Kalitesinde 3D Render: ${color || 'Antrasit'} yüzey üzerinde 45° stüdyo spot ışığı yansıması, taban gölgesi ve sıcak LED ambiyans süzülmesi ile katmanlı ray-traced fotogerçekçi görünüm oluşturulmuştur.`,
        studioRenderParams: {
          shadowIntensity: 0.85,
          rayTracedGlow: '#FFD580',
          reflectionSheen: 0.9,
          environmentBackdrop: 'Lüks Mimari Stüdyo Duvarı',
          cameraDepthOfField: '24mm F/2.8 Prime Lens'
        }
      },
      localEngine: true
    });
    return;
  }

  try {
    const promptText = `Sen ÇAT KAPI Mobilya Sanayi'nin baş mimarı ve 3D görselleştirme uzmanısın.
    Kullanıcının tasarladığı şu 3D mobilya/yapı modelini analiz et ve seçtiği mimari stile (${style || 'Modern'}) göre yapay zeka geliştirmesi yap:

    Ürün Kategorisi: ${category}
    Seçilen Stil: ${style}
    Ölçüler: Genişlik ${dimensions?.w} cm, Yükseklik ${dimensions?.h} cm, Derinlik ${dimensions?.d} cm
    Malzeme: ${material}
    Renk: ${color}
    Eklenen Parçalar: ${JSON.stringify(parts || [])}
    Aydınlatma: ${JSON.stringify(lighting || {})}

    Aşağıdaki JSON şemasına uygun Türkçe yanıt ver:
    - aestheticScore: 1 ile 10 arasında estetik uyum puanı (float/number, örn: 9.5).
    - styleName: Seçilen stil ismi.
    - proportionalRatioFeedback: Ölçü ve derinlik oranlarının ergonomik değerlendirmesi.
    - styleAdvice: Seçilen mimari stile uygun kapak, kulp ve çizgi önerileri.
    - suggestedAddons: Tasarımı üst seviyeye taşıyacak 3 adet donanım/parça önerisi (string dizisi).
    - materialAdvice: Malzeme ve dayanıklılık tavsiyesi.
    - photorealisticLightingDescription: Stüdyo ışığı, gölge ve fotogerçekçi katalog görünüm açıklaması.
    - studioRenderParams: ShadowIntensity (0.1 - 1.0), rayTracedGlow (hex renk), reflectionSheen (0.1 - 1.0), environmentBackdrop (metin), cameraDepthOfField (metin) içeren obje.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aestheticScore: { type: Type.NUMBER },
            styleName: { type: Type.STRING },
            proportionalRatioFeedback: { type: Type.STRING },
            styleAdvice: { type: Type.STRING },
            suggestedAddons: { type: Type.ARRAY, items: { type: Type.STRING } },
            materialAdvice: { type: Type.STRING },
            photorealisticLightingDescription: { type: Type.STRING },
            studioRenderParams: {
              type: Type.OBJECT,
              properties: {
                shadowIntensity: { type: Type.NUMBER },
                rayTracedGlow: { type: Type.STRING },
                reflectionSheen: { type: Type.NUMBER },
                environmentBackdrop: { type: Type.STRING },
                cameraDepthOfField: { type: Type.STRING }
              },
              required: ["shadowIntensity", "rayTracedGlow", "reflectionSheen", "environmentBackdrop", "cameraDepthOfField"]
            }
          },
          required: ["aestheticScore", "styleName", "proportionalRatioFeedback", "styleAdvice", "suggestedAddons", "materialAdvice", "photorealisticLightingDescription", "studioRenderParams"]
        }
      }
    });

    let resultJson = JSON.parse((response.text || '').trim());
    res.json({ enhancement: resultJson });
  } catch (err: any) {
    console.error('AI Design Enhancement error:', err);
    res.status(500).json({ error: 'Yapay zeka geliştirmesi yapılırken hata oluştu.' });
  }
});

// Always serve static files (both development and production)
// When bundled by esbuild into dist/server.mjs the static assets sit next to it (__dirname).
// When running locally via tsx (src/server.ts) the assets live in <project>/dist.
import { existsSync } from 'fs';
const distCandidate = path.resolve(__dirname, 'dist');
const distPath = existsSync(distCandidate) ? distCandidate : __dirname;
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Ensure storage bucket exists (best-effort) when Supabase admin client is present
if (adminSupabase) {
  try {
    adminSupabase.storage.createBucket('product-media', { public: true }).catch(() => {
      // ignore errors (exists or permissions)
    });
  } catch (e) {
    // ignore errors (exists or permissions)
  }
}

// Vercel serverless handler: export the Express app directly.
// When running as a long-lived server (local dev / standalone Node),
// start listening on the configured port.
export default app;

// Guard against auto-listen on Vercel serverless runtime.
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
