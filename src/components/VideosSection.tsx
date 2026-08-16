import React, { useState } from 'react';
import { Play, Download, FileText, Video, Sparkles, MessageCircle, ExternalLink, CheckCircle } from 'lucide-react';
import { INITIAL_VIDEOS, INITIAL_CATALOGS } from '../data';

export default function VideosSection() {
  const [activeTab, setActiveTab] = useState<'videos' | 'catalogs'>('videos');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const handleCatalogDownload = (title: string, fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleWhatsAppConsultation = (title: string) => {
    const text = `Merhaba Nuri Usta, Çat Kapı web sitenizdeki "${title}" kataloğunuz / videosu hakkında detaylı bilgi ve numune talebinde bulunmak istiyorum.`;
    window.open(`https://wa.me/905352194789?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="videos-and-catalogs-section" className="w-full bg-[#111111] py-12 px-4 sm:px-6 lg:px-8 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Video size={13} />
            <span>MEDYA VE YAYIN KÜTÜPHANESİ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3 font-sans">
            Atölye Videoları &amp; Ürün Katalogları
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            Mersin Akdeniz'deki atölyemizde gerçekleşen gerçek zanaat üretim süreçlerimizi izleyin ve en son ürün serilerimizin dijital PDF kataloglarını indirin.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center space-x-3 mb-10 border-b border-stone-850 pb-6">
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-amber-500 text-black border-amber-500 shadow-lg scale-105'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <Video size={16} />
            <span>Üretim Videoları ({INITIAL_VIDEOS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalogs')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl border text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'catalogs'
                ? 'bg-amber-500 text-black border-amber-500 shadow-lg scale-105'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <FileText size={16} />
            <span>PDF Ürün Katalogları ({INITIAL_CATALOGS.length})</span>
          </button>
        </div>

        {/* VIDEOS GRID */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INITIAL_VIDEOS.map((vid) => (
              <div
                key={vid.id}
                className="bg-[#161616] rounded-2xl overflow-hidden border border-stone-850 hover:border-amber-500/40 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800"
                    alt={vid.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedVideoUrl(vid.videoUrl)}
                      className="p-4 bg-amber-500 text-black rounded-full shadow-2xl transform group-hover:scale-110 transition-transform cursor-pointer"
                      title="Videoyu Oynat"
                    >
                      <Play size={24} className="fill-black ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest block mb-1">
                      {vid.category}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {vid.title}
                    </h3>
                    <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-850 mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedVideoUrl(vid.videoUrl)}
                      className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase flex items-center cursor-pointer"
                    >
                      <Play size={12} className="mr-1 fill-amber-400" />
                      Videoyu İzle
                    </button>

                    <button
                      type="button"
                      onClick={() => handleWhatsAppConsultation(vid.title)}
                      className="text-stone-400 hover:text-emerald-400 font-bold text-xs flex items-center cursor-pointer"
                    >
                      <MessageCircle size={12} className="mr-1 text-emerald-500" />
                      Danışın
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CATALOGS GRID */}
        {activeTab === 'catalogs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {INITIAL_CATALOGS.map((cat) => (
              <div
                key={cat.id}
                className="bg-[#161616] rounded-2xl overflow-hidden border border-stone-850 hover:border-amber-500/40 transition-all shadow-xl p-6 flex flex-col justify-between group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl shrink-0">
                    <FileText size={32} />
                  </div>

                  <div>
                    <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest block">
                      2026 KOLEKSİYONU • PDF
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-850 mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCatalogDownload(cat.title, cat.pdfUrl)}
                    className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer shadow"
                  >
                    <Download size={14} className="mr-2" />
                    Kataloğu İndir (PDF)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppConsultation(cat.title)}
                    className="w-full sm:w-auto p-3 bg-stone-900 border border-stone-800 hover:border-emerald-500/40 text-stone-300 hover:text-emerald-400 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    title="WhatsApp'tan Numune İste"
                  >
                    <MessageCircle size={16} className="text-emerald-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox / Video Modal */}
        {selectedVideoUrl && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#161616] border border-stone-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-850">
                <span className="text-amber-400 font-mono text-xs font-bold uppercase">
                  ● ÇAT KAPI ATÖLYE VİDEOSU
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedVideoUrl(null)}
                  className="px-3 py-1 bg-stone-900 border border-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-bold uppercase cursor-pointer"
                >
                  Kapat ✕
                </button>
              </div>

              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-inner">
                <iframe
                  src={selectedVideoUrl}
                  title="Çat Kapı Atölye Oynatıcısı"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

