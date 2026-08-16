export interface CustomGroupDef {
  id: string;
  name: string;
  items: string[];
}

export const DEFAULT_CUSTOM_GROUPS: CustomGroupDef[] = [
  {
    id: 'mobilya',
    name: 'Mobilya',
    items: [
      'Mutfak Dolabı',
      'Banyo Dolabı',
      'Gardırop',
      'Sürgülü Gardırop',
      'Vestiyer',
      'Ayakkabılık',
      'TV Ünitesi',
      'Kitaplık',
      'Çalışma Masası',
      'Şifonyer',
      'Komodin',
      'Kiler Dolabı',
      'Kahve Köşesi',
      'Dresuar',
      'Konsol',
      'Vitrin',
      'Raf Sistemleri',
      'Giyinme Odası',
      'Çamaşır Dolabı',
      'Özel Dolap',
      'Ofis Dolabı'
    ]
  },
  {
    id: 'kapilar',
    name: 'Kapılar',
    items: [
      'Çelik Kapı',
      'İç Oda Kapısı',
      'Amerikan Panel Kapı',
      'Lake Kapı',
      'Camlı Kapı',
      'Sürgülü Kapı',
      'Katlanır Kapı'
    ]
  },
  {
    id: 'banyo',
    name: 'Banyo',
    items: [
      'Lavabo Dolabı',
      'Lavabo',
      'Banyo Aynası',
      'Aynalı Dolap',
      'Duşakabin',
      'Klozet',
      'Boy Dolabı'
    ]
  },
  {
    id: 'yapi-urunleri',
    name: 'Yapı Ürünleri',
    items: [
      'Mermer Tezgâh',
      'Kuvars Tezgâh',
      'Fayans',
      'Seramik',
      'Parke',
      'Duvar Paneli',
      'Süpürgelik'
    ]
  },
  {
    id: 'digi-proje',
    name: 'Diğer',
    items: [
      'Projeye Özel Üretim',
      'Özel Ölçü Üretim',
      'Ticari Proje',
      'Villa Projesi',
      'Toplu Konut Projesi',
      'Kafe / Restoran Projesi',
      'Ofis Projesi'
    ]
  }
];

export const DEFAULT_MATERIALS: string[] = [
  'MDF Lam',
  'Lake MDF',
  'Akrilik Kapak',
  'High Gloss',
  'Membran Kapak',
  'Masif Ahşap',
  'Kontrplak',
  'Marin Kontrplak',
  'Compact Laminat',
  'PVC Kaplama',
  'Cam Kapak',
  'Alüminyum Çerçeveli Kapak',
  'Lake Cam',
  'Ahşap Kaplama',
  'Doğal Ahşap',
  'Ceviz Kaplama',
  'Meşe Kaplama',
  'Mat Saten Yüzey',
  'Parlak Yüzey',
  'Soft Touch Yüzey'
];

export interface ManufacturingParamsConfig {
  materials: string[];
  materialTypes: string[];
  colors: string[];
  units: string[];
  dimensionLimits: {
    minWidth: number;
    maxWidth: number;
    defaultWidth: number;
    minHeight: number;
    maxHeight: number;
    defaultHeight: number;
    minDepth: number;
    maxDepth: number;
    defaultDepth: number;
    unitName: string;
  };
  pricingValues: {
    baseM2UnitPrice: number;
    baseLinearUnitPrice: number;
    lacquerMultiplier: number;
    acrylicMultiplier: number;
    hardwareCost: number;
    vatRatePercent: number;
  };
}

export const DEFAULT_MANUFACTURING_PARAMS: ManufacturingParamsConfig = {
  materials: DEFAULT_MATERIALS,
  materialTypes: ['Gövde Malzemesi', 'Kapak Malzemesi', 'Tezgâh Malzemesi', 'Aksesuar / Menteşe'],
  colors: [
    'Mat Saten (%10 Parlaklık) - Kadifemsi Dokulu',
    'Yarım Mat (%30 Parlaklık) - Modern Parıltı',
    'Tam Parlak (%90 Fırınlanmış Glossy)',
    'Doğal Kadife Dokulu Cila',
    'İpek Mat Beyaz',
    'Antrasit Mat',
    'Krem Saten',
    'Ceviz Dokulu'
  ],
  units: ['cm', 'm²', 'metre tül', 'adet'],
  dimensionLimits: {
    minWidth: 40,
    maxWidth: 1200,
    defaultWidth: 240,
    minHeight: 70,
    maxHeight: 350,
    defaultHeight: 220,
    minDepth: 10,
    maxDepth: 150,
    defaultDepth: 60,
    unitName: 'cm'
  },
  pricingValues: {
    baseM2UnitPrice: 4500,
    baseLinearUnitPrice: 3800,
    lacquerMultiplier: 1.25,
    acrylicMultiplier: 1.35,
    hardwareCost: 1200,
    vatRatePercent: 20
  }
};

const GROUPS_STORAGE_KEY = 'catkapi_custom_groups_v2';
const MATERIALS_STORAGE_KEY = 'catkapi_custom_materials_v2';
const PARAMS_STORAGE_KEY = 'catkapi_manufacturing_params_v1';

export function getStoredCustomGroups(): CustomGroupDef[] {
  try {
    const raw = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error loading custom groups', e);
  }
  return DEFAULT_CUSTOM_GROUPS;
}

export function saveStoredCustomGroups(groups: CustomGroupDef[]) {
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
    window.dispatchEvent(new CustomEvent('custom_production_data_updated'));
  } catch (e) {
    console.error('Failed to save custom groups', e);
  }
}

export function getStoredMaterials(): string[] {
  try {
    const raw = localStorage.getItem(MATERIALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out Suntalam if present in legacy local storage
        const filtered = parsed.filter((m: string) => m.toLowerCase() !== 'suntalam');
        return filtered.length > 0 ? filtered : DEFAULT_MATERIALS;
      }
    }
  } catch (e) {
    console.warn('Error loading materials', e);
  }
  return DEFAULT_MATERIALS;
}

export function saveStoredMaterials(materials: string[]) {
  try {
    // Ensure Suntalam is never saved
    const cleaned = materials.filter(m => m.toLowerCase() !== 'suntalam');
    localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('custom_production_data_updated'));
  } catch (e) {
    console.error('Failed to save materials', e);
  }
}

export function getStoredParameterSettings(): ManufacturingParamsConfig {
  try {
    const raw = localStorage.getItem(PARAMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Guarantee Suntalam is removed from materials array
        if (Array.isArray(parsed.materials)) {
          parsed.materials = parsed.materials.filter((m: string) => m.toLowerCase() !== 'suntalam');
        }
        return {
          ...DEFAULT_MANUFACTURING_PARAMS,
          ...parsed,
          dimensionLimits: { ...DEFAULT_MANUFACTURING_PARAMS.dimensionLimits, ...(parsed.dimensionLimits || {}) },
          pricingValues: { ...DEFAULT_MANUFACTURING_PARAMS.pricingValues, ...(parsed.pricingValues || {}) }
        };
      }
    }
  } catch (e) {
    console.warn('Error loading parameter settings', e);
  }
  return DEFAULT_MANUFACTURING_PARAMS;
}

export function saveStoredParameterSettings(params: ManufacturingParamsConfig) {
  try {
    if (params.materials) {
      params.materials = params.materials.filter(m => m.toLowerCase() !== 'suntalam');
    }
    localStorage.setItem(PARAMS_STORAGE_KEY, JSON.stringify(params));
    saveStoredMaterials(params.materials || DEFAULT_MATERIALS);
    window.dispatchEvent(new CustomEvent('custom_production_data_updated'));
    window.dispatchEvent(new CustomEvent('parameters_data_updated', { detail: params }));
  } catch (e) {
    console.error('Failed to save parameter settings', e);
  }
}

export function resetStoredCustomData() {
  localStorage.removeItem(GROUPS_STORAGE_KEY);
  localStorage.removeItem(MATERIALS_STORAGE_KEY);
  localStorage.removeItem(PARAMS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('custom_production_data_updated'));
}
