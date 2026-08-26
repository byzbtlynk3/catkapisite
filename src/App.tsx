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
  Sparkles,
  Facebook,
  Youtube,
  Music2,
  Globe,
  Building2,
  Link as LinkIcon
} from 'lucide-react';
import { SocialPlatform } from './types';

const STORAGE_PRODUCTS_KEY = 'catkapi_products_cms_v2';
const STORAGE_CATEGORIES_KEY = 'catkapi_categories_cms_v2';
const STORAGE_GALLERY_KEY = 'catkapi_gallery_cms_v2';
const STORAGE_VIDEOS_KEY = 'catkapi_videos_cms_v2';
const STORAGE_CATALOGS_KEY = 'catkapi_catalogs_cms_v2';
const STORAGE_SETTINGS_KEY = 'catkapi_settings_cms_v2';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  // Admin panel is only reachable via the /yonetim-giris direct URL.
  // The public site never exposes a link to it (Navbar has no admin button).
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => window.location.pathname === '/yonetim-giris');

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname === '/yonetim-giris');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const closeAdminRoute = () => {
    sessionStorage.removeItem('catkapi_admin_auth');
    sessionStorage.removeItem('catkapi_admin_token');
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo(0, 0);
  };

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
        // Load products from Supabase (source of truth)
        const res = await fetch('/api/public/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data as Product[]);
            try { localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(data)); } catch {}
          }
        }

        // Load categories from Supabase
        const res2 = await fetch('/api/public/categories');
        if (res2.ok) {
          const cats = await res2.json();
          if (Array.isArray(cats) && cats.length > 0) {
            const names = cats.map((c:any) => c.name || c);
            setCategories(names);
            try { localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(names)); } catch {}
          }
        }

        // Load site settings (contact info, social links, map) from Supabase
        const res3 = await fetch('/api/public/settings');
        if (res3.ok) {
          const settings = await res3.json();
          if (settings && typeof settings === 'object') {
            setSiteSettings(settings as SiteSettings);
            try { localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings)); } catch {}
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

  // FULL CATALOG SYNC: persists the entire category tree (with IDs + parent links),
  // products and media to the real Supabase database via /api/admin/syncCatalog.
  const handleSyncCatalog = async (categoryTree: any[], updatedProducts: Product[]) => {
    try {
      const token = sessionStorage.getItem('catkapi_admin_token');
      if (!token) {
        console.warn('Sync catalog skipped - no admin token');
        return false;
      }
      const res = await fetch('/api/admin/syncCatalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categories: categoryTree, products: updatedProducts })
      });
      const j = await res.json();
      if (!res.ok) {
        console.warn('Sync catalog failed', j.error || j);
        return false;
      }
      console.log('Catalog synced to Supabase', j);
      return true;
    } catch (e) {
      console.warn('Sync catalog error', e);
      return false;
    }
  };

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
    // Try to sync site settings to server (Supabase)
    (async () => {
      try {
        const token = sessionStorage.getItem('catkapi_admin_token');
        if (!token) return;
        const res = await fetch('/api/admin/syncSettings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ settings: updatedSettings })
        });
        if (!res.ok) console.warn('Sync settings failed', await res.text());
      } catch (e) {
        console.warn('Sync settings error', e);
      }
    })();
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

  // If the URL is /yonetim-giris, render ONLY the admin panel as a full page.
  // The public site (Navbar, footer, etc.) is never shown on this route.
  if (isAdminRoute) {
    return (
      <div id="admin-route-root" className="min-h-screen bg-[#0b0b0b] text-white font-sans">
        <AdminCmsModal
          isOpen={true}
          onClose={closeAdminRoute}
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
          onSyncCatalog={handleSyncCatalog}
        />
      </div>
    );
  }

  return (
    <div id="cat-kapi-root" className="min-h-screen bg-[#111111] text-white flex flex-col font-sans select-none selection:bg-amber-500/20 selection:text-amber-400 relative">
      
      {/* Dynamic Header (public site only - no admin links visible to customers) */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
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
                  {siteSettings.contactTitle || 'İLETİŞİM BİLGİLERİMİZ'}
                </span>
              </div>

              {/* Clean, Corporate Contact Card */}
              <div className="bg-[#161616] border border-stone-850 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
                
                {/* DYNAMIC CONTACT INFO FROM ADMIN PANEL (socialLinks) — ne yazıldıysa aynen göster */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(siteSettings.socialLinks || []).filter((s:any) => s && s.url && s.url.trim()).map((soc:any) => {
                    const iconMap: Record<SocialPlatform, React.ReactNode> = {
                      phone: <Phone size={20} className="text-amber-500" />,
                      whatsapp: <MessageCircle size={20} className="text-emerald-500" />,
                      instagram: <Instagram size={20} className="text-pink-500" />,
                      facebook: <Facebook size={20} className="text-blue-500" />,
                      tiktok: <Music2 size={20} className="text-stone-300" />,
                      youtube: <Youtube size={20} className="text-red-500" />,
                      email: <Mail size={20} className="text-blue-400" />,
                      address: <MapPin size={20} className="text-amber-500" />,
                      owner: <User size={20} className="text-stone-300" />,
                      website: <Globe size={20} className="text-amber-400" />,
                      other: <LinkIcon size={20} className="text-stone-400" />
                    };
                    const icon = iconMap[soc.platform as SocialPlatform] || <LinkIcon size={20} className="text-stone-400" />;
                    const value = soc.url.trim();
                    const withoutAt = value.replace(/^@/, '');
                    let href = value;
                    if (soc.platform === 'phone') href = `tel:${value.replace(/\s+/g, '')}`;
                    else if (soc.platform === 'whatsapp') href = `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
                    else if (soc.platform === 'email') href = `mailto:${value}`;
                    else if (soc.platform === 'instagram' && !/^https?:\/\//i.test(value)) href = `https://instagram.com/${withoutAt}`;
                    else if (soc.platform === 'facebook' && !/^https?:\/\//i.test(value)) href = `https://facebook.com/${withoutAt}`;
                    else if (soc.platform === 'tiktok' && !/^https?:\/\//i.test(value)) href = `https://tiktok.com/@${withoutAt}`;
                    else if (soc.platform === 'youtube' && !/^https?:\/\//i.test(value)) href = `https://youtube.com/@${withoutAt}`;
                    else if (!/^https?:\/\//i.test(value)) href = `https://${value}`;
                    // Kullanıcının yazdığı değer olduğu gibi gösterilir (kedi/farklı dönüşüm yok)
                    const displayUrl = soc.url;

                    return (
                      <div key={soc.id || soc.url} className="flex items-start space-x-4 bg-[#111111] p-5 rounded-2xl border border-stone-800">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0 mt-0.5">
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold font-mono text-stone-500 uppercase tracking-wider block">
                            {soc.name}
                          </span>
                          <a
                            href={href}
                            target={soc.platform === 'phone' || soc.platform === 'email' ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            className="text-amber-400 font-black text-sm block mt-0.5 hover:underline break-words"
                          >
                            {displayUrl}
                          </a>
                        </div>
                      </div>
                    );
                  })}
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

                {/* HARİTA / ADRESİMİZ */}
                <div className="pt-6 border-t border-stone-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-amber-500" />
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">ADRESİMİZ</span>
                  </div>
                  <div className="w-full h-64 rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-inner">
                    <iframe
                      title="Çat Yapı Dükkân Konumu"
                      src={siteSettings.googleMapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="https://maps.app.goo.gl/TRUDGYFHgDnSG4pm7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                    >
                      <MapPin size={14} />
                      <span>Google Maps'te Aç</span>
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href="https://share.google/030bxRVrBCxRMhcnZ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <Globe size={14} />
                      <span>Google Sayfamız</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
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
              <a href={(() => {
                const v = siteSettings?.instagram || '@catyapii';
                const clean = v.replace(/^@/, '').trim();
                return /^https?:\/\//i.test(clean) ? clean : `https://instagram.com/${clean}`;
              })()} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-xs text-pink-400 hover:underline">
                <Instagram size={14} />
                <span>{siteSettings?.instagram || '@catyapii'}</span>
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
              <a href={(() => {
                const v = siteSettings?.instagram || '@catyapii';
                const clean = v.replace(/^@/, '').trim();
                return /^https?:\/\//i.test(clean) ? clean : `https://instagram.com/${clean}`;
              })()} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 text-left transition-colors font-semibold col-span-2">● Instagram ({siteSettings?.instagram || '@catyapii'})</a>
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
