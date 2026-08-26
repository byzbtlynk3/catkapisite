import React, { useState } from 'react';
import { Product, GalleryItem, VideoItem, CatalogItem, SiteSettings } from '../types';
import AdminUnifiedCms from './AdminUnifiedCms';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle 
} from 'lucide-react';

interface AdminCmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  categories: string[];
  onSaveCategories: (updatedCategories: string[]) => void;
  galleryItems: GalleryItem[];
  onSaveGallery: (updatedGallery: GalleryItem[]) => void;
  videos: VideoItem[];
  onSaveVideos: (updatedVideos: VideoItem[]) => void;
  catalogs: CatalogItem[];
  onSaveCatalogs: (updatedCatalogs: CatalogItem[]) => void;
  siteSettings: SiteSettings;
  onSaveSiteSettings: (updatedSettings: SiteSettings) => void;
  onResetToDefaults: () => void;
  onSyncCatalog?: (categoryTree: any[], updatedProducts: Product[]) => Promise<boolean>;
}

export default function AdminCmsModal({
  isOpen,
  onClose,
  products,
  onSaveProducts,
  categories,
  onSaveCategories,
  siteSettings,
  onSaveSiteSettings,
  onResetToDefaults,
  onSyncCatalog
}: AdminCmsModalProps) {
  // AUTHENTICATION STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('catkapi_admin_auth') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  if (!isOpen) return null;

  // LOGIN HANDLER
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();
    // Call server-side login endpoint
    fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Username': user,
        'X-Admin-Password': pass
      },
      body: JSON.stringify({ username: user, password: pass })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).error || 'Giriş başarısız');
        return res.json();
      })
      .then((data) => {
        // store token in sessionStorage for authenticated admin actions
        sessionStorage.setItem('catkapi_admin_auth', 'true');
        sessionStorage.setItem('catkapi_admin_token', data.token || '');
        setIsAuthenticated(true);
        setLoginError('');
      })
      .catch((err) => {
        console.error('Login error', err);
        setLoginError('Hatalı kullanıcı adı veya şifre! Lütfen tekrar deneyin.');
      });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('catkapi_admin_auth');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="w-[98vw] max-w-[1850px] my-auto">
        
        {/* LOGIN SCREEN */}
        {!isAuthenticated ? (
          <div className="bg-[#141414] border border-amber-500/30 rounded-3xl p-8 sm:p-12 max-w-md mx-auto my-auto text-center space-y-6 shadow-2xl text-stone-100 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Lock size={32} />
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight font-sans">
                Yönetici Girişi
              </h3>
              <p className="text-stone-400 text-xs mt-1">
                Çat Kapı Ürün &amp; Kategori Yönetim Paneli
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="w-full space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-stone-300 text-xs font-bold uppercase flex items-center gap-1.5">
                  <User size={13} className="text-amber-500" />
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Kullanıcı adınız"
                  required
                  className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white text-xs px-3.5 py-3 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 text-xs font-bold uppercase flex items-center gap-1.5">
                  <KeyRound size={13} className="text-amber-500" />
                  Şifre
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white text-xs px-3.5 py-3 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer shadow-lg mt-2"
              >
                Giriş Yap
              </button>
            </form>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Web Sitesine Dön
            </button>
          </div>
        ) : (
          /* AUTHENTICATED: STREAMLINED PROFESSIONAL CMS (Sol Menü + Tek Arama + Ortada Ürünler + Sağda Editör) */
          <AdminUnifiedCms
            products={products}
            onSaveProducts={onSaveProducts}
            categories={categories}
            onSaveCategories={onSaveCategories}
            siteSettings={siteSettings}
            onSaveSiteSettings={onSaveSiteSettings}
            onClose={onClose}
            onResetToDefaults={onResetToDefaults}
            onLogout={handleLogout}
            onSyncCatalog={onSyncCatalog}
          />
        )}

      </div>
    </div>
  );
}
