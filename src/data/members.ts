import { MemberId, MemberInfo, CategoryItem } from '../types';

export const MEMBERS: Record<MemberId, MemberInfo> = {
  all: {
    id: 'all',
    name: '전체',
    nameEn: 'ALL',
    color: '#8A2BE2',
    accentColor: '#9333EA',
    bgLight: 'rgba(138, 43, 226, 0.06)',
    bgDark: 'rgba(138, 43, 226, 0.18)',
    borderColor: 'rgba(138, 43, 226, 0.25)',
    fanClub: '이파리 (WAKTA FAMILY)',
    quote: '이세계에서 온 여섯 명의 별들의 모든 기록',
    symbol: '🌿',
  },
  ine: {
    id: 'ine',
    name: '아이네',
    nameEn: 'INE',
    color: '#8A2BE2',
    accentColor: '#A855F7',
    bgLight: '#FAF5FF',
    bgDark: 'rgba(138, 43, 226, 0.16)',
    borderColor: '#E9D5FF',
    fanClub: '둘기',
    quote: '우아한 보이스와 감성의 맏언니',
    symbol: '🕊️',
  },
  jingburger: {
    id: 'jingburger',
    name: '징버거',
    nameEn: 'JINGBURGER',
    color: '#F59E0B',
    accentColor: '#FBBF24',
    bgLight: '#FFFBEB',
    bgDark: 'rgba(245, 158, 11, 0.16)',
    borderColor: '#FDE68A',
    fanClub: '똥강아지',
    quote: '달콤바삭하고 귀여운 황금빛 매력',
    symbol: '🐶',
  },
  lilpa: {
    id: 'lilpa',
    name: '릴파',
    nameEn: 'LILPA',
    color: '#2563EB',
    accentColor: '#60A5FA',
    bgLight: '#EFF6FF',
    bgDark: 'rgba(37, 99, 235, 0.18)',
    borderColor: '#BFDBFE',
    fanClub: '박쥐단',
    quote: '무대를 압도하는 폭발적 에너지와 열정',
    symbol: '🦇',
  },
  jururu: {
    id: 'jururu',
    name: '주르르',
    nameEn: 'JURURU',
    color: '#EC4899',
    accentColor: '#F472B6',
    bgLight: '#FDF2F8',
    bgDark: 'rgba(236, 72, 153, 0.16)',
    borderColor: '#FBCFE8',
    fanClub: '주폭도',
    quote: '사랑스러움과 로맨틱을 노래하는 여우',
    symbol: '🦊',
  },
  gosegu: {
    id: 'gosegu',
    name: '고세구',
    nameEn: 'GOSEGU',
    color: '#0284C7',
    accentColor: '#38BDF8',
    bgLight: '#F0F9FF',
    bgDark: 'rgba(2, 132, 199, 0.18)',
    borderColor: '#BAE6FD',
    fanClub: '세균단',
    quote: '킹받지만 미워할 수 없는 천재 아이돌',
    symbol: '😸',
  },
  viichan: {
    id: 'viichan',
    name: '비챤',
    nameEn: 'VIICHAN',
    color: '#65A30D',
    accentColor: '#A3E635',
    bgLight: '#F7FEE7',
    bgDark: 'rgba(101, 163, 13, 0.18)',
    borderColor: '#D9F99D',
    fanClub: '라니',
    quote: '싱그러운 스프링버드, 감성 충만한 황금막내',
    symbol: '🦌',
  },
  group: {
    id: 'group',
    name: '단체',
    nameEn: 'ISEGYE IDOL',
    color: '#7C3AED',
    accentColor: '#A78BFA',
    bgLight: '#FAF5FF',
    bgDark: 'rgba(124, 58, 237, 0.18)',
    borderColor: '#DDD6FE',
    fanClub: '이파리',
    quote: '하나되어 영원히 빛나는 이세계아이돌',
    symbol: '🌈',
  },
};

export const ISEGYE_RAINBOW_GRADIENT = 'linear-gradient(90deg, #8A2BE2 0%, #2563EB 20%, #0284C7 40%, #10B981 60%, #F59E0B 80%, #EC4899 100%)';
export const ISEGYE_RAINBOW_GRADIENT_V = 'linear-gradient(180deg, #8A2BE2 0%, #2563EB 20%, #0284C7 40%, #10B981 60%, #F59E0B 80%, #EC4899 100%)';


export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'figure', label: '피규어 / 아크릴', icon: '✨', isDefault: true },
  { id: 'album', label: '음반 / LP', icon: '🎵', isDefault: true },
  { id: 'apparel', label: '의류 / 잡화', icon: '👕', isDefault: true },
  { id: 'stationery', label: '문구 / 팬시', icon: '📝', isDefault: true },
  { id: 'digital', label: '디지털 / 보이스', icon: '🎧', isDefault: true },
];

export const RARITIES = [
  { id: 'all', label: '전체' },
  { id: 'Official', label: '공식' },
  { id: 'Collab', label: '콜라보' },
  { id: 'Fanmade', label: '팬메이드' },
] as const;

export const RARITY_LABELS: Record<string, string> = {
  all: '전체',
  Official: '공식',
  Limited: '한정판',
  Legendary: '레전더리',
  Collab: '콜라보',
  Fanmade: '팬메이드',
};

export const getRarityLabel = (rarity: string, kinds?: {id:string;label:string}[]): string => {
  return kinds?.find(kind => kind.id === rarity)?.label || RARITY_LABELS[rarity] || rarity;
};

