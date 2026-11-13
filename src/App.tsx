import { useArchiveData } from './hooks/useArchiveData';
import { ArchiveSyncStatus } from './components/ArchiveSyncStatus';
import { publicGoods } from '../shared/catalog.js';
import { getGoodsKinds } from './utils/goodsKinds';
import { GoodsCalculatorModal } from './components/GoodsCalculatorModal';
import { BookIntro, BOOK_INTRO_SEEN_KEY } from './components/BookIntro';
import { withComponentChecks } from './utils/componentChecklist';
import { normalizeGoods, getGoodsKind, getGoodsCategories } from './utils/goodsKind';
import React, { useState, useEffect, useMemo } from 'react';
import { GoodsItem, SiteConfig, MemberId, CategoryItem, Rarity, User, NewsItem } from './types';
import { INITIAL_GOODS, DEFAULT_SITE_CONFIG } from './data/initialGoods';
import { MEMBERS, DEFAULT_CATEGORIES } from './data/members';
import { INITIAL_NEWS, STORAGE_KEY_NEWS } from './data/initialNews';
import { Header } from './components/Header';
import { FilterBar, SortOption, ViewMode } from './components/FilterBar';
import { GoodsCard } from './components/GoodsCard';
import { GoodsPagination, GOODS_PAGE_SIZE } from './components/GoodsPagination';
import { GoodsDetailModal } from './components/GoodsDetailModal';
import { AdminModal } from './components/AdminModal';
import { LoginModal } from './components/LoginModal';
import { AboutIsegyeModal } from './components/AboutIsegyeModal';
import { LiveVisualCustomizer } from './components/LiveVisualCustomizer';
import { Toast, ToastMessage } from './components/Toast';
import { Sparkles, Heart, BookmarkCheck, ExternalLink, ArrowUp, Layers, HelpCircle, Crown, Lock, Tag, X, Palette } from 'lucide-react';
import { DEFAULT_CUSTOM_GRADIENT, getBgGradientOverlayStyle } from './utils/gradientUtils';
import { renderCustomText } from './utils/textFormatter';

const STORAGE_KEY_GOODS = 'isegye_goods_archive_items_v2';
const STORAGE_KEY_CONFIG = 'isegye_goods_archive_config_v2';
const STORAGE_KEY_FAVORITES = 'isegye_goods_archive_favs_v2';
const STORAGE_KEY_USER = 'isegye_goods_archive_user_v2';
const STORAGE_KEY_DARK = 'isegye_goods_archive_dark_v2';
const STORAGE_KEY_CATEGORIES = 'isegye_goods_archive_categories_v2';

export default function App() {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [introPhase, setIntroPhase] = useState<'waiting' | 'opening' | 'done'>(() => {
    if (new URLSearchParams(window.location.search).get('intro') === '1') return 'waiting';
    try { return sessionStorage.getItem(BOOK_INTRO_SEEN_KEY) ? 'done' : 'waiting'; } catch { return 'waiting'; }
  });
  const finishIntro = () => {
    try { sessionStorage.setItem(BOOK_INTRO_SEEN_KEY, '1'); } catch {}
    setIntroPhase('done');
    requestAnimationFrame(() => {
      const title = document.querySelector<HTMLElement>('#root h1');
      title?.setAttribute('tabindex', '-1');
      title?.focus({ preventScroll: true });
    });
  };

  // 1. Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DARK);
      if (saved !== null) return saved === 'true';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DARK, String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  // 2. Current User & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) { const user = JSON.parse(saved); return user?.role === 'admin' ? null : user; }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser && currentUser.role !== 'admin') {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    let cancelled = false;
    const refreshAdminSession = async () => {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'same-origin', cache: 'no-store' });
        const result = response.ok ? await response.json() : { user: null };
        if (!cancelled) setCurrentUser(previous => result.user?.role === 'admin' ? result.user : previous?.role === 'admin' ? null : previous);
      } catch {
        if (!cancelled) setCurrentUser(previous => previous?.role === 'admin' ? null : previous);
      }
    };
    void refreshAdminSession();
    const timer = currentUser?.role === 'admin' ? window.setInterval(refreshAdminSession, 60000) : undefined;
    window.addEventListener('focus', refreshAdminSession);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener('focus', refreshAdminSession); };
  }, [currentUser?.role]);

  const archive = useArchiveData(currentUser?.role === 'admin');
  const {goods,setGoods,config,setConfig,categories,setCategories,news,setNews} = archive;

  // 6. Favorites Set State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // 7. Navigation & Filter States
  const [selectedMember, setSelectedMember] = useState<MemberId>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'wishlist'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [goodsPage, setGoodsPage] = useState(1);

  // 8. Modals & Live Customizer State
  const [selectedGoods, setSelectedGoods] = useState<GoodsItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'crud' | 'textEdit' | 'categories' | 'design' | 'seo' | 'backup'>('crud');
  const [adminEditingGoods, setAdminEditingGoods] = useState<GoodsItem | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginDefaultAdminTab, setLoginDefaultAdminTab] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin' && archive.state.ready;

  useEffect(() => {
    if (!isAdmin) setIsCustomizerOpen(false);
  }, [isAdmin]);

  const toggleCustomizer = () => {
    if (isAdmin) setIsCustomizerOpen(previous => !previous);
  };

  const handleAdminEditGoods = (item: GoodsItem) => {
    if (!archive.state.ready) { showToast('공용 저장소 연결을 확인한 뒤 수정해주세요.', 'info'); return; }
    setAdminEditingGoods(item);
    setAdminInitialTab('crud');
    setIsAdminOpen(true);
  };

  // 9. Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: ToastMessage['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    document.title = config.siteTitle;
  }, [config.siteTitle]);

  const kindOptions = getGoodsKinds(config.goodsKinds);
  useEffect(() => {
    if (selectedRarity !== 'all' && !kindOptions.some(kind => kind.id === selectedRarity)) setSelectedRarity('all');
  }, [config.goodsKinds, selectedRarity]);

  // Auth Handlers
  const handleLogin = async (user: User) => {
    if (user.role !== 'admin' && currentUser?.role === 'admin') {
      try {
        const response = await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
        if (!response.ok) throw new Error('Logout failed');
      } catch { showToast('계정 전환에 실패했습니다. 다시 시도해주세요.', 'info'); return; }
    }
    setCurrentUser(user);
    if (user.biasMember && user.biasMember !== 'all' && selectedMember === 'all') {
      setSelectedMember(user.biasMember);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error('Logout failed');
      setCurrentUser(null);
      showToast('로그아웃되었습니다.', 'info');
    } catch {
      showToast('로그아웃에 실패했습니다. 다시 시도해주세요.', 'info');
    }
  };

  const handleOpenLogin = (defaultAdminTab = false) => {
    setLoginDefaultAdminTab(defaultAdminTab);
    setIsLoginOpen(true);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    showToast(!isDarkMode ? '🌙 다크 모드가 활성화되었습니다.' : '☀️ 라이트 모드가 활성화되었습니다.', 'info');
  };

  // Category Handlers
  const handleAddCategory = (newCat: CategoryItem) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleUpdateCategory = (updatedCat: CategoryItem) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (selectedCategory === id) {
      setSelectedCategory('all');
    }
  };

  const handleResetCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
  };

  const handleOpenCategoryManager = () => {
    if (isAdmin) {
      setAdminInitialTab('categories');
      setIsAdminOpen(true);
    } else {
      handleOpenLogin(true);
    }
  };

  // Tag Handlers
  const handleUpdateTags = (goodsId: string, updatedTags: string[]) => {
    if (!isAdmin) return;
    setGoods((prev) =>
      prev.map((item) => (item.id === goodsId ? { ...item, tags: updatedTags } : item))
    );
    if (selectedGoods && selectedGoods.id === goodsId) {
      setSelectedGoods((prev) => (prev ? { ...prev, tags: updatedTags } : null));
    }
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTagFilter(tag);
    showToast(`'#${tag}' 태그가 적용되었습니다.`, 'info');
  };

  const handleClearTagFilter = () => {
    setSelectedTagFilter('');
  };

  // Handlers for Items
  const handleToggleOwned = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGoods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVal = !item.isOwned;
          showToast(
            nextVal
              ? `📦 '${item.title}' 굿즈가 소장 목록에 추가되었습니다!`
              : `📦 '${item.title}' 굿즈 소장 체크를 해제했습니다.`,
            'bookmark'
          );
          return withComponentChecks(
            { ...item, isOwned: nextVal },
            nextVal ? (item.components || []).map((_, index) => index) : []
          );
        }
        return item;
      })
    );
  };

  const handleUpdateComponentChecks = (id: string, indices: number[]) => {
    setGoods(previous => previous.map(item => item.id === id ? withComponentChecks(item, indices) : item));
  };

  const handleToggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGoods((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVal = !item.isWishlist;
          showToast(
            nextVal
              ? `💖 '${item.title}' 굿즈가 위시리스트에 담겼습니다.`
              : `위시리스트에서 제거되었습니다.`,
            'heart'
          );
          return { ...item, isWishlist: nextVal };
        }
        return item;
      })
    );
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('좋아요를 취소했습니다.', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('좋아요 목록에 보관되었습니다.', 'heart');
        return [...prev, id];
      }
    });
  };

  const handleUpdateNote = (id: string, note: string) => {
    setGoods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, userNote: note } : item))
    );
    if (selectedGoods && selectedGoods.id === id) {
      setSelectedGoods((prev) => (prev ? { ...prev, userNote: note } : null));
    }
  };

  const handleAddGoods = (newGoods: GoodsItem) => {
    setGoods((prev) => [newGoods, ...prev]);
  };

  const handleUpdateGoods = (updated: GoodsItem) => {
    setGoods((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedGoods && selectedGoods.id === updated.id) {
      setSelectedGoods(updated);
    }
  };

  const handleDeleteGoods = (id: string) => {
    setGoods((prev) => prev.filter((item) => item.id !== id));
    if (selectedGoods && selectedGoods.id === id) {
      setSelectedGoods(null);
    }
  };

  const handleResetToDefault = () => {
    setGoods(INITIAL_GOODS.map(item => publicGoods(item) as GoodsItem));
    setCategories(DEFAULT_CATEGORIES);
    setConfig(DEFAULT_SITE_CONFIG);
  };

  const handleImportData = (data: { goods: GoodsItem[]; config: SiteConfig; categories?: CategoryItem[]; news?: NewsItem[] }) => {
    if (data.goods && Array.isArray(data.goods)) {
      setGoods(data.goods.map(normalizeGoods));
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
    }
    if (Array.isArray(data.news)) setNews(data.news);
    if (data.config) {
      setConfig((prev) => ({ ...prev, ...data.config }));
    }
  };

  // Active filters calculation
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedRarity !== 'all' ||
    selectedYear !== 'all' ||
    selectedTagFilter !== '' ||
    searchQuery.trim() !== '' ||
    selectedMember !== 'all' ||
    activeTab !== 'all';

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedRarity('all');
    setSelectedYear('all');
    setSelectedTagFilter('');
    setSearchQuery('');
    setSelectedMember('all');
    setActiveTab('all');
    setSortBy('newest');
  };

  // Filter & Sort Logic
  const filteredGoods = useMemo(() => {
    let result = [...goods];

    // Filter by Tab (all / owned / wishlist)
    if (activeTab === 'owned') {
      result = result.filter((g) => g.isOwned);
    } else if (activeTab === 'wishlist') {
      result = result.filter((g) => g.isWishlist);
    }

    // Filter by Member
    if (selectedMember !== 'all') {
      result = result.filter((g) => g.memberId === selectedMember);
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((g) => getGoodsCategories(g).includes(selectedCategory));
    }

    // Filter by Rarity
    if (selectedRarity !== 'all') {
      result = result.filter((g) => getGoodsKind(g.rarity) === selectedRarity);
    }

    // Filter by Release Year
    if (selectedYear !== 'all') {
      result = result.filter((g) => String(g.releaseYear) === selectedYear);
    }

    // Filter by Tag
    if (selectedTagFilter) {
      result = result.filter((g) =>
        (g.tags || []).some(
          (t) => t.toLowerCase() === selectedTagFilter.toLowerCase()
        )
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((g) => {
        const titleMatch = g.title.toLowerCase().includes(q);
        const descMatch = g.description.toLowerCase().includes(q);
        const memberInfo = MEMBERS[g.memberId];
        const memberMatch =
          memberInfo?.name.toLowerCase().includes(q) ||
          memberInfo?.nameEn.toLowerCase().includes(q);
        const tagMatch = (g.tags || []).some((t) => t.toLowerCase().includes(q));
        const componentMatch = (g.components || []).some((c) =>
          c.toLowerCase().includes(q)
        );
        return titleMatch || descMatch || memberMatch || tagMatch || componentMatch;
      });
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
        break;
      case 'oldest':
        result.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
        break;
      case 'popular':
        result.sort((a, b) => {
          const aFav = (favorites.includes(a.id) ? 100 : 0) + (a.favoriteCount || 0);
          const bFav = (favorites.includes(b.id) ? 100 : 0) + (b.favoriteCount || 0);
          return bFav - aFav;
        });
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
        break;
      default:
        break;
    }

    return result;
  }, [
    goods,
    activeTab,
    selectedMember,
    selectedCategory,
    selectedRarity,
    selectedYear,
    selectedTagFilter,
    searchQuery,
    sortBy,
    favorites,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredGoods.length / GOODS_PAGE_SIZE));
  const currentPage = Math.min(goodsPage, pageCount);
  const paginatedGoods = filteredGoods.slice((currentPage - 1) * GOODS_PAGE_SIZE, currentPage * GOODS_PAGE_SIZE);

  useEffect(() => {
    setGoodsPage(1);
  }, [activeTab, selectedMember, selectedCategory, selectedRarity, selectedYear, selectedTagFilter, searchQuery, sortBy]);

  useEffect(() => {
    setGoodsPage(previous => Math.min(previous, pageCount));
  }, [pageCount]);

  const changeGoodsPage = (page: number) => {
    setGoodsPage(Math.max(1, Math.min(page, pageCount)));
    document.getElementById('goods-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const ownedCount = goods.filter((g) => g.isOwned).length;
  const wishlistCount = goods.filter((g) => g.isWishlist).length;

  // Active Member Signature Theme (subtle ambient color shift across the site)
  const isCustomMemberTheme =
    config.accentTheme &&
    config.accentTheme !== 'all' &&
    config.accentTheme !== 'default' &&
    config.accentTheme !== 'custom' &&
    MEMBERS[config.accentTheme as MemberId];

  const activeThemeMember = isCustomMemberTheme ? MEMBERS[config.accentTheme as MemberId] : null;

  const getFontFamilyCSS = (font?: string) => {
    switch (font) {
      case 'gmarket':
        return "'GmarketSans', 'Pretendard', sans-serif";
      case 'myeongjo':
        return "'Nanum Myeongjo', serif";
      case 'kotra':
        return "'KOTRAHOPE', 'Pretendard', cursive, sans-serif";
      case 'noto':
        return "'Noto Sans KR', sans-serif";
      case 'pretendard':
      default:
        return "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif";
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    {introPhase !== 'done' && <BookIntro onBegin={() => setIntroPhase('opening')} onComplete={finishIntro} />}
    <div
      inert={introPhase !== 'done'}
      aria-hidden={introPhase !== 'done' ? true : undefined}
      className="min-h-screen flex flex-col relative text-slate-800 dark:text-slate-100 antialiased font-sans selection:bg-purple-100 dark:selection:bg-purple-900/60 selection:text-purple-900 dark:selection:text-purple-200 transition-colors duration-700"
      style={{
        accentColor: activeThemeMember ? activeThemeMember.color : undefined,
        fontFamily: getFontFamilyCSS(config.fontFamily),
      }}
    >
      {/* Theme background and ambient color overlays */}
      <div
        className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-white dark:bg-slate-950"
        aria-hidden="true"
      >
        {/* Soft atmospheric gradient scrim with subtle member signature tint */}
        <div
          className="absolute inset-0 transition-all duration-700 backdrop-blur-[0.5px]"
          style={{
            background: activeThemeMember
              ? isDarkMode
                ? `linear-gradient(180deg, ${activeThemeMember.color}1E 0%, rgba(15, 23, 42, 0.88) 32%, rgba(15, 23, 42, 0.95) 100%)`
                : `linear-gradient(180deg, ${activeThemeMember.color}16 0%, rgba(255, 255, 255, 0.82) 28%, ${activeThemeMember.color}0D 100%)`
              : undefined,
          }}
        />
        {!activeThemeMember && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/55 to-white/75 dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-950/85" />
        )}

        {/* Custom Gradient Ambient Background Overlay Layer */}
        {config.customGradient?.enabled && config.customGradient.bgGradientEnabled && (
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={getBgGradientOverlayStyle(config.customGradient, isDarkMode)}
          />
        )}

        {/* Subtle ambient glowing aura matching member signature color */}
        {activeThemeMember && (
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none transition-all duration-1000 -z-10 opacity-35 dark:opacity-25 blur-3xl rounded-full"
            style={{
              background: `radial-gradient(ellipse at center, ${activeThemeMember.color} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Global Header */}
      <Header
        config={config}
        selectedMember={selectedMember}
        onSelectMember={setSelectedMember}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAdmin={() => {
          if (!archive.state.ready) { showToast('공용 저장소 연결을 확인한 뒤 수정해주세요.', 'info'); return; }
          setAdminInitialTab('crud');
          setIsAdminOpen(true);
        }}
        onOpenLogin={handleOpenLogin}
        currentUser={currentUser}
        sharedReady={archive.state.ready}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        totalCount={goods.length}
        ownedCount={ownedCount}
        wishlistCount={wishlistCount}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenTextEdit={() => {
          if (!archive.state.ready) { showToast('공용 저장소 연결을 확인한 뒤 수정해주세요.', 'info'); return; }
          setAdminInitialTab('textEdit');
          setIsAdminOpen(true);
        }}
        isCustomizerOpen={isAdmin && isCustomizerOpen}
        onToggleCustomizer={isAdmin ? toggleCustomizer : undefined}
        newsList={news}
        onUpdateNewsList={setNews}
        onShowToast={showToast}
      />

      <ArchiveSyncStatus state={archive.state} isAdmin={currentUser?.role === 'admin'}
        onRetry={() => { if (archive.state.dirty) void archive.save(); else void archive.refresh(); }}
        onPublish={archive.publishInitial} onRefresh={() => void archive.refresh()} onReload={() => void archive.refresh(true)} />

      <GoodsCalculatorModal isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} goods={goods} kindOptions={kindOptions} />

      {/* Main Content Area */}
      <main id="goods-catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-mt-28 bg-[#f5efe4] dark:bg-[#29251f] transition-colors duration-300">
        {/* Filters & Sorting Bar with Dynamic Categories */}
        <FilterBar
          categories={categories}
          kindOptions={kindOptions}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedRarity={selectedRarity}
          onSelectRarity={setSelectedRarity}
          selectedYear={selectedYear}
          onSelectYear={setSelectedYear}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredGoods.length}
          totalCount={goods.length}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          onManageCategories={handleOpenCategoryManager}
          isAdmin={isAdmin}
        />

        {/* Active Tag Filter Pill Indicator */}
        {selectedTagFilter && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs text-purple-950 dark:text-purple-200">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>
                <strong>{renderCustomText(config.siteTexts?.tagFilterActiveText || '태그 필터 활성화')}:</strong> #{selectedTagFilter} 태그가 포함된 굿즈만 모아보고 있습니다.
              </span>
            </div>
            <button
              onClick={handleClearTagFilter}
              className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 hover:underline"
            >
              <span>태그 필터 해제</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Banner Announcement if filtered by Owned or Wishlist */}
        {activeTab === 'owned' && (
          <div className="mb-4 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>{renderCustomText(config.siteTexts?.ownedTabAnnouncement || '소장 완료 도감')}:</strong> 현재 소장 중으로 체크된 총{' '}
                <strong>{ownedCount}</strong>개의 굿즈만 모아보고 있습니다.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('all')}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 font-bold underline"
            >
              전체 도감 보기
            </button>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="mb-4 p-3.5 bg-rose-50/80 dark:bg-rose-950/40 rounded-xl border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between text-xs text-rose-900 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              <span>
                <strong>{renderCustomText(config.siteTexts?.wishlistTabAnnouncement || '위시리스트 보관함')}:</strong> 소장 희망 목록에 담긴 총{' '}
                <strong>{wishlistCount}</strong>개의 굿즈만 모아보고 있습니다.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('all')}
              className="text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-rose-200 font-bold underline"
            >
              전체 도감 보기
            </button>
          </div>
        )}

        {/* Goods Cards Grid / List */}
        {filteredGoods.length > 0 ? (
          <div id="goods-results"
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'space-y-3'
            }
          >
            {paginatedGoods.map((item) => (
              <GoodsCard
                key={item.id}
                goods={item}
                viewMode={viewMode}
                categories={categories}
          kindOptions={kindOptions}
                onOpenDetail={setSelectedGoods}
                onToggleOwned={handleToggleOwned}
                onToggleWishlist={handleToggleWishlist}
                onToggleFavorite={handleToggleFavorite}
                onSelectTag={handleSelectTag}
                isFavorited={favorites.includes(item.id)}
                isAdmin={isAdmin}
                onEditGoods={handleAdminEditGoods}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl text-slate-600 dark:text-slate-300">
              🔍
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {config.siteTexts?.emptySearchTitle || '조건에 맞는 굿즈를 찾지 못했습니다'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {config.siteTexts?.emptySearchDesc || '검색어를 변경하거나 필터를 초기화해보세요. 관리자 모드에서 새로운 굿즈를 도감에 등록할 수도 있습니다.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
              >
                모든 필터 초기화
              </button>
              <button
                onClick={() => {
                  if (isAdmin) {
                    setAdminInitialTab('crud');
                    setIsAdminOpen(true);
                  } else {
                    handleOpenLogin(true);
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                새 굿즈 등록하기
              </button>
            </div>
          </div>
        )}
        <GoodsPagination page={currentPage} pageCount={pageCount} total={filteredGoods.length} onChange={changeGoodsPage} />
      </main>

      {/* Floating Scroll to Top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 z-30 p-2.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-xs transition-all hover:-translate-y-0.5"
        title="맨 위로 이동"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* Floating Live Customizer Trigger Button */}
      {isAdmin && <button
        onClick={toggleCustomizer}
        className={`fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-extrabold hover:scale-105 active:scale-95 transition-all border ${
          isCustomizerOpen
            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-white/30 ring-4 ring-purple-500/30'
            : 'bg-white/95 dark:bg-slate-850/95 text-slate-800 dark:text-white border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 backdrop-blur-md'
        }`}
        title="실시간 글자·제목·본문 및 그라데이션 수정 스튜디오 열기"
      >
        <Palette className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        <span>{isCustomizerOpen ? '수정 스튜디오 닫기' : '🎨 글자·그라데이션 수정'}</span>
      </button>}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 py-12 text-slate-600 dark:text-slate-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {renderCustomText(config.siteTitle)}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                  FAN ARCHIVE
                </span>
                {isAdmin && (
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" />
                    <span>ADMIN</span>
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                {renderCustomText(config.siteTexts?.footerDesc || '이세계아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)의 모든 소중한 순간들을 기록합니다.')}
              </p>
            </div>

            {/* Official Channel Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={config.officialLinks.wakzoo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium text-xs"
              >
                <span>{renderCustomText(config.siteTexts?.wakzooLinkLabel || '왁물원 팬카페')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={config.officialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium text-xs"
              >
                <span>{renderCustomText(config.siteTexts?.youtubeLinkLabel || '공식 유튜브')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/isegye-idol-archive-source.zip"
                download="isegye-idol-archive-source.zip"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors font-bold text-xs border border-indigo-200 dark:border-indigo-800"
                title="웹사이트 전체 소스코드 파일 (ZIP) 다운로드"
              >
                <span>📦 소스코드 ZIP 다운로드</span>
              </a>
              {isAdmin && (
                <button
                  onClick={() => {
                    setAdminInitialTab('textEdit');
                    setIsAdminOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 transition-colors font-semibold text-xs flex items-center gap-1"
                  title="웹사이트 전체 문구 및 글 수정 열기"
                >
                  <span>✍️ 전체 글 수정</span>
                </button>
              )}
              <button
                onClick={() => {
                  if (isAdmin) {
                    setAdminInitialTab('crud');
                    setIsAdminOpen(true);
                  } else {
                    handleOpenLogin(true);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 transition-colors font-semibold text-xs flex items-center gap-1"
              >
                {isAdmin ? (
                  <>
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>관리자 CMS 열기</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                    <span>관리자 모드</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
            <p>
              {renderCustomText(config.siteTexts?.footerDisclaimer || '본 아카이빙 웹사이트는 이세계아이돌의 팬 큐레이션 목적으로 제작된 비공식 아카이브입니다.')}
            </p>
            <p>{renderCustomText(config.siteTexts?.footerCopyright || '© 2024 ISEGYE IDOL GOODS ARCHIVE PROJECT. All Rights Reserved.')}</p>
          </div>
        </div>
      </footer>

      {/* Goods Detail Modal (with interactive Tag Editor) */}
      {selectedGoods && (
        <GoodsDetailModal
          goods={goods.find(item => item.id === selectedGoods.id) || selectedGoods}
          allGoods={filteredGoods}
          categories={categories}
          kindOptions={kindOptions}
          onClose={() => setSelectedGoods(null)}
          onSelectGoods={item => {
            setSelectedGoods(item);
            const index = filteredGoods.findIndex(goodsItem => goodsItem.id === item.id);
            if (index >= 0) setGoodsPage(Math.floor(index / GOODS_PAGE_SIZE) + 1);
          }}
          onToggleOwned={handleToggleOwned}
          onToggleWishlist={handleToggleWishlist}
          onToggleFavorite={handleToggleFavorite}
          isFavorited={favorites.includes(selectedGoods.id)}
          onUpdateComponentChecks={handleUpdateComponentChecks}
          onUpdateNote={handleUpdateNote}
          onUpdateTags={handleUpdateTags}
          onSelectTag={handleSelectTag}
          onShowToast={showToast}
          isDarkMode={isDarkMode}
          isAdmin={isAdmin}
          onEditGoods={handleAdminEditGoods}
        />
      )}

      {/* Admin Dashboard & CMS Modal (with Category Manager & Tag Editor) */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setAdminEditingGoods(null);
        }}
        goods={goods}
        onAddGoods={handleAddGoods}
        onUpdateGoods={handleUpdateGoods}
        onDeleteGoods={handleDeleteGoods}
        onResetToDefault={handleResetToDefault}
        categories={categories}
        news={news}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetCategories={handleResetCategories}
        config={config}
        onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
        onImportData={handleImportData}
        onShowToast={showToast}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        isDarkMode={isDarkMode}
        initialTab={adminInitialTab}
        initialEditingGoods={adminEditingGoods}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
      />

      {/* Login & Admin Mode Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        onShowToast={showToast}
        defaultAdminTab={loginDefaultAdminTab}
      />

      {/* About ISEGYE IDOL Modal (이세계아이돌이란?) */}
      <AboutIsegyeModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onSelectMember={(mid) => {
          setSelectedMember(mid);
          setSelectedTagFilter('');
          setSearchQuery('');
        }}
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        onOpenLogin={() => handleOpenLogin(true)}
        config={config}
        onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
        onShowToast={showToast}
      />

      {/* Live Visual Customizer Studio Drawer (실시간 글자·제목·본문 및 그라데이션 수정 스튜디오) */}
      {isAdmin && <LiveVisualCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
        onShowToast={showToast}
        isDarkMode={isDarkMode}
      />}
    </div>
    </>
  );
}
