import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Heart,
  CheckCircle2,
  Crown,
  Edit3,
  Save,
  RotateCcw,
  Check,
  Settings2,
  Palette
} from 'lucide-react';
import { GoodsItem, MemberId, SiteConfig, User } from '../types';
import { MEMBERS } from '../data/members';
import { getTextGradientStyle, getGradientCss } from '../utils/gradientUtils';
import { renderCustomText } from '../utils/textFormatter';

interface HeroSectionProps {
  config: SiteConfig;
  selectedMember: MemberId;
  goods: GoodsItem[];
  onSelectMember: (member: MemberId) => void;
  currentUser: User | null;
  onOpenAdmin: (tab?: 'crud' | 'categories' | 'design' | 'seo' | 'backup') => void;
  onUpdateConfig?: (newConfig: Partial<SiteConfig>) => void;
  onShowToast?: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
  isDarkMode: boolean;
  isCustomizerOpen?: boolean;
  onToggleCustomizer?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  selectedMember,
  goods,
  onSelectMember,
  currentUser,
  onOpenAdmin,
  onUpdateConfig,
  onShowToast,
  isDarkMode,
  isCustomizerOpen = false,
  onToggleCustomizer,
}) => {
  const [showStory, setShowStory] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);

  const getDefaultStoryForMember = (mid: MemberId) => {
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

  const currentDefaults = getDefaultStoryForMember(selectedMember);
  const savedMemberStory = config.memberStories?.[selectedMember];

  const activeQuote = savedMemberStory?.quote ?? currentDefaults.quote;
  const activeTitle = savedMemberStory?.storyTitle ?? currentDefaults.title;
  const activeSubtitle = savedMemberStory?.storySubtitle ?? currentDefaults.subtitle;
  const activeContent = savedMemberStory?.storyContent ?? currentDefaults.content;
  const activeNotice = savedMemberStory?.storyNotice ?? currentDefaults.notice;

  const [editQuote, setEditQuote] = useState(activeQuote);
  const [editTitle, setEditTitle] = useState(activeTitle);
  const [editSubtitle, setEditSubtitle] = useState(activeSubtitle);
  const [editContent, setEditContent] = useState(activeContent);
  const [editNotice, setEditNotice] = useState(activeNotice);

  useEffect(() => {
    setEditQuote(activeQuote);
    setEditTitle(activeTitle);
    setEditSubtitle(activeSubtitle);
    setEditContent(activeContent);
    setEditNotice(activeNotice);
  }, [selectedMember, config.memberStories, config.heroDescription, config.storyTitle, config.storySubtitle, config.storyContent, config.storyNotice]);

  const handleSaveStory = () => {
    if (onUpdateConfig) {
      const updatedMemberStories = {
        ...(config.memberStories || {}),
        [selectedMember]: {
          quote: editQuote,
          storyTitle: editTitle,
          storySubtitle: editSubtitle,
          storyContent: editContent,
          storyNotice: editNotice,
        }
      };

      const extraUpdates: Partial<SiteConfig> = {
        memberStories: updatedMemberStories,
      };

      if (selectedMember === 'all') {
        extraUpdates.heroDescription = editQuote;
        extraUpdates.storyTitle = editTitle;
        extraUpdates.storySubtitle = editSubtitle;
        extraUpdates.storyContent = editContent;
        extraUpdates.storyNotice = editNotice;
      }

      onUpdateConfig(extraUpdates);
      if (onShowToast) {
        onShowToast(`[${MEMBERS[selectedMember]?.name || '전체'}] 상단 스토리와 소개가 저장되었습니다.`, 'success');
      }
    }
    setIsEditingStory(false);
  };

  const handleResetStory = () => {
    const def = getDefaultStoryForMember(selectedMember);
    setEditQuote(def.quote);
    setEditTitle(def.title);
    setEditSubtitle(def.subtitle);
    setEditContent(def.content);
    setEditNotice(def.notice);
  };

  // Statistics calculation


  const totalOriginalValue = goods
    .filter((g) => g.isOwned)
    .reduce((sum, g) => sum + g.originalPrice, 0);

  const totalMarketValue = goods
    .filter((g) => g.isOwned)
    .reduce((sum, g) => sum + (g.currentMarketPrice || g.originalPrice), 0);

  const currentMember = MEMBERS[selectedMember];
  const isAdmin = currentUser?.role === 'admin';

  if (!config.showHeroBanner) return null;

  return (
    <div
      className={`backdrop-blur-xs border-b border-slate-200/60 dark:border-slate-800/80 py-8 sm:py-10 transition-colors ${
        !config.customGradient?.enabled || !config.customGradient.headerGradientEnabled
          ? 'bg-gradient-to-b from-white/75 via-white/65 to-white/80 dark:from-slate-900/75 dark:via-slate-900/65 dark:to-slate-950/80'
          : ''
      }`}
      style={{
        background:
          config.customGradient?.enabled && config.customGradient.headerGradientEnabled
            ? isDarkMode
              ? `linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.95) 100%), ${getGradientCss(config.customGradient)}`
              : `linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.95) 100%), ${getGradientCss(config.customGradient)}`
            : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Admin Mode Alert Strip if logged in as Admin */}
        {isAdmin && (
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>관리자 모드가 활성화되어 있습니다:</strong> 굿즈 등록/수정/삭제 권한 및 디자인 스튜디오 변경 사항이 즉시 적용됩니다.
              </span>
            </div>
            <button
              onClick={() => onOpenAdmin('crud')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors shrink-0"
            >
              CMS 설정 열기
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          {/* Main Title & Member Feature */}
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{
                  background:
                    currentMember.id === 'group'
                      ? 'linear-gradient(90deg, rgba(138,43,226,0.14), rgba(37,99,235,0.14), rgba(16,185,129,0.14), rgba(245,158,11,0.14), rgba(236,72,153,0.14))'
                      : isDarkMode ? currentMember.bgDark : currentMember.bgLight,
                  color:
                    currentMember.id === 'group'
                      ? undefined
                      : isDarkMode ? currentMember.accentColor : currentMember.color,
                  border:
                    currentMember.id === 'group'
                      ? '1px solid rgba(138, 43, 226, 0.45)'
                      : `1px solid ${currentMember.borderColor}`,
                }}
              >
                <span>{currentMember.symbol}</span>
                <span
                  className={
                    currentMember.id === 'group'
                      ? 'bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent font-bold'
                      : ''
                  }
                >
                  {currentMember.name} 아카이브 섹션
                </span>
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {currentMember.id === 'all' ? '이파리' : currentMember.fanClub} 공식 보관소
              </span>
            </div>

            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight transition-all ${
                isCustomizerOpen ? 'cursor-pointer hover:opacity-85 ring-2 ring-indigo-400/50 rounded-xl p-1 -m-1' : ''
              }`}
              onClick={() => {
                if (isCustomizerOpen && onToggleCustomizer) onToggleCustomizer();
              }}
              title={isCustomizerOpen ? '클릭하여 제목 및 그라데이션 수정' : undefined}
            >
              {config.customGradient?.enabled && config.customGradient.textGradientEnabled ? (
                <span style={getTextGradientStyle(config.customGradient)}>
                  {selectedMember === 'all'
                    ? renderCustomText(config.heroHeadline || '여섯 공주들의 소중한 보물들을 기록하는 박물관')
                    : currentMember.id === 'group'
                    ? renderCustomText(`${currentMember.name} 스페셜 아카이브 도감`)
                    : renderCustomText(`${currentMember.name} 공주의 공식 및 소장 굿즈 보관소`)}
                </span>
              ) : selectedMember === 'all' ? (
                <span>
                  {config.heroHeadline ? (
                    renderCustomText(config.heroHeadline)
                  ) : (
                    <>
                      여섯 공주들의{' '}
                      <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
                        소중한 보물들
                      </span>
                      을<br className="hidden sm:inline" /> 체계적으로 기록하는 도감
                    </>
                  )}
                </span>
              ) : (
                <>
                  {currentMember.id === 'group' ? (
                    <span className="bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
                      {currentMember.name}
                    </span>
                  ) : (
                    <span style={{ color: isDarkMode ? currentMember.accentColor : currentMember.color }}>
                      {currentMember.name}
                    </span>
                  )}{' '}
                  공주의 모든 공식 및 소장 굿즈 기록
                </>
              )}
            </h2>

            {/* Inline Story Editor for Admin */}
            {isEditingStory ? (
              <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600 space-y-3.5 shadow-md animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      👑 [{currentMember.name}] 상단 스토리 & 소개 수정
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded-md">
                    관리자 편집 모드
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      1. 상단 대표 소개글 / 어록
                    </label>
                    <input
                      type="text"
                      value={editQuote}
                      onChange={(e) => setEditQuote(e.target.value)}
                      placeholder="상단에 노출되는 대표 소개 문구 또는 멤버 어록"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      2. 스토리 버튼 제목
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="예: 🏛️ '공주들 소장품 박물관'이란 어떤 곳인가요?"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      3. 스토리 헤드라인 / 인용구
                    </label>
                    <input
                      type="text"
                      value={editSubtitle}
                      onChange={(e) => setEditSubtitle(e.target.value)}
                      placeholder="스토리 본문 상단에 굵게 표시되는 강조 인용구"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      4. 상세 스토리 본문
                    </label>
                    <textarea
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="해당 멤버 또는 박물관의 상세 역사 및 스토리"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      5. 하단 안내 / 수집 가이드
                    </label>
                    <input
                      type="text"
                      value={editNotice}
                      onChange={(e) => setEditNotice(e.target.value)}
                      placeholder="스토리 하단에 작게 표시되는 안내문"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetStory}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      title="기본 문구로 되돌리기"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>기본값</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAdmin('design')}
                      className="px-2.5 py-1 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      title="관리자 CMS의 전체 디자인 탭에서 일괄 관리"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>CMS 전체 설정</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingStory(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStory}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>스토리 저장</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Story Quote Display */}
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed flex-1 transition-all ${
                      isCustomizerOpen ? 'cursor-pointer hover:opacity-85 ring-1 ring-indigo-400/50 rounded-lg p-1' : ''
                    }`}
                    onClick={() => {
                      if (isCustomizerOpen && onToggleCustomizer) onToggleCustomizer();
                    }}
                    title={isCustomizerOpen ? '클릭하여 소개글 수정' : undefined}
                  >
                    {renderCustomText(activeQuote)}
                  </p>
                </div>

                {/* Collapsible Story & Lore Trigger, Jump to Catalog, and Admin Action */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowStory(!showStory)}
                    className="theme-readable-text inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{renderCustomText(activeTitle)}</span>
                    {showStory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Direct Jump to Catalog Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('goods-catalog');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all hover:scale-102 cursor-pointer"
                    title="스크롤하여 굿즈 도감 목록으로 바로 이동"
                  >
                    <span>👇 굿즈 도감 바로보기</span>
                  </button>

                  {/* Admin Direct Story Edit Button */}
                  {isAdmin && (
                    <div className="inline-flex items-center gap-1.5 ml-1">
                      <button
                        onClick={() => {
                          setShowStory(true);
                          setIsEditingStory(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-2xs transition-all cursor-pointer"
                        title={`관리자: [${currentMember.name}] 상단 스토리 직접 수정`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{currentMember.name} 스토리 수정</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Collapsible Story Card */}
                {showStory && (
                  <div className="theme-readable-text mt-3 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-xs text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 animate-in fade-in duration-200 relative">
                    {isAdmin && (
                      <button
                        onClick={() => setIsEditingStory(true)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-100 transition-colors text-xs flex items-center gap-1 shadow-2xs"
                        title="이 스토리 수정하기"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                    )}
                    <p className="font-semibold text-purple-900 dark:text-purple-300 pr-16">
                      {renderCustomText(activeSubtitle)}
                    </p>
                    <p className="whitespace-pre-line">
                      {renderCustomText(activeContent)}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs pt-1 border-t border-purple-100/60 dark:border-purple-900/40">
                      {renderCustomText(activeNotice)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};
