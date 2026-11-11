import { GoodsItem } from '../types';

export function isWebUrl(value: string): boolean {
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
}

export function getGoodsLinks(goods: GoodsItem): { label: string; url: string }[] {
  const links = [
    ...(goods.officialUrl ? [{ label: '공식 판매처', url: goods.officialUrl }] : []),
    ...(goods.relatedLinks || []),
  ];
  const seen = new Set<string>();
  return links.filter(link => isWebUrl(link.url.trim())).flatMap(link => {
    const url = new URL(link.url.trim());
    if (seen.has(url.href)) return [];
    seen.add(url.href);
    return [{ url: url.href, label: link.label.trim() || url.hostname }];
  });
}
