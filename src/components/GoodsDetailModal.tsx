import { getSaleStatus } from '../data/saleStatus';
import { getGoodsLinks } from '../utils/goodsLinks';
import { getComponentChecks } from '../utils/componentChecklist';
import { hasLegendaryBadge, getGoodsKind, getGoodsCategories } from '../utils/goodsKind';
import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Heart,
  BookmarkCheck,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  FileText,
  Tag,
  Info,
  Twitter,
  Copy,
  Check,
  Plus,
  Edit2,
  Stamp,
  Crown
} from 'lucide-react';
import { GoodsItem, CategoryItem } from '../types';
import { MEMBERS, getRarityLabel, ISEGYE_RAINBOW_GRADIENT } from '../data/members';
import { StampSeal } from './StampEffect';
import { soundEffects } from '../utils/audio';

interface GoodsDetailModalProps {
  goods: GoodsItem | null;
  allGoods: GoodsItem[];
  categories?: CategoryItem[];
  kindOptions?: CategoryItem[];
  onClose: () => void;
  onSelectGoods: (goods: GoodsItem) => void;
  onToggleOwned: (id: string, e: React.MouseEvent) => void;
  onUpdateComponentChecks: (id: string, indices: number[]) => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isFavorited: boolean;
  onUpdateNote: (id: string, note: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onSelectTag?: (tag: string) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
  isDarkMode?: boolean;
  isAdmin?: boolean;
  onEditGoods?: (goods: GoodsItem) => void;
}

export const GoodsDetailModal: React.FC<GoodsDetailModalProps> = ({
  goods,
  allGoods,
  categories = [],
  kindOptions,
  onClose,
  onSelectGoods,
  onToggleOwned,
  onUpdateComponentChecks,
  onToggleWishlist,
  onToggleFavorite,
  isFavorited,
  onUpdateNote,
  onUpdateTags,
  onSelectTag,
  onShowToast,
  isDarkMode = false,
  isAdmin = false,
  onEditGoods,
}) => {
  if (!goods) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [noteText, setNoteText] = useState(goods.userNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const checkedComponents = new Set(getComponentChecks(goods));
  const [isAnimatingStamp, setIsAnimatingStamp] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setNoteText(goods.userNote || '');
    setIsEditingNote(false);
  }, [goods.id, goods.components]);

  // Tag editing state
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const member = MEMBERS[goods.memberId] || MEMBERS.all;
  const categoryLabel = getGoodsCategories(goods).map(id => categories.find(category => category.id === id)?.label || id).join(' · ');

  const images = [goods.imageUrl, ...(goods.additionalImages || [])];
  const activeImage = images[activeImageIndex] || goods.imageUrl;

  // Previous & Next navigation
  const currentIndex = allGoods.findIndex((g) => g.id === goods.id);
  const prevGoods = currentIndex > 0 ? allGoods[currentIndex - 1] : null;
  const nextGoods = currentIndex < allGoods.length - 1 ? allGoods[currentIndex + 1] : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    onShowToast('🔗 도감 상세 링크가 클립보드에 복사되었습니다.', 'info');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `🏛️ [이세계아이돌 공주들 소장품 박물관]\n"${goods.title}" 굿즈를 확인해보세요!\n\n#이세계아이돌 #이세돌굿즈 #소장품박물관`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleSaveNote = () => {
    onUpdateNote(goods.id, noteText);
    setIsEditingNote(false);
    onShowToast('소장 메모가 저장되었습니다.', 'success');
  };

  const toggleComponentCheck = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const next = new Set(checkedComponents);
    if (next.has(index)) next.delete(index); else next.add(index);
    const isComplete = goods.components.length > 0 && goods.components.every((_, i) => next.has(i));
    if (isComplete && !goods.isOwned) {
      soundEffects.playStampSound();
      setIsAnimatingStamp(true);
      setTimeout(() => setIsAnimatingStamp(false), 600);
    } else if (!isComplete && goods.isOwned) {
      soundEffects.playUnstampSound();
    }
    onUpdateComponentChecks(goods.id, [...next]);
  };

  const handleStampAction = (e: React.MouseEvent) => {
    if (!goods.isOwned) {
      soundEffects.playStampSound();
      setIsAnimatingStamp(true);
      setTimeout(() => setIsAnimatingStamp(false), 600);
    } else {
      soundEffects.playUnstampSound();
    }
    onToggleOwned(goods.id, e);
  };

  // Tag Management Handlers
  const handleAddTag = (tagToAdd?: string) => {
    const tag = (tagToAdd || newTagInput).trim().replace(/^#/, '');
    if (!tag) return;

    const currentTags = goods.tags || [];
    if (currentTags.includes(tag)) {
      onShowToast('이미 등록된 태그입니다.', 'info');
      setNewTagInput('');
      return;
    }

    const updatedTags = [...currentTags, tag];
    if (onUpdateTags) {
      onUpdateTags(goods.id, updatedTags);
      onShowToast(`'#${tag}' 태그가 추가되었습니다.`, 'success');
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = goods.tags || [];
    const updatedTags = currentTags.filter((t) => t !== tagToRemove);
    if (onUpdateTags) {
      onUpdateTags(goods.id, updatedTags);
      onShowToast(`'#${tagToRemove}' 태그가 삭제되었습니다.`, 'info');
    }
  };

  const popularTagSuggestions = [
    '한정판',
    '콘서트',
    'LP',
    'RE:WIND',
    'KIDDING',
    '포토카드',
    '키링',
    '디오라마',
    '오르골',
    '왁타버스',
  ];

  const isLegendary = hasLegendaryBadge(goods);
  const purchaseLinks = getGoodsLinks(goods);
  const saleStatus = getSaleStatus(goods.saleStatus);
  const memberTheme = {
    '--detail-accent': member.color,
    '--detail-ink': `color-mix(in srgb, ${member.color}, ${isDarkMode ? 'white 58%' : 'black 42%'})`,
    '--detail-soft': `color-mix(in srgb, ${member.color} ${isDarkMode ? '15%' : '7%'}, ${isDarkMode ? '#0f172a' : 'white'})`,
    '--detail-surface': isDarkMode ? '#0f172a' : '#ffffff',
    '--detail-border': `color-mix(in srgb, ${member.color} ${isDarkMode ? '48%' : '32%'}, ${isDarkMode ? '#334155' : 'white'})`,
    '--detail-action': `color-mix(in srgb, ${member.color}, black 42%)`,
    '--detail-action-hover': `color-mix(in srgb, ${member.color}, black 52%)`,
  } as React.CSSProperties;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        data-member-theme={goods.memberId}
        role="dialog" aria-modal="true" aria-label={`${member.name} 굿즈 상세`}
        style={{ ...memberTheme, background: 'linear-gradient(135deg, var(--detail-soft), var(--detail-surface) 55%)', borderColor: 'var(--detail-border)' }}
        className={`relative w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all ${isLegendary ? 'border-2' : 'border'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Highlight Stripe */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{
            background:
              goods.memberId === 'group'
                ? ISEGYE_RAINBOW_GRADIENT
                : `linear-gradient(90deg, ${member.color}, ${member.accentColor})`,
          }}
        />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--detail-border)] bg-[var(--detail-soft)] sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                background:
                  goods.memberId === 'group'
                    ? ISEGYE_RAINBOW_GRADIENT
                    : member.color,
              }}
            />
            {goods.memberId === 'group' ? (
              <span className="text-xs font-black tracking-wider uppercase truncate bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
                {member.name} 아카이브 도감 No.{goods.id.replace('goods-', '')}
              </span>
            ) : (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase truncate">
                {member.name} 아카이브 도감 No.{goods.id.replace('goods-', '')}
              </span>
            )}
            {isLegendary && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center gap-1 shadow-2xs">
                <Crown className="w-2.5 h-2.5" />
                <span>레전더리</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin Edit Goods Button */}
            {isAdmin && onEditGoods && (
              <button
                onClick={() => {
                  onClose();
                  onEditGoods(goods);
                }}
                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                title="관리자: 이 글 수정하기"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>글 수정</span>
              </button>
            )}

            {/* Paging controls */}
            {prevGoods && (
              <button
                onClick={() => onSelectGoods(prevGoods)}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                title={`이전: ${prevGoods.title}`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">이전</span>
              </button>
            )}
            {nextGoods && (
              <button
                onClick={() => onSelectGoods(nextGoods)}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                title={`다음: ${nextGoods.title}`}
              >
                <span className="hidden sm:inline">다음</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors dark:text-slate-300"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-5 space-y-3">
              {/* Main Image with Stamp effect */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <img
                  src={activeImage}
                  alt={goods.title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Stamp Seal on Image */}
                {(goods.isOwned || isAnimatingStamp) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <StampSeal size="lg" isStamping={isAnimatingStamp} />
                    {isAnimatingStamp && (
                      <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-rose-500/80 animate-ink-pulse pointer-events-none" />
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnails if multiple images exist */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx
                          ? 'border-[color:var(--detail-border)] ring-2 ring-[color:var(--detail-border)] ring-[color:var(--detail-border)]'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="썸네일" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Member Lore Banner */}
              <div
                className="p-3.5 rounded-xl border flex items-center gap-3"
                style={{
                  backgroundColor: 'var(--detail-soft)',
                  borderColor: 'var(--detail-border)',
                }}
              >
                <div className="text-2xl shrink-0">{member.symbol}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: 'var(--detail-ink)' }}>
                      {member.name}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      ({member.fanClub})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                    "{member.quote}"
                  </p>
                </div>
              </div>

              {/* Action buttons on desktop: '소장완료' 도장 버튼 */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleStampAction}
                  className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                    goods.isOwned
                      ? 'bg-rose-600 text-white shadow-rose-500/30 ring-2 ring-rose-200 dark:ring-rose-950 scale-102'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Stamp className={`w-4 h-4 ${goods.isOwned ? 'rotate-[-12deg]' : ''}`} />
                  <span>{goods.isOwned ? '소장완료 (도장 쾅!)' : '소장완료 도장 찍기'}</span>
                </button>

                <button
                  onClick={(e) => onToggleWishlist(goods.id, e)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    goods.isWishlist
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${goods.isWishlist ? 'fill-white' : ''}`} />
                  <span>{goods.isWishlist ? '위시리스트 등록됨' : '위시 담기'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Detailed Info & Specifications */}
            <div className="lg:col-span-7 space-y-5">
              {/* Metadata row (Zero-pill discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-[color:var(--detail-ink)]">{categoryLabel}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>발매일 {goods.releaseDate}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1 ${
                    isLegendary
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500 shadow-2xs'
                      : goods.rarity === 'Limited'
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isLegendary && <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                  {goods.rarity === 'Limited' && <span>✨</span>}
                  <span>{getRarityLabel(getGoodsKind(goods.rarity), kindOptions)}</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {goods.title}
              </h2>

              {/* Price and sale status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 block">발매 정가</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">₩{goods.originalPrice.toLocaleString()}</span>
                </div>
                <div aria-label="판매 상태" className="ml-auto shrink-0 text-right">
                  <span role="status" className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap ${saleStatus?.classes || 'bg-white text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600'}`}>{saleStatus?.label || '상태 미지정'}</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[color:var(--detail-ink)]" />
                  <span>굿즈 스토리 및 상세 설명</span>
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-750">
                  {goods.description}
                </p>
              </div>

              {/* Components Checklist */}
              {goods.components && goods.components.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[color:var(--detail-ink)]" />
                    <span>패키지 구성품 목록 (Checklist)</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300" role="status">
                    {checkedComponents.size}/{goods.components.length}개 체크{goods.isOwned ? ' · 소장 완료' : ' · 모두 체크하면 소장 완료됩니다.'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goods.components.map((comp, idx) => {
                      const isChecked = checkedComponents.has(idx);
                      return (
                        <button
                          key={idx}
                          onClick={event => toggleComponentCheck(idx, event)}
                          aria-pressed={isChecked}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left text-xs transition-all border ${
                            isChecked
                              ? 'bg-[var(--detail-soft)] bg-[var(--detail-soft)] border-[color:var(--detail-border)] border-[color:var(--detail-border)] text-[color:var(--detail-ink)] text-[color:var(--detail-ink)] font-medium'
                              : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[color:var(--detail-ink)] shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-slate-600 dark:text-slate-400' : ''}>
                            {comp}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <section aria-label="공식 판매처 및 관련 링크" className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[color:var(--detail-ink)]" />
                    <span>공식 판매처 및 관련 링크</span>
                  </h4>
                  {isAdmin && onEditGoods && <button type="button" onClick={() => onEditGoods(goods)} className="text-xs text-[color:var(--detail-ink)] hover:underline">링크 수정</button>}
                </div>
                {purchaseLinks.length ? <div className="grid grid-cols-1 gap-2">
                  {purchaseLinks.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--detail-border)] bg-[var(--detail-soft)] p-3 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--detail-ink)]">
                    <span className="min-w-0"><span className="block break-words text-xs font-bold text-[color:var(--detail-ink)]">{link.label}</span><span className="block truncate text-[10px] text-slate-600 dark:text-slate-300">{new URL(link.url).hostname}</span></span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[color:var(--detail-ink)]" aria-hidden="true" />
                  </a>)}
                </div> : <p className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs text-slate-600 dark:text-slate-300">아직 등록된 링크가 없습니다.</p>}
              </section>

              {/* Size specification */}
              {goods.specs?.size && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[color:var(--detail-ink)]" />
                    <span>제작 스펙 (Specifications)</span>
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 block">규격 / 사이즈</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">{goods.specs.size}</span>
                  </div>
                </div>
              )}

              {/* Personal Notes / Collector Log */}
              <div className="space-y-2 p-4 bg-[var(--detail-soft)] rounded-xl border border-[color:var(--detail-border)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[color:var(--detail-ink)] flex items-center gap-1.5">
                    <span>📝</span>
                    <span>나의 보관 일기 / 소장 메모</span>
                  </span>
                  {!isEditingNote && (
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="text-xs text-[color:var(--detail-ink)] hover:underline font-medium"
                    >
                      {noteText ? '수정하기' : '+ 메모 작성'}
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="구입 경로, 실물 감상평, 보관 위치 등을 자유롭게 기록하세요..."
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border border-[color:var(--detail-border)] bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--detail-border)]"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsEditingNote(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-3 py-1 text-xs bg-[var(--detail-action)] text-white font-medium rounded hover:bg-[var(--detail-action-hover)]"
                      >
                        저장하기
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    {goods.userNote ? `"${goods.userNote}"` : '아직 작성된 개인 메모가 없습니다.'}
                  </p>
                )}
              </div>

              {/* Interactive Tag Section & Tag Editor */}
              <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[color:var(--detail-ink)]" />
                    <span>굿즈 태그 목록 ({goods.tags?.length || 0})</span>
                  </span>
                  <button
                    onClick={() => setIsEditingTags(!isEditingTags)}
                    className="text-xs text-[color:var(--detail-ink)] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingTags ? '태그 편집 완료' : '태그 추가 / 수정'}</span>
                  </button>
                </div>

                {/* Display Current Tags (Click to search / filter) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {(goods.tags && goods.tags.length > 0) ? (
                    goods.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs group hover:border-[color:var(--detail-border)] transition-all"
                      >
                        <span
                          className="cursor-pointer hover:text-[color:var(--detail-ink)]"
                          onClick={() => {
                            if (onSelectTag) {
                              onSelectTag(tag);
                              onClose();
                            }
                          }}
                          title="이 태그로 도감 필터링"
                        >
                          #{tag}
                        </span>
                        {isEditingTags && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-0.5 rounded transition-colors dark:text-slate-300"
                            title="태그 삭제"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 dark:text-slate-300">등록된 태그가 없습니다.</span>
                  )}
                </div>

                {/* Tag Input Form if Editing */}
                {isEditingTags && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs font-mono dark:text-slate-300">#</span>
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="새 태그 입력 후 엔터 (예: 한정판, 실물깡패)"
                          className="w-full pl-6 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[color:var(--detail-border)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddTag()}
                        className="px-3 py-1.5 bg-[var(--detail-action)] hover:bg-[var(--detail-action-hover)] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>추가</span>
                      </button>
                    </div>

                    {/* Popular Tag Quick Add suggestions */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 mr-1">추천 태그:</span>
                      {popularTagSuggestions
                        .filter((st) => !(goods.tags || []).includes(st))
                        .slice(0, 6)
                        .map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleAddTag(sug)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--detail-soft)] text-[color:var(--detail-ink)] hover:bg-[var(--detail-soft)] transition-colors"
                          >
                            +{sug}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Outlink & Social Share */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>링크 복사</span>
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-xl transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>X(트위터) 공유</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
