import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Package,
  Wrench
} from 'lucide-react';
import { 
  CustomGroupDef, 
  getStoredCustomGroups, 
  saveStoredCustomGroups, 
  getStoredMaterials, 
  saveStoredMaterials, 
  resetStoredCustomData 
} from '../lib/customProductionData';

export default function AdminCustomProductionManager() {
  const [groups, setGroups] = useState<CustomGroupDef[]>(() => getStoredCustomGroups());
  const [materials, setMaterials] = useState<string[]>(() => getStoredMaterials());

  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newItemName, setNewItemName] = useState('');

  const [newMaterialName, setNewMaterialName] = useState('');

  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const updateGroupsState = (updated: CustomGroupDef[], msg: string) => {
    setGroups(updated);
    saveStoredCustomGroups(updated);
    showNotify(msg);
  };

  const updateMaterialsState = (updated: string[], msg: string) => {
    setMaterials(updated);
    saveStoredMaterials(updated);
    showNotify(msg);
  };

  // 1. ADD NEW GROUP
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const trimmed = newGroupName.trim();
    if (groups.some(g => g.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('Bu grup adı zaten mevcut!');
      return;
    }

    const newGroup: CustomGroupDef = {
      id: `group-${Date.now()}`,
      name: trimmed,
      items: []
    };

    const updated = [...groups, newGroup];
    setNewGroupName('');
    setSelectedGroupId(newGroup.id);
    updateGroupsState(updated, `"${trimmed}" üretici grubu eklendi.`);
  };

  // 2. DELETE GROUP
  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (window.confirm(`"${groupName}" grubunu ve altındaki tüm modelleri silmek istediğinizden emin misiniz?`)) {
      const updated = groups.filter(g => g.id !== groupId);
      if (selectedGroupId === groupId && updated.length > 0) {
        setSelectedGroupId(updated[0].id);
      }
      updateGroupsState(updated, `"${groupName}" grubu silindi.`);
    }
  };

  // 3. MOVE GROUP UP/DOWN
  const handleMoveGroup = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === groups.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...groups];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    updateGroupsState(copy, 'Grup sıralaması değiştirildi.');
  };

  // 4. ADD ITEM TO GROUP
  const handleAddItem = () => {
    if (!newItemName.trim() || !selectedGroupId) return;
    const itemTrimmed = newItemName.trim();

    const updated = groups.map(g => {
      if (g.id === selectedGroupId) {
        if (g.items.some(i => i.toLowerCase() === itemTrimmed.toLowerCase())) {
          alert('Bu model adı bu grupta zaten mevcut!');
          return g;
        }
        return {
          ...g,
          items: [...g.items, itemTrimmed]
        };
      }
      return g;
    });

    setNewItemName('');
    updateGroupsState(updated, `"${itemTrimmed}" modeli gruba eklendi.`);
  };

  // 5. DELETE ITEM FROM GROUP
  const handleDeleteItem = (groupId: string, itemToDelete: string) => {
    const updated = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.filter(i => i !== itemToDelete)
        };
      }
      return g;
    });
    updateGroupsState(updated, `"${itemToDelete}" modeli silindi.`);
  };

  // 6. MOVE ITEM UP/DOWN IN GROUP
  const handleMoveItem = (groupId: string, itemIdx: number, direction: 'up' | 'down') => {
    const groupDef = groups.find(g => g.id === groupId);
    if (!groupDef) return;
    if (direction === 'up' && itemIdx === 0) return;
    if (direction === 'down' && itemIdx === groupDef.items.length - 1) return;

    const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;

    const updated = groups.map(g => {
      if (g.id === groupId) {
        const itemCopy = [...g.items];
        const temp = itemCopy[itemIdx];
        itemCopy[itemIdx] = itemCopy[targetIdx];
        itemCopy[targetIdx] = temp;
        return { ...g, items: itemCopy };
      }
      return g;
    });

    updateGroupsState(updated, 'Model sıralaması değiştirildi.');
  };

  // 7. ADD MATERIAL
  const handleAddMaterial = () => {
    if (!newMaterialName.trim()) return;
    const matTrimmed = newMaterialName.trim();
    if (materials.some(m => m.toLowerCase() === matTrimmed.toLowerCase())) {
      alert('Bu malzeme zaten listede mevcut!');
      return;
    }

    const updated = [...materials, matTrimmed];
    setNewMaterialName('');
    updateMaterialsState(updated, `"${matTrimmed}" hammaddesi eklendi.`);
  };

  // 8. DELETE MATERIAL
  const handleDeleteMaterial = (matName: string) => {
    if (window.confirm(`"${matName}" malzemesini listeden silmek istediğinizden emin misiniz?`)) {
      const updated = materials.filter(m => m !== matName);
      updateMaterialsState(updated, `"${matName}" hammaddesi silindi.`);
    }
  };

  // 9. MOVE MATERIAL UP/DOWN
  const handleMoveMaterial = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === materials.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...materials];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    updateMaterialsState(copy, 'Malzeme sıralaması değiştirildi.');
  };

  // 10. RESET ALL CUSTOM PRODUCTION DATA
  const handleResetDefaults = () => {
    if (window.confirm('Özel üretim gruplarını ve hammadde listesini orijinal fabrika ayarlarına sıfırlamak istiyor musunuz?')) {
      resetStoredCustomData();
      setGroups(getStoredCustomGroups());
      setMaterials(getStoredMaterials());
      showNotify('Özel Üretim seçenekleri varsayılana sıfırlandı.');
    }
  };

  const selectedGroupDef = groups.find(g => g.id === selectedGroupId) || groups[0];

  return (
    <div className="space-y-6 text-stone-100">
      
      {/* Live Sync Banner */}
      {notification && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div>
          <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
            <Wrench size={18} className="text-amber-500" />
            <span>Özel Üretim Grupları Ve Malzeme Yönetimi</span>
          </h3>
          <p className="text-stone-400 text-[11px] mt-0.5">
            Burada eklenen gruplar, modeller ve malzemeler web sitesindeki "Özel Üretim" formunda anında güncellenir.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-400 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Sıfırla</span>
        </button>
      </div>

      {/* SECTION 1: GROUPS & MODELS MANAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Group List & Add Group */}
        <div className="lg:col-span-5 bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-2">
            <FolderPlus size={16} className="text-amber-500" />
            <span>1. Üretim Grupları ({groups.length})</span>
          </h4>

          {/* Add Group Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Yeni Grup Adı (Örn: Ofis Mobilyaları)..."
              className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddGroup}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={15} />
              Grup
            </button>
          </div>

          {/* Groups List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {groups.map((group, idx) => {
              const isSelected = selectedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black font-extrabold border-amber-400 shadow-md'
                      : 'bg-[#121212] border-stone-800 text-stone-300 hover:border-amber-500/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Package size={14} className={isSelected ? 'text-black' : 'text-amber-500'} />
                    <span>{group.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-black/20 text-black' : 'bg-stone-900 text-stone-500'
                    }`}>
                      {group.items.length} Mod
                    </span>
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleMoveGroup(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 disabled:opacity-20 hover:scale-110"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveGroup(idx, 'down')}
                      disabled={idx === groups.length - 1}
                      className="p-1 disabled:opacity-20 hover:scale-110"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-1 hover:text-red-500 ml-1"
                      title="Grubu Sil"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Models/Items for Selected Group */}
        <div className="lg:col-span-7 bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl">
          {selectedGroupDef ? (
            <>
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-amber-500" />
                  <span>"{selectedGroupDef.name}" Alt Modelleri ({selectedGroupDef.items.length})</span>
                </h4>
              </div>

              {/* Add Item Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={`"${selectedGroupDef.name}" için model adı (Örn: Sürgülü Dolap)...`}
                  className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Plus size={15} />
                  Model Ekle
                </button>
              </div>

              {/* Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {selectedGroupDef.items.map((item, itemIdx) => (
                  <div
                    key={item}
                    className="p-2.5 bg-[#121212] border border-stone-800 rounded-xl flex items-center justify-between text-xs text-stone-200"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <span className="text-amber-500 font-mono">-</span>
                      <span>{item}</span>
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleMoveItem(selectedGroupDef.id, itemIdx, 'up')}
                        disabled={itemIdx === 0}
                        className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                        title="Yukarı Taşı"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveItem(selectedGroupDef.id, itemIdx, 'down')}
                        disabled={itemIdx === selectedGroupDef.items.length - 1}
                        className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                        title="Aşağı Taşı"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(selectedGroupDef.id, item)}
                        className="p-1 text-stone-600 hover:text-red-400 ml-1"
                        title="Modeli Sil"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedGroupDef.items.length === 0 && (
                  <div className="col-span-2 text-center text-stone-500 text-xs italic py-6">
                    Bu gruba henüz bir model eklenmedi. Yukarıdan yeni model ismi ekleyebilirsiniz.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-stone-500 text-xs italic py-8">
              Lütfen soldan bir grup seçin.
            </div>
          )}
        </div>

      </div>

      {/* SECTION 2: MATERIALS MANAGEMENT */}
      <div className="bg-[#181818] border border-stone-850 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-stone-800 pb-2">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Wrench size={16} className="text-amber-500" />
            <span>2. Gövde &amp; Kapak Ham Maddeleri / Yüzey Türleri ({materials.length} Malzeme)</span>
          </h4>
        </div>

        {/* Add Material Input */}
        <div className="flex gap-2 max-w-xl">
          <input
            type="text"
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            placeholder="Örn: Akrilik Parlak MDF, Lamine Cam, Compact..."
            className="flex-1 bg-[#111111] border border-stone-800 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleAddMaterial}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus size={15} />
            Malzeme Ekle
          </button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {materials.map((mat, mIdx) => (
            <div
              key={mat}
              className="p-2.5 bg-[#121212] border border-stone-800 rounded-xl flex items-center justify-between text-xs text-stone-200"
            >
              <span className="font-semibold truncate mr-2" title={mat}>{mat}</span>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMoveMaterial(mIdx, 'up')}
                  disabled={mIdx === 0}
                  className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                  title="Yukarı Taşı"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveMaterial(mIdx, 'down')}
                  disabled={mIdx === materials.length - 1}
                  className="p-1 text-stone-500 hover:text-amber-400 disabled:opacity-20"
                  title="Aşağı Taşı"
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMaterial(mat)}
                  className="p-1 text-stone-600 hover:text-red-400 ml-1"
                  title="Malzemeyi Sil"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
