import React from 'react';
import { Award, Shield, Settings, Heart, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface CorporateProps {
  siteSettings?: SiteSettings;
  onNavigateTab?: (tab: string) => void;
}

export default function Corporate({ siteSettings, onNavigateTab }: CorporateProps) {
  const promo = siteSettings?.promoSection || {
    title: 'Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri',
    subtitle: "MERSİN'İN LOKAL DEĞERİ",
    description: "ÇAT KAPI, Mersin Akdeniz'deki modern imalat tesisinde, Nuri Yanık liderliğinde, sıradan fabrikasyon yapı market algısını yıkmak; evine hak ettiği sıcaklığı ve lüksü kazandırmak isteyen seçkin müşterilerimiz için butik üretim yapmaktadır.",
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800",
    buttonText: "Nuri Usta İle İletişime Geç",
    buttonLink: "contact",
    ownerName: siteSettings?.ownerName || "Nuri Yanık",
    ownerTitle: "Kurucu & Baş Zanaatkar"
  };

  const handleButtonClick = () => {
    if (promo.buttonLink === 'contact' && onNavigateTab) {
      onNavigateTab('contact');
    } else if (promo.buttonLink === 'custom-production' && onNavigateTab) {
      onNavigateTab('custom-production');
    } else if (promo.buttonLink === 'products' && onNavigateTab) {
      onNavigateTab('products');
    } else if (promo.buttonLink && promo.buttonLink.startsWith('http')) {
      window.open(promo.buttonLink, '_blank');
    } else if (onNavigateTab) {
      onNavigateTab('contact');
    }
  };

  return (
    <section id="corporate-profile" className="w-full bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-stone-850">
      <div className="max-w-7xl mx-auto">
        
        {/* About Executive Hero Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-gradient-to-b from-[#161616] to-[#121212] p-8 sm:p-12 rounded-3xl border border-stone-850">
          
          <div className="lg:col-span-5 relative">
            <img
              src={promo.image || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800"}
              alt={promo.title}
              referrerPolicy="no-referrer"
              className="w-full h-[380px] object-cover rounded-2xl border border-stone-800 shadow-2xl"
            />
            {/* Overlay Absolute Card */}
            <div className="absolute bottom-6 left-6 right-6 z-20 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-amber-500/20">
              <h4 className="text-white font-extrabold text-sm tracking-wide">{promo.ownerName || siteSettings?.ownerName || "Nuri Yanık"}</h4>
              <div className="mt-2 flex items-center justify-between text-[11px] text-stone-300">
                <span>{siteSettings?.phone || "0535 219 47 89"}</span>
                <span className="text-emerald-500 font-bold">● Atölyede Aktif</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans leading-tight">
              {promo.title}
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed sm:text-base">
              {promo.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3">
                <Award className="text-amber-500 mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">İpek Mat CNC Lake</h4>
                  <p className="text-stone-400 text-xs mt-0.5">Asla sararmayan, çizilme dayanımlı, kadifemsi pürüzsüz akrilik boya.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="text-amber-500 mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">Usta Hassasiyeti</h4>
                  <p className="text-stone-400 text-xs mt-0.5">Bant söküğünden, vida yuvası kapamaya kadar her aşamada usta montaj.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Settings className="text-amber-500 mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">Mersin İçi Sınırsız Destek</h4>
                  <p className="text-stone-400 text-xs mt-0.5">Yenişehir, Mezitli ve Akdeniz başta olmak üzere anında servis ve onarım.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Heart className="text-amber-500 mt-1 shrink-0" size={18} />
                <div>
                  <h4 className="text-stone-200 font-bold text-xs uppercase tracking-wider">Hayalinizdeki Tasarım</h4>
                  <p className="text-stone-400 text-xs mt-0.5">Metre tül kısıtlaması olmadan, sıfırdan sizin evinizin ölçüsüne uyum.</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-stone-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-stone-400 text-xs">Sloganımız</p>
                <p className="text-[#B8934A] text-sm font-bold mt-1 font-mono">"Kapıdan Mobilyaya, Eviniz İçin Özel Üretim Çözümler"</p>
              </div>

              {promo.buttonText && (
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{promo.buttonText}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
