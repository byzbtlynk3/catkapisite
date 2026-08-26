import { 
  Product, 
  GalleryItem, 
  VideoItem, 
  CatalogItem, 
  PricingConfig, 
  Custom3DSettings, 
  SiteSettings 
} from './types';
import { OFFICIAL_MAIN_CATEGORIES_NAMES } from './lib/categoryData';

export const OFFICIAL_CATEGORIES: string[] = OFFICIAL_MAIN_CATEGORIES_NAMES;

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-yatak-1',
    name: 'Milano Lüks Yatak Odası Takımı',
    category: 'Yatak Odası',
    subCategory: 'Yatak Odası Takımı',
    description: 'Sürgülü füme camlı gardırop, kapitone başlık bazalı karyola, aynalı şifonyer ve 2 komodin içeren komple set.',
    extendedDescription: 'Mersin imalat atölyemizde fırınlanmış Sayerlack ipek mat lake ile hazırlanan Milano Takımı; 6 kapak genişliğindeki füme cam gardırop, sensörlü LED giysi askılığı, kadife takılık çekmeceleri ve çift komodin ünitelerinden oluşur.',
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 68500,
    isCustomProduction: true,
    isCampaign: true,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['Sayerlack İpek Mat Lake', 'Temperli Füme Cam', 'Çelik Baza Şasisi'],
    keyFeatures: ['Sensörlü LED Aydınlatmalı Askılıklar', 'Blum Frenli Ray ve Menteşe', 'Kadife Çekmece İçi İçi Bölmeler'],
    specs: {
      'Gardırop Ölçüsü': '260x220x62 cm',
      'Karyola Ölçüsü': '160x200 cm Standart Yatak Uyumlu',
      'Şifonyer': '4 Çekmeceli Aynalı Konsol'
    }
  },
  {
    id: 'prod-genc-1',
    name: 'Loft Genç Odası Takımı',
    category: 'Genç Odası',
    subCategory: 'Genç Odası Takımı',
    description: 'Çalışma masalı, kitaplıklı, 3 kapaklı gardıroplu ve komodinli ergonomik genç odası seti.',
    extendedDescription: 'Dinamik çizgileri, çizilmez MDF Lam yüzeyi ve entegre kitaplıklı çalışma masası ile gençlerin tüm ihtiyaçlarını bir arada karşılar.',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 34500,
    isCustomProduction: true,
    isCampaign: false,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['MDF Lam', 'Frenli Menteşe'],
    keyFeatures: ['Ergonomik Masa Alanı', 'Kablolu Düzenleyici Yuvalar'],
    specs: {
      'Gardırop': '135x200x55 cm 3 Kapaklı',
      'Masa': '120x60 cm Entegre Kitaplıklı'
    }
  },
  {
    id: 'prod-cocuk-1',
    name: 'Montessori Masal Çocuk Odası',
    category: 'Çocuk Odası',
    subCategory: 'Montessori Yatak',
    description: 'Doğal masif çam ağacından üretilmiş yere yakın emniyetli Montessori çocuk odası karyolası.',
    extendedDescription: 'Çocukların özgürce hareket etmelerine olanak tanıyan, %100 doğal fırınlanmış çam ağacından imal edilen çocuk dostu Montessori yatak.',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 18900,
    isCustomProduction: true,
    isCampaign: true,
    isNew: true,
    stockStatus: 'Stokta Var',
    materials: ['Masif Çam Ağacı', 'Su Bazlı Ekolojik Cila'],
    keyFeatures: ['Kıymıksız Pürüzsüz Kenarlar', 'Koruma Korkuluğu'],
    specs: {
      'Yatak Ölçüsü': '90x190 cm Uyumlu'
    }
  },
  {
    id: 'prod-salon-1',
    name: 'Verona Arka Panelli Lüks TV Ünitesi',
    category: 'Salon',
    subCategory: 'TV Ünitesi',
    description: 'Çıtalı ahşap arka panelli, LED şerit aydınlatmalı ve 3 çekmeceli konsol TV ünitesi.',
    extendedDescription: 'Salonunuzun odak noktası olacak Verona TV ünitesi, akustik ahşap cıta arka paneli ve uzaktan kumandalı LED lighting detayları içerir.',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 24500,
    isCustomProduction: true,
    isCampaign: false,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['Akustik Ahşap Çıta', 'MDF Lake Konsol'],
    keyFeatures: ['RGB / Gün Işığı LED Şerit', 'Frenli Bas-Aç Çekmeceler'],
    specs: {
      'Genişlik': '240 cm Arka Panel',
      'Konsol Derinliği': '45 cm'
    }
  },
  {
    id: 'prod-yemek-1',
    name: 'Saray Klasik Açılır Yemek Odası Takımı',
    category: 'Yemek Odası',
    subCategory: 'Yemek Odası Takımı',
    description: 'Mermer desenli açılır masası, 6 sünger sandalyesi, aynalı konsolu ve vitrini ile eksiksiz salon yemek takımı.',
    extendedDescription: 'Aileniz ve misafirleriniz için görkemli bir akşam yemeği ortamı sunar. Masası kolay mekanizmayla 8 kişilik kapasiteye ulaşır.',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 48900,
    isCustomProduction: true,
    isCampaign: true,
    isNew: false,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['Mermer Efektli Kuvars Masa', 'İpek Mat Lake Konsol'],
    keyFeatures: ['Kolay Açılır Raylı Masa', 'Leke Tutmaz Tay Tüyü Sandalyeler'],
    specs: {
      'Masa Kapalı': '180x90 cm',
      'Masa Açık': '220x90 cm'
    }
  },
  {
    id: 'prod-mutfak-1',
    name: 'Provence Shaker Ada Mutfak Dolabı',
    category: 'Mutfak',
    subCategory: 'Mutfak Dolabı',
    description: 'Shaker kapak göbekli, Blum frenli mekanizmalı, ada tezgahlı lüks lake mutfak dolabı.',
    extendedDescription: 'Klasik ile moderni harmanlayan Provence mutfağımız, paslanmaz evye nişi ve akrilik tezgahı ile fırınlanmış Sayerlack lake işçiliğidir.',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 52000,
    isCustomProduction: true,
    isCampaign: false,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['Sayerlack Lake MDF', 'Blum Frenli Ray', 'Kuvars Tezgâh'],
    keyFeatures: ['Frenli Çekmece & Kiler', 'Gizli Sensörlü LED', 'Ada Tezgâh Alanı'],
    specs: {
      'Üst Dolap': '320 cm Yükseklik 80 cm',
      'Alt Dolap': '320 cm Derinlik 60 cm'
    }
  },
  {
    id: 'prod-mutfak-kahve',
    name: 'Boutique LED Kahve Köşesi Ünitesi',
    category: 'Mutfak',
    subCategory: 'Kahve Köşesi',
    description: 'Fincan askılık raflı, kahve makinesi niche alanlı, alt dolaplı ve LED aydınlatmalı kahve köşesi.',
    extendedDescription: 'Evinizdeki profesyonel barista köşesi. Alt dolapları kapsül ve kahve saklama çekmeceleriyle donatılmıştır.',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 19500,
    isCustomProduction: true,
    isCampaign: true,
    isNew: true,
    stockStatus: 'Stokta Var',
    materials: ['Doğal Meşe MDF', 'Siyah Pirinç Askılar'],
    keyFeatures: ['Sıcak Gün Işığı LED', '5 Adet Krom Fincan Kancası'],
    specs: {
      'Genişlik': '160 cm',
      'Yükseklik': '210 cm'
    }
  },
  {
    id: 'prod-banyo-1',
    name: 'Saten Lake Asma Banyo Dolabı & Çanak Lavabo',
    category: 'Banyo',
    subCategory: 'Banyo Dolabı',
    description: 'Suya ve buhara dayanıklı akrilik lake asma dolap, porselen çanak lavabo ve LED dokunmatik ayna.',
    extendedDescription: 'Nemli banyo ortamlarına %100 dayanıklı marin MDF gövdesi ve dokunmatik LED aynasıyla modern banyo stili.',
    images: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 16800,
    isCustomProduction: true,
    isCampaign: true,
    isNew: false,
    stockStatus: 'Stokta Var',
    materials: ['Suya Dayanıklı Marin MDF', 'Porselen Lavabo'],
    keyFeatures: ['Dokunmatik LED Sensör', 'Frenli Alt Çekmece'],
    specs: {
      'Dolap Genişliği': '100 cm',
      'Ayna Çapı': '80 cm Yuvarlak'
    }
  },
  {
    id: 'prod-antre-1',
    name: 'Portal Lüks Vestiyer & Oturma Puflu Portmanto',
    category: 'Antre ve Hol',
    subCategory: 'Vestiyer',
    description: 'Deri kapitone oturma puflu, boy aynalı, ayakkabılıklı ve dresuar bölmeli giriş vestiyeri.',
    extendedDescription: 'Evinize girerken konfor sağlayan kapitone oturma alanı ve ayakkabılık çekmeceleriyle fonksiyonel hol ünitesi.',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 22800,
    isCustomProduction: true,
    isCampaign: false,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['İpek Mat Lake', 'Flotal Bronz Ayna'],
    keyFeatures: ['Deri Döşemeli Oturma Pufu', 'Gizli Ayakkabı Rafları'],
    specs: {
      'Genişlik': '200 cm',
      'Yükseklik': '230 cm Tavana Kadar'
    }
  },
  {
    id: 'prod-kapi-1',
    name: 'Grand Avangarde Lake İç Oda Kapısı',
    category: 'Kapılar',
    subCategory: 'İç Oda Kapısı',
    description: 'CNC oymalı, 8 mm dökme panel gövdeli, ipek mat fırın lake boyalı, çift pervazlı oda kapısı.',
    extendedDescription: 'Mersin Akdeniz atölyemizde el işçiliğiyle rötüşlanan Grand Avangarde serisi, masif ahşap karkas ve manyetik kilit ile üretilir.',
    images: [
      'https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=1200',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 6800,
    isCustomProduction: true,
    isCampaign: true,
    isNew: false,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['İpek Mat Lake', 'Masif Karkas', 'MDF'],
    keyFeatures: ['Yüksek Ses Yalıtımı', 'Sararmayan Lake', 'Sessiz Manyetik Kilit'],
    specs: {
      'Kanat Ölçüsü': '80x200 cm (Özel Ölçü)',
      'Pervaz': 'L Ayarlanabilir Pervaz'
    }
  },
  {
    id: 'prod-kapi-2',
    name: 'Armor Zırhlı Monoblok Çelik Kapı',
    category: 'Kapılar',
    subCategory: 'Çelik Kapı',
    description: '2 mm yekpare çelik şasili, Kale 6 mermi kilitli, taşyünü yalıtımlı güvenlik kapısı.',
    extendedDescription: 'Nuri Yanık imzalı zırhlı çelik kapı. Taşyünü dolgusu sayesinde dış gürültüyü ve ısı kaybını engeller.',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 18500,
    isCustomProduction: true,
    isCampaign: false,
    isNew: false,
    stockStatus: 'Stokta Var',
    materials: ['2.0 mm Galvaniz Çelik', 'Taşyünü', 'Marine Ahşap'],
    keyFeatures: ['Kale Monoblok Kilit', 'Geniş Kameralı Dürbün'],
    specs: {
      'Çelik Gövde': '2 mm Yekpare Sac'
    }
  },
  {
    id: 'prod-yapi-1',
    name: '32. Sınıf Derzli Meşe Laminat Parke',
    category: 'Yapı Malzemeleri',
    subCategory: 'Parke',
    description: 'Suya ve çizilmeye dayanıklı 32. sınıf derzli kilitli ahşap laminat parke.',
    extendedDescription: 'Yoğun trafikli konut ve ofis alanları için ideal 8 mm derzli parke döşemesi.',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 420,
    isCustomProduction: false,
    isCampaign: true,
    isNew: false,
    stockStatus: 'Stokta Var',
    materials: ['HDF Yüksek Yoğunluklu Levha'],
    keyFeatures: ['Derzli Kilit Sistemi', 'Çizilmez AC4 Yüzey'],
    specs: {
      'Kalınlık': '8 mm',
      'Sınıf': '32. Sınıf AC4'
    }
  },
  {
    id: 'prod-ofis-1',
    name: 'Executive Lüks Müdür Çalışma Masası',
    category: 'Ofis Mobilyaları',
    subCategory: 'Müdür Masası',
    description: 'Deri sümen kaplamalı, entegre kilitli kesonlu ve kablo kanallı makam masası.',
    extendedDescription: 'Yönetici ofisleri için üretilmiş ahşap kaplamalı, priz kutusu ve yan etajer entegreli makam masası.',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 28500,
    isCustomProduction: true,
    isCampaign: false,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['Doğal Ceviz Kaplama', 'Deri Sümen'],
    keyFeatures: ['Gömme Priz Kutusu', 'Kilitli Merkezi Keson'],
    specs: {
      'Masa Boyutu': '220x95 cm'
    }
  },
  {
    id: 'prod-ozel-1',
    name: 'Mimar Keşifli Özel Ölçü Gömme Mutfak & Gardırop Projesi',
    category: 'Özel Üretim',
    subCategory: 'Özel Ölçü Mutfak',
    description: 'Evinizin mimari yapısına göre sıfırdan projelendirilen ve imal edilen özel ahşap projeleri.',
    extendedDescription: 'Mersin genelinde ücretsiz yerinde lazer ölçümü yapıyoruz. 3D tasarım aşamasından sonra imalatını gerçekleştiriyoruz.',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 0,
    priceDisplayMode: 'get_quote',
    isCustomProduction: true,
    isCampaign: true,
    isNew: true,
    stockStatus: 'Özel Üretim',
    materials: ['Lake', 'Akrilik', 'Masif Ahşap'],
    keyFeatures: ['Ücretsiz Lazer Keşif', 'Birebir 3D Tasarım Onayı', 'Milimetrik Üretim'],
    specs: {
      'Hizmet Bölgesi': 'Mersin & Tüm İlçeleri'
    }
  },
  {
    id: 'prod-dugun-1',
    name: 'Lüks Saray Düğün Paketi (Komple Ev Seti)',
    category: 'Düğün Paketleri',
    subCategory: 'Lüks Düğün Paketi',
    description: 'Füme camlı LED gardıroplu Yatak Odası, Açılır Yemek Odası, TV Ünitesi, Konsol ve Şifonyer içeren eksiksiz ev paketi.',
    extendedDescription: 'Yeni evlenecek çiftler için hazırlanan bu özel pakette;\n1. Yatak Odası Takımı (Sürgülü LED Gardırop, Bazalı Karyola & Başlık, Aynalı Şifonyer, 2 Komodin)\n2. Yemek Odası Takımı (Mermer Desen Masa, 6 Kumaş Sandalye, Konsol & Ayna)\n3. TV Ünitesi & Arka Panel Seti\n4. Özel Hedef Hediye Aksesuarları dahildir.',
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200'
    ],
    coverImageIndex: 0,
    startingPrice: 128000,
    isCustomProduction: true,
    isCampaign: true,
    isNew: true,
    stockStatus: 'Sipariş Üzerine Üretiliyor',
    materials: ['Fırın Lake', 'Temperli Cam', 'Blum Frenli Ray', 'Çelik Baza'],
    keyFeatures: [
      'Komple Ev Mobilyası Tek Pakette',
      'Ayrı Ayrı Ürün Detay İnceleme & 3D Tasarım İmkânı',
      'Sensörlü LED Aydınlatma Sistemleri',
      'Ücretsiz Nakliye ve Yerinde Kurulum'
    ],
    specs: {
      'Paket İçeriği': 'Yatak Odası + Yemek Odası + TV Ünitesi + Konsol + Şifonyer + 2 Komodin',
      'Garanti': '2 Yıl Resmi Garanti & Nuri Usta İmalat Güvencesi'
    }
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    category: 'İç Oda Kapıları',
    imageUrl: 'https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=1200',
    title: 'Mersin Villa Beyaz Fırın Lake Kapı Uygulamamız',
    description: 'Akdeniz atölyemizde imal edilip montajı yapılan CNC işlemeli özel lake kapı.'
  },
  {
    id: 'gal-2',
    category: 'Mutfak Dolapları',
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200',
    title: 'Lüks Ada Mutfak & Kuvars Tezgah Projemiz',
    description: 'Frenli Blum mekanizmalı shaker kapak ada mutfak montajı.'
  },
  {
    id: 'gal-3',
    category: 'Gardıroplar',
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
    title: 'Füme Camlı LED Aydınlatmalı Giyinme Odası',
    description: 'Pirinç kulp detaylı ve entegre sensörlü giyinme dolabı.'
  },
  {
    id: 'gal-4',
    category: 'Banyo Dolapları',
    imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200',
    title: 'Saten Lake Asma Banyo Konsolu',
    description: 'Suya ve buhara dayanıklı akrilik fırın lake banyo dolabı.'
  }
];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'Nuri Usta İle Atölyede Fırın Lake Kapı İmalatı',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder or demo video embed
    category: 'Atölye ve İmalat',
    description: 'Mersin Akdeniz zanaat tezgahlarımızda ahşabın fırınlanması ve CNC hassas oyması.'
  },
  {
    id: 'vid-2',
    title: 'Mutfak Dolabı Yerinde Hassas Montaj Süreci',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Montaj ve Keşif',
    description: 'Lazer ölçüm sonrası villada gerçekleştirdiğimiz milimetrik montaj aşamaları.'
  }
];

export const INITIAL_CATALOGS: CatalogItem[] = [
  {
    id: 'cat-pdf-1',
    title: 'Çat Kapı 2026 Kurumsal İmalat Kataloğu (PDF)',
    pdfUrl: '#',
    description: 'İç oda kapıları, çelik kapılar, mutfak ve banyo ürün grubumuzun 2026 koleksiyonu.',
    coverImage: 'https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=600'
  }
];

export const INITIAL_PRICING_CONFIG: PricingConfig = {
  baseMaterialPrice: 4500,
  laborPrice: 2000,
  dimensionMultiplier: 1.0,
  campaignDiscount: 10,
  vatRate: 20,
  showPriceToCustomer: true
};

export const INITIAL_3D_SETTINGS: Custom3DSettings = {
  colors: [
    { id: 'c-1', name: 'Kuzey İpek Mat Beyaz', hex: '#F9FAF9' },
    { id: 'c-2', name: 'Kuvars Akrilik Gri', hex: '#8E9196' },
    { id: 'c-3', name: 'Asil Antrasit Saten', hex: '#2C3032' },
    { id: 'c-4', name: 'Mersin Adaçayı Yeşili', hex: '#707F71' },
    { id: 'c-5', name: 'Huzurlu Safir Mavi', hex: '#1C2938' },
    { id: 'c-6', name: 'Doğal Haşbi Ceviz', hex: '#4B392F' }
  ],
  materials: [
    { id: 'm-1', name: 'İpek Mat Akrilik Lake MDF (Sayerlack Fırınlı)', multiplier: 1.20 },
    { id: 'm-2', name: 'Doğal Freze Meşe / Ceviz Kaplama', multiplier: 1.35 },
    { id: 'm-3', name: 'Isıl Vakum Polimer Membran', multiplier: 1.10 },
    { id: 'm-4', name: 'E1 Senkron Melamin MDF-LAM', multiplier: 1.00 }
  ],
  handles: [
    { id: 'h-1', name: 'Fırçalanmış Gold Pirinç', color: '#D4AF37' },
    { id: 'h-2', name: 'Modern Mat Siyah Toz Boya', color: '#1A1A1A' },
    { id: 'h-3', name: 'Paslanmaz Satine Krom', color: '#B3B3B3' },
    { id: 'h-4', name: 'Kulp Deliksiz / Bas-Aç / Gola Profil', color: 'transparent' }
  ],
  glasses: [
    { id: 'g-1', name: 'Dolu Panel (Ahşap)' },
    { id: 'g-2', name: 'Kumlamalı Yarı Saydam Mat Cam' },
    { id: 'g-3', name: 'Reflekte Lüks Bronz Cam' }
  ],
  accessories: [
    { id: 'acc-1', name: 'Gizli Sensörlü LED Spot Şerit', extraPrice: 1500 },
    { id: 'acc-2', name: 'Blum Frenli Sessiz Ray Takımı', extraPrice: 2200 },
    { id: 'acc-3', name: 'Kadife Çekmece İçi İçi Bölme', extraPrice: 850 }
  ]
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  contactTitle: 'İLETİŞİM BİLGİLERİMİZ',
  companyName: 'Çat Kapı Ahşap & Lüks Mimari Çözümleri',
  ownerName: 'Nuri Yanık',
  phone: '0535 219 47 89',
  whatsapp: '0535 219 47 89',
  email: 'info@catkapi.com',
  instagram: '@catyapii',
  address: 'Mersin, Akdeniz İlçesi, Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A',
  googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12798.117011406567!2d34.629334584218635!3d36.80525164472856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1527f3af0c000001%3A0xc341cbd7ff74301!2sAkdeniz%2C%20Mersin!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str',
  workingHours: 'Pazartesi - Cumartesi: 08:00 - 19:00 | Pazar: Kapalı',
  logoUrl: '',
  heroSlides: [
    {
      id: 'hs-1',
      title: 'Kapıdan Mobilyaya, Eviniz İçin Özel Üretim Çözümler',
      subtitle: 'Milimetrik Zanaat & Lüks İmalat',
      description: 'Biz sadece mobilya üretmiyoruz; yaşam alanlarınıza değer katıyor, hayal ettiğiniz konforu milimetrik işçilikle sanata dönüştürüyoruz.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      tag: 'Özel Üretim Atölyesi',
      buttonText: 'Özel Üretim Talebi',
      buttonLink: 'custom-production',
      isHidden: false
    },
    {
      id: 'hs-2',
      title: 'Hayalinizdeki Tasarımı Üretiyoruz',
      subtitle: 'Mersin Akdeniz Tezgahlarından',
      description: 'Lake kapılar, modern mutfaklar, lüks giyinme odaları... Mersin\'deki imalat tezgahlarımızda tamamen kişiye özel ve ölçüye göre üretiyoruz.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200',
      tag: 'Size Özel Tasarım',
      buttonText: 'Tüm Ürünleri İncele',
      buttonLink: 'products',
      isHidden: false
    },
    {
      id: 'hs-3',
      title: 'Kaliteli Yaşam Alanları İçin Doğru Adres',
      subtitle: 'Nuri Yanık Güvencesiyle',
      description: 'Nitelikli hammadde kullanımı ve kurucumuz Nuri Yanık liderliğinde, Mersin Akdeniz\'deki atölyemizden evlerinize kusursuz montaj yapıyoruz.',
      image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200',
      tag: 'Çat Kapı Sanat İmalatı',
      buttonText: 'İletişime Geç',
      buttonLink: 'contact',
      isHidden: false
    }
  ],
  promoSection: {
    title: 'Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri',
    subtitle: 'MERSİN\'İN LOKAL DEĞERİ',
    description: 'ÇAT KAPI, Mersin Akdeniz\'deki modern imalat tesisinde, Nuri Yanık liderliğinde, sıradan fabrikasyon yapı market algısını yıkmak; evine hak ettiği sıcaklığı ve lüksü kazandırmak isteyen seçkin müşterilerimiz için butik üretim yapmaktadır.',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800',
    buttonText: 'Nuri Usta İle İletişime Geç',
    buttonLink: 'contact',
    ownerName: 'Nuri Yanık',
    ownerTitle: 'Kurucu & Baş Zanaatkar'
  },
  socialLinks: [
    { id: 'soc-1', platform: 'instagram', name: 'Instagram', url: 'https://instagram.com/catyapii' },
    { id: 'soc-2', platform: 'whatsapp', name: 'WhatsApp', url: 'https://wa.me/905352194789' },
    { id: 'soc-3', platform: 'facebook', name: 'Facebook', url: 'https://facebook.com' },
    { id: 'soc-4', platform: 'youtube', name: 'YouTube', url: 'https://youtube.com' }
  ],
  seoTitle: 'Çat Kapı | Mersin Özel Ahşap İmalatı, Kapı ve Mutfak Showroomu',
  seoDescription: 'Mersin Akdeniz özel üretim iç oda kapısı, çelik kapı, mutfak dolabı ve gardırop imalat atölyesi. Nuri Yanık güvencesiyle.',
  seoKeywords: 'Mersin kapı, lake kapı, mutfak dolabı, Akdeniz mobilya, özel üretim gardırop, Nuri Yanık, Çat Kapı',
  aiPromptInstruction: 'Sen Mersin Çat Kapı atölyesinin uzman ahşap mimarı ve müşteri danışmanısın. Nuri Yanık kurucumuzun imalat kalitesini ve malzeme avantajlarını samimi, profesyonel bir dille anlat.'
};

