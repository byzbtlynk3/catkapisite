import React, { useState, useEffect } from 'react';
import { Ruler, CheckCircle, MessageCircle, Package, Layers, Edit3 } from 'lucide-react';
import { Product } from '../types';
import { getStoredCategories, MainCategoryDef } from '../lib/categoryData';
import { 
  getStoredMaterials, 
  getStoredParameterSettings, 
  ManufacturingParamsConfig 
} from '../lib/customProductionData';

interface CustomProductionProps {
  products?: Product[];
}

export default function CustomProduction({ products: propsProducts }: CustomProductionProps) {
  // 1. Dynamic Categories & Subcategories from Category Management
  const [categoriesDef, setCategoriesDef] = useState<MainCategoryDef[]>(() => getStoredCategories());
  
  // 2. Dynamic Materials & Parameters from Management Panel
  const [materialsList, setMaterialsList] = useState<string[]>(() => getStoredMaterials());
  const [paramSettings, setParamSettings] = useState<ManufacturingParamsConfig>(() => getStoredParameterSettings());

  // Products array fallback from localStorage if props not passed directly
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    if (propsProducts && propsProducts.length > 0) return propsProducts;
    try {
      const saved = localStorage.getItem('catkapi_products_cms_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading products in CustomProduction', e);
    }
    return [];
  });

  // Active Selections
  const [selectedMainCat, setSelectedMainCat] = useState<string>(() => {
    const active = categoriesDef.find(c => c.isActive !== false) || categoriesDef[0];
    return active ? active.name : 'Yatak Odası';
  });

  const activeMainDef = categoriesDef.find(c => c.name === selectedMainCat) || categoriesDef[0];
  const activeSubCategories = (activeMainDef?.subCategories || []).filter(s => s.isActive !== false);

  const [selectedSubCat, setSelectedSubCat] = useState<string>(() => {
    return activeSubCategories[0]?.name || 'Gardırop';
  });

  // Selected Product inside SubCategory
  const [selectedProduct, setSelectedProduct] = useState<string>('Diğer (Ürünü Yazınız)');
  const [manualProductName, setManualProductName] = useState<string>('');

  // Selected Material
  const [selectedMaterial, setSelectedMaterial] = useState<string>(() => materialsList[0] || 'MDF Lam');

  // Sliders
  const limits = paramSettings.dimensionLimits || {
    minWidth: 40, maxWidth: 1200, defaultWidth: 240,
    minHeight: 70, maxHeight: 350, defaultHeight: 220,
    minDepth: 10, maxDepth: 150, defaultDepth: 60
  };

  const [width, setWidth] = useState<number>(limits.defaultWidth || 240);
  const [height, setHeight] = useState<number>(limits.defaultHeight || 220);
  const [depth, setDepth] = useState<number>(limits.defaultDepth || 60);

  // Form Client Info
  const [designNotes, setDesignNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sync state when props, categories, or parameter settings update dynamically in Admin
  useEffect(() => {
    if (propsProducts && propsProducts.length > 0) {
      setAllProducts(propsProducts);
    }
  }, [propsProducts]);

  useEffect(() => {
    const handleCategoryUpdate = () => {
      const updatedCats = getStoredCategories();
      setCategoriesDef(updatedCats);
    };

    const handleParamUpdate = () => {
      const updatedMats = getStoredMaterials();
      const updatedParams = getStoredParameterSettings();
      setMaterialsList(updatedMats);
      setParamSettings(updatedParams);
    };

    window.addEventListener('category_data_updated', handleCategoryUpdate);
    window.addEventListener('custom_production_data_updated', handleParamUpdate);
    window.addEventListener('parameters_data_updated', handleParamUpdate);

    return () => {
      window.removeEventListener('category_data_updated', handleCategoryUpdate);
      window.removeEventListener('custom_production_data_updated', handleParamUpdate);
      window.removeEventListener('parameters_data_updated', handleParamUpdate);
    };
  }, []);

  // Update SubCategory dropdown when Main Category changes
  useEffect(() => {
    if (activeSubCategories.length > 0) {
      const exists = activeSubCategories.some(s => s.name === selectedSubCat);
      if (!exists) {
        setSelectedSubCat(activeSubCategories[0].name);
      }
    } else {
      setSelectedSubCat('');
    }
  }, [selectedMainCat, categoriesDef]);

  // Available Products for selected Category + SubCategory
  const availableProducts = allProducts.filter(p => {
    const matchesCat = p.category === selectedMainCat;
    const matchesSub = !selectedSubCat || p.subCategory === selectedSubCat;
    return matchesCat && matchesSub && !p.isHidden;
  });

  // Update selectedProduct when availableProducts change
  useEffect(() => {
    if (availableProducts.length > 0) {
      setSelectedProduct(availableProducts[0].name);
    } else {
      setSelectedProduct('Diğer (Ürünü Yazınız)');
    }
  }, [selectedMainCat, selectedSubCat, allProducts.length]);

  const finalProductName = selectedProduct === 'Diğer (Ürünü Yazınız)'
    ? (manualProductName.trim() || 'Özel Üretim Mobilya')
    : selectedProduct;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const messageText = `Merhaba Nuri Usta (Çat Kapı), web sitenizdeki "Özel Üretim İmalat Formu" üzerinden bir özel sipariş talebi hazırladım:\n\n` +
      `*Müşteri Adı:* ${clientName}\n` +
      `*İletişim:* ${clientPhone}\n` +
      `*Ana Kategori:* ${selectedMainCat}\n` +
      `*Alt Kategori:* ${selectedSubCat || 'Genel'}\n` +
      `*Seçilen Ürün:* ${finalProductName}\n` +
      `*Seçilen Malzeme:* ${selectedMaterial}\n` +
      `*Ölçüler:* En: ${width} cm | Boy: ${height} cm | Derinlik: ${depth} cm\n` +
      `*Tasarım Notları/Dilekler:* ${designNotes || 'Belirtilmedi.'}\n\n` +
      `Mersin içi ücretsiz keşif ölçümü, termin planlaması ve fiyatlandırma hakkında görüşmek istiyorum.`;

    const whatsAppUrl = `https://wa.me/905352194789?text=${encodeURIComponent(messageText)}`;
    
    setTimeout(() => {
      window.open(whatsAppUrl, '_blank');
    }, 1200);
  };

  return (
    <section id="custom-production-section" className="w-full bg-[#111111] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Clean Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
            Özel Üretim İmalat Talep Sayfası
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            Çat Kapı, standart ölçülerin sınırlarına sıkışmak istemeyenler için butik üretim yapar. Hayalinizdeki mobilyayı veya kapıyı milimetrik olarak üretiyoruz. Parametreleri seçerek doğrudan zanaatkarımız Nuri Bey'e imalat talebi gönderebilirsiniz.
          </p>
        </div>

        {/* Main Form Fields */}
        <div className="bg-[#161616] border border-stone-850 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h3 className="text-lg font-bold text-white border-b border-stone-800 pb-3 mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ruler className="text-amber-500" size={18} />
              <span>İmalat Parametreleri</span>
            </span>
            <span className="text-[10px] text-amber-500 font-mono font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
              Güncel Yazılım
            </span>
          </h3>

          {submitted ? (
            <div className="text-center py-12 px-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-6">
              <CheckCircle size={48} className="text-emerald-500 mx-auto animate-pulse" />
              <h4 className="text-xl font-bold text-white">İmalat Talebiniz Başarıyla Hazırlandı!</h4>
              <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                İsim, ebat, kategori, alt kategori, ürün ve malzeme detaylarınız Nuri Usta'nın WhatsApp hattına yönlendiriliyor. Açılacak pencerede 'Gönder' butonuna basmanız yeterlidir.
              </p>
              <div className="pt-2">
                <div className="inline-block bg-emerald-900/40 text-emerald-400 text-[11px] font-mono px-3.5 py-1.5 rounded-lg border border-emerald-500/30">
                  ● WhatsApp Aktif Giden Bağlantı Tetiklendi
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1, 2, 3: CATEGORY -> SUB-CATEGORY -> PRODUCT SELECTION */}
              <div className="space-y-4 p-4 bg-[#111111] border border-stone-800 rounded-2xl">
                <label className="block text-amber-400 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} />
                  <span>Kategori &amp; Ürün Seçimi</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Step 1: Main Category */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-stone-400 font-bold block">1. Adım: Kategori</span>
                    <select
                      value={selectedMainCat}
                      onChange={(e) => setSelectedMainCat(e.target.value)}
                      className="w-full bg-[#181818] border border-stone-750 focus:border-amber-500 text-white font-bold px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer"
                    >
                      {categoriesDef.filter(c => c.isActive !== false).map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Sub-Category */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-stone-400 font-bold block">2. Adım: Alt Kategori</span>
                    <select
                      value={selectedSubCat}
                      onChange={(e) => setSelectedSubCat(e.target.value)}
                      className="w-full bg-[#181818] border border-stone-750 focus:border-amber-500 text-stone-200 font-bold px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer"
                    >
                      {activeSubCategories.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                      {activeSubCategories.length === 0 && (
                        <option value="">Genel Alt Kategori</option>
                      )}
                    </select>
                  </div>

                  {/* Step 3: Product Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-stone-400 font-bold block">3. Adım: Ürün Seçimi</span>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full bg-[#181818] border border-stone-750 focus:border-amber-500 text-amber-400 font-extrabold px-3 py-2.5 rounded-xl text-xs outline-none cursor-pointer"
                    >
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      <option value="Diğer (Ürünü Yazınız)">Diğer (Ürünü Yazınız)</option>
                    </select>
                  </div>

                </div>

                {/* Manual Product Name Entry Field */}
                {(selectedProduct === 'Diğer (Ürünü Yazınız)' || availableProducts.length === 0) && (
                  <div className="pt-2 space-y-1.5 border-t border-stone-850">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Edit3 size={13} />
                      <span>Ürün Adını Yazınız:</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Örn: Özel Tasarım Sürgülü Vestiyer veya CNC Camlı Kapı..."
                      value={manualProductName}
                      onChange={(e) => setManualProductName(e.target.value)}
                      className="w-full bg-[#181818] border border-amber-500/50 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                )}

              </div>

              {/* MATERIAL SELECTION (Suntalam completely removed) */}
              <div className="space-y-2 p-4 bg-[#111111] border border-stone-800 rounded-2xl">
                <label className="block text-amber-400 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} />
                  <span>İmalat Malzemesi</span>
                </label>

                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-[#181818] border border-stone-750 focus:border-amber-500 text-stone-200 font-bold px-4 py-3 rounded-xl text-xs outline-none cursor-pointer"
                >
                  {materialsList.map((mat) => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* DIMENSION SLIDERS */}
              <div className="space-y-4 p-4 bg-[#111111] border border-stone-800 rounded-2xl">
                <label className="block text-stone-300 text-xs font-bold uppercase tracking-wider">
                  Ölçü Seçimi (Cm Cinsinden)
                </label>

                {/* Width slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-300 font-bold font-mono">
                    <span>GENİŞLİK (EN):</span>
                    <span className="text-amber-500 font-extrabold">{width} cm</span>
                  </div>
                  <input
                    type="range"
                    min={limits.minWidth || 40}
                    max={limits.maxWidth || 1200}
                    step={5}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Height slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-300 font-bold font-mono">
                    <span>YÜKSEKLİK (BOY):</span>
                    <span className="text-amber-500 font-extrabold">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min={limits.minHeight || 70}
                    max={limits.maxHeight || 350}
                    step={5}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Depth slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-300 font-bold font-mono">
                    <span>DERİNLİK:</span>
                    <span className="text-amber-500 font-extrabold">{depth} cm</span>
                  </div>
                  <input
                    type="range"
                    min={limits.minDepth || 10}
                    max={limits.maxDepth || 150}
                    step={5}
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* DESIGN NOTES */}
              <div className="space-y-2">
                <label className="block text-stone-300 text-xs font-bold uppercase tracking-wider">
                  Özel İstekleriniz &amp; Notlar
                </label>
                <textarea
                  rows={3}
                  placeholder="Örn: Kulpsuz gizli profil kulp isteniyor. İki kapaklı sürgülü sistem ve frenli menteşe monte edilmesini rica ediyorum..."
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-stone-200 px-4 py-3 rounded-xl text-xs outline-none"
                />
              </div>

              {/* CONTACT DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-800">
                <div className="space-y-1.5">
                  <label className="text-stone-300 text-xs font-bold uppercase block">Adınız Soyadınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn. Selen Uçar"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-stone-200 px-4 py-3 rounded-xl text-xs outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-300 text-xs font-bold uppercase block">İletişim Telefon No *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Örn. 0535 000 00 00"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-stone-200 px-4 py-3 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-xl flex items-center justify-center cursor-pointer"
              >
                <MessageCircle size={16} className="mr-2" />
                İmalat İsteğini Nuri Usta'ya Gönder (WhatsApp)
              </button>
            </form>
          )}

        </div>
      </div>
    </section>
  );
}
