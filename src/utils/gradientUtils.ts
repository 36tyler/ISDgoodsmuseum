import { CustomGradientConfig } from '../types';

export interface GradientPresetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  from: string;
  via?: string;
  to: string;
  angle: number;
}

export const GRADIENT_PRESETS: GradientPresetItem[] = [
  {
    id: 'isegye-aurora',
    name: '🌌 이세돌 오로라 드림',
    category: '시그니처',
    description: '이세돌의 신비로운 밤하늘과 환상적인 오로라 빛',
    from: '#8A2BE2',
    via: '#EC4899',
    to: '#38BDF8',
    angle: 135,
  },
  {
    id: 'rainbow-spectrum',
    name: '🌈 단체 무지개 스펙트럼',
    category: '단체',
    description: '여섯 멤버의 고유 컬러가 조화롭게 어우러진 무지개',
    from: '#8A2BE2',
    via: '#10B981',
    to: '#EC4899',
    angle: 90,
  },
  {
    id: 'ine-violet',
    name: '💜 아이네 로열 바이올렛',
    category: '멤버',
    description: '우아한 보이스와 감성을 상징하는 깊고 매혹적인 보라',
    from: '#7C3AED',
    via: '#A855F7',
    to: '#F472B6',
    angle: 135,
  },
  {
    id: 'jingburger-sunset',
    name: '🍔 징버거 골든 선셋',
    category: '멤버',
    description: '따스하고 달콤바삭한 황금빛 에너지를 담은 선셋',
    from: '#F59E0B',
    via: '#FB923C',
    to: '#EF4444',
    angle: 120,
  },
  {
    id: 'lilpa-ocean',
    name: '🦇 릴파 네온 코발트',
    category: '멤버',
    description: '무대를 압도하는 폭발적 보컬과 시원한 코발트 블루',
    from: '#1D4ED8',
    via: '#3B82F6',
    to: '#38BDF8',
    angle: 135,
  },
  {
    id: 'jururu-rose',
    name: '🎀 주르르 로맨틱 마젠타',
    category: '멤버',
    description: '사랑스럽고 세련된 주폭도의 상징 로맨틱 핫로즈',
    from: '#DB2777',
    via: '#F43F5E',
    to: '#FDA4AF',
    angle: 145,
  },
  {
    id: 'gosegu-mint',
    name: '🦖 고세구 세균단 사이버민트',
    category: '멤버',
    description: '톡톡 튀는 천재 아이돌의 비타민 같은 청량 민트',
    from: '#059669',
    via: '#10B981',
    to: '#84CC16',
    angle: 110,
  },
  {
    id: 'viichan-emerald',
    name: '🌿 비챤 싱그러운 포레스트',
    category: '멤버',
    description: '맑고 싱그러운 감성의 막내 에메랄드 그린',
    from: '#0D9488',
    via: '#14B8A6',
    to: '#86EFAC',
    angle: 135,
  },
  {
    id: 'cyberpunk-neon',
    name: '⚡ 사이버펑크 네온',
    category: '트렌디',
    description: '미래지향적인 네온 블루와 일렉트릭 핑크의 조화',
    from: '#06B6D4',
    via: '#8B5CF6',
    to: '#F43F5E',
    angle: 135,
  },
  {
    id: 'cotton-candy',
    name: '🍬 코튼 캔디 파스텔',
    category: '소프트',
    description: '포근하고 부드러운 파스텔 라벤더 & 베이비 핑크',
    from: '#C084FC',
    via: '#F472B6',
    to: '#93C5FD',
    angle: 120,
  },
  {
    id: 'golden-sunshine',
    name: '👑 럭셔리 샴페인 골드',
    category: '프리미엄',
    description: '박물관 전시품의 품격을 드높이는 황금빛 광채',
    from: '#D97706',
    via: '#F59E0B',
    to: '#FDE047',
    angle: 135,
  },
  {
    id: 'midnight-mystery',
    name: '🌌 딥 미드나잇 인디고',
    category: '다크',
    description: '심해처럼 깊고 몽환적인 다크 인디고 & 바이올렛',
    from: '#1E1B4B',
    via: '#4338CA',
    to: '#7C3AED',
    angle: 150,
  },
];

export interface SolidColorPresetItem {
  id: string;
  name: string;
  category: string;
  hex: string;
  description: string;
}

export const SOLID_COLOR_PRESETS: SolidColorPresetItem[] = [
  { id: 'isegye-violet', name: '👑 시그니처 바이올렛', category: '이세돌', hex: '#8A2BE2', description: '이세계아이돌 대표 시그니처 바이올렛' },
  { id: 'ine-purple', name: '💜 아이네 로열 퍼플', category: '멤버', hex: '#7C3AED', description: '아이네의 우아하고 깊은 보라' },
  { id: 'jingburger-yellow', name: '🍔 징버거 웜 앰버', category: '멤버', hex: '#F59E0B', description: '징버거의 따뜻한 황금빛 오렌지' },
  { id: 'lilpa-blue', name: '🦇 릴파 네온 블루', category: '멤버', hex: '#2563EB', description: '릴파의 폭발적인 파란색' },
  { id: 'jururu-magenta', name: '🎀 주르르 핫 마젠타', category: '멤버', hex: '#DB2777', description: '주르르의 러블리 핫로즈 마젠타' },
  { id: 'gosegu-mint', name: '🦖 고세구 세균단 민트', category: '멤버', hex: '#059669', description: '고세구의 통통 튀는 청량 민트' },
  { id: 'viichan-teal', name: '🌿 비챤 에메랄드 틸', category: '멤버', hex: '#0D9488', description: '비챤의 싱그러운 숲의 에메랄드' },
  { id: 'pure-black', name: '🖤 퓨어 다크 블랙', category: '베이직', hex: '#0F172A', description: '차분하고 선명한 딥 블랙' },
  { id: 'pure-white', name: '🤍 크리스프 화이트', category: '베이직', hex: '#FFFFFF', description: '깨끗하고 눈부신 화이트' },
  { id: 'crimson-red', name: '🔴 크림슨 레드', category: '비비드', hex: '#DC2626', description: '강렬하고 시선을 사로잡는 레드' },
  { id: 'neon-pink', name: '💖 네온 핫핑크', category: '비비드', hex: '#EC4899', description: '화사하고 매혹적인 네온 핑크' },
  { id: 'royal-gold', name: '🌟 찬란한 골드', category: '프리미엄', hex: '#EAB308', description: '황금빛 럭셔리 골드' },
  { id: 'sky-cyan', name: '🩵 스카이 시안', category: '파스텔', hex: '#0284C7', description: '맑고 투명한 하늘빛 시안' },
  { id: 'deep-indigo', name: '🌌 딥 나이트 인디고', category: '다크', hex: '#312E81', description: '깊은 밤하늘의 다크 인디고' },
  { id: 'fresh-lime', name: '🍃 싱그러운 라임', category: '비비드', hex: '#65A30D', description: '생동감 넘치는 라임 그린' },
  { id: 'modern-gray', name: '🩶 모던 쿨 그레이', category: '베이직', hex: '#475569', description: '단정하고 세련된 쿨 그레이' },
];

export const DEFAULT_CUSTOM_GRADIENT: CustomGradientConfig = {
  enabled: false,
  presetId: 'isegye-aurora',
  name: '이세돌 오로라 드림',
  direction: 'to-r',
  angle: 135,
  fromColor: '#8A2BE2',
  viaColor: '#EC4899',
  toColor: '#38BDF8',
  applyTarget: 'all',
  textGradientEnabled: true,
  bgGradientEnabled: true,
  headerGradientEnabled: true,
  cardBorderGradientEnabled: true,
  buttonGradientEnabled: true,
  opacity: 0.35,
  colorMode: 'gradient',
  solidColor: '#8A2BE2',
  textSolidColor: '#8A2BE2',
  bgSolidColor: '#8A2BE2',
};

/**
 * Builds CSS linear-gradient string from CustomGradientConfig
 */
export function getGradientCss(config?: CustomGradientConfig): string {
  if (!config) return 'linear-gradient(135deg, #8A2BE2 0%, #EC4899 50%, #38BDF8 100%)';
  const angle = config.angle !== undefined ? config.angle : 135;
  const from = config.fromColor || '#8A2BE2';
  const to = config.toColor || '#38BDF8';
  if (config.viaColor && config.viaColor.trim() !== '') {
    return `linear-gradient(${angle}deg, ${from} 0%, ${config.viaColor} 50%, ${to} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Returns inline CSS for Text Styling (Gradient clipping or Solid Color)
 */
export function getTextGradientStyle(config?: CustomGradientConfig): React.CSSProperties {
  if (!config || !config.enabled || !config.textGradientEnabled) {
    return {};
  }
  if (config.colorMode === 'solid') {
    const solid = config.textSolidColor || config.solidColor || '#8A2BE2';
    return {
      color: solid,
      backgroundImage: 'none',
      WebkitBackgroundClip: 'unset',
      WebkitTextFillColor: 'initial',
      display: 'inline-block',
    };
  }
  return {
    backgroundImage: getGradientCss(config),
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  };
}

/**
 * Returns inline CSS for soft atmospheric background scrim (Gradient or Solid)
 */
export function getBgGradientOverlayStyle(
  config?: CustomGradientConfig,
  isDarkMode: boolean = false
): React.CSSProperties {
  if (!config || !config.enabled || !config.bgGradientEnabled) {
    return {};
  }
  const opacity = config.opacity ?? 0.3;
  if (config.colorMode === 'solid') {
    const solid = config.bgSolidColor || config.solidColor || '#8A2BE2';
    return {
      backgroundColor: solid,
      opacity: isDarkMode ? Math.min(opacity * 0.45, 0.25) : Math.min(opacity * 0.3, 0.15),
      mixBlendMode: isDarkMode ? 'screen' : 'multiply',
    };
  }
  const gradient = getGradientCss(config);
  return {
    backgroundImage: gradient,
    opacity: isDarkMode ? Math.min(opacity * 0.7, 0.45) : opacity,
    mixBlendMode: isDarkMode ? 'screen' : 'multiply',
  };
}

/**
 * Returns button styling if enabled (Gradient or Solid)
 */
export function getButtonGradientStyle(
  config?: CustomGradientConfig,
  fallbackBg?: string
): React.CSSProperties {
  if (config && config.enabled && config.buttonGradientEnabled) {
    if (config.colorMode === 'solid') {
      const solid = config.solidColor || '#8A2BE2';
      return {
        backgroundColor: solid,
        backgroundImage: 'none',
        color: '#FFFFFF',
        boxShadow: `0 4px 14px 0 ${solid}55`,
      };
    }
    return {
      backgroundImage: getGradientCss(config),
      color: '#FFFFFF',
      boxShadow: '0 4px 14px 0 rgba(138, 43, 226, 0.25)',
    };
  }
  return fallbackBg ? { background: fallbackBg } : {};
}

