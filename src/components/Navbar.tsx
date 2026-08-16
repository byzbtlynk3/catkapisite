import React, { useState } from 'react';
import { Phone, MessageCircle, Instagram, MapPin, Menu, X, Hammer, Sparkles, Settings, ImagePlus } from 'lucide-react';
import { SiteSettings } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAdminCms?: () => void;
  siteSettings?: SiteSettings;
}

export default function Navbar({ currentTab, setCurrentTab, onOpenAdminCms, siteSettings }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'products', label: 'Ürünler' },
    { id: 'custom-production', label: 'Özel Üretim' },
    { id: 'contact', label: 'İletişim' }
  ];

  const isTabActive = (itemId: string) => {
    return currentTab === itemId;
  };


  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full bg-[#111111]/95 text-white shadow-lg backdrop-blur-md border-b border-amber-900/20">
      
      {/* Top Contact & Admin Bar - Realigned to max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */}
      <div id="top-bar" className="w-full bg-[#181818] text-[11px] text-stone-400 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center w-full">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <a href="tel:05352194789" className="flex items-center hover:text-amber-400 transition-colors">
              <Phone size={11} className="mr-1.5 text-amber-500" />
              <span>0535 219 47 89</span>
            </a>
            <a href="https://wa.me/905352194789" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-green-400 transition-colors">
              <MessageCircle size={11} className="mr-1.5 text-green-500" />
              <span className="hidden sm:inline">Nuri Usta WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
            <span className="hidden md:flex items-center text-stone-400">
              <MapPin size={11} className="mr-1.5 text-amber-500" />
              <span>Akdeniz, Mersin</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Admin CMS trigger button */}
            {onOpenAdminCms && (
              <button
                onClick={onOpenAdminCms}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-md font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer"
                title="Ürün ekle, fotoğraf değiştir, fiyat ve kategori güncelle"
              >
                <ImagePlus size={12} className="text-amber-400" />
                <span>Yönetim Paneli (CMS)</span>
              </button>
            )}

            <div className="hidden sm:flex items-center space-x-2 border-l border-stone-800 pl-3">
              <a href="https://instagram.com/catyapii" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-amber-400 transition-colors">
                <Instagram size={11} className="text-pink-500" />
                <span>@catyapii</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div id="main-nav" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <div 
          id="logo-container" 
          onClick={() => handleNavClick('home')} 
          className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
        >
          {siteSettings?.logoUrl ? (
            <img 
              src={siteSettings.logoUrl} 
              alt="ÇAT KAPI Logo" 
              className="h-9 sm:h-10 w-auto object-contain rounded-md"
            />
          ) : (
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg text-black font-extrabold shadow-md shadow-amber-500/10 group-hover:scale-105 transition-all duration-300">
              <Hammer size={18} className="text-[#111111]" />
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-widest text-white leading-tight font-sans">
              ÇAT KAPI
            </h1>
          </div>
        </div>

        {/* Desktop Navigation Items */}
        <nav id="desktop-navigation" className="hidden lg:flex items-center lg:space-x-4 xl:space-x-6">
          {navItems.map((item) => {
            const active = isTabActive(item.id);
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative text-[11px] xl:text-[13px] font-bold tracking-wider uppercase transition-all py-1 px-1.5 cursor-pointer ${
                  active
                    ? 'text-amber-400 font-black'
                    : 'text-stone-300 hover:text-amber-400'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>


        {/* Direct Action Buttons */}
        <div id="navbar-actions" className="hidden xl:flex items-center space-x-2.5 shrink-0">
          <a
            href="tel:05352194789"
            id="nav-call-btn"
            className="flex items-center px-3.5 py-2 border border-stone-800 rounded-full font-bold text-[10px] tracking-wider uppercase text-stone-300 hover:bg-stone-900 hover:border-amber-500/30 transition-all"
          >
            <Phone size={11} className="mr-1.5 text-amber-500" />
            Nuri Usta'yı Ara
          </a>
          <a
            href="https://wa.me/905352194789?text=Merhaba+Nuri+Usta%2C+web+sitenizden+ulaşıyorum.+Ücretsiz+ölçü+keşif+randevusu+almak+istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            id="nav-whatsapp-btn"
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-[10px] tracking-wider uppercase shadow-md transition-all cursor-pointer"
          >
            <MessageCircle size={11} className="mr-1.5" />
            Keşif Talep Et
          </a>
        </div>

        {/* Mobile Toggle */}
        <div id="mobile-menu-toggle-btn" className="flex lg:hidden items-center space-x-2 shrink-0">
          <a
            href="https://wa.me/905352194789"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-[#25d366]/10 border border-[#25d366]/30 text-[#25d366] rounded-full sm:hidden"
            title="WhatsApp Destek"
          >
            <MessageCircle size={15} />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 sm:p-2.5 text-stone-300 hover:text-white rounded-lg bg-stone-900 border border-stone-800 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-nav-panel" className="lg:hidden bg-[#141414] border-t border-stone-800 px-4 pt-3 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const active = isTabActive(item.id);
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-3.5 py-3 rounded-lg transition-all font-bold text-xs tracking-wider uppercase border ${
                    active
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 pl-4'
                      : 'bg-stone-900/40 border-stone-850 text-stone-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

          </div>

          <div className="pt-4 border-t border-stone-800 flex flex-col space-y-3 px-1">
            {onOpenAdminCms && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminCms();
                }}
                className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer"
              >
                <ImagePlus size={14} className="mr-2" />
                Ürün &amp; Görsel Yönetimi (CMS)
              </button>
            )}
            <div className="flex items-center space-x-3 text-xs text-stone-400">
              <MapPin size={14} className="text-amber-500 shrink-0" />
              <span>Mersin, Akdeniz İlçesi, Çay Mahallesi, Cumhuriyet Bulvarı No: 33/A</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:05352194789"
                className="flex items-center justify-center py-3 border border-stone-800 bg-stone-900 text-stone-200 rounded-xl font-bold text-xs uppercase"
              >
                <Phone size={14} className="mr-1.5 text-amber-500" />
                Ara
              </a>
              <a
                href="https://wa.me/905352194789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase shadow"
              >
                <MessageCircle size={14} className="mr-1.5" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
