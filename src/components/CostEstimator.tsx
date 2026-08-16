import React, { useState } from 'react';
import { Calculator, MessageCircle, HelpCircle, Layers, CheckCircle } from 'lucide-react';

export default function CostEstimator() {
  const [category, setCategory] = useState<'door' | 'kitchen' | 'wardrobe'>('door');
  const [material, setMaterial] = useState('lake'); // 'lake', 'wood-veneer', 'membran', 'melamin'
  const [width, setWidth] = useState(85); // cm for door, or meters for kitchen (e.g. 3.5m)
  const [height, setHeight] = useState(205); // cm
  const [quantity, setQuantity] = useState(4); // default 4 doors
  const [withGlass, setWithGlass] = useState(false);
  const [includeInstallation, setIncludeInstallation] = useState(true);

  // Dynamic parameters mapping
  const materialsList = [
    { id: 'lake', name: 'İpek Mat Akrilik Lake (Premium)', costMultiplier: 1.5, desc: 'Pürüzsüz boya fırınlama zanaati.' },
    { id: 'wood-veneer', name: 'Doğal Ağaç Kaplama & Cila', costMultiplier: 1.6, desc: 'Doğal ceviz / meşe hareli lüks ahşap.' },
    { id: 'membran', name: '3D Vakum Tasarım Membran', costMultiplier: 1.15, desc: 'Neme tam dayanıklı Alman polimer.' },
    { id: 'melamin', name: 'Premium Senkron Ahşap Melamin', costMultiplier: 0.95, desc: 'Dayanıklı, çizilmez yoğun ticari sınıf.' }
  ];

  // Estimates cost calculations
  const calculateCosts = () => {
    let unitBase = 0;
    let laborCost = 0;
    let hardwareCost =0;
    
    const matObj = materialsList.find(m => m.id === material) || materialsList[0];

    if (category === 'door') {
      unitBase = 3200 * matObj.costMultiplier;
      laborCost = 1200;
      hardwareCost = 800; // softclose magnetic handles lock
      if (withGlass) unitBase += 1500;
      
      // Scale based on size slightly if extreme
      if (width > 95 || height > 215) {
        unitBase *= 1.25; // custom oversized tooling cost
      }
    } else if (category === 'kitchen') {
      // For kitchen, width represents running meters (metre tül)
      const runningMeters = width / 100; // e.g. 350cm = 3.5 meters
      unitBase = (12000 * matObj.costMultiplier) * runningMeters;
      laborCost = 4500 * runningMeters;
      hardwareCost = 3500; // Blum accessories drawers handles
    } else {
      // Wardrobe, width represents modules
      const runningMeters = width / 100;
      unitBase = (9000 * matObj.costMultiplier) * runningMeters;
      laborCost = 3000 * runningMeters;
      hardwareCost = 2500;
    }

    const itemTotal = unitBase + laborCost + hardwareCost;
    const finalSubtotal = itemTotal * quantity;
    const installationFee = includeInstallation ? (category === 'door' ? quantity * 400 : finalSubtotal * 0.08) : 0;
    const grandTotal = finalSubtotal + installationFee;

    return {
      unitBase: Math.round(unitBase),
      laborCost: Math.round(laborCost),
      hardwareCost: Math.round(hardwareCost),
      itemTotal: Math.round(itemTotal),
      finalSubtotal: Math.round(finalSubtotal),
      installationFee: Math.round(installationFee),
      grandTotal: Math.round(grandTotal),
    };
  };

  const costData = calculateCosts();

  const getWhatsAppEstimateLink = () => {
    const matObj = materialsList.find(m => m.id === material) || materialsList[0];
    const catText = category === 'door' ? 'Oda Kapısı' : category === 'kitchen' ? 'Mutfak Dolabı' : 'Giyinme Odası / Vestiyer';
    const dimText = category === 'door' 
      ? `Ölçü: ${width}x${height} cm` 
      : `Uzunluk: ${(width/100).toFixed(1)} Metre`;

    const smsText = `Merhaba Nuri Bey, Çat Kapı web sitesindeki akıllı hesaplayıcıdan özel ölçü fiyat teklifi oluşturdum:\n\n` +
                    `*Kategori:* ${catText}\n` +
                    `*Malzeme:* ${matObj.name}\n` +
                    `*Ebatlar:* ${dimText}\n` +
                    `*Adet:* ${quantity} adet\n` +
                    `*Cam:* ${withGlass ? 'Evet olsun' : 'Hayır (Dolu Panel)'}\n` +
                    `*Montaj Hizmeti:* ${includeInstallation ? 'Mersin İçi Kurulum İstiyorum' : 'Hariç'}\n\n` +
                    `*Hesaplanan Yaklaşık Tutar:* ₺${costData.grandTotal.toLocaleString('tr-TR')}\n\n` +
                    `Milimetrik yerinde keşif ölçümü ve üretim sırası termin planlaması hakkında görüşmek isterim.`;
    
    return `https://wa.me/905352194789?text=${encodeURIComponent(smsText)}`;
  };

  return (
    <section id="cost-estimator-panel" className="w-full bg-[#111111] py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-850">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-[#B8934A] uppercase font-mono block mb-3">
            ŞEFFAF VE GERÇEKÇİ MALİYETLENDİRME
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Maliyet &amp; Teklif Hesaplama Yeteneği
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Dürüst işçilik şeffaf planlama ile başlar. Seçtiğiniz mobilya türüne, odanızın kabaca ölçüsüne ve hayal ettiğiniz ahşap kaplama kalitesine göre maliyet hesaplayın.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* USER SELECTION PANEL (Left 7 columns) */}
          <div className="lg:col-span-7 bg-[#161616] border border-stone-850 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-stone-800 pb-3 flex items-center space-x-2">
              <Calculator size={18} className="text-amber-500" />
              <span>Sipariş Şartlarını Girin</span>
            </h3>

            {/* Product Category Multi Tabs */}
            <div>
              <label className="text-stone-300 text-xs font-bold uppercase tracking-wider block mb-3">
                1. Ürün Tipleri
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'door', label: 'Lüks Kapılar' },
                  { id: 'kitchen', label: 'Özel Mutfak' },
                  { id: 'wardrobe', label: 'Dolap / Vestiyer' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCategory(item.id as any);
                      // Adjust width defaults
                      if (item.id === 'door') {
                        setWidth(85);
                      } else {
                        setWidth(350); // 3.5 meters
                      }
                    }}
                    className={`px-3 py-3 rounded-xl border font-bold text-xs tracking-wide uppercase transition-all duration-300 text-center ${
                      category === item.id
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material selector */}
            <div>
              <label className="text-stone-300 text-xs font-bold uppercase tracking-wider block mb-3">
                2. Ahşap Hasılası &amp; Lake Niteliği
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {materialsList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      material === m.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${material === m.id ? 'text-white' : 'text-stone-300'}`}>
                        {m.name}
                      </p>
                      <p className="text-stone-400 text-[10px] mt-1 leading-tight">{m.desc}</p>
                    </div>
                    <span className="text-[10px] text-amber-500/80 font-mono mt-3 uppercase tracking-wider font-extrabold">
                      {m.id === 'lake' || m.id === 'wood-veneer' ? '★ LÜKS SINIF' : '✔ NORM STANDART'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider parameters: Width/Meters, Height, Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Width or length */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-stone-300">
                    {category === 'door' ? 'Kasa Genişlik (En)' : 'Toplam Uzunluk (Genişlik)'}
                  </span>
                  <span className="text-amber-500 font-mono">
                    {category === 'door' ? `${width} cm` : `${(width/100).toFixed(1)} Metre`}
                  </span>
                </div>
                <input
                  type="range"
                  min={category === 'door' ? 65 : 150}
                  max={category === 'door' ? 120 : 700}
                  step={category === 'door' ? 5 : 10}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-stone-500 block">
                  {category === 'door' ? 'Standart kasalar 70-90 cm arası pürüzsüz oturur. Özel üretim de mevcuttur.' : 'Mutfak duvarı boyunca ölçtüğünüz toplam doğrusal mesafe.'}
                </span>
              </div>

              {/* Height (Doors only) */}
              {category === 'door' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span className="text-stone-300">Kasa Yükseklik (Boy)</span>
                    <span className="text-amber-500 font-mono">{height} cm</span>
                  </div>
                  <input
                    type="range"
                    min={180}
                    max={240}
                    step={5}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-500 block">Standart pervazsız boy 205 cm\'dir. Tavan sıfır lüks kapılar opsiyoneldir.</span>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-stone-300">İmalatı Yapılacak Adet</span>
                  <span className="text-amber-500 font-mono">{quantity} Adet</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  step={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-stone-500 block">Adet sayısı arttıkça kargo ve kalıp fire paylarında indirim sağlanır.</span>
              </div>

            </div>

            {/* Extra options checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {category === 'door' && (
                <label className="flex items-center space-x-3 p-3.5 bg-stone-900 rounded-xl border border-stone-850 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={withGlass}
                    onChange={(e) => setWithGlass(e.target.checked)}
                    className="rounded border-stone-800 text-amber-500 focus:ring-amber-500 h-4 w-4 accent-amber-500"
                  />
                  <div>
                    <p className="text-stone-200 text-xs font-bold">Cam Delikli Panels</p>
                    <p className="text-stone-400 text-[9px] mt-0.5">Dekoratif temperli mat/bronz cam entegrasyonu.</p>
                  </div>
                </label>
              )}

              <label className="flex items-center space-x-3 p-3.5 bg-stone-900 rounded-xl border border-stone-850 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeInstallation}
                  onChange={(e) => setIncludeInstallation(e.target.checked)}
                  className="rounded border-stone-800 text-amber-500 focus:ring-amber-500 h-4 w-4 accent-amber-500"
                />
                <div>
                  <p className="text-stone-200 text-xs font-bold">Profesyonel Nakliye &amp; Montaj</p>
                  <p className="text-stone-400 text-[9px] mt-0.5">Yerinde terazi ayarı ve kilit yuva zımparası dahil.</p>
                </div>
              </label>

            </div>

          </div>

          {/* DYNAMIC COST BREAKDOWN (Right 5 columns) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1A1A1A] to-[#121212] border border-amber-500/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-stone-300 text-xs font-black tracking-widest uppercase mb-4 font-mono border-b border-stone-800 pb-2">
                Hesaplanan Teklif Özeti
              </h3>

              {/* Total Figure */}
              <div className="py-6 border-b border-stone-850 text-center">
                <p className="text-stone-400 text-xs uppercase tracking-wider font-bold">Tahsisi Yapılan Tutar</p>
                <div className="flex items-baseline justify-center space-x-1.5 mt-2">
                  <span className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight font-sans">
                    ₺{costData.grandTotal.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-stone-400 text-sm font-semibold">KDV dâhil</span>
                </div>
                <p className="text-[10px] text-stone-400/80 mt-2">
                  {quantity}x Ürün ({materialsList.find(m => m.id === material)?.name}) imalat maliyeti.
                </p>
              </div>

              {/* Graphical Breakdown Bar list */}
              <div className="py-6 border-b border-stone-850 space-y-4">
                <h4 className="text-stone-200 text-xs font-bold uppercase tracking-wider">Maliyet Dağılım Çizelgesi</h4>
                
                {/* 1. Malzeme */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Layers size={11} className="text-amber-500" />
                      Yarı Mamül &amp; Panel Hammaddesi
                    </span>
                    <span className="font-mono font-bold">₺{(costData.unitBase * quantity).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-550 h-full rounded-full transition-all duration-500 bg-amber-500" style={{ width: '55%' }} />
                  </div>
                </div>

                {/* 2. El İşçiliği Atölye */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span className="flex items-center gap-1.5">
                      Kalifiye El Zanaati &amp; Fırın Lake Boyası
                    </span>
                    <span className="font-mono font-bold">₺{(costData.laborCost * quantity).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '25%' }} />
                  </div>
                </div>

                {/* 3. Aksesuar Menteşe Kilit */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-300">
                    <span className="flex items-center gap-1.5">
                      Gömme Aksesuar &amp; Kale Kilit Yuvaları
                    </span>
                    <span className="font-mono font-bold">₺{(costData.hardwareCost * quantity).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-stone-500 h-full rounded-full transition-all duration-500" style={{ width: '12%' }} />
                  </div>
                </div>

                {/* Lojistik */}
                {includeInstallation && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-300">
                      <span>Nakliye &amp; Hassas Milimetrik Montaj</span>
                      <span className="font-mono font-bold">₺{costData.installationFee.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '8%' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Guarantee points */}
              <div className="py-4 space-y-2.5">
                {[
                  'Ücretsiz Mersin içi milimetrik ön yerinde keşif ölçümü.',
                  'Atölyede montaj öncesi 2 kez zımparalama ve 2 kez astar dairesi.',
                  'Tüm kilitler için amortisörlü sessiz Kale Kilit standarttır.',
                ].map((pt, idx) => (
                  <div key={idx} className="flex items-start text-stone-300 text-[11px]">
                    <CheckCircle size={12} className="text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* CTA Outbound Hook */}
            <div className="pt-6 border-t border-stone-850 mt-4">
              <a
                href={getWhatsAppEstimateLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl transition-all flex items-center justify-center shadow-xl shadow-emerald-950/20"
              >
                <MessageCircle size={16} className="mr-2 animate-bounce" />
                NURİ YANIK'TAN ÖLÇÜ SİPARİŞİ OLUŞTUR
              </a>
              <span className="text-[10px] text-stone-500 text-center block mt-3 leading-tight">
                *İsim, adet ve ebat bilgileri otomatik olarak kurgulanıp iletilecektir.
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
