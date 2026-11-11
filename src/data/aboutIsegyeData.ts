import { AboutIsegyeConfig } from '../types';

/**
 * Parses and extracts YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=fgSXAKsq-Vo
 * - https://youtu.be/fgSXAKsq-Vo
 * - https://www.youtube.com/embed/fgSXAKsq-Vo
 * - https://www.youtube.com/shorts/fgSXAKsq-Vo
 * - or plain 11-char ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

export function getYouTubeThumbnail(url: string): string {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export const DEFAULT_ABOUT_ISEGYE: AboutIsegyeConfig = {
  groupBannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  groupHeadline: '가상과 현실을 잇는 여섯 공주들의 찬란한 기적',
  groupDescription:
    "이세계아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)은 2021년 12월 17일 데뷔곡 'RE:WIND'로 가요계에 혜성처럼 등장한 대한민국 대표 6인조 버추얼 걸그룹입니다. 음악, 웹툰, 콘서트, 페스티벌 등 다채로운 영역에서 기존 아이돌의 경계를 뛰어넘는 독보적인 신화를 써 내려가고 있습니다.",
  debutDate: '2021.12.17',
  producer: '우왁굳 (WAK Entertainment)',
  agency: '왁엔터테인먼트',
  agencyLabel: '소속사',
  chartRecord: '멜론 TOP100 · 벅스 1위 석권',
  fandomName: '이세돌 팬덤 (6대 팬클럽 연합)',
  youtubeVideos: [
    {
      id: 'vid-rewind',
      title: "이세계아이돌 (ISEGYE IDOL) - 'RE:WIND' Official MV",
      url: 'https://www.youtube.com/watch?v=fgSXAKsq-Vo',
      type: '데뷔 타이틀 MV',
    },
    {
      id: 'vid-kidding',
      title: "이세계아이돌 (ISEGYE IDOL) - 'KIDDING (키딩)' Official MV",
      url: 'https://www.youtube.com/watch?v=V2hlQkVJqE4',
      type: '3집 타이틀 MV',
    },
    {
      id: 'vid-lockdown',
      title: "이세계아이돌 (ISEGYE IDOL) - 'LOCKDOWN' Official MV",
      url: 'https://www.youtube.com/watch?v=rDFUl2mFI54',
      type: '웹툰 마법소녀 OST',
    },
    {
      id: 'vid-over',
      title: "이세계아이돌 (ISEGYE IDOL) - 'OVER' Official MV",
      url: 'https://www.youtube.com/watch?v=h3Lw3Z27QG8',
      type: '스페셜 싱글 MV',
    },
    {
      id: 'vid-winterspring',
      title: "이세계아이돌 (ISEGYE IDOL) - '겨울봄 (Winter Spring)' Official MV",
      url: 'https://www.youtube.com/watch?v=JY-gJkMuJ94',
      type: '2집 싱글 MV',
    },
    {
      id: 'vid-anotherworld',
      title: "이세계아이돌 (ISEGYE IDOL) - 'Another World' Official MV",
      url: 'https://www.youtube.com/watch?v=QnBfqLzL0Ew',
      type: '웹툰 차원 OST',
    },
  ],
  customLinks: [
    {
      id: 'link-wakzoo',
      title: '왁물원 공식 팬카페',
      url: 'https://cafe.naver.com/steamindiegame',
      description: '이세돌 팬덤의 보금자리이자 공식 소통 창구',
      icon: 'cafe',
    },
    {
      id: 'link-youtube',
      title: '이세계아이돌 공식 유튜브',
      url: 'https://www.youtube.com/@isegyeidol',
      description: '공식 MV, 앨범 티저, 비하인드 영상',
      icon: 'youtube',
    },
    {
      id: 'link-wakgood',
      title: '우왁굳 유튜브 채널',
      url: 'https://www.youtube.com/@wakgood',
      description: '이세계아이돌 총괄 프로듀서 채널',
      icon: 'youtube',
    },
    {
      id: 'link-twitter',
      title: '이세계아이돌 공식 X (트위터)',
      url: 'https://twitter.com/isegye_idol',
      description: '공식 공지 및 스케줄 소식',
      icon: 'x',
    },
    {
      id: 'link-melon',
      title: '멜론 (Melon) 아티스트 채널',
      url: 'https://www.melon.com/artist/timeline.htm?artistId=3061299',
      description: '음원 스트리밍 및 공식 음반 발매 정보',
      icon: 'globe',
    },
  ],
  members: {
    ine: {
      id: 'ine',
      name: '아이네',
      photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      role: '맏언니 · 메인보컬',
      height: '158cm',
      birthday: '1994년 (음력 12월 24일)',
      mbti: 'INFP / ENFP',
      quote: '노래로 마음을 어루만져 주는 천상의 목소리',
      strengths: ['천상의 음색과 독보적 가창력', '차분하고 품격 있는 힐링 보이스', '방대한 영화·뮤지컬 지식'],
      signatureSongs: ['RE:WIND', '기억해줘요 내 모든 날과 그때를', '비와 당신', '바람의 노래'],
      lore: '이세계아이돌의 맏언니이자 기둥. 성악 전공자다운 폭발적인 성량과 맑고 청아한 고음으로 곡의 중심을 잡아주며, 따뜻하고 나긋나긋한 말투로 팬들(둘기)에게 평온한 쉼터를 선물합니다.',
      youtubeVideos: [
        {
          id: 'ine-vid-1',
          title: "아이네 - '기억해줘요 내 모든 날과 그때를' 커버",
          url: 'https://www.youtube.com/watch?v=fgSXAKsq-Vo',
          type: '보컬 커버',
        },
        {
          id: 'ine-vid-2',
          title: "아이네 (INE) - '비와 당신' Live Clip",
          url: 'https://www.youtube.com/watch?v=JY-gJkMuJ94',
          type: '라이브 클립',
        },
      ],
      customLinks: [
        {
          id: 'ine-link-yt',
          title: '아이네 공식 유튜브',
          url: 'https://www.youtube.com/@INE_',
          description: '노래 커버 및 하이라이트 영상',
          icon: 'youtube',
        },
        {
          id: 'ine-link-chzzk',
          title: '아이네 치지직 방송국',
          url: 'https://chzzk.naver.com/4515b179f86b67b4981e16190817c580',
          description: '생방송 라이브 스트리밍',
          icon: 'globe',
        },
      ],
    },
    jingburger: {
      id: 'jingburger',
      name: '징버거',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      role: '서브보컬 · 래퍼 · 비주얼 아트',
      height: '160cm',
      birthday: '1995년 10월 8일',
      mbti: 'INFJ',
      quote: '달콤한 꿀보이스와 힙한 그루브의 햄버거 요정',
      strengths: ['독보적인 힙합 & 소울 그루브', '전문 일러스트레이터급 드로잉 실력', '츤데레 같지만 속 깊은 팬사랑'],
      signatureSongs: ['KIDDING', '취기를 빌려', 'SUPERNOVA', '헤어지자 말해요'],
      lore: '허스키하면서도 감미로운 특유의 소울풀한 음색을 지닌 멤버. 팬들(똥강아지)을 챙기는 따뜻한 마음씨와 뛰어난 디자인·드로잉 감각으로 굿즈 및 비주얼 기획에서도 빛을 발합니다.',
      youtubeVideos: [
        {
          id: 'jb-vid-1',
          title: "징버거 - '취기를 빌려' 커버",
          url: 'https://www.youtube.com/watch?v=V2hlQkVJqE4',
          type: '보컬 커버',
        },
        {
          id: 'jb-vid-2',
          title: "징버거 - 'SUPERNOVA' 퍼포먼스",
          url: 'https://www.youtube.com/watch?v=rDFUl2mFI54',
          type: '댄스 & 보컬',
        },
      ],
      customLinks: [
        {
          id: 'jb-link-yt',
          title: '징버거 공식 유튜브',
          url: 'https://www.youtube.com/@jingburger',
          description: '노래 커버, 드로잉, 클립',
          icon: 'youtube',
        },
        {
          id: 'jb-link-chzzk',
          title: '징버거 치지직 방송국',
          url: 'https://chzzk.naver.com/e58d4a949666d491f8ec473a241f8794',
          description: '생방송 스트리밍',
          icon: 'globe',
        },
      ],
    },
    lilpa: {
      id: 'lilpa',
      name: '릴파',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      role: '메인댄서 · 메인보컬 · 열정의 아이콘',
      height: '164cm',
      birthday: '1996년 11월 9일',
      mbti: 'ENFP',
      quote: '무대를 찢는 폭발적인 에너지, 지치지 않는 열정',
      strengths: ['폭발적인 성량의 파워풀 고음', '압도적인 풀트래킹 댄스 퍼포먼스', '지치지 않는 긍정 에너지'],
      signatureSongs: ['마지막 재회', 'LADY', 'Dreaming', 'Promise'],
      lore: '아이돌 출신의 풍부한 무대 경험을 바탕으로, 이세계아이돌의 댄스와 무대 연출을 이끄는 열정의 리더. 콘서트 무대마다 팬들(박쥐단)의 혼을 쏙 빼놓는 전설적인 라이브를 선보입니다.',
      youtubeVideos: [
        {
          id: 'lil-vid-1',
          title: "릴파 (LILPA) - '마지막 재회' 콘서트 라이브",
          url: 'https://www.youtube.com/watch?v=fgSXAKsq-Vo',
          type: '단독 콘서트 라이브',
        },
        {
          id: 'lil-vid-2',
          title: "릴파 - 'LADY' Official MV",
          url: 'https://www.youtube.com/watch?v=h3Lw3Z27QG8',
          type: '솔로 오리지널 곡',
        },
      ],
      customLinks: [
        {
          id: 'lil-link-yt',
          title: '릴파 공식 유튜브',
          url: 'https://www.youtube.com/@lilpa',
          description: '콘서트 비하인드, 풀트래킹 댄스, 커버',
          icon: 'youtube',
        },
        {
          id: 'lil-link-chzzk',
          title: '릴파 치지직 방송국',
          url: 'https://chzzk.naver.com/b6b55364e03f0b2f6ef5c3b16954a20b',
          description: '생방송 스트리밍',
          icon: 'globe',
        },
      ],
    },
    jururu: {
      id: 'jururu',
      name: '주르르',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      role: '서브보컬 · 엔터테이너 · 비주얼',
      height: '161.9cm',
      birthday: '1997년 6월 10일',
      mbti: 'ENFJ',
      quote: '사랑스러움 그 자체, 당신의 영원한 공주님',
      strengths: ['매혹적이고 달콤한 비음 보컬', '천부적인 방송 센스와 능숙한 조련', '공주님 그 자체의 사랑스러움'],
      signatureSongs: ['Ju.Ruru', '사랑했나봐', 'RE:WIND', '달려라 배추도사'],
      lore: '이세계아이돌의 자칭 타칭 "공주님". 특유의 달콤하고 톡톡 튀는 음색과 재치 넘치는 입담으로 분위기 메이커 역할을 톡톡히 하며, 팬들(주폭도)에게 아낌없는 애정을 쏟아냅니다.',
      youtubeVideos: [
        {
          id: 'ju-vid-1',
          title: "주르르 - 'Ju.Ruru' 솔로 오리지널 곡",
          url: 'https://www.youtube.com/watch?v=rDFUl2mFI54',
          type: '솔로 타이틀 MV',
        },
        {
          id: 'ju-vid-2',
          title: "주르르 - '사랑했나봐' 커버곡",
          url: 'https://www.youtube.com/watch?v=V2hlQkVJqE4',
          type: '보컬 커버',
        },
      ],
      customLinks: [
        {
          id: 'ju-link-yt',
          title: '주르르 공식 유튜브',
          url: 'https://www.youtube.com/@jururu',
          description: '음악 커버, 방송 하이라이트',
          icon: 'youtube',
        },
        {
          id: 'ju-link-chzzk',
          title: '주르르 치지직 방송국',
          url: 'https://chzzk.naver.com/45e71a76e93e9b66e4f8a846176378e9',
          description: '생방송 스트리밍',
          icon: 'globe',
        },
      ],
    },
    gosegu: {
      id: 'gosegu',
      name: '고세구',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      role: '서브보컬 · 비타민 · 기획 천재',
      height: '160cm (자칭 300m)',
      birthday: '1998년 10월 14일',
      mbti: 'ENTJ',
      quote: '톡톡 튀는 청량 비타민, 어디로 튈지 모르는 매력',
      strengths: ['청량하고 맑은 보컬 톤', '지치지 않는 하이텐션 예능감', '번뜩이는 아이디어와 콘텐츠 기획력'],
      signatureSongs: ['팬서비스', '겨울봄', '쇼핑몰', '바다의 맛'],
      lore: '통통 튀는 아이디어와 맑고 청량한 보이스로 언제나 신선한 충격을 선사하는 비타민 같은 존재. 독창적인 밈과 유행어를 만들어내며 팬들(세균단)과 유쾌하게 호흡합니다.',
      youtubeVideos: [
        {
          id: 'go-vid-1',
          title: "고세구 - '팬서비스 (Fan Service)' 커버 (1000만 뷰 신화)",
          url: 'https://www.youtube.com/watch?v=fgSXAKsq-Vo',
          type: '레전드 커버곡',
        },
        {
          id: 'go-vid-2',
          title: "고세구 - '쇼핑몰' 공식 MV",
          url: 'https://www.youtube.com/watch?v=QnBfqLzL0Ew',
          type: '솔로 오리지널 곡',
        },
      ],
      customLinks: [
        {
          id: 'go-link-yt',
          title: '고세구 공식 유튜브',
          url: 'https://www.youtube.com/@gosegu',
          description: '천만 뷰 커버곡, 예능 콘텐츠',
          icon: 'youtube',
        },
        {
          id: 'go-link-chzzk',
          title: '고세구 치지직 방송국',
          url: 'https://chzzk.naver.com/9588319f39d57a550186835a7702f741',
          description: '생방송 스트리밍',
          icon: 'globe',
        },
      ],
    },
    viichan: {
      id: 'viichan',
      name: '비챤',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      role: '막내 · 서브보컬 · 감성 싱어송라이터',
      height: '160cm',
      birthday: '2000년 1월 16일',
      mbti: 'INFP',
      quote: '감미로운 기타 선율과 청량한 감성 보컬의 막내',
      strengths: ['트렌디하고 감성적인 담백한 음색', '수준급의 어쿠스틱 기타 연주', '언니들과 팬들의 사랑을 독차지하는 막내미'],
      signatureSongs: ['취중고백', 'RE:WIND', '고민중독', '사건의 지평선'],
      lore: '이세계아이돌의 소중한 막내. 풋풋하면서도 깊이 있는 감성 보컬과 기타 라이브로 리스너들의 감수성을 자극하며, 팬들(라니)에게 잔잔하고 따스한 감동을 선사합니다.',
      youtubeVideos: [
        {
          id: 'vii-vid-1',
          title: "비챤 - '취중고백' 어쿠스틱 라이브 커버",
          url: 'https://www.youtube.com/watch?v=JY-gJkMuJ94',
          type: '어쿠스틱 커버',
        },
        {
          id: 'vii-vid-2',
          title: "비챤 - '고민중독' 밴드 라이브 커버",
          url: 'https://www.youtube.com/watch?v=V2hlQkVJqE4',
          type: '밴드 라이브',
        },
      ],
      customLinks: [
        {
          id: 'vii-link-yt',
          title: '비챤 공식 유튜브',
          url: 'https://www.youtube.com/@viichan',
          description: '감성 기타 커버, 싱어송라이터 클립',
          icon: 'youtube',
        },
        {
          id: 'vii-link-chzzk',
          title: '비챤 치지직 방송국',
          url: 'https://chzzk.naver.com/4b678f13b6eb4e8830155b9a4c5a0834',
          description: '생방송 스트리밍',
          icon: 'globe',
        },
      ],
    },
  },
};
