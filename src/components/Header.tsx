import { CollectionStats } from './CollectionStats';
import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Heart,
  BookmarkCheck,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Crown,
  Lock,
  X,
  Sparkles,
  Palette,
  MessageCircle,
  Calculator
} from 'lucide-react';
import { MemberId, SiteConfig, User, NewsItem } from '../types';
import { MEMBERS } from '../data/members';
import { getTextGradientStyle, getGradientCss } from '../utils/gradientUtils';
import { renderCustomText } from '../utils/textFormatter';
import { NewsBanner } from './NewsBanner';
import { SecretHearts } from './SecretHearts';

interface HeaderProps {
  config: SiteConfig;
  selectedMember: MemberId;
  onSelectMember: (member: MemberId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: 'all' | 'owned' | 'wishlist';
  onTabChange: (tab: 'all' | 'owned' | 'wishlist') => void;
  onOpenAdmin: () => void;
  onOpenLogin: (defaultAdminTab?: boolean) => void;
  currentUser: User | null;
  sharedReady?: boolean;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  totalCount: number;
  ownedCount: number;
  wishlistCount: number;
  onOpenAboutModal?: () => void;
  onOpenCalculator: () => void;
  onOpenTextEdit?: () => void;
  isCustomizerOpen?: boolean;
  onToggleCustomizer?: () => void;
  newsList?: NewsItem[];
  onUpdateNewsList?: (newList: NewsItem[]) => void;
  onShowToast?: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  selectedMember,
  onSelectMember,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onOpenAdmin,
  onOpenLogin,
  currentUser,
  sharedReady = true,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  totalCount,
  ownedCount,
  wishlistCount,
  onOpenAboutModal,
  onOpenCalculator,
  onOpenTextEdit,
  isCustomizerOpen = false,
  onToggleCustomizer,
  newsList = [],
  onUpdateNewsList,
  onShowToast,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const memberList: MemberId[] = ['all', 'ine', 'jingburger', 'lilpa', 'jururu', 'gosegu', 'viichan', 'group'];
  const isAdmin = currentUser?.role === 'admin';

  const isCustomMemberTheme =
    config.accentTheme &&
    config.accentTheme !== 'all' &&
    config.accentTheme !== 'default' &&
    config.accentTheme !== 'custom' &&
    MEMBERS[config.accentTheme as MemberId];

  const activeThemeMember = isCustomMemberTheme ? MEMBERS[config.accentTheme as MemberId] : null;

  const handleAdminClick = () => {
    if (isAdmin) {
      onOpenAdmin();
    } else {
      onOpenLogin(true);
    }
  };

  const handleTabClick = (tab: 'all' | 'owned' | 'wishlist') => {
    onTabChange(tab);
    const catalogEl = document.getElementById('goods-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMemberClick = (mid: MemberId) => {
    onSelectMember(mid);
    const catalogEl = document.getElementById('goods-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const catalogEl = document.getElementById('goods-catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="relative z-30 transition-all duration-700">
      {/* Sticky Compact Top Navigation Bar: Row 1 (Logo & Search) + Row 2 (Tabs & Tools) */}
      <div
        className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all duration-700"
        style={{
          borderBottomColor: activeThemeMember ? `${activeThemeMember.color}45` : undefined,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1: Logo & Title on left, Expansive Search bar on right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            {/* Logo & title */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <SecretHearts />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1
                    className={`text-base sm:text-xl font-bold tracking-tight truncate transition-all ${
                      isCustomizerOpen ? 'cursor-pointer hover:opacity-85 ring-2 ring-indigo-400/50 rounded-lg px-1.5' : ''
                    }`}
                    style={{
                      ...(config.customGradient?.enabled && config.customGradient.textGradientEnabled
                        ? getTextGradientStyle(config.customGradient)
                        : { color: isDarkMode ? '#FFFFFF' : '#0F172A' }),
                    }}
                    onClick={() => {
                      if (isCustomizerOpen && onToggleCustomizer) onToggleCustomizer();
                    }}
                    title={isCustomizerOpen ? '클릭하여 타이틀 및 그라데이션 수정' : undefined}
                  >
                    {renderCustomText(config.siteTitle)}
                  </h1>
                  {isAdmin ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                      <Crown className="w-2.5 h-2.5" />
                      <span>{renderCustomText(config.siteTexts?.headerBadge || 'ADMIN MODE')}</span>
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                      {renderCustomText(config.siteTexts?.headerBadge || 'ARCHIVE V2.5')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 tracking-wider font-mono truncate hidden sm:block">
                  {renderCustomText(config.siteSubtitle)}
                </p>
              </div>
            </div>

            {/* Search bar - Expands and displays text clearly without being cramped */}
            <div className="flex-1 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl sm:ml-4">
              <div className="relative group">
                <Search
                  className={`transition-all duration-200 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isSearchFocused
                      ? 'w-5 h-5 text-purple-600 dark:text-purple-400'
                      : 'w-4 h-4 text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder={
                    isSearchFocused
                      ? "굿즈 이름, 멤버(아이네, 징버거...), 카테고리, 태그 검색... (Enter로 바로 이동)"
                      : config.siteTexts?.searchPlaceholder || "굿즈 이름, 멤버, 태그 검색... ('KIDDING', 'LP')"
                  }
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className={`w-full transition-all duration-300 rounded-xl outline-none ${
                    isSearchFocused
                      ? 'pl-11 pr-10 py-2.5 text-sm sm:text-base font-semibold bg-white dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-2 border-purple-500 dark:border-purple-400 shadow-xl shadow-purple-500/15 ring-4 ring-purple-100 dark:ring-purple-950/60'
                      : 'pl-9.5 pr-8 py-2 text-xs sm:text-sm font-medium bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-700 dark:hover:text-white rounded-md transition-colors dark:text-slate-300"
                    title="검색어 지우기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Selected Tools Row (다음 줄로 배치된 도감/소장함/위시 탭, 다크모드, 로그인, 관리자 툴) */}
          <div className="py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {/* View navigation buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
              <button
                onClick={() => handleTabClick('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{renderCustomText(config.siteTexts?.tabAllLabel || '도감')}</span>
              </button>
              <button
                onClick={() => handleTabClick('owned')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'owned'
                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{renderCustomText(config.siteTexts?.tabOwnedLabel || '소장함')}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                  {ownedCount}
                </span>
              </button>
              <button
                onClick={() => handleTabClick('wishlist')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{renderCustomText(config.siteTexts?.tabWishlistLabel || '위시')}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full font-bold">
                  {wishlistCount}
                </span>
              </button>
            </div>

            {/* '이세계아이돌이란?' Button between Wish and Night Mode */}
            <div className="flex items-center gap-2 mx-1 sm:mx-2">
              <button
                onClick={onOpenAboutModal}
                className="requested-black-text px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-black/20 shadow-2xs hover:shadow-xs hover:scale-102 transition-all whitespace-nowrap cursor-pointer"
                style={{ background: "linear-gradient(110deg, #eee3fa 0%, #fff8cc 20%, #e1e6f3 40%, #fce3ee 60%, #e0f3fc 80%, #edf8d8 100%)" }}
                title="이세계아이돌 그룹 소개 및 6인 공주들 프로필 보기"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{renderCustomText(config.siteTexts?.aboutButtonLabel || '이세계아이돌이란?')}</span>
              </button>
              <button type="button" onClick={onOpenCalculator}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                title="굿즈 비용 계산기 열기" aria-haspopup="dialog">
                <Calculator className="w-3.5 h-3.5" /><span>계산기</span>
              </button>
              <a
                href="https://forms.gle/To76P1R4CDUt9zr18"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                title="문의사항 Google 설문지 열기 (새 탭)"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>문의사항</span>
                <span className="sr-only">(새 탭에서 열림)</span>
              </a>
            </div>

            {/* Right Action buttons: Dark mode, User login/profile, Admin mode */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Dark Mode Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* User Profile / Login Button */}
              {currentUser ? (
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl">
                  <span className="text-base">{currentUser.avatar || '🕊️'}</span>
                  <div className="hidden sm:block text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[80px]">
                        {currentUser.nickname}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors ml-1 cursor-pointer dark:text-slate-300"
                    title="로그아웃"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onOpenLogin(false)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-2xs hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>로그인</span>
                </button>
              )}

              {/* Live Visual Customizer Mode Toggle Button */}
              {isAdmin && onToggleCustomizer && (
                <button
                  onClick={onToggleCustomizer}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                    isCustomizerOpen
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-500 shadow-md'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}
                  title="웹사이트 모든 제목, 본문, 글자 및 그라데이션 실시간 수정 모드"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">수정 모드</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                      isCustomizerOpen
                        ? 'bg-white text-indigo-700'
                        : 'bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                    }`}
                  >
                    {isCustomizerOpen ? 'ON' : 'LIVE'}
                  </span>
                </button>
              )}

              {/* Admin Quick Text Edit Button */}
              {isAdmin && onOpenTextEdit && (
                <button
                  onClick={onOpenTextEdit}
                  className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl transition-all shadow-2xs bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 cursor-pointer"
                  title="웹사이트 전체 글·문구 수정 CMS 열기"
                >
                  <span>✍️ 글 CMS</span>
                </button>
              )}

              {/* Admin CMS Button */}
              <button
                onClick={handleAdminClick}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-300 dark:ring-amber-500/50'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-purple-700 dark:hover:text-purple-300'
                }`}
                title={isAdmin ? '관리자 대시보드 열기' : '관리자 모드 (인증 필요)'}
              >
                {isAdmin ? (
                  <>
                    <Crown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">관리자 CMS</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span className="hidden sm:inline">관리자 모드</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Non-sticky Sub-header: NewsBanner ('새로운 소식' Multi-Card Space) & Member Selector Bar */}
      <div
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border-b border-slate-200/60 dark:border-slate-800/60"
        style={{
          borderBottomColor: activeThemeMember ? `${activeThemeMember.color}35` : undefined,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CollectionStats config={config} totalCount={totalCount} ownedCount={ownedCount} wishlistCount={wishlistCount} />
          {/* '새로운 소식'  (Latest News & Announcements) Space - Placed right above Member Selector Bar */}
          <NewsBanner
            newsList={newsList}
            onUpdateNewsList={onUpdateNewsList || (() => {})}
            isAdmin={isAdmin && sharedReady}
            onOpenLogin={() => onOpenLogin(true)}
            onShowToast={onShowToast || (() => {})}
            isDarkMode={isDarkMode}
          />

          {/* Member Selector Bar */}
          <div className="py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
              MEMBER:
            </span>
            {memberList.map((mid) => {
              const member = MEMBERS[mid];
              const isSelected = selectedMember === mid;
              const isGroup = mid === 'group';

              return (
                <button
                  key={mid}
                  onClick={() => handleMemberClick(mid)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                  style={{
                    background: isGroup && isSelected
                      ? 'linear-gradient(90deg, rgba(138,43,226,0.18), rgba(37,99,235,0.18), rgba(16,185,129,0.18), rgba(245,158,11,0.18), rgba(236,72,153,0.18))'
                      : isSelected ? (isDarkMode ? member.bgDark : member.bgLight) : undefined,
                    color: isGroup
                      ? undefined
                      : isSelected ? `color-mix(in srgb, ${member.color}, ${isDarkMode ? "white 45%" : "black 40%"})` : undefined,
                    border: isGroup && isSelected
                      ? '1.5px solid rgba(138, 43, 226, 0.6)'
                      : isSelected
                      ? `1.5px solid ${isDarkMode ? member.accentColor : member.color}`
                      : '1px solid transparent',
                  }}
                >
                  <span className="text-xs">{member.symbol}</span>
                  {isGroup ? (
                    <span className={isSelected ? 'bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent font-extrabold' : 'font-semibold'}>
                      {member.name}
                    </span>
                  ) : (
                    <span>{member.name}</span>
                  )}
                  {isGroup && (
                    <span
                      className="w-2 h-2 rounded-full inline-block ml-0.5 bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500"
                      title="무지개 시그니처"
                    />
                  )}
                  {mid !== 'all' && mid !== 'group' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block ml-0.5"
                      style={{ backgroundColor: member.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
