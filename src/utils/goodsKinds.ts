import { CategoryItem } from '../types';
export const DEFAULT_GOODS_KINDS: CategoryItem[] = [
  {id:'Official',label:'공식'}, {id:'Collab',label:'콜라보'}, {id:'Fanmade',label:'팬메이드'},
];
export function getGoodsKinds(value?: CategoryItem[]): CategoryItem[] {
  if (!Array.isArray(value)) return DEFAULT_GOODS_KINDS;
  const seen = new Set<string>();
  const valid = value.filter(item => item && typeof item.id === 'string' && item.id.trim() && !['all','Limited','Legendary'].includes(item.id) && typeof item.label === 'string' && item.label.trim() && !seen.has(item.id) && !!seen.add(item.id));
  return valid.length ? valid.map(item => ({id:item.id,label:item.label.trim()})) : DEFAULT_GOODS_KINDS;
}
