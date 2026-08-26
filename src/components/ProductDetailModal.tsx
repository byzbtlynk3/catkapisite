import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MessageCircle, 
  CheckCircle, 
  Layers, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Tag,
  Phone
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1549557454-e69c3a379ad4?q=80&w=1200'];
  const currentImage = images[Math.min(activeImageIndex, images.length - 1)];
  const isVideoUrl = (url?: string) => !!url && (/\.(mp4|mov|webm)(?:[?#].*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url));

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.3, 3.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.3, 1.0));
  const handleResetZoom = () => setZoomScale(1.0);

  const nextImage = () => {
    setActiveImageIndex(prev => (prev + 1) % images.length);
    setZoomScale(1.0);
  };

  const prevImage = () => {
    setActiveImageIndex(prev => (prev - 1 + images.length) % images.length);
    setZoomScale(1.0);
  };

  const handleWhatsAppInquiry = () => {
    const priceText = (product.campaignPrice && product.isCampaign) ? `₺${product.campaignPrice.toLocaleString('tr-TR')}` : (product.startingPrice ? `₺${product.startingPrice.toLocaleString('tr-TR')}` : 'Fiyat Teklifli');
    const textMsg = `Merhaba Nuri Usta (Çat Kapı), web sitenizde incelediğim model hakkında bilgi ve ölçü randevusu almak istiyorum:\n\n` +
      `*Ürün:* ${product.name}\n` +
      `*Kategori:* ${product.category}\n` +
      `*Fiyat:* ${priceText}\n` +
      `*Durum:* ${product.stockStatus || 'Özel Üretim'}\n\n` +
      `Mersin adresime yerinde ücretsiz keşif için müsaitlik durumunuz nedir?`;

    window.open(`https://wa.me/905352194789?text=${encodeURIComponent(textMsg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-lg overflow-y-auto">
      <div className="bg-[#141414] border border-amber-500/20 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#181818] border-b border-stone-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md font-mono text-[10px] uppercase font-bold">
              {product.category}
            </span>
            <h3 className="text-white font-extrabold text-base sm:text-lg truncate">
              {product.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Layout */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 7 COLS: HIGH-RES PHOTO LIGHTBOX WITH ZOOM */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Main Stage */}
            <div className="relative aspect-[4/3] bg-stone-950 rounded-2xl border border-stone-850 overflow-hidden group flex items-center justify-center select-none">
              
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{ transform: `scale(${zoomScale})` }}
              >
                {isVideoUrl(currentImage) ? (
                  <video src={currentImage} controls playsInline className="max-w-full max-h-full object-contain" />
                ) : (
                  <img
                    src={currentImage}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain cursor-zoom-in"
                    onClick={handleZoomIn}
                  />
                )}
              </div>

              {/* Floating Zoom Control Bar */}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur border border-stone-800 rounded-xl p-1.5 flex items-center space-x-1.5 z-20 shadow-xl">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors"
                  title="Yakınlaştır (+)"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 1.0}
                  className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-30"
                  title="Uzaklaştır (-)"
                >
                  <ZoomOut size={16} />
                </button>
                {zoomScale > 1.0 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 text-amber-400 hover:bg-stone-800 rounded-lg transition-colors"
                    title="Sıfırla"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
                <span className="text-[10px] font-mono text-stone-400 px-1 font-bold">
                  %{Math.round(zoomScale * 100)}
                </span>
              </div>

              {/* Prev / Next Image arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-amber-500 text-white hover:text-black rounded-full border border-stone-800 transition-all z-20"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-amber-500 text-white hover:text-black rounded-full border border-stone-800 transition-all z-20"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Image index indicator */}
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono text-stone-300 border border-stone-800">
                Görsel {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Gallery Thumbnails Carousel */}
            {images.length > 1 && (
              <div className="flex items-center space-x-2.5 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomScale(1.0);
                    }}
                    className={`w-20 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-amber-500 scale-105 shadow-md' : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVideoUrl(img) ? (
                      <video src={img} muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={img}
                        alt={`Thumb ${idx+1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: PRODUCT SPECS & ACTION BUTTONS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Price & Badges Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.isCampaign && (
                  <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                    Kampanya
                  </span>
                )}
                {product.isNew && (
                  <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                    Yeni Ürün
                  </span>
                )}
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase rounded-md tracking-wider">
                  {product.stockStatus || 'Özel Üretim'}
                </span>
              </div>

              <div>
                <span className="text-stone-400 text-[11px] uppercase font-bold tracking-wider block">Başlangıç İmalat Fiyatı</span>
                <div className="flex items-baseline space-x-2">
                  {product.campaignPrice && product.campaignPrice > 0 ? (
                    <>
                      <span className="text-sm line-through text-stone-400 font-bold">{product.startingPrice ? `₺${product.startingPrice.toLocaleString('tr-TR')}` : ''}</span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-sans">{`₺${product.campaignPrice.toLocaleString('tr-TR')}`}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-amber-400 font-sans">
                        {product.startingPrice ? `₺${product.startingPrice.toLocaleString('tr-TR')}` : 'Fiyat Alınız'}
                      </span>
                      {product.startingPrice && (
                        <span className="text-stone-400 text-xs font-mono">'den başlayan fiyatlarla</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-2 border-t border-stone-850 pt-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider text-amber-400">Ürün Açıklaması</h4>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {product.description || product.extendedDescription}
              </p>
            </div>

            {/* Kullanılan Malzeme */}
            {((product.materials && product.materials.length > 0) || product.specs?.['Kullanılan Malzeme']) && (
              <div className="space-y-2 border-t border-stone-850 pt-4">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider text-amber-400">Kullanılan Malzeme</h4>
                <div className="bg-stone-900/60 border border-stone-850 rounded-xl p-3 text-xs text-stone-200 leading-relaxed font-mono whitespace-pre-line">
                  {Array.isArray(product.materials) && product.materials.length > 0
                    ? product.materials.join('\n')
                    : product.specs?.['Kullanılan Malzeme']}
                </div>
              </div>
            )}

            {/* Ölçüler */}
            {(product.dimensions || product.specs?.['Ölçüler'] || product.specs?.['Ölçü']) && (
              <div className="space-y-2 border-t border-stone-850 pt-4">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider text-amber-400">Ölçüler</h4>
                <div className="bg-stone-900/60 border border-stone-850 rounded-xl p-3 text-xs text-stone-200 leading-relaxed whitespace-pre-line font-mono">
                  {product.dimensions || product.specs?.['Ölçüler'] || product.specs?.['Ölçü']}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-850 space-y-2.5">
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Nuri Usta'dan Fiyat Teklifi ve Ölçü Al</span>
              </button>

              <a
                href="tel:05352194789"
                className="w-full py-3 border border-stone-800 bg-stone-900 hover:bg-stone-850 text-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Phone size={14} className="text-amber-500" />
                <span>0535 219 47 89 Telefon Et</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
