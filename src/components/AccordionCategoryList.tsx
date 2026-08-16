import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, Search, RotateCcw } from 'lucide-react';
import { MainCategoryDef, getStoredCategories } from '../lib/categoryData';

interface AccordionCategoryListProps {
  selectedMainCategory?: string | null;
  selectedSubCategory?: string | null;
  onSelectCategory: (mainCatName: string, subCatName?: string) => void;
  onClearFilter?: () => void;
  showAllOption?: boolean;
  searchPlaceholder?: string;
  className?: string;
  compact?: boolean;
}

export default function AccordionCategoryList({
  selectedMainCategory,
  selectedSubCategory,
  onSelectCategory,
  onClearFilter,
  showAllOption = true,
  searchPlaceholder = "Kategori veya ürün ara...",
  className = "",
  compact = false
}: AccordionCategoryListProps) {
  const [categories, setCategories] = useState<MainCategoryDef[]>(() => getStoredCategories());
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<string, boolean>>({});
  const [filterSearch, setFilterSearch] = useState('');

  // Listen to live category data updates from Admin CMS
  useEffect(() => {
    const handleUpdate = () => {
      setCategories(getStoredCategories());
    };
    window.addEventListener('category_data_updated', handleUpdate);
    return () => window.removeEventListener('category_data_updated', handleUpdate);
  }, []);

  // Auto-expand selected category if provided
  useEffect(() => {
    if (selectedMainCategory) {
      const match = categories.find(c => c.name.toLowerCase() === selectedMainCategory.toLowerCase());
      if (match) {
        setExpandedCategoryIds(prev => ({ ...prev, [match.id]: true }));
      }
    }
  }, [selectedMainCategory, categories]);

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategoryIds(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleMainCategoryClick = (mainCat: MainCategoryDef) => {
    setExpandedCategoryIds(prev => ({
      ...prev,
      [mainCat.id]: !prev[mainCat.id]
    }));
    onSelectCategory(mainCat.name);
  };

  const handleSubCategoryClick = (mainCat: MainCategoryDef, subCatName: string) => {
    onSelectCategory(mainCat.name, subCatName);
  };

  // Excluded categories from Products page filter system as requested
  const EXCLUDED_CATEGORIES = ['Düğün Paketleri', 'Özel Üretim'];

  // Filter categories by search and exclusions
  const filteredCategories = categories.filter(c => {
    if (c.isActive === false) return false;
    if (EXCLUDED_CATEGORIES.some(exc => exc.toLowerCase() === c.name.toLowerCase() || exc.toLowerCase() === c.id.toLowerCase())) {
      return false;
    }
    if (!filterSearch.trim()) return true;
    const query = filterSearch.toLowerCase();
    const mainMatches = c.name.toLowerCase().includes(query);
    const subMatches = c.subCategories.some(s => s.isActive !== false && s.name.toLowerCase().includes(query));
    return mainMatches || subMatches;
  });

  const isAllSelected = !selectedMainCategory && !selectedSubCategory;

  return (
    <div className={`w-full bg-[#161616] border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 ${className}`}>
      
      {/* Header & Filter Reset */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-xs font-bold">
        <span className="text-stone-300 uppercase tracking-wider">
          Kategoriler &amp; Ürün Listesi
        </span>
        {onClearFilter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="text-stone-400 hover:text-amber-400 flex items-center gap-1 font-mono transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Filtreyi Temizle</span>
          </button>
        )}
      </div>

      {/* Quick Search */}
      <div className="relative">
        <input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-[#111111] border border-stone-800 text-stone-200 focus:border-amber-500 text-xs px-3.5 py-2 pl-9 rounded-xl outline-none"
        />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
      </div>

      {/* VERTICAL LIST (Alt alta, tek satır görünümü - ACCORDION SYSTEM) */}
      <div className="divide-y divide-stone-800/60 pt-1">
        
        {/* All Products Option */}
        {showAllOption && (
          <div
            onClick={onClearFilter}
            className={`py-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
              isAllSelected
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-stone-300 hover:bg-stone-900 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-amber-500 font-mono text-[10px]">●</span>
              <span>Tüm Kategoriler ve Ürünler</span>
            </span>
            {isAllSelected && <Check size={14} className="text-amber-400" />}
          </div>
        )}

        {/* ACCORDION CATEGORIES LIST */}
        {filteredCategories.map((mainCat) => {
          const isExpanded = !!expandedCategoryIds[mainCat.id] || (!!filterSearch.trim());
          const isMainSelected = selectedMainCategory === mainCat.name && !selectedSubCategory;

          const activeSubCategories = mainCat.subCategories.filter(s => s.isActive !== false);

          return (
            <div key={mainCat.id} className="py-1">
              
              {/* Main Category Row (Tek satır, ok işaretli) */}
              <div
                onClick={() => handleMainCategoryClick(mainCat)}
                className={`py-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                  isMainSelected
                    ? 'bg-amber-500 text-black font-extrabold shadow-md'
                    : 'text-stone-200 hover:bg-stone-900 hover:text-amber-400'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {/* Indicator Symbol: ▶ / ▼ or Chevron */}
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(mainCat.id, e)}
                    className="p-1 rounded hover:bg-black/20 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown size={15} className={isMainSelected ? 'text-black' : 'text-amber-400'} />
                    ) : (
                      <ChevronRight size={15} className={isMainSelected ? 'text-black' : 'text-stone-400'} />
                    )}
                  </button>

                  <span className="tracking-tight">{mainCat.name}</span>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isMainSelected ? 'bg-black/20 text-black font-bold' : 'text-stone-500 bg-stone-900'
                }`}>
                  {activeSubCategories.length} Alt Çeşit
                </span>
              </div>

              {/* ACCORDION SUB-CATEGORIES EXPANDED LIST */}
              {isExpanded && activeSubCategories.length > 0 && (
                <div className="ml-6 my-1 border-l-2 border-amber-500/30 pl-3 space-y-1 py-1">
                  
                  {/* "Tüm [Ana Kategori]" Sub-Option */}
                  <div
                    onClick={() => handleMainCategoryClick(mainCat)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                      isMainSelected
                        ? 'text-amber-400 font-bold bg-amber-500/10'
                        : 'text-stone-400 hover:text-white hover:bg-stone-900'
                    }`}
                  >
                    <span>- Tüm {mainCat.name} Modelleri</span>
                    {isMainSelected && <Check size={12} className="text-amber-400" />}
                  </div>

                  {activeSubCategories.map((subCat) => {
                    const isSubSelected = selectedSubCategory === subCat.name;

                    return (
                      <div
                        key={subCat.id}
                        onClick={() => handleSubCategoryClick(mainCat, subCat.name)}
                        className={`py-1.5 px-2.5 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSubSelected
                            ? 'bg-amber-500 text-black font-extrabold shadow'
                            : 'text-stone-300 hover:text-amber-400 hover:bg-stone-900'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-stone-600">-</span>
                          <span>{subCat.name}</span>
                        </span>
                        {isSubSelected && <Check size={12} className="text-black" />}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="p-4 text-center text-stone-500 text-xs italic">
            Aramanızla eşleşen kategori bulunamadı.
          </div>
        )}

      </div>

    </div>
  );
}
