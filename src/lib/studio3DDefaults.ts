export interface Studio3DUnitPrices {
  govde: number;       // Gövde birim fiyatı
  kapak: number;       // Kapak birim fiyatı
  cekmece: number;     // Çekmece birim fiyatı
  raf: number;         // Raf birim fiyatı
  askilik: number;     // Askılık birim fiyatı
  led: number;         // LED birim fiyatı
  camKapak: number;    // Cam kapak birim fiyatı
  kulp: number;        // Kulp birim fiyatı
  raySistemi: number;  // Ray sistemi fiyatı
  montaj: number;      // Montaj maliyeti
  iscilik: number;     // İşçilik maliyeti
}

export interface Studio3DCategoryConfig {
  id: string;
  name: string;
  meshType: string;
  defaultCm: { w: number; h: number; d: number; t: number };
  basePrice: number;
  isActive: boolean;
  order: number;
  materials: { name: string; mult: number }[];
  hardware: { type: string; name: string }[];
  unitPrices: Studio3DUnitPrices;
  customSettings?: Record<string, boolean>;
}

export interface Studio3DColor {
  id: string;
  name: string;
  hex: string;
}

export interface Studio3DLedColor {
  name: string;
  hex: string;
}

export interface Studio3DConfig {
  categories: Studio3DCategoryConfig[];
  colors: Studio3DColor[];
  ledColors: Studio3DLedColor[];
}

export const DEFAULT_3D_COLORS: Studio3DColor[] = [
  { id: 'white', name: 'Kuzey Mat Beyaz', hex: '#F9FAF9' },
  { id: 'black', name: 'Mat Siyah', hex: '#1C1C1E' },
  { id: 'anthracite', name: 'Asil Antrasit', hex: '#343A40' },
  { id: 'oak', name: 'Doğal Meşe', hex: '#C29B38' },
  { id: 'walnut', name: 'Sıcak Ceviz', hex: '#5C3A21' },
  { id: 'cream', name: 'Sıcak Krem', hex: '#F5F2EB' },
  { id: 'sage', name: 'Adaçayı Yeşili', hex: '#707F71' },
  { id: 'cashmere', name: 'Kaşmir Gri', hex: '#A8A29E' }
];

export const DEFAULT_LED_COLORS: Studio3DLedColor[] = [
  { name: 'Gün Işığı', hex: '#FFD580' },
  { name: 'Sıcak Beyaz', hex: '#FFF1D6' },
  { name: 'Doğal Beyaz', hex: '#FDFBF7' },
  { name: 'Soğuk Beyaz', hex: '#E6F2FF' },
  { name: 'Beyaz', hex: '#FFFFFF' },
  { name: 'Sarı', hex: '#FFEB3B' },
  { name: 'Amber', hex: '#FFBF00' },
  { name: 'Mavi', hex: '#2196F3' },
  { name: 'Yeşil', hex: '#4CAF50' },
  { name: 'Kırmızı', hex: '#F44336' },
  { name: 'Mor', hex: '#9C27B0' },
  { name: 'RGB', hex: 'rainbow' }
];

const defaultUnitPrices: Studio3DUnitPrices = {
  govde: 8500,
  kapak: 1800,
  cekmece: 1200,
  raf: 650,
  askilik: 450,
  led: 1200,
  camKapak: 2800,
  kulp: 150,
  raySistemi: 850,
  montaj: 2500,
  iscilik: 3500
};

export const DEFAULT_3D_CATEGORIES: Studio3DCategoryConfig[] = [
  {
    id: 'wardrobe',
    name: 'Gardırop',
    meshType: 'wardrobe',
    defaultCm: { w: 240, h: 220, d: 60, t: 2 },
    basePrice: 28500,
    isActive: true,
    order: 1,
    materials: [
      { name: 'Suntalam (E1 Ekonomik)', mult: 0.85 },
      { name: 'MDF (Monoblok Çizilmez)', mult: 1.0 },
      { name: 'MDF Lam (Senkron Dokulu)', mult: 1.1 },
      { name: 'Lake (İpek Mat Sayerlack)', mult: 1.35 },
      { name: 'Akrilik (High Gloss Parlak)', mult: 1.25 },
      { name: 'Masif Ahşap (Doğal Meşe)', mult: 1.5 }
    ],
    hardware: [
      { type: 'door', name: 'Menteşeli Kapak' },
      { type: 'sliding-door', name: 'Sürgülü Kapak' },
      { type: 'glass-door', name: 'Cam Vitrin Kapak' },
      { type: 'mirror-door', name: 'Aynalı Kapak' },
      { type: 'shelf', name: 'Sabit Raf' },
      { type: 'drawer-soft', name: 'Frenli Çekmece' },
      { type: 'hanger-long', name: 'Uzun Elbise Askılığı' },
      { type: 'hanger-double', name: 'Çift Katlı Askılık' },
      { type: 'trouser-rack', name: 'Pantolon Askılığı' },
      { type: 'jewelry-tray', name: 'Kadife Takılık' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 9500, kapak: 2100 }
  },
  {
    id: 'kitchen',
    name: 'Mutfak Dolabı',
    meshType: 'kitchen',
    defaultCm: { w: 320, h: 240, d: 60, t: 2 },
    basePrice: 38000,
    isActive: true,
    order: 2,
    materials: [
      { name: 'MDF Lam (Suya Dayanıklı)', mult: 1.0 },
      { name: 'Akrilik High Gloss', mult: 1.2 },
      { name: 'Lake (Fırınlanmış Saten)', mult: 1.35 },
      { name: 'Masif Meşe Kaplama', mult: 1.45 }
    ],
    hardware: [
      { type: 'top-cabinet', name: 'Üst Dolap Modülü' },
      { type: 'bottom-cabinet', name: 'Alt Dolap Modülü' },
      { type: 'pantry-tall', name: 'Kiler Boy Modülü' },
      { type: 'corner-unit', name: 'Köşe Dönüş Modülü' },
      { type: 'sink-cut', name: 'Ankastre Evye Boşluğu' },
      { type: 'countertop-slab', name: 'Lüks Tezgâh Yüzeyi' },
      { type: 'oven-space', name: 'Ankastre Fırın Boşluğu' },
      { type: 'drawer-soft', name: 'Frenli Çekmece' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 12500, kapak: 2500, montaj: 3500 }
  },
  {
    id: 'coffee-corner',
    name: 'Kahve Köşesi',
    meshType: 'coffee-corner',
    defaultCm: { w: 160, h: 210, d: 50, t: 2 },
    basePrice: 19500,
    isActive: true,
    order: 3,
    materials: [
      { name: 'MDF Lam (Çizilmez Mat)', mult: 1.0 },
      { name: 'Lake (İpek Mat Saten)', mult: 1.3 },
      { name: 'Masif Meşe & Ahşap Kaplama', mult: 1.45 }
    ],
    hardware: [
      { type: 'bottom-cabinet', name: 'Alt Dolap' },
      { type: 'top-shelf', name: 'Üst Raf' },
      { type: 'open-shelf', name: 'Açık Raf Sistemi' },
      { type: 'glass-door', name: 'Cam Kapak' },
      { type: 'coffee-nook', name: 'Kahve Makinesi Bölümü' },
      { type: 'cup-rack', name: 'Fincan Rafı' },
      { type: 'drawer-soft', name: 'Çekmece' },
      { type: 'countertop-slab', name: 'Tezgâh Seçimi' },
      { type: 'backpanel', name: 'Arka Panel' },
      { type: 'decor-shelf', name: 'Dekor Rafları' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 7500, kapak: 1600 }
  },
  {
    id: 'vestiyer',
    name: 'Vestiyer',
    meshType: 'vestiyer',
    defaultCm: { w: 180, h: 220, d: 45, t: 2 },
    basePrice: 21000,
    isActive: true,
    order: 4,
    materials: [
      { name: 'MDF Lam (Mat)', mult: 1.0 },
      { name: 'Lake Cila', mult: 1.3 }
    ],
    hardware: [
      { type: 'hanger-short', name: 'Ceket Askılığı' },
      { type: 'mirror-door', name: 'Boy Aynası' },
      { type: 'bench', name: 'Oturma Pufu Bölümü' },
      { type: 'shoe-shelf', name: 'Ayakkabılık Rafı' },
      { type: 'top-cabinet', name: 'Üst Depolama Dolabı' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 8000 }
  },
  {
    id: 'tv-unit',
    name: 'TV Ünitesi',
    meshType: 'tv-unit',
    defaultCm: { w: 220, h: 180, d: 40, t: 2 },
    basePrice: 16500,
    isActive: true,
    order: 5,
    materials: [
      { name: 'MDF Lam Ahşap Dokulu', mult: 1.0 },
      { name: 'İpek Mat Lake Cila', mult: 1.35 }
    ],
    hardware: [
      { type: 'tv-backpanel', name: 'Ahşap TV Arka Panel' },
      { type: 'drawer-soft', name: 'Konsol Çekmecesi' },
      { type: 'glass-shelf', name: 'Cam Vitrin Rafı' },
      { type: 'top-shelf', name: 'Üst Ünite Rafı' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 6500 }
  },
  {
    id: 'bookshelf',
    name: 'Kitaplık',
    meshType: 'bookshelf',
    defaultCm: { w: 140, h: 200, d: 35, t: 2 },
    basePrice: 11500,
    isActive: true,
    order: 6,
    materials: [
      { name: 'Suntalam Ekonomik', mult: 0.85 },
      { name: 'MDF Lam', mult: 1.0 }
    ],
    hardware: [
      { type: 'shelf', name: 'Açık Ahşap Raf' },
      { type: 'glass-door', name: 'Cam Kapaklı Bölüm' },
      { type: 'bottom-cabinet', name: 'Alt Kapaklı Dolap' },
      { type: 'drawer-soft', name: 'Frenli Çekmece' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 5500 }
  },
  {
    id: 'desk',
    name: 'Çalışma Masası',
    meshType: 'desk',
    defaultCm: { w: 140, h: 75, d: 70, t: 3 },
    basePrice: 7500,
    isActive: true,
    order: 7,
    materials: [{ name: 'MDF Lam Çizilmez', mult: 1.0 }],
    hardware: [
      { type: 'drawer-soft', name: 'Çekmece Modülü' },
      { type: 'cable-hole', name: 'Kablo Kanalı' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 4000 }
  },
  {
    id: 'bathroom',
    name: 'Banyo Dolabı',
    meshType: 'bathroom',
    defaultCm: { w: 120, h: 190, d: 50, t: 2 },
    basePrice: 14500,
    isActive: true,
    order: 8,
    materials: [{ name: 'Suya Dayanıklı MDF Lake', mult: 1.0 }],
    hardware: [
      { type: 'bath-vanity', name: 'Süspansiyonlu Dolap' },
      { type: 'mirror-led', name: 'Dokunmatik Aynalı Dolap' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 6000 }
  },
  {
    id: 'shower',
    name: 'Duşakabin',
    meshType: 'shower',
    defaultCm: { w: 110, h: 190, d: 90, t: 1 },
    basePrice: 8500,
    isActive: true,
    order: 9,
    materials: [
      { name: '6mm Temperli Cam', mult: 1.0 },
      { name: '8mm Füme Karartmalı Cam', mult: 1.25 }
    ],
    hardware: [
      { type: 'glass-clear', name: 'Şeffaf Cam' },
      { type: 'glass-fume', name: 'Füme Karartmalı Cam' },
      { type: 'profile-black', name: 'Mat Siyah Profil' },
      { type: 'profile-chrome', name: 'Parlak Krom Profil' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 4500 }
  },
  {
    id: 'sink',
    name: 'Lavabo',
    meshType: 'sink',
    defaultCm: { w: 80, h: 50, d: 45, t: 2 },
    basePrice: 4500,
    isActive: true,
    order: 10,
    materials: [{ name: 'I. Sınıf Seramik Porselen', mult: 1.0 }],
    hardware: [
      { type: 'sink-vessel', name: 'Çanak Lavabo' },
      { type: 'sink-undermount', name: 'Tezgâh Altı Lavabo' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 2500 }
  },
  {
    id: 'toilet',
    name: 'Klozet',
    meshType: 'toilet',
    defaultCm: { w: 40, h: 70, d: 65, t: 2 },
    basePrice: 4200,
    isActive: true,
    order: 11,
    materials: [{ name: 'Hijyenik Porselen', mult: 1.0 }],
    hardware: [
      { type: 'toilet-hanging', name: 'Asma Klozet Modeli' },
      { type: 'toilet-smart', name: 'Akıllı Bide Klozet' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 2200 }
  },
  {
    id: 'door',
    name: 'İç Oda Kapısı',
    meshType: 'door',
    defaultCm: { w: 90, h: 210, d: 15, t: 4 },
    basePrice: 6800,
    isActive: true,
    order: 12,
    materials: [
      { name: 'Amerikan Panel', mult: 0.9 },
      { name: 'MDF Melamin', mult: 1.0 },
      { name: 'İpek Mat Lake', mult: 1.3 },
      { name: 'Masif Doğal Ahşap', mult: 1.5 }
    ],
    hardware: [
      { type: 'door-handle', name: 'Siyah Lüks Kulp' },
      { type: 'glass-insert', name: 'Camlı Bölme' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 3500, kapak: 1800 }
  },
  {
    id: 'steel-door',
    name: 'Çelik Kapı',
    meshType: 'steel-door',
    defaultCm: { w: 100, h: 220, d: 25, t: 9 },
    basePrice: 18500,
    isActive: true,
    order: 13,
    materials: [{ name: 'Zırhlı Çelik & Ahşap Kaplama', mult: 1.0 }],
    hardware: [
      { type: 'lock-system', name: 'Kale Kilit Sistem' },
      { type: 'peephole', name: 'Kameralı Dürbün' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 9500 }
  },
  {
    id: 'pantry',
    name: 'Kiler Dolabı',
    meshType: 'pantry',
    defaultCm: { w: 120, h: 210, d: 50, t: 2 },
    basePrice: 12500,
    isActive: true,
    order: 14,
    materials: [{ name: 'MDF Lam', mult: 1.0 }],
    hardware: [
      { type: 'basket-rack', name: 'Metal Sepetli Kiler' },
      { type: 'shelf', name: 'Açık Sepet Rafı' }
    ],
    unitPrices: { ...defaultUnitPrices, govde: 5500 }
  },
  {
    id: 'shoe-rack',
    name: 'Ayakkabılık',
    meshType: 'shoe-rack',
    defaultCm: { w: 100, h: 110, d: 35, t: 2 },
    basePrice: 5800,
    isActive: true,
    order: 15,
    materials: [{ name: 'MDF Lam', mult: 1.0 }],
    hardware: [{ type: 'drop-down-door', name: 'Düşer Kapaklı Sepet' }],
    unitPrices: { ...defaultUnitPrices, govde: 3000 }
  },
  {
    id: 'bath-mirror',
    name: 'Banyo Aynası',
    meshType: 'bath-mirror',
    defaultCm: { w: 90, h: 70, d: 10, t: 2 },
    basePrice: 4200,
    isActive: true,
    order: 16,
    materials: [{ name: 'Flotal Ayna & LED', mult: 1.0 }],
    hardware: [{ type: 'touch-led', name: 'Dokunmatik Aç/Kapa' }],
    unitPrices: { ...defaultUnitPrices, govde: 2000 }
  },
  {
    id: 'tile',
    name: 'Fayans',
    meshType: 'flooring',
    defaultCm: { w: 300, h: 260, d: 1, t: 1 },
    basePrice: 8500,
    isActive: true,
    order: 17,
    materials: [{ name: 'Rektifiyeli Seramik', mult: 1.0 }],
    hardware: [],
    unitPrices: { ...defaultUnitPrices, govde: 4000 }
  },
  {
    id: 'seramik',
    name: 'Seramik',
    meshType: 'flooring',
    defaultCm: { w: 300, h: 260, d: 1, t: 1 },
    basePrice: 9500,
    isActive: true,
    order: 18,
    materials: [{ name: 'Porselen Seramik', mult: 1.0 }],
    hardware: [],
    unitPrices: { ...defaultUnitPrices, govde: 4500 }
  },
  {
    id: 'parke',
    name: 'Parke',
    meshType: 'flooring',
    defaultCm: { w: 400, h: 300, d: 1, t: 1 },
    basePrice: 11000,
    isActive: true,
    order: 19,
    materials: [{ name: 'Derzli Lamine Parke', mult: 1.0 }],
    hardware: [],
    unitPrices: { ...defaultUnitPrices, govde: 5000 }
  },
  {
    id: 'mermer-counter',
    name: 'Mermer Tezgâh',
    meshType: 'countertop',
    defaultCm: { w: 320, h: 60, d: 4, t: 4 },
    basePrice: 15500,
    isActive: true,
    order: 20,
    materials: [{ name: 'Doğal Muğla Mermer', mult: 1.0 }],
    hardware: [],
    unitPrices: { ...defaultUnitPrices, govde: 7000 }
  },
  {
    id: 'granit-counter',
    name: 'Granit Tezgâh',
    meshType: 'countertop',
    defaultCm: { w: 320, h: 60, d: 4, t: 4 },
    basePrice: 17500,
    isActive: true,
    order: 21,
    materials: [{ name: 'Siyah Granit Slab', mult: 1.0 }],
    hardware: [],
    unitPrices: { ...defaultUnitPrices, govde: 8000 }
  },
  {
    id: 'kuvars-counter',
    name: 'Kuvars Tezgâh',
    meshType: 'countertop',
    defaultCm: { w: 320, h: 60, d: 4, t: 4 },
    basePrice: 19500,
    isActive: true,
    order: 22,
    materials: [{ name: 'Coante Kuvars Kompoze', mult: 1.0 }],
    hardware: [],
    unitPrices: { ...defaultUnitPrices, govde: 9000 }
  }
];

export function getStored3DConfig(): Studio3DConfig {
  try {
    const raw = localStorage.getItem('catkapi_3d_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.categories)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse catkapi_3d_config', err);
  }
  return {
    categories: DEFAULT_3D_CATEGORIES,
    colors: DEFAULT_3D_COLORS,
    ledColors: DEFAULT_LED_COLORS
  };
}

export function save3DConfig(config: Studio3DConfig) {
  try {
    localStorage.setItem('catkapi_3d_config', JSON.stringify(config));
    window.dispatchEvent(new Event('catkapi_3d_config_updated'));
  } catch (err) {
    console.error('Failed to save catkapi_3d_config', err);
  }
}
