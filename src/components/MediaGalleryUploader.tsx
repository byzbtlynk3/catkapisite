import React, { useState } from 'react';
import { Upload, Trash2, Link as LinkIcon, MoveLeft, MoveRight, Film, Image as ImageIcon, Star } from 'lucide-react';

interface MediaGalleryUploaderProps {
  mediaList: string[];
  onChange: (newList: string[]) => void;
  maxFiles?: number;
  title?: string;
  coverIndex?: number;
  onCoverIndexChange?: (index: number) => void;
}

export default function MediaGalleryUploader({
  mediaList,
  onChange,
  maxFiles = 30,
  title = 'Görsel & Medya Yönetimi (Fotoğraf, Video, GIF)',
  coverIndex = 0,
  onCoverIndexChange
}: MediaGalleryUploaderProps) {
  const [urlInput, setUrlInput] = useState('');

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.startsWith('data:video/') ||
      lower.endsWith('.mp4') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.webm') ||
      lower.includes('youtube.com') ||
      lower.includes('vimeo.com')
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (mediaList.length + files.length > maxFiles) {
      alert(`En fazla ${maxFiles} adet medya dosyası yüklenebilir!`);
      return;
    }

    const fileArray = Array.from(files);
    const readPromises = fileArray.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newUrls) => {
      onChange([...mediaList, ...newUrls]);
    });

    e.target.value = '';
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (mediaList.length >= maxFiles) {
      alert(`En fazla ${maxFiles} adet medya dosyası eklenebilir!`);
      return;
    }
    onChange([...mediaList, trimmed]);
    setUrlInput('');
  };

  const handleRemove = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    onChange(updated);
    if (onCoverIndexChange && coverIndex >= updated.length) {
      onCoverIndexChange(Math.max(0, updated.length - 1));
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaList.length) return;
    const copy = [...mediaList];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);

    if (onCoverIndexChange) {
      if (coverIndex === index) onCoverIndexChange(targetIndex);
      else if (coverIndex === targetIndex) onCoverIndexChange(index);
    }
  };

  return (
    <div className="bg-[#111111] p-4 rounded-2xl border border-stone-850 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon size={14} />
          {title}
        </span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
          mediaList.length >= maxFiles ? 'bg-red-500/20 text-red-400 font-bold' : 'text-stone-400 bg-stone-900'
        }`}>
          {mediaList.length} / {maxFiles} Medya
        </span>
      </div>

      {/* Main Cover Preview if Cover Index exists */}
      {mediaList.length > 0 && onCoverIndexChange && (
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-black max-h-48 group">
          {isVideoUrl(mediaList[coverIndex] || mediaList[0]) ? (
            <video
              src={mediaList[coverIndex] || mediaList[0]}
              controls
              className="w-full h-48 object-cover"
            />
          ) : (
            <img
              src={mediaList[coverIndex] || mediaList[0]}
              alt="Ana Kapak"
              referrerPolicy="no-referrer"
              className="w-full h-48 object-cover"
            />
          )}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg shadow-md flex items-center gap-1">
            <Star size={11} fill="black" />
            <span>Ana Kapak Medyası</span>
          </div>
        </div>
      )}

      {/* Grid Thumbnails */}
      {mediaList.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 max-h-60 overflow-y-auto">
          {mediaList.map((mediaUrl, idx) => {
            const isVid = isVideoUrl(mediaUrl);
            const isCover = onCoverIndexChange && coverIndex === idx;

            return (
              <div
                key={idx}
                className={`relative rounded-xl overflow-hidden border bg-black group aspect-square flex items-center justify-center ${
                  isCover ? 'border-amber-500 ring-2 ring-amber-500' : 'border-stone-800'
                }`}
              >
                {isVid ? (
                  <video
                    src={mediaUrl}
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={`Medya ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Video Badge */}
                {isVid && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-amber-400 text-[8px] font-bold rounded flex items-center gap-0.5">
                    <Film size={9} />
                    <span>VİDEO</span>
                  </div>
                )}

                {/* Hover Actions Bar */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 z-10">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'left')}
                      className="p-1 bg-stone-800 text-white rounded hover:bg-stone-700 disabled:opacity-30 cursor-pointer"
                      title="Sola / Öne Taşı"
                    >
                      <MoveLeft size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === mediaList.length - 1}
                      onClick={() => handleMove(idx, 'right')}
                      className="p-1 bg-stone-800 text-white rounded hover:bg-stone-700 disabled:opacity-30 cursor-pointer"
                      title="Sağa / Arkaya Taşı"
                    >
                      <MoveRight size={11} />
                    </button>
                  </div>

                  {onCoverIndexChange && !isCover && (
                    <button
                      type="button"
                      onClick={() => onCoverIndexChange(idx)}
                      className="px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-bold rounded cursor-pointer"
                    >
                      Kapak Yap
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-500 cursor-pointer"
                    title="Medyayı Sil"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Controls (Upload + URL) */}
      <div className="space-y-2 pt-2 border-t border-stone-800/80">
        <label className="text-stone-300 font-bold uppercase block text-[11px]">
          Medya Yükle / Ekle (Fotoğraf, Video, GIF)
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* File Upload Button for device / gallery / pc */}
          <label className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
            <Upload size={14} className="text-amber-500" />
            <span>Cihaz / Galeriden Yükle</span>
            <input
              type="file"
              accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.webm"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* URL Input */}
          <div className="flex flex-1 gap-1.5">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Görsel / Video / GIF URL adresi yapıştırın..."
              className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3.5 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl hover:bg-amber-500 hover:text-black cursor-pointer flex items-center gap-1"
            >
              <LinkIcon size={12} />
              <span>Ekle</span>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-stone-500">
          Desteklenen türler: JPG, JPEG, PNG, WEBP, GIF, MP4, MOV, WEBM (En fazla {maxFiles} dosya).
        </p>
      </div>
    </div>
  );
}
