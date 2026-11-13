import { GoodsKindManager } from './GoodsKindManager';
import { getGoodsKinds } from '../utils/goodsKinds';
import { SALE_STATUSES, getSaleStatus } from '../data/saleStatus';
import { SaleStatus } from '../types';
import { isWebUrl } from '../utils/goodsLinks';
import { getGoodsKind, hasLegendaryBadge, normalizeGoods, getGoodsCategories } from '../utils/goodsKind';
import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Sliders,
  Share2,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Check,
  AlertTriangle,
  Palette,
  Layout,
  ExternalLink,
  Sparkles,
  Link2,
  Crown,
  Lock,
  Tag,
  FolderPlus,
  Settings2,
  Calendar,
  Award,
  Type,
  Image as ImageIcon,
  FileText,
  FileUp,
  BookOpen
} from 'lucide-react';
import { GoodsItem, SiteConfig, MemberId, CategoryItem, Rarity, User, SiteTexts, NewsItem } from '../types';
import { MEMBERS, getRarityLabel } from '../data/members';
import { DEFAULT_SITE_TEXTS, DEFAULT_SITE_CONFIG } from '../data/initialGoods';
import { GRADIENT_PRESETS, DEFAULT_CUSTOM_GRADIENT, getGradientCss } from '../utils/gradientUtils';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  goods: GoodsItem[];
  onAddGoods: (newGoods: GoodsItem) => void;
  onUpdateGoods: (updatedGoods: GoodsItem) => void;
  onDeleteGoods: (id: string) => void;
  onResetToDefault: () => void;
  categories: CategoryItem[];
  news?: NewsItem[];
  onAddCategory: (cat: CategoryItem) => void;
  onUpdateCategory: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
  onResetCategories: () => void;
  config: SiteConfig;
  onUpdateConfig: (newConfig: Partial<SiteConfig>) => void;
  onImportData: (data: { goods: GoodsItem[]; config: SiteConfig; categories?: CategoryItem[]; news?: NewsItem[] }) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
  currentUser: User | null;
  onOpenLogin: (defaultAdminTab?: boolean) => void;
  isDarkMode?: boolean;
  initialTab?: 'crud' | 'textEdit' | 'categories' | 'design' | 'seo' | 'backup';
  initialEditingGoods?: GoodsItem | null;
  onOpenAboutModal?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  goods,
  onAddGoods,
  onUpdateGoods,
  onDeleteGoods,
  onResetToDefault,
  categories,
  news = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
  config,
  onUpdateConfig,
  onImportData,
  onShowToast,
  currentUser,
  onOpenLogin,
  isDarkMode = false,
  initialTab = 'crud',
  initialEditingGoods = null,
  onOpenAboutModal,
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';
  const kindOptions = getGoodsKinds(config.goodsKinds);

  // Calculate dynamic years from 2021 to currentYear
  const currentYear = new Date().getFullYear();
  const availableYears: number[] = [];
  for (let y = 2021; y <= currentYear; y++) {
    availableYears.push(y);
  }

  const [activeTab, setActiveTab] = useState<'crud' | 'textEdit' | 'categories' | 'design' | 'seo' | 'backup'>(initialTab);
  const [editingGoodsId, setEditingGoodsId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Site Text CMS States (웹사이트 모든 글·문구 편집 상태)
  const [textCmsMember, setTextCmsMember] = useState<MemberId>('all');
  const [localSiteTexts, setLocalSiteTexts] = useState<SiteTexts>(() => ({
    ...DEFAULT_SITE_TEXTS,
    ...(config.siteTexts || {}),
  }));
  const [localSiteTitle, setLocalSiteTitle] = useState(config.siteTitle || DEFAULT_SITE_CONFIG.siteTitle);
  const [localSiteSubtitle, setLocalSiteSubtitle] = useState(config.siteSubtitle || DEFAULT_SITE_CONFIG.siteSubtitle);
  const [localHeroHeadline, setLocalHeroHeadline] = useState(config.heroHeadline || DEFAULT_SITE_CONFIG.heroHeadline);
  const [localHeroDescription, setLocalHeroDescription] = useState(config.heroDescription || DEFAULT_SITE_CONFIG.heroDescription);

  // Goods Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMember, setFormMember] = useState<MemberId>('group');
  const [formCategories, setFormCategories] = useState<string[]>([categories[0]?.id || 'album']);
  const [formSaleStatus, setFormSaleStatus] = useState<SaleStatus | undefined>('upcoming');
  const [formLegendary, setFormLegendary] = useState(false);
  const [formRarity, setFormRarity] = useState<Rarity>(kindOptions[0].id);
  const [formYear, setFormYear] = useState<number>(currentYear);
  const [formDate, setFormDate] = useState(`${currentYear}.01.01`);
  const [formPrice, setFormPrice] = useState(35000);
  const [formMarketPrice, setFormMarketPrice] = useState(50000);

  // Goods Images State: multiple images support (formImages[0] is primary/cover)
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const formImageUrl = formImages[0] || '';
  const setFormImageUrl = (url: string) => {
    if (!url) {
      setFormImages((prev) => prev.slice(1));
    } else {
      setFormImages((prev) => (prev.length > 0 ? [url, ...prev.slice(1)] : [url]));
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setFormImages((prev) => [...prev, trimmed]);
    setImageUrlInput('');
    onShowToast('이미지 URL이 갤러리에 추가되었습니다.', 'success');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    onShowToast('선택한 이미지가 삭제되었습니다.', 'info');
  };

  const handleSetMainImage = (indexToMain: number) => {
    setFormImages((prev) => {
      if (indexToMain === 0) return prev;
      const target = prev[indexToMain];
      const rest = prev.filter((_, idx) => idx !== indexToMain);
      return [target, ...rest];
    });
    onShowToast('대표 이미지(커버 사진)로 설정되었습니다.', 'success');
  };

  const [formDescription, setFormDescription] = useState('');
  const [formComponents, setFormComponents] = useState('아크릴 스탠드 본품 1종\n전용 조립식 베이스\n홀로그램 포토카드');
  const [formTags, setFormTags] = useState<string[]>(['이세돌', '굿즈', '공식']);
  const [tagInput, setTagInput] = useState('');
  const [formRelatedLinks, setFormRelatedLinks] = useState<{ label: string; url: string }[]>([]);
  const [formSize, setFormSize] = useState('');
  const [formOfficialUrl, setFormOfficialUrl] = useState('https://cafe.naver.com/steamindiegame');

  // Category Manager State
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎁');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatLabel, setEditingCatLabel] = useState('');
  const [editingCatIcon, setEditingCatIcon] = useState('');

  // Story Editor per-member selection state
  const [adminStoryMember, setAdminStoryMember] = useState<MemberId>('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Format detection helper (JPG, PNG, WebP, GIF, AVIF, SVG)
  const getImageFormat = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:image/')) {
      const match = url.match(/data:image\/([a-zA-Z0-9+]+);/);
      return match ? match[1].toUpperCase() : 'BASE64';
    }
    const clean = url.split('?')[0].toLowerCase();
    if (clean.endsWith('.webp')) return 'WEBP';
    if (clean.endsWith('.png')) return 'PNG';
    if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'JPG';
    if (clean.endsWith('.gif')) return 'GIF';
    if (clean.endsWith('.avif')) return 'AVIF';
    if (clean.endsWith('.svg')) return 'SVG';
    return 'WEB';
  };

  // Upload handler for multiple local image formats (JPG, PNG, WebP, GIF, AVIF, SVG)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileList) {
      if (file.size > 15 * 1024 * 1024) {
        alert(`'${file.name}' 파일 용량이 너무 큽니다 (15MB 이하 지원).`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    const readPromises = validFiles.map((file) => {
      return new Promise<{ result: string; ext: string }>((resolve, reject) => {
        const ext = file.name.split('.').pop()?.toUpperCase() || file.type.split('/')[1]?.toUpperCase() || 'IMG';
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            resolve({ result: event.target.result, ext });
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises)
      .then((results) => {
        const newImages = results.map((r) => r.result);
        const exts = Array.from(new Set(results.map((r) => r.ext))).join(', ');
        setFormImages((prev) => [...prev, ...newImages]);
        onShowToast(`[${exts}] ${results.length}장의 이미지가 성공적으로 추가되었습니다!`, 'success');
      })
      .catch((err) => {
        console.error('File read error', err);
        alert('이미지 파일을 읽는 중 오류가 발생했습니다.');
      });

    e.target.value = '';
  };

  // Diverse format sample presets for one-click testing
  const SAMPLE_IMAGE_PRESETS = [
    {
      format: 'WEBP',
      title: 'LP 앨범 (WebP)',
      url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    },
    {
      format: 'PNG',
      title: '아크릴 피규어 (PNG)',
      url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
      badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
    },
    {
      format: 'JPG',
      title: '콘서트 응원봉 (JPG)',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
    {
      format: 'GIF',
      title: '스페셜 카드 (GIF)',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
      badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    },
  ];

  // Quick Title Prefix Tags for easy text editing
  const TITLE_PREFIX_CHIPS = ['[한정판]', '[공식]', '[RE:WIND]', '[KIDDING]', '[콘서트]', '[양장본]', '[팬메이드]', '[시그니처]'];

  // Quick Description Templates for easy text editing
  const DESCRIPTION_TEMPLATES = [
    {
      label: '👑 공주 보물 템플릿',
      content: '👑 [이세돌 공주 보물]: 데뷔 기념 특별 굿즈로 제작되어 팬들에게 소중한 기억을 선사합니다.\n📦 [구성품 안내]: 본품, 홀로그램 포토카드, 정품 인증서 포함.\n💎 [소장 포인트]: 고화질 인쇄 및 프리미엄 마감 소장용.',
    },
    {
      label: '✨ 한정판 스토리 템플릿',
      content: '✨ [한정판 스페셜 에디션]: 기간 한정으로만 제작된 희귀 보물 소장품입니다.\n🎨 [비주얼 특징]: 멤버 고유의 시그니처 일러스트와 금박 각인 적용.\n🌟 [소장 가치]: 향후 재생산 계획이 없는 특별 아카이브 아이템.',
    },
    {
      label: '🎵 음반 / LP 템플릿',
      content: '🎵 [트랙 리스트]: 타이틀곡 및 미공개 인스투루멘탈 고음질 수록.\n💿 [패키지 사양]: 양장 하드커버 패키지와 미공개 미니 포토북 수록.',
    },
  ];

  const resetForm = () => {
    setFormTitle('');
    setFormMember('group');
    setFormCategories([categories[0]?.id || 'album']);
    setFormRarity(kindOptions[0].id);
    setFormLegendary(false);
    setFormSaleStatus('upcoming');
    setFormYear(currentYear);
    setFormDate(`${currentYear}.01.01`);
    setFormPrice(35000);
    setFormMarketPrice(50000);
    setFormImages(['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80']);
    setImageUrlInput('');
    setFormDescription('');
    setFormComponents('포토카드 6종 세트\n공식 리릭북');
    setFormTags(['이세돌', '굿즈']);
    setTagInput('');
    setFormOfficialUrl('https://cafe.naver.com/steamindiegame');
    setFormSize('');
    setFormRelatedLinks([]);
    setEditingGoodsId(null);
  };

  const startEditGoods = (item: GoodsItem) => {
    setEditingGoodsId(item.id);
    setFormTitle(item.title);
    setFormMember(item.memberId);
    setFormCategories(getGoodsCategories(item));
    setFormRarity(getGoodsKind(item.rarity));
    setFormLegendary(hasLegendaryBadge(item));
    setFormSaleStatus(getSaleStatus(item.saleStatus)?.value);
    setFormYear(item.releaseYear || parseInt(item.releaseDate.slice(0, 4), 10) || currentYear);
    setFormDate(item.releaseDate);
    setFormPrice(item.originalPrice);
    setFormMarketPrice(item.currentMarketPrice || item.originalPrice);
    const existingImgs = [item.imageUrl, ...(item.additionalImages || [])].filter(Boolean);
    setFormImages(existingImgs.length > 0 ? existingImgs : ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80']);
    setImageUrlInput('');
    setFormDescription(item.description);
    setFormComponents((item.components || []).join('\n'));
    setFormTags([...(item.tags || [])]);
    setTagInput('');
    setFormOfficialUrl(item.officialUrl || '');
    setFormSize(item.specs?.size || '');
    setFormRelatedLinks((item.relatedLinks || []).map(link => ({ ...link })));
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (initialEditingGoods) {
      setActiveTab('crud');
      startEditGoods(initialEditingGoods);
    }
  }, [initialEditingGoods]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    setLocalSiteTexts({
      ...DEFAULT_SITE_TEXTS,
      ...(config.siteTexts || {}),
    });
    setLocalSiteTitle(config.siteTitle || DEFAULT_SITE_CONFIG.siteTitle);
    setLocalSiteSubtitle(config.siteSubtitle || DEFAULT_SITE_CONFIG.siteSubtitle);
    setLocalHeroHeadline(config.heroHeadline || DEFAULT_SITE_CONFIG.heroHeadline);
    setLocalHeroDescription(config.heroDescription || DEFAULT_SITE_CONFIG.heroDescription);
  }, [config, isOpen]);

  const handleUpdateSiteTextKey = (key: keyof SiteTexts, value: string) => {
    setLocalSiteTexts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveAllSiteTexts = () => {
    onUpdateConfig({
      siteTitle: localSiteTitle.trim() || DEFAULT_SITE_CONFIG.siteTitle,
      siteSubtitle: localSiteSubtitle.trim() || DEFAULT_SITE_CONFIG.siteSubtitle,
      heroHeadline: localHeroHeadline.trim() || DEFAULT_SITE_CONFIG.heroHeadline,
      heroDescription: localHeroDescription.trim() || DEFAULT_SITE_CONFIG.heroDescription,
      siteTexts: localSiteTexts,
    });
    onShowToast('웹사이트의 모든 글과 안내 문구가 성공적으로 저장되었습니다!', 'success');
  };

  const handleResetAllSiteTexts = () => {
    if (!window.confirm('모든 문구와 글을 시스템 기본값으로 복원하시겠습니까?')) return;
    setLocalSiteTexts(DEFAULT_SITE_TEXTS);
    setLocalSiteTitle(DEFAULT_SITE_CONFIG.siteTitle);
    setLocalSiteSubtitle(DEFAULT_SITE_CONFIG.siteSubtitle);
    setLocalHeroHeadline(DEFAULT_SITE_CONFIG.heroHeadline);
    setLocalHeroDescription(DEFAULT_SITE_CONFIG.heroDescription);
    onUpdateConfig({
      siteTitle: DEFAULT_SITE_CONFIG.siteTitle,
      siteSubtitle: DEFAULT_SITE_CONFIG.siteSubtitle,
      heroHeadline: DEFAULT_SITE_CONFIG.heroHeadline,
      heroDescription: DEFAULT_SITE_CONFIG.heroDescription,
      siteTexts: DEFAULT_SITE_TEXTS,
    });
    onShowToast('모든 문구가 기본값으로 복원되었습니다.', 'info');
  };

  const handleYearChipClick = (year: number) => {
    setFormYear(year);
    // Keep month and day if already formatted
    const parts = formDate.split('.');
    if (parts.length === 3) {
      setFormDate(`${year}.${parts[1]}.${parts[2]}`);
    } else {
      setFormDate(`${year}.01.01`);
    }
  };

  const handleAddTagToForm = (tagToAdd?: string) => {
    const raw = (tagToAdd || tagInput).trim().replace(/^#/, '');
    if (!raw) return;
    if (formTags.includes(raw)) {
      setTagInput('');
      return;
    }
    setFormTags([...formTags, raw]);
    setTagInput('');
  };

  const handleRemoveTagFromForm = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Quick Inline Change for Rarity from table
  const handleInlineRarityChange = (item: GoodsItem, newRarity: Rarity) => {
    const updated: GoodsItem = { ...normalizeGoods(item), rarity: newRarity };
    onUpdateGoods(updated);
    onShowToast(`'${item.title}' 종류가 [${getRarityLabel(newRarity, kindOptions)}]로 변경되었습니다.`, 'success');
  };

  // Quick Inline Change for Year from table
  const handleInlineYearChange = (item: GoodsItem, newYear: number) => {
    const parts = item.releaseDate.split('.');
    const newDate = parts.length === 3 ? `${newYear}.${parts[1]}.${parts[2]}` : `${newYear}.01.01`;
    const updated: GoodsItem = { ...item, releaseYear: newYear, releaseDate: newDate };
    onUpdateGoods(updated);
    onShowToast(`'${item.title}' 발매연도가 [${newYear}년]으로 변경되었습니다.`, 'success');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kindOptions.some(kind => kind.id === formRarity)) { onShowToast('굿즈 종류를 선택해주세요.', 'info'); return; }

    if (!formTitle.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }

    if (!formCategories.length) { onShowToast('카테고리를 최소 한 개 선택해주세요.', 'info'); return; }

    const relatedLinks = formRelatedLinks.map(link => ({ label: link.label.trim(), url: link.url.trim() })).filter(link => link.label || link.url);
    if ((formOfficialUrl.trim() && !isWebUrl(formOfficialUrl.trim())) || relatedLinks.some(link => !isWebUrl(link.url))) {
      onShowToast('판매처와 관련 링크는 http:// 또는 https:// 주소로 입력해주세요.', 'info');
      return;
    }

    const year = formYear || parseInt(formDate.slice(0, 4), 10) || currentYear;
    const comps = formComponents
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const finalCover = formImages[0] || 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80';
    const finalAdditionals = formImages.slice(1);

    if (editingGoodsId) {
      const existing = goods.find((g) => g.id === editingGoodsId);
      const updated: GoodsItem = {
        ...existing!,
        title: formTitle,
        memberId: formMember,
        category: formCategories[0],
        categoryIds: formCategories,
        rarity: formRarity,
        isLegendary: formLegendary,
        releaseDate: formDate,
        releaseYear: year,
        originalPrice: Number(formPrice) || 0,
        saleStatus: formSaleStatus,
        currentMarketPrice: Number(formMarketPrice) || Number(formPrice),
        imageUrl: finalCover,
        additionalImages: finalAdditionals,
        description: formDescription,
        components: comps,
        officialUrl: formOfficialUrl.trim(),
        relatedLinks,
        specs: { ...existing?.specs, size: formSize.trim() || undefined },
        tags: formTags,
      };
      onUpdateGoods(updated);
      onShowToast('굿즈 정보가 수정되었습니다.', 'success');
    } else {
      const newGoods: GoodsItem = {
        id: `goods-${Date.now()}`,
        title: formTitle,
        memberId: formMember,
        category: formCategories[0],
        categoryIds: formCategories,
        rarity: formRarity,
        isLegendary: formLegendary,
        releaseDate: formDate,
        releaseYear: year,
        originalPrice: Number(formPrice) || 0,
        saleStatus: formSaleStatus,
        currentMarketPrice: Number(formMarketPrice) || Number(formPrice),
        imageUrl: finalCover,
        additionalImages: finalAdditionals,
        description: formDescription,
        components: comps,
        officialUrl: formOfficialUrl.trim(),
        relatedLinks,
        specs: { size: formSize.trim() || undefined },
        tags: formTags,
        favoriteCount: 1,
        isOwned: false,
        isWishlist: false,
        isStaffPick: false,
      };
      onAddGoods(newGoods);
      onShowToast('새로운 굿즈가 도감에 등록되었습니다!', 'success');
    }

    resetForm();
    setIsFormOpen(false);
  };

  // Category Manager Handlers
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const id = `cat-${Date.now()}`;
    const newCat: CategoryItem = {
      id,
      label: newCatLabel.trim(),
      icon: newCatIcon || '📦',
      isDefault: false,
    };
    onAddCategory(newCat);
    onShowToast(`'${newCat.label}' 카테고리가 추가되었습니다.`, 'success');
    setNewCatLabel('');
    setNewCatIcon('🎁');
  };

  const handleSaveEditCategory = (cat: CategoryItem) => {
    if (!editingCatLabel.trim()) return;
    onUpdateCategory({
      ...cat,
      label: editingCatLabel.trim(),
      icon: editingCatIcon || cat.icon,
    });
    setEditingCatId(null);
    onShowToast('카테고리가 수정되었습니다.', 'success');
  };

  // Export JSON
  const handleExportJSON = () => {
    const backupData = {
      version: '3.0-shared',
      exportDate: new Date().toISOString(),
      config,
      categories,
      news,
      goods,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isegye-goods-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('도감 데이터 백업 파일이 다운로드되었습니다.', 'success');
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.goods && Array.isArray(parsed.goods)) {
          onImportData({
            goods: parsed.goods,
            config: parsed.config || config,
            categories: parsed.categories || categories,
            news: Array.isArray(parsed.news) ? parsed.news : news,
          });
          onShowToast(`총 ${parsed.goods.length}개의 굿즈 데이터를 성공적으로 복원했습니다.`, 'success');
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파싱 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // If NOT authenticated as Admin, show lock gatekeeper
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              관리자 권한 인증이 필요합니다
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              도감 굿즈 CRUD, 카테고리 수정/추가 및 테마 커스터마이징은 관리자 권한으로 로그인한 경우에만 접근할 수 있습니다.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogin(true);
              }}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>관리자 계정으로 로그인하기</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              도감으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  도감 관리자 대시보드 (Admin Studio)
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  인증됨: {currentUser?.nickname}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                굿즈 관리(발매연도/레어도 즉시 변경), 카테고리 관리, 테마 디자인, SEO 및 백업
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors dark:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('crud')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'crud'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>굿즈 관리 (발매연도/레어도 퀵수정)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 font-mono">
              {goods.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('textEdit')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'textEdit'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>✍️ 전체 글·문구 수정 (CMS)</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-950/60 rounded-full text-indigo-700 dark:text-indigo-300 font-bold">
              NEW
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>카테고리 수정/관리</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950/60 rounded-full text-purple-700 dark:text-purple-300 font-mono">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'design'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>실시간 디자인 스튜디오</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'seo'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>SEO & 소셜 미리보기</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>데이터 백업 & 복원</span>
          </button>

          {onOpenAboutModal && (
            <button
              onClick={() => {
                onClose();
                onOpenAboutModal();
              }}
              className="pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ml-auto"
              title="'이세계아이돌이란?' 그룹·멤버 소개, 유튜브 영상, 사진 수정 열기"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>'이세계아이돌이란?' 소개·영상·사진 수정</span>
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* TAB 1: 굿즈 관리 (CRUD) with Quick Inline Rarity/Year editing */}
          {activeTab === 'crud' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">등록된 굿즈 목록</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    아래 목록에서 <strong>레어도</strong>와 <strong>발매연도(2021~{currentYear})</strong>를 원클릭으로 즉시 바꿀 수 있습니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetForm();
                      setIsFormOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>새 굿즈 등록</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('모든 굿즈를 기본 12개 샘플 데이터로 복원하시겠습니까?')) {
                        onResetToDefault();
                        onShowToast('기본 데이터로 초기화되었습니다.', 'info');
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
                    title="기본 샘플 데이터 복원"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span className="hidden sm:inline">기본 데이터 복원</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit Form Modal inside */}
              {isFormOpen && (
                <form
                  onSubmit={handleSubmitForm}
                  className="p-5 bg-purple-50/40 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-purple-100 dark:border-purple-900/50">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300">
                      {editingGoodsId ? '📝 굿즈 정보 수정' : '✨ 새로운 이세돌 굿즈 등록'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-slate-600 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">상품명 *</label>
                        <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">{formTitle.length}자</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="예: 'KIDDING' 1st Album LP"
                          className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
                        />
                        {formTitle && (
                          <button
                            type="button"
                            onClick={() => setFormTitle('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 dark:text-slate-300"
                            title="상품명 지우기"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {/* Quick Title Prefix Chips for easy editing */}
                      <div className="flex flex-wrap items-center gap-1 pt-1.5">
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">빠른 수식어:</span>
                        {TITLE_PREFIX_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => {
                              if (!formTitle.includes(chip)) {
                                setFormTitle(`${chip} ${formTitle}`.trim());
                              }
                            }}
                            className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors border border-purple-200/60 dark:border-purple-800/60"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">해당 멤버 *</label>
                      <select
                        aria-label="해당 멤버"
                        value={formMember}
                        onChange={(e) => setFormMember(e.target.value as MemberId)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
                      >
                        {Object.values(MEMBERS).map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.symbol} {m.name}{m.id === 'all' || m.id === 'group' ? '' : ` (${m.fanClub})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        카테고리 *
                      </label>
                      <div role="group" aria-label="카테고리 선택" className="flex flex-wrap gap-2">
                        {categories.map(category => <label key={category.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer ${formCategories.includes(category.id) ? 'bg-purple-50 border-purple-400 text-purple-950 dark:bg-purple-950 dark:text-purple-100' : 'bg-white border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200'}`}>
                          <input type="checkbox" checked={formCategories.includes(category.id)} onChange={event => setFormCategories(previous => event.target.checked ? [...previous, category.id] : previous.filter(id => id !== category.id))} className="accent-purple-600" />
                          <span>{category.icon} {category.label}</span>
                        </label>)}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">여러 개 선택할 수 있습니다. 최소 한 개를 선택해주세요.</p>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">종류 *</label>
                      <div className="flex flex-wrap gap-2">
                        {kindOptions.map(({id:kind}) => <button
                          type="button" key={kind} aria-pressed={formRarity === kind}
                          onClick={() => setFormRarity(kind)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border ${formRarity === kind ? 'bg-black text-white border-black dark:border-slate-400' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}
                        >{getRarityLabel(kind, kindOptions)}</button>)}
                      </div>
                      <button type="button" aria-pressed={formLegendary} onClick={() => setFormLegendary(value => !value)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border ${formLegendary ? 'bg-amber-100 text-amber-950 border-amber-500 dark:bg-amber-950 dark:text-amber-100' : 'bg-white text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600'}`}
                      >👑 레전더리 {formLegendary ? '활성화' : '비활성화'}</button>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">종류와 별도로 레전더리 배지를 표시합니다.</p>
                    </div>

                    {/* NEW: 1-Click Release Year Selector (2021 ~ Current Year) */}
                    <div className="sm:col-span-2 space-y-1.5 p-3 bg-white/70 dark:bg-slate-850 rounded-xl border border-purple-200/60 dark:border-purple-800/60">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>발매연도 빠른 선택 (2021년 ~ {currentYear}년) *</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                          선택됨: {formYear}년 ({formDate})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {availableYears.map((year) => {
                          const isSelected = formYear === year;
                          return (
                            <button
                              key={year}
                              type="button"
                              onClick={() => handleYearChipClick(year)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-700'
                              }`}
                            >
                              {year}년
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex items-center gap-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">상세 발매일자:</span>
                        <input
                          type="text"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          placeholder="2023.08.18"
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono w-36"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">공식 정가 (원, KRW) *</label>
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">현재 시장 시세 (원)</label>
                      <input
                        type="number"
                        value={formMarketPrice}
                        onChange={(e) => setFormMarketPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">판매 상태</h4>
                      <div role="group" aria-label="판매 상태 선택" className="flex flex-wrap gap-2">
                        {SALE_STATUSES.map(status => <button type="button" key={status.value} aria-pressed={formSaleStatus === status.value} onClick={() => setFormSaleStatus(status.value)}
                          className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 ${formSaleStatus === status.value ? status.classes + ' ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}>
                          {formSaleStatus === status.value && <span aria-hidden="true">✓ </span>}{status.label}
                        </button>)}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">셋 중 하나를 선택하면 굿즈 상세창의 정가 오른쪽에 표시됩니다.</p>
                    </div>

                    <div className="sm:col-span-2 space-y-3 p-3.5 bg-purple-50/50 dark:bg-slate-850 rounded-xl border border-purple-200/80 dark:border-purple-900/60">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
                          <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>소장품 사진 관리 (다중 이미지 업로드 & 빼기 지원) *</span>
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                            총 {formImages.length}장 등록됨
                          </span>
                          {formImages.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('등록된 모든 이미지를 비우시겠습니까?')) {
                                  setFormImages([]);
                                }
                              }}
                              className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline px-1.5 py-0.5 cursor-pointer"
                            >
                              전체 비우기
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Multi-file Upload and URL Input Row */}
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            ref={imageFileInputRef}
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.avif,.svg"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => imageFileInputRef.current?.click()}
                            className="flex-1 py-2.5 px-3 rounded-lg border-2 border-dashed border-purple-400 dark:border-purple-600 hover:border-purple-600 dark:hover:border-purple-400 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                          >
                            <FileUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>내 PC에서 여러 사진 한번에 올리기 (JPG, PNG, WebP, GIF, AVIF, SVG 다중 지원)</span>
                          </button>
                        </div>

                        {/* Direct URL input with Add button */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddImageUrl();
                              }
                            }}
                            placeholder="이미지 URL 직접 입력 후 [추가] 클릭 (https://...jpg, png, webp 등)"
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>URL 추가</span>
                          </button>
                        </div>
                      </div>

                      {/* Supported Formats & Fast Presets */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-purple-100 dark:border-purple-900/40">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">다양한 포맷 빠른 추가:</span>
                          {SAMPLE_IMAGE_PRESETS.map((preset) => (
                            <button
                              key={preset.format}
                              type="button"
                              onClick={() => {
                                setFormImages((prev) => [...prev, preset.url]);
                                onShowToast(`[${preset.format}] ${preset.title} 이미지가 목록에 추가되었습니다.`, 'info');
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${preset.badgeClass}`}
                            >
                              +{preset.format} 추가
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400">
                          첫 번째 사진이 메인 대표(커버) 사진으로 지정됩니다
                        </span>
                      </div>

                      {/* Thumbnail Gallery & Removal Grid */}
                      {formImages.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 text-xs dark:text-slate-300">
                          등록된 사진이 없습니다. 파일 업로드나 URL로 사진을 추가해주세요.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                          {formImages.map((imgUrl, idx) => {
                            const isMain = idx === 0;
                            const format = getImageFormat(imgUrl);
                            return (
                              <div
                                key={`${imgUrl.slice(0, 32)}-${idx}`}
                                className={`relative group rounded-lg overflow-hidden border transition-all ${
                                  isMain
                                    ? 'border-purple-500 ring-2 ring-purple-400/50 bg-purple-50/20 dark:bg-purple-950/20'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                                }`}
                              >
                                {/* Thumbnail Image */}
                                <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                                  <img
                                    src={imgUrl}
                                    alt={`굿즈 사진 ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=300&q=80';
                                    }}
                                  />

                                  {/* Badges on Thumbnail */}
                                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                                    {isMain ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-600 text-white shadow-xs flex items-center gap-0.5">
                                        <Crown className="w-3 h-3 text-amber-300" />
                                        대표
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                        #{idx + 1}
                                      </span>
                                    )}
                                  </div>

                                  <div className="absolute top-1.5 right-1.5">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-slate-900/80 text-white backdrop-blur-xs border border-white/20">
                                      {format}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons underneath / card footer */}
                                <div className="p-1.5 flex items-center justify-between gap-1 bg-white dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800">
                                  {!isMain ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSetMainImage(idx)}
                                      className="px-2 py-1 rounded text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/80 transition-colors flex items-center gap-1 cursor-pointer"
                                      title="이 사진을 대표 이미지로 설정"
                                    >
                                      <Crown className="w-3 h-3" />
                                      대표로
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 px-1.5 py-1">
                                      대표 사진
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-bold ml-auto"
                                    title="이 사진 빼기 (삭제)"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>빼기</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Easy Description Editing Section with 1-Click Templates */}
                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>굿즈 상세 설명 및 스토리</span>
                      </label>
                      <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">{formDescription.length}자</span>
                    </div>

                    {/* Quick description templates for easy text creation */}
                    <div className="flex flex-wrap items-center gap-1 pb-1">
                      <span className="text-[10px] text-slate-600 dark:text-slate-300">원클릭 문구 템플릿:</span>
                      {DESCRIPTION_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          onClick={() => {
                            setFormDescription(tpl.content);
                            onShowToast(`[${tpl.label}] 템플릿이 입력되었습니다.`, 'info');
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          {tpl.label}
                        </button>
                      ))}
                      {formDescription && (
                        <button
                          type="button"
                          onClick={() => setFormDescription('')}
                          className="px-1.5 py-0.5 rounded text-[10px] text-slate-600 hover:text-rose-500 dark:text-slate-300"
                        >
                          비우기
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="팬들에게 남긴 의미, 굿즈의 매력, 구성품 정보를 자유롭게 작성해주세요."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Interactive Tag Adding Section */}
                  <div className="text-xs space-y-2 p-3 bg-white/70 dark:bg-slate-850 rounded-xl border border-purple-200/60 dark:border-purple-800/60">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>굿즈 태그 등록 (Tags)</span>
                    </label>

                    {/* Current Tag Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {formTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTagFromForm(tag)}
                            className="text-purple-400 hover:text-rose-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Tag input and quick add */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTagToForm();
                          }
                        }}
                        placeholder="태그 입력 후 엔터 (예: 한정판, 콘서트, LP)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTagToForm()}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs"
                      >
                        태그 추가
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">패키지 구성품 (한 줄에 하나씩)</label>
                      <textarea
                        rows={2}
                        value={formComponents}
                        onChange={(e) => setFormComponents(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="goods-official-url" className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">공식 구매처</label>
                      <input
                        id="goods-official-url"
                        type="url"
                        value={formOfficialUrl}
                        onChange={(e) => setFormOfficialUrl(e.target.value)}
                        placeholder="https://cafe.naver.com/steamindiegame"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="goods-size" className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">규격 / 사이즈</label>
                      <input id="goods-size" type="text" value={formSize} onChange={event => setFormSize(event.target.value)} placeholder="예: 220 × 300 mm, 가로 10 × 세로 15 cm"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400" />
                    </div>
                  </div>

                  <section aria-label="관련 링크 편집" className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">관련 링크</h4>
                    {formRelatedLinks.map((link, index) => <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <input aria-label={`관련 링크 이름 ${index + 1}`} value={link.label} placeholder="링크 이름 (예: 공식 공지, 굿즈 소개)" maxLength={100} onChange={event => setFormRelatedLinks(previous => previous.map((item, i) => i === index ? { ...item, label: event.target.value } : item))} className="min-w-0 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white" />
                      <input aria-label={`관련 링크 URL ${index + 1}`} type="url" value={link.url} placeholder="https://…" onChange={event => setFormRelatedLinks(previous => previous.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} className="min-w-0 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white" />
                      <button type="button" aria-label={`관련 링크 ${index + 1} 삭제`} onClick={() => setFormRelatedLinks(previous => previous.filter((_, i) => i !== index))} className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-slate-800 dark:text-slate-200">삭제</button>
                    </div>)}
                    <button type="button" onClick={() => setFormRelatedLinks(previous => [...previous, { label: '', url: '' }])} className="rounded-lg border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold text-purple-800 dark:text-purple-200">관련 링크 추가</button>
                  </section>

                  <div className="flex justify-end gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/50">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg shadow-xs"
                    >
                      {editingGoodsId ? '수정 완료' : '등록하기'}
                    </button>
                  </div>
                </form>
              )}

              {/* Goods Table List with Quick Inline Editors */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {goods.map((item) => {
                  const m = MEMBERS[item.memberId] || MEMBERS.all;
                  const categoryLabels = getGoodsCategories(item).map(id => categories.find(category => category.id === id)?.label || id).join(' · ');
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                          />
                          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            {getImageFormat(item.imageUrl)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                            {item.memberId === 'group' ? (
                              <span className="font-extrabold bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
                                {m.name}
                              </span>
                            ) : (
                              <span className="font-bold" style={{ color: m.color }}>
                                {m.name}
                              </span>
                            )}
                            <span>·</span>
                            <span>{categoryLabels}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditGoods(item)}
                            className="font-bold text-slate-900 dark:text-white truncate text-left hover:text-purple-600 dark:hover:text-purple-400 hover:underline cursor-pointer block max-w-xs sm:max-w-md transition-colors"
                            title="클릭하여 글 내용 수정하기"
                          >
                            {item.title}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-slate-600 dark:text-slate-300">₩{item.originalPrice.toLocaleString()}</span>
                            {item.tags && item.tags.length > 0 && (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                                #{item.tags.join(' #')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* QUICK INLINE CONTROLS: Rarity and Year */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Inline Rarity Selector */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">종류:</span>
                          <select
                            value={getGoodsKind(item.rarity)}
                            onChange={(e) => handleInlineRarityChange(item, e.target.value as Rarity)}
                            className={`text-[11px] font-bold px-2 py-1 rounded-md border focus:outline-none cursor-pointer transition-all ${
                              hasLegendaryBadge(item)
                                ? 'border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 shadow-xs'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {kindOptions.map(kind => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
                          </select>
                        </div>

                        {/* Inline Year Selector (2021 ~ Current Year) */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300">연도:</span>
                          <select
                            value={item.releaseYear}
                            onChange={(e) => handleInlineYearChange(item, Number(e.target.value))}
                            className="text-[11px] font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                          >
                            {availableYears.map((yr) => (
                              <option key={yr} value={yr}>
                                {yr}년
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Prominent Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1.5 ml-1 border-l pl-2 border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => startEditGoods(item)}
                            className="px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                            title="이 글 내용, 사진, 가격 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>글 수정</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`'${item.title}' 굿즈를 도감에서 삭제하시겠습니까?`)) {
                                onDeleteGoods(item.id);
                                onShowToast('굿즈가 삭제되었습니다.', 'info');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors dark:text-slate-300"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1.5: 웹사이트 전체 글·문구 수정 (Site Text CMS) */}
          {activeTab === 'textEdit' && (
            <div className="space-y-6">
              {/* Top Banner & Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/60 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/30 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                      <FileText className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      ✍️ 웹사이트 전체 글·문구 통합 편집기 (Site Text CMS)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    상단 브랜딩 타이틀, 탭 이름, 통계 카드 문구, 멤버별 스토리, 검색/필터 안내문, 푸터 저작권까지 모든 텍스트를 손쉽게 수정하세요.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetAllSiteTexts}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs hover:bg-slate-50 flex items-center gap-1.5"
                    title="모든 글을 초기 기본값으로 복원"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>기본 문구 복원</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllSiteTexts}
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>모든 글 저장하기</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: 🏛️ 상단 헤더 & 브랜딩 글 */}
              <div className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏛️ 1. 상단 헤더 & 브랜딩 글</span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                      로고, 타이틀, 탭 메뉴, 검색창
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 사이트 메인 타이틀 */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      사이트 메인 타이틀 (로고 옆 큰 제목)
                    </label>
                    <input
                      type="text"
                      value={localSiteTitle}
                      onChange={(e) => setLocalSiteTitle(e.target.value)}
                      placeholder="예: 이세계아이돌 공주들 소장품 박물관"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* 영문 서브타이틀 */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      영문 서브타이틀 (소제목)
                    </label>
                    <input
                      type="text"
                      value={localSiteSubtitle}
                      onChange={(e) => setLocalSiteSubtitle(e.target.value)}
                      placeholder="예: ISEGYE IDOL GOODS MUSEUM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* 상단 배지 문구 */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      상단 버전 배지 문구
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.headerBadge || ''}
                      onChange={(e) => handleUpdateSiteTextKey('headerBadge', e.target.value)}
                      placeholder="예: ARCHIVE V2.5 또는 OFFICIAL FAN ARCHIVE"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* 검색창 안내 플레이스홀더 */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      검색창 기본 안내 문구 (Placeholder)
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.searchPlaceholder || ''}
                      onChange={(e) => handleUpdateSiteTextKey('searchPlaceholder', e.target.value)}
                      placeholder="굿즈 이름, 멤버, 태그 검색... ('KIDDING', 'LP')"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                {/* 탭 버튼 이름 3종 & 이세계아이돌 버튼 명칭 */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    네비게이션 탭 메뉴 및 특별 버튼 이름:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-600 block mb-1 dark:text-slate-300">전체 목록 탭 이름</span>
                      <input
                        type="text"
                        value={localSiteTexts.tabAllLabel || ''}
                        onChange={(e) => handleUpdateSiteTextKey('tabAllLabel', e.target.value)}
                        placeholder="도감"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block mb-1 dark:text-slate-300">소장 목록 탭 이름</span>
                      <input
                        type="text"
                        value={localSiteTexts.tabOwnedLabel || ''}
                        onChange={(e) => handleUpdateSiteTextKey('tabOwnedLabel', e.target.value)}
                        placeholder="소장함"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block mb-1 dark:text-slate-300">위시리스트 탭 이름</span>
                      <input
                        type="text"
                        value={localSiteTexts.tabWishlistLabel || ''}
                        onChange={(e) => handleUpdateSiteTextKey('tabWishlistLabel', e.target.value)}
                        placeholder="위시"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 block mb-1 dark:text-slate-300">'이세계아이돌이란?' 버튼명</span>
                      <input
                        type="text"
                        value={localSiteTexts.aboutButtonLabel || ''}
                        onChange={(e) => handleUpdateSiteTextKey('aboutButtonLabel', e.target.value)}
                        placeholder="이세계아이돌이란?"
                        className="w-full px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-xs font-bold text-purple-700 dark:text-purple-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 🌟 상단 히어로 & 대시보드 통계 글 */}
              <div className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🌟 2. 상단 히어로 헤드라인 & 통계 카드 문구</span>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      대시보드 통계 카드 라벨 & 단위
                    </span>
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      메인 대표 헤드라인 (대형 타이틀)
                    </label>
                    <input
                      type="text"
                      value={localHeroHeadline}
                      onChange={(e) => setLocalHeroHeadline(e.target.value)}
                      placeholder="여섯 공주들의 소중한 보물들을 기록하는 박물관"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      메인 소개 설명문
                    </label>
                    <textarea
                      rows={2}
                      value={localHeroDescription}
                      onChange={(e) => setLocalHeroDescription(e.target.value)}
                      placeholder="이세계에서 온 여섯 명의 아이돌의 공식 앨범, 콘서트 기념품, 한정판 굿즈를 한곳에 모아..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  {/* Stats Cards Labels and Units */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      통계 카드 3종 명칭 및 단위 텍스트:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60 space-y-2">
                        <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300">
                          📦 1번 카드 (전체 굿즈)
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-0.5 dark:text-slate-300">카드 라벨</span>
                          <input
                            type="text"
                            value={localSiteTexts.statsTotalGoodsLabel || ''}
                            onChange={(e) => handleUpdateSiteTextKey('statsTotalGoodsLabel', e.target.value)}
                            placeholder="전체 굿즈"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-0.5 dark:text-slate-300">단위 표기</span>
                          <input
                            type="text"
                            value={localSiteTexts.statsTotalUnit || ''}
                            onChange={(e) => handleUpdateSiteTextKey('statsTotalUnit', e.target.value)}
                            placeholder="품목"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                          📊 2번 카드 (수집률)
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-0.5 dark:text-slate-300">카드 라벨</span>
                          <input
                            type="text"
                            value={localSiteTexts.statsCollectionRateLabel || ''}
                            onChange={(e) => handleUpdateSiteTextKey('statsCollectionRateLabel', e.target.value)}
                            placeholder="나의 수집률"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-0.5 dark:text-slate-300">보조 안내</span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block pt-1">
                            % 퍼센트 (자동 계산)
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 space-y-2">
                        <span className="text-[11px] font-bold text-rose-900 dark:text-rose-300">
                          ❤️ 3번 카드 (위시리스트)
                        </span>
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-0.5 dark:text-slate-300">카드 라벨</span>
                          <input
                            type="text"
                            value={localSiteTexts.statsWishlistLabel || ''}
                            onChange={(e) => handleUpdateSiteTextKey('statsWishlistLabel', e.target.value)}
                            placeholder="위시리스트"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-0.5 dark:text-slate-300">단위 표기</span>
                          <input
                            type="text"
                            value={localSiteTexts.statsWishlistUnit || ''}
                            onChange={(e) => handleUpdateSiteTextKey('statsWishlistUnit', e.target.value)}
                            placeholder="소장희망"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: 🔍 검색 결과 & 필터 알림 글 */}
              <div className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🔍 3. 검색 결과 & 필터 알림 문구</span>
                    <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                      빈 검색 안내, 태그 배너, 소장함/위시 배너
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      검색 결과 없음 제목
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.emptySearchTitle || ''}
                      onChange={(e) => handleUpdateSiteTextKey('emptySearchTitle', e.target.value)}
                      placeholder="조건에 맞는 굿즈를 찾지 못했습니다"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      태그 필터 활성화 배너 문구
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.tagFilterActiveText || ''}
                      onChange={(e) => handleUpdateSiteTextKey('tagFilterActiveText', e.target.value)}
                      placeholder="태그 필터 활성화"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      검색 결과 없음 상세 안내 설명문
                    </label>
                    <textarea
                      rows={2}
                      value={localSiteTexts.emptySearchDesc || ''}
                      onChange={(e) => handleUpdateSiteTextKey('emptySearchDesc', e.target.value)}
                      placeholder="검색어를 변경하거나 필터를 초기화해보세요. 관리자 모드에서 새로운 굿즈를 도감에 등록할 수도 있습니다."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      소장 완료 도감 상단 배너 문구
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.ownedTabAnnouncement || ''}
                      onChange={(e) => handleUpdateSiteTextKey('ownedTabAnnouncement', e.target.value)}
                      placeholder="소장 완료 도감"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      위시리스트 상단 배너 문구
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.wishlistTabAnnouncement || ''}
                      onChange={(e) => handleUpdateSiteTextKey('wishlistTabAnnouncement', e.target.value)}
                      placeholder="위시리스트 보관함"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: 📜 하단 푸터 & 저작권 글 */}
              <div className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📜 4. 하단 푸터 & 저작권 문구</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      소개문, 공식 링크 이름, 카피라이트
                    </span>
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      푸터 대표 소개 문구
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.footerDesc || ''}
                      onChange={(e) => handleUpdateSiteTextKey('footerDesc', e.target.value)}
                      placeholder="이세계아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)의 모든 소중한 순간들을 기록합니다."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        팬카페 링크 버튼 명칭
                      </label>
                      <input
                        type="text"
                        value={localSiteTexts.wakzooLinkLabel || ''}
                        onChange={(e) => handleUpdateSiteTextKey('wakzooLinkLabel', e.target.value)}
                        placeholder="왁물원 팬카페"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        유튜브 링크 버튼 명칭
                      </label>
                      <input
                        type="text"
                        value={localSiteTexts.youtubeLinkLabel || ''}
                        onChange={(e) => handleUpdateSiteTextKey('youtubeLinkLabel', e.target.value)}
                        placeholder="공식 유튜브"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      비공식 팬 아카이브 안내문 (면책 조항)
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.footerDisclaimer || ''}
                      onChange={(e) => handleUpdateSiteTextKey('footerDisclaimer', e.target.value)}
                      placeholder="본 아카이빙 웹사이트는 이세계아이돌의 팬 큐레이션 목적으로 제작된 비공식 아카이브입니다."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      하단 카피라이트 문구 (Copyright)
                    </label>
                    <input
                      type="text"
                      value={localSiteTexts.footerCopyright || ''}
                      onChange={(e) => handleUpdateSiteTextKey('footerCopyright', e.target.value)}
                      placeholder="© 2024 ISEGYE IDOL GOODS ARCHIVE PROJECT. All Rights Reserved."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-mono text-slate-600 dark:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: 👑 '이세계아이돌이란?' 그룹 & 멤버 소개글 바로가기 */}
              {onOpenAboutModal && (
                <div className="p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-indigo-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        '이세계아이돌이란?' 그룹 소개 & 멤버 6인 상세 프로필 글 수정
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      그룹 설명, 데뷔일자, 대표 음원 기록, 멤버별 어록, 성격/매력 포인트, 유튜브 영상 목록과 커스텀 링크까지 전용 편집창에서 수정할 수 있습니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAboutModal();
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap flex items-center gap-2 shrink-0 active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>'이세계아이돌이란?' 편집창 열기</span>
                  </button>
                </div>
              )}

              {/* Bottom Sticky Save Bar */}
              <div className="sticky bottom-0 z-10 -mx-6 -mb-6 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-lg">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  모든 변경사항은 브라우저 로컬 저장소에 영구히 저장됩니다.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAllSiteTexts}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    기본값 복원
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllSiteTexts}
                    className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>모든 글 저장하기</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 카테고리 수정 및 관리 (Category Manager) */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <GoodsKindManager kinds={kindOptions} goods={goods} onChange={goodsKinds => onUpdateConfig({goodsKinds})} />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">카테고리 수정 및 신규 등록</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    도감에 표시되는 카테고리 이름을 수정하거나 새로운 굿즈 분류(예: 콜라보 카페, 포토카드, 콘서트MD)를 추가하세요.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('기본 카테고리 5종(피규어, 음반, 의류, 문구, 디지털)으로 복원하시겠습니까?')) {
                      onResetCategories();
                      onShowToast('카테고리가 기본값으로 복원되었습니다.', 'info');
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>기본 카테고리 복원</span>
                </button>
              </div>

              {/* Add New Category Form */}
              <form
                onSubmit={handleAddNewCategory}
                className="p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3"
              >
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                  ✨ 새 카테고리 추가하기
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="w-full sm:w-24">
                    <input
                      type="text"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      placeholder="이모지 (🎁)"
                      className="w-full px-3 py-2 text-center text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      required
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="카테고리 이름 (예: 콜라보 / 카페, 포토카드 / 지류, 콘서트 MD)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>추가</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {categories.map((cat) => {
                  const isEditing = editingCatId === cat.id;
                  const goodsInCat = goods.filter((g) => getGoodsCategories(g).includes(cat.id)).length;

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCatIcon}
                            onChange={(e) => setEditingCatIcon(e.target.value)}
                            className="w-12 px-2 py-1 text-center rounded border border-purple-300 bg-white dark:bg-slate-800 text-xs"
                          />
                          <input
                            type="text"
                            value={editingCatLabel}
                            onChange={(e) => setEditingCatLabel(e.target.value)}
                            className="flex-1 px-2.5 py-1 rounded border border-purple-300 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSaveEditCategory(cat)}
                            className="px-2.5 py-1 bg-purple-600 text-white rounded font-bold"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded dark:text-slate-300"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-base p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">{cat.icon || '📁'}</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {cat.label}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 ml-2">
                              (소속 굿즈: {goodsInCat}개)
                            </span>
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatLabel(cat.label);
                              setEditingCatIcon(cat.icon || '🎁');
                            }}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`'${cat.label}' 카테고리를 삭제하시겠습니까?`)) {
                                onDeleteCategory(cat.id);
                                onShowToast('카테고리가 삭제되었습니다.', 'info');
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors dark:text-slate-300"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 실시간 디자인 스튜디오 (Design Studio) */}
          {activeTab === 'design' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">사이트 비주얼 및 브랜딩 실시간 커스터마이징</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  사이트 제목, 서브타이틀, 멤버별 테마 컬러 및 레이아웃을 실시간으로 변경해보세요.
                </p>
              </div>

              {/* Title & Subtitle inputs with easy text editing presets */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
                {/* 1. Main Title with quick templates */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">사이트 메인 타이틀</label>
                    <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">{config.siteTitle.length}자</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.siteTitle}
                      onChange={(e) => onUpdateConfig({ siteTitle: e.target.value })}
                      className="w-full pl-3 pr-7 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    {config.siteTitle && (
                      <button
                        type="button"
                        onClick={() => onUpdateConfig({ siteTitle: '' })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600 p-0.5 dark:text-slate-300"
                        title="타이틀 지우기"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {/* Quick Title Templates */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">추천 템플릿:</span>
                    {[
                      '이세계아이돌 공주들 소장품 박물관',
                      '이세돌 공주 보물 도감',
                      '이세계아이돌 굿즈 아카이브',
                      'ISEGYE IDOL OFFICIAL ARCHIVE'
                    ].map((titleTpl) => (
                      <button
                        key={titleTpl}
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ siteTitle: titleTpl });
                          onShowToast(`타이틀이 변경되었습니다: '${titleTpl}'`, 'info');
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        {titleTpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Subtitle with quick presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">사이트 영문 서브타이틀</label>
                    <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">{config.siteSubtitle.length}자</span>
                  </div>
                  <input
                    type="text"
                    value={config.siteSubtitle}
                    onChange={(e) => onUpdateConfig({ siteSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  {/* Quick Subtitle Templates */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">추천 서브타이틀:</span>
                    {[
                      'ISEGYE IDOL GOODS MUSEUM',
                      'THE ROYAL COLLECTION ARCHIVE',
                      'WAKTA FAMILY OFFICIAL VAULT'
                    ].map((subTpl) => (
                      <button
                        key={subTpl}
                        type="button"
                        onClick={() => onUpdateConfig({ siteSubtitle: subTpl })}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-700 hover:bg-purple-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        {subTpl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Hero Description with quick presets */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">히어로 설명 텍스트</label>
                    <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">{config.heroDescription.length}자</span>
                  </div>
                  {/* Quick Description Templates */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-1.5">
                    <span className="text-[10px] text-slate-600 dark:text-slate-300">문구 템플릿:</span>
                    {[
                      {
                        label: '🏛️ 소장품 박물관형',
                        text: '이세계에서 온 여섯 명의 아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)의 공식 앨범, 콘서트 기념품, 한정판 굿즈를 한곳에 모아 감상하고 나의 소장품을 기록하세요.'
                      },
                      {
                        label: '👑 공주 보물 도감형',
                        text: '데뷔곡 RE:WIND부터 KIDDING, 솔로 콘서트까지 이세돌 공주님들의 기적 같은 여정을 담은 공식 보물들을 하나도 빠짐없이 아카이빙합니다.'
                      }
                    ].map((descTpl) => (
                      <button
                        key={descTpl.label}
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ heroDescription: descTpl.text });
                          onShowToast(`히어로 설명이 [${descTpl.label}]으로 변경되었습니다.`, 'info');
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-700 hover:bg-purple-50 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        {descTpl.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={config.heroDescription}
                    onChange={(e) => onUpdateConfig({ heroDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed font-sans"
                  />
                </div>

                {/* 4. Top Story & Museum Lore Editor (각 상단 스토리 수정) */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-3.5 bg-purple-50/40 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-200/70 dark:border-purple-800/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <label className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        🏛️ 각 상단 스토리 & 소개 문구 수정 (멤버별/전체)
                      </label>
                    </div>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-full">
                      상단 스토리 관리
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    전체 도감 및 각 멤버(아이네, 징버거, 릴파, 주르르, 고세구, 비챤, 단체) 선택 시 노출되는 <strong>상단 어록과 스토리 접기/펼치기 내용</strong>을 멤버별로 각각 자유롭게 수정할 수 있습니다.
                  </p>

                  {/* Member Selector Bar for Story Editor */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      편집할 대상 선택:
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['all', 'ine', 'jingburger', 'lilpa', 'jururu', 'gosegu', 'viichan', 'group'] as MemberId[]).map((mid) => {
                        const m = MEMBERS[mid];
                        const isSelected = adminStoryMember === mid;
                        return (
                          <button
                            key={mid}
                            type="button"
                            onClick={() => setAdminStoryMember(mid)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-xs font-bold scale-102'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{m.symbol}</span>
                            <span>{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const getAdminStoryDefaults = (mid: MemberId) => {
                      if (mid === 'all') {
                        return {
                          quote: config.heroDescription || "이세계에서 온 여섯 명의 아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)의 공식 앨범, 콘서트 기념품, 한정판 굿즈를 한곳에 모아 감상하고 나의 소장품을 기록하세요.",
                          title: config.storyTitle || "🏛️ '공주들 소장품 박물관'이란 어떤 곳인가요?",
                          subtitle: config.storySubtitle || '👑 "이세계에서 온 여섯 명의 공주님들이 우리에게 남겨준 보물들"',
                          content: config.storyContent || "'이세계아이돌 공주들 소장품 박물관'은 데뷔곡 'RE:WIND'부터 'KIDDING', 솔로 콘서트와 페스티벌에 이르기까지, 이세계아이돌이 걸어온 기적 같은 여정을 담은 공식 음반, 의류, 피규어, 응원봉, 한정판 굿즈를 하나도 빠짐없이 아카이빙하기 위해 제작된 팬 큐레이션 도감입니다.",
                          notice: config.storyNotice || "* 소장 중인 굿즈를 체크하여 나의 수집률을 실시간으로 확인하고, 위시리스트를 작성하여 나만의 소장 도감을 완성해보세요."
                        };
                      }
                      const m = MEMBERS[mid] || MEMBERS.all;
                      return {
                        quote: m.quote,
                        title: `👑 ${m.name} 공주의 아카이브 스토리`,
                        subtitle: `✨ "${m.name} 공주와 ${m.fanClub} 팬들이 함께한 빛나는 추억"`,
                        content: `${m.name} 공주의 공식 앨범, 콜라보레이션 굿즈, 콘서트 기념품 및 한정판 소장품들을 체계적으로 감상하고 기록하는 전용 아카이브 공간입니다. 소장 완료 도장을 찍어 ${m.name} 컬렉션을 완성해보세요.`,
                        notice: `* ${m.name} 공주의 소장품을 체크하여 나만의 팬 컬렉션 도감을 완성해보세요.`
                      };
                    };

                    const curDefaults = getAdminStoryDefaults(adminStoryMember);
                    const curSaved = config.memberStories?.[adminStoryMember] || {};

                    const activeQuote = curSaved.quote ?? curDefaults.quote;
                    const activeTitle = curSaved.storyTitle ?? curDefaults.title;
                    const activeSubtitle = curSaved.storySubtitle ?? curDefaults.subtitle;
                    const activeContent = curSaved.storyContent ?? curDefaults.content;
                    const activeNotice = curSaved.storyNotice ?? curDefaults.notice;

                    const handleFieldChange = (key: 'quote' | 'storyTitle' | 'storySubtitle' | 'storyContent' | 'storyNotice', val: string) => {
                      const updatedStories = {
                        ...(config.memberStories || {}),
                        [adminStoryMember]: {
                          quote: activeQuote,
                          storyTitle: activeTitle,
                          storySubtitle: activeSubtitle,
                          storyContent: activeContent,
                          storyNotice: activeNotice,
                          [key]: val,
                        }
                      };

                      const globalUpdates: Partial<SiteConfig> = {
                        memberStories: updatedStories,
                      };

                      if (adminStoryMember === 'all') {
                        if (key === 'quote') globalUpdates.heroDescription = val;
                        if (key === 'storyTitle') globalUpdates.storyTitle = val;
                        if (key === 'storySubtitle') globalUpdates.storySubtitle = val;
                        if (key === 'storyContent') globalUpdates.storyContent = val;
                        if (key === 'storyNotice') globalUpdates.storyNotice = val;
                      }

                      onUpdateConfig(globalUpdates);
                    };

                    return (
                      <div className="space-y-3 pt-1">
                        {/* 1. 상단 소개글 / 어록 */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            1. [{MEMBERS[adminStoryMember]?.name}] 상단 대표 소개글 / 어록
                          </label>
                          <input
                            type="text"
                            value={activeQuote}
                            onChange={(e) => handleFieldChange('quote', e.target.value)}
                            placeholder="상단에 노출되는 대표 소개 문구 또는 멤버 어록"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
                          />
                        </div>

                        {/* 2. 드롭다운 버튼 문구 (제목) */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            2. 스토리 접기/펼치기 버튼 제목
                          </label>
                          <input
                            type="text"
                            value={activeTitle}
                            onChange={(e) => handleFieldChange('storyTitle', e.target.value)}
                            placeholder="예: 🏛️ '공주들 소장품 박물관'이란 어떤 곳인가요?"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
                          />
                        </div>

                        {/* 3. 스토리 인용구 / 헤드라인 */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            3. 스토리 인용구 / 헤드라인
                          </label>
                          <input
                            type="text"
                            value={activeSubtitle}
                            onChange={(e) => handleFieldChange('storySubtitle', e.target.value)}
                            placeholder="스토리 본문 상단에 굵게 표시되는 강조 인용구"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
                          />
                        </div>

                        {/* 4. 메인 스토리 본문 */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              4. 상세 스토리 본문
                            </label>
                            <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">
                              {activeContent.length}자
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={activeContent}
                            onChange={(e) => handleFieldChange('storyContent', e.target.value)}
                            placeholder="해당 멤버 또는 박물관의 상세 역사 및 스토리"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed font-sans"
                          />
                        </div>

                        {/* 5. 하단 소장 안내 가이드 문구 */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            5. 하단 소장 안내 가이드 문구
                          </label>
                          <input
                            type="text"
                            value={activeNotice}
                            onChange={(e) => handleFieldChange('storyNotice', e.target.value)}
                            placeholder="스토리 하단에 작게 표시되는 안내문"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 font-sans"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 🌈 실시간 그라데이션 커스텀 스튜디오 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/70 to-pink-50/50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/30 border-2 border-indigo-200 dark:border-indigo-800/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-800/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-indigo-600 text-white rounded-lg shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        🌈 실시간 그라데이션 커스텀 스튜디오
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      제목 텍스트, 상단 헤더, 사이트 전체 배경에 적용할 화려하고 영롱한 그라데이션을 설정합니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">그라데이션 효과</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.customGradient?.enabled || false}
                        onChange={(e) => {
                          const cur = config.customGradient || DEFAULT_CUSTOM_GRADIENT;
                          onUpdateConfig({
                            customGradient: {
                              ...cur,
                              enabled: e.target.checked,
                            },
                          });
                          onShowToast(e.target.checked ? '그라데이션 효과가 활성화되었습니다.' : '그라데이션 효과가 비활성화되었습니다.', 'info');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* 12 Presets Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    ✨ 시그니처 그라데이션 프리셋 (12종)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GRADIENT_PRESETS.map((preset) => {
                      const cur = config.customGradient || DEFAULT_CUSTOM_GRADIENT;
                      const isSelected = cur.presetId === preset.id && cur.enabled;
                      const presetCss = `linear-gradient(${preset.angle}deg, ${preset.from} 0%, ${
                        preset.via ? preset.via + ' 50%, ' : ''
                      }${preset.to} 100%)`;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            onUpdateConfig({
                              customGradient: {
                                ...cur,
                                enabled: true,
                                presetId: preset.id,
                                name: preset.name,
                                angle: preset.angle,
                                fromColor: preset.from,
                                viaColor: preset.via || '',
                                toColor: preset.to,
                              },
                            });
                            onShowToast(`'${preset.name}' 그라데이션이 적용되었습니다.`, 'info');
                          }}
                          className={`p-2.5 rounded-xl text-left border transition-all relative ${
                            isSelected
                              ? 'border-indigo-600 bg-white dark:bg-slate-850 ring-2 ring-indigo-400 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 hover:bg-white'
                          }`}
                        >
                          <div
                            className="w-full h-5 rounded-md mb-1.5 shadow-2xs border border-black/10"
                            style={{ backgroundImage: presetCss }}
                          />
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </p>
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-indigo-600 text-white rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fine-Tuning & Application Targets */}
                {config.customGradient?.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-indigo-100 dark:border-indigo-800/60 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                        🎨 적용 대상
                      </span>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.customGradient.textGradientEnabled}
                            onChange={(e) => {
                              onUpdateConfig({
                                customGradient: {
                                  ...config.customGradient!,
                                  textGradientEnabled: e.target.checked,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded accent-indigo-600"
                          />
                          <span>🔤 메인 타이틀 & 제목 텍스트 광채</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.customGradient.bgGradientEnabled}
                            onChange={(e) => {
                              onUpdateConfig({
                                customGradient: {
                                  ...config.customGradient!,
                                  bgGradientEnabled: e.target.checked,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded accent-indigo-600"
                          />
                          <span>🌌 사이트 전체 배경 앰비언트 오버레이</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.customGradient.headerGradientEnabled}
                            onChange={(e) => {
                              onUpdateConfig({
                                customGradient: {
                                  ...config.customGradient!,
                                  headerGradientEnabled: e.target.checked,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 rounded accent-indigo-600"
                          />
                          <span>🖼️ 상단 헤더 & 히어로 박스 조명</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                          현재 그라데이션 미리보기
                        </span>
                        <div
                          className="w-full h-8 rounded-lg border border-black/10 shadow-inner flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm"
                          style={{ backgroundImage: getGradientCss(config.customGradient) }}
                        >
                          {config.customGradient.name || '선택된 그라데이션'}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-600 pt-1 dark:text-slate-300">
                        * 화면 우측 하단의 <strong>'🎨 글자·그라데이션 수정'</strong> 버튼을 누르면 정밀 색상 피커(HEX) 및 각도 슬라이더를 실시간으로 조절할 수 있습니다.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Member Color Theme Presets */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  🎨 메인 포인트 컬러 프리셋 (멤버별 시그니처 테마)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* 1. Default (기본) Theme Button */}
                  {(() => {
                    const isDefaultActive =
                      !config.accentTheme ||
                      config.accentTheme === 'default' ||
                      config.accentTheme === 'all';
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ accentTheme: 'default' });
                          onShowToast('기본 테마 컬러로 복원되었습니다.', 'info');
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isDefaultActive
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-200 dark:ring-indigo-900/50'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0 bg-gradient-to-tr from-slate-400 to-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">
                            ✨
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">기본</span>
                        </div>
                        {isDefaultActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    );
                  })()}

                  {/* 2. 6 Member Signature Buttons (전체, 단체 제외) */}
                  {(['ine', 'jingburger', 'lilpa', 'jururu', 'gosegu', 'viichan'] as MemberId[]).map((mid) => {
                    const m = MEMBERS[mid];
                    if (!m) return null;
                    const isCurrent = config.accentTheme === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ accentTheme: m.id });
                          onShowToast(`${m.name} 시그니처 테마가 은은하게 적용되었습니다.`, 'info');
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isCurrent
                            ? 'shadow-xs ring-2 ring-offset-1 dark:ring-offset-slate-900'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                        style={{
                          borderColor: isCurrent ? m.color : undefined,
                          backgroundColor: isCurrent ? (isDarkMode ? m.bgDark : m.bgLight) : undefined,
                          // Ring color matching signature
                          boxShadow: isCurrent ? `0 0 0 2px ${m.color}60` : undefined,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                            style={{ backgroundColor: m.color }}
                          />
                          <span
                            className="text-xs font-bold"
                            style={{ color: isCurrent ? m.color : undefined }}
                          >
                            {m.name}
                          </span>
                        </div>
                        {isCurrent && (
                          <Check
                            className="w-3.5 h-3.5"
                            style={{ color: m.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 🔤 Site Main Font Selection Section (글자 폰트 설정) */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>🔤 사이트 메인 서체(폰트) 선택</span>
                  </label>
                  <span className="text-[10px] text-slate-600 font-medium dark:text-slate-300">선택 즉시 사이트 전체에 실시간 적용됩니다</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'pretendard',
                      name: '프리텐다드 (Pretendard)',
                      desc: '현대적이고 깔끔한 표준 서체 (기본)',
                      sampleFont: "'Pretendard', -apple-system, sans-serif",
                      badge: '기본 권장'
                    },
                    {
                      id: 'gmarket',
                      name: 'Gmarket Sans',
                      desc: '아이돌 앨범 & 굿즈에 어울리는 볼드 서체',
                      sampleFont: "'GmarketSans', sans-serif",
                      badge: '아이돌 감성'
                    },
                    {
                      id: 'myeongjo',
                      name: '나눔명조 (Nanum Myeongjo)',
                      desc: '소장품 박물관의 품격을 높이는 우아한 서체',
                      sampleFont: "'Nanum Myeongjo', serif",
                      badge: '박물관 감성'
                    },
                    {
                      id: 'kotra',
                      name: '코트라 희망체 (KOTRA HOPE)',
                      desc: '귀엽고 사랑스러운 팬메이드 손글씨체',
                      sampleFont: "'KOTRAHOPE', cursive",
                      badge: '손글씨 감성'
                    },
                    {
                      id: 'noto',
                      name: 'Noto Sans KR',
                      desc: '가독성이 뛰어난 단정한 구글 표준 서체',
                      sampleFont: "'Noto Sans KR', sans-serif",
                      badge: '표준 고딕'
                    },
                  ].map((fontItem) => {
                    const isSelected = (config.fontFamily || 'pretendard') === fontItem.id;
                    return (
                      <button
                        key={fontItem.id}
                        type="button"
                        onClick={() => {
                          onUpdateConfig({ fontFamily: fontItem.id });
                          onShowToast(`[${fontItem.name}] 폰트가 전체 사이트에 적용되었습니다.`, 'success');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-2 ring-purple-200 dark:ring-purple-900/50 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{fontItem.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">
                            {fontItem.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2 leading-tight">
                          {fontItem.desc}
                        </p>
                        <div
                          className="px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-850 text-xs text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 truncate"
                          style={{ fontFamily: fontItem.sampleFont }}
                        >
                          👑 이세돌 공주님들의 소중한 보물 123 ABC
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>현재 적용 중</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  📐 카드 밀도 및 레이아웃 옵션
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={config.showHeroBanner}
                      onChange={(e) => onUpdateConfig({ showHeroBanner: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-400"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">상단 스토리 & 통계 히어로 배너 표시</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & 소셜 미디어 연동 */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">검색엔진 최적화(SEO) 및 소셜 미디어 카드 연동</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  메타 태그 및 카카오톡, X(트위터), 페이스북 공유 시 나타나는 OpenGraph 미리보기를 관리합니다.
                </p>
              </div>

              {/* Meta Inputs */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Meta Title (웹 브라우저 탭 & 검색 결과 제목)</label>
                  <input
                    type="text"
                    value={config.metaTitle}
                    onChange={(e) => onUpdateConfig({ metaTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Meta Description (검색 설명 요약문)</label>
                  <textarea
                    rows={2}
                    value={config.metaDescription}
                    onChange={(e) => onUpdateConfig({ metaDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">OpenGraph 공유 썸네일 이미지 URL</label>
                  <input
                    type="text"
                    value={config.ogImageUrl}
                    onChange={(e) => onUpdateConfig({ ogImageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  📱 실시간 소셜 공유 카드 미리보기 (SNS Card Simulator)
                </span>
                <div className="max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative aspect-16/9 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <img
                      src={config.ogImageUrl}
                      alt="OG 미리보기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 bg-slate-50/60 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-600 uppercase font-mono dark:text-slate-300">isegye-archive.app</p>
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate mt-0.5">{config.metaTitle}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {config.metaDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Social Links */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">🔗 공식 채널 바로가기 링크 관리</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">공식 팬카페 (왁물원)</label>
                    <input
                      type="text"
                      value={config.officialLinks.wakzoo}
                      onChange={(e) =>
                        onUpdateConfig({
                          officialLinks: { ...config.officialLinks, wakzoo: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">공식 유튜브 채널</label>
                    <input
                      type="text"
                      value={config.officialLinks.youtube}
                      onChange={(e) =>
                        onUpdateConfig({
                          officialLinks: { ...config.officialLinks, youtube: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 데이터 백업 & 복원 */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">데이터 백업 및 JSON 내보내기/가져오기</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  브라우저의 로컬 스토리지에 저장된 소장 상태, 메모, 등록된 모든 굿즈와 커스텀 카테고리를 안전하게 JSON 파일로 백업하세요.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs sm:text-sm mb-1">
                      <Download className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                      <span>JSON 파일로 내보내기 (Export)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      현재 등록된 {goods.length}개의 굿즈와 {categories.length}개의 카테고리, 소장/위시 체크 및 태그 정보를 완전한 JSON 파일로 다운로드합니다.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>백업 파일 (.json) 다운로드</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1">
                      <Upload className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span>JSON 파일 불러오기 (Import)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      이전에 내보낸 JSON 백업 파일을 업로드하여 굿즈, 카테고리, 설정을 즉시 복원합니다.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>백업 파일 선택 및 복원</span>
                    </button>
                  </div>
                </div>

                {/* Full Source Code ZIP Export Card */}
                <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3 flex flex-col justify-between sm:col-span-2">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs sm:text-sm mb-1">
                      <span className="text-base">📦</span>
                      <span>웹사이트 전체 소스코드 파일 다운로드 (ZIP)</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      React 18, TypeScript, Tailwind CSS 구성 요소와 모든 컴포넌트(Header, NewsBanner, AdminModal, GoodsCard 등), 데이터 파일, 이미지, 로컬 실행 가이드(README)가 포함된 프로젝트 전체 소스코드 압축 파일입니다.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href="/isegye-idol-archive-source.zip"
                      download="isegye-idol-archive-source.zip"
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>전체 소스코드 (.zip) 다운로드</span>
                    </a>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      다운로드 후 압축 해제 &gt; `npm install` &gt; `npm run dev`로 바로 실행 가능
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">💾 브라우저 로컬 저장소 상태</span>
                <p>• 저장 키: <code className="text-purple-700 dark:text-purple-400 font-mono">isegye_goods_archive_items_v2</code>, <code className="text-purple-700 dark:text-purple-400 font-mono">isegye_goods_archive_categories_v2</code></p>
                <p>• 실시간 자동 동기화 활성화됨: 모든 소장 체크, 커스텀 카테고리, 굿즈별 태그 정보는 안전하게 유지됩니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
