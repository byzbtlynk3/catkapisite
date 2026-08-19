import React from 'react';
import { MAIN_CATEGORIES_STRUCTURE, MainCategoryDef, SubCategoryDef } from '../lib/categoryData';
import { Box, Layers, Sliders, CheckCircle2, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface CategoryLandingCardsProps {
  selectedMainCategory: string | null;
  selectedSubCategory: string | null;
  onSelectSubCategory: (subCatName: string | null) => void;
  onOpen3DStudio?: (categoryName: string, subCategoryName?: string) => void;
}

export default function CategoryLandingCards({
  selectedMainCategory,
  selectedSubCategory,
  onSelectSubCategory,
  onOpen3DStudio
}: CategoryLandingCardsProps) {
  if (!selectedMainCategory) return null;

  const categoryDef = MAIN_CATEGORIES_STRUCTURE.find(
    c => c.name.toLowerCase() === selectedMainCategory.toLowerCase()
  );

  if (!categoryDef) return null;

  const currentSubDef = categoryDef.subCategories.find(
    s => s.name.toLowerCase() === (selectedSubCategory || '').toLowerCase()
  );

  return (
    <div id="category-landing-view" className="w-full bg-[#141414] border border-stone-800 rounded-3xl p-6 mb-10 shadow-2xl space-y-6">
      
      {/* Category Landing Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[10px] uppercase tracking-widest rounded-md">
              Kategori Açılış Rehberi
            </span>
            <span className="text-stone-500 text-xs">•</span>
            <span className="text-stone-300 text-xs font-mono font-bold">{categoryDef.subCategories.length} Alt Seçenek</span>
          </div>
          <h2 className="text-2xl font-black text-white font-sans flex items-center gap-2">
            <span>{categoryDef.name}</span>
          </h2>
          <p className="text-stone-400 text-xs mt-1 max-w-2xl">
            {categoryDef.description}
          </p>
        </div>

        {/* Promotional CTA removed per requirements: keep category browsing but hide promotional 'Özel İmalat Talebi' CTA */}
      </div>

      {/* Subcategory Grid Cards (Büyük Kartlar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-stone-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-amber-500" />
            <span>Alt Kategoriler ({categoryDef.name})</span>
          </span>
          {selectedSubCategory && (
            <button
              type="button"
              onClick={() => onSelectSubCategory(null)}
              className="text-amber-400 hover:text-amber-300 text-xs font-bold underline cursor-pointer"
            >
              Tüm Alt Kategorileri Göster
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categoryDef.subCategories.map((sub) => {
            const isSelected = selectedSubCategory === sub.name;
            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubCategory(isSelected ? null : sub.name)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-xl ring-2 ring-amber-500/30'
                    : 'bg-[#1a1a1a] border-stone-800 hover:border-amber-500/50 hover:bg-[#222]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-amber-500 text-black' : 'bg-stone-800 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors'
                    }`}>
                      <Box size={16} />
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-amber-400" />
                    )}
                  </div>
                  <h3 className={`font-bold text-xs line-clamp-1 ${
                    isSelected ? 'text-amber-300 font-black' : 'text-stone-200 group-hover:text-amber-400'
                  }`}>
                    {sub.name}
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-tight">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] font-bold text-stone-400 group-hover:text-amber-400">
                  <span>{sub.itemsIncluded ? 'Eksiksiz Set' : 'Ürünleri Gör'}</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPECIAL DETAILED BREAKDOWN FOR SETS & PACKAGES (Yatak Odası Takımı, Düğün Paketleri, Yemek Odası Takımı, vb.) */}
      {currentSubDef && currentSubDef.itemsIncluded && (
        <div className="bg-[#1a1a1a] border-2 border-amber-500/30 rounded-2xl p-5 mt-4 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <div>
                <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                  {currentSubDef.name} - Paket / Takım İçeriği
                </h4>
                <p className="text-stone-400 text-xs">
                  Bu takımın içinde yer alan parçaları tek tek inceleyebilir ve 3D tasarımını yapabilirsiniz:
                </p>
              </div>
            </div>

            {onOpen3DStudio && (
              <button
                type="button"
                onClick={() => onOpen3DStudio(categoryDef.name, currentSubDef.name)}
                className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>3D Modellere Geç</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {currentSubDef.itemsIncluded.map((itemStr, idx) => (
              <div 
                key={idx}
                className="bg-[#111111] border border-stone-800 rounded-xl p-3 flex items-center justify-between hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-stone-200 text-xs font-bold">{itemStr}</span>
                </div>

                {onOpen3DStudio && (
                  <button
                    type="button"
                    onClick={() => onOpen3DStudio(categoryDef.name, itemStr)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-stone-900 px-2 py-1 rounded-md border border-stone-800 hover:border-amber-500/50"
                  >
                    <span>3D Tasarla</span>
                    <ChevronRight size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
