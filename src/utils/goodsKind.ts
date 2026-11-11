import { getComponentChecks, withComponentChecks } from './componentChecklist';
import { GoodsItem, Rarity } from '../types';

export function getGoodsKind(rarity: Rarity): string {
  return !rarity || rarity === 'Limited' || rarity === 'Legendary' ? 'Official' : rarity;
}

export function hasLegendaryBadge(goods: GoodsItem): boolean {
  return goods.isLegendary ?? goods.rarity === 'Legendary';
}

export function normalizeGoods(goods: GoodsItem): GoodsItem {
  return { ...withComponentChecks(goods, getComponentChecks(goods)), rarity: getGoodsKind(goods.rarity), isLegendary: hasLegendaryBadge(goods) };
}

export function getGoodsCategories(goods: GoodsItem): string[] {
  return [...new Set(goods.categoryIds?.length ? goods.categoryIds : [goods.category])].filter(Boolean);
}
