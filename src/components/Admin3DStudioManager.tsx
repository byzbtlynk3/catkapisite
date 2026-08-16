import React, { useState } from 'react';
import { 
  Box, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Tag, 
  Palette, 
  Sun, 
  Layers, 
  DollarSign, 
  Sliders, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Globe 
} from 'lucide-react';
import { 
  Studio3DConfig, 
  Studio3DCategoryConfig, 
  Studio3DColor, 
  Studio3DLedColor, 
  save3DConfig, 
  getStored3DConfig 
} from '../lib/studio3DDefaults';

interface Admin3DStudioManagerProps {
  onNotifyChange: () => void;
}

export default function Admin3DStudioManager({ onNotifyChange }: Admin3DStudioManagerProps) {
  // Working draft state initialized from localStorage
  const [config, setConfig] = useState<Studio3DConfig>(getStored3DConfig);
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'materials' | 'colors' | 'led' | 'hardware' | 'pricing' | 'custom'>('categories');
  const [selectedCatId, setSelectedCatId] = useState<string>(config.categories[0]?.id || 'wardrobe');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Selected Category Object
  const selectedCat = config.categories.find(c => c.id === selectedCatId) || config.categories[0];

  // FORM INPUT STATES
  // Categories
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Materials
  const [newMatName, setNewMatName] = useState('');
  const [newMatMult, setNewMatMult] = useState('1.0');

  // Colors
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2C3E50');

  // LED Colors
  const [newLedName, setNewLedName] = useState('');
  const [newLedHex, setNewLedHex] = useState('#FFD580');

  // Hardware
  const [newHwName, setNewHwName] = useState('');
  const [newHwType, setNewHwType] = useState('shelf');

  // UNIT PRICES FORM FOR SELECTED CATEGORY
  const [priceGovde, setPriceGovde] = useState<string>(String(selectedCat?.unitPrices?.govde || 8500));
  const [priceKapak, setPriceKapak] = useState<string>(String(selectedCat?.unitPrices?.kapak || 1800));
  const [priceCekmece, setPriceCekmece] = useState<string>(String(selectedCat?.unitPrices?.cekmece || 1200));
  const [priceRaf, setPriceRaf] = useState<string>(String(selectedCat?.unitPrices?.raf || 650));
  const [priceAskilik, setPriceAskilik] = useState<string>(String(selectedCat?.unitPrices?.askilik || 450));
  const [priceLed, setPriceLed] = useState<string>(String(selectedCat?.unitPrices?.led || 1200));
  const [priceCamKapak, setPriceCamKapak] = useState<string>(String(selectedCat?.unitPrices?.camKapak || 2800));
  const [priceKulp, setPriceKulp] = useState<string>(String(selectedCat?.unitPrices?.kulp || 150));
  const [priceRay, setPriceRay] = useState<string>(String(selectedCat?.unitPrices?.raySistemi || 850));
  const [priceMontaj, setPriceMontaj] = useState<string>(String(selectedCat?.unitPrices?.montaj || 2500));
  const [priceIscilik, setPriceIscilik] = useState<string>(String(selectedCat?.unitPrices?.iscilik || 3500));

  // Sync unit prices form when category changes
  React.useEffect(() => {
    if (selectedCat && selectedCat.unitPrices) {
      setPriceGovde(String(selectedCat.unitPrices.govde || 8500));
      setPriceKapak(String(selectedCat.unitPrices.kapak || 1800));
      setPriceCekmece(String(selectedCat.unitPrices.cekmece || 1200));
      setPriceRaf(String(selectedCat.unitPrices.raf || 650));
      setPriceAskilik(String(selectedCat.unitPrices.askilik || 450));
      setPriceLed(String(selectedCat.unitPrices.led || 1200));
      setPriceCamKapak(String(selectedCat.unitPrices.camKapak || 2800));
      setPriceKulp(String(selectedCat.unitPrices.kulp || 150));
      setPriceRay(String(selectedCat.unitPrices.raySistemi || 850));
      setPriceMontaj(String(selectedCat.unitPrices.montaj || 2500));
      setPriceIscilik(String(selectedCat.unitPrices.iscilik || 3500));
    }
  }, [selectedCatId]);

  // SAVE ALL CHANGES TO LOCALSTORAGE AND NOTIFY
  const handleSaveAndPublishAll = () => {
    save3DConfig(config);
    onNotifyChange();
    setStatusMessage('3D Tasarım ayarları ve birim fiyatlar başarıyla kaydedildi ve canlı web sitesinde yayınlandı!');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // 1. KATEGORİ İŞLEMLERİ
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newId = `cat-${Date.now()}`;
    const newCatObj: Studio3DCategoryConfig = {
      id: newId,
      name: newCatName.trim(),
      meshType: 'wardrobe',
      defaultCm: { w: 200, h: 200, d: 50, t: 2 },
      basePrice: 20000,
      isActive: true,
      order: config.categories.length + 1,
      materials: [
        { name: 'MDF Lam', mult: 1.0 },
        { name: 'Lake Cila', mult: 1.3 }
      ],
      hardware: [
        { type: 'shelf', name: 'Sabit Raf' },
        { type: 'drawer-soft', name: 'Frenli Çekmece' },
        { type: 'door', name: 'Menteşeli Kapak' }
      ],
      unitPrices: {
        govde: 8500, kapak: 1800, cekmece: 1200, raf: 650, askilik: 450,
        led: 1200, camKapak: 2800, kulp: 150, raySistemi: 850, montaj: 2500, iscilik: 3500
      },
      customSettings: {
        'Raf seçenekleri': true,
        'Çekmece seçenekleri': true,
        'Kapak türleri': true
      }
    };
    const updated = { ...config, categories: [...config.categories, newCatObj] };
    setConfig(updated);
    setNewCatName('');
    save3DConfig(updated);
  };

  const handleDeleteCategory = (id: string) => {
    if (config.categories.length <= 1) {
      alert('En az 1 kategori kalmalıdır.');
      return;
    }
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      const updated = { ...config, categories: config.categories.filter(c => c.id !== id) };
      setConfig(updated);
      if (selectedCatId === id) setSelectedCatId(updated.categories[0].id);
      save3DConfig(updated);
    }
  };

  const handleToggleCategoryActive = (id: string) => {
    const updated = {
      ...config,
      categories: config.categories.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    };
    setConfig(updated);
    save3DConfig(updated);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === config.categories.length - 1) return;
    const copy = [...config.categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    // update order field
    const reordered = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    const updated = { ...config, categories: reordered };
    setConfig(updated);
    save3DConfig(updated);
  };

  const handleSaveCategoryName = (id: string) => {
    if (!editingCatName.trim()) return;
    const updated = {
      ...config,
      categories: config.categories.map(c => c.id === id ? { ...c, name: editingCatName.trim() } : c)
    };
    setConfig(updated);
    setEditingCatId(null);
    save3DConfig(updated);
  };

  // 2. MALZEME İŞLEMLERİ
  const handleAddMaterial = () => {
    if (!newMatName.trim() || !selectedCat) return;
    const multNum = parseFloat(newMatMult) || 1.0;
    const updatedCats = config.categories.map(c => {
      if (c.id === selectedCatId) {
        return {
          ...c,
          materials: [...(c.materials || []), { name: newMatName.trim(), mult: multNum }]
        };
      }
      return c;
    });
    const updated = { ...config, categories: updatedCats };
    setConfig(updated);
    setNewMatName('');
    setNewMatMult('1.0');
    save3DConfig(updated);
  };

  const handleDeleteMaterial = (matName: string) => {
    if (!selectedCat) return;
    const updatedCats = config.categories.map(c => {
      if (c.id === selectedCatId) {
        return {
          ...c,
          materials: (c.materials || []).filter(m => m.name !== matName)
        };
      }
      return c;
    });
    const updated = { ...config, categories: updatedCats };
    setConfig(updated);
    save3DConfig(updated);
  };

  // 3. RENK İŞLEMLERİ
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const newObj: Studio3DColor = {
      id: `col-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex
    };
    const updated = { ...config, colors: [...config.colors, newObj] };
    setConfig(updated);
    setNewColorName('');
    save3DConfig(updated);
  };

  const handleDeleteColor = (id: string) => {
    if (config.colors.length <= 1) {
      alert('En az 1 renk bulunmalıdır.');
      return;
    }
    const updated = { ...config, colors: config.colors.filter(c => c.id !== id) };
    setConfig(updated);
    save3DConfig(updated);
  };

  // 4. LED İŞLEMLERİ
  const handleAddLedColor = () => {
    if (!newLedName.trim()) return;
    const newObj: Studio3DLedColor = {
      name: newLedName.trim(),
      hex: newLedHex
    };
    const updated = { ...config, ledColors: [...config.ledColors, newObj] };
    setConfig(updated);
    setNewLedName('');
    save3DConfig(updated);
  };

  const handleDeleteLedColor = (name: string) => {
    if (config.ledColors.length <= 1) {
      alert('En az 1 LED seçeneği bulunmalıdır.');
      return;
    }
    const updated = { ...config, ledColors: config.ledColors.filter(l => l.name !== name) };
    setConfig(updated);
    save3DConfig(updated);
  };

  // 5. DONANIM İŞLEMLERİ
  const handleAddHardware = () => {
    if (!newHwName.trim() || !selectedCat) return;
    const updatedCats = config.categories.map(c => {
      if (c.id === selectedCatId) {
        return {
          ...c,
          hardware: [...(c.hardware || []), { type: newHwType, name: newHwName.trim() }]
        };
      }
      return c;
    });
    const updated = { ...config, categories: updatedCats };
    setConfig(updated);
    setNewHwName('');
    save3DConfig(updated);
  };

  const handleDeleteHardware = (name: string) => {
    if (!selectedCat) return;
    const updatedCats = config.categories.map(c => {
      if (c.id === selectedCatId) {
        return {
          ...c,
          hardware: (c.hardware || []).filter(h => h.name !== name)
        };
      }
      return c;
    });
    const updated = { ...config, categories: updatedCats };
    setConfig(updated);
    save3DConfig(updated);
  };

  // 6. BİRİM FİYAT YÖNETİMİ SAVE
  const handleSaveUnitPrices = () => {
    if (!selectedCat) return;
    const parsedPrices = {
      govde: parseFloat(priceGovde) || 8500,
      kapak: parseFloat(priceKapak) || 1800,
      cekmece: parseFloat(priceCekmece) || 1200,
      raf: parseFloat(priceRaf) || 650,
      askilik: parseFloat(priceAskilik) || 450,
      led: parseFloat(priceLed) || 1200,
      camKapak: parseFloat(priceCamKapak) || 2800,
      kulp: parseFloat(priceKulp) || 150,
      raySistemi: parseFloat(priceRay) || 850,
      montaj: parseFloat(priceMontaj) || 2500,
      iscilik: parseFloat(priceIscilik) || 3500
    };

    const updatedCats = config.categories.map(c => {
      if (c.id === selectedCatId) {
        return {
          ...c,
          unitPrices: parsedPrices
        };
      }
      return c;
    });

    const updated = { ...config, categories: updatedCats };
    setConfig(updated);
    save3DConfig(updated);
    onNotifyChange();
    setStatusMessage(`"${selectedCat.name}" kategorisine ait birim fiyatlar güncellendi ve 3D Tasarım ekranına aktarıldı!`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // 7. KATEGORİYE ÖZEL AYARLAR TOGGLE
  const handleToggleCustomSetting = (key: string) => {
    if (!selectedCat) return;
    const currentMap = selectedCat.customSettings || {};
    const updatedMap = { ...currentMap, [key]: !currentMap[key] };
    const updatedCats = config.categories.map(c => {
      if (c.id === selectedCatId) {
        return { ...c, customSettings: updatedMap };
      }
      return c;
    });
    const updated = { ...config, categories: updatedCats };
    setConfig(updated);
    save3DConfig(updated);
  };

  // Category specific preset options dictionary
  const getCategorySpecificOptions = (catId: string) => {
    if (catId === 'wardrobe') {
      return ['Raf seçenekleri', 'Çekmece seçenekleri', 'Askılık seçenekleri', 'LED seçenekleri', 'Kapak türleri', 'Aynalı Kapak', 'Cam Vitrin'];
    } else if (catId === 'kitchen') {
      return ['Üst dolap', 'Alt dolap', 'Ada modülü', 'Kiler modülü', 'Evye boşluğu', 'Tezgâh yüzeyi', 'Ankastre boşluğu', 'Frenli Çekmece'];
    } else if (catId === 'shower') {
      return ['Cam türleri', 'Profil renkleri', 'Kapı sistemleri', 'Siyah Mat Profil', 'Krom Parlak Profil', 'Füme Cam'];
    } else if (catId === 'toilet') {
      return ['Model türleri', 'Kapak türleri', 'Rezervuar seçenekleri', 'Asma Klozet', 'Akıllı Bide'];
    } else if (catId === 'coffee-corner') {
      return ['Alt dolap', 'Üst raf', 'Açık raf', 'Cam kapak', 'Kahve makinesi bölümü', 'Fincan rafı', 'Çekmece', 'Tezgâh', 'Arka panel'];
    }
    return ['Raf seçenekleri', 'Çekmece seçenekleri', 'LED seçenekleri', 'Kapak türleri', 'Kilit sistemleri'];
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-[#141414] text-stone-100 rounded-3xl border border-stone-800 shadow-2xl">
      
      {/* HEADER BAR WITH LIVE PUBLISH ACTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Box className="text-amber-500" size={22} />
            <span>3D Tasarım Yönetim Merkezi</span>
          </h3>
          <p className="text-stone-400 text-xs mt-1">
            Web sitesindeki tüm 3D Tasarım kategorilerini, malzemelerini, renklerini, LED opsiyonlarını, donanımlarını ve birim fiyatlarını tek merkezden yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAndPublishAll}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl flex items-center gap-2"
        >
          <Globe size={16} />
          <span>Tüm 3D Değişiklikleri Canlıya Yayınla</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-stone-850 pb-3">
        {[
          { id: 'categories', label: `1. Kategori Yönetimi (${config.categories.length})`, icon: Tag },
          { id: 'materials', label: '2. Malzeme Yönetimi', icon: Box },
          { id: 'colors', label: `3. Renk Yönetimi (${config.colors.length})`, icon: Palette },
          { id: 'led', label: `4. LED Yönetimi (${config.ledColors.length})`, icon: Sun },
          { id: 'hardware', label: '5. Donanım Yönetimi', icon: Layers },
          { id: 'pricing', label: '6. Birim Fiyat Yönetimi', icon: DollarSign },
          { id: 'custom', label: '7. Kategoriye Özel Ayarlar', icon: Sliders }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-black font-extrabold shadow-lg'
                  : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-white'
              }`}
            >
              <IconComp size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* COMMON CATEGORY SELECTOR FOR TABS 2, 5, 6, 7 */}
      {['materials', 'hardware', 'pricing', 'custom'].includes(activeSubTab) && (
        <div className="bg-[#181818] p-3 rounded-2xl border border-stone-800 flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider shrink-0">
            Düzenlenecek Kategori Seçimi:
          </span>
          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="bg-[#111111] border border-stone-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl outline-none focus:border-amber-500 cursor-pointer"
          >
            {config.categories.map(c => (
              <option key={c.id} value={c.id}>{c.name} {!c.isActive ? '(Pasif)' : ''}</option>
            ))}
          </select>
        </div>
      )}

      {/* SUB-TAB 1: KATEGORİ YÖNETİMİ */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4">
          
          {/* ADD CATEGORY FORM */}
          <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Yeni Kategori Adı (Örn: Kahve Köşesi, Vestiyer, Mutfak...)"
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Yeni Kategori Ekle</span>
            </button>
          </div>

          {/* CATEGORY LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {config.categories.map((cat, idx) => (
              <div
                key={cat.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  cat.isActive ? 'bg-[#181818] border-stone-800' : 'bg-stone-900/40 border-stone-850 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className="w-6 h-6 rounded-lg bg-stone-900 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-stone-800">
                    {idx + 1}
                  </span>

                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="bg-black border border-amber-500 text-white text-xs px-2 py-1 rounded outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCategoryName(cat.id)}
                        className="p-1 bg-amber-500 text-black rounded cursor-pointer"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-white truncate flex items-center gap-2">
                        <span>{cat.name}</span>
                        {!cat.isActive && <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1 rounded">Pasif</span>}
                      </h5>
                      <p className="text-[10px] text-stone-400">{cat.materials?.length || 0} Malzeme • {cat.hardware?.length || 0} Donanım</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setEditingCatName(cat.name);
                    }}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs"
                    title="Adı Değiştir"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleCategoryActive(cat.id)}
                    className={`p-1.5 rounded-lg text-xs font-bold ${cat.isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-stone-800 text-stone-500'}`}
                    title={cat.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  >
                    {cat.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveCategory(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveCategory(idx, 'down')}
                    disabled={idx === config.categories.length - 1}
                    className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                  >
                    <ArrowDown size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs"
                    title="Kategoriyi Sil"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MALZEME YÖNETİMİ */}
      {activeSubTab === 'materials' && selectedCat && (
        <div className="space-y-4">
          
          <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newMatName}
              onChange={(e) => setNewMatName(e.target.value)}
              placeholder="Yeni Malzeme Adı (Örn: Suntalam, MDF, Lake, Akrilik...)"
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs font-bold">Fiyat Çarpanı:</span>
              <input
                type="number"
                step="0.05"
                value={newMatMult}
                onChange={(e) => setNewMatMult(e.target.value)}
                className="w-20 bg-[#111111] border border-stone-800 text-white text-xs px-2.5 py-2.5 rounded-xl outline-none text-center font-mono font-bold"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMaterial}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Malzeme Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(selectedCat.materials || []).map((m, i) => (
              <div key={m.name + i} className="p-3.5 bg-[#181818] border border-stone-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">{m.name}</h5>
                  <p className="text-[10px] text-amber-400 font-mono">Fiyat Çarpanı: {m.mult}x</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMaterial(m.name)}
                  className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: RENK YÖNETİMİ */}
      {activeSubTab === 'colors' && (
        <div className="space-y-4">
          
          <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Renk Adı (Örn: Antrasit, Mat Siyah, Ceviz...)"
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs font-bold">Renk Kodu:</span>
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Yeni Renk Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.colors.map((c) => (
              <div key={c.id} className="p-3 bg-[#181818] border border-stone-800 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full border border-stone-600 shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="text-xs font-bold text-white truncate">{c.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteColor(c.id)}
                  className="p-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LED YÖNETİMİ */}
      {activeSubTab === 'led' && (
        <div className="space-y-4">
          
          <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newLedName}
              onChange={(e) => setNewLedName(e.target.value)}
              placeholder="LED Seçeneği Adı (Örn: Amber, Mavi, Gün Işığı...)"
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs font-bold">LED Rengi:</span>
              <input
                type="color"
                value={newLedHex}
                onChange={(e) => setNewLedHex(e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={handleAddLedColor}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>LED Rengi Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.ledColors.map((l) => (
              <div key={l.name} className="p-3 bg-[#181818] border border-stone-800 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-full border border-amber-400/50 shadow shrink-0" style={{ backgroundColor: l.hex === 'rainbow' ? '#FFD580' : l.hex }} />
                  <span className="text-xs font-bold text-white truncate">{l.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLedColor(l.name)}
                  className="p-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: DONANIM YÖNETİMİ */}
      {activeSubTab === 'hardware' && selectedCat && (
        <div className="space-y-4">
          
          <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={newHwName}
              onChange={(e) => setNewHwName(e.target.value)}
              placeholder="Yeni Donanım Adı (Örn: Pantolon Askılığı, Frenli Çekmece, Kadife Takılık...)"
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <select
              value={newHwType}
              onChange={(e) => setNewHwType(e.target.value)}
              className="bg-[#111111] border border-stone-800 text-white text-xs px-3 py-2.5 rounded-xl outline-none cursor-pointer"
            >
              <option value="shelf">Raf</option>
              <option value="drawer-soft">Çekmece</option>
              <option value="door">Kapak</option>
              <option value="glass-door">Cam Kapak</option>
              <option value="hanger-long">Askılık</option>
              <option value="trouser-rack">Pantolon Askılığı</option>
              <option value="mirror-door">Ayna</option>
              <option value="kulp">Kulp</option>
              <option value="sliding-door">Ray Sistemi</option>
              <option value="accessory">Aksesuar</option>
            </select>
            <button
              type="button"
              onClick={handleAddHardware}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Donanım Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(selectedCat.hardware || []).map((h, i) => (
              <div key={h.name + i} className="p-3.5 bg-[#181818] border border-stone-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">{h.name}</h5>
                  <p className="text-[10px] text-amber-400 font-mono">Türü: {h.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteHardware(h.name)}
                  className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: BİRİM FİYAT YÖNETİMİ */}
      {activeSubTab === 'pricing' && selectedCat && (
        <div className="space-y-4 bg-[#181818] p-6 rounded-2xl border border-stone-800">
          <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="text-amber-500" size={18} />
              <span>"{selectedCat.name}" Kategori Fiyatlandırma Ekranı (₺)</span>
            </h4>
            <button
              type="button"
              onClick={handleSaveUnitPrices}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Save size={15} />
              <span>Fiyatları Kaydet &amp; Canlıya Aktar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Gövde Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceGovde}
                onChange={(e) => setPriceGovde(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Kapak Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceKapak}
                onChange={(e) => setPriceKapak(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Çekmece Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceCekmece}
                onChange={(e) => setPriceCekmece(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Raf Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceRaf}
                onChange={(e) => setPriceRaf(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Askılık Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceAskilik}
                onChange={(e) => setPriceAskilik(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">LED Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceLed}
                onChange={(e) => setPriceLed(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Cam Kapak Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceCamKapak}
                onChange={(e) => setPriceCamKapak(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Kulp Birim Fiyatı (₺)</label>
              <input
                type="number"
                value={priceKulp}
                onChange={(e) => setPriceKulp(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Ray Sistemi Fiyatı (₺)</label>
              <input
                type="number"
                value={priceRay}
                onChange={(e) => setPriceRay(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-bold uppercase">Montaj Maliyeti (₺)</label>
              <input
                type="number"
                value={priceMontaj}
                onChange={(e) => setPriceMontaj(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-stone-300 font-bold uppercase">İşçilik Maliyeti (₺)</label>
              <input
                type="number"
                value={priceIscilik}
                onChange={(e) => setPriceIscilik(e.target.value)}
                className="w-full bg-[#111111] border border-stone-800 focus:border-amber-500 text-white p-2.5 rounded-xl font-mono font-bold outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: KATEGORİYE ÖZEL AYARLAR */}
      {activeSubTab === 'custom' && selectedCat && (
        <div className="space-y-4 bg-[#181818] p-6 rounded-2xl border border-stone-800">
          <div className="border-b border-stone-800 pb-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="text-amber-500" size={18} />
              <span>"{selectedCat.name}" Kategoriye Özel Ayarlar &amp; Seçenekler</span>
            </h4>
            <p className="text-stone-400 text-xs mt-1">
              Bu kategoride müşteriye hangi modül seçeneklerinin ve özelliklerin sunulacağını belirleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {getCategorySpecificOptions(selectedCat.id).map(optKey => {
              const isEnabled = selectedCat.customSettings?.[optKey] !== false;
              return (
                <div
                  key={optKey}
                  onClick={() => handleToggleCustomSetting(optKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isEnabled ? 'bg-amber-500/10 border-amber-500/50 text-white' : 'bg-stone-900 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="text-xs font-bold">{optKey}</span>
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${isEnabled ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-500'}`}>
                    {isEnabled ? 'Aktif' : 'Pasif'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
