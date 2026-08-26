export type ProductCategoryName = string;

export interface Product {
  id: string;
  productCode?: string;
  categoryId?: string;
  subCategoryId?: string;
  name: string;
  category: ProductCategoryName;
  subCategory?: string;
  brand?: string;
  description: string;
  extendedDescription: string;
  images: string[];
  coverImageIndex?: number;
  videoUrl?: string;
  threeSixtyUrl?: string;
  startingPrice?: number;
  campaignPrice?: number;
  vatStatus?: string;
  priceDisplayMode?: 'numeric' | 'ask_price' | 'get_quote';
  isCustomProduction?: boolean;
  isCampaign?: boolean;
  isNew?: boolean;
  isHidden?: boolean;
  dimensions?: string;
  colors?: string[];
  customProductionInfo?: string;
  stockStatus?: 'Stokta Var' | 'Sipariş Üzerine Üretiliyor' | 'Özel Üretim';
  materials: string[];
  keyFeatures: string[];
  specs: { [key: string]: string };
  is_published?: boolean;
} 

export interface GalleryItem {
  id: string;
  category: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  videoUrl: string; // e.g. YouTube embed URL or Direct Video
  category: string;
  description?: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
  coverImage?: string;
}

export interface PricingConfig {
  baseMaterialPrice: number; // TL per m2 or base unit
  laborPrice: number; // TL per job
  dimensionMultiplier: number; // scaling ratio factor
  campaignDiscount: number; // Percentage %
  vatRate: number; // VAT % e.g. 20
  showPriceToCustomer: boolean; // whether to show estimated price or "Fiyat Teklifi Al"
}

export interface Custom3DColor {
  id: string;
  name: string;
  hex: string;
}

export interface Custom3DMaterial {
  id: string;
  name: string;
  multiplier: number;
}

export interface Custom3DHandle {
  id: string;
  name: string;
  color: string;
}

export interface Custom3DGlass {
  id: string;
  name: string;
}

export interface Custom3DAccessory {
  id: string;
  name: string;
  extraPrice: number;
}

export interface Custom3DSettings {
  colors: Custom3DColor[];
  materials: Custom3DMaterial[];
  handles: Custom3DHandle[];
  glasses: Custom3DGlass[];
  accessories: Custom3DAccessory[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  tag?: string;
  buttonText?: string;
  buttonLink?: string;
  isHidden?: boolean;
}

export interface PromoSection {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  ownerName?: string;
  ownerTitle?: string;
}

export type SocialPlatform = 
  | 'phone'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'email'
  | 'address'
  | 'owner'
  | 'website'
  | 'other';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  name: string;
  url: string;
}

export interface SiteSettings {
  contactTitle?: string;
  // İletişim bölümü başlığı (yönetim panelinden değiştirilebilir)
  companyName?: string;
  ownerName?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  instagram: string;
  address: string;
  googleMapUrl: string;
  workingHours?: string;
  logoUrl?: string;
  heroSlides: HeroSlide[];
  promoSection?: PromoSection;
  socialLinks?: SocialLink[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  aiPromptInstruction?: string;
}

