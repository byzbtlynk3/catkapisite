import React, { useState, useMemo, useEffect } from 'react';
import { Product, SiteSettings, HeroSlide, PromoSection, SocialLink, SocialPlatform } from '../types';
import { INITIAL_SITE_SETTINGS } from '../data';
import AdminManufacturingParams from './AdminManufacturingParams';
import MediaGalleryUploader from './MediaGalleryUploader';
import AdminSecurityModal from './AdminSecurityModal';
import { 
  MainCategoryDef, 
  SubCategoryDef, 
  getStoredCategories, 
  saveStoredCategories 
} from '../lib/categoryData';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Layers, 
  Save, 
  X, 
  CheckCircle2, 
  Upload, 
  Tag, 
  DollarSign, 
  Package, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw,
  Image as ImageIcon,
  Check,
  LogOut,
  FolderPlus,
  AlertTriangle,
  Archive,
  Globe,
  LayoutList,
  Sliders,
  MapPin,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  FileText,
  ArrowUp,
  ArrowDown,
  Clock,
  Link as LinkIcon,
  ExternalLink,
  User,
  Compass,
  Facebook,
  Youtube,
  Building2,
  Music2
} from 'lucide-react';

interface AdminUnifiedCmsProps {
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  categories: string[];
  onSaveCategories: (updatedCategories: string[]) => void;
  siteSettings?: SiteSettings;
  onSaveSiteSettings?: (updatedSettings: SiteSettings) => void;
  onClose?: () => void;
  onResetToDefaults?: () => void;
  onLogout?: () => void;
  onSyncCatalog?: (categoryTree: any[], updatedProducts: Product[]) => Promise<boolean>;
}

export default function AdminUnifiedCms({
  products,
  onSaveProducts,
  categories,
  onSaveCategories,
  siteSettings,
  onSaveSiteSettings,
  onClose,
  onResetToDefaults,
  onLogout,
  onSyncCatalog
}: AdminUnifiedCmsProps) {
  const normalizeCmsSettings = (settings?: Partial<SiteSettings> | null): SiteSettings => {
    const defaults = INITIAL_SITE_SETTINGS;
    return {
      ...defaults,
      ...(settings || {}),
      heroSlides: Array.isArray(settings?.heroSlides) ? settings.heroSlides : defaults.heroSlides,
      socialLinks: Array.isArray(settings?.socialLinks) ? settings.socialLinks : (defaults.socialLinks || []),
      promoSection: settings?.promoSection && typeof settings.promoSection === 'object'
        ? { ...defaults.promoSection, ...settings.promoSection }
        : defaults.promoSection
    };
  };

  // Category tree state from categoryData
  const [categoryDefs, setCategoryDefs] = useState<MainCategoryDef[]>(() => getStoredCategories());
  
  // CMS SECTION & CONTENT TAB STATE
  const [cmsSection, setCmsSection] = useState<'products' | 'categories' | 'content' | 'parameters' | 'archive'>('products');
  const [contentSubTab, setContentSubTab] = useState<'slider' | 'promo' | 'contact' | 'map-social'>('slider');

  // SITE SETTINGS STATE
  const [cmsSettings, setCmsSettings] = useState<SiteSettings>(() => {
    return normalizeCmsSettings(siteSettings);
  });

  useEffect(() => {
    setCmsSettings(normalizeCmsSettings(siteSettings));
  }, [siteSettings]);

  // Selected slide index/id for slider form
  const [editingSlideId, setEditingSlideId] = useState<string>('');

  // Left Tree Filter State
  const [selectedMainCat, setSelectedMainCat] = useState<string>('ALL');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('ALL');
  const [expandedCatIds, setExpandedCatIds] = useState<Record<string, boolean>>({});

  // SINGLE TOP SMART SEARCH BAR (Searches both categories and products)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Notification Toast
  const [notification, setNotification] = useState<string>('');

  // CONFIRMATION DIALOG MODAL STATE
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Sil',
    cancelText: 'İptal',
    onConfirm: () => {},
    isDanger: true
  });

  // ARCHIVE MODAL & TAB STATE
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [archiveTab, setArchiveTab] = useState<'all' | 'categories' | 'subcategories' | 'products'>('all');
  const [archiveExpandedMains, setArchiveExpandedMains] = useState<Record<string, boolean>>({});
  const [archiveExpandedSubs, setArchiveExpandedSubs] = useState<Record<string, boolean>>({});

  const toggleArchiveMain = (mainId: string) => {
    setArchiveExpandedMains(prev => ({ ...prev, [mainId]: !prev[mainId] }));
  };

  const toggleArchiveSub = (subId: string) => {
    setArchiveExpandedSubs(prev => ({ ...prev, [subId]: !prev[subId] }));
  };

  // ARCHIVED ITEMS MEMO
  const archivedMainCategories = useMemo(() => categoryDefs.filter(c => c.isActive === false), [categoryDefs]);
  const archivedSubCategories = useMemo(() => {
    const list: Array<SubCategoryDef & { parentMainName: string; parentMainId: string }> = [];
    categoryDefs.forEach(m => {
      m.subCategories.forEach(s => {
        if (s.isActive === false) {
          list.push({ ...s, parentMainName: m.name, parentMainId: m.id });
        }
      });
    });
    return list;
  }, [categoryDefs]);
  const archivedProducts = useMemo(() => products.filter(p => p.isHidden), [products]);
  const totalArchivedCount = archivedMainCategories.length + archivedSubCategories.length + archivedProducts.length;

  // HIERARCHICAL ARCHIVE TREE CATEGORIES MEMO
  const archivedTreeCategories = useMemo(() => {
    return categoryDefs.filter(mainCat => {
      const isMainHidden = mainCat.isActive === false;
      const hasHiddenSub = mainCat.subCategories.some(s => s.isActive === false);
      const hasHiddenProd = products.some(p => p.category === mainCat.name && p.isHidden);
      return isMainHidden || hasHiddenSub || hasHiddenProd;
    });
  }, [categoryDefs, products]);

  // Inline Category Tree Editing States
  const [isAddingMain, setIsAddingMain] = useState<boolean>(false);
  const [newMainNameInput, setNewMainNameInput] = useState<string>('');

  const [addingSubForMainId, setAddingSubForMainId] = useState<string | null>(null);
  const [newSubNameInput, setNewSubNameInput] = useState<string>('');

  const [editingMainId, setEditingMainId] = useState<string | null>(null);
  const [editingMainName, setEditingMainName] = useState<string>('');

  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState<string>('');

  // SELECTED PRODUCT FOR RIGHT PANEL EDITOR
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id || null);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState<boolean>(false);

  // FORM DRAFT STATES FOR PRODUCT EDITOR
  const [formName, setFormName] = useState<string>('');
  const [formMainCategory, setFormMainCategory] = useState<string>('Yatak Odası');
  const [formSubCategory, setFormSubCategory] = useState<string>('Gardırop');
  const [formStockStatus, setFormStockStatus] = useState<'Stokta Var' | 'Sipariş Üzerine Üretiliyor' | 'Özel Üretim'>('Sipariş Üzerine Üretiliyor');
  const [formIsHidden, setFormIsHidden] = useState<boolean>(false);

  // Price Fields
  const [formStartingPrice, setFormStartingPrice] = useState<string>('');
  const [formCampaignPrice, setFormCampaignPrice] = useState<string>('');
  const [formVatStatus, setFormVatStatus] = useState<string>('%20 KDV Dahil');
  const [formIsCampaign, setFormIsCampaign] = useState<boolean>(false);

  // Photos & Media
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formCoverIndex, setFormCoverIndex] = useState<number>(0);

  // Single Description Field (Ürün Açıklaması)
  const [formDesc, setFormDesc] = useState<string>('');

  // Free Text Materials (Kullanılan Malzeme) & Free Text Dimensions (Ölçüler)
  const [formMaterialText, setFormMaterialText] = useState<string>('');
  const [formDimensions, setFormDimensions] = useState<string>('');

  // Listen to external category changes
  useEffect(() => {
    const handleUpdate = () => {
      setCategoryDefs(getStoredCategories());
    };
    window.addEventListener('category_data_updated', handleUpdate);
    return () => window.removeEventListener('category_data_updated', handleUpdate);
  }, []);

  // Sync selected product when products change
  useEffect(() => {
    if (!isCreatingNewProduct && products.length > 0) {
      const exists = products.find(p => p.id === selectedProductId);
      if (!exists) {
        loadProductToForm(products[0]);
      }
    }
  }, [products]);

  // Load product data into form fields when selectedProductId changes
  const loadProductToForm = (prod: Product) => {
    setIsCreatingNewProduct(false);
    setSelectedProductId(prod.id);
    setFormName(prod.name);
    setFormMainCategory(prod.category);
    setFormSubCategory(prod.subCategory || '');
    setFormStockStatus(prod.stockStatus || 'Sipariş Üzerine Üretiliyor');
    setFormIsHidden(!!prod.isHidden);

    setFormStartingPrice(prod.startingPrice ? String(prod.startingPrice) : '');
    setFormCampaignPrice(prod.campaignPrice ? String(prod.campaignPrice) : '');
    setFormVatStatus(prod.vatStatus || '%20 KDV Dahil');
    setFormIsCampaign(!!prod.isCampaign || !!prod.campaignPrice);

    setFormImages(prod.images && prod.images.length > 0 ? [...prod.images] : ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800']);
    setFormCoverIndex(prod.coverImageIndex || 0);

    setFormDesc(prod.description || prod.extendedDescription || '');
    
    // Free text materials
    if (Array.isArray(prod.materials) && prod.materials.length > 0) {
      setFormMaterialText(prod.materials.join('\n'));
    } else {
      setFormMaterialText('MDF\nLake Boyalı MDF\nPVC Kenar Bant\nFrenli Ray Sistemi');
    }

    // Free text dimensions
    if (prod.dimensions) {
      setFormDimensions(prod.dimensions);
    } else if (prod.specs && prod.specs['Ölçüler']) {
      setFormDimensions(prod.specs['Ölçüler']);
    } else if (prod.specs && prod.specs['Ölçü']) {
      setFormDimensions(prod.specs['Ölçü']);
    } else {
      setFormDimensions('240 cm genişlik × 60 cm derinlik × 220 cm yükseklik');
    }
  };

  // Initial load of first product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId && !isCreatingNewProduct) {
      loadProductToForm(products[0]);
    }
  }, []);

  // Start creating a brand new product
  const startNewProductForm = () => {
    setIsCreatingNewProduct(true);
    setSelectedProductId(null);

    const defaultMain = selectedMainCat !== 'ALL' ? selectedMainCat : (categoryDefs[0]?.name || 'Yatak Odası');
    
    // Find subcategories for default main category
    const mainDef = categoryDefs.find(c => c.name === defaultMain);
    const defaultSub = selectedSubCat !== 'ALL' ? selectedSubCat : (mainDef?.subCategories[0]?.name || 'Gardırop');

    setFormName('Yeni Mobilya Modeli');
    setFormMainCategory(defaultMain);
    setFormSubCategory(defaultSub);
    setFormStockStatus('Sipariş Üzerine Üretiliyor');
    setFormIsHidden(false);

    setFormStartingPrice('24500');
    setFormCampaignPrice('21900');
    setFormVatStatus('%20 KDV Dahil');
    setFormIsCampaign(false);

    setFormImages(['https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800']);
    setFormCoverIndex(0);

    setFormDesc('Mersin Akdeniz atölyemizde milimetrik ölçüye göre üretilen lüks mobilya modeli.');
    setFormMaterialText('MDF\nLake Boyalı MDF\nPVC Kenar Bant\nFrenli Ray Sistemi\nTemperli Cam');
    setFormDimensions('240 cm genişlik × 60 cm derinlik × 220 cm yükseklik');
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Yardimci: Bilgisayardan secilen dosyayi (foto/video/gif) Supabase Storage'a yukle,
  // gorsel URL'sini geri donturur. slider & tanitim & urun icin kullanilir.
  const uploadMediaFile = async (file: File, opts?: { productId?: string; folder?: 'site' | 'product' }) => {
    try {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const comma = result.indexOf(',');
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error('Dosya okunamadı'));
        reader.readAsDataURL(file);
      });

      const token = typeof window !== 'undefined' ? sessionStorage.getItem('catkapi_admin_token') : null;
      const res = await fetch('/api/admin/upload-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({
          product_id: opts?.productId || undefined,
          folder: opts?.folder || 'site',
          filename: file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_'),
          fileBase64: b64,
          mediaType: file.type || 'application/octet-stream'
        })
      });
      if (!res.ok) throw new Error('Yükleme hatası');
      const data = await res.json();
      return data.url as string;
    } catch (err) {
      console.error('Upload error', err);
      showNotify('Dosya yüklenerirken hata. Lütfen tekrar deneyin.');
      return '';
    }
  };

  // Helper to persist category changes & dispatch live events to website
  const updateAndSaveCategories = (newDefs: MainCategoryDef[], msg: string) => {
    setCategoryDefs(newDefs);
    saveStoredCategories(newDefs);
    
    // Flatten active category names for live web site filters
    const flatNames: string[] = [];
    newDefs.forEach(m => {
      if (m.isActive !== false) {
        flatNames.push(m.name);
        m.subCategories.forEach(s => {
          if (s.isActive !== false && !flatNames.includes(s.name)) {
            flatNames.push(s.name);
          }
        });
      }
    });

    onSaveCategories(flatNames);
    showNotify(msg);
  };

  // SAYFAYA YAYINLA (PUBLISH ALL CMS CHANGES TO LIVE WEBSITE)
  const handlePublishToSite = async () => {
    saveStoredCategories(categoryDefs);
    
    // Flatten active category names for live web site filters
    const flatNames: string[] = [];
    categoryDefs.forEach(m => {
      if (m.isActive !== false) {
        flatNames.push(m.name);
        m.subCategories.forEach(s => {
          if (s.isActive !== false && !flatNames.includes(s.name)) {
            flatNames.push(s.name);
          }
        });
      }
    });

    onSaveCategories(flatNames);
    onSaveProducts(products);

    if (onSaveSiteSettings) {
      onSaveSiteSettings(cmsSettings);
    }

    let syncOk = false;
    if (onSyncCatalog) {
      try {
        // Persist the full category tree + products to the real Supabase DB
        syncOk = await onSyncCatalog(categoryDefs, products);
      } catch (e) {
        console.error('Sync catalog failed', e);
      }
    }

    showNotify(
      syncOk
        ? 'Tüm kategoriler, ürünler ve medya gerçek veritabanına (Supabase) kaydedildi ve canlı sitede yayınlandı!'
        : 'Değişiklikler tarayıcıya kaydedildi. (Supabase eşitleme için oturum açın veya tekrar deneyin.)'
    );
  };

  // Filter Categories by Smart Search Box
  const filteredCategoryDefs = useMemo(() => {
    if (!searchQuery.trim()) return categoryDefs;
    const q = searchQuery.toLowerCase().trim();

    return categoryDefs.filter(cat => {
      const mainMatches = cat.name.toLowerCase().includes(q);
      const subMatches = cat.subCategories.some(sub => sub.name.toLowerCase().includes(q));
      return mainMatches || subMatches;
    });
  }, [categoryDefs, searchQuery]);

  // Filter Products by Category Selection & Smart Search Box
  const filteredProducts = useMemo(() => {
    const normalize = (s?: string | null) => {
      if (!s) return '';
      try {
        return s.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      } catch (e) {
        return s.toLowerCase();
      }
    };

    const mainNorm = selectedMainCat !== 'ALL' ? normalize(selectedMainCat) : null;
    const subNorm = selectedSubCat !== 'ALL' ? normalize(selectedSubCat) : null;

    return products.filter(p => {
      const pCat = normalize(p.category);
      const pSub = normalize(p.subCategory || '');

      // Filter by Main Category (match main OR any of its subcategories stored as names)
      if (mainNorm && pCat !== mainNorm && pSub !== mainNorm) return false;

      // Filter by Sub Category
      if (subNorm && pSub !== subNorm && pCat !== subNorm) return false;

      // Single Smart Search Box Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = (p.productCode || '').toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchSub = (p.subCategory || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        return matchName || matchCode || matchCat || matchSub || matchDesc;
      }

      return true;
    });
  }, [products, selectedMainCat, selectedSubCat, searchQuery]);

  // CATEGORY TREE ACTIONS
  const toggleExpand = (mainId: string) => {
    setExpandedCatIds(prev => ({ ...prev, [mainId]: !prev[mainId] }));
  };

  const handleAddMainCategory = () => {
    if (!newMainNameInput.trim()) return;
    const name = newMainNameInput.trim();
    if (categoryDefs.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Bu kategori adı zaten mevcut!');
      return;
    }
    const newCat: MainCategoryDef = {
      id: `main-${Date.now()}`,
      name,
      isActive: true,
      subCategories: []
    };
    const updated = [...categoryDefs, newCat];
    setNewMainNameInput('');
    setIsAddingMain(false);
    updateAndSaveCategories(updated, `"${name}" kategorisi başarıyla eklendi ve canlı sitede yayınlandı.`);
  };

  const handleAddSubCategory = (mainId: string) => {
    if (!newSubNameInput.trim()) return;
    const subName = newSubNameInput.trim();
    const updated = categoryDefs.map(m => {
      if (m.id === mainId) {
        if (m.subCategories.some(s => s.name.toLowerCase() === subName.toLowerCase())) {
          alert('Bu alt kategori zaten var!');
          return m;
        }
        return {
          ...m,
          subCategories: [
            ...m.subCategories,
            { id: `sub-${Date.now()}`, name: subName, meshType: 'wardrobe', isActive: true }
          ]
        };
      }
      return m;
    });
    setNewSubNameInput('');
    setAddingSubForMainId(null);
    updateAndSaveCategories(updated, `"${subName}" alt kategorisi başarıyla eklendi.`);
  };

  const handleSaveMainRename = (mainId: string) => {
    if (!editingMainName.trim()) return;
    const trimmed = editingMainName.trim();
    const updated = categoryDefs.map(m => m.id === mainId ? { ...m, name: trimmed } : m);
    setEditingMainId(null);
    updateAndSaveCategories(updated, 'Kategori adı güncellendi.');
  };

  const handleSaveSubRename = (mainId: string, subId: string) => {
    if (!editingSubName.trim()) return;
    const trimmed = editingSubName.trim();
    const updated = categoryDefs.map(m => {
      if (m.id === mainId) {
        return {
          ...m,
          subCategories: m.subCategories.map(s => s.id === subId ? { ...s, name: trimmed } : s)
        };
      }
      return m;
    });
    setEditingSubId(null);
    updateAndSaveCategories(updated, 'Alt kategori adı güncellendi.');
  };

  // 1. KATEGORİ SİL (Confirm Modal with exact requested message)
  const handleDeleteMain = (mainId: string, mainName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Kategori Silme Onayı',
      message: 'Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        const updated = categoryDefs.filter(m => m.id !== mainId);
        if (selectedMainCat === mainName) {
          setSelectedMainCat('ALL');
          setSelectedSubCat('ALL');
        }
        updateAndSaveCategories(updated, `"${mainName}" kategorisi tamamen silindi.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // 2. ALT KATEGORİ SİL (Confirm Modal with exact requested message)
  const handleDeleteSub = (mainId: string, subId: string, subName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Alt Kategori Silme Onayı',
      message: 'Bu alt kategoriyi silmek istediğinize emin misiniz?',
      confirmText: 'Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        const updated = categoryDefs.map(m => {
          if (m.id === mainId) {
            return {
              ...m,
              subCategories: m.subCategories.filter(s => s.id !== subId)
            };
          }
          return m;
        });
        if (selectedSubCat === subName) {
          setSelectedSubCat('ALL');
        }
        updateAndSaveCategories(updated, `"${subName}" alt kategorisi silindi.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // 3. SAYFAYA GİZLE / YAYINA AL (Main Category)
  const handleToggleMainHide = (mainId: string, mainName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = categoryDefs.map(m => {
      if (m.id === mainId) {
        return { ...m, isActive: m.isActive === false ? true : false };
      }
      return m;
    });
    const cur = updated.find(m => m.id === mainId);
    const isHiddenNow = cur?.isActive === false;
    updateAndSaveCategories(
      updated,
      isHiddenNow 
        ? `"${mainName}" kategorisi sayfadan gizlendi ve Arşiv'e alındı.`
        : `"${mainName}" kategorisi tekrar yayına alındı!`
    );
  };

  // SAYFAYA GİZLE / YAYINA AL (Sub Category)
  const handleToggleSubHide = (mainId: string, subId: string, subName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = categoryDefs.map(m => {
      if (m.id === mainId) {
        return {
          ...m,
          subCategories: m.subCategories.map(s => {
            if (s.id === subId) {
              return { ...s, isActive: s.isActive === false ? true : false };
            }
            return s;
          })
        };
      }
      return m;
    });
    const main = updated.find(m => m.id === mainId);
    const sub = main?.subCategories.find(s => s.id === subId);
    const isHiddenNow = sub?.isActive === false;
    updateAndSaveCategories(
      updated,
      isHiddenNow 
        ? `"${subName}" alt kategorisi sayfadan gizlendi ve Arşiv'e alındı.`
        : `"${subName}" alt kategorisi tekrar yayına alındı!`
    );
  };

  // 5. SAYFAYA GİZLE / YAYINA AL & PRODUCT DELETE
  const handleToggleProductStatus = (productId: string, productName?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, isHidden: !p.isHidden };
      }
      return p;
    });
    onSaveProducts(updated);
    const cur = updated.find(p => p.id === productId);
    if (selectedProductId === productId && cur) {
      setFormIsHidden(!!cur.isHidden);
    }
    const name = productName || cur?.name || 'Ürün';
    showNotify(
      cur?.isHidden 
        ? `"${name}" sayfadan gizlendi ve Arşiv'e aktarıldı.`
        : `"${name}" tekrar yayına alındı!`
    );
  };

  const handleDeleteProduct = (productId: string, productName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Ürün Silme Onayı',
      message: 'Bu ürünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        const updated = products.filter(p => p.id !== productId);
        onSaveProducts(updated);
        if (selectedProductId === productId) {
          if (updated.length > 0) {
            loadProductToForm(updated[0]);
          } else {
            startNewProductForm();
          }
        }
        showNotify(`"${productName}" ürünü silindi.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // 4. KALICI SİL HANDLERS FOR ARŞİV
  const promptPermanentDeleteMain = (mainId: string, mainName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Kategori Kalıcı Silme Onayı',
      message: 'Bu kategoriyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Kalıcı Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        const updated = categoryDefs.filter(m => m.id !== mainId);
        updateAndSaveCategories(updated, `"${mainName}" kalıcı olarak silindi.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const promptPermanentDeleteSub = (mainId: string, subId: string, subName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Alt Kategori Kalıcı Silme Onayı',
      message: 'Bu alt kategoriyi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Kalıcı Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        const updated = categoryDefs.map(m => {
          if (m.id === mainId) {
            return {
              ...m,
              subCategories: m.subCategories.filter(s => s.id !== subId)
            };
          }
          return m;
        });
        updateAndSaveCategories(updated, `"${subName}" alt kategorisi kalıcı olarak silindi.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const promptPermanentDeleteProduct = (productId: string, productName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Ürün Kalıcı Silme Onayı',
      message: 'Bu ürünü kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Kalıcı Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        const updated = products.filter(p => p.id !== productId);
        onSaveProducts(updated);
        showNotify(`"${productName}" ürünü kalıcı olarak silindi.`);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // SAVE PRODUCT FORM IN RIGHT PANEL
  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Lütfen ürün adını giriniz.');
      return;
    }

    const matList = formMaterialText.split('\n').map(s => s.trim()).filter(Boolean);
    const numStarting = formStartingPrice ? parseFloat(formStartingPrice) : undefined;
    const numCampaign = formCampaignPrice ? parseFloat(formCampaignPrice) : undefined;
    const prodId = isCreatingNewProduct ? `prod-${Date.now()}` : (selectedProductId || `prod-${Date.now()}`);

    const savedProduct: Product = {
      id: prodId,
      name: formName.trim(),
      category: formMainCategory,
      subCategory: formSubCategory.trim() || undefined,
      categoryId: currentSelectedMainDef?.id,
      subCategoryId: currentSelectedMainDef?.subCategories.find(s => s.name === formSubCategory)?.id || undefined,
      stockStatus: formStockStatus,
      isHidden: formIsHidden,

      startingPrice: numStarting,
      campaignPrice: numCampaign,
      vatStatus: formVatStatus,
      isCampaign: !!numCampaign || formIsCampaign,

      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800'],
      coverImageIndex: formCoverIndex,

      description: formDesc.trim(),
      extendedDescription: formDesc.trim(),
      materials: matList,
      dimensions: formDimensions.trim(),
      keyFeatures: matList,
      specs: {
        'Ölçüler': formDimensions.trim(),
        'Kullanılan Malzeme': matList.join(', ')
      }
    };
    // If there are any base64 data URLs in images, upload them to server first
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('catkapi_admin_token') : null;
    const uploadIfDataUrl = async (img: string, idx: number) => {
      if (!img || !img.startsWith('data:')) return img;
      try {
        const commaIndex = img.indexOf(',');
        const header = img.slice(0, commaIndex);
        const b64 = img.slice(commaIndex + 1);
        const mediaType = header.match(/^data:([^;]+)/i)?.[1] || 'application/octet-stream';
        const extension = mediaType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
        const filename = `media-${Date.now()}-${idx}.${extension}`;
        const res = await fetch('/api/admin/upload-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ product_id: prodId, filename, fileBase64: b64, mediaType })
        });
        if (!res.ok) {
          console.warn('Upload failed', await res.text());
          return img;
        }
        const data = await res.json();
        return data.url || img;
      } catch (err) {
        console.error('Upload error', err);
        return img;
      }
    };

    const finalImages: string[] = [];
    for (let i = 0; i < formImages.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const uploaded = await uploadIfDataUrl(formImages[i], i);
      finalImages.push(uploaded);
    }

    const finalProduct: Product = { ...savedProduct, images: finalImages };

    let updatedList: Product[];
    if (isCreatingNewProduct) {
      updatedList = [finalProduct, ...products];
      setIsCreatingNewProduct(false);
      setSelectedProductId(finalProduct.id);
    } else {
      updatedList = products.map(p => p.id === prodId ? finalProduct : p);
    }

    // save locally and trigger server sync via App.tsx handler
    onSaveProducts(updatedList);
    showNotify(`"${finalProduct.name}" kaydedildi ve canlı sitede güncellendi!`);
  };

  // Selected main category object for subcategory options in product form
  const currentSelectedMainDef = useMemo(() => {
    return categoryDefs.find(c => c.name === formMainCategory) || categoryDefs[0];
  }, [categoryDefs, formMainCategory]);

  // SLIDER MANAGEMENT HANDLERS
  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: 'hs-' + Date.now(),
      title: 'Yeni Slayt Başlığı',
      subtitle: 'Mersin Ahşap İmalat Atölyesi',
      description: 'Yeni slayt açıklama metnini buraya giriniz.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200',
      tag: 'Özel Üretim',
      buttonText: 'Özel Üretim Talebi',
      buttonLink: 'custom-production',
      isHidden: false
    };
    setCmsSettings(prev => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide]
    }));
    setEditingSlideId(newSlide.id);
    showNotify('Yeni slider görseli eklendi!');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const slides = [...cmsSettings.heroSlides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const temp = slides[index];
    slides[index] = slides[targetIndex];
    slides[targetIndex] = temp;
    setCmsSettings(prev => ({ ...prev, heroSlides: slides }));
    showNotify('Slider sırası güncellendi!');
  };

  const handleToggleSlideVisibility = (slideId: string) => {
    setCmsSettings(prev => {
      const updated = prev.heroSlides.map(s => s.id === slideId ? { ...s, isHidden: !s.isHidden } : s);
      const cur = updated.find(s => s.id === slideId);
      showNotify(cur?.isHidden ? 'Slayt geçici olarak gizlendi.' : 'Slayt yayına alındı!');
      return { ...prev, heroSlides: updated };
    });
  };

  const handleDeleteSlide = (slideId: string, slideTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Slider Görselini Sil',
      message: `"${slideTitle}" başlıklı slider görselini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      confirmText: 'Sil',
      cancelText: 'İptal',
      isDanger: true,
      onConfirm: () => {
        setCmsSettings(prev => ({
          ...prev,
          heroSlides: prev.heroSlides.filter(s => s.id !== slideId)
        }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showNotify('Slider görseli silindi.');
      }
    });
  };

  const handleUpdateSlideField = (slideId: string, field: keyof HeroSlide, value: any) => {
    setCmsSettings(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.map(s => s.id === slideId ? { ...s, [field]: value } : s)
    }));
  };

  // PROMO SECTION FIELD UPDATE
  const handleUpdatePromoField = (field: keyof PromoSection, value: any) => {
    setCmsSettings(prev => ({
      ...prev,
      promoSection: {
        title: prev.promoSection?.title || '',
        subtitle: prev.promoSection?.subtitle || '',
        description: prev.promoSection?.description || '',
        image: prev.promoSection?.image || '',
        buttonText: prev.promoSection?.buttonText || '',
        buttonLink: prev.promoSection?.buttonLink || '',
        ownerName: prev.promoSection?.ownerName || '',
        ownerTitle: prev.promoSection?.ownerTitle || '',
        [field]: value
      }
    }));
  };

  // GENERAL SETTINGS UPDATE
  const handleUpdateSettingField = (field: keyof SiteSettings, value: any) => {
    setCmsSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // SOCIAL LINK HANDLERS (İletişim Bilgileri)
  const PLATFORM_LABELS: Record<SocialPlatform, string> = {
    phone: 'Telefon',
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    email: 'E-posta',
    address: 'Adres',
    owner: 'Firma Sahibi',
    website: 'Web Sitesi',
    other: 'Diğer'
  };

  const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
    phone: <Phone size={16} className="text-amber-500" />,
    whatsapp: <MessageCircle size={16} className="text-emerald-500" />,
    instagram: <Instagram size={16} className="text-pink-500" />,
    facebook: <Facebook size={16} className="text-blue-500" />,
    tiktok: <Music2 size={16} className="text-stone-300" />,
    youtube: <Youtube size={16} className="text-red-500" />,
    email: <Mail size={16} className="text-blue-400" />,
    address: <MapPin size={16} className="text-amber-500" />,
    owner: <User size={16} className="text-stone-300" />,
    website: <Globe size={16} className="text-amber-400" />,
    other: <LinkIcon size={16} className="text-stone-400" />
  };

  const handleAddSocialLink = () => {
    const newSocial: SocialLink = {
      id: 'soc-' + Date.now(),
      platform: 'phone',
      name: 'Telefon',
      url: ''
    };
    setCmsSettings(prev => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), newSocial]
    }));
    showNotify('Yeni iletişim bilgisi eklendi. Kategori seçin, ikon otomatik gelecektir. Değişiklik "Sayfaya Yayınla" ile kaydedilir.');
  };

  const handleRemoveSocialLink = (id: string) => {
    setCmsSettings(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter(s => s.id !== id)
    }));
    showNotify('İletişim bilgisi kaldırıldı. Değişiklik "Sayfaya Yayınla" ile kaydedilir.');
  };

  const handleUpdateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setCmsSettings(prev => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).map(s => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === 'platform') {
          updated.name = PLATFORM_LABELS[value as SocialPlatform] || 'Diğer';
        }
        return updated;
      })
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] text-stone-100 min-h-[780px] rounded-2xl overflow-hidden border border-stone-850 shadow-2xl font-sans">
      
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOP HEADER & SINGLE SMART SEARCH BAR */}
      <div className="p-4 sm:p-5 bg-[#181818] border-b border-stone-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Brand & CMS Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="p-2.5 bg-amber-500 rounded-xl text-black font-black text-sm shrink-0 shadow-md">
            ÇK
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-sans">
              ÇAT KAPI — YÖNETİM PANELİ
            </h2>
            <p className="text-stone-400 text-[11px]">
              Kategoriler sol tarafta, ürünler ortada, detaylı düzenleme sağ paneldedir.
            </p>
          </div>
        </div>

        {/* SINGLE TOP SMART SEARCH BAR (Hem Kategori Hem Ürün Araması) */}
        <div className="flex-1 max-w-xl mx-0 lg:mx-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Akıllı Arama: Kategori veya ürün adı/kodu yazın... (Örn: Gardırop)"
            className="w-full bg-[#111111] border border-amber-500/40 text-xs px-4 py-3 pl-10 pr-10 rounded-xl text-white outline-none focus:border-amber-400 font-bold placeholder-stone-500 shadow-inner"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white bg-stone-800 p-1 rounded-full"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* SAYFAYA YAYINLA BUTTON */}
          <button
            type="button"
            onClick={handlePublishToSite}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-amber-300 shadow-amber-950/40 active:scale-95"
            title="Tüm Yapılan Değişiklikleri Canlı Web Sitesine Aktar"
          >
            <Globe size={16} />
            <span>Sayfaya Yayınla</span>
          </button>

          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer relative"
            title="Arşivlenmiş Öğeleri Göster"
          >
            <Archive size={15} />
            <span>Arşiv</span>
            {totalArchivedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-full">
                {totalArchivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={startNewProductForm}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} />
            <span>Yeni Ürün Ekle</span>
          </button>

          {onResetToDefaults && (
            <button
              type="button"
              onClick={onResetToDefaults}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-amber-400 rounded-xl text-xs transition-colors cursor-pointer"
              title="Fabrika Ayarlarına Sıfırla"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-red-400 rounded-xl text-xs transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 rounded-xl text-xs transition-colors cursor-pointer"
            title="Güvenlik / Şifre Değiştir"
          >
            <User size={15} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
              title="Paneli Kapat"
            >
              <X size={15} />
            </button>
          )}
        </div>

      </div>

      {showSecurityModal && (
        <AdminSecurityModal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} />
      )}

      {/* CMS NAVIGATION TABS BAR */}
      <div className="bg-[#141414] border-b border-stone-850 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setCmsSection('products')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              cmsSection === 'products'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#1a1a1a] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
            }`}
          >
            <Package size={15} />
            <span>Ürün &amp; Katalog Yönetimi</span>
          </button>

          <button
            type="button"
            onClick={() => setCmsSection('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              cmsSection === 'categories'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#1a1a1a] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
            }`}
          >
            <Layers size={15} />
            <span>Kategori Ağacı Yönetimi</span>
          </button>

          <button
            type="button"
            onClick={() => setCmsSection('content')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              cmsSection === 'content'
                ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/50'
                : 'bg-[#1a1a1a] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
            }`}
          >
            <LayoutList size={15} />
            <span>Sayfa İçerik Yönetimi</span>
          </button>

          <button
            type="button"
            onClick={() => setCmsSection('parameters')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              cmsSection === 'parameters'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#1a1a1a] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
            }`}
          >
            <Sliders size={15} />
            <span>İmalat &amp; Malzeme Parametreleri</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCmsSection('archive');
              setShowArchiveModal(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              cmsSection === 'archive'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-[#1a1a1a] text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
            }`}
          >
            <Archive size={15} />
            <span>Arşiv Sistemi</span>
            {totalArchivedCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-full ml-1">
                {totalArchivedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {cmsSection === 'parameters' ? (
        <div className="flex-1 p-6 bg-[#121212] overflow-y-auto max-h-[750px]">
          <AdminManufacturingParams onNotify={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(''), 3000);
          }} />
        </div>
      ) : cmsSection === 'content' ? (
        /* SAYFA İÇERİK YÖNETİMİ FULL WORKSPACE */
        <div className="flex-1 p-6 bg-[#121212] overflow-y-auto max-h-[750px] space-y-6">
          
          {/* SUB TABS BAR FOR SAYFA İÇERİK YÖNETİMİ */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#181818] p-3 rounded-2xl border border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setContentSubTab('slider')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  contentSubTab === 'slider'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                <Sliders size={15} />
                <span>1. Ana Sayfa Slider Yönetimi</span>
                <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px]">{cmsSettings.heroSlides.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('promo')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  contentSubTab === 'promo'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                <FileText size={15} />
                <span>2. Ana Sayfa Tanıtım Bölümü</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('contact')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  contentSubTab === 'contact'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                <Phone size={15} />
                <span>3. İletişim Sayfası Yönetimi</span>
              </button>

              <button
                type="button"
                onClick={() => setContentSubTab('map-social')}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                  contentSubTab === 'map-social'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
                }`}
              >
                <MapPin size={15} />
                <span>4. Harita &amp; Sosyal Medya</span>
              </button>
            </div>
          </div>

          {/* SUB TAB 1: ANA SAYFA SLIDER YÖNETİMİ */}
          {contentSubTab === 'slider' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#181818] p-4 rounded-2xl border border-stone-800">
                <div>
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <Sliders size={18} className="text-amber-500" />
                    <span>Ana Sayfa Hero Slider Yönetimi</span>
                  </h3>
                  <p className="text-stone-400 text-xs mt-1">
                    Ana sayfanın üst tarafında dönen slider görsellerini ekleyin, sıralamasını değiştirin veya geçici olarak gizleyin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSlide}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>+ Yeni Slider Görseli Ekle</span>
                </button>
              </div>

              {/* SLIDER CAROUSEL ITEMS LIST */}
              <div className="grid grid-cols-1 gap-4">
                {cmsSettings.heroSlides.map((slide, index) => {
                  const isEditing = editingSlideId === slide.id;

                  return (
                    <div
                      key={slide.id || index}
                      className={`bg-[#181818] rounded-2xl border p-4 transition-all ${
                        slide.isHidden
                          ? 'border-red-900/40 opacity-70 bg-stone-900/50'
                          : 'border-stone-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Thumbnail & Title Info */}
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-black border border-stone-800 shrink-0">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            {slide.isHidden && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-red-400 font-bold uppercase">
                                Gizli
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold rounded-lg">
                                Sıra #{index + 1}
                              </span>
                              {slide.tag && (
                                <span className="px-2 py-0.5 bg-stone-800 text-stone-300 text-[10px] font-mono rounded-lg">
                                  {slide.tag}
                                </span>
                              )}
                              {slide.isHidden && (
                                <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold rounded-lg">
                                  Yayında Değil
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white">{slide.title}</h4>
                            <p className="text-stone-400 text-xs line-clamp-1">{slide.description}</p>
                          </div>
                        </div>

                        {/* Actions & Ordering */}
                        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveSlide(index, 'up')}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              index === 0
                                ? 'opacity-30 cursor-not-allowed bg-stone-900 border-stone-800 text-stone-600'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500'
                            }`}
                            title="Yukarı Taşı"
                          >
                            <ArrowUp size={15} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={index === cmsSettings.heroSlides.length - 1}
                            onClick={() => handleMoveSlide(index, 'down')}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              index === cmsSettings.heroSlides.length - 1
                                ? 'opacity-30 cursor-not-allowed bg-stone-900 border-stone-800 text-stone-600'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500'
                            }`}
                            title="Aşağı Taşı"
                          >
                            <ArrowDown size={15} />
                          </button>

                          {/* Edit Toggle */}
                          <button
                            type="button"
                            onClick={() => setEditingSlideId(isEditing ? '' : slide.id)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isEditing
                                ? 'bg-amber-500 text-black border-amber-400'
                                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                            }`}
                          >
                            <Edit3 size={14} />
                            <span>{isEditing ? 'Kapat' : 'Düzenle'}</span>
                          </button>

                          {/* Toggle Hide / Show */}
                          <button
                            type="button"
                            onClick={() => handleToggleSlideVisibility(slide.id)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              slide.isHidden
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-red-400'
                            }`}
                            title={slide.isHidden ? 'Tekrar Yayına Al' : 'Geçici Olarak Gizle'}
                          >
                            {slide.isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                            <span>{slide.isHidden ? 'Yayına Al' : 'Gizle'}</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSlide(slide.id, slide.title)}
                            className="p-2 bg-stone-900 hover:bg-red-950/80 border border-stone-800 text-stone-500 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                            title="Slaydı Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* EDITING FORM FOR THIS SLIDE */}
                      {isEditing && (
                        <div className="mt-4 pt-4 border-t border-stone-800 space-y-4 bg-[#111111] p-4 rounded-xl border border-amber-500/30 animate-fade-in">
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                            Slider Detaylarını Düzenle (Slayt #{index + 1})
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Title */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-400">Slayt Ana Başlığı:</label>
                              <input
                                type="text"
                                value={slide.title}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'title', e.target.value)}
                                className="w-full bg-[#181818] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>

                            {/* Tag / Subtitle */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-400">Rozet / Alt Başlık (Tag):</label>
                              <input
                                type="text"
                                value={slide.tag || ''}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'tag', e.target.value)}
                                className="w-full bg-[#181818] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>

                            {/* Image URL */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-stone-400">Slider Görsel URL:</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={slide.image}
                                  onChange={(e) => handleUpdateSlideField(slide.id, 'image', e.target.value)}
                                  className="flex-1 bg-[#181818] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = document.getElementById(`slider-file-${slide.id}`) as HTMLInputElement | null;
                                    el?.click();
                                  }}
                                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  <Upload size={14} />
                                  <span>Bilgisayardan Yükle (Foto/Video/GIF)</span>
                                </button>
                                <input
                                  id={`slider-file-${slide.id}`}
                                  type="file"
                                  accept="image/*,video/*,.gif"
                                  hidden
                                  onChange={async (e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      const url = await uploadMediaFile(f, { folder: 'site' });
                                      if (url) handleUpdateSlideField(slide.id, 'image', url);
                                    }
                                    e.target.value = '';
                                  }}
                                />
                              </div>
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-stone-400">Açıklama Metni:</label>
                              <textarea
                                rows={2}
                                value={slide.description}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'description', e.target.value)}
                                className="w-full bg-[#181818] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>

                            {/* Button Text */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-400">Buton Yazısı:</label>
                              <input
                                type="text"
                                value={slide.buttonText || ''}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'buttonText', e.target.value)}
                                placeholder="Örn: Özel Üretim Talebi"
                                className="w-full bg-[#181818] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                              />
                            </div>

                            {/* Button Link */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-stone-400">Buton Bağlantısı (Hedef Sayfa):</label>
                              <select
                                value={slide.buttonLink || 'custom-production'}
                                onChange={(e) => handleUpdateSlideField(slide.id, 'buttonLink', e.target.value)}
                                className="w-full bg-[#181818] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold cursor-pointer"
                              >
                                <option value="custom-production">Özel Üretim Sayfası</option>
                                <option value="products">Tüm Ürünler Kataloğu</option>
                                <option value="contact">İletişim Sayfası</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB TAB 2: ANA SAYFA TANITIM BÖLÜMÜ */}
          {contentSubTab === 'promo' && (
            <div className="space-y-6">
              <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800">
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <FileText size={18} className="text-amber-500" />
                  <span>Ana Sayfa Tanıtım Bölümü Yönetimi</span>
                </h3>
                <p className="text-stone-400 text-xs mt-1">
                  Slider'ın hemen altında yer alan kurucu &amp; zanaat tanıtım metnini ve görselini düzenleyin.
                </p>
              </div>

              <div className="bg-[#181818] p-6 rounded-2xl border border-stone-800 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Image URL & Preview */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Tanıtım Bölümü Görseli
                    </label>
                    <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-black h-56">
                      <img
                        src={cmsSettings.promoSection?.image || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800'}
                        alt="Tanıtım Görseli"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cmsSettings.promoSection?.image || ''}
                        onChange={(e) => handleUpdatePromoField('image', e.target.value)}
                        placeholder="Görsel URL yapıştırın..."
                        className="flex-1 bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('promo-file') as HTMLInputElement | null;
                          el?.click();
                        }}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Upload size={14} />
                        <span>Bilgisayardan Yükle (Foto/Video/GIF)</span>
                      </button>
                      <input
                        id="promo-file"
                        type="file"
                        accept="image/*,video/*,.gif"
                        hidden
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const url = await uploadMediaFile(f, { folder: 'site' });
                            if (url) handleUpdatePromoField('image', url);
                          }
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>

                  {/* Title & Slogan */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                        Üst Başlık / Slogan:
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.promoSection?.subtitle || ''}
                        onChange={(e) => handleUpdatePromoField('subtitle', e.target.value)}
                        placeholder="Örn: MERSİN'İN LOKAL DEĞERİ"
                        className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                        Ana Tanıtım Başlığı:
                      </label>
                      <input
                        type="text"
                        value={cmsSettings.promoSection?.title || ''}
                        onChange={(e) => handleUpdatePromoField('title', e.target.value)}
                        placeholder="Örn: Çat Kapı Ahşap Zanaatı ve Lüks Mimari Çözümleri"
                        className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-400 block">Firma Sahibi Adı:</label>
                        <input
                          type="text"
                          value={cmsSettings.promoSection?.ownerName || cmsSettings.ownerName || 'Nuri Yanık'}
                          onChange={(e) => handleUpdatePromoField('ownerName', e.target.value)}
                          className="w-full bg-[#111111] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-400 block">Unvan:</label>
                        <input
                          type="text"
                          value={cmsSettings.promoSection?.ownerTitle || 'Kurucu & Baş Zanaatkar'}
                          onChange={(e) => handleUpdatePromoField('ownerTitle', e.target.value)}
                          className="w-full bg-[#111111] border border-stone-800 text-xs p-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Açıklama Metni:
                    </label>
                    <textarea
                      rows={4}
                      value={cmsSettings.promoSection?.description || ''}
                      onChange={(e) => handleUpdatePromoField('description', e.target.value)}
                      className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold leading-relaxed"
                    />
                  </div>

                  {/* Button Settings */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300 block">Buton Metni:</label>
                    <input
                      type="text"
                      value={cmsSettings.promoSection?.buttonText || ''}
                      onChange={(e) => handleUpdatePromoField('buttonText', e.target.value)}
                      placeholder="Örn: Nuri Usta İle Görüş"
                      className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-300 block">Buton Bağlantısı:</label>
                    <select
                      value={cmsSettings.promoSection?.buttonLink || 'contact'}
                      onChange={(e) => handleUpdatePromoField('buttonLink', e.target.value)}
                      className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold cursor-pointer"
                    >
                      <option value="contact">İletişim Sayfası</option>
                      <option value="custom-production">Özel Üretim Sayfası</option>
                      <option value="products">Tüm Ürünler Kataloğu</option>
                    </select>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* SUB TAB 3: İLETİŞİM SAYFASI YÖNETİMİ */}
          {contentSubTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-[#181818] p-4 rounded-2xl border border-stone-800">
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Phone size={18} className="text-amber-500" />
                  <span>İletişim Sayfası Bilgileri Yönetimi</span>
                </h3>
                <p className="text-stone-400 text-xs mt-1">
                  Müşterilerinizin gördüğü firma adı, yetkili kişi, telefon, WhatsApp ve açık adres bilgilerini güncelleyin.
                </p>
              </div>

              <div className="bg-[#181818] p-6 rounded-2xl border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">İletişim Bölümü Başlığı:</label>
                  <input
                    type="text"
                    value={cmsSettings.contactTitle || 'İLETİŞİM BİLGİLERİMİZ'}
                    onChange={(e) => handleUpdateSettingField('contactTitle', e.target.value)}
                    placeholder="İLETİŞİM BİLGİLERİMİZ"
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Firma Adı:</label>
                  <input
                    type="text"
                    value={cmsSettings.companyName || ''}
                    onChange={(e) => handleUpdateSettingField('companyName', e.target.value)}
                    placeholder="Örn: Çat Kapı Ahşap & Lüks Mimari Solutions"
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Yetkili Kişi / Firma Sahibi:</label>
                  <input
                    type="text"
                    value={cmsSettings.ownerName || ''}
                    onChange={(e) => handleUpdateSettingField('ownerName', e.target.value)}
                    placeholder="Örn: Nuri Yanık"
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block flex items-center gap-1.5">
                    <Phone size={14} className="text-amber-500" />
                    <span>Telefon Numarası:</span>
                  </label>
                  <input
                    type="text"
                    value={cmsSettings.phone}
                    onChange={(e) => handleUpdateSettingField('phone', e.target.value)}
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block flex items-center gap-1.5">
                    <MessageCircle size={14} className="text-emerald-500" />
                    <span>WhatsApp Numarası:</span>
                  </label>
                  <input
                    type="text"
                    value={cmsSettings.whatsapp}
                    onChange={(e) => handleUpdateSettingField('whatsapp', e.target.value)}
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-400" />
                    <span>E-Posta Adresi:</span>
                  </label>
                  <input
                    type="text"
                    value={cmsSettings.email || ''}
                    onChange={(e) => handleUpdateSettingField('email', e.target.value)}
                    placeholder="Örn: info@catkapi.com"
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block flex items-center gap-1.5">
                    <Instagram size={14} className="text-pink-500" />
                    <span>Instagram Hesabı:</span>
                  </label>
                  <input
                    type="text"
                    value={cmsSettings.instagram}
                    onChange={(e) => handleUpdateSettingField('instagram', e.target.value)}
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Açık Adres (Mersin Atölye):</label>
                  <input
                    type="text"
                    value={cmsSettings.address}
                    onChange={(e) => handleUpdateSettingField('address', e.target.value)}
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-stone-300 block flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-500" />
                    <span>Çalışma Saatleri:</span>
                  </label>
                  <input
                    type="text"
                    value={cmsSettings.workingHours || ''}
                    onChange={(e) => handleUpdateSettingField('workingHours', e.target.value)}
                    placeholder="Örn: Pazartesi - Cumartesi: 08:00 - 19:00 | Pazar: Kapalı"
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

              </div>

              {/* ✅ İLETİŞİM BİLGİLERİ YÖNETİMİ (3. İletişim Sayfası Yönetimi altında da) */}
              <div className="bg-[#181818] p-6 rounded-2xl border border-amber-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase flex items-center gap-2">
                      <Phone size={18} className="text-emerald-500" />
                      <span>İletişim Bilgileri (Sosyal Medya & Diğer)</span>
                    </h4>
                    <p className="text-stone-400 text-xs mt-0.5">
                      📢 İletişim bilgisi "Sayfaya Yayınla" butonuyla canlı sitede güncellenir.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>+ Yeni İletişim Bilgisi Ekle</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(cmsSettings.socialLinks || []).map((soc) => (
                    <div key={soc.id} className="flex flex-col sm:flex-row items-center gap-3 bg-[#111111] p-3 rounded-xl border border-stone-800">
                      <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                        {PLATFORM_ICONS[soc.platform] || <LinkIcon size={16} className="text-stone-400" />}
                      </div>

                      <select
                        value={soc.platform}
                        onChange={(e) => handleUpdateSocialLink(soc.id, 'platform', e.target.value as any)}
                        className="bg-[#181818] border border-stone-800 text-xs p-2 rounded-lg text-amber-400 font-bold outline-none cursor-pointer sm:w-36"
                        title="Kategori Seç"
                      >
                        <option value="phone">Telefon</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="email">E-posta</option>
                        <option value="address">Adres</option>
                        <option value="owner">Firma Sahibi</option>
                        <option value="website">Web Sitesi</option>
                        <option value="other">Diğer</option>
                      </select>

                      <input
                        type="text"
                        value={soc.name}
                        onChange={(e) => handleUpdateSocialLink(soc.id, 'name', e.target.value)}
                        placeholder="Bilgi Adı"
                        className="bg-[#181818] border border-stone-800 text-xs p-2 rounded-lg text-white font-bold outline-none sm:w-36"
                      />

                      <input
                        type="text"
                        value={soc.url}
                        onChange={(e) => handleUpdateSocialLink(soc.id, 'url', e.target.value)}
                        placeholder="Değer / Bağlantı (Örn: 0535 219 47 89 veya https://...)"
                        className="flex-1 bg-[#181818] border border-stone-800 text-xs p-2 rounded-lg text-stone-200 outline-none w-full"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(soc.id)}
                        className="p-2 bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-400 rounded-lg border border-stone-800 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SUB TAB 4: HARİTA & SOSYAL MEDYA */}
          {contentSubTab === 'map-social' && (
            <div className="space-y-6">
              {/* GOOGLE MAPS SECTION */}
              <div className="bg-[#181818] p-6 rounded-2xl border border-stone-800 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <MapPin size={18} className="text-amber-500" />
                    <span>Google Harita Embed URL &amp; Canlı Önizleme</span>
                  </h3>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Google Maps Aç</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-300 block">Google Harita Iframe Embed Bağlantısı:</label>
                  <input
                    type="text"
                    value={cmsSettings.googleMapUrl}
                    onChange={(e) => handleUpdateSettingField('googleMapUrl', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full bg-[#111111] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Map Preview */}
                {cmsSettings.googleMapUrl && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Harita Canlı Önizleme:</span>
                    <div className="w-full h-64 rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-inner">
                      <iframe
                        title="Harita Önizleme"
                        src={cmsSettings.googleMapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* İLETİŞİM BİLGİLERİ MANAGEMENT */}
              <div className="bg-[#181818] p-6 rounded-2xl border border-stone-800 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                    <Phone size={18} className="text-amber-500" />
                    <span>İletişim Bilgileri</span>
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>+ Yeni Bilgi Ekle</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(cmsSettings.socialLinks || []).map((soc) => (
                    <div key={soc.id} className="flex flex-col sm:flex-row items-center gap-3 bg-[#111111] p-3 rounded-xl border border-stone-800">
                      {/* Auto Icon based on selected category */}
                      <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0">
                        {PLATFORM_ICONS[soc.platform] || <LinkIcon size={16} className="text-stone-400" />}
                      </div>

                      {/* Kategori Seç (İlk Alan) */}
                      <select
                        value={soc.platform}
                        onChange={(e) => handleUpdateSocialLink(soc.id, 'platform', e.target.value as any)}
                        className="bg-[#181818] border border-stone-800 text-xs p-2 rounded-lg text-amber-400 font-bold outline-none cursor-pointer sm:w-36"
                        title="Kategori Seç"
                      >
                        <option value="phone">Telefon</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="email">E-posta</option>
                        <option value="address">Adres</option>
                        <option value="owner">Firma Sahibi</option>
                        <option value="website">Web Sitesi</option>
                        <option value="other">Diğer</option>
                      </select>

                      <input
                        type="text"
                        value={soc.name}
                        onChange={(e) => handleUpdateSocialLink(soc.id, 'name', e.target.value)}
                        placeholder="Bilgi Adı"
                        className="bg-[#181818] border border-stone-800 text-xs p-2 rounded-lg text-white font-bold outline-none sm:w-36"
                      />

                      <input
                        type="text"
                        value={soc.url}
                        onChange={(e) => handleUpdateSocialLink(soc.id, 'url', e.target.value)}
                        placeholder="Değer / Bağlantı (Örn: 0535 219 47 89 veya https://...)"
                        className="flex-1 bg-[#181818] border border-stone-800 text-xs p-2 rounded-lg text-stone-200 outline-none w-full"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(soc.id)}
                        className="p-2 bg-stone-900 hover:bg-red-950 text-stone-400 hover:text-red-400 rounded-lg border border-stone-800 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* THREE-COLUMN UNIFIED CMS WORKSPACE */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[700px]">
        
        {/* ========================================== */}
        {/* COLUMN 1: SOL MENÜ - KATEGORİ AĞACI (3 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-3 bg-[#141414] border-r border-stone-850 p-4 flex flex-col space-y-3 overflow-y-auto max-h-[750px]">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={15} className="text-amber-500" />
              <span>Kategori Yönetimi</span>
            </span>

            <button
              type="button"
              onClick={() => setIsAddingMain(!isAddingMain)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="Yeni Kategori Ekle"
            >
              <Plus size={12} />
              <span>Yeni Kategori</span>
            </button>
          </div>

          {/* Add Main Category Input */}
          {isAddingMain && (
            <div className="p-3 bg-[#1a1a1a] border border-amber-500/50 rounded-xl space-y-2 animate-fade-in shadow-lg">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">Yeni Ana Kategori Adı:</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newMainNameInput}
                  onChange={(e) => setNewMainNameInput(e.target.value)}
                  placeholder="Örn: Çalışma Odası"
                  className="bg-black border border-stone-800 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none flex-1 focus:border-amber-500 font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddMainCategory}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg cursor-pointer"
                >
                  Ekle
                </button>
              </div>
            </div>
          )}

          {/* All Categories Option */}
          <div
            onClick={() => {
              setSelectedMainCat('ALL');
              setSelectedSubCat('ALL');
            }}
            className={`py-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
              selectedMainCat === 'ALL' && selectedSubCat === 'ALL'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'text-stone-300 hover:bg-stone-900'
            }`}
          >
            <span>Tüm Kategoriler ({products.length} Ürün)</span>
            {selectedMainCat === 'ALL' && <Check size={14} className="text-black" />}
          </div>

          {/* CATEGORY TREE ACCORDION LIST */}
          <div className="space-y-1.5 flex-1 pr-1">
            {filteredCategoryDefs.map((mainCat) => {
              const isExpanded = !!expandedCatIds[mainCat.id] || !!searchQuery.trim();
              const isSelectedMain = selectedMainCat === mainCat.name && selectedSubCat === 'ALL';
              const isEditingThisMain = editingMainId === mainCat.id;

              return (
                <div
                  key={mainCat.id}
                  className={`border rounded-xl transition-all ${
                    isSelectedMain
                      ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40'
                      : 'bg-[#181818] border-stone-850 hover:border-stone-700'
                  }`}
                >
                  {/* MAIN CATEGORY ROW */}
                  <div className="p-2.5 flex items-center justify-between gap-1.5">
                    
                    {isEditingThisMain ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={editingMainName}
                          onChange={(e) => setEditingMainName(e.target.value)}
                          className="bg-black border border-amber-500 text-white text-xs px-2 py-1 rounded outline-none flex-1 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveMainRename(mainCat.id)}
                          className="p-1.5 bg-amber-500 text-black font-bold rounded text-xs cursor-pointer"
                        >
                          <Save size={12} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          toggleExpand(mainCat.id);
                          setSelectedMainCat(mainCat.name);
                          setSelectedSubCat('ALL');
                        }}
                        className="flex items-center space-x-2 cursor-pointer select-none flex-1 min-w-0"
                      >
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(mainCat.id);
                          }}
                          className="p-1 rounded hover:bg-stone-800 text-amber-400 shrink-0 transition-transform cursor-pointer"
                          title={isExpanded ? 'Daralt' : 'Genişlet'}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        <span className={`text-xs font-bold truncate ${isSelectedMain ? 'text-amber-400 font-black' : 'text-stone-100'}`}>
                          {mainCat.name}
                        </span>
                        {mainCat.isActive === false && (
                          <span className="px-1.5 py-0.2 bg-stone-900 border border-amber-500/40 text-amber-400 text-[9px] font-black rounded uppercase shrink-0">
                            GİZLİ
                          </span>
                        )}
                      </div>
                    )}

                    {/* ACTIONS: Düzenle, Alt Kategori Ekle, Sayfaya Gizle, Sil */}
                    <div className="flex items-center space-x-1 shrink-0 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMainId(mainCat.id);
                          setEditingMainName(mainCat.name);
                        }}
                        className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 hover:border-amber-500 text-stone-300 hover:text-amber-400 rounded transition-colors"
                        title="Düzenle"
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddingSubForMainId(addingSubForMainId === mainCat.id ? null : mainCat.id)}
                        className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black rounded transition-colors"
                        title="Alt Kategori Ekle"
                      >
                        + Alt Kategori
                      </button>

                      {/* SAYFAYA GİZLE / YAYINA AL BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleMainHide(mainCat.id, mainCat.name, e)}
                        className={`px-1.5 py-0.5 rounded transition-colors font-bold cursor-pointer flex items-center gap-0.5 ${
                          mainCat.isActive === false
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-black'
                            : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400'
                        }`}
                        title={mainCat.isActive === false ? 'Yayına Al' : 'Sayfaya Gizle'}
                      >
                        {mainCat.isActive === false ? <Eye size={10} /> : <EyeOff size={10} />}
                        <span>{mainCat.isActive === false ? 'Yayına Al' : 'Sayfaya Gizle'}</span>
                      </button>

                      {/* FIXED DELETE MAIN CATEGORY BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteMain(mainCat.id, mainCat.name, e)}
                        className="px-1.5 py-0.5 bg-red-950/40 border border-red-900/60 hover:bg-red-600 hover:text-white text-red-300 rounded transition-colors font-bold cursor-pointer"
                        title="Kategoriyi Sil"
                      >
                        Sil
                      </button>
                    </div>

                  </div>

                  {/* Add Sub Category Inline Input */}
                  {addingSubForMainId === mainCat.id && (
                    <div className="p-2.5 bg-black/90 border-t border-stone-800 space-y-1.5">
                      <span className="text-[10px] text-amber-400 font-bold block">"{mainCat.name}" için Yeni Alt Kategori:</span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={newSubNameInput}
                          onChange={(e) => setNewSubNameInput(e.target.value)}
                          placeholder="Örn: Sürgülü Gardırop"
                          className="bg-[#181818] border border-stone-700 text-xs px-2 py-1 rounded text-white flex-1 outline-none font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubCategory(mainCat.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded cursor-pointer"
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUB CATEGORIES TREE LIST */}
                  {isExpanded && (
                    <div className="pl-4 pr-1.5 pb-2 pt-1 border-t border-stone-850 space-y-1">
                      {mainCat.subCategories.map((sub) => {
                        const isSelectedSub = selectedMainCat === mainCat.name && selectedSubCat === sub.name;
                        const isEditingThisSub = editingSubId === sub.id;

                        return (
                          <div
                            key={sub.id}
                            className={`p-1.5 rounded-lg border flex items-center justify-between text-xs transition-all ${
                              isSelectedSub
                                ? 'bg-amber-500 text-black font-extrabold border-amber-400 shadow-sm'
                                : 'bg-[#111111] border-stone-850 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            {isEditingThisSub ? (
                              <div className="flex items-center gap-1 flex-1">
                                <input
                                  type="text"
                                  value={editingSubName}
                                  onChange={(e) => setEditingSubName(e.target.value)}
                                  className="bg-black border border-amber-500 text-white text-xs px-2 py-0.5 rounded flex-1 outline-none font-bold"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveSubRename(mainCat.id, sub.id)}
                                  className="p-1 bg-amber-500 text-black font-bold rounded text-[10px]"
                                >
                                  <Save size={10} />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setSelectedMainCat(mainCat.name);
                                  setSelectedSubCat(sub.name);
                                }}
                                className="flex items-center gap-1.5 cursor-pointer flex-1 min-w-0"
                              >
                                <span className={`font-mono text-[10px] ${isSelectedSub ? 'text-black' : 'text-amber-500'}`}>-</span>
                                <span className="truncate">{sub.name}</span>
                                {sub.isActive === false && (
                                  <span className="px-1.5 py-0.2 bg-black border border-amber-500/40 text-amber-400 text-[9px] font-black rounded uppercase shrink-0">
                                    GİZLİ
                                  </span>
                                )}
                              </div>
                            )}

                            {/* SUBCATEGORY ACTIONS: Düzenle, Sayfaya Gizle, Sil */}
                            <div className="flex items-center space-x-1 shrink-0 text-[10px]">
                              {!isEditingThisSub && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSubId(sub.id);
                                    setEditingSubName(sub.name);
                                  }}
                                  className={`px-1.5 py-0.5 rounded ${
                                    isSelectedSub ? 'bg-black text-amber-400' : 'text-stone-400 hover:text-amber-400'
                                  }`}
                                  title="Alt Kategoriyi Düzenle"
                                >
                                  Düzenle
                                </button>
                              )}

                              {/* SAYFAYA GİZLE / YAYINA AL BUTTON */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleSubHide(mainCat.id, sub.id, sub.name, e)}
                                className={`px-1.5 py-0.5 rounded transition-colors font-bold cursor-pointer flex items-center gap-0.5 ${
                                  sub.isActive === false
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-black'
                                    : isSelectedSub ? 'bg-black/30 text-stone-900 hover:text-black' : 'text-stone-400 hover:text-amber-400'
                                }`}
                                title={sub.isActive === false ? 'Yayına Al' : 'Sayfaya Gizle'}
                              >
                                {sub.isActive === false ? <Eye size={10} /> : <EyeOff size={10} />}
                                <span>{sub.isActive === false ? 'Yayına Al' : 'Sayfaya Gizle'}</span>
                              </button>

                              {/* FIXED DELETE SUBCATEGORY BUTTON */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSub(mainCat.id, sub.id, sub.name, e)}
                                className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                  isSelectedSub 
                                    ? 'bg-red-950 text-red-200 hover:bg-red-900' 
                                    : 'text-stone-400 hover:text-red-400 hover:bg-red-950/40'
                                }`}
                                title="Alt Kategoriyi Sil"
                              >
                                Sil
                              </button>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* ========================================== */}
        {/* COLUMN 2: ORTADA SEÇİLEN KATEGORİYE AİT ÜRÜNLER (4 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-4 bg-[#111111] p-4 border-r border-stone-850 flex flex-col space-y-3 overflow-y-auto max-h-[750px]">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div>
              <span className="text-[10px] font-mono text-amber-500 uppercase font-bold block">
                {selectedMainCat === 'ALL' ? 'TÜM KATEGORİLER' : selectedMainCat}
                {selectedSubCat !== 'ALL' && ` / ${selectedSubCat}`}
              </span>
              <h3 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <Package size={14} className="text-amber-500" />
                <span>Ürün Listesi ({filteredProducts.length})</span>
              </h3>
            </div>
          </div>

          {/* PRODUCT CARDS LIST */}
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-[#161616] border border-stone-850 rounded-2xl space-y-3 my-auto">
              <Package size={32} className="mx-auto text-stone-600" />
              <p className="text-stone-400 text-xs font-semibold">Bu kategoriye ait ürün bulunamadı.</p>
              <button
                type="button"
                onClick={startNewProductForm}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                + Ürün Ekle
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 pr-1">
              {filteredProducts.map((p) => {
                const coverImg = p.images && p.images[p.coverImageIndex || 0] ? p.images[p.coverImageIndex || 0] : p.images?.[0] || 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400';
                const isSelected = selectedProductId === p.id && !isCreatingNewProduct;
                const isPassive = !!p.isHidden;
                const prodCode = p.productCode || `KOD-${p.id.slice(-4).toUpperCase()}`;

                return (
                  <div
                    key={p.id}
                    onClick={() => loadProductToForm(p)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-lg ring-1 ring-amber-500'
                        : isPassive
                        ? 'bg-red-950/20 border-red-900/40 opacity-70'
                        : 'bg-[#181818] border-stone-850 hover:border-amber-500/50 hover:bg-[#202020]'
                    }`}
                  >
                    {/* Image & Product Basic Info */}
                    <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                      <img
                        src={coverImg}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-cover rounded-xl bg-black border border-stone-800 shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">
                          {p.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-amber-400 font-mono font-bold">{prodCode}</span>
                          <span className="text-[10px] text-stone-500">•</span>
                          <span className="text-[10px] text-stone-300 font-mono font-extrabold">
                            {p.startingPrice ? `₺${p.startingPrice.toLocaleString('tr-TR')}` : 'Fiyat Alınız'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            isPassive ? 'bg-red-900/80 text-red-200' : 'bg-emerald-500/80 text-black'
                          }`}>
                            {isPassive ? 'PASİF' : 'AKTİF'}
                          </span>
                          <span className="text-[9px] text-stone-400 truncate">{p.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Card Action Controls */}
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleProductStatus(p.id, p.name, e)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isPassive ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-amber-400'
                        }`}
                        title={isPassive ? 'Yayına Al' : 'Sayfaya Gizle'}
                      >
                        {isPassive ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{isPassive ? 'Yayına Al' : 'Sayfaya Gizle'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteProduct(p.id, p.name, e)}
                        className="p-1.5 bg-stone-900 border border-stone-800 text-stone-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ========================================== */}
        {/* COLUMN 3: RESTORED FULL PRODUCT EDITOR (5 Cols) */}
        {/* ========================================== */}
        <div className="lg:col-span-5 bg-[#161616] p-5 flex flex-col space-y-4 overflow-y-auto max-h-[750px]">
          
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase block">
                {isCreatingNewProduct ? 'YENİ ÜRÜN OLUŞTURMA' : `DÜZENLENEN ÜRÜN (ID: ${selectedProductId})`}
              </span>
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Edit3 size={16} className="text-amber-500" />
                <span>{isCreatingNewProduct ? 'Yeni Ürün Bilgilerini Girin' : `Düzenle: ${formName}`}</span>
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={startNewProductForm}
                className="px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
              >
                + Yeni
              </button>
            </div>
          </div>

          {/* CLEAN REFACTORED PRODUCT FORM */}
          <form onSubmit={handleSaveProductForm} className="space-y-5 text-xs">
            
            {/* 1. MEDYA VE GALERİ YÖNETİMİ (FOTOĞRAF, VİDEO, GIF - MAX 30) */}
            <MediaGalleryUploader
              mediaList={formImages}
              onChange={setFormImages}
              coverIndex={formCoverIndex}
              onCoverIndexChange={setFormCoverIndex}
              maxFiles={30}
              title="1. Ürün Fotoğraf & Medya Galeri (Fotoğraf, Video, GIF)"
            />

            {/* 2. TEMEL ÜRÜN BİLGİLERİ */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-stone-850 space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block border-b border-stone-800 pb-1.5">
                2. Temel Ürün Bilgileri
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Viyana Aynalı Sürgülü Gardırop"
                    className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2.5 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Durumu (Aktif/Pasif)</label>
                  <button
                    type="button"
                    onClick={() => setFormIsHidden(!formIsHidden)}
                    className={`w-full py-2 px-3 rounded-xl font-bold flex items-center justify-between border cursor-pointer ${
                      formIsHidden
                        ? 'bg-red-950/60 border-red-800 text-red-300'
                        : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    }`}
                  >
                    <span>{formIsHidden ? 'PASİF (Sitede Gizli)' : 'AKTİF (Sitede Görünür)'}</span>
                    {formIsHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Stok Durumu</label>
                  <select
                    value={formStockStatus}
                    onChange={(e) => setFormStockStatus(e.target.value as any)}
                    className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-stone-200 outline-none focus:border-amber-500 cursor-pointer font-bold"
                  >
                    <option value="Sipariş Üzerine Üretiliyor">Sipariş Üzerine Üretiliyor</option>
                    <option value="Stokta Var">Stokta Var</option>
                    <option value="Özel Üretim">Özel Üretim</option>
                  </select>
                </div>

                {/* Ana Kategori Seçimi */}
                <div className="space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Ana Kategori</label>
                  <select
                    value={formMainCategory}
                    onChange={(e) => {
                      const newMain = e.target.value;
                      setFormMainCategory(newMain);
                      const mainObj = categoryDefs.find(c => c.name === newMain);
                      if (mainObj && mainObj.subCategories.length > 0) {
                        setFormSubCategory(mainObj.subCategories[0].name);
                      }
                    }}
                    className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    {categoryDefs.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Alt Kategori Seçimi */}
                <div className="space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Alt Kategori</label>
                  {currentSelectedMainDef && currentSelectedMainDef.subCategories.length > 0 ? (
                    <select
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-amber-400 outline-none focus:border-amber-500 font-bold cursor-pointer"
                    >
                      {currentSelectedMainDef.subCategories.map(sub => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      placeholder="Alt Kategori Yazın"
                      className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-amber-500 font-bold"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 3. FİYAT BİLGİLERİ */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-stone-850 space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block border-b border-stone-800 pb-1.5">
                3. Fiyat &amp; Kampanya Bilgileri
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Başlangıç Fiyatı (₺)</label>
                  <input
                    type="number"
                    value={formStartingPrice}
                    onChange={(e) => setFormStartingPrice(e.target.value)}
                    placeholder="Örn: 24500"
                    className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">Kampanya Fiyatı (₺)</label>
                  <input
                    type="number"
                    value={formCampaignPrice}
                    onChange={(e) => setFormCampaignPrice(e.target.value)}
                    placeholder="Örn: 21900"
                    className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-emerald-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-stone-300 font-bold uppercase block">KDV Durumu</label>
                  <input
                    type="text"
                    value={formVatStatus}
                    onChange={(e) => setFormVatStatus(e.target.value)}
                    className="w-full bg-[#181818] border border-stone-800 text-xs px-3 py-2 rounded-xl text-stone-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. ÜRÜN AÇIKLAMASI (TEK ALAN) */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-stone-850 space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block border-b border-stone-800 pb-1.5">
                4. Ürün Açıklaması
              </span>

              <div>
                <label className="text-stone-300 font-bold uppercase block mb-1">Açıklama Metni (İstediğiniz Kadar Metin Yazabilirsiniz)</label>
                <textarea
                  rows={5}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Ürün hakkında detaylı imalat, ahşap türü, lake cila ve tasarım açıklamalarını buraya yazabilirsiniz..."
                  className="w-full bg-[#181818] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* 5. KULLANILAN MALZEME (SERBEST METİN ALANI) */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-stone-850 space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block border-b border-stone-800 pb-1.5">
                5. Kullanılan Malzeme
              </span>

              <div>
                <label className="text-stone-300 font-bold uppercase block mb-1">Kullanılan Malzeme (Serbest Metin)</label>
                <textarea
                  rows={4}
                  value={formMaterialText}
                  onChange={(e) => setFormMaterialText(e.target.value)}
                  placeholder="Örn:\n- MDF\n- Lake Boyalı MDF\n- PVC Kenar Bant\n- Frenli Ray Sistemi"
                  className="w-full bg-[#181818] border border-stone-800 text-xs p-3 rounded-xl text-amber-300 font-mono outline-none focus:border-amber-500 leading-relaxed"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Her satıra bir malzeme yazabilir veya serbest paragraf olarak belirtebilirsiniz.
                </p>
              </div>
            </div>

            {/* 6. ÖLÇÜLER (SERBEST METİN ALANI) */}
            <div className="bg-[#111111] p-4 rounded-2xl border border-stone-850 space-y-3">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block border-b border-stone-800 pb-1.5">
                6. Ölçüler
              </span>

              <div>
                <label className="text-stone-300 font-bold uppercase block mb-1">Ürün Ölçü Bilgisi (Serbest Metin)</label>
                <textarea
                  rows={3}
                  value={formDimensions}
                  onChange={(e) => setFormDimensions(e.target.value)}
                  placeholder="Örn: 240 cm genişlik × 60 cm derinlik × 220 cm yükseklik veya Özel ölçüye göre üretilmektedir."
                  className="w-full bg-[#181818] border border-stone-800 text-xs p-3 rounded-xl text-white outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>

            {/* 6. ACTION BUTTONS: KAYDET VE ÜRÜNÜ SİL */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="submit"
                className="py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={16} />
                <span>ÜRÜN BİLGİLERİNİ KAYDET</span>
              </button>

              {!isCreatingNewProduct && selectedProductId && (
                <button
                  type="button"
                  onClick={() => {
                    const prod = products.find(p => p.id === selectedProductId);
                    if (prod) {
                      handleDeleteProduct(prod.id, prod.name);
                    }
                  }}
                  className="py-3.5 px-6 bg-red-950/80 hover:bg-red-600 border border-red-800 text-red-200 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 size={16} />
                  <span>ÜRÜNÜ SİL</span>
                </button>
              )}
            </div>

          </form>

        </div>

      </div>
      )}

      {/* ========================================== */}
      {/* CONFIRMATION DIALOG MODAL (SİL VE KALICI SİL ONAY PENCERESİ) */}
      {/* ========================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#161616] border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{confirmModal.title}</h3>
                <span className="text-[11px] text-stone-400 font-mono">Çat Kapı CMS Güvenlik Onayı</span>
              </div>
            </div>

            <p className="text-sm text-stone-300 leading-relaxed bg-[#111111] p-4 rounded-2xl border border-stone-850">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2.5 font-extrabold text-xs uppercase rounded-xl transition-all shadow-lg cursor-pointer ${
                  confirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/50'
                }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ARCHIVE MANAGEMENT MODAL (GİZLİ & ARŞİVLENMİŞ ÖĞELER) */}
      {/* ========================================== */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-stone-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-[#111111]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Archive size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Arşiv ve Gizlenen Öğeler</span>
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-black rounded-full">
                      {totalArchivedCount}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Sayfadan gizlenmiş kategoriler, alt kategoriler ve ürünler. Buradan tekrar yayına alabilir veya kalıcı olarak silebilirsiniz.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category / Type Tabs */}
            <div className="px-5 pt-3 bg-[#111111] border-b border-stone-800 flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setArchiveTab('all')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                  archiveTab === 'all'
                    ? 'bg-[#181818] text-amber-400 border-t-2 border-amber-500'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Tümü ({totalArchivedCount})
              </button>
              <button
                type="button"
                onClick={() => setArchiveTab('categories')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                  archiveTab === 'categories'
                    ? 'bg-[#181818] text-amber-400 border-t-2 border-amber-500'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Kategoriler ({archivedMainCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setArchiveTab('subcategories')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                  archiveTab === 'subcategories'
                    ? 'bg-[#181818] text-amber-400 border-t-2 border-amber-500'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Alt Kategoriler ({archivedSubCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setArchiveTab('products')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
                  archiveTab === 'products'
                    ? 'bg-[#181818] text-amber-400 border-t-2 border-amber-500'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Ürünler ({archivedProducts.length})
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-[#181818]">
              {totalArchivedCount === 0 ? (
                <div className="p-12 text-center bg-[#111111] border border-stone-850 rounded-2xl space-y-2 my-auto">
                  <Archive size={36} className="mx-auto text-stone-600" />
                  <p className="text-stone-300 font-bold text-sm">Henüz arşivlenmiş (gizlenmiş) öğe bulunmuyor.</p>
                  <p className="text-xs text-stone-500">Yönetim panelinde "Sayfaya Gizle" butonunu kullandığınız öğeler bu alanda listelenir.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* HIERARCHICAL CATEGORY & PRODUCT TREE VIEW (WHEN TAB IS 'all') */}
                  {archiveTab === 'all' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#111111] border border-amber-500/30 rounded-2xl flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Layers size={16} />
                          <span>Arşiv Hiyerarşisi (Ağaç Görünümü)</span>
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Kategori adına tıklayarak alt kategorileri ve ürünleri görüntüleyebilirsiniz.
                        </span>
                      </div>

                      {archivedTreeCategories.map(mainCat => {
                        const isMainHidden = mainCat.isActive === false;
                        const isMainExpanded = archiveExpandedMains[mainCat.id] !== false; // Default expanded so it's instantly readable
                        const subCategories = mainCat.subCategories || [];
                        const mainArchivedProducts = products.filter(p => p.category === mainCat.name && p.isHidden);

                        return (
                          <div key={mainCat.id} className="border border-stone-800 rounded-2xl bg-[#111111] overflow-hidden shadow-lg">
                            
                            {/* Main Category Row */}
                            <div 
                              onClick={() => toggleArchiveMain(mainCat.id)}
                              className="p-3.5 bg-[#161616] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#1c1c1c] transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button type="button" className="p-1 text-amber-400 shrink-0">
                                  {isMainExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                                <FolderPlus size={18} className="text-amber-500 shrink-0" />
                                <div className="truncate">
                                  <span className="text-sm font-black text-white truncate block">{mainCat.name}</span>
                                  <span className="text-[10px] text-stone-400 font-mono">
                                    {subCategories.length} Alt Kategori • {mainArchivedProducts.length} Gizli Ürün
                                  </span>
                                </div>
                                {isMainHidden && (
                                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black rounded uppercase shrink-0">
                                    GİZLİ KATEGORİ
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                {isMainHidden && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMainHide(mainCat.id, mainCat.name)}
                                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Eye size={13} />
                                    <span>Kategoriyi Yayına Al</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => promptPermanentDeleteMain(mainCat.id, mainCat.name)}
                                  className="px-3 py-1.5 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 size={13} />
                                  <span>Kalıcı Sil</span>
                                </button>
                              </div>
                            </div>

                            {/* Main Category Expanded Content */}
                            {isMainExpanded && (
                              <div className="p-3.5 pl-6 sm:pl-8 space-y-3 border-t border-stone-850 bg-[#141414]">
                                
                                {/* Subcategories List */}
                                {subCategories.length > 0 && subCategories.map(sub => {
                                  const isSubHidden = sub.isActive === false;
                                  const isSubExpanded = archiveExpandedSubs[sub.id] !== false; // Default expanded
                                  const subArchivedProducts = mainArchivedProducts.filter(p => p.subCategory === sub.name);

                                  return (
                                    <div key={sub.id} className="border border-stone-800 rounded-xl bg-[#181818] overflow-hidden">
                                      <div 
                                        onClick={() => toggleArchiveSub(sub.id)}
                                        className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#202020] transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <button type="button" className="p-0.5 text-amber-400 shrink-0">
                                            {isSubExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                          </button>
                                          <span className="text-xs font-bold text-stone-200 truncate">{sub.name}</span>
                                          <span className="text-[10px] text-stone-400 font-mono">({subArchivedProducts.length} gizli ürün)</span>
                                          {isSubHidden && (
                                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black rounded uppercase shrink-0">
                                              GİZLİ ALT KATEGORİ
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                          {isSubHidden && (
                                            <button
                                              type="button"
                                              onClick={() => handleToggleSubHide(mainCat.id, sub.id, sub.name)}
                                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Eye size={12} />
                                              <span>Alt Kategoriyi Yayına Al</span>
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => promptPermanentDeleteSub(mainCat.id, sub.id, sub.name)}
                                            className="px-2.5 py-1 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                          >
                                            <Trash2 size={12} />
                                            <span>Kalıcı Sil</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Products inside Subcategory */}
                                      {isSubExpanded && (
                                        <div className="p-2.5 pl-6 space-y-2 border-t border-stone-800 bg-[#121212]">
                                          {subArchivedProducts.length === 0 ? (
                                            <p className="text-[11px] text-stone-500 italic p-1">Bu alt kategoride gizlenmiş ürün bulunmuyor.</p>
                                          ) : (
                                            subArchivedProducts.map(prod => {
                                              const coverImg = prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400';
                                              return (
                                                <div key={prod.id} className="p-2.5 bg-[#1a1a1a] border border-stone-800 rounded-xl flex items-center justify-between gap-3">
                                                  <div className="flex items-center gap-3 overflow-hidden">
                                                    <img
                                                      src={coverImg}
                                                      alt={prod.name}
                                                      referrerPolicy="no-referrer"
                                                      className="w-10 h-10 object-cover rounded-lg bg-black border border-stone-800 shrink-0"
                                                    />
                                                    <div className="truncate">
                                                      <span className="text-xs font-bold text-white block truncate">{prod.name}</span>
                                                      <span className="text-[10px] text-stone-400 font-mono">
                                                        {prod.productCode || prod.id} • {prod.campaignPrice || prod.startingPrice} TL
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                      type="button"
                                                      onClick={() => handleToggleProductStatus(prod.id, prod.name)}
                                                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                                    >
                                                      <Eye size={12} />
                                                      <span>Yayına Al</span>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => promptPermanentDeleteProduct(prod.id, prod.name)}
                                                      className="px-2.5 py-1 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                                    >
                                                      <Trash2 size={12} />
                                                      <span>Kalıcı Sil</span>
                                                    </button>
                                                  </div>
                                                </div>
                                              );
                                            })
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Direct Products under main category without matching subcategory */}
                                {mainArchivedProducts.filter(p => !p.subCategory || !subCategories.some(s => s.name === p.subCategory)).length > 0 && (
                                  <div className="space-y-2 pt-1">
                                    <span className="text-[10px] font-black text-amber-500 uppercase block">Diğer Gizli Ürünler</span>
                                    {mainArchivedProducts.filter(p => !p.subCategory || !subCategories.some(s => s.name === p.subCategory)).map(prod => {
                                      const coverImg = prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400';
                                      return (
                                        <div key={prod.id} className="p-2.5 bg-[#1a1a1a] border border-stone-800 rounded-xl flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3 overflow-hidden">
                                            <img
                                              src={coverImg}
                                              alt={prod.name}
                                              referrerPolicy="no-referrer"
                                              className="w-10 h-10 object-cover rounded-lg bg-black border border-stone-800 shrink-0"
                                            />
                                            <div className="truncate">
                                              <span className="text-xs font-bold text-white block truncate">{prod.name}</span>
                                              <span className="text-[10px] text-stone-400 font-mono">
                                                {prod.productCode || prod.id} • {prod.campaignPrice || prod.startingPrice} TL
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleProductStatus(prod.id, prod.name)}
                                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Eye size={12} />
                                              <span>Yayına Al</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => promptPermanentDeleteProduct(prod.id, prod.name)}
                                              className="px-2.5 py-1 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Trash2 size={12} />
                                              <span>Kalıcı Sil</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MAIN CATEGORIES SECTION (SPECIFIC TAB) */}
                  {archiveTab === 'categories' && archivedMainCategories.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FolderPlus size={14} />
                        <span>Gizlenen Kategoriler ({archivedMainCategories.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {archivedMainCategories.map(cat => (
                          <div key={cat.id} className="p-3 bg-[#111111] border border-stone-800 rounded-2xl flex items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-bold text-white block">{cat.name}</span>
                              <span className="text-[10px] text-stone-500 font-mono">ID: {cat.id}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleMainHide(cat.id, cat.name)}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Eye size={12} />
                                <span>Yayına Al</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => promptPermanentDeleteMain(cat.id, cat.name)}
                                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                <span>Kalıcı Sil</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUBCATEGORIES SECTION (SPECIFIC TAB) */}
                  {archiveTab === 'subcategories' && archivedSubCategories.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FolderPlus size={14} />
                        <span>Gizlenen Alt Kategoriler ({archivedSubCategories.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {archivedSubCategories.map(sub => (
                          <div key={sub.id} className="p-3 bg-[#111111] border border-stone-800 rounded-2xl flex items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-bold text-white block">{sub.name}</span>
                              <span className="text-[10px] text-stone-400">Ana Kategori: {sub.parentMainName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleSubHide(sub.parentMainId, sub.id, sub.name)}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Eye size={12} />
                                <span>Yayına Al</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => promptPermanentDeleteSub(sub.parentMainId, sub.id, sub.name)}
                                className="px-3 py-1.5 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                <span>Kalıcı Sil</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PRODUCTS SECTION (SPECIFIC TAB) */}
                  {archiveTab === 'products' && archivedProducts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Package size={14} />
                        <span>Gizlenen Ürünler ({archivedProducts.length})</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {archivedProducts.map(prod => {
                          const coverImg = prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400';
                          return (
                            <div key={prod.id} className="p-3 bg-[#111111] border border-stone-800 rounded-2xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <img
                                  src={coverImg}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 object-cover rounded-xl bg-black border border-stone-800 shrink-0"
                                />
                                <div className="truncate">
                                  <span className="text-xs font-bold text-white block truncate">{prod.name}</span>
                                  <span className="text-[10px] text-stone-400 font-mono">{prod.category} {prod.subCategory ? `/ ${prod.subCategory}` : ''}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(prod.id, prod.name)}
                                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Eye size={12} />
                                  <span>Yayına Al</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => promptPermanentDeleteProduct(prod.id, prod.name)}
                                  className="px-3 py-1.5 bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 size={12} />
                                  <span>Kalıcı Sil</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#111111] border-t border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
