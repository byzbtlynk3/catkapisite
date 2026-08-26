import React, { useState, useEffect } from 'react';
import { MainCategoryDef, SubCategoryDef, getStoredCategories } from '../lib/categoryData';
import { Box, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

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
  const [categories, setCategories] = useState<MainCategoryDef[]>(() => getStoredCategories());

  // Listen to live category data updates from Admin CMS
  useEffect(() => {
    const handleUpdate = () => {
      setCategories(getStoredCategories());
    };
    window.addEventListener('category_data_updated', handleUpdate);
    return () => window.removeEventListener('category_data_updated', handleUpdate);
  }, []);

  if (!selectedMainCategory) return null;

  const categoryDef = categories.find(
    c => c.name.toLowerCase() === selectedMainCategory.toLowerCase()
  );

  if (!categoryDef) return null;

  return (
    <div id="category-landing-view" className="w-full bg-[#141414] border border-stone-800 rounded-3xl p-6 mb-10 shadow-2xl space-y-6">
      
      {/* Category Landing Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white font-sans flex items-center gap-2">
            <span>{categoryDef.name}</span>
          </h2>
        </div>
      </div>

      {/* Subcategory Grid Cards (Büyük Kartlar) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-stone-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-amber-500" />
            <span>Alt Kategoriler</span>
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
                </div>

                <div className="mt-3 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] font-bold text-stone-400 group-hover:text-amber-400">
                  <span>Ürünleri Gör</span>
                  <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}