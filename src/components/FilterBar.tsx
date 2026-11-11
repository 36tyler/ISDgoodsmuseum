import { DEFAULT_GOODS_KINDS } from '../utils/goodsKinds';
import React from 'react';
import { LayoutGrid, List, RotateCcw, ChevronDown, Check, Settings2, Plus, Crown } from 'lucide-react';
import { CategoryItem, Rarity } from '../types';

export type SortOption = 'newest' | 'oldest' | 'popular' | 'title';

export type ViewMode = 'grid' | 'list';

interface FilterBarProps {
  categories: CategoryItem[];
  kindOptions?: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedRarity: string;
  onSelectRarity: (rarity: string) => void;
  selectedYear: string;
  onSelectYear: (year: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onManageCategories?: () => void;
  isAdmin?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  kindOptions = DEFAULT_GOODS_KINDS,
  selectedCategory,
  onSelectCategory,
  selectedRarity,
  onSelectRarity,
  selectedYear,
  onSelectYear,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
  onResetFilters,
  hasActiveFilters,
  onManageCategories,
  isAdmin = false,
}) => {
  const years = ['all', '2024', '2023', '2022', '2021'];

  return (
    <div className="py-4 space-y-3">
      {/* Category horizontal scrolling bar */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl shrink-0">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750'
            }`}
          >
            전체 카테고리
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-750'
                }`}
              >
                {cat.icon && <span className="text-xs">{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            );
          })}

          {/* If admin, quick category manager trigger button */}
          {isAdmin && onManageCategories && (
            <button
              onClick={onManageCategories}
              className="px-2 py-1.5 text-xs text-black dark:text-slate-100 hover:bg-purple-100 dark:hover:bg-purple-950/60 rounded-lg transition-colors flex items-center gap-1 font-semibold whitespace-nowrap border border-dashed border-purple-300 dark:border-purple-700 ml-1"
              title="카테고리 추가 및 수정"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>카테고리 수정</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 hidden sm:flex">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 transition-all ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            title="그리드 뷰 (도감형)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-400 transition-all ${
              viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            title="리스트 뷰 (매거진형)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-filters row: Rarity Select, Year, Sort, Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          {/* Rarity Select */}
          <div className="relative inline-block">
            <select
              aria-label="종류"
              value={selectedRarity}
              onChange={(e) => onSelectRarity(e.target.value)}
              className="appearance-none rounded-lg pl-3 pr-7 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer shadow-2xs transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {[{id:'all',label:'전체'}, ...kindOptions].map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-300" />
          </div>

          {isAdmin && <button type="button" onClick={onManageCategories} className="px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 underline underline-offset-2">종류 수정</button>}

          {/* Release Year Select */}
          <div className="relative inline-block">
            <select
              value={selectedYear}
              onChange={(e) => onSelectYear(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer shadow-2xs"
            >
              <option value="all">모든 발매연도</option>
              {years.filter(y => y !== 'all').map((y) => (
                <option key={y} value={y}>
                  {y}년 발매
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-300" />
          </div>

          {/* Sort By Select */}
          <div className="relative inline-block">
            <select
              aria-label="정렬 기준"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer shadow-2xs"
            >
              <option value="popular">인기순</option>
              <option value="newest">최신순</option>
              <option value="oldest">날짜순</option>
              <option value="title">상품명</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none dark:text-slate-300" />
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-black dark:text-slate-100 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>

        {/* Counter Info */}
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1.5">
          <span>검색결과:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredCount}</span>
          <span>/</span>
          <span>전체 {totalCount}개</span>
        </div>
      </div>
    </div>
  );
};
