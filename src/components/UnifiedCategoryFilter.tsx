import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import AccordionCategoryList from './AccordionCategoryList';

interface UnifiedCategoryFilterProps {
  // Backwards-compatible: gallery uses multi-select `selectedCategories`.
  selectedCategories?: string[];
  setSelectedCategories?: (cats: string[]) => void;

  // New single-selection API for showroom/admin.
  selectedMainCategory?: string | null;
  setSelectedMainCategory?: (cat: string | null) => void;
  selectedSubCategory?: string | null;
  setSelectedSubCategory?: (sub: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalCount: number;
}

export default function UnifiedCategoryFilter({
  selectedCategories,
  setSelectedCategories,
  selectedMainCategory,
  setSelectedMainCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  searchQuery,
  setSearchQuery,
  totalCount
}: UnifiedCategoryFilterProps) {
  const handleSelectCategory = (mainCatName: string, subCatName?: string) => {
    if (setSelectedMainCategory) setSelectedMainCategory(mainCatName);
    if (setSelectedSubCategory) {
      if (subCatName) setSelectedSubCategory(subCatName);
      else setSelectedSubCategory(null);
    }
    // Backwards-compat: update multi-select if provided (single-selection semantics)
    if (setSelectedCategories) setSelectedCategories([mainCatName]);
  };

  const clearFilter = () => {
    if (setSelectedCategories) setSelectedCategories([]);
    if (setSelectedMainCategory) setSelectedMainCategory(null);
    if (setSelectedSubCategory) setSelectedSubCategory(null);
    setSearchQuery('');
  };

  return (
    <div id="unified-filter-box" className="space-y-4 mb-8">
      
      {/* Top Search & Active Filter Summary Header */}
      <div className="bg-[#161616] border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        
        <div className="flex items-center space-x-2.5 text-stone-300 text-xs font-bold uppercase tracking-wider">
          <Filter size={16} className="text-amber-500 shrink-0" />
          <span>Filtreleme &amp; Arama Paneli ({totalCount} Ürün)</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Direct Search Bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Model adı veya kelime ara..."
              className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white text-xs px-4 py-2.5 pl-9 rounded-xl outline-none"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          </div>

          {((selectedCategories && selectedCategories.length > 0) || selectedMainCategory || selectedSubCategory || searchQuery) && (
            <button
              type="button"
              onClick={clearFilter}
              className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-400 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw size={13} />
              <span>Sıfırla</span>
            </button>
          )}
        </div>

      </div>

      {/* ACCORDION CATEGORY LIST (Alt alta, liste görünümü, tek satır) */}
      <AccordionCategoryList
        selectedMainCategory={selectedMainCategory}
        selectedSubCategory={selectedSubCategory}
        onSelectCategory={handleSelectCategory}
        onClearFilter={clearFilter}
      />

    </div>
  );
}
