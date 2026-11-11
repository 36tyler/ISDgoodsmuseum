import React from 'react';

export const GOODS_PAGE_SIZE = 12;

export function GoodsPagination({ page, pageCount, total, onChange }: {
  page: number; pageCount: number; total: number; onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from(new Set([1, page - 1, page, page + 1, pageCount]))
    .filter(number => number >= 1 && number <= pageCount).sort((a, b) => a - b);
  const base = 'min-h-10 min-w-10 px-2 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500';
  const inactive = 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700';
  return <nav aria-label="굿즈 페이지" className="mt-8 flex flex-col items-center gap-3">
    <p className="text-xs text-slate-600 dark:text-slate-300" role="status">{(page - 1) * GOODS_PAGE_SIZE + 1}–{Math.min(page * GOODS_PAGE_SIZE, total)} / 총 {total}개</p>
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" aria-label="이전 페이지" aria-controls="goods-results" disabled={page === 1} onClick={() => onChange(page - 1)} className={`${base} ${inactive} disabled:opacity-40 disabled:cursor-not-allowed`}>이전</button>
      {pages.map((number, index) => <React.Fragment key={number}>
        {index > 0 && number - pages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-slate-600 dark:text-slate-300">…</span>}
        <button type="button" aria-label={`${number}페이지`} aria-controls="goods-results" aria-current={page === number ? 'page' : undefined} onClick={() => onChange(number)} className={`${base} ${page === number ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : inactive}`}>{number}</button>
      </React.Fragment>)}
      <button type="button" aria-label="다음 페이지" aria-controls="goods-results" disabled={page === pageCount} onClick={() => onChange(page + 1)} className={`${base} ${inactive} disabled:opacity-40 disabled:cursor-not-allowed`}>다음</button>
    </div>
  </nav>;
}
