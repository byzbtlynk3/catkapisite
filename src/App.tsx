import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Showroom from './components/Showroom';
import Corporate from './components/Corporate';
import CustomProduction from './components/CustomProduction';
import Gallery from './components/Gallery';
import AdminCmsModal from './components/AdminCmsModal';
import ProductDetailModal from './components/ProductDetailModal';

import { Product, GalleryItem, VideoItem, CatalogItem, SiteSettings } from './types';
import { 
  INITIAL_PRODUCTS, 
  OFFICIAL_CATEGORIES, 
  INITIAL_GALLERY, 
  INITIAL_VIDEOS, 
  INITIAL_CATALOGS,
  INITIAL_SITE_SETTINGS 
} from './data';

import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Instagram, 
  Clock, 
  ExternalLink,
  Mail,
  ImagePlus,
  Users,
  User,
  Sparkles
} from 'lucide-react';

const STORAGE_PRODUCTS_KEY = 'catkapi_products_cms_v2';
const STORAGE_CATEGORIES_KEY = 'catkapi_categories_cms_v2';
const STORAGE_GALLERY_KEY = 'catkapi_gallery_cms_v2';
const STORAGE_VIDEOS_KEY = 'catkapi_videos_cms_v2';
const STORAGE_CATALOGS_KEY = 'catkapi_catalogs_cms_v2';
const STORAGE_SETTINGS_KEY = 'catkapi_settings_cms_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse localStorage products', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Try to load from server (public proxy) on mount
  useEffect(() => {
    const tryLoadRemote = async () => {
      try {
        const res = await fetch('/api/public/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data as Product[]);
            try { localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(data)); } catch {}
          }
        }

        const res2 = await fetch('/api/public/categories');
        if (res2.ok) {
          const cats = await res2.json();
          if (Array.isArray(cats) && cats.length > 0) {
            const names = cats.map((c:any) => c.name || c);
            setCategories(names);
            try { localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(names)); } catch {}
          }
        }
      } catch (e) {
        // ignore: remote not configured or network issue
        console.warn('Remote load failed', e);
      }
    };

    tryLoadRemote();
  }, []);

  // Categories State
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return OFFICIAL_CATEGORIES;
  });

  // Gallery Items State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GALLERY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_GALLERY;
  });

  // Videos State
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIDEOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_VIDEOS;
  });

  // Catalogs State
  const [catalogs, setCatalogs] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATALOGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CATALOGS;
  });

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SITE_SETTINGS;
  });

  // Admin CMS Modal state
  const [isAdminCmsOpen, setIsAdminCmsOpen] = useState<boolean>(false);

  // Selected Product Detail Lightbox Modal
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);

  // Save Handlers
  const handleSaveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } catch (e) {
      console.error(e);
    }
    // Try to sync to server (admin endpoint) if admin token present
    (async () => {
      try {
        const token = sessionStorage.getItem('catkapi_admin_token');
        if (!token) return;
        const res = await fetch('/api/admin/syncProducts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ products: updatedProducts })
        });
        if (!res.ok) {
          console.warn('Sync products failed', await res.text());
        }
      } catch (e) {
        console.warn('Sync products error', e);
      }
    })();
  };

  const handleSaveCategories = (updatedCategories: string[]) => {
    setCategories(updatedCategories);
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(updatedCategories));
    } catch (e) {
      console.error(e);
    }
    // Try to sync categories to server
    (async () => {
      try {
        const token = sessionStorage.getItem('catkapi_admin_token');
        if (!token) return;
        const res = await fetch('/api/admin/syncCategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ categories: updatedCategories })
        });
        if (!res.ok) console.warn('Sync categories failed', await res.text());
      } catch (e) {
        console.warn('Sync categories error', e);
      }
    })();
  };

  const handleSaveGallery = (updatedGallery: GalleryItem[]) => {
    setGalleryItems(updatedGallery);
    try {
      localStorage.setItem(STORAGE_GALLERY_KEY, JSON.stringify(updatedGallery));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveVideos = (updatedVideos: VideoItem[]) => {
    setVideos(updatedVideos);
    try {
      localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(updatedVideos));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCatalogs = (updatedCatalogs: CatalogItem[]) => {
    setCatalogs(updatedCatalogs);
    try {
      localStorage.setItem(STORAGE_CATALOGS_KEY, JSON.stringify(updatedCatalogs));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSiteSettings = (updatedSettings: SiteSettings) => {
    setSiteSettings(updatedSettings);
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Tüm ürünleri, kategorileri, galeri ve sayfa içeriklerini fabrika ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      setProducts(INITIAL_PRODUCTS);
      setCategories(OFFICIAL_CATEGORIES);
      setGalleryItems(INITIAL_GALLERY);
      setVideos(INITIAL_VIDEOS);
      setCatalogs(INITIAL_CATALOGS);
      setSiteSettings(INITIAL_SITE_SETTINGS);
      try {
        localStorage.removeItem(STORAGE_PRODUCTS_KEY);
        localStorage.removeItem(STORAGE_CATEGORIES_KEY);
        localStorage.removeItem(STORAGE_GALLERY_KEY);
        localStorage.removeItem(STORAGE_VIDEOS_KEY);
        localStorage.removeItem(STORAGE_CATALOGS_KEY);
        localStorage.removeItem(STORAGE_SETTINGS_KEY);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onDiscoverShowroom = () => {
    setCurrentTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onOpenCustomProduction = () => {
    setCurrentTab('custom-production');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="cat-kapi-root" className="min-h-screen bg-[#111111] text-white flex flex-col font-sans select-none selection:bg-amber-500/20 selection:text-amber-400 relative">
      
      {/* Dynamic Header with CMS Trigger */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onOpenAdminCms={() => setIsAdminCmsOpen(true)}
        siteSettings={siteSettings}
      />

      {/* Main View Area */}
      <main className="flex-1">
        
        {/* Ana Sayfa */}
        {currentTab === 'home' && (
          <div id="home-view-wrapper" className="space-y-4">
            
            {/* Hero Banner */}
            <Hero 
              siteSettings={siteSettings}
              onDiscoverShowroom={onDiscoverShowroom} 
              onOpenCustomProduction={onOpenCustomProduction}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />

            {/* Corporate section: Nuri Yanık & craft quality */}
            <Corporate 
              siteSettings={siteSettings}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />

          </div>
        )}

        {/* Ürünler Kataloğu */}
        {currentTab === 'products' && (
          <div id="products-view-wrapper">
            <Showroom 
              products={products.filter(p => !p.isHidden)}
              onOpenConfigurator={onOpenCustomProduction}
              onSelectProductDetail={(prod) => setSelectedProductDetail(prod)}
            />
          </div>
        )}

        {/* Özel Üretim */}
        {currentTab === 'custom-production' && (
          <div id="custom-production-view-wrapper">
            <CustomProduction products={products} />
          </div>
        )}

        {/* İletişim */}
        {currentTab === 'contact' && (
          <div id="contact-view-wrapper" className="py-12 bg-[#111111] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
              
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-amber-500 font-mono text-xs font-extrabold uppercase tracking-widest block">
                  İLETİŞİM BİLGİLERİMİZ
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {siteSettings.companyName || 'Çat Kapı İletişim Kartı'}
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm">
                  Ücretsiz keşif ölçümü, özel üretim talepleri ve fiyat bilgisi için bizimle doğrudan iletişime geçebilirsiniz.
                </p>
              </div>

              {/* Clean, Corporate Contact Card */}
              <div className="bg-[#161616] border border-stone-850 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Address Item */}
                  <div className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                        Adres
                      </span>
                      <strong className="text-stone-100 font-bold text-sm block leading-relaxed mt-1">
                        {siteSettings.address}
                      </strong>
                    </div>
                  </div>

                  {/* Phone Item */}
                  <div className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
                      <Phone size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                        Telefon
                      </span>
                      <a 
                        href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`} 
                        className="text-amber-400 font-black text-lg block mt-0.5 hover:underline"
                      >
                        {siteSettings.phone}
                      </a>
                    </div>
                  </div>

                  {/* Owner Item */}
                  <div className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                        Yetkili Kişi
                      </span>
                      <strong className="text-stone-100 font-bold text-base block mt-0.5">
                        {siteSettings.ownerName || 'Nuri Yanık'}
                      </strong>
                    </div>
                  </div>

                  {/* Instagram Item */}
                  <div className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-500 rounded-xl shrink-0 mt-0.5">
                      <Instagram size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                        Instagram
                      </span>
                      <a 
                        href={siteSettings.instagram.startsWith('http') ? siteSettings.instagram : `https://instagram.com/${siteSettings.instagram.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-pink-400 font-black text-base block mt-0.5 hover:underline"
                      >
                        {siteSettings.instagram}
                      </a>
                    </div>
                  </div>

                  {/* Email Item */}
                  {siteSettings.email && (
                    <div className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl shrink-0 mt-0.5">
                        <Mail size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                          E-Posta
                        </span>
                        <a 
                          href={`mailto:${siteSettings.email}`} 
                          className="text-blue-400 font-bold text-sm block mt-0.5 hover:underline"
                        >
                          {siteSettings.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Working Hours Item */}
                  {siteSettings.workingHours && (
                    <div className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
                        <Clock size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                          Çalışma Saatleri
                        </span>
                        <strong className="text-stone-200 font-bold text-xs block leading-relaxed mt-1">
                          {siteSettings.workingHours}
                        </strong>
                      </div>
                    </div>
                  )}

                </div>

                {/* Direct Actions Row */}
                <div className="pt-6 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
                    className="py-3.5 px-6 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Phone size={15} className="text-amber-500" />
                    <span>{siteSettings.ownerName || 'Nuri Bey'}'i Hemen Ara</span>
                  </a>

                  <a
                    href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Merhaba ${siteSettings.ownerName || 'Nuri Usta'}, Çat Kapı web sitenizden ulaşıyorum.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp İle İletişime Geç</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer id="app-footer" className="bg-[#111111] text-stone-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-stone-850">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 bg-amber-500 rounded-lg text-black font-black text-sm">ÇK</span>
              <h4 className="text-lg font-bold text-white tracking-widest font-sans">ÇAT KAPI</h4>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              "Kapıdan Mobilyaya, Eviniz İçin Özel Üretim Çözümler." Mersin'in önde gelen özel imalat ahşap ve dijital showroom markası.
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a href="https://instagram.com/catyapii" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-xs text-pink-400 hover:underline">
                <Instagram size={14} />
                <span>@catyapii</span>
              </a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h5 className="text-stone-200 text-xs font-black uppercase tracking-wider">Hızlı Sayfa Menüleri</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setCurrentTab('home')} className="hover:text-amber-400 text-left transition-colors font-semibold">● Ana Sayfa</button>
              <button onClick={() => setCurrentTab('products')} className="hover:text-amber-400 text-left transition-colors font-semibold">● Ürünler</button>
              <button onClick={() => setCurrentTab('design-center')} className="hover:text-amber-400 text-left transition-colors font-semibold">● Tasarım Merkezi</button>
              <button onClick={() => setCurrentTab('contact')} className="hover:text-amber-400 text-left transition-colors font-semibold">● İletişim</button>
              <a href="https://instagram.com/catyapii" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 text-left transition-colors font-semibold col-span-2">● Instagram (@catyapii)</a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h5 className="text-stone-200 text-xs font-black uppercase tracking-wider">Atölye ve İmalathane</h5>
            <div className="space-y-2.5 text-xs text-stone-400 leading-relaxed">
              <p className="flex items-start">
                <MapPin size={14} className="text-amber-500 mr-2 shrink-0 mt-0.5" />
                <span>Mersin, Akdeniz İlçesi, Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A</span>
              </p>
              <p className="flex items-center">
                <Phone size={12} className="text-amber-500 mr-2 shrink-0" />
                <span>Yetkili: Nuri Yanık (0535 219 47 89)</span>
              </p>
              <p className="flex items-center">
                <Users size={12} className="text-amber-500 mr-2 shrink-0" />
                <span>Mersin Özel Tasarım Ahşap İmalat Sertifikalı</span>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-850 text-center text-[11px] text-stone-500">
          <p>© 2026 Çat Kapı - Tüm Hakları Saklıdır.</p>
        </div>
      </footer>

      {/* FIXED FLOATING WHATSAPP BUTTON (Persistent on ALL screens) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <a
          href="https://wa.me/905352194789?text=Merhaba+Nuri+Usta%2C+web+sitenizden+ulaşıyorum.+Ürünler+ve+ölçü+keşfi+hakkında+bilgi+alabilir+miyim%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center p-4 bg-[#25d366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
          title="WhatsApp ile İletişime Geçin"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-300 border-2 border-black" />
          </span>

          <MessageCircle size={28} className="text-white fill-white" />

          {/* Hover Tooltip Badge */}
          <span className="absolute right-full mr-3 bg-stone-950/90 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl border border-stone-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl pointer-events-none">
            Nuri Usta WhatsApp İletişim
          </span>
        </a>
      </div>

      {/* ADMIN CMS MODAL */}
      <AdminCmsModal
        isOpen={isAdminCmsOpen}
        onClose={() => setIsAdminCmsOpen(false)}
        products={products}
        onSaveProducts={handleSaveProducts}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        galleryItems={galleryItems}
        onSaveGallery={handleSaveGallery}
        videos={videos}
        onSaveVideos={handleSaveVideos}
        catalogs={catalogs}
        onSaveCatalogs={handleSaveCatalogs}
        siteSettings={siteSettings}
        onSaveSiteSettings={handleSaveSiteSettings}
        onResetToDefaults={handleResetToDefaults}
      />

      {/* PRODUCT DETAIL LIGHTBOX MODAL WITH ZOOM */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
        />
      )}

    </div>
  );
}
