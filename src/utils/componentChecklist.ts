import { GoodsItem } from '../types';

export function validComponentChecks(goods: GoodsItem, indices: number[]): number[] {
  return [...new Set(indices)].filter(index => Number.isInteger(index) && index >= 0 && index < (goods.components || []).length).sort((a, b) => a - b);
}

export function getComponentChecks(goods: GoodsItem): number[] {
  return goods.isOwned ? (goods.components || []).map((_, index) => index) : validComponentChecks(goods, goods.checkedComponentIndices || []);
}

export function withComponentChecks(goods: GoodsItem, indices: number[]): GoodsItem {
  const checkedComponentIndices = validComponentChecks(goods, indices);
  const isOwned = goods.components?.length ? checkedComponentIndices.length === goods.components.length : Boolean(goods.isOwned);
  return { ...goods, checkedComponentIndices, isOwned, isWishlist: isOwned ? false : goods.isWishlist };
}
