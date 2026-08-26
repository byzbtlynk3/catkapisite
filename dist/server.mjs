// server.ts
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import dotenv from "dotenv";
import { existsSync } from "fs";
dotenv.config();
var SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
var SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
var adminSupabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log("Supabase admin client configured");
} else {
  console.log("Supabase admin client NOT configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server env to enable DB sync.");
}
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? Number(process.env.PORT) : 3e3;
app.use(express.json({ limit: "12mb" }));
var allowedOrigin = process.env.ALLOWED_ORIGIN || (process.env.NODE_ENV === "production" ? "" : "*");
if (allowedOrigin) {
  app.use(cors({ origin: allowedOrigin, credentials: true }));
} else {
  app.use(cors());
}
var otpStore = /* @__PURE__ */ new Map();
var otpVerifiedTokens = /* @__PURE__ */ new Map();
var sessions = /* @__PURE__ */ new Map();
var OTP_TTL_MS = 1e3 * 60 * 5;
var OTP_RESEND_COOLDOWN_MS = 1e3 * 60;
var OTP_MAX_ATTEMPTS = 5;
var ADMIN_FILE = path.join(process.cwd(), "admin.json");
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}
async function ensureAdminFile() {
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim();
  const providedPass = process.env.ADMIN_PASSWORD;
  if (adminSupabase) {
    try {
      const { data: existing } = await adminSupabase.from("admins").select("*").eq("username", adminUsername).limit(1).maybeSingle();
      if (existing && existing.id) {
        if (providedPass) {
          const { salt: salt3, hash: hash3 } = await hashPassword(providedPass);
          const { error: error2 } = await adminSupabase.from("admins").update({ salt: salt3, hash: hash3 }).eq("id", existing.id);
          if (error2) throw error2;
          console.log("Admin password re-hashed from env");
        }
        return;
      }
      if (!providedPass) {
        if (process.env.NODE_ENV === "production") {
          console.error("ADMIN_PASSWORD env var must be set in production to initialize admin user in DB.");
          throw new Error("Missing ADMIN_PASSWORD in production");
        }
        return;
      }
      const { salt: salt2, hash: hash2 } = await hashPassword(providedPass);
      const { error } = await adminSupabase.from("admins").upsert({ username: adminUsername, salt: salt2, hash: hash2 }, { onConflict: "username" });
      if (error) throw error;
      console.log("Admin user ensured in DB:", adminUsername);
      return;
    } catch (dbErr) {
      console.error("Failed to ensure admin in DB:", dbErr);
      throw dbErr;
    }
  }
  try {
    const raw = await fs.readFile(ADMIN_FILE, "utf8");
    const existing = JSON.parse(raw);
    if (existing && existing.username === adminUsername) {
      if (providedPass) {
        const { salt: salt2, hash: hash2 } = await hashPassword(providedPass);
        existing.salt = salt2;
        existing.hash = hash2;
        await fs.writeFile(ADMIN_FILE, JSON.stringify(existing, null, 2), "utf8");
      }
      return;
    }
  } catch (e) {
  }
  if (!providedPass) {
    if (process.env.NODE_ENV === "production") {
      console.error("ADMIN_PASSWORD env var must be set in production to initialize admin user.");
      throw new Error("Missing ADMIN_PASSWORD in production");
    }
    return;
  }
  const { salt, hash } = await hashPassword(providedPass);
  const content = { username: adminUsername, salt, hash };
  await fs.writeFile(ADMIN_FILE, JSON.stringify(content, null, 2), "utf8");
}
async function verifyAdminCredentials(username, password) {
  try {
    if (adminSupabase) {
      const { data, error } = await adminSupabase.from("admins").select("*").eq("username", username).limit(1).maybeSingle();
      if (error) {
        console.error("Admin DB lookup error", error);
        return false;
      }
      if (!data) return false;
      const hash2 = crypto.scryptSync(password, data.salt, 64).toString("hex");
      return crypto.timingSafeEqual(Buffer.from(hash2, "hex"), Buffer.from(data.hash, "hex"));
    }
    const raw = await fs.readFile(ADMIN_FILE, "utf8");
    const obj = JSON.parse(raw);
    if (obj.username !== username) return false;
    const hash = crypto.scryptSync(password, obj.salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(obj.hash, "hex"));
  } catch (e) {
    return false;
  }
}
async function updateAdminPassword(username, newPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(newPassword, salt, 64).toString("hex");
  const content = { username, salt, hash };
  if (adminSupabase) {
    const { error } = await adminSupabase.from("admins").upsert({ username, salt, hash }, { onConflict: "username" });
    if (error) throw error;
    return;
  }
  await fs.writeFile(ADMIN_FILE, JSON.stringify(content, null, 2), "utf8");
}
var AUTH_PHONES = ["05441373321", "05352194789"];
async function sendSmsViaProvider(phone, message) {
  const provider = process.env.SMS_PROVIDER;
  if (!provider) {
    console.log("SMS provider not configured, logging message instead:", phone, message);
    return { ok: true, provider: "none" };
  }
  if (provider === "twilio") {
    try {
      const twilioPkg = await import("twilio");
      const client = twilioPkg.default(process.env.SMS_API_KEY, process.env.SMS_API_SECRET);
      const from = process.env.SMS_FROM || void 0;
      await client.messages.create({ body: message, from, to: phone });
      return { ok: true, provider: "twilio" };
    } catch (e) {
      console.error("Twilio send error", e);
      return { ok: false, error: String(e) };
    }
  }
  console.log("Unsupported SMS_PROVIDER:", provider);
  return { ok: false, error: "Unsupported provider" };
}
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    res.status(400).json({ error: "Mesaj alan\u0131 zorunludur." });
    return;
  }
  const systemInstruction = `Sen \xC7AT KAPI Firmas\u0131n\u0131n resmi ve ak\u0131ll\u0131 Yapay Zeka Asistan\u0131s\u0131n.
  Mersin Akdeniz \u0130l\xE7esi \xC7ay Mahallesi, Cumhuriyet Bulvar\u0131 No: 33/A adresinde imalat yapan, kurucunuz ve ba\u015F usta/zanaatkar\u0131n\u0131z Nuri Yan\u0131k (Nuri Usta / Nuri Bey) liderli\u011Findeki \xF6zel imalat ah\u015Fap marangozluk, kap\u0131, mutfak dolab\u0131, vestiyer, gard\u0131rop, tv \xFCnitesi, banyo dolab\u0131, du\u015Fakabin, lavabo, klozet, fayans, seramik, mermer/granit/kuvars tezgah imalathanesisiniz.

  MUTLAKA UYULMASI GEREKEN DO\u011ERULUK VE Y\xD6NLEND\u0130RME KURALLARI:
  1. HAL\xDCS\u0130NASYON YAPMA: Ger\xE7ek d\u0131\u015F\u0131 \xFCr\xFCn, fiyat veya ma\u011Faza stok bilgisi UYDURMA. Emin olmad\u0131\u011F\u0131n konularda kesin bilgi verme.
  2. Sadece sana sa\u011Flanan GER\xC7EK ve AKT\u0130F y\xF6netim paneli \xFCr\xFCn listesindeki \xFCr\xFCnleri temel al.
  3. Aranan \xFCr\xFCn, fiyat veya teknik detay y\xF6netim paneli verisinde YOKSA veya emin de\u011Filsen, tahmin y\xFCr\xFCtmek yerine do\u011Frudan Nuri Usta ile ileti\u015Fime ge\xE7mesini \xF6ner (WhatsApp: 0535 219 47 89, Telefon: 0535 219 47 89 veya \u0130leti\u015Fim Sayfas\u0131).
  4. D\xDCKKAN VE \u0130MALAT HAKKINDA: \xC7AT KAPI'n\u0131n kendi imalat\u0131 olan \xF6zel \xF6l\xE7\xFC \xFCretim, \xFCcretsiz yerinde ke\u015Fif ve \xF6l\xE7\xFC alma s\xFCreci, teslimat ve montaj garantisi, birinci s\u0131n\u0131f monoblok MDF ve \u0130talyan Sayerlack ipek mat lake cila kullan\u0131m\u0131 hakk\u0131nda do\u011Fru bilgiler ver.
  5. KATEGOR\u0130LER: \u0130\xE7 Kap\u0131lar, \xC7elik Kap\u0131lar, Mutfak Dolaplar\u0131, Gard\u0131rop, Vestiyer, TV \xDCniteleri, Banyo Dolaplar\u0131, Du\u015Fakabin, Lavabo, Klozet, Fayans, Seramik, Mermer / Granit / Kuvars Tezgahlar konular\u0131nda detayl\u0131 ve do\u011Fru y\xF6nlendirmeler yap.
  6. \xDCR\xDCN Y\xD6NLEND\u0130RMES\u0130: M\xFC\u015Fteri bir \xFCr\xFCn veya kategori sordu\u011Funda (\xF6rne\u011Fin "Beyaz lake kap\u0131", "MDF mutfak dolab\u0131", "Vestiyer modelleri"), ilgili kategorideki aktif \xFCr\xFCnleri \xF6ne \xE7\u0131kar ve kullan\u0131c\u0131y\u0131 ilgili kategoriye y\xF6nlendir.
  7. \u0130LET\u0130\u015E\u0130M Y\xD6NLEND\u0130RMES\u0130: \u0130stenildi\u011Finde veya net bilgi verilemeyen durumlarda kullan\u0131c\u0131ya WhatsApp (0535 219 47 89), Telefon (0535 219 47 89) ve \u0130leti\u015Fim Sayfas\u0131 kanallar\u0131n\u0131 sun.`;
  try {
    const ai = getGeminiClient();
    if (!ai) {
      const msgLower = message.toLowerCase();
      let responseText = "";
      if (msgLower.includes("mdf") && (msgLower.includes("suntalam") || msgLower.includes("suntalamla"))) {
        responseText = `MDF (Orta Yo\u011Funlukta Lif Levha) ve Suntalam (Yonga Levha) marangozlukta s\u0131k\xE7a kar\u015F\u0131la\u015Ft\u0131r\u0131lan iki malzemedir. 

**MDF Nedir?** 
Odun liflerinin f\u0131r\u0131nlan\u0131p yap\u0131\u015Ft\u0131r\u0131c\u0131lar yard\u0131m\u0131yla preslenmesiyle elde edilir. \u0130\xE7 yap\u0131s\u0131 \xE7ok yo\u011Fun ve p\xFCr\xFCzs\xFCzd\xFCr. Suya, neme kar\u015F\u0131 dayan\u0131m\u0131 katbekat y\xFCksektir. Vida tutma mukavemeti kusursuzdur. 

**Suntalam Nedir?** 
Tala\u015F par\xE7alar\u0131n\u0131n preslenmesiyle yap\u0131l\u0131r. \u0130\xE7 yap\u0131s\u0131 bo\u015Fluklu oldu\u011Fu i\xE7in neme maruz kald\u0131\u011F\u0131nda h\u0131zl\u0131ca \u015Fi\u015Fme ve d\xF6k\xFClme yapabilir, vidalar\u0131 zamanla gev\u015Feyebilir. 

*Biz \xC7at Kap\u0131 olarak mutfak g\xF6vdelerinde, oda kap\u0131lar\u0131nda ve banyo dolaplar\u0131nda yaln\u0131zca monoblok neme dayan\u0131kl\u0131 E1 sertifikal\u0131 kal\u0131n MDF paneller kullan\u0131yoruz. Uzun vadeli l\xFCks kalitemizin s\u0131rr\u0131 buradad\u0131r.* Nuri Bey ile detayl\u0131 teknik detaylar\u0131 g\xF6r\xFC\u015Fmek i\xE7in **0535 219 47 89** numaral\u0131 hattan arayabilir veya do\u011Frudan WhatsApp butonu ile ileti\u015Fime ge\xE7ebilirsiniz.`;
      } else if (msgLower.includes("mdf")) {
        responseText = `Evet, \xC7at Kap\u0131 olarak imal etti\u011Fimiz mutfak dolaplar\u0131, kap\u0131lar, vestiyerler ve di\u011Fer t\xFCm \xF6zel \xFCretim mobilyalar\u0131m\u0131z\u0131n ana g\xF6vdesini ve kapaklar\u0131n\u0131 **birinci s\u0131n\u0131f monoblok MDF (Medium Density Fiberboard)** kullanarak \xFCretiyoruz. MDF \xFCzerine uygulad\u0131\u011F\u0131m\u0131z astar z\u0131mpara sistemi ve f\u0131r\u0131nlanm\u0131\u015F \u0130pek Mat Lake saten boyas\u0131 sayesinde \xF6m\xFCr boyu sararmayan ve nemden etkilenmeyen kusursuz zeminler elde ediyoruz.`;
      } else if (msgLower.includes("\xE7elik kap\u0131") || msgLower.includes("celik kapi")) {
        responseText = `\xC7elik kap\u0131 sat\u0131n al\u0131rken en \xE7ok dikkat etmeniz gereken hususlar \u015Funlard\u0131r:

1. **Sac Kal\u0131nl\u0131\u011F\u0131:** G\xF6vdede en az 1.5 - 2 mm galvaniz b\xFCt\xFCn \xE7elik kullan\u0131lmal\u0131d\u0131r.
2. **Kilit G\xFCvenli\u011Fi:** Kale Monoblok veya \xE7ok noktal\u0131 emniyet kilit mili z\u0131rh plakalar\u0131 tercih edilmelidir.
3. **Is\u0131 ve Ses Yal\u0131t\u0131m\u0131:** Kanat i\xE7erisinin ta\u015Fy\xFCn\xFC ve s\u0131zd\u0131rmazl\u0131k contalar\u0131yla doldurulmu\u015F olmas\u0131 gerekir.

*\xC7at Kap\u0131 markal\u0131 Armor \xE7elik kap\u0131lar\u0131m\u0131zda, Mersin'in zorlu nem iklimine dayan\u0131kl\u0131 suya mukavim marin ah\u015Fap kompozit kaplamalar ve Kale Kilit monoblok \xE7elik sistemleri bizzat Nuri Usta'n\u0131n montaj g\xFCvencesiyle sunulmaktad\u0131r.*`;
      } else if (msgLower.includes("vestiyer") || msgLower.includes("portmanto")) {
        responseText = `Mersin antrelerinde \u015F\u0131k bir vestiyer tasarlarken \u015Fu \xFC\xE7 unsura dikkat edilmelidir:
1. **Tavan S\u0131f\u0131r Tasar\u0131m:** Toz birikimini \xF6nlemek ve depolama alan\u0131n\u0131 art\u0131rmak i\xE7in vestiyer tavana kadar s\u0131f\u0131rlanmal\u0131d\u0131r.
2. **G\xF6nye ve Pano Korumas\u0131:** Elektrik sigorta kutusu ve internet panelleri vestiyer i\xE7inde gizlenmeli ancak m\xFCdahaleye a\xE7\u0131k olmal\u0131d\u0131r.
3. **Derinlik ve Havand\u0131rma:** Palto ve kabanlar i\xE7in derinlik en az 55-60 cm olmal\u0131, ayakkab\u0131l\u0131klar\u0131n neme kar\u015F\u0131 gizli arkal\u0131k havaland\u0131rma menfezleri bulunmal\u0131d\u0131r.

Nuri Bey bizzat evinize konuk olup lazerle milimetrik \xF6l\xE7\xFCleri \xE7\u0131kar\u0131p vestiyer plan\u0131n\u0131z\u0131 \xE7izebilir! Do\u011Frudan WhatsApp veya telefon \xFCzerinden randevu isteyebilirsiniz.`;
      } else if (msgLower.includes("mutfak") && (msgLower.includes("k\xFC\xE7\xFCk") || msgLower.includes("renk"))) {
        responseText = `Dar ve k\xFC\xE7\xFCk mutfaklar i\xE7in \xF6nerece\u011Fimiz en iyi t\xFCyolar \u015Funlard\u0131r:
- **Renk Paleti:** \u0130pek mat Linen Beyaz\u0131, \u0130nci Grisi veya yumu\u015Fak Grej tonlar\u0131 mutfa\u011F\u0131 ferah ve ayd\u0131nl\u0131k g\xF6sterir.
- **Kapak Profili:** Kesintisiz ve kalabal\u0131k hissi vermeyen 'Gola' (Gizli Kulpsuz) profil modelleri alan geni\u015Fletir.
- **Dikey Kazan\u0131m:** \xDCst dolaplar\u0131 tavana s\u0131f\u0131rlayarak %35 daha fazla depolama kazan\u0131rken dikey \xE7izgileri uzatm\u0131\u015F olursunuz.

\xC7at Kap\u0131 at\xF6lyemizde bizzat sizin mutfak \xF6l\xE7\xFCn\xFCze g\xF6re \xF6zel yerle\u015Fim plan\u0131 \xE7iziyoruz. H\u0131zl\u0131 teklif almak i\xE7in tasar\u0131m mod\xFCl\xFCm\xFCz\xFC kullanabilirsiniz!`;
      } else {
        responseText = `Merhaba! Mersin Akdeniz'deki \xC7at Kap\u0131 imalat at\xF6lyemize ho\u015F geldiniz. 

Ben yapay zeka asistan\u0131n\u0131z\u0131m. Kurucumuz **Nuri Yan\u0131k Bey** y\xF6netimindeki at\xF6lyemizde \xFCretti\u011Fimiz \xF6zel tasar\u0131m kap\u0131lar, mutfaklar, vestiyerler, gard\u0131roplar, \u015F\u0131k ayakkab\u0131l\u0131klar ve dekoratif \xFCniteler hakk\u0131nda bana diledi\u011Finizi sorabilirsiniz. 

*Size \u015Funlarda yard\u0131mc\u0131 olabilirim:*
- Suntalam ile MDF aras\u0131ndaki teknik farklar,
- Banyo, mutfak dolab\u0131 ve kap\u0131 \xF6l\xE7\xFClerinin do\u011Fru al\u0131nmas\u0131,
- Evinize en uygun renk ve malzeme kartelas\u0131 se\xE7imi.

Bize ayr\u0131ca [Instagram](https://instagram.com/catyapii) hesab\u0131m\u0131zdan ula\u015Fabilir ya da do\u011Frudan randevu i\xE7in WhatsApp hatt\u0131m\u0131z\u0131 (**0535 219 47 89**) kullanabilirsiniz!`;
      }
      res.json({ text: responseText, localEngine: true });
      return;
    }
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text || "" });
  } catch (err) {
    console.error("Gemini chat error:", err);
    res.status(500).json({ error: "Sistem \u015Fu anda yan\u0131t veremiyor. L\xFCtfen daha sonra tekrar deneyin." });
  }
});
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Eksik parametre" });
  await ensureAdminFile();
  const ok = await verifyAdminCredentials(username, password);
  if (!ok) return res.status(401).json({ error: "Ge\xE7ersiz kimlik bilgileri" });
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 1e3 * 60 * 60 * 8;
  if (adminSupabase) {
    try {
      const { error } = await adminSupabase.from("admin_sessions").insert([{ token, username, expires_at: new Date(expiresAt).toISOString() }]);
      if (error) throw error;
      res.json({ token });
      return;
    } catch (e) {
      console.error("Failed to create admin session in DB", e);
      return res.status(500).json({ error: "Session olu\u015Fturulamad\u0131" });
    }
  }
  sessions.set(token, { username, expiresAt });
  res.json({ token });
});
app.post("/api/admin/logout", async (req, res) => {
  const auth = req.headers?.authorization || "";
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(400).json({ error: "Token eksik" });
  const token = m[1];
  if (adminSupabase) {
    try {
      await adminSupabase.from("admin_sessions").delete().eq("token", token);
    } catch (e) {
      console.error("Logout delete session error", e);
    }
  }
  sessions.delete(token);
  res.json({ ok: true });
});
app.post("/api/sms/send-otp", async (req, res) => {
  const { phone } = req.body || {};
  if (!phone || !AUTH_PHONES.includes(phone)) return res.status(400).json({ error: "Yetkili numara de\u011Fil veya eksik." });
  const existing = otpStore.get(phone);
  if (existing && Date.now() - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((OTP_RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1e3);
    return res.status(429).json({ error: `Yeni kod g\xF6ndermek i\xE7in ${waitSec} saniye bekleyin.`, retryAfterSec: waitSec });
  }
  const code = String(Math.floor(1e5 + Math.random() * 9e5));
  const salt = crypto.randomBytes(8).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(code).digest("hex");
  otpStore.set(phone, { hash: salt + ":" + hash, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, lastSentAt: Date.now() });
  const msg = `\xC7at Kap\u0131 do\u011Frulama kodunuz: ${code}`;
  try {
    const result = await sendSmsViaProvider(phone, msg);
    if (!result.ok) return res.status(500).json({ error: "SMS sa\u011Flay\u0131c\u0131s\u0131na ba\u011Flan\u0131lamad\u0131: " + (result.error || "") });
    res.json({ ok: true });
  } catch (e) {
    console.error("SMS send error", e);
    res.status(500).json({ error: "SMS g\xF6nderilirken hata olu\u015Ftu." });
  }
});
app.post("/api/sms/verify-otp", async (req, res) => {
  const { phone, code } = req.body || {};
  if (!phone || !code) return res.status(400).json({ error: "Eksik parametre" });
  const entry = otpStore.get(phone);
  if (!entry) return res.status(400).json({ error: "Kod g\xF6nderilmemi\u015F veya s\xFCresi dolmu\u015F." });
  if (entry.expiresAt < Date.now()) {
    otpStore.delete(phone);
    return res.status(400).json({ error: "Do\u011Frulama kodunun s\xFCresi doldu." });
  }
  const [salt, stored] = entry.hash.split(":");
  const h = crypto.createHmac("sha256", salt).update(code).digest("hex");
  entry.attempts = (entry.attempts || 0) + 1;
  if (h !== stored) {
    otpStore.set(phone, entry);
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(phone);
      return res.status(429).json({ error: "\xC7ok fazla hatal\u0131 deneme. L\xFCtfen tekrar kod isteyin." });
    }
    return res.status(400).json({ error: `Do\u011Frulama kodu hatal\u0131 (kalan deneme: ${OTP_MAX_ATTEMPTS - entry.attempts}).` });
  }
  otpStore.delete(phone);
  const otpToken = crypto.randomBytes(24).toString("hex");
  otpVerifiedTokens.set(otpToken, { phone, expiresAt: Date.now() + 1e3 * 60 * 10 });
  res.json({ otpToken });
});
app.post("/api/admin/change-password", async (req, res) => {
  const { username, newPassword, otpToken } = req.body || {};
  if (!username || !newPassword || !otpToken) return res.status(400).json({ error: "Eksik parametre" });
  const v = otpVerifiedTokens.get(otpToken);
  if (!v || v.expiresAt < Date.now()) return res.status(400).json({ error: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F OTP token." });
  try {
    await updateAdminPassword(username, newPassword);
    otpVerifiedTokens.delete(otpToken);
    res.json({ ok: true });
  } catch (e) {
    console.error("Password change error", e);
    res.status(500).json({ error: "\u015Eifre g\xFCncellenemedi." });
  }
});
async function requireAdmin(req, res) {
  const auth = req.headers?.authorization || "";
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];
  if (adminSupabase) {
    try {
      const { data } = await adminSupabase.from("admin_sessions").select("*").eq("token", token).limit(1).maybeSingle();
      if (!data) return null;
      const expiresAt = new Date(data.expires_at).getTime();
      if (expiresAt < Date.now()) {
        await adminSupabase.from("admin_sessions").delete().eq("token", token);
        return null;
      }
      return { token, username: data.username };
    } catch (e) {
      console.error("Admin session lookup error", e);
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
app.get("/api/public/products", async (req, res) => {
  try {
    if (!adminSupabase) {
      const data = await fs.readFile(path.join(__dirname, "src", "data.ts"), "utf8");
      const match = data.match(/INITIAL_PRODUCTS\s*=\s*(\[([\s\S]*?)\]);/m);
      if (match) {
        return res.json([]);
      }
      return res.json([]);
    }
    const { data: products } = await adminSupabase.from("products").select("*").order("created_at", { ascending: false });
    const { data: media } = await adminSupabase.from("product_media").select("*").order("sort_order", { ascending: true });
    const { data: categories } = await adminSupabase.from("categories").select("*");
    const catMap = {};
    (categories || []).forEach((c) => {
      catMap[String(c.id)] = c;
    });
    const out = (products || []).filter((p) => p.is_published).map((p) => {
      const medias = (media || []).filter((m) => String(m.product_id) === String(p.id)).map((m) => ({ url: m.media_url, type: m.media_type }));
      const categoryObj = catMap[String(p.category_id)] || null;
      const subObj = catMap[String(p.subcategory_id)] || null;
      const categoryParent = categoryObj && categoryObj.parent_id ? catMap[String(categoryObj.parent_id)] ? catMap[String(categoryObj.parent_id)].name : null : null;
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
        startingPrice: Number(p.price) > 0 ? Number(p.price) : void 0,
        campaignPrice: Number(p.campaign_price) > 0 ? Number(p.campaign_price) : void 0,
        isCampaign: !!p.is_campaign || Number(p.campaign_price) > 0,
        materials: p.material ? String(p.material).split(/\r?\n/).map((value) => value.trim()).filter(Boolean) : [],
        dimensions: p.dimensions_text || meta["\xD6l\xE7\xFCler"] || meta["\xD6l\xE7\xFC"] || void 0,
        specs: meta,
        priceDisplayMode: p.price_display_mode || "numeric",
        price: p.price ?? null,
        images: medias.map((m) => m.url),
        media: medias
      };
    });
    res.json(out);
  } catch (e) {
    console.error("Public products error", e);
    res.status(500).json({ error: "Sunucu hatas\u0131" });
  }
});
app.get("/api/public/categories", async (req, res) => {
  try {
    if (!adminSupabase) return res.json([]);
    const { data: categories } = await adminSupabase.from("categories").select("*").order("sort_order", { ascending: true });
    res.json(categories || []);
  } catch (e) {
    console.error("Public categories error", e);
    res.status(500).json({ error: "Sunucu hatas\u0131" });
  }
});
app.post("/api/admin/syncProducts", async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (!adminSupabase) return res.status(500).json({ error: "Supabase admin client not configured" });
  const { products } = req.body || {};
  if (!Array.isArray(products)) return res.status(400).json({ error: "Invalid payload" });
  try {
    const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ""));
    const payload = products.map((p) => ({
      id: p.id || void 0,
      name: p.name,
      product_code: p.productCode || null,
      description: p.description || p.extendedDescription || null,
      material: Array.isArray(p.materials) ? p.materials.join("\n") : p.material || null,
      dimensions_text: typeof p.dimensions === "object" ? JSON.stringify(p.dimensions) : p.dimensions || p.dimensions_text || null,
      category_id: isUuid(p.categoryId) ? p.categoryId : null,
      subcategory_id: isUuid(p.subCategoryId) ? p.subCategoryId : null,
      price: p.startingPrice ?? p.price ?? 0,
      campaign_price: p.campaignPrice ?? p.campaign_price ?? null,
      price_display_mode: p.priceDisplayMode || "numeric",
      is_campaign: !!p.isCampaign || !!p.campaignPrice,
      is_new: !!p.isNew,
      is_published: !p.isHidden && !p.is_hidden,
      is_hidden: !!p.isHidden,
      cover_image_index: p.coverImageIndex || 0,
      stock_status: p.stockStatus || "Sipari\u015F \xDCzerine \xDCretiliyor",
      brand: p.brand || null,
      metadata: { ...p.specs || {}, category: p.category, subCategory: p.subCategory },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
    const { error } = await adminSupabase.from("products").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    try {
      const incomingIds = products.map((p) => p && p.id).filter(Boolean);
      const { data: existingRows } = await adminSupabase.from("products").select("id");
      const existingIds = (existingRows || []).map((r) => String(r.id));
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await adminSupabase.from("product_media").delete().in("product_id", toDelete);
        await adminSupabase.from("products").delete().in("id", toDelete);
        console.log("Deleted removed products:", toDelete);
      }
    } catch (delErr) {
      console.error("Deleting removed products error:", delErr?.message || delErr);
    }
    for (const p of products) {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const pid = p.id;
      if (!pid) continue;
      await adminSupabase.from("product_media").delete().eq("product_id", pid);
      for (let i = 0; i < imgs.length; i++) {
        const url = imgs[i];
        if (!url || url.startsWith("data:")) continue;
        const isVideo = /\.(mp4|mov|webm)(?:[?#].*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url) || /^data:video\//i.test(url);
        await adminSupabase.from("product_media").insert({
          product_id: pid,
          media_url: url,
          media_type: isVideo ? "video" : "image",
          sort_order: i,
          is_cover: i === (p.coverImageIndex || 0)
        });
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("Sync products error", e);
    res.status(500).json({ error: String(e) });
  }
});
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
    console.log("site_settings table ensured via pg");
  } catch (e) {
    console.error("ensureSiteSettingsTable error:", e?.message || e);
  } finally {
    await client.end().catch(() => {
    });
  }
}
app.post("/api/admin/syncSettings", async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (!adminSupabase) return res.status(500).json({ error: "Supabase admin client not configured" });
  const { settings } = req.body || {};
  if (!settings || typeof settings !== "object") return res.status(400).json({ error: "Invalid payload" });
  try {
    try {
      await adminSupabase.from("site_settings").select("id").limit(1);
    } catch (tableErr) {
      if (tableErr && (String(tableErr.message || "").includes("does not exist") || String(tableErr.code || "").includes("42P01"))) {
        await ensureSiteSettingsTable();
      }
    }
    const { error } = await adminSupabase.from("site_settings").upsert(
      { id: 1, settings_json: settings, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
      { onConflict: "id" }
    );
    if (error) {
      await ensureSiteSettingsTable();
      const retry = await adminSupabase.from("site_settings").upsert(
        { id: 1, settings_json: settings, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
        { onConflict: "id" }
      );
      if (retry.error) {
        console.error("Sync settings upsert error:", retry.error);
        return res.status(500).json({ error: String(retry.error.message || retry.error) });
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("Sync settings error", e);
    res.status(500).json({ error: String(e) });
  }
});
app.get("/api/public/settings", async (req, res) => {
  try {
    if (!adminSupabase) return res.json(null);
    const { data } = await adminSupabase.from("site_settings").select("*").eq("id", 1).limit(1).maybeSingle();
    if (!data) return res.json(null);
    res.json(data.settings_json || null);
  } catch (e) {
    console.error("Public settings error", e);
    res.status(500).json({ error: "Sunucu hatas\u0131" });
  }
});
app.post("/api/admin/syncCategories", async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (!adminSupabase) return res.status(500).json({ error: "Supabase admin client not configured" });
  const { categories } = req.body || {};
  if (!Array.isArray(categories)) return res.status(400).json({ error: "Invalid payload" });
  try {
    const slugify = (input = "") => String(input).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
    const payload = categories.map((c) => {
      if (typeof c === "string") {
        return { id: void 0, name: c, slug: slugify(c), parent_id: null, sort_order: 0, is_active: true };
      }
      return {
        id: c.id || void 0,
        name: c.name || String(c),
        slug: c.slug || (c.name ? slugify(c.name) : slugify(String(c))),
        parent_id: c.parent_id || null,
        sort_order: typeof c.sort_order === "number" ? c.sort_order : 0,
        is_active: typeof c.is_active === "boolean" ? c.is_active : true
      };
    });
    const { error } = await adminSupabase.from("categories").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    console.error("Sync categories error", e);
    res.status(500).json({ error: String(e) });
  }
});
app.post("/api/admin/syncCatalog", async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (!adminSupabase) return res.status(500).json({ error: "Supabase admin client not configured" });
  const { categories, products } = req.body || {};
  if (!Array.isArray(products)) return res.status(400).json({ error: "Invalid payload" });
  const slugify = (input = "") => String(input).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
  try {
    const categoryRows = [];
    if (Array.isArray(categories)) {
      categories.forEach((main, mainIdx) => {
        categoryRows.push({
          id: main.id || void 0,
          name: main.name || String(main),
          slug: main.slug || (main.id && main.id.startsWith("main-") ? slugify(main.name || "kategori") : main.id) || slugify(main.name || "kategori"),
          parent_id: null,
          sort_order: mainIdx,
          is_active: main.isActive !== false
        });
        (main.subCategories || []).forEach((sub, subIdx) => {
          categoryRows.push({
            id: sub.id || void 0,
            name: sub.name || String(sub),
            slug: sub.slug || (sub.id && sub.id.startsWith("sub-") ? slugify(sub.name || "alt") : sub.id) || slugify(sub.name || "alt"),
            parent_id: main.id || null,
            sort_order: subIdx,
            is_active: sub.isActive !== false
          });
        });
      });
    }
    if (categoryRows.length > 0) {
      const { error: catErr } = await adminSupabase.from("categories").upsert(categoryRows, { onConflict: "id" });
      if (catErr) throw catErr;
    }
    const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v || ""));
    const productRows = products.map((p) => ({
      id: p.id || void 0,
      name: p.name,
      product_code: p.productCode || null,
      description: p.description || p.extendedDescription || null,
      material: Array.isArray(p.materials) ? p.materials.join("\n") : p.material || null,
      dimensions_text: typeof p.dimensions === "object" ? JSON.stringify(p.dimensions) : p.dimensions || p.dimensions_text || null,
      category_id: isUuid(p.categoryId) ? p.categoryId : null,
      subcategory_id: isUuid(p.subCategoryId) ? p.subCategoryId : null,
      price: p.startingPrice ?? p.price ?? 0,
      campaign_price: p.campaignPrice ?? p.campaign_price ?? null,
      price_display_mode: p.priceDisplayMode || "numeric",
      is_campaign: !!p.isCampaign || !!p.campaignPrice,
      is_new: !!p.isNew,
      is_published: !p.isHidden,
      is_hidden: !!p.isHidden,
      cover_image_index: p.coverImageIndex || 0,
      stock_status: p.stockStatus || "Sipari\u015F \xDCzerine \xDCretiliyor",
      brand: p.brand || null,
      metadata: { ...p.specs || {}, category: p.category, subCategory: p.subCategory },
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }));
    if (productRows.length > 0) {
      const { error: prodErr } = await adminSupabase.from("products").upsert(productRows, { onConflict: "id" });
      if (prodErr) throw prodErr;
    }
    for (const p of products) {
      const imgs = Array.isArray(p.images) ? p.images : [];
      const pid = p.id;
      if (!pid) continue;
      await adminSupabase.from("product_media").delete().eq("product_id", pid);
      for (let i = 0; i < imgs.length; i++) {
        const url = imgs[i];
        if (!url || url.startsWith("data:")) continue;
        const isVideo = /\.(mp4|mov|webm)(?:[?#].*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url) || /^data:video\//i.test(url);
        await adminSupabase.from("product_media").insert({
          product_id: pid,
          media_url: url,
          media_type: isVideo ? "video" : "image",
          sort_order: i,
          is_cover: i === (p.coverImageIndex || 0)
        });
      }
    }
    res.json({ ok: true, categoriesSynced: categoryRows.length, productsSynced: productRows.length });
  } catch (e) {
    console.error("Sync catalog error", e);
    res.status(500).json({ error: String(e) });
  }
});
app.post("/api/admin/upload-media", async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (!adminSupabase) return res.status(500).json({ error: "Supabase admin client not configured" });
  const { product_id, filename, fileBase64, mediaType, folder } = req.body || {};
  if (!filename || !fileBase64) return res.status(400).json({ error: "Missing params" });
  try {
    try {
      await adminSupabase.storage.createBucket("product-media", { public: true });
    } catch (e) {
    }
    const buf = Buffer.from(fileBase64, "base64");
    const isSite = folder === "site";
    const basePath = isSite ? "site-media" : product_id || "general";
    const filePath = `${basePath}/${Date.now()}-${filename}`;
    const { error: uploadErr } = await adminSupabase.storage.from("product-media").upload(filePath, buf, { contentType: mediaType || "application/octet-stream", upsert: false });
    if (uploadErr) throw uploadErr;
    const { data: urlData } = adminSupabase.storage.from("product-media").getPublicUrl(filePath);
    const mediaUrl = urlData?.publicUrl || "";
    if (product_id && !isSite) {
      const { error: dbErr } = await adminSupabase.from("product_media").insert([{ product_id, media_url: mediaUrl, media_type: mediaType || "image", sort_order: 0 }]);
      if (dbErr) console.error("Insert product_media error", dbErr);
    }
    res.json({ ok: true, url: mediaUrl });
  } catch (e) {
    console.error("Upload media error", e);
    res.status(500).json({ error: String(e) });
  }
});
app.get("/api/admin/supabase-status", async (req, res) => {
  const auth = await requireAdmin(req, res);
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  if (!adminSupabase) return res.json({ configured: false, bucketExists: false, message: "Supabase admin client not configured" });
  try {
    const { data, error } = await adminSupabase.storage.from("product-media").list("", { limit: 1 });
    const bucketExists = !error;
    res.json({ configured: true, bucketExists, error: error ? String(error.message || error) : null });
  } catch (e) {
    console.error("Supabase status check error", e);
    res.status(500).json({ configured: true, bucketExists: false, error: String(e) });
  }
});
app.post("/api/gemini/analyze", async (req, res) => {
  const base64Data = req.body.imageBase64 || req.body.imageBytes;
  const mimeType = req.body.mimeType;
  if (!base64Data) {
    res.status(400).json({ error: "Foto\u011Fraf verisi (base64) g\xF6nderilmedi." });
    return;
  }
  const ai = getGeminiClient();
  if (!ai) {
    res.json({
      analysis: {
        productType: "kitchen",
        recommendedMaterial: "\u0130pek Mat Akrilik Lake MDF",
        recommendedColor: "Mersin Ada\xE7ay\u0131 Ye\u015Fili",
        estimatedPrice: 32e3,
        deliveryWeeks: 3,
        explanation: "Y\xFCkledi\u011Finiz l\xFCks tasar\u0131m Provence tarz\u0131nda bir me\u015Fe/lake e\u015Fle\u015Fmesine benzemektedir. \xC7at Kap\u0131 at\xF6lyemizde bu modeli ipek mat lake saten boyal\u0131 l\xFCks g\xF6vdeli olarak \xF6l\xE7\xFCn\xFCze g\xF6re hayata ge\xE7irebiliyoruz.",
        matchedColorHex: "#707F71"
      },
      localEngine: true
    });
    return;
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/png",
        data: base64Data
      }
    };
    const textPart = {
      text: `L\xFCtfen bu y\xFCklenen mobilya, kap\u0131 veya i\xE7 mimari tasar\u0131m g\xF6rselini profesyonel bir zanaatkar g\xF6z\xFCyle analiz et.
      \u015Eu bilgileri sa\u011Flayan son derece \u015F\u0131k, d\xFCr\xFCst ve a\xE7\u0131klay\u0131c\u0131 bilgileri doldurarak belirtilen JSON \u015Femas\u0131na uygun \xE7\u0131kt\u0131 \xFCret:
      
      - productType: Saptanan en yak\u0131n \xFCr\xFCn kategorisi ID de\u011Feri. \u015Eu se\xE7eneklerden biri olmal\u0131d\u0131r: 'door', 'steel-door', 'kitchen', 'wardrobe', 'cloakroom', 'tv-unit', 'shoe-rack', 'pantry', 'desk', 'bookshelf', 'bathroom', 'shower', 'bedroom', 'youth-room', 'dining-table', 'decorative-shelf'.
      - recommendedMaterial: En l\xFCks, sa\u011Flam ve neme dayan\u0131kl\u0131 sonu\xE7 i\xE7in \xF6nerdi\u011Fin hammadde terimi. At\xF6lyemizde sadece y\xFCksek yo\u011Funluklu neme dayan\u0131kl\u0131 MDF kulland\u0131\u011F\u0131m\u0131z\u0131 vurgula.
      - recommendedColor: G\xF6rseldeki renge en yak\u0131n T\xFCrk\xE7e renk ismi (\xD6rn: Kuzey Mat Beyaz\u0131, Mersin Ada\xE7ay\u0131 Ye\u015Fili, Asil Antrasit vb.)
      - estimatedPrice: At\xF6lyede butik \xFCretim tahmini fiyat bedeli (\xD6rn: 28000). Say\u0131 olmal\u0131d\u0131r.
      - deliveryWeeks: Ka\xE7 haftada el i\u015F\xE7ili\u011Fiyle teslim edilip kurulabilece\u011Fi bilgisi (\xD6rn: 3). Say\u0131 olmal\u0131d\u0131r.
      - explanation: \xC7\xF6z\xFCm \xF6nerilerin, tasar\u0131m detaylar\u0131, lake boyas\u0131n\u0131n kalitesi ve m\xFCh\xFCrlenme a\u015Famalar\u0131n\u0131 i\xE7eren marangozluk teknik a\xE7\u0131klamas\u0131 (T\xFCrk\xE7e).
      - matchedColorHex: Bu saptanan renge en yak\u0131n Hex kodu girmelisin (\xD6rn: '#707F71').`
    };
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
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
      resultJson = JSON.parse((response.text || "").trim());
    } catch (e) {
      resultJson = {
        productType: "kitchen",
        recommendedMaterial: "\u0130pek Mat Akrilik Lake MDF",
        recommendedColor: "Mersin Ada\xE7ay\u0131 Ye\u015Fili",
        estimatedPrice: 38e3,
        deliveryWeeks: 3,
        explanation: response.text || "",
        matchedColorHex: "#707F71"
      };
    }
    res.json({ analysis: resultJson });
  } catch (err) {
    console.error("Gemini image analysis error:", err);
    res.status(500).json({ error: "G\xF6rsel analiz edilirken bir hata olu\u015Ftu. L\xFCtfen dosya boyutunu veya format\u0131n\u0131 kontrol edin." });
  }
});
app.post("/api/gemini/enhance-design", async (req, res) => {
  const { category, style, dimensions, material, color, parts, lighting } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    res.json({
      enhancement: {
        aestheticScore: 9.6,
        styleName: style || "Modern L\xFCks",
        proportionalRatioFeedback: `${category || "\xDCr\xFCn"} tasar\u0131m\u0131 ${dimensions?.w || 240}x${dimensions?.h || 220} cm \xF6l\xE7\xFCleri ile se\xE7ilen ${style || "Modern"} konsepte m\xFCkemmel bir milimetrik simetri ve ergonomi sa\u011Flamaktad\u0131r. Alt plint ve \xFCst ta\xE7 birle\u015Fim alanlar\u0131 f\u0131r\u0131nlanm\u0131\u015F \u0130pek Mat Lake g\xF6vdeye \xF6zel olarak g\xFC\xE7lendirilmi\u015Ftir.`,
        styleAdvice: `${style || "Modern"} tarz\u0131n gerektirdi\u011Fi kesintisiz yal\u0131n \xE7izgileri korumak ad\u0131na Gola gizli profil kapak kulplar\u0131 ve f\u0131r\u0131nlanm\u0131\u015F Sayerlack lake astar uygulanmal\u0131d\u0131r.`,
        suggestedAddons: [
          "Kapak alt\u0131na 3000K S\u0131cak G\xFCn I\u015F\u0131\u011F\u0131 Gizli LED \u015Eerit",
          "Teleskopik Sessiz Frenli Blum Ray Sistemli \xC7ekmece",
          "Bronz Reflekte Caml\u0131 Vitrin B\xF6lmesi"
        ],
        materialAdvice: `${material || "MDF"} malzemesi neme ve esnemeye kar\u015F\u0131 en y\xFCksek dirence sahiptir. \xC7at Kap\u0131 at\xF6lyesinde E1 kalite sertifikal\u0131 monoblok MDF \xFCzerinde 3 kat astar z\u0131mpara uygulamas\u0131 yap\u0131lacakt\u0131r.`,
        photorealisticLightingDescription: `St\xFCdyo Kalitesinde 3D Render: ${color || "Antrasit"} y\xFCzey \xFCzerinde 45\xB0 st\xFCdyo spot \u0131\u015F\u0131\u011F\u0131 yans\u0131mas\u0131, taban g\xF6lgesi ve s\u0131cak LED ambiyans s\xFCz\xFClmesi ile katmanl\u0131 ray-traced fotoger\xE7ek\xE7i g\xF6r\xFCn\xFCm olu\u015Fturulmu\u015Ftur.`,
        studioRenderParams: {
          shadowIntensity: 0.85,
          rayTracedGlow: "#FFD580",
          reflectionSheen: 0.9,
          environmentBackdrop: "L\xFCks Mimari St\xFCdyo Duvar\u0131",
          cameraDepthOfField: "24mm F/2.8 Prime Lens"
        }
      },
      localEngine: true
    });
    return;
  }
  try {
    const promptText = `Sen \xC7AT KAPI Mobilya Sanayi'nin ba\u015F mimar\u0131 ve 3D g\xF6rselle\u015Ftirme uzman\u0131s\u0131n.
    Kullan\u0131c\u0131n\u0131n tasarlad\u0131\u011F\u0131 \u015Fu 3D mobilya/yap\u0131 modelini analiz et ve se\xE7ti\u011Fi mimari stile (${style || "Modern"}) g\xF6re yapay zeka geli\u015Ftirmesi yap:

    \xDCr\xFCn Kategorisi: ${category}
    Se\xE7ilen Stil: ${style}
    \xD6l\xE7\xFCler: Geni\u015Flik ${dimensions?.w} cm, Y\xFCkseklik ${dimensions?.h} cm, Derinlik ${dimensions?.d} cm
    Malzeme: ${material}
    Renk: ${color}
    Eklenen Par\xE7alar: ${JSON.stringify(parts || [])}
    Ayd\u0131nlatma: ${JSON.stringify(lighting || {})}

    A\u015Fa\u011F\u0131daki JSON \u015Femas\u0131na uygun T\xFCrk\xE7e yan\u0131t ver:
    - aestheticScore: 1 ile 10 aras\u0131nda estetik uyum puan\u0131 (float/number, \xF6rn: 9.5).
    - styleName: Se\xE7ilen stil ismi.
    - proportionalRatioFeedback: \xD6l\xE7\xFC ve derinlik oranlar\u0131n\u0131n ergonomik de\u011Ferlendirmesi.
    - styleAdvice: Se\xE7ilen mimari stile uygun kapak, kulp ve \xE7izgi \xF6nerileri.
    - suggestedAddons: Tasar\u0131m\u0131 \xFCst seviyeye ta\u015F\u0131yacak 3 adet donan\u0131m/par\xE7a \xF6nerisi (string dizisi).
    - materialAdvice: Malzeme ve dayan\u0131kl\u0131l\u0131k tavsiyesi.
    - photorealisticLightingDescription: St\xFCdyo \u0131\u015F\u0131\u011F\u0131, g\xF6lge ve fotoger\xE7ek\xE7i katalog g\xF6r\xFCn\xFCm a\xE7\u0131klamas\u0131.
    - studioRenderParams: ShadowIntensity (0.1 - 1.0), rayTracedGlow (hex renk), reflectionSheen (0.1 - 1.0), environmentBackdrop (metin), cameraDepthOfField (metin) i\xE7eren obje.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
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
    let resultJson = JSON.parse((response.text || "").trim());
    res.json({ enhancement: resultJson });
  } catch (err) {
    console.error("AI Design Enhancement error:", err);
    res.status(500).json({ error: "Yapay zeka geli\u015Ftirmesi yap\u0131l\u0131rken hata olu\u015Ftu." });
  }
});
var distCandidate = path.resolve(__dirname, "dist");
var distPath = existsSync(distCandidate) ? distCandidate : __dirname;
console.log("Serving static files from:", distPath);
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
if (adminSupabase) {
  try {
    adminSupabase.storage.createBucket("product-media", { public: true }).catch(() => {
    });
  } catch (e) {
  }
}
var server_default = app;
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export {
  server_default as default
};
//# sourceMappingURL=server.mjs.map
