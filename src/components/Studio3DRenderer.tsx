import React, { useState } from 'react';
import { 
  Studio3DCategoryConfig, 
  Studio3DColor, 
  Studio3DLedColor 
} from '../lib/studio3DDefaults';

export interface PlacedPart {
  id: string;
  type: string;
  name: string;
  section: 'left' | 'center' | 'right' | 'top' | 'bottom';
  heightOffsetCm: number;
}

export interface Studio3DRendererProps {
  activeCategory: Studio3DCategoryConfig | null;
  selectedColor: Studio3DColor;
  selectedMaterial: string;
  unit: 'cm' | 'mm';
  dimWidth: number;
  dimHeight: number;
  dimDepth: number;
  hasLedLighting: boolean;
  selectedLedObj: Studio3DLedColor;
  isOpenDoors: boolean;
  placedParts: PlacedPart[];
  selectedPartId: string | null;
  onSelectPart: (id: string) => void;
  rotationAngle: number;
  elevationAngle: number;
  zoomLevel: number;
}

export default function Studio3DRenderer({
  activeCategory,
  selectedColor,
  selectedMaterial,
  unit,
  dimWidth,
  dimHeight,
  dimDepth,
  hasLedLighting,
  selectedLedObj,
  isOpenDoors,
  placedParts,
  selectedPartId,
  onSelectPart,
  rotationAngle,
  elevationAngle,
  zoomLevel
}: Studio3DRendererProps) {
  if (!activeCategory) return null;

  const categoryId = activeCategory.id;
  const meshType = activeCategory.meshType || categoryId;

  // Secondary sub-type controls state for specialized categories
  const [showerShape, setShowerShape] = useState<'kare' | 'oval' | 'kose' | 'dikdortgen'>('kare');
  const [showerGlass, setShowerGlass] = useState<'clear' | 'fume' | 'frosted'>('clear');
  const [toiletType, setToiletType] = useState<'asma' | 'yerden' | 'akilli'>('asma');
  const [sinkType, setSinkType] = useState<'canak' | 'tezgah-alti' | 'ankastre'>('canak');

  // LED Glow Style calculation
  const getLedGlowStyle = () => {
    if (!hasLedLighting) return {};
    const hex = selectedLedObj.hex;
    if (hex === 'rainbow') {
      return {
        boxShadow: '0 0 35px #FF007F, 0 0 70px #00F0FF',
        background: 'linear-gradient(45deg, rgba(255,0,128,0.3), rgba(0,240,255,0.3))'
      };
    }
    return {
      boxShadow: `0 0 40px ${hex}, inset 0 0 20px ${hex}`,
      borderColor: hex
    };
  };

  // Render LED Strip Line
  const renderLedStrip = () => {
    if (!hasLedLighting) return null;
    const isRainbow = selectedLedObj.hex === 'rainbow';
    return (
      <div 
        className="w-full h-1.5 rounded-full transition-all duration-500 shadow-lg my-1 z-20"
        style={{
          background: isRainbow 
            ? 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)' 
            : selectedLedObj.hex,
          boxShadow: `0 0 12px ${isRainbow ? '#00e5ff' : selectedLedObj.hex}`
        }}
      />
    );
  };

  // Render 3D Door Hinges on open door
  const renderHinges = () => (
    <div className="absolute left-1 top-2 bottom-2 flex flex-col justify-between py-4 pointer-events-none z-30">
      <div className="w-1.5 h-4 bg-stone-400 rounded border border-stone-700 shadow" title="Menteşe" />
      <div className="w-1.5 h-4 bg-stone-400 rounded border border-stone-700 shadow" title="Menteşe" />
      <div className="w-1.5 h-4 bg-stone-400 rounded border border-stone-700 shadow" title="Menteşe" />
    </div>
  );

  // Render Drawer Slider Rails
  const renderDrawerRails = () => (
    <div className="absolute inset-y-1 left-0 right-0 flex justify-between pointer-events-none px-1">
      <div className="w-1 h-full bg-stone-500/80 rounded" title="Frenli Ray Sistem" />
      <div className="w-1 h-full bg-stone-500/80 rounded" title="Frenli Ray Sistem" />
    </div>
  );

  return (
    <div className="relative w-full h-[580px] bg-[#0a0a0a] border-2 border-stone-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner overflow-hidden select-none">
      
      {/* LED AMBIENT BACKLIGHT GLOW */}
      {hasLedLighting && (
        <div 
          className="absolute inset-4 rounded-3xl transition-all duration-700 pointer-events-none opacity-35 blur-2xl z-0"
          style={getLedGlowStyle()}
        />
      )}

      {/* SPECIALIZED CATEGORY SUB-CONTROLS TOP BAR (e.g. Duşakabin Şekli, Klozet Tipi, Lavabo Tipi) */}
      <div className="absolute top-3 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {categoryId === 'shower' && (
          <div className="flex items-center space-x-1.5 bg-stone-900/90 border border-stone-800 p-1.5 rounded-xl text-[10px] font-mono">
            <span className="text-amber-400 font-bold px-1">Model:</span>
            {[
              { id: 'kare', label: 'Kare' },
              { id: 'oval', label: 'Oval' },
              { id: 'kose', label: 'Köşe' },
              { id: 'dikdortgen', label: 'Dikdörtgen' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setShowerShape(s.id as any)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  showerShape === s.id ? 'bg-amber-500 text-black' : 'text-stone-300 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="text-stone-600">|</span>
            <span className="text-amber-400 font-bold px-1">Cam:</span>
            {[
              { id: 'clear', label: 'Şeffaf' },
              { id: 'fume', label: 'Füme' },
              { id: 'frosted', label: 'Buzlu' }
            ].map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setShowerGlass(g.id as any)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  showerGlass === g.id ? 'bg-amber-500 text-black' : 'text-stone-300 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        {categoryId === 'toilet' && (
          <div className="flex items-center space-x-1.5 bg-stone-900/90 border border-stone-800 p-1.5 rounded-xl text-[10px] font-mono">
            <span className="text-amber-400 font-bold px-1">Klozet Tipi:</span>
            {[
              { id: 'asma', label: 'Asma Klozet' },
              { id: 'yerden', label: 'Yerden Klozet' },
              { id: 'akilli', label: 'Akıllı Klozet' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setToiletType(t.id as any)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  toiletType === t.id ? 'bg-amber-500 text-black' : 'text-stone-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {categoryId === 'sink' && (
          <div className="flex items-center space-x-1.5 bg-stone-900/90 border border-stone-800 p-1.5 rounded-xl text-[10px] font-mono">
            <span className="text-amber-400 font-bold px-1">Lavabo Tipi:</span>
            {[
              { id: 'canak', label: 'Çanak Lavabo' },
              { id: 'tezgah-alti', label: 'Tezgâh Altı' },
              { id: 'ankastre', label: 'Gömme / Mobilyalı' }
            ].map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSinkType(s.id as any)}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                  sinkType === s.id ? 'bg-amber-500 text-black' : 'text-stone-300 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3D SCENE CONTAINER WITH PERSPECTIVE */}
      <div 
        className="relative w-full max-w-2xl h-[480px] flex items-center justify-center transition-transform duration-500 ease-out z-10"
        style={{ 
          transform: `rotateY(${rotationAngle}deg) rotateX(${elevationAngle}deg) scale(${zoomLevel})`,
          transformStyle: 'preserve-3d'
        }}
      >

        {/* ========================================================================= */}
        {/* 1. GARDIROP (WARDROBE)                                                    */}
        {/* ========================================================================= */}
        {categoryId === 'wardrobe' && (
          <div 
            className="w-[460px] h-[380px] rounded-2xl border-4 border-stone-900 p-2 shadow-2xl relative flex flex-col justify-between"
            style={{ backgroundColor: '#121212', perspective: '1000px' }}
          >
            {renderLedStrip()}
            
            <div className="w-full h-full border-2 border-black/40 rounded-xl p-2 grid grid-cols-3 gap-2 relative shadow-inner" style={{ backgroundColor: selectedColor.hex }}>
              
              {/* LEFT BAY */}
              <div className="bg-black/50 rounded-lg p-1.5 relative border border-white/10 flex flex-col justify-between overflow-hidden">
                <div className="w-full h-full relative space-y-1 overflow-y-auto pr-0.5">
                  {placedParts.filter(p => p.section === 'left').map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectPart(p.id)}
                      className={`w-full py-1.5 px-1.5 rounded transition-all cursor-pointer flex items-center justify-between text-[9px] font-bold shadow ${
                        selectedPartId === p.id ? 'bg-amber-500 text-black ring-2 ring-amber-300' : 'bg-stone-900/90 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[7px] font-mono text-stone-400">{p.heightOffsetCm}cm</span>
                    </div>
                  ))}
                  {/* Default chrome hanger rod inside if empty */}
                  <div className="w-full h-2 bg-gradient-to-r from-stone-400 via-white to-stone-400 rounded my-2 shadow flex justify-center items-center">
                    <span className="text-[7px] font-mono text-black font-extrabold">Krom Askı Borusu</span>
                  </div>
                </div>

                {/* Left Door */}
                <div 
                  className="absolute inset-0 rounded-lg border border-black/50 shadow-2xl transition-transform duration-700 cursor-pointer flex flex-col items-end justify-center p-2 z-20"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    transform: isOpenDoors ? 'rotateY(-95deg)' : 'none',
                    transformOrigin: 'left center'
                  }}
                >
                  {isOpenDoors && renderHinges()}
                  <div className="w-2.5 h-16 bg-gradient-to-b from-stone-800 via-stone-400 to-stone-900 rounded-full border border-stone-600 shadow-md" title="Lüks Dikey Kulp" />
                </div>
              </div>

              {/* CENTER BAY */}
              <div className="bg-black/50 rounded-lg p-1.5 relative border border-white/10 flex flex-col justify-between overflow-hidden">
                <div className="w-full h-full relative space-y-1 overflow-y-auto pr-0.5">
                  {placedParts.filter(p => p.section === 'center' || p.section === 'top' || p.section === 'bottom').map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectPart(p.id)}
                      className={`w-full py-1.5 px-1.5 rounded transition-all cursor-pointer flex items-center justify-between text-[9px] font-bold shadow ${
                        selectedPartId === p.id ? 'bg-amber-500 text-black ring-2 ring-amber-300' : 'bg-stone-900/90 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[7px] font-mono text-stone-400">{p.heightOffsetCm}cm</span>
                    </div>
                  ))}
                </div>

                {/* Center Mirror / Glass Panel */}
                <div 
                  className="absolute inset-0 rounded-lg border border-black/40 shadow-2xl transition-transform duration-700 cursor-pointer flex flex-col items-center justify-center p-2 z-20 bg-gradient-to-tr from-stone-200/20 via-white/40 to-stone-300/30 backdrop-blur"
                  style={{ 
                    transform: isOpenDoors ? 'translateZ(-15px) scale(0.95)' : 'none'
                  }}
                >
                  <span className="text-[9px] font-extrabold text-stone-800 uppercase bg-white/70 px-2 py-0.5 rounded shadow">
                    Boy Aynası
                  </span>
                </div>
              </div>

              {/* RIGHT BAY */}
              <div className="bg-black/50 rounded-lg p-1.5 relative border border-white/10 flex flex-col justify-between overflow-hidden">
                <div className="w-full h-full relative space-y-1 overflow-y-auto pr-0.5">
                  {placedParts.filter(p => p.section === 'right').map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectPart(p.id)}
                      className={`w-full py-1.5 px-1.5 rounded transition-all cursor-pointer flex items-center justify-between text-[9px] font-bold shadow ${
                        selectedPartId === p.id ? 'bg-amber-500 text-black ring-2 ring-amber-300' : 'bg-stone-900/90 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[7px] font-mono text-stone-400">{p.heightOffsetCm}cm</span>
                    </div>
                  ))}
                  {/* Bottom Drawer Box inside Right Bay */}
                  <div 
                    className="w-full h-12 border border-stone-600 rounded p-1 transition-transform duration-500 relative flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedColor.hex,
                      transform: isOpenDoors ? 'translateZ(25px)' : 'none' 
                    }}
                  >
                    {isOpenDoors && renderDrawerRails()}
                    <div className="w-8 h-1.5 bg-black/60 rounded-full" />
                    <span className="text-[7px] font-mono text-stone-900 font-bold absolute bottom-0.5">Frenli Çekmece</span>
                  </div>
                </div>

                {/* Right Door */}
                <div 
                  className="absolute inset-0 rounded-lg border border-black/50 shadow-2xl transition-transform duration-700 cursor-pointer flex flex-col items-start justify-center p-2 z-20"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    transform: isOpenDoors ? 'rotateY(95deg)' : 'none',
                    transformOrigin: 'right center'
                  }}
                >
                  {isOpenDoors && renderHinges()}
                  <div className="w-2.5 h-16 bg-gradient-to-b from-stone-800 via-stone-400 to-stone-900 rounded-full border border-stone-600 shadow-md" title="Lüks Dikey Kulp" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. MUTFAK DOLABI (KITCHEN CABINET WITH COUNTERTOP & SINK)                 */}
        {/* ========================================================================= */}
        {categoryId === 'kitchen' && (
          <div className="w-[520px] h-[390px] flex flex-col justify-between space-y-2 relative" style={{ perspective: '1000px' }}>
            
            {/* UPPER KITCHEN CABINETS (ÜST DOLAPLAR) */}
            <div 
              className="w-full h-32 rounded-xl border-2 border-stone-800 p-2 shadow-2xl grid grid-cols-4 gap-2 relative"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {renderLedStrip()}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-full border border-black/30 rounded-lg bg-stone-950/20 relative flex flex-col justify-end items-center p-1 overflow-hidden">
                  <div 
                    className="absolute inset-0 rounded-lg border border-black/40 shadow transition-transform duration-700 flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedColor.hex,
                      transform: isOpenDoors ? (i % 2 === 1 ? 'rotateY(-85deg)' : 'rotateY(85deg)') : 'none',
                      transformOrigin: i % 2 === 1 ? 'left center' : 'right center'
                    }}
                  >
                    <div className="w-1.5 h-6 bg-black/60 rounded-full" />
                  </div>
                  <span className="text-[8px] font-bold text-stone-300">Üst Dolap #{i}</span>
                </div>
              ))}
            </div>

            {/* COUNTERTOP SLAB & STAINLESS SINK (TEZGÂH VE EVYE) */}
            <div className="w-full h-14 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-300 rounded-xl border-2 border-stone-400 shadow-2xl flex items-center justify-between px-6 relative">
              <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                Akrilik / Kuvars Tezgâh
              </span>

              {/* SINK (EVYE) & FAUCET (BATARYA) */}
              <div className="w-32 h-10 bg-gradient-to-br from-stone-400 via-stone-200 to-stone-500 rounded-lg border-2 border-stone-600 shadow-inner flex items-center justify-center relative">
                {/* Swan-neck Chrome Faucet */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-6 border-t-4 border-r-4 border-stone-300 rounded-tr-full shadow" title="Krom Evye Bataryası" />
                <span className="text-[8px] font-mono font-bold text-stone-800">Paslanmaz Evye</span>
              </div>
            </div>

            {/* LOWER KITCHEN CABINETS & DRAWERS (ALT DOLAPLAR & ÇEKMECELER) */}
            <div 
              className="w-full h-36 rounded-xl border-2 border-stone-800 p-2 shadow-2xl grid grid-cols-4 gap-2 relative"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {/* Lower Drawers & Doors */}
              <div className="h-full border border-black/30 rounded-lg p-1 space-y-1 bg-black/40">
                <div 
                  className="w-full h-10 bg-stone-900 border border-stone-600 rounded flex items-center justify-center transition-transform duration-500"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    transform: isOpenDoors ? 'translateZ(20px)' : 'none' 
                  }}
                >
                  <div className="w-8 h-1 bg-black/70 rounded-full" />
                </div>
                <div 
                  className="w-full h-18 bg-stone-900 border border-stone-600 rounded flex items-center justify-center transition-transform duration-500"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    transform: isOpenDoors ? 'translateZ(20px)' : 'none' 
                  }}
                >
                  <div className="w-8 h-1 bg-black/70 rounded-full" />
                </div>
              </div>

              {[2, 3, 4].map((i) => (
                <div key={i} className="h-full border border-black/30 rounded-lg bg-black/30 relative flex items-center justify-center p-1">
                  <div 
                    className="absolute inset-0 rounded-lg border border-black/40 shadow transition-transform duration-700 flex items-center justify-center"
                    style={{ 
                      backgroundColor: selectedColor.hex,
                      transform: isOpenDoors ? (i % 2 === 0 ? 'rotateY(-85deg)' : 'rotateY(85deg)') : 'none',
                      transformOrigin: i % 2 === 0 ? 'left center' : 'right center'
                    }}
                  >
                    <div className="w-2 h-8 bg-black/60 rounded-full" />
                  </div>
                  <span className="text-[8px] font-bold text-stone-300">Alt Modül #{i}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. BANYO DOLABI (BATHROOM VANITY WITH BASIN & MIRROR)                    */}
        {/* ========================================================================= */}
        {categoryId === 'bathroom' && (
          <div className="w-[380px] h-[390px] flex flex-col justify-between items-center space-y-3 relative" style={{ perspective: '1000px' }}>
            
            {/* UPPER MIRROR UNIT WITH LED */}
            <div className="w-full h-40 bg-gradient-to-tr from-stone-300/40 via-white/80 to-stone-200/50 rounded-2xl border-4 border-stone-700 shadow-2xl backdrop-blur relative flex flex-col justify-between p-3">
              {renderLedStrip()}
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider bg-white/80 px-3 py-1 rounded-xl shadow">
                  Banyo Aynası &amp; LED
                </span>
              </div>
            </div>

            {/* WHITE PORCELAIN VESSEL BASIN (ÇANAK LAVABO) */}
            <div className="w-52 h-14 bg-white border-2 border-stone-300 rounded-full shadow-2xl flex items-center justify-center relative -my-4 z-20">
              <div className="w-4 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-full absolute -top-4 shadow" title="Lüks Batarya" />
              <div className="w-4 h-4 bg-stone-300 rounded-full border border-stone-400" title="Süzgeç" />
            </div>

            {/* LOWER VANITY CABINET (ALT DOLAP) */}
            <div 
              className="w-full h-40 rounded-2xl border-4 border-stone-900 p-2 shadow-2xl grid grid-cols-2 gap-2 relative z-10"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {[1, 2].map((i) => (
                <div key={i} className="h-full border border-black/30 rounded-xl bg-black/40 relative flex items-center justify-center">
                  <div 
                    className="absolute inset-0 rounded-xl border border-black/40 shadow transition-transform duration-700 flex items-center justify-center p-2"
                    style={{ 
                      backgroundColor: selectedColor.hex,
                      transform: isOpenDoors ? (i === 1 ? 'rotateY(-85deg)' : 'rotateY(85deg)') : 'none',
                      transformOrigin: i === 1 ? 'left center' : 'right center'
                    }}
                  >
                    <div className="w-2 h-12 bg-black/60 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BANYO AYNASI (BATHROOM MIRROR WITH LED BACKLIGHT)                     */}
        {/* ========================================================================= */}
        {categoryId === 'bath-mirror' && (
          <div className="w-[360px] h-[340px] relative flex items-center justify-center p-4">
            
            {/* BACKING PANEL */}
            <div 
              className="w-full h-full rounded-3xl border-4 border-stone-800 p-4 shadow-2xl relative flex flex-col items-center justify-between overflow-hidden"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {/* LED GLOW STRIP */}
              {renderLedStrip()}

              {/* SILVER MIRROR GLASS */}
              <div className="w-full h-full bg-gradient-to-tr from-stone-300/60 via-white/90 to-stone-200/70 backdrop-blur rounded-2xl border-2 border-white/60 shadow-inner flex flex-col items-center justify-center p-4 relative">
                
                {/* Touch Sensor Switch Icon */}
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                    hasLedLighting ? 'border-amber-400 bg-amber-400/30 text-amber-300 animate-pulse' : 'border-stone-400 bg-stone-800/40 text-stone-500'
                  }`}
                  title="Dokunmatik LED Sensörü"
                >
                  <span className="text-[10px] font-bold">⏻</span>
                </div>

                <span className="text-xs font-black text-stone-900 uppercase tracking-widest mt-3 bg-white/80 px-3 py-1 rounded-xl shadow">
                  Flotal Lüks Ayna Camı
                </span>
                <span className="text-[9px] font-mono font-bold text-stone-600 mt-1">
                  Ölçü: {dimWidth}x{dimHeight} {unit}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. KİLER DOLABI (PANTRY TALL CABINET WITH PULL-OUT SHELVES)               */}
        {/* ========================================================================= */}
        {categoryId === 'pantry' && (
          <div 
            className="w-[280px] h-[400px] rounded-2xl border-4 border-stone-900 p-2 shadow-2xl relative flex flex-col justify-between"
            style={{ backgroundColor: '#141414', perspective: '1000px' }}
          >
            {renderLedStrip()}

            {/* INTERNAL PANTRY RACKS */}
            <div className="w-full h-full border-2 border-black/40 rounded-xl p-2 flex flex-col justify-between space-y-2 relative bg-stone-950/80 shadow-inner">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full h-10 border border-amber-500/40 bg-stone-900 rounded-lg p-1 flex items-center justify-between text-[9px] text-amber-300 font-bold shadow">
                  <span>Metal Sepetli Kiler Rafı #{i}</span>
                  <span className="text-[7px] font-mono text-stone-400">Teleskopik</span>
                </div>
              ))}

              {/* SINGLE TALL PANTRY DOOR */}
              <div 
                className="absolute inset-0 rounded-xl border-2 border-black/50 shadow-2xl transition-transform duration-700 cursor-pointer flex items-center justify-end p-3 z-20"
                style={{ 
                  backgroundColor: selectedColor.hex,
                  transform: isOpenDoors ? 'rotateY(-100deg)' : 'none',
                  transformOrigin: 'left center'
                }}
              >
                {isOpenDoors && renderHinges()}
                <div className="w-3 h-24 bg-gradient-to-b from-stone-800 via-stone-400 to-stone-900 rounded-full border border-stone-600 shadow-lg" title="Kiler Kulpu" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. VESTİYER (HALLWAY COAT RACK & SHOE BENCH UNIT)                         */}
        {/* ========================================================================= */}
        {categoryId === 'vestiyer' && (
          <div 
            className="w-[440px] h-[390px] rounded-2xl border-4 border-stone-900 p-2 shadow-2xl grid grid-cols-3 gap-2 relative"
            style={{ backgroundColor: selectedColor.hex, perspective: '1000px' }}
          >
            {/* LEFT BAY: COAT HANGER HOOKS & BENCH SEAT */}
            <div className="col-span-2 bg-black/50 rounded-xl p-2 flex flex-col justify-between relative border border-white/10">
              
              {/* Coat Hanger Hooks */}
              <div className="w-full h-24 bg-stone-900/90 rounded-lg p-2 flex justify-around items-center border border-amber-500/30">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <div className="w-2 h-4 bg-amber-400 rounded-t shadow" title="Askı Kancası" />
                    <span className="text-[7px] font-mono text-stone-400">Askı #{i}</span>
                  </div>
                ))}
              </div>

              {/* Padded Bench Seat (Oturma Pufu) */}
              <div className="w-full h-12 bg-stone-800 rounded-lg border-2 border-stone-600 flex items-center justify-center shadow">
                <span className="text-[9px] font-bold text-amber-300 uppercase">Kapitone Oturma Pufu</span>
              </div>

              {/* Lower Shoe Cabinet Under Bench */}
              <div className="w-full h-16 bg-stone-900 rounded-lg p-1 border border-stone-700 flex items-center justify-center">
                <span className="text-[8px] font-mono text-stone-300">Alt Ayakkabılık Bölmesi</span>
              </div>
            </div>

            {/* RIGHT BAY: TALL MIRRORED CUPBOARD */}
            <div className="bg-black/50 rounded-xl p-1.5 relative border border-white/10 flex flex-col justify-between overflow-hidden">
              <div className="w-full h-full relative space-y-1 overflow-y-auto">
                <span className="text-[8px] text-amber-300 font-bold p-1 block">İç Raf Modülleri</span>
              </div>

              {/* Mirror Door */}
              <div 
                className="absolute inset-0 rounded-xl border border-black/50 shadow-2xl transition-transform duration-700 cursor-pointer flex items-center justify-start p-2 z-20 bg-gradient-to-tr from-stone-300/40 via-white/80 to-stone-200/50 backdrop-blur"
                style={{ 
                  transform: isOpenDoors ? 'rotateY(90deg)' : 'none',
                  transformOrigin: 'right center'
                }}
              >
                <span className="text-[8px] font-bold text-stone-900 uppercase bg-white/80 px-1.5 py-0.5 rounded shadow">
                  Boy Aynası
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. TV ÜNİTESİ (TV UNIT WITH BACK PANEL & TV MESH)                        */}
        {/* ========================================================================= */}
        {categoryId === 'tv-unit' && (
          <div className="w-[480px] h-[380px] flex flex-col justify-between items-center space-y-3 relative" style={{ perspective: '1000px' }}>
            
            {/* TV WALL BACK PANEL */}
            <div 
              className="w-full h-64 rounded-2xl border-4 border-stone-900 p-4 shadow-2xl relative flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {renderLedStrip()}

              {/* 3D FLAT SCREEN TV MESH */}
              <div className="w-72 h-44 bg-black border-4 border-stone-800 rounded-xl shadow-2xl flex flex-col items-center justify-between p-3 relative">
                <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-950 to-black rounded-lg flex items-center justify-center border border-stone-800">
                  <span className="text-xs font-black text-stone-600 tracking-widest uppercase">4K Ultra HD TV</span>
                </div>
                {/* TV Stand Base */}
                <div className="w-16 h-2 bg-stone-700 rounded-full -mb-1 shadow" />
              </div>
            </div>

            {/* LOWER MEDIA CONSOLE WITH DRAWERS */}
            <div 
              className="w-full h-24 rounded-2xl border-4 border-stone-900 p-2 shadow-2xl grid grid-cols-3 gap-2 relative"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-full border border-black/40 rounded-xl bg-stone-950 flex flex-col items-center justify-center transition-transform duration-500 cursor-pointer shadow"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    transform: isOpenDoors ? 'translateZ(25px)' : 'none' 
                  }}
                >
                  {isOpenDoors && renderDrawerRails()}
                  <div className="w-8 h-1.5 bg-black/60 rounded-full" />
                  <span className="text-[7px] font-mono text-stone-900 font-bold mt-1">Konsol Çekmece #{i}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 8. KİTAPLIK (BOOKCASE WITH SHELF TIERS)                                   */}
        {/* ========================================================================= */}
        {categoryId === 'bookshelf' && (
          <div 
            className="w-[340px] h-[400px] rounded-2xl border-4 border-stone-900 p-3 shadow-2xl flex flex-col justify-between relative"
            style={{ backgroundColor: selectedColor.hex }}
          >
            {renderLedStrip()}

            <div className="w-full h-full border-2 border-black/40 rounded-xl p-2 bg-black/50 grid grid-rows-5 gap-2 relative shadow-inner">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full border-b-2 border-stone-600 flex items-center justify-between px-2 text-[9px] text-amber-300 font-bold">
                  <span>Kitaplık Raf Seviyesi #{i}</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-5 bg-red-700 rounded-sm" />
                    <div className="w-2 h-6 bg-blue-700 rounded-sm" />
                    <div className="w-2 h-4 bg-emerald-700 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. ÇALIŞMA MASASI (STUDY DESK WITH LEGS & DRAWER PEDESTAL)               */}
        {/* ========================================================================= */}
        {categoryId === 'desk' && (
          <div className="w-[460px] h-[340px] flex flex-col justify-between items-center relative" style={{ perspective: '1000px' }}>
            
            {/* THICK DESKTOP BOARD */}
            <div 
              className="w-full h-12 rounded-xl border-2 border-stone-800 shadow-2xl flex items-center justify-between px-6 relative z-10"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">
                Çalışma Masası Üst Tablası
              </span>

              {/* Cable Hole Grommet */}
              <div className="w-5 h-5 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center" title="Kablo Kanalı">
                <div className="w-2 h-2 bg-stone-950 rounded-full" />
              </div>
            </div>

            {/* LEGS & DRAWER PEDESTAL */}
            <div className="w-full h-56 flex justify-between items-stretch space-x-4 relative">
              
              {/* Left Metallic / Wood Legs */}
              <div className="w-8 h-full bg-gradient-to-b from-stone-800 via-stone-700 to-stone-900 rounded-b-xl border-2 border-stone-900 shadow-xl" />

              {/* Right Drawer Pedestal (Keson / Çekmece Bloğu) */}
              <div 
                className="w-48 h-full rounded-xl border-2 border-stone-800 p-2 shadow-2xl flex flex-col justify-between space-y-2"
                style={{ backgroundColor: selectedColor.hex }}
              >
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="w-full h-full border border-black/40 bg-stone-950 rounded-lg flex items-center justify-center transition-transform duration-500 cursor-pointer"
                    style={{ 
                      backgroundColor: selectedColor.hex,
                      transform: isOpenDoors ? 'translateZ(20px)' : 'none' 
                    }}
                  >
                    {isOpenDoors && renderDrawerRails()}
                    <div className="w-6 h-1 bg-black/70 rounded-full" />
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 10. AYAKKABILIK (SHOE CABINET WITH DROP-DOWN DOORS)                      */}
        {/* ========================================================================= */}
        {categoryId === 'shoe-rack' && (
          <div 
            className="w-[340px] h-[380px] rounded-2xl border-4 border-stone-900 p-3 shadow-2xl flex flex-col justify-between space-y-2 relative"
            style={{ backgroundColor: selectedColor.hex, perspective: '1000px' }}
          >
            {renderLedStrip()}

            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-24 border border-black/40 rounded-xl bg-black/40 relative flex items-center justify-center overflow-hidden">
                <span className="text-[8px] font-mono text-stone-300 font-bold">Ayakkabı Rafı #{i}</span>

                {/* Drop-down Door Panel */}
                <div 
                  className="absolute inset-0 rounded-xl border border-black/50 shadow-2xl transition-transform duration-700 cursor-pointer flex flex-col items-center justify-center p-2 z-20"
                  style={{ 
                    backgroundColor: selectedColor.hex,
                    transform: isOpenDoors ? 'rotateX(60deg)' : 'none',
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="w-8 h-1.5 bg-black/60 rounded-full" />
                  <span className="text-[8px] font-mono text-stone-900 font-bold mt-1">Düşer Kapak</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 11. KAHVE KÖŞESİ (COFFEE CORNER WITH NOOK & CUP RACK)                     */}
        {/* ========================================================================= */}
        {categoryId === 'coffee-corner' && (
          <div className="w-[420px] h-[390px] flex flex-col justify-between space-y-2 relative" style={{ perspective: '1000px' }}>
            
            {/* UPPER SHELF & CUP RACK */}
            <div 
              className="w-full h-24 rounded-xl border-2 border-stone-800 p-2 shadow-2xl flex flex-col justify-between relative"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {renderLedStrip()}
              <div className="w-full h-full bg-black/40 rounded-lg p-2 flex justify-around items-center border border-white/10">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-1.5 h-3 bg-amber-400 rounded-t" title="Fincan Kancası" />
                    <div className="w-3 h-3 bg-white rounded-full border border-stone-400 shadow" title="Porselen Fincan" />
                  </div>
                ))}
              </div>
            </div>

            {/* COFFEE MACHINE NOOK COUNTER */}
            <div className="w-full h-28 bg-stone-950 border-2 border-amber-500/40 rounded-xl p-3 shadow-2xl flex items-center justify-between relative">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">
                Kahve Makinesi Niche Bölümü
              </span>

              {/* 3D Coffee Machine Silhouette */}
              <div className="w-20 h-20 bg-stone-800 border-2 border-stone-600 rounded-lg shadow-xl flex flex-col items-center justify-between p-1">
                <div className="w-4 h-2 bg-amber-500 rounded-full" title="Kahve Akış Ağzı" />
                <div className="w-6 h-6 bg-stone-300 rounded border border-stone-400" title="Espresso Bardağı" />
              </div>
            </div>

            {/* LOWER CABINET WITH DOORS & DRAWERS */}
            <div 
              className="w-full h-32 rounded-xl border-2 border-stone-800 p-2 shadow-2xl grid grid-cols-2 gap-2 relative"
              style={{ backgroundColor: selectedColor.hex }}
            >
              {[1, 2].map((i) => (
                <div key={i} className="h-full border border-black/30 rounded-lg bg-black/40 relative flex items-center justify-center">
                  <div 
                    className="absolute inset-0 rounded-lg border border-black/40 shadow transition-transform duration-700 flex items-center justify-center p-2"
                    style={{ 
                      backgroundColor: selectedColor.hex,
                      transform: isOpenDoors ? (i === 1 ? 'rotateY(-85deg)' : 'rotateY(85deg)') : 'none',
                      transformOrigin: i === 1 ? 'left center' : 'right center'
                    }}
                  >
                    <div className="w-2 h-10 bg-black/60 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 12. İÇ ODA KAPISI (INTERIOR DOOR WITH FRAME & SWINGING PANEL)            */}
        {/* ========================================================================= */}
        {categoryId === 'door' && (
          <div className="w-[300px] h-[410px] relative border-8 border-stone-900 bg-stone-950 rounded-2xl shadow-2xl flex items-center justify-center p-2" style={{ perspective: '900px' }}>
            <div className="w-full h-full bg-stone-900 rounded-lg relative flex items-center justify-center border border-stone-800">
              
              {/* DOOR LEAF PANEL */}
              <div 
                className="absolute inset-0 rounded-lg border-2 border-black/50 flex flex-col justify-between p-4 shadow-2xl transition-transform duration-700 cursor-pointer z-20"
                style={{ 
                  backgroundColor: selectedColor.hex,
                  transform: isOpenDoors ? 'rotateY(-80deg)' : 'none',
                  transformOrigin: 'left center'
                }}
              >
                {isOpenDoors && renderHinges()}

                {/* Raised Panels or Glass Insert */}
                <div className="w-full h-32 border-2 border-black/20 rounded-lg bg-white/20 backdrop-blur shadow-inner flex items-center justify-center">
                  <span className="text-[9px] font-bold text-stone-800 uppercase bg-white/70 px-2 py-0.5 rounded shadow">
                    Lüks Derin Derzli Panel
                  </span>
                </div>

                {/* Door Handle Latch */}
                <div className="w-3.5 h-16 bg-gradient-to-b from-stone-800 via-stone-400 to-stone-900 rounded-full self-end mr-2 border border-black/40 shadow-lg flex flex-col items-center justify-center" title="Lüks Kapı Kolu">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 13. ÇELİK KAPı (STEEL ARMORED DOOR WITH LOCKS & PEEPHOLE)                 */}
        {/* ========================================================================= */}
        {categoryId === 'steel-door' && (
          <div className="w-[310px] h-[410px] relative border-8 border-stone-950 bg-stone-950 rounded-2xl shadow-2xl flex items-center justify-center p-2" style={{ perspective: '900px' }}>
            <div className="w-full h-full bg-black rounded-lg relative flex items-center justify-center border border-stone-800">
              
              {/* STEEL ARMORED DOOR PANEL */}
              <div 
                className="absolute inset-0 rounded-lg border-4 border-stone-900 flex flex-col justify-between p-4 shadow-2xl transition-transform duration-700 cursor-pointer z-20"
                style={{ 
                  backgroundColor: selectedColor.hex,
                  transform: isOpenDoors ? 'rotateY(-80deg)' : 'none',
                  transformOrigin: 'left center'
                }}
              >
                {isOpenDoors && renderHinges()}

                {/* PEEPHOLE (DÜRBÜN) */}
                <div className="w-5 h-5 bg-amber-500 rounded-full border-2 border-stone-900 shadow self-center flex items-center justify-center" title="Geniş Açı Kameralı Dürbün">
                  <div className="w-2 h-2 bg-black rounded-full" />
                </div>

                {/* HEAVY DUTY STEEL HANDLE & KALE MULTI-LOCK CYLINDERS */}
                <div className="self-end mr-2 flex flex-col items-center space-y-2">
                  <div className="w-4 h-20 bg-gradient-to-b from-stone-700 via-stone-300 to-stone-800 rounded-lg border border-black shadow-2xl flex flex-col justify-between p-1" title="Çelik Kapı Kolu">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  </div>
                  <div className="w-3 h-3 bg-amber-400 rounded-full border border-black shadow" title="Kale Emniyet Kilit Göbeği" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 14. DUŞAKABİN (SHOWER ENCLOSURE WITH GLASS & PROFILES)                   */}
        {/* ========================================================================= */}
        {categoryId === 'shower' && (
          <div className="w-[360px] h-[390px] border-4 border-stone-800 bg-sky-950/20 rounded-2xl p-3 relative shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* GLASS ENCLOSURE SHAPE */}
            <div className={`w-full h-full backdrop-blur rounded-2xl border-4 border-amber-500/50 flex flex-col items-center justify-between p-3 relative shadow-inner ${
              showerGlass === 'fume' ? 'bg-stone-900/80' : showerGlass === 'frosted' ? 'bg-white/40' : 'bg-sky-200/20'
            }`}>
              {/* Rain Shower Head Fixture */}
              <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center bg-stone-900/90 shadow">
                <div className="w-4 h-4 rounded-full bg-sky-400 animate-pulse" />
              </div>

              <span className="text-[10px] font-black text-white uppercase tracking-wider text-center bg-black/60 px-3 py-1 rounded-xl border border-stone-700 shadow">
                {showerShape.toUpperCase()} 8mm Temperli Cam ({showerGlass.toUpperCase()})
              </span>

              {/* Base Tray */}
              <div className="w-full h-4 bg-stone-200 rounded-lg border border-stone-400 shadow" title="Duş Teknesi" />
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 15. LAVABO (SANITARY SINK MODELS)                                        */}
        {/* ========================================================================= */}
        {categoryId === 'sink' && (
          <div className="w-[340px] h-[340px] flex flex-col items-center justify-center p-2 space-y-4">
            
            {/* PORCELAIN SINK BOWL */}
            <div className="w-60 h-32 bg-white rounded-3xl border-4 border-stone-300 shadow-2xl flex flex-col items-center justify-center relative p-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 bg-stone-900 flex items-center justify-center -mt-8 shadow">
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
              </div>
              <span className="text-[10px] font-black text-stone-900 uppercase mt-2 text-center">
                {sinkType.toUpperCase()} Lüks Porselen Lavabo
              </span>
            </div>

            {/* COUNTER PEDESTAL */}
            <div className="w-full h-20 rounded-2xl p-2 flex items-center justify-center shadow border border-stone-800" style={{ backgroundColor: selectedColor.hex }}>
              <span className="text-[10px] font-bold text-stone-900 uppercase">Tezgâh Tablası</span>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 16. KLOZET (TOILET MODELS)                                              */}
        {/* ========================================================================= */}
        {categoryId === 'toilet' && (
          <div className="w-[280px] h-[360px] flex flex-col items-center justify-center p-2 space-y-3">
            
            {/* CONCEALED FLUSH TANK / WALL PANEL */}
            <div className="w-full h-24 bg-stone-900 rounded-xl border-2 border-stone-700 flex items-center justify-center p-2 shadow">
              <div className="w-12 h-6 bg-stone-800 border-2 border-amber-500 rounded-lg flex justify-around items-center cursor-pointer shadow" title="Gömme Rezervuar Kumanda Paneli">
                <div className="w-3 h-3 rounded-full bg-stone-300" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
            </div>

            {/* TOILET BOWL */}
            <div className="w-48 h-40 bg-white rounded-b-full border-4 border-stone-300 shadow-2xl flex flex-col items-center justify-center relative p-3">
              <div className="w-36 h-20 bg-stone-100 border-2 border-stone-200 rounded-b-full shadow-inner flex items-center justify-center">
                <span className="text-[9px] font-black text-stone-800 uppercase">
                  {toiletType.toUpperCase()} Bide Sistem
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 17. FAYANS (WALL TILES SURFACE)                                          */}
        {/* ========================================================================= */}
        {categoryId === 'tile' && (
          <div className="w-[460px] h-[380px] bg-stone-900 border-4 border-stone-800 rounded-2xl p-3 relative shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="w-full h-8 bg-stone-950 rounded-xl border border-stone-800 px-3 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Duvar Fayans Kaplaması ({dimWidth}x{dimHeight} {unit})</span>
            </div>
            <div className="w-full h-72 rounded-xl border border-stone-700 p-2 grid grid-cols-4 grid-rows-3 gap-1.5 shadow-inner" style={{ backgroundColor: '#181818' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-full h-full rounded-md border border-stone-900/60 flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform" 
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <span className="text-[8px] font-mono text-black/60 font-black">30x60</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 18. SERAMİK (FLOOR CERAMICS TILES GRID)                                   */}
        {/* ========================================================================= */}
        {categoryId === 'seramik' && (
          <div className="w-[460px] h-[380px] bg-stone-900 border-4 border-stone-800 rounded-2xl p-3 relative shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="w-full h-8 bg-stone-950 rounded-xl border border-stone-800 px-3 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Zemin Seramik Döşemesi ({dimWidth}x{dimHeight} {unit})</span>
            </div>
            <div className="w-full h-72 rounded-xl border border-stone-700 p-2 grid grid-cols-3 grid-rows-3 gap-1.5 shadow-inner" style={{ backgroundColor: '#121212' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-full h-full rounded-md border border-stone-900/80 flex items-center justify-center shadow" 
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <span className="text-[8px] font-mono text-black/60 font-black">60x60</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 19. PARKE (ROOM FLOOR PARQUET PLANKS)                                    */}
        {/* ========================================================================= */}
        {categoryId === 'parke' && (
          <div className="w-[460px] h-[380px] bg-stone-900 border-4 border-stone-800 rounded-2xl p-3 relative shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="w-full h-8 bg-stone-950 rounded-xl border border-stone-800 px-3 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Lamine Ahşap Parke Kaplama ({dimWidth}x{dimHeight} {unit})</span>
            </div>
            <div className="w-full h-72 rounded-xl border border-stone-700 p-2 grid grid-cols-6 grid-rows-6 gap-1 shadow-inner" style={{ backgroundColor: '#1a1a1a' }}>
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-full h-full rounded-sm border border-black/40 flex items-center justify-center shadow-sm" 
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <span className="text-[6px] font-mono text-black/50 font-bold">Derz</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 20. MERMER / GRANİT / KUVARS TEZGÂH (MARBLE/GRANITE/QUARTZ SLAB)           */}
        {/* ========================================================================= */}
        {(categoryId === 'mermer-counter' || categoryId === 'granit-counter' || categoryId === 'kuvars-counter') && (
          <div className="w-[480px] h-[300px] flex flex-col justify-between items-center space-y-4 relative">
            <div className="w-full h-44 bg-gradient-to-r from-stone-200 via-stone-100 to-stone-300 rounded-2xl border-4 border-stone-400 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[11px] font-black text-stone-900 uppercase tracking-widest z-10">
                {activeCategory.name} Lüks Slab ({dimWidth}x{dimDepth} {unit})
              </span>

              {/* Marble Veins / Grain texture lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

              <div className="w-40 h-16 border-2 border-stone-500 bg-stone-300/70 rounded-xl flex items-center justify-center z-10 shadow">
                <span className="text-[9px] font-mono text-stone-900 font-black">Ankastre Evye Kesim Alanı</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
