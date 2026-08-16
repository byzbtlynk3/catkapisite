import React, { useState } from 'react';
import { GalleryItem, VideoItem, CatalogItem } from '../types';
import { INITIAL_GALLERY, INITIAL_VIDEOS, INITIAL_CATALOGS } from '../data';
import UnifiedCategoryFilter from './UnifiedCategoryFilter';
import { Camera, Video, FileText, Eye, MessageCircle, X, Download, Play, Check } from 'lucide-react';

interface GalleryProps {
  galleryItems?: GalleryItem[];
  videos?: VideoItem[];
  catalogs?: CatalogItem[];
}

export default function Gallery({
  galleryItems = INITIAL_GALLERY,
  videos = INITIAL_VIDEOS,
  catalogs = INITIAL_CATALOGS
}: GalleryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'photos' | 'videos' | 'catalogs'>('photos');

  // Unified Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [zoomedPhoto, setZoomedPhoto] = useState<GalleryItem | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Filter Photos
  const filteredPhotos = galleryItems.filter(item => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
    const matchesSearch = !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter Videos
  const filteredVideos = videos.filter(vid => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(vid.category);
    const matchesSearch = !searchQuery.trim() ||
      vid.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vid.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vid.description && vid.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter Catalogs
  const filteredCatalogs = catalogs.filter(cat => {
    const matchesSearch = !searchQuery.trim() ||
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleInquiry = (title: string, category: string, imageUrl?: string) => {
    const text = `Merhaba Nuri Usta (Çat Kapı), Galeri sayfasında gördüğüm *"${title}" (${category})* çalışmanız hakkında bilgi ve fiyat almak istiyorum.${imageUrl ? `\nGörsel: ${imageUrl}` : ''}`;
    window.open(`https://wa.me/905352194789?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentCount = activeSubTab === 'photos'
    ? filteredPhotos.length
    : activeSubTab === 'videos'
    ? filteredVideos.length
    : filteredCatalogs.length;

  return (
    <section id="gallery-main-section" className="w-full bg-[#111111] py-8 px-4 sm:px-6 lg:px-8 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Sub-Tabs Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveSubTab('photos')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl border text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'photos'
                ? 'bg-amber-500 text-black border-amber-500 shadow-xl scale-105'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Camera size={16} />
            <span>Fotoğraflar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('videos')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl border text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'videos'
                ? 'bg-amber-500 text-black border-amber-500 shadow-xl scale-105'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <Video size={16} />
            <span>Videolar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('catalogs')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-2xl border text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'catalogs'
                ? 'bg-amber-500 text-black border-amber-500 shadow-xl scale-105'
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-amber-500/40'
            }`}
          >
            <FileText size={16} />
            <span>PDF Kataloglar</span>
          </button>
        </div>

        {/* Unified Category & Search Filter */}
        <UnifiedCategoryFilter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={currentCount}
        />

        {/* SUB-TAB 1: PHOTOS GRID */}
        {activeSubTab === 'photos' && (
          filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPhotos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setZoomedPhoto(item)}
                  className="group bg-[#161616] rounded-2xl overflow-hidden border border-stone-850 hover:border-amber-500/40 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur text-amber-400 font-bold text-[10px] px-2.5 py-1 rounded-md border border-amber-500/20 uppercase tracking-wider">
                      {item.category}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-3 bg-stone-950/80 backdrop-blur rounded-full text-amber-400 border border-stone-800">
                        <Eye size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-stone-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="pt-3 border-t border-stone-850 mt-3 flex items-center justify-between text-xs text-amber-400 font-bold">
                      <span>Görseli İncele</span>
                      <Eye size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#161616] border border-stone-850 rounded-3xl p-8">
              <p className="text-stone-400 text-sm">Seçilen kriterlere uygun fotoğraf bulunamadı.</p>
            </div>
          )
        )}

        {/* SUB-TAB 2: VIDEOS GRID */}
        {activeSubTab === 'videos' && (
          filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVideos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-[#161616] rounded-2xl overflow-hidden border border-stone-850 hover:border-amber-500/40 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800"
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
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
                      {vid.description && (
                        <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
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
                        onClick={() => handleInquiry(vid.title, vid.category)}
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
          ) : (
            <div className="text-center py-16 bg-[#161616] border border-stone-850 rounded-3xl p-8">
              <p className="text-stone-400 text-sm">Seçilen kriterlere uygun video bulunamadı.</p>
            </div>
          )
        )}

        {/* SUB-TAB 3: PDF CATALOGS GRID */}
        {activeSubTab === 'catalogs' && (
          filteredCatalogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCatalogs.map((cat) => (
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
                        PDF KATALOĞU
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1 group-hover:text-amber-400 transition-colors">
                        {cat.title}
                      </h3>
                      {cat.description && (
                        <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-850 mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={cat.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer shadow"
                    >
                      <Download size={14} className="mr-2" />
                      Kataloğu İndir (PDF)
                    </a>

                    <button
                      type="button"
                      onClick={() => handleInquiry(cat.title, 'PDF Kataloğu')}
                      className="w-full sm:w-auto p-3 bg-stone-900 border border-stone-800 hover:border-emerald-500/40 text-stone-300 hover:text-emerald-400 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      title="WhatsApp'tan Bilgi Al"
                    >
                      <MessageCircle size={16} className="text-emerald-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#161616] border border-stone-850 rounded-3xl p-8">
              <p className="text-stone-400 text-sm">Yüklenmiş PDF kataloğu bulunamadı.</p>
            </div>
          )
        )}

        {/* Photo Lightbox Modal */}
        {zoomedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative bg-[#161616] max-w-4xl w-full rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex flex-col md:flex-row">
              <div className="md:w-3/5 bg-black flex items-center justify-center">
                <img
                  src={zoomedPhoto.imageUrl}
                  alt={zoomedPhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[500px] object-cover"
                />
              </div>
              <div className="md:w-2/5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-stone-850">
                    <span className="text-amber-400 font-mono text-xs font-bold uppercase">
                      {zoomedPhoto.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomedPhoto(null)}
                      className="text-stone-400 hover:text-white p-1 rounded-lg bg-stone-900 border border-stone-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4 font-sans">
                    {zoomedPhoto.title}
                  </h3>
                  {zoomedPhoto.description && (
                    <p className="text-stone-300 text-xs mt-3 leading-relaxed">
                      {zoomedPhoto.description}
                    </p>
                  )}
                  <div className="mt-6 space-y-2 text-xs text-stone-400">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500" />
                      <span>%100 Özel Ölçü İmalat</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-500" />
                      <span>Mersin Akdeniz Atölye İmalatı</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-850 mt-6">
                  <button
                    type="button"
                    onClick={() => handleInquiry(zoomedPhoto.title, zoomedPhoto.category, zoomedPhoto.imageUrl)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center cursor-pointer shadow"
                  >
                    <MessageCircle size={14} className="mr-2" />
                    Bu Ürün Hakkında Fiyat Al
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Lightbox Modal */}
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
