export type MemberId = 'all' | 'ine' | 'jingburger' | 'lilpa' | 'jururu' | 'gosegu' | 'viichan' | 'group';

export interface CategoryItem {
  id: string;
  label: string;
  icon?: string;
  isDefault?: boolean;
}

export type Rarity = 'Official' | 'Limited' | 'Legendary' | 'Collab' | 'Fanmade' | (string & {});

export type UserRole = 'admin' | 'collector';

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  biasMember: MemberId;
  avatar?: string;
  joinedDate: string;
}

export interface MemberInfo {
  id: MemberId;
  name: string;
  nameEn: string;
  color: string; // Primary hex
  accentColor: string; // Secondary/darker
  bgLight: string; // Subtle tint background (light mode)
  bgDark: string; // Subtle tint background (dark mode)
  borderColor: string;
  fanClub: string; // 둘기, 똥강아지, 박쥐단, 주폭도, 세균단, 라니
  quote: string;
  symbol: string;
}

export interface GoodsSpecs {
  size?: string;
  material?: string;
  publisher?: string;
  serialNo?: string;
}

export type SaleStatus = 'upcoming' | 'on-sale' | 'ended';

export interface GoodsItem {
  id: string;
  title: string;
  memberId: MemberId;
  category: string; // Primary category (legacy compatibility)
  categoryIds?: string[];
  rarity: Rarity;
  isLegendary?: boolean; // 종류와 독립적인 레전더리 표시
  releaseDate: string; // YYYY.MM.DD
  releaseYear: number;
  originalPrice: number; // KRW
  saleStatus?: SaleStatus;
  currentMarketPrice?: number; // KRW
  imageUrl: string;
  additionalImages?: string[];
  description: string;
  components: string[]; // 구성품 목록
  officialUrl?: string;
  relatedLinks?: { label: string; url: string }[];
  tags: string[]; // Dynamic tags list
  specs?: GoodsSpecs;
  checkedComponentIndices?: number[];
  isOwned?: boolean; // 소장 여부
  isWishlist?: boolean; // 위시리스트
  userNote?: string; // 개인 메모
  favoriteCount: number;
  isStaffPick?: boolean;
}

export interface MemberStoryItem {
  quote?: string;
  storyTitle?: string;
  storySubtitle?: string;
  storyContent?: string;
  storyNotice?: string;
}

export interface NewsItem {
  imageUrls?: string[];
  links?: { url: string; label: string }[];
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  date: string; // YYYY.MM.DD
  tag?: string; // '공지' | '신규 굿즈' | '이벤트' | '업데이트' 등
  isPinned?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  type?: string; // 'MV' | 'Live' | 'Cover' | 'Clip' | string
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
}

export interface MemberProfileData {
  id: MemberId;
  name?: string;
  photoUrl: string;
  role: string;
  height: string;
  birthday: string;
  mbti: string;
  quote?: string;
  strengths: string[];
  signatureSongs: string[];
  lore: string;
  youtubeVideos: VideoItem[];
  customLinks: LinkItem[];
}

export interface AboutIsegyeConfig {
  groupBannerUrl?: string;
  groupHeadline?: string;
  groupDescription?: string;
  debutDate?: string;
  producer?: string;
  agency?: string;
  agencyLabel?: string;
  chartRecord?: string;
  fandomName?: string;
  youtubeVideos: VideoItem[];
  customLinks: LinkItem[];
  members: Record<string, MemberProfileData>;
}

export interface SiteTexts {
  headerBadge?: string;
  tabAllLabel?: string;
  tabOwnedLabel?: string;
  tabWishlistLabel?: string;
  aboutButtonLabel?: string;
  searchPlaceholder?: string;
  statsTotalGoodsLabel?: string;
  statsTotalUnit?: string;
  statsCollectionRateLabel?: string;
  statsWishlistLabel?: string;
  statsWishlistUnit?: string;
  emptySearchTitle?: string;
  emptySearchDesc?: string;
  footerDesc?: string;
  footerDisclaimer?: string;
  footerCopyright?: string;
  wakzooLinkLabel?: string;
  youtubeLinkLabel?: string;
  tagFilterActiveText?: string;
  ownedTabAnnouncement?: string;
  wishlistTabAnnouncement?: string;
}

export interface CustomGradientConfig {
  enabled: boolean;
  presetId?: string;
  name?: string;
  direction: 'to-r' | 'to-br' | 'to-b' | 'to-tr' | 'to-l' | 'custom-angle';
  angle: number; // 0 ~ 360
  fromColor: string;
  viaColor?: string;
  toColor: string;
  applyTarget: 'title' | 'hero' | 'background' | 'accent' | 'all';
  textGradientEnabled: boolean;
  bgGradientEnabled: boolean;
  headerGradientEnabled: boolean;
  cardBorderGradientEnabled: boolean;
  buttonGradientEnabled?: boolean;
  opacity?: number; // 0.1 ~ 1.0 for background tint
  colorMode?: 'gradient' | 'solid'; // 'gradient' or 'solid' (단색 모드)
  solidColor?: string; // 단색 (기본: #8A2BE2)
  textSolidColor?: string; // 텍스트 단색
  bgSolidColor?: string; // 배경 앰비언트 단색
}

export interface SiteConfig {
  goodsKinds?: CategoryItem[];
  siteTitle: string;
  siteSubtitle: string;
  heroHeadline: string;
  heroDescription: string;
  storyTitle?: string;
  storySubtitle?: string;
  storyContent?: string;
  storyNotice?: string;
  memberStories?: Record<string, MemberStoryItem>;
  aboutIsegye?: AboutIsegyeConfig;
  siteTexts?: SiteTexts;
  customGradient?: CustomGradientConfig;
  accentTheme: MemberId | 'custom' | 'default';
  fontFamily?: 'pretendard' | 'gmarket' | 'myeongjo' | 'kotra' | 'noto' | string;
  cardDensity: 'compact' | 'normal' | 'relaxed';
  showHeroBanner: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  officialLinks: {
    wakzoo: string;
    youtube: string;
    twitter: string;
    weverse: string;
  };
}
