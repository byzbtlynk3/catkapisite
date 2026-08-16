import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Search, DollarSign, Filter, CheckCircle2, Save, Tag, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getStoredCategories } from '../lib/categoryData';

interface AdminPriceManagerProps {
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
}

export default function AdminPriceManager({ products, onSaveProducts }: AdminPriceManagerProps) {
  const categoriesDef = useMemo(() => getStoredCategories(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('ALL');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [selectedPriceMode, setSelectedPriceMode] = useState<string>('ALL');
  const [notification, setNotification] = useState<string>('');

  // Local draft state for quick inline price editing
  const [editedPrices, setEditedPrices] = useState<Record<string, {
    startingPrice: string;
    campaignPrice: string;
    priceDisplayMode: 'numeric' | 'ask_price' | 'get_quote';
    isCampaign: boolean;
  }>>({});

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Get active subcategories list based on selected main category
  const activeSubCategories = useMemo(() => {
    if (selectedMainCategory === 'ALL') {
      const subs: string[] = [];
      categoriesDef.forEach(cat => {
        cat.subCategories.forEach(s => {
          if (!subs.includes(s.name)) subs.push(s.name);
        });
      });
      return subs;
    }
    const cat = categoriesDef.find(c => c.name === selectedMainCategory);
    return cat ? cat.subCategories.map(s => s.name) : [];
  }, [categoriesDef, selectedMainCategory]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedMainCategory !== 'ALL' && p.category !== selectedMainCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubCategory !== 'ALL' && p.subCategory !== selectedSubCategory) {
        return false;
      }
      // Price Mode filter
      if (selectedPriceMode !== 'ALL') {
        const mode = p.priceDisplayMode || 'numeric';
        if (mode !== selectedPriceMode) return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCat = p.category.toLowerCase().includes(query);
        const matchesSub = (p.subCategory || '').toLowerCase().includes(query);
        const matchesId = p.id.toLowerCase().includes(query);
        return matchesName || matchesCat || matchesSub || matchesId;
      }
      return true;
    });
  }, [products, selectedMainCategory, selectedSubCategory, selectedPriceMode, searchQuery]);

  // Handle single product field edit change
  const handlePriceChange = (
    productId: string, 
    field: 'startingPrice' | 'campaignPrice' | 'priceDisplayMode' | 'isCampaign', 
    value: any,
    p: Product
  ) => {
    const current = editedPrices[productId] || {
      startingPrice: p.startingPrice ? String(p.startingPrice) : '',
      campaignPrice: p.campaignPrice ? String(p.campaignPrice) : '',
      priceDisplayMode: p.priceDisplayMode || 'numeric',
      isCampaign: !!p.isCampaign
    };

    setEditedPrices(prev => ({
      ...prev,
      [productId]: {
        ...current,
        [field]: value
      }
    }));
  };

  // Save single product price update
  const handleSaveSingleProductPrice = (productId: string) => {
    const editData = editedPrices[productId];
    if (!editData) return;

    const numStarting = editData.startingPrice ? parseFloat(editData.startingPrice) : undefined;
    const numCampaign = editData.campaignPrice ? parseFloat(editData.campaignPrice) : undefined;

    const updatedList = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          startingPrice: numStarting,
          campaignPrice: numCampaign,
          priceDisplayMode: editData.priceDisplayMode,
          isCampaign: !!numCampaign || editData.isCampaign
        };
      }
      return p;
    });

    onSaveProducts(updatedList);
    
    // Clear from draft
    setEditedPrices(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });

    showNotify('Ürün fiyat bilgisi başarıyla güncellendi!');
  };

  // Bulk save all pending edits
  const handleSaveAllPendingPrices = () => {
    const pendingIds = Object.keys(editedPrices);
    if (pendingIds.length === 0) {
      showNotify('Değiştirilmiş bir fiyat bulunmuyor.');
      return;
    }

    const updatedList = products.map(p => {
      if (editedPrices[p.id]) {
        const editData = editedPrices[p.id];
        return {
          ...p,
          startingPrice: editData.startingPrice ? parseFloat(editData.startingPrice) : undefined,
          campaignPrice: editData.campaignPrice ? parseFloat(editData.campaignPrice) : undefined,
          priceDisplayMode: editData.priceDisplayMode,
          isCampaign: !!editData.campaignPrice || editData.isCampaign
        };
      }
      return p;
    });

    onSaveProducts(updatedList);
    setEditedPrices({});
    showNotify(`${pendingIds.length} ürünün fiyatı toplu olarak kaydedildi!`);
  };

  const hasPendingEdits = Object.keys(editedPrices).length > 0;

  return (
    <div className="space-y-6 text-stone-100">
      
      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* HEADER & CONTROLS SECTION */}
      <div className="bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={20} className="text-amber-500" />
              <span>Hızlı Ürün Fiyat Yönetimi</span>
            </h3>
            <p className="text-stone-400 text-xs mt-1">
              Tüm ürünlerin başlangıç fiyatlarını, kampanya indirimlerini ve fiyat görüntüleme modlarını tek ekrandan hızlıca düzenleyin.
            </p>
          </div>

          {hasPendingEdits && (
            <button
              type="button"
              onClick={handleSaveAllPendingPrices}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0 animate-pulse"
            >
              <Save size={16} />
              <span>Tüm Değişiklikleri Kaydet ({Object.keys(editedPrices).length})</span>
            </button>
          )}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-3 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, kod veya model ara..."
              className="w-full bg-[#111111] border border-stone-800 text-xs pl-10 pr-4 py-2.5 rounded-xl text-stone-200 outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-stone-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Main Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubCategory('ALL');
              }}
              className="w-full bg-[#111111] border border-stone-800 text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Tüm Ana Kategoriler ({categoriesDef.length})</option>
              {categoriesDef.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="w-full bg-[#111111] border border-stone-800 text-stone-300 font-semibold text-xs px-3 py-2.5 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Tüm Alt Gruplar</option>
              {activeSubCategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Price Display Mode Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedPriceMode}
              onChange={(e) => setSelectedPriceMode(e.target.value)}
              className="w-full bg-[#111111] border border-stone-800 text-stone-300 font-semibold text-xs px-3 py-2.5 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Tüm Fiyat Tipleri</option>
              <option value="numeric">₺ Sayısal Fiyatlı</option>
              <option value="ask_price">Fiyat Sorunuz</option>
              <option value="get_quote">Teklif Alınız</option>
            </select>
          </div>

        </div>

      </div>

      {/* PRODUCTS LIST TABLE / CARDS */}
      <div className="bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl">
        
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
            <Filter size={14} className="text-amber-500" />
            <span>Listelenen Ürünler ({filteredProducts.length} Ürün Bulundu)</span>
          </span>

          <span className="text-[11px] font-mono text-stone-500">
            Toplam {products.length} Kayıtlı Ürün
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#121212] rounded-xl border border-stone-850">
            <AlertCircle size={32} className="text-stone-600 mx-auto" />
            <h4 className="text-white font-bold text-sm">Aranan kriterlere uygun ürün bulunamadı.</h4>
            <p className="text-stone-500 text-xs">Filtreleri sıfırlayarak veya farklı bir arama terimi yazarak tekrar deneyebilirsiniz.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedMainCategory('ALL');
                setSelectedSubCategory('ALL');
                setSelectedPriceMode('ALL');
              }}
              className="px-4 py-2 bg-stone-900 border border-stone-800 hover:border-amber-500 text-amber-400 font-mono text-xs rounded-xl transition-all cursor-pointer"
            >
              Tüm Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(p => {
              const coverImg = p.images && p.images[p.coverImageIndex || 0] ? p.images[p.coverImageIndex || 0] : p.images?.[0] || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400';
              
              const currentEdit = editedPrices[p.id];
              const isEdited = !!currentEdit;

              const displayStartingPrice = currentEdit ? currentEdit.startingPrice : (p.startingPrice ? String(p.startingPrice) : '');
              const displayCampaignPrice = currentEdit ? currentEdit.campaignPrice : (p.campaignPrice ? String(p.campaignPrice) : '');
              const displayMode = currentEdit ? currentEdit.priceDisplayMode : (p.priceDisplayMode || 'numeric');
              const displayIsCampaign = currentEdit ? currentEdit.isCampaign : !!p.isCampaign;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                    isEdited
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                      : 'bg-[#121212] border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {/* Left Product Specs */}
                  <div className="flex items-center space-x-3.5 min-w-[260px]">
                    <img
                      src={coverImg}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-xl bg-black border border-stone-800 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white tracking-tight">{p.name}</h5>
                        {displayIsCampaign && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                            İNDİRİMLİ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-amber-500 font-mono font-bold">{p.category}</span>
                        {p.subCategory && (
                          <span className="text-stone-400 font-mono">/ {p.subCategory}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 font-mono">ID: {p.id}</p>
                    </div>
                  </div>

                  {/* Middle Pricing Inputs Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full lg:w-auto flex-1 items-center">
                    
                    {/* Price Mode */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Görüntüleme Modu</label>
                      <select
                        value={displayMode}
                        onChange={(e) => handlePriceChange(p.id, 'priceDisplayMode', e.target.value as any, p)}
                        className="w-full bg-[#181818] border border-stone-800 text-stone-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="numeric">₺ Sayısal Fiyat Göster</option>
                        <option value="ask_price">Fiyat Sorunuz (WhatsApp)</option>
                        <option value="get_quote">Özel Teklif Alınız</option>
                      </select>
                    </div>

                    {/* Standard Starting Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Başlangıç Fiyatı (₺)</label>
                      <input
                        type="number"
                        disabled={displayMode !== 'numeric'}
                        value={displayStartingPrice}
                        onChange={(e) => handlePriceChange(p.id, 'startingPrice', e.target.value, p)}
                        placeholder="Örn: 18500"
                        className="w-full bg-[#181818] border border-stone-800 text-amber-400 font-bold text-xs px-3 py-2 rounded-xl outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    </div>

                    {/* Campaign / Discount Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">İndirimli Fiyat (₺)</label>
                      <input
                        type="number"
                        disabled={displayMode !== 'numeric'}
                        value={displayCampaignPrice}
                        onChange={(e) => handlePriceChange(p.id, 'campaignPrice', e.target.value, p)}
                        placeholder="Örn: 15900"
                        className="w-full bg-[#181818] border border-stone-800 text-emerald-400 font-bold text-xs px-3 py-2 rounded-xl outline-none focus:border-amber-500 disabled:opacity-40"
                      />
                    </div>

                    {/* Campaign Toggle */}
                    <div className="sm:col-span-2 pt-4 flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-[10px] text-stone-300 font-bold select-none">
                        <input
                          type="checkbox"
                          checked={displayIsCampaign}
                          onChange={(e) => handlePriceChange(p.id, 'isCampaign', e.target.checked, p)}
                          className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                        />
                        <span>Kampanyalı</span>
                      </label>
                    </div>

                  </div>

                  {/* Right Save Button */}
                  <div className="shrink-0 pt-2 lg:pt-0 w-full lg:w-auto flex justify-end">
                    <button
                      type="button"
                      disabled={!isEdited}
                      onClick={() => handleSaveSingleProductPrice(p.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        isEdited
                          ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                          : 'bg-stone-900 border border-stone-800 text-stone-600 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Save size={14} />
                      <span>{isEdited ? 'Kaydet' : 'Güncel'}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
