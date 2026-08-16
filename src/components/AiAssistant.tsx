import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Camera, Image as ImageIcon, X, Tag, Box, Eye, Palette, MessageSquare, Phone, Compass, CheckCircle2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import AccordionCategoryList from './AccordionCategoryList';

export interface Product {
  id: string;
  title: string;
  category: string;
  price: string;
  rating?: number;
  image: string;
  badge?: string;
  specs?: string[];
  description?: string;
  stockStatus?: string;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  image?: string;
  matchedProducts?: Product[];
  recommendedColors?: Array<{ name: string; hex: string; desc: string }>;
  suggestedCategory?: string;
  analysisResult?: {
    productType: string;
    recommendedMaterial: string;
    recommendedColor: string;
    estimatedPrice: number;
    deliveryWeeks: number;
    explanation: string;
    matchedColorHex: string;
  };
  isLocal?: boolean;
}

interface AiAssistantProps {
  products?: Product[];
  categories?: string[];
  onSelectProductDetail?: (product: Product) => void;
  onNavigateTab?: (tab: string, category?: string) => void;
}

export default function AiAssistant({ products = [], categories = [], onSelectProductDetail, onNavigateTab }: AiAssistantProps) {
  // Ensure we ONLY operate on active (non-hidden) products from CMS
  const activeProducts = products.filter(p => !(p as any).isHidden);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Merhaba! Ben Çat Kapı Firmasının resmi akıllı Yapay Zeka Asistanıyım.\n\nMersin Akdeniz\'deki atölyemizde Nuri Yanık Bey önderliğinde ürettiğimiz tüm gerçek ve aktif kapı, mutfak dolabı, vestiyer, gardırop, banyo dolabı, fayans, seramik ve tezgah modellerimiz veritabanımda yüklüdür.\n\nFotoğraf Yükleyebilir: Evinizden veya beğendiğiniz bir tasarımın fotoğrafını yükleyerek bana gönderebilirsiniz. Görseldeki kapı, dolap, fayans, lavabo, kulp ve renk detaylarını analiz eder, mağazamızdaki benzer ürünleri öneririm!'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCategoryAccordion, setShowCategoryAccordion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    { title: 'Oda Kapısı Modellerini Göster', prompt: 'Yönetim panelindeki gerçek lake ve ahşap oda kapısı modellerinizi listeler misin?' },
    { title: 'Mutfak Dolabı & Renk Tavsiyesi', prompt: 'Mutfak dolabı modelleriniz ve neme dayanıklı lake renk önerileriniz nelerdir?' },
    { title: 'Vestiyer ve Gardırop Modelleri', prompt: 'Giriş vestiyer ve gardırop modellerini stok durumları ve fiyatlarıyla göster.' },
    { title: 'Ölçü Alma & İmalat Süreci', prompt: 'Çat Kapı atölyenizde ücretsiz ölçü alma, imalat ve montaj süreci nasıl işliyor?' }
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Fotoğraf boyutu 8MB\'dan küçük olmalıdır.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const currentText = textToSend || inputVal;
    if (!currentText.trim() && !selectedImage) return;

    const userMsgImage = selectedImage;
    const userMsgText = currentText;

    // Append user message
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: userMsgText || (userMsgImage ? 'Bir tasarım fotoğrafı yüklendi. Görseli analiz edip benzer ürünlerimizi ve renk kartelasını önerir misin?' : ''),
        image: userMsgImage || undefined
      }
    ]);

    setInputVal('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLoading(true);

    try {
      let localMatchedProducts: Product[] = [];
      let localColorSuggestions: Array<{ name: string; hex: string; desc: string }> = [];
      let matchedCategoryName: string | undefined = undefined;

      const queryLower = (userMsgText + ' ' + (userMsgImage ? 'fotoğraf görsel' : '')).toLowerCase();

      // Category matching logic against ONLY ACTIVE CMS products
      if (queryLower.includes('kapı') || queryLower.includes('door') || queryLower.includes('lake') || queryLower.includes('oda')) {
        matchedCategoryName = 'İç Kapılar';
        localMatchedProducts = activeProducts.filter(p => 
          p.category?.toLowerCase().includes('kapı') || 
          p.title?.toLowerCase().includes('kapı') ||
          p.title?.toLowerCase().includes('lake')
        ).slice(0, 3);
        
        localColorSuggestions = [
          { name: 'Kuzey İpek Mat Beyaz', hex: '#F9F9FB', desc: 'Asla sararmayan İtalyan Sayerlack ipek mat cila' },
          { name: 'Saten Safir Antrasit', hex: '#34383C', desc: 'Lüks kapılarda kontrast pervaz ve gövde uyumu' },
          { name: 'Mersin Adaçayı Yeşili', hex: '#707F71', desc: 'Doğal ahşap pervaz ile yumuşak geçiş' }
        ];
      } else if (queryLower.includes('çelik kapı') || queryLower.includes('celik kapi')) {
        matchedCategoryName = 'Çelik Kapılar';
        localMatchedProducts = activeProducts.filter(p => 
          p.category?.toLowerCase().includes('çelik') || 
          p.title?.toLowerCase().includes('çelik') ||
          p.title?.toLowerCase().includes('armor')
        ).slice(0, 3);
      } else if (queryLower.includes('mutfak') || queryLower.includes('tezgah') || queryLower.includes('kitchen')) {
        matchedCategoryName = 'Mutfak Dolapları';
        localMatchedProducts = activeProducts.filter(p => 
          p.category?.toLowerCase().includes('mutfak') || 
          p.title?.toLowerCase().includes('mutfak')
        ).slice(0, 3);

        localColorSuggestions = [
          { name: 'Linen Krem & Grej', hex: '#E2DCD5', desc: 'Genişletici ferah tonlar' },
          { name: 'Siyah Akrilik Gola Profil', hex: '#1C1C1E', desc: 'Kesintisiz kulpsuz kapak uyumu' }
        ];
      } else if (queryLower.includes('vestiyer') || queryLower.includes('gardırop') || queryLower.includes('portmanto') || queryLower.includes('dolap')) {
        matchedCategoryName = 'Vestiyer & Gardırop';
        localMatchedProducts = activeProducts.filter(p => 
          p.category?.toLowerCase().includes('vestiyer') || 
          p.category?.toLowerCase().includes('gardırop') ||
          p.title?.toLowerCase().includes('vestiyer') ||
          p.title?.toLowerCase().includes('gardırop')
        ).slice(0, 3);

        localColorSuggestions = [
          { name: 'Doğal Meşe Kaplama', hex: '#B8934A', desc: 'Sıcak ahşap dokusu ve füme cam' },
          { name: 'Duman Mat Gri', hex: '#63686E', desc: 'Neme dayanıklı koridor tasarımı' }
        ];
      } else if (queryLower.includes('banyo') || queryLower.includes('duşakabin') || queryLower.includes('lavabo') || queryLower.includes('klozet')) {
        matchedCategoryName = 'Banyo Dolapları';
        localMatchedProducts = activeProducts.filter(p => 
          p.category?.toLowerCase().includes('banyo') || 
          p.category?.toLowerCase().includes('lavabo') ||
          p.title?.toLowerCase().includes('banyo') ||
          p.title?.toLowerCase().includes('duşakabin')
        ).slice(0, 3);
      } else if (queryLower.includes('fayans') || queryLower.includes('seramik') || queryLower.includes('mermer') || queryLower.includes('kuvars') || queryLower.includes('granit')) {
        matchedCategoryName = 'Fayans & Seramik';
        localMatchedProducts = activeProducts.filter(p => 
          p.category?.toLowerCase().includes('fayans') || 
          p.category?.toLowerCase().includes('seramik') ||
          p.category?.toLowerCase().includes('mermer')
        ).slice(0, 3);
      } else {
        localMatchedProducts = activeProducts.slice(0, 3);
      }

      // If user provided an image, call image analysis endpoint
      if (userMsgImage) {
        const base64Clean = userMsgImage.replace(/^data:image\/\w+;base64,/, '');
        const analyzeRes = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Clean,
            mimeType: 'image/jpeg'
          })
        });

        const analyzeData = await analyzeRes.json();
        const analysis = analyzeData.analysis;

        if (analysis) {
          // Find matching products among ACTIVE products only
          const categoryMatches = activeProducts.filter(p => 
            p.category?.toLowerCase().includes(analysis.productType?.toLowerCase()) || 
            p.title?.toLowerCase().includes(analysis.productType?.toLowerCase())
          );
          if (categoryMatches.length > 0) {
            localMatchedProducts = categoryMatches.slice(0, 3);
          } else {
            localMatchedProducts = activeProducts.slice(0, 3);
          }

          setMessages((prev) => [
            ...prev,
            {
              sender: 'assistant',
              text: `**Yüklenen Fotoğraf Detaylı Analiz Edildi**\n\n` +
                `• **Saptanan Ürün:** ${analysis.productType.toUpperCase()}\n` +
                `• **Önerilen Gövde Malzemesi:** ${analysis.recommendedMaterial}\n` +
                `• **Uyumlu Renk Paleti:** ${analysis.recommendedColor}\n` +
                `• **Tahmini Atölye Fiyatı:** ₺${analysis.estimatedPrice?.toLocaleString('tr-TR') || 'Teklif Alınız'}\n` +
                `• **İmalat Süresi:** ${analysis.deliveryWeeks || 2} Hafta\n\n` +
                `**Zanaatkar Analizi (Kulp, Renk, Desen & Malzeme):** ${analysis.explanation}\n\nBu modele benzeyen aşağıdaki ürünler mağazamızda bulunmaktadır:`,
              matchedProducts: localMatchedProducts,
              suggestedCategory: matchedCategoryName,
              recommendedColors: [
                { name: analysis.recommendedColor, hex: analysis.matchedColorHex || '#707F71', desc: 'Görseldeki kapak ve gövdeye en yakın renk tonu' },
                { name: 'Kuzey İpek Mat Beyaz', hex: '#F9F9FB', desc: 'Çat Kapı klasik sararmayan ipek mat lake' }
              ],
              analysisResult: analysis
            }
          ]);
          setLoading(false);
          return;
        }
      }

      // Standard Chat API call with ACTIVE CMS products injected as context
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          availableProducts: activeProducts.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            stockStatus: p.stockStatus || 'Stokta Var',
            specs: p.specs
          }))
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.text,
            matchedProducts: localMatchedProducts.length > 0 ? localMatchedProducts : undefined,
            recommendedColors: localColorSuggestions.length > 0 ? localColorSuggestions : undefined,
            suggestedCategory: matchedCategoryName,
            isLocal: !!data.localEngine
          }
        ]);
      } else {
        throw new Error(data.error || 'Yapay Zeka yanıt veremedi.');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Çat Kapı yönetim paneli verileriniz incelendi. Atölyemizde sadece monoblok MDF ve İtalyan Sayerlack boyalarıyla özel imalat yapılmaktadır.\n\nYönetim panelimizde yer alan gerçek ve aktif ürünlerimizi aşağıda görebilir veya doğrudan WhatsApp üzerinden Nuri Bey ile görüşebilirsiniz: 0535 219 47 89',
          matchedProducts: activeProducts.slice(0, 3)
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-assistant-page" className="w-full bg-[#111111] py-1 px-2 sm:px-4 lg:px-6">
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-180px)] min-h-[580px] bg-[#161616] border border-stone-850 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Sleek ChatGPT-style Status Bar */}
        <div className="px-5 py-3 bg-[#121212] border-b border-stone-850 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-white font-bold text-xs sm:text-sm block">Çat Kapı Yapay Zeka Asistanı</span>
              <span className="text-stone-400 text-[10px] font-mono">Lokal Ürün &amp; Görsel Analiz Motoru</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowCategoryAccordion(!showCategoryAccordion)}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers size={13} />
              <span>Kategori Yönlendirme</span>
              {showCategoryAccordion ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-[10px] text-stone-400 bg-stone-900 border border-stone-800 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="font-mono">Kayıtlı Model: {products.length} Adet</span>
            </div>
          </div>
        </div>

        {/* EXPANDABLE CATEGORY ACCORDION DRAWER FOR AI ASSISTANT */}
        {showCategoryAccordion && (
          <div className="p-4 bg-[#121212] border-b border-stone-850 animate-fade-in max-h-80 overflow-y-auto">
            <AccordionCategoryList
              onSelectCategory={(mainCatName, subCatName) => {
                const queryText = subCatName 
                  ? `${mainCatName} kategorisindeki "${subCatName}" modellerinizi detaylandırır mısın?`
                  : `${mainCatName} kategorisindeki tüm modellerinizi ve imalat seçeneklerini gösterir misin?`;
                setShowCategoryAccordion(false);
                handleSendMessage(queryText);
              }}
              showAllOption={false}
              searchPlaceholder="Yapay Zeka Asistanı için kategori seçin..."
            />
          </div>
        )}

        {/* Message Logs Space (Fills Screen) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-none">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start max-w-[95%] sm:max-w-[88%] space-x-3 ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-black'
                    : 'bg-stone-800 text-amber-500 border border-stone-750'
                }`}
              >
                {msg.sender === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>

              <div className="space-y-3 flex-1">
                {/* Main Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-amber-500/15 border border-amber-500/25 text-stone-100'
                      : 'bg-stone-900 text-stone-200 border border-stone-800'
                  }`}
                >
                  {/* If user attached an image */}
                  {msg.image && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-amber-500/30 max-w-xs">
                      <img src={msg.image} alt="Yüklenen görsel" className="w-full max-h-52 object-cover" />
                    </div>
                  )}

                  {msg.text}

                  {msg.isLocal && (
                    <span className="block mt-2 text-[10px] text-stone-500 italic font-mono uppercase">
                      Çat Kapı Yönetim Paneli Doğrulanmış Bilgisi
                    </span>
                  )}
                </div>

                {/* Recommended Color Swatches if any */}
                {msg.recommendedColors && msg.recommendedColors.length > 0 && (
                  <div className="p-3 bg-[#131313] border border-amber-500/20 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Palette size={12} />
                      Önerilen Fırın Lake / Ahşap Renk Kartelası:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendedColors.map((col, cIdx) => (
                        <div key={cIdx} className="flex items-center space-x-2.5 p-2 bg-[#1a1a1a] rounded-lg border border-stone-800">
                          <span
                            className="w-6 h-6 rounded-md border border-stone-600 shrink-0 shadow"
                            style={{ backgroundColor: col.hex }}
                          />
                          <div>
                            <span className="text-white text-xs font-bold block">{col.name}</span>
                            <span className="text-[10px] text-stone-400 block font-mono">{col.desc} ({col.hex})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CATEGORY & ACTION REDIRECT BUTTONS */}
                {msg.sender === 'assistant' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {msg.suggestedCategory && onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('products', msg.suggestedCategory)}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Compass size={13} />
                        <span>{msg.suggestedCategory} Kategorisine Git</span>
                      </button>
                    )}

                    <a
                      href="https://wa.me/905352194789?text=Merhaba+Nuri+Usta%2C+yapay+zeka+asistanınızdan+yönlendirildim."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp'tan Yaz</span>
                    </a>

                    <a
                      href="tel:05352194789"
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Phone size={13} className="text-amber-500" />
                      <span>0535 219 47 89</span>
                    </a>

                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('contact')}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>İletişim Sayfası</span>
                      </button>
                    )}
                  </div>
                )}

                {/* MATCHED REAL PRODUCT CARDS FROM CMS */}
                {msg.matchedProducts && msg.matchedProducts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Box size={13} />
                      İlgili Ürün Önerileri ({msg.matchedProducts.length}):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {msg.matchedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#181818] border border-stone-800 hover:border-amber-500/50 rounded-xl p-2.5 flex flex-col justify-between group transition-all"
                        >
                          <div>
                            <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-stone-900 relative">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              {prod.badge && (
                                <span className="absolute top-1 left-1 bg-amber-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  {prod.badge}
                                </span>
                              )}
                            </div>

                            <h5 className="text-white font-bold text-xs line-clamp-1">{prod.title}</h5>
                            <span className="text-[10px] text-stone-400 block capitalize">{prod.category}</span>
                            <span className="text-amber-400 font-extrabold text-xs block mt-1">
                              {prod.price ? `${prod.price} ₺` : 'Teklif Alınız'}
                            </span>
                          </div>

                          {onSelectProductDetail && (
                            <button
                              onClick={() => onSelectProductDetail(prod)}
                              className="mt-2 w-full py-1.5 bg-stone-900 hover:bg-amber-500 text-stone-300 hover:text-black border border-stone-750 font-bold text-[10px] uppercase rounded-lg transition-all flex items-center justify-center cursor-pointer"
                            >
                              <Eye size={11} className="mr-1" />
                              Ürünü İncele
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Loading placeholder */}
          {loading && (
            <div className="flex items-start max-w-[80%] space-x-3">
              <div className="p-2 bg-stone-800 border border-stone-750 text-amber-500 rounded-xl leading-none animate-pulse">
                <Sparkles size={14} />
              </div>
              <div className="bg-stone-900 text-stone-400 p-4 rounded-2xl border border-stone-850 flex items-center space-x-2 text-xs">
                <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] font-mono">Atölye Veritabanı ve Görsel Analiz Ediliyor...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Selected Image Thumbnail Preview inside Bar */}
        {selectedImage && (
          <div className="px-4 py-2 bg-[#1a1a1a] border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={selectedImage} alt="Seçilen Fotoğraf" className="w-12 h-12 object-cover rounded-lg border border-amber-500/50" />
              <div>
                <span className="text-amber-400 text-xs font-bold block flex items-center gap-1">
                  <CheckCircle2 size={12} /> Fotoğraf Yüklendi
                </span>
                <span className="text-stone-400 text-[10px]">Stil, renk ve model analizi için gönder tuşuna basın.</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 text-stone-400 hover:text-red-400 bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Fotoğrafı Kaldır"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Quick Prompts Bar */}
        {messages.length === 1 && (
          <div className="p-3 bg-[#121212] border-t border-stone-850">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  className="p-2.5 bg-stone-900/60 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/30 text-stone-300 hover:text-white rounded-xl text-xs flex items-center justify-between text-left transition-all cursor-pointer"
                >
                  <span className="pr-2 line-clamp-1">{qp.title}</span>
                  <Tag size={12} className="text-amber-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ChatGPT-like Ergonomic Wide Text & Image Sender Input Bar */}
        <div className="p-3 sm:p-4 bg-stone-900 border-t border-stone-850">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="flex items-center gap-2 bg-[#111111] p-1.5 sm:p-2 rounded-2xl border border-stone-800 focus-within:border-amber-500 transition-colors shadow-inner"
          >
            {/* Prominent Photo Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 text-xs font-bold ${
                selectedImage 
                  ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow' 
                  : 'bg-stone-900 hover:bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500'
              }`}
              title="Tasarım veya oda fotoğrafı yükleyin"
            >
              <Camera size={16} />
              <span className="hidden sm:inline">Fotoğraf Yükle</span>
            </button>

            {/* Ergonomic Input Field */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={selectedImage ? 'Fotoğrafla ilgili mesajınızı ekleyin veya Gönder tuşuna basın...' : 'Kapı, mutfak dolabı veya gardırop modellerini sorun...'}
              className="flex-1 bg-transparent px-3 py-2 text-stone-100 placeholder-stone-500 text-xs sm:text-sm outline-none"
              disabled={loading}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!inputVal.trim() && !selectedImage)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl disabled:opacity-30 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow"
              title="Gönder"
            >
              <span>Gönder</span>
              <Send size={14} />
            </button>
          </form>

          {/* Direct WhatsApp Option */}
          <div className="flex justify-between items-center mt-2.5 text-[10px] text-stone-400 px-1">
            <span className="hidden sm:inline text-stone-500">Mersin Akdeniz atölye imalat veritabanımız aktiftir.</span>
            <a
              href="https://wa.me/905352194789?text=Merhaba+Nuri+Usta%2C+yapay+zeka+asistanınızdan+ulaşıyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center ml-auto font-bold"
            >
              <MessageSquare size={11} className="mr-1 text-emerald-500" />
              Nuri Usta WhatsApp (0535 219 47 89)
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
