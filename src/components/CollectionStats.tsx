import React from 'react';
import { Layers, CheckCircle2, Heart } from 'lucide-react';
import { SiteConfig } from '../types';
import { renderCustomText } from '../utils/textFormatter';

export function CollectionStats({ config, totalCount, ownedCount, wishlistCount }: {
  config: SiteConfig; totalCount: number; ownedCount: number; wishlistCount: number;
}) {
  const ownedPercentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;
  return (
          <div aria-label="소장품 통계" className="grid grid-cols-3 gap-2.5 sm:gap-3 py-3">
            {/* Total Goods */}
            <div className="bg-white dark:bg-slate-800/90 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span className="text-[11px] sm:text-xs font-medium">
                  {renderCustomText(config.siteTexts?.statsTotalGoodsLabel || '전체 굿즈')}
                </span>
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">
                  {renderCustomText(config.siteTexts?.statsTotalUnit || '품목')}
                </span>
              </div>
            </div>

            {/* Owned Progress */}
            <div className="bg-white dark:bg-slate-800/90 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span className="text-[11px] sm:text-xs font-medium">
                  {renderCustomText(config.siteTexts?.statsCollectionRateLabel || '나의 수집률')}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{ownedPercentage}%</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">({ownedCount})</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${ownedPercentage}%` }}
                />
              </div>
            </div>

            {/* Wishlist count */}
            <div className="bg-white dark:bg-slate-800/90 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1">
                <span className="text-[11px] sm:text-xs font-medium">
                  {renderCustomText(config.siteTexts?.statsWishlistLabel || '위시리스트')}
                </span>
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{wishlistCount}</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">
                  {renderCustomText(config.siteTexts?.statsWishlistUnit || '소장희망')}
                </span>
              </div>
            </div>
          </div>
  );
}
