import { getRarityLabel } from '../data/members';
import { getGoodsKind } from '../utils/goodsKind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, Check, Minus, Plus, Search, Trash2, X } from 'lucide-react';
import { GoodsItem, CategoryItem, MemberId } from '../types';
import { MEMBERS } from '../data/members';
import { filterCalculatorGoods, getCalculatorLines, MAX_GOODS_QUANTITY, normalizeQuantity } from '../utils/goodsCalculator';

const calculatorMembers: MemberId[] = ['all', 'ine', 'jingburger', 'lilpa', 'jururu', 'gosegu', 'viichan', 'group'];
function memberStyle(id: MemberId): React.CSSProperties {
  if (id === 'group') {
    const colors = ['#8A2BE2', '#F59E0B', '#25346e', '#EC4899', '#38BDF8', '#84CC16'];
    const gradient = (base: string, strength: number) => `linear-gradient(110deg, ${colors.map(color => `color-mix(in srgb, ${color} ${strength}%, ${base})`).join(', ')})`;
    return {
      '--calc-color': '#94a3b8', '--calc-border': '#94a3b8',
      '--calc-soft': '#f8fafc', '--calc-dark': '#1e293b',
      '--calc-ink': '#0f172a', '--calc-ink-dark': '#f8fafc',
      '--calc-gradient': gradient('white', 18),
      '--calc-gradient-dark': gradient('#0f172a', 32),
    } as React.CSSProperties;
  }
  const color = id === 'lilpa' ? '#25346e' : (MEMBERS[id] || MEMBERS.all).color;
  return {
    '--calc-color': color,
    '--calc-soft': `color-mix(in srgb, ${color} 8%, white)`,
    '--calc-dark': `color-mix(in srgb, ${color} 22%, #0f172a)`,
    '--calc-ink': `color-mix(in srgb, ${color} 65%, black)`,
    '--calc-ink-dark': `color-mix(in srgb, ${color} 30%, white)`,
    '--calc-border': `color-mix(in srgb, ${color} 45%, #cbd5e1)`,
  } as React.CSSProperties;
}
const memberSurface = 'border-[color:var(--calc-border)] bg-[var(--calc-soft)] dark:bg-[var(--calc-dark)] [background-image:var(--calc-gradient,none)] dark:[background-image:var(--calc-gradient-dark,none)]';
const memberInk = 'text-[color:var(--calc-ink)] dark:text-[color:var(--calc-ink-dark)]';
const won = (value: number) => `₩${value.toLocaleString('ko-KR')}`;
function QuantityInput({ title, quantity, onChange }: { title: string; quantity: number; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(quantity));
  useEffect(() => setDraft(String(quantity)), [quantity]);
  return <input type="number" min="0" max={MAX_GOODS_QUANTITY} step="1" inputMode="numeric"
    aria-label={`${title} 수량`} value={draft}
    onChange={event => { setDraft(event.target.value); if (event.target.value !== '' && Number.isFinite(event.target.valueAsNumber)) onChange(event.target.valueAsNumber); }}
    onBlur={() => { const value = normalizeQuantity(Number(draft)); setDraft(String(value)); onChange(value); }}
    className="w-12 text-center text-sm bg-transparent" />;
}
interface Props { isOpen: boolean; onClose: () => void; goods: GoodsItem[]; kindOptions: CategoryItem[]; }
export function GoodsCalculatorModal({ isOpen, onClose, goods, kindOptions }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [member, setMember] = useState<MemberId>('all');
  useEffect(() => { if (kind !== 'all' && !kindOptions.some(option => option.id === kind)) setKind('all'); }, [kindOptions, kind]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && !dialog?.open) dialog?.showModal();
    if (!isOpen && dialog?.open) dialog.close();
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previousOverflow; if (dialog?.open) dialog.close(); };
    }
  }, [isOpen]);
  const filteredGoods = useMemo(() => filterCalculatorGoods(goods, { query, kind, member }), [goods, query, kind, member]);
  const lines = getCalculatorLines(goods, quantities);
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const setQuantity = (id: string, quantity: number) => setQuantities(previous => {
    const next = { ...previous };
    const normalized = normalizeQuantity(quantity);
    if (normalized) next[id] = normalized; else delete next[id];
    return next;
  });
  const addItem = (id: string) => setQuantities(previous => ({ ...previous, [id]: normalizeQuantity((previous[id] || 0) + 1) }));

  return (
    <dialog ref={dialogRef} aria-labelledby="goods-calculator-title"
      onCancel={event => { event.preventDefault(); onClose(); }}
      className="m-auto w-[calc(100%_-_24px)] max-w-5xl max-h-[92dvh] p-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div>
          <h2 id="goods-calculator-title" className="flex items-center gap-2 text-lg font-bold"><Calculator className="w-5 h-5" />굿즈 비용 계산기</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">목록에서 굿즈를 누를 때마다 수량이 1개씩 늘어납니다.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="계산기 닫기" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
      </header>
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <section aria-label="계산할 굿즈 목록" className="p-4 sm:p-5 md:border-r border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-800">
            <Search className="w-4 h-4 text-slate-500" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="굿즈명 또는 멤버 검색" aria-label="계산할 굿즈 검색" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <label className="flex items-center gap-2 mt-3 text-xs font-bold">종류<select aria-label="계산기 종류" value={kind} onChange={event => setKind(event.target.value)} className="flex-1 rounded-lg px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"><option value="all">전체</option>{kindOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <div role="group" aria-label="계산기 멤버 필터" className="flex flex-wrap gap-1.5 mt-3">
            {calculatorMembers.map(id => <button key={id} type="button" aria-pressed={member === id} onClick={() => setMember(id)} style={memberStyle(id)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${member === id ? `${memberSurface} ${memberInk} ring-1 ring-[var(--calc-border)]` : id === 'group' ? `${memberSurface} ${memberInk}` : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <span aria-hidden="true">{MEMBERS[id].symbol} </span>{MEMBERS[id].name}
            </button>)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 mb-2">전체 굿즈 {goods.length}개 · 검색 결과 {filteredGoods.length}개</p>
          <div className="max-h-[30dvh] md:max-h-[55dvh] overflow-y-auto space-y-2 pr-1">
            {filteredGoods.map(item => {
              const quantity = normalizeQuantity(quantities[item.id] || 0);
              return <button key={item.id} type="button" onClick={() => addItem(item.id)} disabled={quantity >= MAX_GOODS_QUANTITY}
                aria-label={`${item.title} 1개 추가`}
                style={memberStyle(item.memberId)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border border-l-4 border-l-[color:var(--calc-color)] text-left transition-all disabled:opacity-60 ${memberSurface} ${quantity ? 'ring-2 ring-[var(--calc-border)]' : 'hover:brightness-95 dark:hover:brightness-125'}`}>
                <span className="w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center" aria-hidden="true">
                  {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} /> : MEMBERS[item.memberId]?.symbol}
                </span>
                <span className="flex-1 min-w-0"><span className="block text-xs text-slate-600 dark:text-slate-300 mb-1">{MEMBERS[item.memberId]?.name} · {getRarityLabel(getGoodsKind(item.rarity), kindOptions)}</span><span className="block text-sm font-semibold line-clamp-2">{item.title}</span><span className="block text-xs mt-1">{won(Number.isFinite(item.originalPrice) && item.originalPrice >= 0 ? item.originalPrice : 0)}</span></span>
                <span className={`shrink-0 flex items-center gap-1 text-xs font-bold ${memberInk}`}>{quantity ? <><Check className="w-4 h-4" />{quantity}개</> : <Plus className="w-4 h-4" />}</span>
              </button>;
            })}
            {!filteredGoods.length && <p className="text-center py-10 text-sm text-slate-600 dark:text-slate-300">{goods.length ? '검색 결과가 없습니다.' : '등록된 굿즈가 없습니다.'}</p>}
          </div>
        </section>
        <aside aria-label="선택한 굿즈와 총비용" className="p-4 sm:p-5 bg-[#faf6ee] dark:bg-[#29251f]">
          <div className="flex justify-between items-center gap-2 mb-3"><h3 className="font-bold text-sm">선택한 굿즈 <span className="text-slate-600 dark:text-slate-300">{lines.length}종 · {count}개</span></h3>
            <button type="button" onClick={() => setQuantities({})} disabled={!lines.length} className="text-xs underline underline-offset-2 disabled:opacity-40">전체 비우기</button>
          </div>
          <div className="max-h-[25dvh] md:max-h-[43dvh] overflow-y-auto space-y-3 pr-1">
            {!lines.length && <div className="text-sm text-center py-9 text-slate-600 dark:text-slate-300">목록에서 계산할 굿즈를 선택해주세요.</div>}
            {lines.map(({ item, quantity, unitPrice, subtotal }) => <div key={item.id} style={memberStyle(item.memberId)} className={`rounded-xl border border-l-4 border-l-[color:var(--calc-color)] p-3 ${memberSurface}`}>
              <p className={`text-xs font-bold mb-1 ${memberInk}`}>{MEMBERS[item.memberId]?.symbol} {MEMBERS[item.memberId]?.name}</p>
              <div className="flex items-start gap-2"><p className="flex-1 text-sm font-semibold">{item.title}</p><button type="button" onClick={() => setQuantity(item.id, 0)} aria-label={`${item.title} 삭제`} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 className="w-4 h-4" /></button></div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">정가 {won(unitPrice)}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                <div className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                  <button type="button" onClick={() => setQuantity(item.id, quantity - 1)} aria-label={`${item.title} 수량 줄이기`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700"><Minus className="w-3.5 h-3.5" /></button>
                  <QuantityInput title={item.title} quantity={quantity} onChange={value => setQuantity(item.id, value)} />
                  <button type="button" onClick={() => setQuantity(item.id, quantity + 1)} disabled={quantity >= MAX_GOODS_QUANTITY} aria-label={`${item.title} 수량 늘리기`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <p className="font-bold text-sm">{won(subtotal)}</p>
              </div>
            </div>)}
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600 mt-4 pt-4">
            <div className="flex justify-between items-center gap-2" role="status" aria-live="polite" aria-atomic="true"><span className="font-bold text-sm">총비용</span><strong className="text-2xl font-black">{won(total)}</strong></div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">등록된 정가 기준이며 배송비는 포함하지 않습니다.</p>
          </div>
        </aside>
      </div>
    </dialog>
  );
}
