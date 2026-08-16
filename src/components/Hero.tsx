import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Sliders, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  siteSettings?: SiteSettings;
  onDiscoverShowroom: () => void;
  onOpenCustomProduction: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function Hero({ siteSettings, onDiscoverShowroom, onOpenCustomProduction, onNavigateTab }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const defaultSlides = [
    {
      id: 'hs-1',
      title: "Kapıdan Mobilyaya, Eviniz İçin Özel Üretim Çözümler",
      description: "Biz sadece mobilya üretmiyoruz; yaşam alanlarınıza değer katıyor, hayal ettiğiniz konforu milimetrik işçilikle sanata dönüştürüyoruz.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
      tag: "Özel Üretim Atölyesi",
      buttonText: "Özel Üretim İmalat Talebi",
      buttonLink: "custom-production"
    },
    {
      id: 'hs-2',
      title: "Hayalinizdeki Tasarımı Üretiyoruz",
      description: "Lake kapılar, modern mutfaklar, lüks giyinme odaları... Mersin'deki imalat tezgahlarımızda tamamen kişiye özel ve ölçüye göre üretiyoruz.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
      tag: "Size Özel Tasarım",
      buttonText: "Tüm Ürünleri İncele",
      buttonLink: "products"
    }
  ];

  const activeSlides = (siteSettings?.heroSlides && siteSettings.heroSlides.length > 0)
    ? siteSettings.heroSlides.filter(s => !s.isHidden)
    : defaultSlides;

  const slides = activeSlides.length > 0 ? activeSlides : defaultSlides;

  useEffect(() => {
    if (activeSlide >= slides.length) {
      setActiveSlide(0);
    }
  }, [slides.length, activeSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const currentSlide = slides[activeSlide] || slides[0];

  const handlePrimaryButtonClick = () => {
    const link = currentSlide.buttonLink;
    if (link === 'products') {
      onDiscoverShowroom();
    } else if (link === 'custom-production') {
      onOpenCustomProduction();
    } else if (link === 'contact' && onNavigateTab) {
      onNavigateTab('contact');
    } else if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      onOpenCustomProduction();
    }
  };

  return (
    <section id="showroom-hero" className="relative w-full overflow-hidden bg-[#111111] text-white">
      {/* Background Slides */}
      <div className="relative h-[600px] sm:h-[650px] md:h-[700px] w-full flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out ${
              index === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Background Image with Elegant Dim Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="max-w-3xl">
            {/* Dynamic Tag */}
            {currentSlide.tag && (
              <div 
                id="hero-tag" 
                className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-400/30 rounded-full text-amber-400 text-xs font-semibold tracking-wider uppercase mb-6"
              >
                <Sparkles size={12} />
                <span>{currentSlide.tag}</span>
              </div>
            )}

            {/* Slider Slogan */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none mb-6">
              {currentSlide.title.includes(', ') ? (
                currentSlide.title.split(', ').map((text, idx) => (
                  <span key={idx} className="block last:text-transparent last:bg-clip-text last:bg-gradient-to-r last:from-amber-400 last:to-amber-500">
                    {text} {idx === 0 && ','}
                  </span>
                ))
              ) : (
                <span className="block text-white">{currentSlide.title}</span>
              )}
            </h2>

            {/* Description */}
            <p className="text-stone-300 text-sm sm:text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
              {currentSlide.description}
            </p>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Hide promotional 'custom-production' primary CTA to remove the unwanted section for customers */}
              {currentSlide.buttonLink !== 'custom-production' && (
                <button
                  onClick={handlePrimaryButtonClick}
                  className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl text-[#111111] font-bold text-sm tracking-wider uppercase shadow-xl transform transition-all cursor-pointer"
                >
                  <Sliders size={16} className="mr-2" />
                  {currentSlide.buttonText || 'Özel Üretim İmalat Talebi'}
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={onDiscoverShowroom}
                className="flex items-center justify-center px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-500/30 rounded-xl text-stone-200 font-bold text-sm tracking-wider uppercase transition-all cursor-pointer"
              >
                <Compass size={16} className="mr-2 text-amber-500" />
                Tüm Ürünleri İncele
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 right-4 sm:right-10 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === activeSlide ? 'w-8 bg-amber-500' : 'w-2 bg-stone-500'
              }`}
              title={`Slayt ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
