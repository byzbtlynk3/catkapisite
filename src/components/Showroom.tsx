import React, { useState } from 'react';
import { Product } from '../types';
import UnifiedCategoryFilter from './UnifiedCategoryFilter';
import CategoryLandingCards from './CategoryLandingCards';
import { 
  Maximize2, 
  MessageCircle, 
  ChevronRight, 
  Camera 
} from 'lucide-react';

interface ShowroomProps {
  products: Product[];
  onOpenConfigurator: (categoryDefault?: string) => void;
  onSelectProductDetail: (product: Product) => void;
}

export default function Showroom({ products, onOpenConfigurator, onSelectProductDetail }: ShowroomProps) {
  // Single-selection: main category and optional subcategory (strict matching)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize helper to ignore case and diacritics (Turkish-aware)
  const normalize = (s?: string | null) => {
    if (!s) return '';
    try {
      return s.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\p{Diacritic}/gu, '');
    } catch (e) {
      return s.toLocaleLowerCase();
    }
  };

  const selectedMainNorm = selectedMainCategory ? normalize(selectedMainCategory) : null;
  const selectedSubNorm = selectedSubCategory ? normalize(selectedSubCategory) : null;

  // Filter products by selected main category, optional subcategory, and search
  const filteredProducts = products.filter(p => {
    const prodCat = normalize(p.category);
    const prodSub = normalize(p.subCategory || '');
    const prodMainId = p.categoryId ? normalize(p.categoryId) : '';
    const prodSubId = p.subCategoryId ? normalize(p.subCategoryId) : '';

    let matchesCategory = true;
    if (!selectedMainNorm) {
      matchesCategory = true;
    } else if (selectedMainNorm && !selectedSubNorm) {
      matchesCategory = prodCat === selectedMainNorm || prodMainId === selectedMainNorm;
    } else {
      const selectedSubIdNorm = normalize(selectedSubCategory || '');
      matchesCategory =
        (prodCat === selectedMainNorm || prodMainId === normalize(selectedMainCategory || '')) &&
        (prodSub === selectedSubNorm || prodSubId === selectedSubIdNorm || (prodSub === '' && prodSubId === ''));
    }

    const q = searchQuery.trim().toLocaleLowerCase();
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const prepareWhatsAppText = (item: Product) => {
    const priceText = (item.campaignPrice && item.isCampaign) ? `₺${item.campaignPrice.toLocaleString('tr-TR')}` : (item.startingPrice ? `₺${item.startingPrice.toLocaleString('tr-TR')}` : 'Fiyat Teklifli');
    const text = `Merhaba Nuri Usta (Çat Kapı), web sitenizdeki ürünü inceledim:\n\n*${item.name} (${item.category} - ${item.subCategory || 'Genel'})*\n*Fiyat:* ${priceText}\n*Durum:* ${item.stockStatus || 'Özel Üretim'}\n\nBu ürün hakkında detaylı bilgi ve ölçü randevusu talep ediyorum.`;
    return encodeURIComponent(text);
  };

  const handleOpen3DStudio = (catName: string, subCatName?: string) => {
    onOpenConfigurator(subCatName || catName);
  };

  return (
    <section id="showroom-catalog" className="w-full bg-[#111111] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Unified Standard Filter */}
        <UnifiedCategoryFilter
          selectedMainCategory={selectedMainCategory}
          setSelectedMainCategory={(c) => {
            setSelectedMainCategory(c);
            if (!c) setSelectedSubCategory(null);
          }}
          selectedSubCategory={selectedSubCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={filteredProducts.length}
        />

        {/* Category Landing Cards for Selected Main Category */}
        {selectedMainCategory && (
          <CategoryLandingCards
            selectedMainCategory={selectedMainCategory}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={setSelectedSubCategory}
            onOpen3DStudio={handleOpen3DStudio}
          />
        )}

        {/* PRODUCTS GRID */}
        {filteredProducts.length > 0 ? (
          <div id="products-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const coverImg = product.images?.[product.coverImageIndex ?? 0] ?? product.images?.[0] ?? 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400';
              const galleryCount = product.images ? product.images.length : 1;

              return (
                <div
                  key={product.id}
                  className="group bg-[#161616] rounded-3xl overflow-hidden border border-stone-850 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between shadow-xl"
                >
                  
                  {/* Photo Area */}
                  <div 
                    onClick={() => onSelectProductDetail(product)}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950 cursor-pointer"
                  >
                    {/* Category Label */}
                    <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-black/80 backdrop-blur text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-amber-500/20">
                      {product.category}
                    </span>

                    {/* Gallery Images Count Badge */}
                    <span className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-black/80 backdrop-blur text-stone-200 text-[10px] font-mono font-bold rounded-md border border-stone-800 flex items-center gap-1">
                      <Camera size={12} className="text-amber-400" />
                      <span>{galleryCount} Fotoğraf</span>
                    </span>

                    {/* Status badges */}
                    <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
                      {product.isCampaign && (
                        <span className="px-2 py-0.5 bg-red-600/90 text-white font-extrabold text-[9px] uppercase rounded shadow">
                          Kampanya
                        </span>
                      )}
                      {product.isNew && (
                        <span className="px-2 py-0.5 bg-blue-600/90 text-white font-extrabold text-[9px] uppercase rounded shadow">
                          Yeni
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-amber-500/90 text-black font-extrabold text-[9px] uppercase rounded shadow">
                        {product.stockStatus || 'Özel Üretim'}
                      </span>
                    </div>

                    {/* Image with zoom preview hover */}
                    <img
                      src={coverImg}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-4 py-2 bg-stone-950/85 backdrop-blur text-white text-xs font-bold rounded-xl border border-stone-800 flex items-center gap-2">
                        <Maximize2 size={14} className="text-amber-400" />
                        <span>Fotoğrafları Zoom İle İncele</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Details Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 
                        onClick={() => onSelectProductDetail(product)}
                        className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5 font-sans cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div>
                        <div className="mb-3 pt-3 border-t border-stone-850 flex items-baseline justify-between">
                          <span className="text-[10px] text-stone-400 font-bold uppercase">Başlangıç Fiyatı</span>
                          <span className="font-black text-base font-sans">
                            {product.campaignPrice && product.isCampaign ? (
                              <>
                                <span className="text-sm line-through text-stone-400 mr-2">{product.startingPrice ? `₺${product.startingPrice.toLocaleString('tr-TR')}` : ''}</span>
                                <span className="text-amber-400 font-black">{`₺${product.campaignPrice.toLocaleString('tr-TR')}`}</span>
                              </>
                            ) : (
                              <span className="text-amber-400">{product.startingPrice ? `₺${product.startingPrice.toLocaleString('tr-TR')}` : 'Fiyat Alınız'}</span>
                            )}
                          </span>
                        </div>

                      {/* Action Buttons Row */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-850">
                        <button
                          type="button"
                          onClick={() => onSelectProductDetail(product)}
                          className="py-2.5 px-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 text-stone-200 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Detaylar</span>
                          <ChevronRight size={13} className="text-amber-500" />
                        </button>

                        <a
                          href={`https://wa.me/905352194789?text=${prepareWhatsAppText(product)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#161616] border border-stone-850 rounded-3xl p-8">
            <h4 className="text-white font-bold text-base">Aradığınız kriterlere uygun ürün bulunamadı</h4>
            <p className="text-stone-400 text-xs mt-2">Filtreleri temizleyerek tüm katoloğu görüntüleyebilirsiniz.</p>
            <button
              onClick={() => { setSelectedMainCategory(null); setSelectedSubCategory(null); setSearchQuery(''); }}
              className="mt-4 px-6 py-2.5 bg-amber-500 text-black font-extrabold text-xs uppercase rounded-xl"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
