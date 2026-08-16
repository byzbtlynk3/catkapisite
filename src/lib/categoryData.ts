export interface SubCategoryDef {
  id: string;
  name: string;
  meshType: string;
  description?: string;
  isActive?: boolean;
  itemsIncluded?: string[];
}

export interface MainCategoryDef {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  subCategories: SubCategoryDef[];
}

export const DEFAULT_MAIN_CATEGORIES_STRUCTURE: MainCategoryDef[] = [
  {
    id: 'yatak-odasi',
    name: 'Yatak Odası',
    isActive: true,
    subCategories: [
      { id: 'yatak-odasi-takimi', name: 'Yatak Odası Takımı', meshType: 'wardrobe', isActive: true, itemsIncluded: ['Gardırop', 'Karyola & Başlık', 'Aynalı Şifonyer', '2 Komodin'] },
      { id: 'gardirop', name: 'Gardırop', meshType: 'wardrobe', isActive: true },
      { id: 'surgulu-gardirop', name: 'Sürgülü Gardırop', meshType: 'wardrobe', isActive: true },
      { id: 'kapakli-gardirop', name: 'Kapaklı Gardırop', meshType: 'wardrobe', isActive: true },
      { id: 'sifonyer', name: 'Şifonyer', meshType: 'wardrobe', isActive: true },
      { id: 'komodin', name: 'Komodin', meshType: 'wardrobe', isActive: true },
      { id: 'makyaj-masasi', name: 'Makyaj Masası', meshType: 'desk', isActive: true },
      { id: 'bazali-karyola', name: 'Bazalı Karyola', meshType: 'wardrobe', isActive: true },
      { id: 'karyola-basligi', name: 'Karyola Başlığı', meshType: 'wardrobe', isActive: true },
      { id: 'aynali-dolap', name: 'Aynalı Dolap', meshType: 'bath-mirror', isActive: true },
      { id: 'giyinme-odasi', name: 'Giyinme Odası', meshType: 'wardrobe', isActive: true },
      { id: 'kose-gardirop', name: 'Köşe Gardırop', meshType: 'wardrobe', isActive: true }
    ]
  },
  {
    id: 'genc-odasi',
    name: 'Genç Odası',
    isActive: true,
    subCategories: [
      { id: 'genc-odasi-takimi', name: 'Genç Odası Takımı', meshType: 'wardrobe', isActive: true, itemsIncluded: ['Gardırop', 'Çalışma Masası', 'Karyola', 'Kitaplık'] },
      { id: 'gardirop-genc', name: 'Gardırop', meshType: 'wardrobe', isActive: true },
      { id: 'calisma-masasi-genc', name: 'Çalışma Masası', meshType: 'desk', isActive: true },
      { id: 'kitaplik-genc', name: 'Kitaplık', meshType: 'bookshelf', isActive: true },
      { id: 'sifonyer-genc', name: 'Şifonyer', meshType: 'wardrobe', isActive: true },
      { id: 'komodin-genc', name: 'Komodin', meshType: 'wardrobe', isActive: true },
      { id: 'karyola-genc', name: 'Karyola', meshType: 'wardrobe', isActive: true },
      { id: 'ranza-genc', name: 'Ranza', meshType: 'wardrobe', isActive: true },
      { id: 'raf-sistemleri-genc', name: 'Raf Sistemleri', meshType: 'bookshelf', isActive: true }
    ]
  },
  {
    id: 'cocuk-odasi',
    name: 'Çocuk Odası',
    isActive: true,
    subCategories: [
      { id: 'cocuk-odasi-takimi', name: 'Çocuk Odası Takımı', meshType: 'wardrobe', isActive: true, itemsIncluded: ['Gardırop', 'Montessori Yatak', 'Oyuncak Dolabı'] },
      { id: 'montessori-yatak', name: 'Montessori Yatak', meshType: 'wardrobe', isActive: true },
      { id: 'gardirop-cocuk', name: 'Gardırop', meshType: 'wardrobe', isActive: true },
      { id: 'calisma-masasi-cocuk', name: 'Çalışma Masası', meshType: 'desk', isActive: true },
      { id: 'kitaplik-cocuk', name: 'Kitaplık', meshType: 'bookshelf', isActive: true },
      { id: 'sifonyer-cocuk', name: 'Şifonyer', meshType: 'wardrobe', isActive: true },
      { id: 'oyuncak-dolabi', name: 'Oyuncak Dolabı', meshType: 'wardrobe', isActive: true },
      { id: 'ranza-cocuk', name: 'Ranza', meshType: 'wardrobe', isActive: true }
    ]
  },
  {
    id: 'salon',
    name: 'Salon',
    isActive: true,
    subCategories: [
      { id: 'tv-unitesi', name: 'TV Ünitesi', meshType: 'tv-unit', isActive: true },
      { id: 'konsol-salon', name: 'Konsol', meshType: 'tv-unit', isActive: true },
      { id: 'vitrin-salon', name: 'Vitrin', meshType: 'bookshelf', isActive: true },
      { id: 'kitaplik-salon', name: 'Kitaplık', meshType: 'bookshelf', isActive: true },
      { id: 'orta-sehpa', name: 'Orta Sehpa', meshType: 'desk', isActive: true },
      { id: 'yan-sehpa', name: 'Yan Sehpa', meshType: 'desk', isActive: true },
      { id: 'dresuar-salon', name: 'Dresuar', meshType: 'desk', isActive: true },
      { id: 'raf-sistemleri-salon', name: 'Raf Sistemleri', meshType: 'bookshelf', isActive: true }
    ]
  },
  {
    id: 'yemek-odasi',
    name: 'Yemek Odası',
    isActive: true,
    subCategories: [
      { id: 'yemek-odasi-takimi', name: 'Yemek Odası Takımı', meshType: 'desk', isActive: true, itemsIncluded: ['Yemek Masası', 'Konsol', 'Vitrin', '6 Sandalye'] },
      { id: 'yemek-masasi', name: 'Yemek Masası', meshType: 'desk', isActive: true },
      { id: 'konsol-yemek', name: 'Konsol', meshType: 'tv-unit', isActive: true },
      { id: 'vitrin-yemek', name: 'Vitrin', meshType: 'bookshelf', isActive: true },
      { id: 'sandalye', name: 'Sandalye', meshType: 'desk', isActive: true },
      { id: 'bench', name: 'Bench', meshType: 'desk', isActive: true }
    ]
  },
  {
    id: 'mutfak',
    name: 'Mutfak',
    isActive: true,
    subCategories: [
      { id: 'mutfak-dolabi', name: 'Mutfak Dolabı', meshType: 'kitchen', isActive: true },
      { id: 'ada-mutfak', name: 'Ada Mutfak', meshType: 'kitchen', isActive: true },
      { id: 'kahve-kosesi', name: 'Kahve Köşesi', meshType: 'coffee-corner', isActive: true },
      { id: 'kiler-dolabi', name: 'Kiler Dolabı', meshType: 'pantry', isActive: true },
      { id: 'erzak-dolabi', name: 'Erzak Dolabı', meshType: 'pantry', isActive: true },
      { id: 'ankastre-dolabi', name: 'Ankastre Dolabı', meshType: 'kitchen', isActive: true },
      { id: 'kuvars-tezgah', name: 'Kuvars Tezgâh', meshType: 'countertop', isActive: true },
      { id: 'mermer-tezgah', name: 'Mermer Tezgâh', meshType: 'countertop', isActive: true },
      { id: 'evye-dolabi', name: 'Evye Dolabı', meshType: 'kitchen', isActive: true }
    ]
  },
  {
    id: 'banyo',
    name: 'Banyo',
    isActive: true,
    subCategories: [
      { id: 'banyo-dolabi', name: 'Banyo Dolabı', meshType: 'bathroom', isActive: true },
      { id: 'lavabo', name: 'Lavabo', meshType: 'sink', isActive: true },
      { id: 'lavabo-dolabi', name: 'Lavabo Dolabı', meshType: 'bathroom', isActive: true },
      { id: 'banyo-aynasi', name: 'Banyo Aynası', meshType: 'bath-mirror', isActive: true },
      { id: 'aynali-dolap-banyo', name: 'Aynalı Dolap', meshType: 'bath-mirror', isActive: true },
      { id: 'boy-dolabi', name: 'Boy Dolabı', meshType: 'pantry', isActive: true },
      { id: 'dusakabin', name: 'Duşakabin', meshType: 'shower', isActive: true },
      { id: 'klozet', name: 'Klozet', meshType: 'toilet', isActive: true },
      { id: 'gomme-rezervuar', name: 'Gömme Rezervuar', meshType: 'toilet', isActive: true }
    ]
  },
  {
    id: 'antre-hol',
    name: 'Antre ve Hol',
    isActive: true,
    subCategories: [
      { id: 'vestiyer', name: 'Vestiyer', meshType: 'vestiyer', isActive: true },
      { id: 'ayakkabilik', name: 'Ayakkabılık', meshType: 'shoe-rack', isActive: true },
      { id: 'portmanto', name: 'Portmanto', meshType: 'vestiyer', isActive: true },
      { id: 'dresuar-antre', name: 'Dresuar', meshType: 'desk', isActive: true },
      { id: 'askilik', name: 'Askılık', meshType: 'vestiyer', isActive: true },
      { id: 'hol-dolabi', name: 'Hol Dolabı', meshType: 'vestiyer', isActive: true }
    ]
  },
  {
    id: 'kapilar',
    name: 'Kapılar',
    isActive: true,
    subCategories: [
      { id: 'celik-kapi', name: 'Çelik Kapı', meshType: 'steel-door', isActive: true },
      { id: 'ic-oda-kapisi', name: 'İç Oda Kapısı', meshType: 'door', isActive: true },
      { id: 'amerikan-panel-kapi', name: 'Amerikan Panel Kapı', meshType: 'door', isActive: true },
      { id: 'lake-kapi', name: 'Lake Kapı', meshType: 'door', isActive: true },
      { id: 'camli-kapi', name: 'Camlı Kapı', meshType: 'door', isActive: true },
      { id: 'surgulu-kapi', name: 'Sürgülü Kapı', meshType: 'door', isActive: true },
      { id: 'katlanir-kapi', name: 'Katlanır Kapı', meshType: 'door', isActive: true }
    ]
  },
  {
    id: 'yapi-malzemeleri',
    name: 'Yapı Malzemeleri',
    isActive: true,
    subCategories: [
      { id: 'fayans', name: 'Fayans', meshType: 'flooring', isActive: true },
      { id: 'seramik', name: 'Seramik', meshType: 'flooring', isActive: true },
      { id: 'parke', name: 'Parke', meshType: 'flooring', isActive: true },
      { id: 'mermer', name: 'Mermer', meshType: 'countertop', isActive: true },
      { id: 'kuvars', name: 'Kuvars', meshType: 'countertop', isActive: true },
      { id: 'supurgelik', name: 'Süpürgelik', meshType: 'flooring', isActive: true },
      { id: 'duvar-paneli', name: 'Duvar Paneli', meshType: 'flooring', isActive: true }
    ]
  },
  {
    id: 'ofis-mobilyalari',
    name: 'Ofis Mobilyaları',
    isActive: true,
    subCategories: [
      { id: 'mudur-masasi', name: 'Müdür Masası', meshType: 'desk', isActive: true },
      { id: 'personel-masasi', name: 'Personel Masası', meshType: 'desk', isActive: true },
      { id: 'calisma-masasi-ofis', name: 'Çalışma Masası', meshType: 'desk', isActive: true },
      { id: 'kitaplik-ofis', name: 'Kitaplık', meshType: 'bookshelf', isActive: true },
      { id: 'dosya-dolabi', name: 'Dosya Dolabı', meshType: 'pantry', isActive: true },
      { id: 'toplanti-masasi', name: 'Toplantı Masası', meshType: 'desk', isActive: true }
    ]
  },
  {
    id: 'dugun-paketleri',
    name: 'Düğün Paketleri',
    isActive: true,
    subCategories: [
      { id: 'ekonomik-paket', name: 'Ekonomik Paket', meshType: 'wardrobe', isActive: true, itemsIncluded: ['Yatak Odası Takımı', 'Yemek Odası Takımı', 'TV Ünitesi', 'Gardırop'] },
      { id: 'standart-paket', name: 'Standart Paket', meshType: 'wardrobe', isActive: true, itemsIncluded: ['Sürgülü Yatak Odası', 'Açılır Yemek Masası', 'Vitrin', 'TV Ünitesi'] },
      { id: 'premium-paket', name: 'Premium Paket', meshType: 'wardrobe', isActive: true, itemsIncluded: ['6 Kapak Lake Gardırop', 'Karyola Baza', 'Yemek Masası', 'Konsol'] },
      { id: 'luks-paket', name: 'Lüks Paket', meshType: 'wardrobe', isActive: true, itemsIncluded: ['Cam Kapak LED Gardırop', 'Saray Yemek Odası', 'Şömineli TV Ünitesi'] }
    ]
  },
  {
    id: 'ozel-uretim',
    name: 'Özel Üretim',
    isActive: true,
    subCategories: [
      { id: 'ozel-olcu-mutfak', name: 'Özel Ölçü Mutfak', meshType: 'kitchen', isActive: true },
      { id: 'ozel-olcu-gardirop', name: 'Özel Ölçü Gardırop', meshType: 'wardrobe', isActive: true },
      { id: 'ozel-olcu-vestiyer', name: 'Özel Ölçü Vestiyer', meshType: 'vestiyer', isActive: true },
      { id: 'ozel-olcu-tv-unitesi', name: 'Özel Ölçü TV Ünitesi', meshType: 'tv-unit', isActive: true },
      { id: 'ozel-olcu-kitaplik', name: 'Özel Ölçü Kitaplık', meshType: 'bookshelf', isActive: true },
      { id: 'cnc-kesim', name: 'CNC Kesim', meshType: 'door', isActive: true },
      { id: 'projeye-ozel-uretim', name: 'Projeye Özel Üretim', meshType: 'wardrobe', isActive: true }
    ]
  }
];

const STORAGE_KEY = 'catkapi_categories_data_v2';

export function getStoredCategories(): MainCategoryDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored categories', e);
  }
  return DEFAULT_MAIN_CATEGORIES_STRUCTURE;
}

export function saveStoredCategories(categories: MainCategoryDef[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent('category_data_updated', { detail: categories }));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function resetStoredCategories() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('category_data_updated', { detail: DEFAULT_MAIN_CATEGORIES_STRUCTURE }));
}

export const MAIN_CATEGORIES_STRUCTURE: MainCategoryDef[] = getStoredCategories();

export const OFFICIAL_MAIN_CATEGORIES_NAMES: string[] = DEFAULT_MAIN_CATEGORIES_STRUCTURE.map(c => c.name);
