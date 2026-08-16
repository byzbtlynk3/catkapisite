import React, { useState, useMemo, useEffect } from 'react';
import Studio3DRenderer from './Studio3DRenderer';
import { 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft, 
  Sliders, 
  Palette, 
  Layers, 
  Sun,
  FileText,
  Clock,
  Trash2
} from 'lucide-react';
import { 
  getStored3DConfig, 
  Studio3DConfig, 
  Studio3DCategoryConfig, 
  Studio3DColor, 
  Studio3DLedColor 
} from '../lib/studio3DDefaults';
import { MAIN_CATEGORIES_STRUCTURE } from '../lib/categoryData';
import AccordionCategoryList from './AccordionCategoryList';

export interface SmartDrawingStudioProps {
  products?: any[];
  onNavigateTab?: (tab: string) => void;
}

interface PlacedPart {
  id: string;
  type: string;
  name: string;
  section: 'left' | 'center' | 'right' | 'top' | 'bottom';
  heightOffsetCm: number;
}

export default function SmartDrawingStudio({ products = [], onNavigateTab }: SmartDrawingStudioProps) {
  // 1. DYNAMIC STORED CONFIGURATION
  const [studioConfig, setStudioConfig] = useState<Studio3DConfig>(getStored3DConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setStudioConfig(getStored3DConfig());
    };
    window.addEventListener('catkapi_3d_config_updated', handleUpdate);
    return () => window.removeEventListener('catkapi_3d_config_updated', handleUpdate);
  }, []);

  // Filter Active Categories & Sort by Order
  const activeCategoriesList = useMemo(() => {
    return (studioConfig.categories || [])
      .filter(c => c.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [studioConfig]);

  // Color options & LED options from dynamic config
  const colorCardsList = useMemo(() => studioConfig.colors || [], [studioConfig]);
  const ledColorsList = useMemo(() => studioConfig.ledColors || [], [studioConfig]);

  // 2. ACTIVE SELECTED CATEGORY & MAIN CATEGORY
  const [selectedMainCatName, setSelectedMainCatName] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return activeCategoriesList.find(c => c.id === selectedCategoryId || c.name.toLowerCase() === selectedCategoryId.toLowerCase()) || {
      id: selectedCategoryId,
      name: selectedCategoryId,
      meshType: selectedCategoryId.includes('gardırop') || selectedCategoryId.includes('wardrobe') ? 'wardrobe' :
                selectedCategoryId.includes('mutfak') ? 'kitchen' :
                selectedCategoryId.includes('banyo') ? 'bathroom' :
                selectedCategoryId.includes('kapı') ? 'door' :
                selectedCategoryId.includes('çelik') ? 'steel-door' :
                selectedCategoryId.includes('vestiyer') ? 'vestiyer' :
                selectedCategoryId.includes('tv') ? 'tv-unit' :
                selectedCategoryId.includes('kitap') ? 'bookshelf' :
                selectedCategoryId.includes('masa') ? 'desk' :
                selectedCategoryId.includes('kahve') ? 'coffee-corner' :
                selectedCategoryId.includes('duş') ? 'shower' :
                selectedCategoryId.includes('lavabo') ? 'sink' :
                selectedCategoryId.includes('klozet') ? 'toilet' :
                selectedCategoryId.includes('parke') || selectedCategoryId.includes('fayans') ? 'flooring' :
                selectedCategoryId.includes('tezgah') || selectedCategoryId.includes('mermer') ? 'countertop' : 'wardrobe',
      defaultCm: { w: 220, h: 210, d: 55, t: 2 },
      basePrice: 24500,
      isActive: true,
      materials: [
        { name: 'Sayerlack İpek Mat Lake', mult: 1.35 },
        { name: 'MDF Lam (Çizilmez)', mult: 1.0 },
        { name: 'Akrilik High Gloss', mult: 1.25 },
        { name: 'Doğal Ahşap Kaplama', mult: 1.5 }
      ],
      hardware: [
        { type: 'door', name: 'Menteşeli Kapak' },
        { type: 'sliding-door', name: 'Sürgülü Kapak' },
        { type: 'drawer-soft', name: 'Frenli Çekmece' },
        { type: 'shelf', name: 'Sabit Raf' },
        { type: 'hanger-long', name: 'Elbise Askılığı' }
      ],
      unitPrices: {
        govde: 8500, kapak: 1800, cekmece: 1200, raf: 650, askilik: 450,
        led: 1200, camKapak: 2800, kulp: 150, raySistemi: 850, montaj: 2500, iscilik: 3500
      }
    };
  }, [activeCategoriesList, selectedCategoryId]);

  // 3. DIMENSIONS & UNIT SYSTEM (cm / mm)
  const [unit, setUnit] = useState<'cm' | 'mm'>('cm');
  const [dimWidth, setDimWidth] = useState<number>(240);
  const [dimHeight, setDimHeight] = useState<number>(220);
  const [dimDepth, setDimDepth] = useState<number>(60);

  // 4. MATERIAL & COLOR CARDS
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<Studio3DColor>(colorCardsList[0] || { id: 'white', name: 'Kuzey Mat Beyaz', hex: '#F9FAF9' });

  // 5. LED LIGHTING CONTROLS
  const [hasLedLighting, setHasLedLighting] = useState<boolean>(true);
  const [selectedLedColorName, setSelectedLedColorName] = useState<string>('Gün Işığı');

  const selectedLedObj = useMemo(() => {
    return ledColorsList.find(l => l.name === selectedLedColorName) || ledColorsList[0] || { name: 'Gün Işığı', hex: '#FFD580' };
  }, [ledColorsList, selectedLedColorName]);

  // Sync default dimensions, materials, and default parts when category changes
  useEffect(() => {
    if (activeCategory) {
      if (unit === 'cm') {
        setDimWidth(activeCategory.defaultCm?.w || 200);
        setDimHeight(activeCategory.defaultCm?.h || 200);
        setDimDepth(activeCategory.defaultCm?.d || 50);
      } else {
        setDimWidth((activeCategory.defaultCm?.w || 200) * 10);
        setDimHeight((activeCategory.defaultCm?.h || 200) * 10);
        setDimDepth((activeCategory.defaultCm?.d || 50) * 10);
      }

      if (activeCategory.materials && activeCategory.materials.length > 0) {
        setSelectedMaterial(activeCategory.materials[0].name);
      } else {
        setSelectedMaterial('MDF Lam');
      }

      // Default realistic parts initialization
      if (['wardrobe', 'bookshelf', 'vestiyer', 'pantry'].includes(activeCategory.id)) {
        setPlacedParts([
          { id: '1', type: 'shelf', name: 'Sabit Raf', section: 'left', heightOffsetCm: 60 },
          { id: '2', type: 'shelf', name: 'Sabit Raf', section: 'left', heightOffsetCm: 120 },
          { id: '3', type: 'hanger-long', name: 'Uzun Askılık', section: 'center', heightOffsetCm: 170 },
          { id: '4', type: 'drawer-soft', name: 'Frenli Çekmece', section: 'bottom', heightOffsetCm: 30 }
        ]);
      } else if (activeCategory.id === 'kitchen') {
        setPlacedParts([
          { id: 'k1', type: 'top-cabinet', name: 'Üst Dolap Modülü', section: 'top', heightOffsetCm: 180 },
          { id: 'k2', type: 'sink-cut', name: 'Ankastre Evye Boşluğu', section: 'center', heightOffsetCm: 85 },
          { id: 'k3', type: 'drawer-soft', name: 'Frenli Çekmece', section: 'bottom', heightOffsetCm: 40 }
        ]);
      } else if (activeCategory.id === 'coffee-corner') {
        setPlacedParts([
          { id: 'cc1', type: 'bottom-cabinet', name: 'Alt Dolap', section: 'bottom', heightOffsetCm: 40 },
          { id: 'cc2', type: 'coffee-nook', name: 'Kahve Makinesi Bölümü', section: 'center', heightOffsetCm: 90 },
          { id: 'cc3', type: 'cup-rack', name: 'Fincan Rafı', section: 'top', heightOffsetCm: 150 },
          { id: 'cc4', type: 'open-shelf', name: 'Açık Raf Sistemi', section: 'right', heightOffsetCm: 120 }
        ]);
      } else if (activeCategory.id === 'shower') {
        setPlacedParts([
          { id: 's1', type: 'glass-clear', name: 'Şeffaf Cam', section: 'center', heightOffsetCm: 100 },
          { id: 's2', type: 'profile-black', name: 'Mat Siyah Profil', section: 'left', heightOffsetCm: 100 }
        ]);
      } else {
        setPlacedParts([
          { id: 'm1', type: 'shelf', name: 'Sabit Raf', section: 'center', heightOffsetCm: 80 }
        ]);
      }
    }
  }, [activeCategory]);

  useEffect(() => {
    if (colorCardsList.length > 0 && !colorCardsList.find(c => c.id === selectedColor.id)) {
      setSelectedColor(colorCardsList[0]);
    }
  }, [colorCardsList]);

  const toggleUnit = (newUnit: 'cm' | 'mm') => {
    if (newUnit === unit) return;
    if (newUnit === 'mm') {
      setDimWidth(prev => Math.round(prev * 10));
      setDimHeight(prev => Math.round(prev * 10));
      setDimDepth(prev => Math.round(prev * 10));
    } else {
      setDimWidth(prev => Math.round(prev / 10));
      setDimHeight(prev => Math.round(prev / 10));
      setDimDepth(prev => Math.round(prev / 10));
    }
    setUnit(newUnit);
  };

  // 3D MODEL VIEWPORT CONTROLS
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [elevationAngle, setElevationAngle] = useState<number>(10);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isOpenDoors, setIsOpenDoors] = useState<boolean>(false);

  // MODULAR PARTS PLACED ON 3D MODEL
  const [placedParts, setPlacedParts] = useState<PlacedPart[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [targetSection, setTargetSection] = useState<'left' | 'center' | 'right' | 'top' | 'bottom'>('center');

  // ADD PART TO 3D MODEL
  const handleAddPartToModel = (libItem: { type: string; name: string }) => {
    const newPart: PlacedPart = {
      id: 'part_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: libItem.type,
      name: libItem.name,
      section: targetSection,
      heightOffsetCm: Math.round(Math.random() * 120 + 30)
    };
    setPlacedParts(prev => [...prev, newPart]);
    setSelectedPartId(newPart.id);
  };

  // ESTIMATED PRICE CALCULATION USING DYNAMIC UNIT PRICES
  const estimatedPrice = useMemo(() => {
    if (!activeCategory) return 0;
    const unitPrices = activeCategory.unitPrices || {
      govde: 8500, kapak: 1800, cekmece: 1200, raf: 650, askilik: 450,
      led: 1200, camKapak: 2800, kulp: 150, raySistemi: 850, montaj: 2500, iscilik: 3500
    };

    const catMaterials = activeCategory.materials && activeCategory.materials.length > 0
      ? activeCategory.materials
      : [{ name: selectedMaterial, mult: 1.0 }];

    const matObj = catMaterials.find(m => m.name === selectedMaterial) || catMaterials[0];

    const wMeter = unit === 'cm' ? dimWidth / 100 : dimWidth / 1000;
    const hMeter = unit === 'cm' ? dimHeight / 100 : dimHeight / 1000;
    const defWMeter = (activeCategory.defaultCm?.w || 200) / 100;
    const defHMeter = (activeCategory.defaultCm?.h || 200) / 100;

    const volRatio = (wMeter * hMeter) / (defWMeter * defHMeter);
    
    let partsCost = 0;
    placedParts.forEach(p => {
      if (p.type.includes('drawer')) partsCost += unitPrices.cekmece;
      else if (p.type.includes('shelf') || p.type.includes('rack')) partsCost += unitPrices.raf;
      else if (p.type.includes('glass')) partsCost += unitPrices.camKapak;
      else if (p.type.includes('hanger')) partsCost += unitPrices.askilik;
      else if (p.type.includes('door')) partsCost += unitPrices.kapak;
      else partsCost += unitPrices.raf;
    });

    const ledCost = hasLedLighting ? unitPrices.led : 0;
    const govdeCost = unitPrices.govde * Math.max(0.4, volRatio);
    const fixedCost = (unitPrices.montaj || 0) + (unitPrices.iscilik || 0);

    const total = (govdeCost * (matObj?.mult || 1.0)) + partsCost + ledCost + fixedCost;
    return Math.round(total / 100) * 100;
  }, [activeCategory, selectedMaterial, dimWidth, dimHeight, unit, placedParts, hasLedLighting]);

  const handleRemovePart = (id: string) => {
    setPlacedParts(prev => prev.filter(p => p.id !== id));
    if (selectedPartId === id) setSelectedPartId(null);
  };

  const summaryData = useMemo(() => {
    const doors = placedParts.filter(p => p.type.includes('door') || p.type.includes('kapak'));
    const drawers = placedParts.filter(p => p.type.includes('drawer') || p.type.includes('cekmece'));
    const shelves = placedParts.filter(p => p.type.includes('shelf') || p.type.includes('raf') || p.type.includes('rack'));
    const glass = placedParts.filter(p => p.type.includes('glass') || p.type.includes('cam'));
    const accessories = placedParts.filter(p => !p.type.includes('door') && !p.type.includes('drawer') && !p.type.includes('shelf') && !p.type.includes('glass'));

    return {
      categoryName: activeCategory ? activeCategory.name : '-',
      unitStr: unit,
      widthStr: `${dimWidth} ${unit}`,
      heightStr: `${dimHeight} ${unit}`,
      depthStr: `${dimDepth} ${unit}`,
      materialStr: selectedMaterial || 'MDF Lam',
      colorStr: selectedColor.name,
      ledStatus: hasLedLighting ? 'Açık' : 'Kapalı',
      ledColor: hasLedLighting ? selectedLedColorName : 'Yok',
      doorCount: doors.length,
      doorModel: doors.length > 0 ? 'İpek Mat Lake / Entegre Kapak' : (['wardrobe', 'kitchen', 'vestiyer', 'pantry'].includes(activeCategory?.id || '') ? 'Standart Menteşeli Kapak' : 'Kapak Yok'),
      drawerCount: drawers.length,
      drawerSystem: drawers.length > 0 ? 'Frenli Sürgü Ray Sistem' : 'Standart Ray',
      shelfCount: shelves.length,
      glassOption: glass.length > 0 ? 'Temperli / Füme Cam Kapak' : 'Cam Yok',
      handleModel: 'Alüminyum Gola Profil / Gizli Kulp',
      accessoriesList: accessories.length > 0 ? accessories.map(a => a.name).join(', ') : 'Standart Aksesuar Seti',
      priceStr: `₺${estimatedPrice.toLocaleString('tr-TR')}`,
      lastUpdate: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }, [activeCategory, unit, dimWidth, dimHeight, dimDepth, selectedMaterial, selectedColor, hasLedLighting, selectedLedColorName, placedParts, estimatedPrice]);

  return (
    <div id="smart-3d-design-center" className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 text-stone-100">
      
      {/* 1. KATEGORİ VE ALT KATEGORİ SEÇİM SÜRECİ (AKORDİYON LİSTE SİSTEMİ) */}
      {!selectedCategoryId && (
        <div className="space-y-6 py-6 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[10px] uppercase tracking-widest rounded-md">
              3D GERÇEK ZAMANLI MODEL SİSTEMİ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-sans">
              Tasarlamak İstediğiniz Kategoriyi Seçin
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm">
              Çat Kapı Mimarisi ile seçtiğiniz her kategori kendine özel 3D canlı model, ölçü parametreleri ve malzeme kartları ile açılır.
            </p>
          </div>

          <AccordionCategoryList
            onSelectCategory={(mainCatName, subCatName) => {
              setSelectedCategoryId(subCatName || mainCatName);
            }}
            showAllOption={false}
            searchPlaceholder="3D Stüdyoda tasarlamak istediğiniz ürünü arayın..."
          />
        </div>
      )}

      {/* 2. 3D TASARIM EKRANI (ÜÇ BÖLÜM: SOL PANEL | ORTA MODEL ALANI | SAĞ DONANIM LİSTESİ) */}
      {selectedCategoryId && activeCategory && (
        <div className="space-y-4">
          
          {/* TOP BAR TOOLBAR (Sadeleştirilmiş - Başlık, AI Analiz ve WhatsApp kaldırıldı) */}
          <div className="bg-[#181818] border border-stone-800 rounded-2xl p-3 flex items-center justify-between shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Kategori Değiştir</span>
            </button>

            <div className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">
              ÇAT KAPI 3D STÜDYO • {activeCategory.name.toUpperCase()}
            </div>
          </div>

          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* ------------------------------------------------------------- */}
            {/* SOL AYAR PANELİ (Sıralama: 1. Ölçüler -> 2. Malzeme -> 3. Renk -> 4. LED -> 5. Donanımlar) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-3.5">
              
              {/* 1. ÖLÇÜLER */}
              <div className="bg-[#181818] border border-stone-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sliders size={14} />
                    <span>1. Ölçüler ({unit})</span>
                  </h3>

                  {/* BİRİM DEĞİŞTİRİCİ */}
                  <div className="flex items-center bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => toggleUnit('cm')}
                      className={`px-2 py-0.5 rounded font-bold ${unit === 'cm' ? 'bg-amber-500 text-black' : 'text-stone-400'}`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleUnit('mm')}
                      className={`px-2 py-0.5 rounded font-bold ${unit === 'mm' ? 'bg-amber-500 text-black' : 'text-stone-400'}`}
                    >
                      mm
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-stone-400 text-[10px] block mb-1 font-bold">Genişlik</label>
                    <input
                      type="number"
                      value={dimWidth}
                      onChange={(e) => setDimWidth(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2 py-1.5 text-white font-mono font-bold focus:border-amber-500 outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 text-[10px] block mb-1 font-bold">Yükseklik</label>
                    <input
                      type="number"
                      value={dimHeight}
                      onChange={(e) => setDimHeight(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2 py-1.5 text-white font-mono font-bold focus:border-amber-500 outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 text-[10px] block mb-1 font-bold">Derinlik</label>
                    <input
                      type="number"
                      value={dimDepth}
                      onChange={(e) => setDimDepth(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2 py-1.5 text-white font-mono font-bold focus:border-amber-500 outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* 2. MALZEME TÜRÜ */}
              <div className="bg-[#181818] border border-stone-800 rounded-2xl p-4 shadow-xl space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-stone-800 pb-2">
                  <Palette size={14} />
                  <span>2. Malzeme Türü</span>
                </h3>

                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-amber-500 outline-none cursor-pointer"
                >
                  {(activeCategory.materials && activeCategory.materials.length > 0 ? activeCategory.materials : [{ name: 'MDF Lam', mult: 1.0 }]).map(m => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. RENK */}
              <div className="bg-[#181818] border border-stone-800 rounded-2xl p-4 shadow-xl space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-stone-800 pb-2">
                  3. Renk
                </h3>

                <div className="grid grid-cols-4 gap-1.5">
                  {colorCardsList.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`p-1.5 rounded-xl border text-center text-[9px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        selectedColor.id === c.id ? 'border-amber-400 bg-stone-900 text-white ring-2 ring-amber-400/40' : 'border-stone-800 bg-stone-950 text-stone-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full border border-stone-600 shadow-inner" style={{ backgroundColor: c.hex }} />
                      <span className="truncate w-full">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. LED AYDINLATMA (AÇIK/KAPALI TOGGLE + AÇILIR RENK SEÇİM KUTUSU) */}
              <div className="bg-[#181818] border border-stone-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sun size={14} />
                    <span>4. LED Aydınlatma</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => setHasLedLighting(!hasLedLighting)}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                      hasLedLighting ? 'bg-amber-500 text-black shadow' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {hasLedLighting ? 'AÇIK' : 'KAPALI'}
                  </button>
                </div>

                {hasLedLighting && (
                  <div>
                    <label className="text-stone-400 text-[10px] font-bold block mb-1">LED Rengi Seçimi</label>
                    <select
                      value={selectedLedColorName}
                      onChange={(e) => setSelectedLedColorName(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-amber-500 outline-none cursor-pointer"
                    >
                      {ledColorsList.map((l) => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 5. MODÜLER DONANIMLAR (SADE SADE KURUMSAL METİN - TAMAMEN EMOJİSİZ) */}
              <div className="bg-[#181818] border border-stone-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers size={14} />
                    <span>5. Modüler Donanımlar</span>
                  </h3>
                </div>

                {/* HEDEF BÖLME SEÇİMİ */}
                <div className="flex items-center justify-between bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-[10px]">
                  <span className="text-stone-400 font-bold px-1">Hedef Bölme:</span>
                  {[
                    { id: 'left', label: 'Sol' },
                    { id: 'center', label: 'Orta' },
                    { id: 'right', label: 'Sağ' }
                  ].map(sec => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setTargetSection(sec.id as any)}
                      className={`px-2.5 py-0.5 rounded-lg font-bold transition-all ${
                        targetSection === sec.id ? 'bg-amber-500 text-black' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>

                {/* KATEGORİYE ÖZEL PARÇA LİSTESİ (TAMAMEN EMOJİSİZ KURUMSAL) */}
                <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {(activeCategory.hardware && activeCategory.hardware.length > 0 ? activeCategory.hardware : [
                    { type: 'shelf', name: 'Sabit Raf' },
                    { type: 'drawer-soft', name: 'Frenli Çekmece' },
                    { type: 'door', name: 'Menteşeli Kapak' }
                  ]).map((item) => (
                    <button
                      key={item.type + item.name}
                      type="button"
                      onClick={() => handleAddPartToModel(item)}
                      className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-400 text-stone-200 rounded-xl transition-all cursor-pointer flex items-center justify-between text-left group shadow"
                    >
                      <span className="text-xs font-bold text-amber-300 group-hover:text-amber-400">{item.name}</span>
                      <span className="text-[10px] text-stone-500 font-mono font-bold">+ Ekle</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* ORTA MODEL ALANI (CENTER AREA - 3D CANVAS VIEWPORT)          */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-6 space-y-3">
              <div className="bg-[#141414] border border-stone-800 rounded-3xl p-4 shadow-2xl relative space-y-3">
                
                {/* 3D VIEWPORT HEADER BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-900 p-2.5 rounded-2xl border border-stone-800 text-xs">
                  
                  {/* VIEW ANGLE PRESETS */}
                  <div className="flex items-center space-x-1 font-mono text-[11px]">
                    <span className="text-stone-500 px-1 font-bold">AÇI:</span>
                    {[
                      { label: 'Ön (0°)', a: 0 },
                      { label: 'Sol (-30°)', a: -30 },
                      { label: 'Sağ (30°)', a: 30 },
                      { label: 'Yan (-60°)', a: -60 }
                    ].map(item => (
                      <button
                        key={item.a}
                        type="button"
                        onClick={() => setRotationAngle(item.a)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          rotationAngle === item.a ? 'bg-amber-500 text-black shadow' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* DOOR & DRAWER ANIMATED OPEN/CLOSE TOGGLE */}
                  <button
                    type="button"
                    onClick={() => setIsOpenDoors(!isOpenDoors)}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                      isOpenDoors ? 'bg-amber-500 text-black shadow-lg' : 'bg-stone-800 text-stone-300 hover:text-white'
                    }`}
                  >
                    {isOpenDoors ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{isOpenDoors ? 'Kapakları Kapat' : 'İçini Gör (Aç)'}</span>
                  </button>
                </div>

                {/* REALTIME 3D CANVAS VIEWPORT (KATEGORİYE ÖZEL 3D DİNAMİK MODEL) */}
                <Studio3DRenderer
                  activeCategory={activeCategory}
                  selectedColor={selectedColor}
                  selectedMaterial={selectedMaterial}
                  unit={unit}
                  dimWidth={dimWidth}
                  dimHeight={dimHeight}
                  dimDepth={dimDepth}
                  hasLedLighting={hasLedLighting}
                  selectedLedObj={selectedLedObj}
                  isOpenDoors={isOpenDoors}
                  placedParts={placedParts}
                  selectedPartId={selectedPartId}
                  onSelectPart={setSelectedPartId}
                  rotationAngle={rotationAngle}
                  elevationAngle={elevationAngle}
                  zoomLevel={zoomLevel}
                />

                {/* ZOOM CONTROLS FOOTER */}
                <div className="flex items-center justify-between bg-stone-900 p-2 rounded-xl border border-stone-800 text-xs text-stone-400">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.4))} className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-white">
                      <ZoomIn size={14} />
                    </button>
                    <button onClick={() => setZoomLevel(1)} className="px-2 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg text-white text-[10px] font-mono">
                      %100
                    </button>
                    <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.7))} className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-white">
                      <ZoomOut size={14} />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 font-mono text-xs">
                    <span className="text-amber-400 font-bold">Tahmini Tutar: ₺{estimatedPrice.toLocaleString('tr-TR')}</span>
                    <span className="text-stone-400">Ölçü: {dimWidth}x{dimHeight}x{dimDepth} {unit}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SAĞ PANEL: TASARIM ÖZETİ (DESIGN SUMMARY - REALTIME UPDATING) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-3 space-y-3.5">
              <div className="bg-[#181818] border border-amber-500/30 rounded-2xl p-4 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-amber-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">Tasarım Özeti</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                    Anlık Canlı
                  </span>
                </div>

                {/* Summary Details */}
                <div className="space-y-2 text-xs text-stone-300 divide-y divide-stone-800/60">
                  
                  {/* Category */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-stone-400 text-[11px]">Kategori:</span>
                    <span className="font-bold text-amber-400">{summaryData.categoryName}</span>
                  </div>

                  {/* Dimensions & Unit */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Ölçü Birimi:</span>
                    <span className="font-mono font-bold text-stone-200 uppercase">{summaryData.unitStr}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Genişlik (En):</span>
                    <span className="font-mono font-bold text-stone-100">{summaryData.widthStr}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Yükseklik (Boy):</span>
                    <span className="font-mono font-bold text-stone-100">{summaryData.heightStr}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Derinlik:</span>
                    <span className="font-mono font-bold text-stone-100">{summaryData.depthStr}</span>
                  </div>

                  {/* Material & Color */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Malzeme Türü:</span>
                    <span className="font-bold text-stone-200 text-[11px] truncate max-w-[130px] text-right">{summaryData.materialStr}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Renk Kartelası:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 rounded-full border border-stone-600 inline-block" style={{ backgroundColor: selectedColor.hex }} />
                      <span className="font-bold text-stone-200 text-[11px]">{summaryData.colorStr}</span>
                    </div>
                  </div>

                  {/* LED Info */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">LED Aydınlatma:</span>
                    <span className={`font-bold ${hasLedLighting ? 'text-amber-400' : 'text-stone-500'}`}>{summaryData.ledStatus}</span>
                  </div>

                  {hasLedLighting && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-stone-400 text-[11px]">LED Rengi:</span>
                      <span className="font-bold text-amber-300">{summaryData.ledColor}</span>
                    </div>
                  )}

                  {/* Hardware / Parts Breakdown */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Eklenen Kapak:</span>
                    <span className="font-mono font-bold text-stone-200">{summaryData.doorCount} Adet</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Kapak Modeli:</span>
                    <span className="font-bold text-stone-300 text-[10px] truncate max-w-[130px] text-right">{summaryData.doorModel}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Eklenen Çekmece:</span>
                    <span className="font-mono font-bold text-stone-200">{summaryData.drawerCount} Adet</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Çekmece Sistemi:</span>
                    <span className="font-bold text-stone-300 text-[10px] truncate max-w-[130px] text-right">{summaryData.drawerSystem}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Eklenen Raf:</span>
                    <span className="font-mono font-bold text-stone-200">{summaryData.shelfCount} Adet</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Cam Seçenekleri:</span>
                    <span className="font-bold text-stone-300 text-[10px] truncate max-w-[130px] text-right">{summaryData.glassOption}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Kulp Modeli:</span>
                    <span className="font-bold text-stone-300 text-[10px] truncate max-w-[130px] text-right">{summaryData.handleModel}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-stone-400 text-[11px]">Aksesuarlar:</span>
                    <span className="font-bold text-stone-300 text-[10px] truncate max-w-[130px] text-right">{summaryData.accessoriesList}</span>
                  </div>

                </div>

                {/* PLACED PARTS MANAGE LIST (REMOVE INDIVIDUAL PARTS) */}
                {placedParts.length > 0 && (
                  <div className="pt-2 border-t border-stone-800">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Eklenen Donanım Parçaları ({placedParts.length}):
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {placedParts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-1.5 bg-stone-900 border border-stone-800 rounded-xl text-[11px]"
                        >
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="text-amber-400 font-bold">•</span>
                            <span className="text-stone-200 font-medium truncate">{p.name}</span>
                            <span className="text-[9px] font-mono text-stone-500">({p.section})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(p.id)}
                            className="p-1 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded transition-colors cursor-pointer"
                            title="Parçayı Çıkar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRICE & LAST UPDATE */}
                <div className="pt-3 border-t-2 border-stone-800 space-y-2">
                  <div className="bg-stone-950 p-3 rounded-xl border border-amber-500/40 text-center">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block tracking-wider mb-1">
                      Tahmini Toplam Fiyat
                    </span>
                    <span className="text-xl font-black text-amber-400 font-mono">
                      {summaryData.priceStr}
                    </span>
                    <span className="block text-[9px] text-stone-500 mt-1">KDV ve Montaj Dahil Atölye Tahmini</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-stone-400" />
                      Son Güncelleme:
                    </span>
                    <span className="text-stone-300 font-bold">{summaryData.lastUpdate}</span>
                  </div>
                </div>

                {/* DIRECT WHATSAPP ACTION BUTTON */}
                <a
                  href={`https://wa.me/905352194789?text=${encodeURIComponent(
                    `Merhaba Nuri Usta (Çat Kapı), 3D Tasarım Stüdyosunda bir tasarım hazırladım:\n\n` +
                    `*Kategori:* ${summaryData.categoryName}\n` +
                    `*Ölçüler:* ${summaryData.widthStr} x ${summaryData.heightStr} x ${summaryData.depthStr}\n` +
                    `*Malzeme:* ${summaryData.materialStr}\n` +
                    `*Renk:* ${summaryData.colorStr}\n` +
                    `*LED Aydınlatma:* ${summaryData.ledStatus} (${summaryData.ledColor})\n` +
                    `*Parça Detayı:* Kapak: ${summaryData.doorCount}, Çekmece: ${summaryData.drawerCount}, Raf: ${summaryData.shelfCount}\n` +
                    `*Tahmini Tutar:* ${summaryData.priceStr}\n\n` +
                    `Atölye üretimi ve yerinde keşif ölçümü için bilgi alabilir miyim?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer"
                >
                  <span>Tasarım İle Teklif Al</span>
                </a>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
