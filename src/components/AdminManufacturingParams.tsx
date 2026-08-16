import React, { useState } from 'react';
import { 
  Ruler, 
  Layers, 
  Palette, 
  DollarSign, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Info, 
  Sliders,
  Maximize2
} from 'lucide-react';
import { 
  getStoredParameterSettings, 
  saveStoredParameterSettings, 
  ManufacturingParamsConfig 
} from '../lib/customProductionData';
import MediaGalleryUploader from './MediaGalleryUploader';

interface AdminManufacturingParamsProps {
  onNotify?: (msg: string) => void;
}

export default function AdminManufacturingParams({ onNotify }: AdminManufacturingParamsProps) {
  const [params, setParams] = useState<ManufacturingParamsConfig>(() => getStoredParameterSettings());
  const [paramMedia, setParamMedia] = useState<string[]>([
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'
  ]);
  const [newMaterial, setNewMaterial] = useState('');
  const [newMaterialType, setNewMaterialType] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const showNotify = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

  const handleSaveAll = () => {
    saveStoredParameterSettings(params);
    showNotify('İmalat & Malzeme Parametreleri başarıyla kaydedildi!');
  };

  // Materials Handlers (Suntalam is forbidden)
  const addMaterial = () => {
    const val = newMaterial.trim();
    if (!val) return;
    if (val.toLowerCase() === 'suntalam') {
      alert('Suntalam imalatı yapılmadığı için listeye eklenemez.');
      return;
    }
    if (params.materials.some(m => m.toLowerCase() === val.toLowerCase())) {
      alert('Bu malzeme zaten listede mevcut.');
      return;
    }
    const updated = [...params.materials, val];
    setParams({ ...params, materials: updated });
    setNewMaterial('');
  };

  const removeMaterial = (index: number) => {
    const updated = params.materials.filter((_, i) => i !== index);
    setParams({ ...params, materials: updated });
  };

  // Material Types Handlers
  const addMaterialType = () => {
    const val = newMaterialType.trim();
    if (!val) return;
    if (params.materialTypes.includes(val)) return;
    setParams({ ...params, materialTypes: [...params.materialTypes, val] });
    setNewMaterialType('');
  };

  const removeMaterialType = (index: number) => {
    setParams({
      ...params,
      materialTypes: params.materialTypes.filter((_, i) => i !== index)
    });
  };

  // Colors Handlers
  const addColor = () => {
    const val = newColor.trim();
    if (!val) return;
    if (params.colors.includes(val)) return;
    setParams({ ...params, colors: [...params.colors, val] });
    setNewColor('');
  };

  const removeColor = (index: number) => {
    setParams({
      ...params,
      colors: params.colors.filter((_, i) => i !== index)
    });
  };

  // Units Handlers
  const addUnit = () => {
    const val = newUnit.trim();
    if (!val) return;
    if (params.units.includes(val)) return;
    setParams({ ...params, units: [...params.units, val] });
    setNewUnit('');
  };

  const removeUnit = (index: number) => {
    setParams({
      ...params,
      units: params.units.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 bg-[#121212] p-6 rounded-2xl border border-stone-850">
      
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181818] p-4 rounded-2xl border border-stone-800">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sliders className="text-amber-500" size={20} />
            <span>İmalat &amp; Malzeme Parametreleri Yönetimi</span>
          </h3>
          <p className="text-stone-400 text-xs mt-1">
            Ürün malzemeleri, renkler, ebat aralıkları ve birim fiyat hesaplama değerlerini buradan düzenleyebilirsiniz. Değişiklikler Ürünler ve Özel Üretim sayfalarına anında yansır.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Save size={16} />
          <span>Parametreleri Kaydet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. ÜRÜN MALZEMELERİ & SUNTALAM BİLGİSİ */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="text-amber-500" size={16} />
              <span>Ürün Malzemeleri ({params.materials.length})</span>
            </h4>
            <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Suntalam Kaldırıldı
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Yeni Malzeme Ekle (Örn. Masif Meşe, Temperli Füme Cam...)"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              className="flex-1 bg-[#111111] border border-stone-750 focus:border-amber-500 text-white px-3.5 py-2 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={addMaterial}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {params.materials.map((mat, idx) => (
              <div key={mat} className="flex items-center justify-between bg-[#111111] p-2.5 rounded-xl border border-stone-850 text-xs text-stone-200">
                <span className="font-bold">{mat}</span>
                <button
                  type="button"
                  onClick={() => removeMaterial(idx)}
                  className="text-stone-500 hover:text-red-400 p-1 rounded transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. MALZEME TÜRLERİ / SINIFLARI */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Layers className="text-amber-500" size={16} />
            <span>Malzeme Türleri ({params.materialTypes.length})</span>
          </h4>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Yeni Malzeme Türü (Örn. Gövde Malzemesi, Kapak Malzemesi...)"
              value={newMaterialType}
              onChange={(e) => setNewMaterialType(e.target.value)}
              className="flex-1 bg-[#111111] border border-stone-750 focus:border-amber-500 text-white px-3.5 py-2 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={addMaterialType}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {params.materialTypes.map((type, idx) => (
              <div key={type} className="flex items-center justify-between bg-[#111111] p-2.5 rounded-xl border border-stone-850 text-xs text-stone-200">
                <span className="font-bold">{type}</span>
                <button
                  type="button"
                  onClick={() => removeMaterialType(idx)}
                  className="text-stone-500 hover:text-red-400 p-1 rounded transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RENKLER & YÜZEY SEÇENEKLERİ */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Palette className="text-amber-500" size={16} />
            <span>Renkler &amp; Yüzey Cila Seçenekleri ({params.colors.length})</span>
          </h4>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Yeni Renk / Yüzey Seçeneği (Örn. İpek Mat Siyah %20...)"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="flex-1 bg-[#111111] border border-stone-750 focus:border-amber-500 text-white px-3.5 py-2 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={addColor}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {params.colors.map((col, idx) => (
              <div key={col} className="flex items-center justify-between bg-[#111111] p-2.5 rounded-xl border border-stone-850 text-xs text-stone-200">
                <span className="font-bold">{col}</span>
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className="text-stone-500 hover:text-red-400 p-1 rounded transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ÖLÇÜ BİRİMLERİ & EBAT ARALIKLARI */}
        <div className="bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Maximize2 className="text-amber-500" size={16} />
            <span>Ölçek &amp; Ölçü Birimleri</span>
          </h4>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Yeni Ölçü Birimi (Örn. m², cm, metre tül...)"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="flex-1 bg-[#111111] border border-stone-750 focus:border-amber-500 text-white px-3.5 py-2 rounded-xl text-xs outline-none"
            />
            <button
              type="button"
              onClick={addUnit}
              className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs rounded-xl hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Ekle</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {params.units.map((unit, idx) => (
              <div key={unit} className="flex items-center gap-1.5 bg-[#111111] px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-amber-400 font-mono font-bold">
                <span>{unit}</span>
                <button
                  type="button"
                  onClick={() => removeUnit(idx)}
                  className="text-stone-500 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-850 space-y-3">
            <span className="text-xs font-bold text-stone-300 block">Özel Üretim Slider Aralıkları:</span>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-stone-400 font-bold block">Genişlik Min/Max/Def (cm)</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    value={params.dimensionLimits.minWidth}
                    onChange={(e) => setParams({ ...params, dimensionLimits: { ...params.dimensionLimits, minWidth: Number(e.target.value) } })}
                    className="w-full bg-[#111111] border border-stone-750 text-white p-1.5 rounded text-center"
                  />
                  <input
                    type="number"
                    value={params.dimensionLimits.maxWidth}
                    onChange={(e) => setParams({ ...params, dimensionLimits: { ...params.dimensionLimits, maxWidth: Number(e.target.value) } })}
                    className="w-full bg-[#111111] border border-stone-750 text-white p-1.5 rounded text-center"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 font-bold block">Yükseklik Min/Max/Def (cm)</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    value={params.dimensionLimits.minHeight}
                    onChange={(e) => setParams({ ...params, dimensionLimits: { ...params.dimensionLimits, minHeight: Number(e.target.value) } })}
                    className="w-full bg-[#111111] border border-stone-750 text-white p-1.5 rounded text-center"
                  />
                  <input
                    type="number"
                    value={params.dimensionLimits.maxHeight}
                    onChange={(e) => setParams({ ...params, dimensionLimits: { ...params.dimensionLimits, maxHeight: Number(e.target.value) } })}
                    className="w-full bg-[#111111] border border-stone-750 text-white p-1.5 rounded text-center"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 font-bold block">Derinlik Min/Max/Def (cm)</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    value={params.dimensionLimits.minDepth}
                    onChange={(e) => setParams({ ...params, dimensionLimits: { ...params.dimensionLimits, minDepth: Number(e.target.value) } })}
                    className="w-full bg-[#111111] border border-stone-750 text-white p-1.5 rounded text-center"
                  />
                  <input
                    type="number"
                    value={params.dimensionLimits.maxDepth}
                    onChange={(e) => setParams({ ...params, dimensionLimits: { ...params.dimensionLimits, maxDepth: Number(e.target.value) } })}
                    className="w-full bg-[#111111] border border-stone-750 text-white p-1.5 rounded text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. BİRİM FİYATLAR & HESAPLAMA DEĞERLERİ */}
        <div className="lg:col-span-2 bg-[#181818] p-5 rounded-2xl border border-stone-800 space-y-4">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <DollarSign className="text-amber-500" size={16} />
            <span>Birim Fiyatlar &amp; Fiyat Hesaplama Katsayıları</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            
            <div className="bg-[#111111] p-3 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold block">m² Baz Fiyat (₺)</span>
              <input
                type="number"
                value={params.pricingValues.baseM2UnitPrice}
                onChange={(e) => setParams({ ...params, pricingValues: { ...params.pricingValues, baseM2UnitPrice: Number(e.target.value) } })}
                className="w-full bg-[#181818] border border-stone-700 text-amber-400 font-bold p-2 rounded outline-none"
              />
            </div>

            <div className="bg-[#111111] p-3 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold block">Metre Tül Fiyat (₺)</span>
              <input
                type="number"
                value={params.pricingValues.baseLinearUnitPrice}
                onChange={(e) => setParams({ ...params, pricingValues: { ...params.pricingValues, baseLinearUnitPrice: Number(e.target.value) } })}
                className="w-full bg-[#181818] border border-stone-700 text-amber-400 font-bold p-2 rounded outline-none"
              />
            </div>

            <div className="bg-[#111111] p-3 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold block">Lake Çarpanı</span>
              <input
                type="number"
                step="0.05"
                value={params.pricingValues.lacquerMultiplier}
                onChange={(e) => setParams({ ...params, pricingValues: { ...params.pricingValues, lacquerMultiplier: Number(e.target.value) } })}
                className="w-full bg-[#181818] border border-stone-700 text-white font-bold p-2 rounded outline-none"
              />
            </div>

            <div className="bg-[#111111] p-3 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold block">Akrilik Çarpanı</span>
              <input
                type="number"
                step="0.05"
                value={params.pricingValues.acrylicMultiplier}
                onChange={(e) => setParams({ ...params, pricingValues: { ...params.pricingValues, acrylicMultiplier: Number(e.target.value) } })}
                className="w-full bg-[#181818] border border-stone-700 text-white font-bold p-2 rounded outline-none"
              />
            </div>

            <div className="bg-[#111111] p-3 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold block">Aksesuar Bedeli (₺)</span>
              <input
                type="number"
                value={params.pricingValues.hardwareCost}
                onChange={(e) => setParams({ ...params, pricingValues: { ...params.pricingValues, hardwareCost: Number(e.target.value) } })}
                className="w-full bg-[#181818] border border-stone-700 text-white font-bold p-2 rounded outline-none"
              />
            </div>

            <div className="bg-[#111111] p-3 rounded-xl border border-stone-800 space-y-1">
              <span className="text-[10px] text-stone-400 font-bold block">KDV Oranı (%)</span>
              <input
                type="number"
                value={params.pricingValues.vatRatePercent}
                onChange={(e) => setParams({ ...params, pricingValues: { ...params.pricingValues, vatRatePercent: Number(e.target.value) } })}
                className="w-full bg-[#181818] border border-stone-700 text-white font-bold p-2 rounded outline-none"
              />
            </div>

          </div>
        </div>

        {/* 6. İMALAT VE MALZEME NUMUNE MEDYALARI */}
        <div className="lg:col-span-2">
          <MediaGalleryUploader
            mediaList={paramMedia}
            onChange={setParamMedia}
            maxFiles={30}
            title="İmalat & Malzeme Numune Medyaları (Fotoğraf, Video, GIF)"
          />
        </div>

      </div>

    </div>
  );
}
