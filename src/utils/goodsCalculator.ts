import { GoodsItem, MemberId } from '../types';
import { MEMBERS } from '../data/members';
import { getGoodsKind } from './goodsKind';
export const MAX_GOODS_QUANTITY = 999;
export function normalizeQuantity(value: number): number {
  return Number.isFinite(value) ? Math.min(MAX_GOODS_QUANTITY, Math.max(0, Math.floor(value))) : 0;
}
export function getCalculatorLines(goods: GoodsItem[], quantities: Record<string, number>) {
  return goods.flatMap(item => {
    const quantity = normalizeQuantity(quantities[item.id] || 0);
    const unitPrice = Number.isFinite(item.originalPrice) && item.originalPrice >= 0 ? item.originalPrice : 0;
    return quantity ? [{ item, quantity, unitPrice, subtotal: unitPrice * quantity }] : [];
  });
}

export function filterCalculatorGoods(goods: GoodsItem[], filters: {query: string; kind: string; member: MemberId}) {
  const term = filters.query.trim().toLocaleLowerCase();
  return goods.filter(item =>
    (filters.member === 'all' || item.memberId === filters.member) &&
    (filters.kind === 'all' || getGoodsKind(item.rarity) === filters.kind) &&
    `${item.title} ${MEMBERS[item.memberId]?.name || ''}`.toLocaleLowerCase().includes(term)
  );
}
