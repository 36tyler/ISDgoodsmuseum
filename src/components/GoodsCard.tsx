import { hasLegendaryBadge, getGoodsKind, getGoodsCategories } from '../utils/goodsKind';
import React, { useState } from 'react';
import { Heart, BookmarkCheck, ExternalLink, Sparkles, Check, Stamp, Crown, Edit3 } from 'lucide-react';
import { GoodsItem, CategoryItem } from '../types';
import { MEMBERS, getRarityLabel, ISEGYE_RAINBOW_GRADIENT, ISEGYE_RAINBOW_GRADIENT_V } from '../data/members';
import { StampSeal } from './StampEffect';
import { soundEffects } from '../utils/audio';

interface GoodsCardProps {
  goods: GoodsItem;
  viewMode: 'grid' | 'list';
  categories?: CategoryItem[];
  kindOptions?: CategoryItem[];
  onOpenDetail: (goods: GoodsItem) => void;
  onToggleOwned: (id: string, e: React.MouseEvent) => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectTag?: (tag: string, e: React.MouseEvent) => void;
  isFavorited: boolean;
  isAdmin?: boolean;
  onEditGoods?: (goods: GoodsItem) => void;
}

export const GoodsCard: React.FC<GoodsCardProps> = ({
  goods,
  viewMode,
  categories = [],
  kindOptions,
  onOpenDetail,
  onToggleOwned,
  onToggleWishlist,
  onToggleFavorite,
  onSelectTag,
  isFavorited,
  isAdmin = false,
  onEditGoods,
}) => {
  const [isAnimatingStamp, setIsAnimatingStamp] = useState(false);

  const member = MEMBERS[goods.memberId] || MEMBERS.all;
  const categoryLabel = getGoodsCategories(goods).map(id => categories.find(category => category.id === id)?.label || id).join(' · ');

  const isLegendary = hasLegendaryBadge(goods);

  const handleStampClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!goods.isOwned) {
      soundEffects.playStampSound();
      setIsAnimatingStamp(true);
      setTimeout(() => setIsAnimatingStamp(false), 600);
    } else {
      soundEffects.playUnstampSound();
    }
    onToggleOwned(goods.id, e);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onOpenDetail(goods)}
        className={`group relative bg-white dark:bg-slate-900 rounded-xl transition-all p-3 sm:p-4 flex items-center gap-4 cursor-pointer overflow-hidden ${
          isLegendary
            ? 'border-2 border-amber-400 dark:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-300/60 bg-gradient-to-r from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'
            : 'border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
        }`}
      >
        {/* Member Accent Edge Line */}
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{
            background:
              goods.memberId === 'group'
                ? ISEGYE_RAINBOW_GRADIENT_V
                : isLegendary
                ? '#F59E0B'
                : member.color,
          }}
        />

        {/* Thumbnail Image with Stamp overlay */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={goods.imageUrl}
            alt={goods.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />

          {/* Stamp Seal on Image */}
          {(goods.isOwned || isAnimatingStamp) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <StampSeal size="sm" isStamping={isAnimatingStamp} />
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Metadata line (Zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
            {goods.memberId === 'group' ? (
              <span className="font-extrabold bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
                {member.name}
              </span>
            ) : (
              <span className="font-semibold" style={{ color: "color-mix(in srgb, " + member.color + ", var(--member-ink-mix) var(--member-ink-amount))" }}>
                {member.name}
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>{categoryLabel}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>{goods.releaseYear}년</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isLegendary
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500 shadow-2xs'
                  : goods.rarity === 'Limited'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {isLegendary && '👑 '}{getRarityLabel(getGoodsKind(goods.rarity), kindOptions)}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
            {goods.title}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-1">
            {goods.description}
          </p>

          {/* Tags preview */}
          {goods.tags && goods.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {goods.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    if (onSelectTag) {
                      e.stopPropagation();
                      onSelectTag(tag, e);
                    }
                  }}
                  className="text-[10px] text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
              {goods.tags.length > 3 && (
                <span className="text-[10px] text-slate-600 dark:text-slate-300">+{goods.tags.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              ₩{goods.originalPrice.toLocaleString()}
            </span>
            {goods.currentMarketPrice && goods.currentMarketPrice > goods.originalPrice && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                시세 ₩{goods.currentMarketPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions Column */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Admin direct Edit button */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditGoods?.(goods);
              }}
              className="px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-2xs"
              title="관리자: 이 글(굿즈) 내용 전체 수정"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>수정</span>
            </button>
          )}

          {/* 소장완료 도장 버튼 */}
          <button
            onClick={handleStampClick}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              goods.isOwned
                ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-200 dark:ring-rose-950 scale-102'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
            }`}
            title={goods.isOwned ? '소장 취소' : '소장완료 도장 쾅! 찍기'}
          >
            <Stamp className={`w-3.5 h-3.5 ${goods.isOwned ? 'rotate-[-12deg]' : ''}`} />
            <span>{goods.isOwned ? '소장완료' : '소장하기'}</span>
          </button>

          <button
            onClick={(e) => onToggleWishlist(goods.id, e)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              goods.isWishlist
                ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="위시리스트"
          >
            <Heart className={`w-4 h-4 ${goods.isWishlist ? 'text-pink-500 fill-pink-500' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // Grid view (Standard high-end card)
  return (
    <div
      onClick={() => onOpenDetail(goods)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl flex flex-col overflow-hidden cursor-pointer transition-all duration-300 ${
        isLegendary
          ? 'border-2 border-amber-400 dark:border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.28)] ring-2 ring-amber-300/40 hover:shadow-[0_0_32px_rgba(245,158,11,0.4)]'
          : 'border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      {/* Member Color, Rainbow (단체), or Gold Legendary Top Highlight Stripe */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{
          background:
            goods.memberId === 'group'
              ? ISEGYE_RAINBOW_GRADIENT
              : isLegendary
              ? 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B, #D97706)'
              : `linear-gradient(90deg, ${member.color}, ${member.accentColor})`,
        }}
      />

      {/* Image Container with aspect ratio */}
      <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={goods.imageUrl}
          alt={goods.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite button (top right) */}
        <button
          onClick={(e) => onToggleFavorite(goods.id, e)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-xs z-10 ${
            isFavorited
              ? 'bg-rose-500/90 text-white'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 hover:text-rose-500'
          }`}
          title="좋아요"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Legendary Badge or Staff Pick Badge */}
        {isLegendary ? (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md z-10 border border-amber-200/90 tracking-tight">
            <Crown className="w-3 h-3 fill-slate-950 text-slate-950" />
            <span>레전더리</span>
          </div>
        ) : goods.isStaffPick ? (
          <div className="absolute top-2.5 left-2.5 bg-slate-900/85 dark:bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1 shadow-xs z-10">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>대표 굿즈</span>
          </div>
        ) : null}

        {/* Prominent Stamp Seal Effect Overlay */}
        {(goods.isOwned || isAnimatingStamp) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <StampSeal size="md" isStamping={isAnimatingStamp} />
            {isAnimatingStamp && (
              <div className="absolute w-32 h-32 sm:w-38 sm:h-38 rounded-full border-4 border-rose-500/80 animate-ink-pulse pointer-events-none" />
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata line: Zero-pill discipline */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1.5">
            {goods.memberId === 'group' ? (
              <span className="font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 bg-clip-text text-transparent">
                {member.name}
              </span>
            ) : (
              <span
                className="font-bold tracking-tight"
                style={{ color: "color-mix(in srgb, " + member.color + ", var(--member-ink-mix) var(--member-ink-amount))" }}
              >
                {member.name}
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>{categoryLabel}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>{goods.releaseYear}년</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isLegendary
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500 shadow-2xs'
                  : goods.rarity === 'Limited'
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {isLegendary && '👑 '}{getRarityLabel(getGoodsKind(goods.rarity), kindOptions)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
            {goods.title}
          </h3>

          {/* Brief Lore / Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {goods.description}
          </p>

          {/* Tags preview */}
          {goods.tags && goods.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {goods.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  onClick={(e) => {
                    if (onSelectTag) {
                      e.stopPropagation();
                      onSelectTag(tag, e);
                    }
                  }}
                  className="text-[10px] text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
              {goods.tags.length > 3 && (
                <span className="text-[10px] text-slate-600 dark:text-slate-300">+{goods.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Price & Prominent Stamp Button */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Price */}
          <div className="min-w-0">
            <span className="text-xs text-slate-600 dark:text-slate-400 block font-sans">공식 정가</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              ₩{goods.originalPrice.toLocaleString()}
            </span>
          </div>

          {/* Action buttons with '소장완료' Stamp Action */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {isAdmin && onEditGoods && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditGoods(goods);
                }}
                className="px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-white border border-amber-500/30 transition-all shadow-2xs"
                title="관리자: 이 글 수정하기"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>수정</span>
              </button>
            )}

            <button
              onClick={handleStampClick}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                goods.isOwned
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20 ring-2 ring-rose-200 dark:ring-rose-950 scale-102'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
              }`}
              title={goods.isOwned ? '소장 취소' : '소장완료 도장 쾅! 찍기'}
            >
              <Stamp className={`w-3.5 h-3.5 ${goods.isOwned ? 'rotate-[-12deg]' : ''}`} />
              <span>{goods.isOwned ? '소장완료' : '소장하기'}</span>
            </button>

            <button
              onClick={(e) => onToggleWishlist(goods.id, e)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                goods.isWishlist
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-600'
              }`}
              title={goods.isWishlist ? '위시리스트 해제' : '위시리스트 추가'}
            >
              <Heart className={`w-3.5 h-3.5 ${goods.isWishlist ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
