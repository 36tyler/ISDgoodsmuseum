import { SaleStatus } from '../types';

export const SALE_STATUSES: { value: SaleStatus; label: string; classes: string }[] = [
  { value: 'upcoming', label: '출시 전', classes: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-700' },
  { value: 'on-sale', label: '판매 중', classes: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700' },
  { value: 'ended', label: '판매 종료', classes: 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-500' },
];

export const getSaleStatus = (value: unknown) => SALE_STATUSES.find(status => status.value === value);
