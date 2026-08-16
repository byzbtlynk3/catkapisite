import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw, 
  CheckCircle2, 
  Layers,
  Edit3,
  Save,
  Package,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { 
  MainCategoryDef, 
  SubCategoryDef, 
  getStoredCategories, 
  saveStoredCategories, 
  resetStoredCategories 
} from '../lib/categoryData';
import { Product } from '../types';

interface AdminCategoryManagerProps {
  products?: Product[];
  onSaveProducts?: (updatedProducts: Product[]) => void;
  onStartEditProduct?: (product: Product) => void;
}

export default function AdminCategoryManager({
  products = [],
  onSaveProducts,
  onStartEditProduct
}: AdminCategoryManagerProps) {
  const [categories, setCategories] = useState<MainCategoryDef[]>(() => getStoredCategories());
  const [newMainName, setNewMainName] = useState('');
  
  const [selectedMainIdForSub, setSelectedMainIdForSub] = useState<string>('');
  const [newSubName, setNewSubName] = useState('');

  const [expandedCatIds, setExpandedCatIds] = useState<Record<string, boolean>>({});
  const [selectedSubForProducts, setSelectedSubForProducts] = useState<{ mainCatName: string; subCatName: string } | null>(null);
  const [notification, setNotification] = useState<string>('');

  // Inline Category Renaming State
  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [editingMainName, setEditingMainName] = useState('');

  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState('');

  // Quick Inline Product Price Editing in Category view
  const [quickPrices, setQuickPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categories.length > 0 && !selectedMainIdForSub) {
      setSelectedMainIdForSub(categories[0].id);
    }
  }, [categories, selectedMainIdForSub]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleUpdateCategories = (updated: MainCategoryDef[], msg: string) => {
    setCategories(updated);
    saveStoredCategories(updated);
    showNotify(msg);
  };

  // 1. ADD MAIN CATEGORY
  const handleAddMainCategory = () => {
    if (!newMainName.trim()) return;
    const nameTrimmed = newMainName.trim();
    if (categories.some(c => c.name.toLowerCase() === nameTrimmed.toLowerCase())) {
      alert('Bu ana kategori ismi zaten mevcut!');
      return;
    }

    const newCat: MainCategoryDef = {
      id: `main-${Date.now()}`,
      name: nameTrimmed,
      isActive: true,
      subCategories: []
    };

    const updated = [...categories, newCat];
    setNewMainName('');
    handleUpdateCategories(updated, `"${nameTrimmed}" ana kategorisi eklendi.`);
  };

  // 2. RENAME MAIN CATEGORY
  const handleSaveRenameMain = (mainId: string) => {
    if (!editingMainName.trim()) return;
    const trimmed = editingMainName.trim();
    
    const updated = categories.map(c => {
      if (c.id === mainId) {
        return { ...c, name: trimmed };
      }
      return c;
    });

    setEditingMainId(null);
    setEditingMainName('');
    handleUpdateCategories(updated, 'Kategori adı güncellendi.');
  };

  // 3. RENAME SUBCATEGORY
  const handleSaveRenameSub = (mainId: string, subId: string) => {
    if (!editingSubName.trim()) return;
    const trimmed = editingSubName.trim();

    const updated = categories.map(c => {
      if (c.id === mainId) {
        const subs = c.subCategories.map(s => s.id === subId ? { ...s, name: trimmed } : s);
        return { ...c, subCategories: subs };
      }
      return c;
    });

    setEditingSubId(null);
    setEditingSubName('');
    handleUpdateCategories(updated, 'Alt kategori adı güncellendi.');
  };

  // 4. ADD SUBCATEGORY
  const handleAddSubCategory = () => {
    if (!newSubName.trim() || !selectedMainIdForSub) return;
    const subTrimmed = newSubName.trim();

    const updated = categories.map(main => {
      if (main.id === selectedMainIdForSub) {
        if (main.subCategories.some(s => s.name.toLowerCase() === subTrimmed.toLowerCase())) {
          alert('Bu alt kategori ismi bu kategoride zaten mevcut!');
          return main;
        }
        const newSub: SubCategoryDef = {
          id: `sub-${Date.now()}`,
          name: subTrimmed,
          meshType: 'wardrobe',
          isActive: true
        };
        return {
          ...main,
          subCategories: [...main.subCategories, newSub]
        };
      }
      return main;
    });

    setNewSubName('');
    handleUpdateCategories(updated, `"${subTrimmed}" alt kategorisi eklendi.`);
  };

  // 5. MOVE MAIN CATEGORY (UP / DOWN)
  const handleMoveMain = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...categories];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    handleUpdateCategories(copy, 'Ana kategori sıralaması güncellendi.');
  };

  // 6. MOVE SUBCATEGORY (UP / DOWN)
  const handleMoveSub = (mainId: string, subIndex: number, direction: 'up' | 'down') => {
    const mainCat = categories.find(m => m.id === mainId);
    if (!mainCat) return;
    if (direction === 'up' && subIndex === 0) return;
    if (direction === 'down' && subIndex === mainCat.subCategories.length - 1) return;

    const targetSubIdx = direction === 'up' ? subIndex - 1 : subIndex + 1;

    const updated = categories.map(main => {
      if (main.id === mainId) {
        const subCopy = [...main.subCategories];
        const temp = subCopy[subIndex];
        subCopy[subIndex] = subCopy[targetSubIdx];
        subCopy[targetSubIdx] = temp;
        return { ...main, subCategories: subCopy };
      }
      return main;
    });

    handleUpdateCategories(updated, 'Alt kategori sıralaması güncellendi.');
  };

  // 7. TOGGLE ACTIVE/PASSIVE STATUS
  const handleToggleActiveMain = (mainId: string) => {
    const updated = categories.map(m => {
      if (m.id === mainId) {
        return { ...m, isActive: m.isActive === false ? true : false };
      }
      return m;
    });
    handleUpdateCategories(updated, 'Kategori aktiflik durumu değiştirildi.');
  };

  const handleToggleActiveSub = (mainId: string, subId: string) => {
    const updated = categories.map(m => {
      if (m.id === mainId) {
        const subUpdated = m.subCategories.map(s => {
          if (s.id === subId) {
            return { ...s, isActive: s.isActive === false ? true : false };
          }
          return s;
        });
        return { ...m, subCategories: subUpdated };
      }
      return m;
    });
    handleUpdateCategories(updated, 'Alt kategori aktiflik durumu değiştirildi.');
  };

  // 8. DELETE MAIN OR SUB CATEGORY
  const handleDeleteMain = (mainId: string, mainName: string) => {
    if (window.confirm(`"${mainName}" ana kategorisini ve tüm alt kategorilerini silmek istediğinizden emin misiniz?`)) {
      const updated = categories.filter(m => m.id !== mainId);
      handleUpdateCategories(updated, `"${mainName}" kategorisi silindi.`);
    }
  };

  const handleDeleteSub = (mainId: string, subId: string, subName: string) => {
    if (window.confirm(`"${subName}" alt kategorisini silmek istediğinizden emin misiniz?`)) {
      const updated = categories.map(m => {
        if (m.id === mainId) {
          return {
            ...m,
            subCategories: m.subCategories.filter(s => s.id !== subId)
          };
        }
        return m;
      });
      handleUpdateCategories(updated, `"${subName}" alt kategorisi silindi.`);
    }
  };

  // 9. RESET TO DEFAULT CATEGORY STRUCTURE
  const handleResetDefault = () => {
    if (window.confirm('Tüm kategorileri orijinal fabrika varsayılan yapısına döndürmek istediğinizden emin misiniz?')) {
      resetStoredCategories();
      const defs = getStoredCategories();
      setCategories(defs);
      showNotify('Kategoriler varsayılan yapıya sıfırlandı.');
    }
  };

  const toggleExpandMain = (mainId: string) => {
    setExpandedCatIds(prev => ({ ...prev, [mainId]: !prev[mainId] }));
  };

  // PRODUCTS OF SELECTED SUBCATEGORY
  const selectedProducts = selectedSubForProducts
    ? products.filter(p => {
        const normalize = (s?: string | null) => {
          if (!s) return '';
          try { return s.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { return (s||'').toLowerCase(); }
        };
        const pCat = normalize(p.category);
        const pSub = normalize(p.subCategory || '');
        const mainNorm = normalize(selectedSubForProducts.mainCatName);
        const subNorm = normalize(selectedSubForProducts.subCatName);
        return pCat === mainNorm && (pSub === subNorm || !p.subCategory);
      })
    : [];

  // QUICK PRODUCT ADD TO SUBCATEGORY
  const handleAddProductToSelectedSub = () => {
    if (!selectedSubForProducts || !onSaveProducts) return;
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: `Yeni ${selectedSubForProducts.subCatName} Model`,
      category: selectedSubForProducts.mainCatName,
      subCategory: selectedSubForProducts.subCatName,
      description: `${selectedSubForProducts.mainCatName} - ${selectedSubForProducts.subCatName} özel imalat modelimiz.`,
      extendedDescription: 'Mersin Akdeniz imalathanemizde 1. sınıf malzemeden özel ölçü olarak üretilmektedir.',
      startingPrice: 15000,
      priceDisplayMode: 'numeric',
      isCustomProduction: true,
      images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'],
      materials: ['Lake Akrilik', 'MDF Lam'],
      keyFeatures: ['Özel Ölçü Üretim', 'Yavaş Kapanır Menteşe'],
      specs: { 'Malzeme': 'MDF / Lake', 'Garanti': '2 Yıl' }
    };

    onSaveProducts([...products, newProd]);
    showNotify(`"${newProd.name}" eklendi.`);
    if (onStartEditProduct) {
      onStartEditProduct(newProd);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = (productId: string, prodName: string) => {
    if (!onSaveProducts) return;
    if (window.confirm(`"${prodName}" ürününü silmek istediğinizden emin misiniz?`)) {
      onSaveProducts(products.filter(p => p.id !== productId));
      showNotify(`"${prodName}" silindi.`);
    }
  };

  // QUICK SAVE PRICE IN CATEGORY VIEW
  const handleSaveQuickPrice = (productId: string) => {
    if (!onSaveProducts) return;
    const newPriceVal = quickPrices[productId];
    if (newPriceVal === undefined) return;

    const num = parseFloat(newPriceVal);
    const updated = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          startingPrice: isNaN(num) ? undefined : num
        };
      }
      return p;
    });

    onSaveProducts(updated);
    showNotify('Fiyat güncellendi.');
  };

  return (
    <div className="space-y-6 text-stone-100">
      
      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP CREATION PANELS (ADD MAIN & ADD SUB) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ADD MAIN CATEGORY */}
        <div className="bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-3 shadow-lg">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <FolderPlus size={16} className="text-amber-500" />
            <span>Yeni Ana Kategori Ekle</span>
          </h4>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMainName}
              onChange={(e) => setNewMainName(e.target.value)}
              placeholder="Örn: Yemek Odası, Mutfak..."
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddMainCategory}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={15} />
              Ekle
            </button>
          </div>
        </div>

        {/* ADD SUBCATEGORY */}
        <div className="bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-3 shadow-lg">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-amber-500" />
            <span>Yeni Alt Kategori Ekle</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <select
              value={selectedMainIdForSub}
              onChange={(e) => setSelectedMainIdForSub(e.target.value)}
              className="sm:col-span-5 bg-[#111111] border border-stone-800 text-amber-300 font-bold text-xs px-3 py-2.5 rounded-xl outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="Örn: Vitrin, Masa, Sandalye..."
              className="sm:col-span-5 bg-[#111111] border border-stone-800 text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />

            <button
              type="button"
              onClick={handleAddSubCategory}
              className="sm:col-span-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Alt Kategori Ekle"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

      </div>

      {/* CATEGORY TREE & SUBCATEGORY PRODUCTS SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Category Accordion Manager */}
        <div className={`${selectedSubForProducts ? 'lg:col-span-6' : 'lg:col-span-12'} bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl transition-all`}>
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                Kategori Yapısı Ve Filtre Hiyerarşisi ({categories.length} Ana Kategori)
              </h4>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Kategoriye tıklayarak alt grupları görün, alt gruba tıklayarak ona bağlı ürünleri listeyin.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-400 font-mono text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw size={12} />
              <span>Sıfırla</span>
            </button>
          </div>

          {/* ACCORDION CATEGORIES LIST */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {categories.map((mainCat, mainIdx) => {
              const isExpanded = !!expandedCatIds[mainCat.id];
              const isMainActive = mainCat.isActive !== false;
              const isEditingThisMain = editingMainId === mainCat.id;

              return (
                <div
                  key={mainCat.id}
                  className={`border rounded-2xl transition-all ${
                    isMainActive
                      ? 'bg-[#121212] border-stone-800'
                      : 'bg-stone-950/60 border-stone-900 opacity-60'
                  }`}
                >
                  {/* Main Category Header Row */}
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    
                    {isEditingThisMain ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingMainName}
                          onChange={(e) => setEditingMainName(e.target.value)}
                          className="bg-[#181818] border border-amber-500 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRenameMain(mainCat.id)}
                          className="p-1.5 bg-amber-500 text-black font-bold rounded-lg text-xs"
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => toggleExpandMain(mainCat.id)}
                        className="flex items-center space-x-2.5 cursor-pointer select-none flex-1"
                      >
                        <button type="button" className="text-amber-400">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <span className="text-sm font-extrabold text-white tracking-tight">
                          ▶ {mainCat.name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-2 py-0.5 rounded-full">
                          {mainCat.subCategories.length} Alt Kategori
                        </span>
                      </div>
                    )}

                    {/* Main Category Action Buttons */}
                    <div className="flex items-center space-x-1">
                      {!isEditingThisMain && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMainId(mainCat.id);
                            setEditingMainName(mainCat.name);
                          }}
                          className="p-1.5 text-stone-400 hover:text-amber-400 rounded-lg transition-colors"
                          title="Kategori Adını Düzenle"
                        >
                          <Edit3 size={13} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleActiveMain(mainCat.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                          isMainActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-900'
                        }`}
                        title={isMainActive ? "Aktif" : "Pasif"}
                      >
                        {isMainActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveMain(mainIdx, 'up')}
                        disabled={mainIdx === 0}
                        className="p-1 text-stone-400 hover:text-amber-400 disabled:opacity-20"
                      >
                        <ArrowUp size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMoveMain(mainIdx, 'down')}
                        disabled={mainIdx === categories.length - 1}
                        className="p-1 text-stone-400 hover:text-amber-400 disabled:opacity-20"
                      >
                        <ArrowDown size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMain(mainCat.id, mainCat.name)}
                        className="p-1.5 text-stone-500 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Expanded List */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-stone-850 space-y-1.5">
                      <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-2">
                        "{mainCat.name}" Alt Grupları (Seçerek Ürünlerini Görün)
                      </div>

                      {mainCat.subCategories.length === 0 ? (
                        <div className="text-xs text-stone-600 italic py-2">
                          Henüz alt kategori eklenmemiş.
                        </div>
                      ) : (
                        mainCat.subCategories.map((sub, subIdx) => {
                          const isSubActive = sub.isActive !== false;
                          const isEditingThisSub = editingSubId === sub.id;
                          const isSelectedForProducts = selectedSubForProducts?.mainCatName === mainCat.name && selectedSubForProducts?.subCatName === sub.name;

                          const matchingProdCount = products.filter(p => p.category === mainCat.name && (p.subCategory === sub.name || !p.subCategory)).length;

                          return (
                            <div
                              key={sub.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isSelectedForProducts
                                  ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md'
                                  : isSubActive
                                  ? 'bg-stone-900/80 border-stone-800 text-stone-200 hover:border-stone-700'
                                  : 'bg-stone-950 border-stone-900 text-stone-500 line-through'
                              }`}
                            >
                              {isEditingThisSub ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingSubName}
                                    onChange={(e) => setEditingSubName(e.target.value)}
                                    className="bg-black border border-amber-500 text-white text-xs px-2 py-1 rounded outline-none flex-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveRenameSub(mainCat.id, sub.id)}
                                    className="p-1 bg-amber-500 text-black font-bold rounded text-xs"
                                  >
                                    <Save size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => setSelectedSubForProducts({ mainCatName: mainCat.name, subCatName: sub.name })}
                                  className="flex items-center gap-2 cursor-pointer flex-1"
                                >
                                  <span className="text-amber-500 font-mono font-bold">•</span>
                                  <span>{sub.name}</span>
                                  <span className="text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                                    {matchingProdCount} Ürün
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center space-x-1">
                                {!isEditingThisSub && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSubId(sub.id);
                                      setEditingSubName(sub.name);
                                    }}
                                    className="p-1 text-stone-400 hover:text-amber-400"
                                    title="Alt Kategori İsmini Değiştir"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleActiveSub(mainCat.id, sub.id)}
                                  className={`p-1 rounded text-[10px] ${isSubActive ? 'text-emerald-400' : 'text-stone-600'}`}
                                >
                                  {isSubActive ? <Eye size={12} /> : <EyeOff size={12} />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMoveSub(mainCat.id, subIdx, 'up')}
                                  disabled={subIdx === 0}
                                  className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                                >
                                  <ArrowUp size={11} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleMoveSub(mainCat.id, subIdx, 'down')}
                                  disabled={subIdx === mainCat.subCategories.length - 1}
                                  className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                                >
                                  <ArrowDown size={11} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteSub(mainCat.id, sub.id, sub.name)}
                                  className="p-1 text-stone-600 hover:text-red-400"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Subcategory Products Panel */}
        {selectedSubForProducts && (
          <div className="lg:col-span-6 bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider block">
                  {selectedSubForProducts.mainCatName} /
                </span>
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Package size={18} className="text-amber-500" />
                  <span>"{selectedSubForProducts.subCatName}" Ürünleri ({selectedProducts.length})</span>
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddProductToSelectedSub}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Yeni Ürün Ekle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSubForProducts(null)}
                  className="p-1.5 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-lg"
                  title="Paneli Kapat"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedProducts.length === 0 ? (
              <div className="p-10 text-center space-y-3 bg-[#121212] rounded-xl border border-stone-850">
                <Package size={32} className="text-stone-600 mx-auto" />
                <p className="text-stone-400 text-xs">Bu alt kategoride henüz ürün bulunmamaktadır.</p>
                <button
                  type="button"
                  onClick={handleAddProductToSelectedSub}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  + İlk Ürünü Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {selectedProducts.map(p => {
                  const coverImg = p.images && p.images[p.coverImageIndex || 0] ? p.images[p.coverImageIndex || 0] : p.images?.[0] || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=400';
                  const isQuickPriceChanged = quickPrices[p.id] !== undefined;

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-[#121212] border border-stone-800 hover:border-stone-700 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={coverImg}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-cover rounded-lg bg-black border border-stone-800 shrink-0"
                          />
                          <div>
                            <h5 className="text-xs font-bold text-white tracking-tight">{p.name}</h5>
                            <p className="text-[10px] text-stone-400 line-clamp-1">{p.description}</p>
                            <span className="text-[10px] text-amber-500 font-mono">
                              {p.startingPrice ? `₺${p.startingPrice.toLocaleString('tr-TR')}` : 'Fiyat Belirtilmedi'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 shrink-0">
                          {onStartEditProduct && (
                            <button
                              type="button"
                              onClick={() => onStartEditProduct(p)}
                              className="px-2.5 py-1.5 bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-amber-400 font-bold text-[10px] uppercase rounded-lg transition-all flex items-center gap-1"
                            >
                              <Edit3 size={12} />
                              <span>Detay Düzenle</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Inline Quick Price Row */}
                      <div className="pt-2 border-t border-stone-850 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Hızlı Fiyat (₺):</span>
                          <input
                            type="number"
                            value={quickPrices[p.id] !== undefined ? quickPrices[p.id] : (p.startingPrice || '')}
                            onChange={(e) => setQuickPrices({ ...quickPrices, [p.id]: e.target.value })}
                            className="w-28 bg-black border border-stone-800 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-lg outline-none focus:border-amber-500"
                          />
                        </div>

                        <button
                          type="button"
                          disabled={!isQuickPriceChanged}
                          onClick={() => handleSaveQuickPrice(p.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                            isQuickPriceChanged
                              ? 'bg-amber-500 text-black cursor-pointer'
                              : 'bg-stone-900 text-stone-600 border border-stone-850 cursor-not-allowed'
                          }`}
                        >
                          <Save size={12} />
                          <span>Fiyatı Kaydet</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
