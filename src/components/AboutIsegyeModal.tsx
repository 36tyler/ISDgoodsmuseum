import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Crown,
  Heart,
  Music,
  Calendar,
  Users,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Layers,
  Youtube,
  Play,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Camera,
  Globe,
  Lock,
  Eye,
  Check
} from 'lucide-react';
import { MemberId, SiteConfig, VideoItem, LinkItem, AboutIsegyeConfig, MemberProfileData } from '../types';
import { MEMBERS } from '../data/members';
import { DEFAULT_ABOUT_ISEGYE, getYouTubeEmbedUrl, getYouTubeThumbnail } from '../data/aboutIsegyeData';
import { renderCustomText } from '../utils/textFormatter';

interface AboutIsegyeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (memberId: MemberId) => void;
  isDarkMode?: boolean;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  config: SiteConfig;
  onUpdateConfig: (updates: Partial<SiteConfig>) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
}

export const AboutIsegyeModal: React.FC<AboutIsegyeModalProps> = ({
  isOpen,
  onClose,
  onSelectMember,
  isDarkMode = false,
  isAdmin = false,
  onOpenLogin,
  config,
  onUpdateConfig,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'group' | 'members'>('group');
  const [selectedMemberId, setSelectedMemberId] = useState<MemberId>('ine');
  const [isEditMode, setIsEditMode] = useState(false);
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoItem | null>(null);

  // Editable local state initialized from config or defaults
  const [aboutData, setAboutData] = useState<AboutIsegyeConfig>(() => {
    return config.aboutIsegye || DEFAULT_ABOUT_ISEGYE;
  });

  // Sync when config changes
  useEffect(() => {
    if (config.aboutIsegye) {
      setAboutData(config.aboutIsegye);
    }
  }, [config.aboutIsegye]);

  // File upload refs
  const memberPhotoFileRef = useRef<HTMLInputElement>(null);
  const groupBannerFileRef = useRef<HTMLInputElement>(null);

  // Video and Link Add form states for Group
  const [newGroupVideoTitle, setNewGroupVideoTitle] = useState('');
  const [newGroupVideoUrl, setNewGroupVideoUrl] = useState('');
  const [newGroupVideoType, setNewGroupVideoType] = useState('공식 MV');
  const [isAddingGroupVideo, setIsAddingGroupVideo] = useState(false);

  const [newGroupLinkTitle, setNewGroupLinkTitle] = useState('');
  const [newGroupLinkUrl, setNewGroupLinkUrl] = useState('');
  const [newGroupLinkDesc, setNewGroupLinkDesc] = useState('');
  const [isAddingGroupLink, setIsAddingGroupLink] = useState(false);

  // Video and Link Add form states for Members
  const [newMemberVideoTitle, setNewMemberVideoTitle] = useState('');
  const [newMemberVideoUrl, setNewMemberVideoUrl] = useState('');
  const [newMemberVideoType, setNewMemberVideoType] = useState('보컬 커버');
  const [isAddingMemberVideo, setIsAddingMemberVideo] = useState(false);

  const [newMemberLinkTitle, setNewMemberLinkTitle] = useState('');
  const [newMemberLinkUrl, setNewMemberLinkUrl] = useState('');
  const [newMemberLinkDesc, setNewMemberLinkDesc] = useState('');
  const [isAddingMemberLink, setIsAddingMemberLink] = useState(false);

  if (!isOpen) return null;

  const currentMemberStatic = MEMBERS[selectedMemberId] || MEMBERS.ine;
  const currentMemberData: MemberProfileData =
    aboutData.members[selectedMemberId] || DEFAULT_ABOUT_ISEGYE.members[selectedMemberId] || DEFAULT_ABOUT_ISEGYE.members.ine;

  const memberKeys: MemberId[] = ['ine', 'jingburger', 'lilpa', 'jururu', 'gosegu', 'viichan'];

  const handleGoToMemberGoods = (mid: MemberId) => {
    onSelectMember(mid);
    onClose();
  };

  // Save all changes to config
  const handleSaveAboutData = () => {
    onUpdateConfig({ aboutIsegye: aboutData });
    setIsEditMode(false);
    onShowToast('이세계아이돌 소개 정보가 성공적으로 저장되었습니다!', 'success');
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm('이세계아이돌 소개 정보를 초기 기본값으로 복원하시겠습니까?')) {
      setAboutData(DEFAULT_ABOUT_ISEGYE);
      onUpdateConfig({ aboutIsegye: DEFAULT_ABOUT_ISEGYE });
      onShowToast('소개 정보가 초기값으로 복원되었습니다.', 'info');
    }
  };

  // Image Upload handler for Member Photo
  const handleMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 파일 용량은 10MB 이하만 지원됩니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const resultUrl = event.target.result;
        setAboutData((prev) => ({
          ...prev,
          members: {
            ...prev.members,
            [selectedMemberId]: {
              ...currentMemberData,
              photoUrl: resultUrl,
            },
          },
        }));
        onShowToast(`${currentMemberStatic.name} 공주의 사진이 새로 등록되었습니다!`, 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Image Upload handler for Group Banner
  const handleGroupBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 파일 용량은 10MB 이하만 지원됩니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const resultUrl = event.target.result;
        setAboutData((prev) => ({
          ...prev,
          groupBannerUrl: resultUrl,
        }));
        onShowToast('그룹 메인 배너 이미지가 변경되었습니다!', 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add Video to Group
  const handleAddGroupVideo = () => {
    if (!newGroupVideoTitle.trim() || !newGroupVideoUrl.trim()) {
      alert('영상 제목과 유튜브 URL을 입력해주세요.');
      return;
    }
    const newVid: VideoItem = {
      id: `vid-grp-${Date.now()}`,
      title: newGroupVideoTitle.trim(),
      url: newGroupVideoUrl.trim(),
      type: newGroupVideoType.trim() || '공식 영상',
    };
    setAboutData((prev) => ({
      ...prev,
      youtubeVideos: [...(prev.youtubeVideos || []), newVid],
    }));
    setNewGroupVideoTitle('');
    setNewGroupVideoUrl('');
    setIsAddingGroupVideo(false);
    onShowToast('그룹 유튜브 영상이 추가되었습니다.', 'success');
  };

  // Delete Video from Group
  const handleDeleteGroupVideo = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      youtubeVideos: (prev.youtubeVideos || []).filter((v) => v.id !== id),
    }));
    if (activePlayingVideo?.id === id) {
      setActivePlayingVideo(null);
    }
    onShowToast('유튜브 영상이 삭제되었습니다.', 'info');
  };

  // Add Link to Group
  const handleAddGroupLink = () => {
    if (!newGroupLinkTitle.trim() || !newGroupLinkUrl.trim()) {
      alert('링크 이름과 URL 주소를 입력해주세요.');
      return;
    }
    const newLnk: LinkItem = {
      id: `link-grp-${Date.now()}`,
      title: newGroupLinkTitle.trim(),
      url: newGroupLinkUrl.trim(),
      description: newGroupLinkDesc.trim(),
      icon: 'globe',
    };
    setAboutData((prev) => ({
      ...prev,
      customLinks: [...(prev.customLinks || []), newLnk],
    }));
    setNewGroupLinkTitle('');
    setNewGroupLinkUrl('');
    setNewGroupLinkDesc('');
    setIsAddingGroupLink(false);
    onShowToast('그룹 URL 링크가 추가되었습니다.', 'success');
  };

  // Delete Link from Group
  const handleDeleteGroupLink = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      customLinks: (prev.customLinks || []).filter((l) => l.id !== id),
    }));
    onShowToast('URL 링크가 삭제되었습니다.', 'info');
  };

  // Add Video to Member
  const handleAddMemberVideo = () => {
    if (!newMemberVideoTitle.trim() || !newMemberVideoUrl.trim()) {
      alert('영상 제목과 유튜브 URL을 입력해주세요.');
      return;
    }
    const newVid: VideoItem = {
      id: `vid-${selectedMemberId}-${Date.now()}`,
      title: newMemberVideoTitle.trim(),
      url: newMemberVideoUrl.trim(),
      type: newMemberVideoType.trim() || '보컬 커버',
    };
    setAboutData((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [selectedMemberId]: {
          ...currentMemberData,
          youtubeVideos: [...(currentMemberData.youtubeVideos || []), newVid],
        },
      },
    }));
    setNewMemberVideoTitle('');
    setNewMemberVideoUrl('');
    setIsAddingMemberVideo(false);
    onShowToast(`${currentMemberStatic.name} 공주의 유튜브 영상이 추가되었습니다.`, 'success');
  };

  // Delete Video from Member
  const handleDeleteMemberVideo = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [selectedMemberId]: {
          ...currentMemberData,
          youtubeVideos: (currentMemberData.youtubeVideos || []).filter((v) => v.id !== id),
        },
      },
    }));
    if (activePlayingVideo?.id === id) {
      setActivePlayingVideo(null);
    }
    onShowToast('유튜브 영상이 삭제되었습니다.', 'info');
  };

  // Add Link to Member
  const handleAddMemberLink = () => {
    if (!newMemberLinkTitle.trim() || !newMemberLinkUrl.trim()) {
      alert('링크 이름과 URL 주소를 입력해주세요.');
      return;
    }
    const newLnk: LinkItem = {
      id: `link-${selectedMemberId}-${Date.now()}`,
      title: newMemberLinkTitle.trim(),
      url: newMemberLinkUrl.trim(),
      description: newMemberLinkDesc.trim(),
      icon: 'globe',
    };
    setAboutData((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [selectedMemberId]: {
          ...currentMemberData,
          customLinks: [...(currentMemberData.customLinks || []), newLnk],
        },
      },
    }));
    setNewMemberLinkTitle('');
    setNewMemberLinkUrl('');
    setNewMemberLinkDesc('');
    setIsAddingMemberLink(false);
    onShowToast(`${currentMemberStatic.name} 공주의 URL 링크가 추가되었습니다.`, 'success');
  };

  // Delete Link from Member
  const handleDeleteMemberLink = (id: string) => {
    setAboutData((prev) => ({
      ...prev,
      members: {
        ...prev.members,
        [selectedMemberId]: {
          ...currentMemberData,
          customLinks: (currentMemberData.customLinks || []).filter((l) => l.id !== id),
        },
      },
    }));
    onShowToast('URL 링크가 삭제되었습니다.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50/70 via-slate-50 to-pink-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-sky-500 to-pink-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  이세계아이돌이란?
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 via-sky-500 via-emerald-500 via-amber-500 to-pink-500 text-white shadow-2xs">
                  ISEGYE IDOL
                </span>
                {isEditMode && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white animate-pulse">
                    관리자 편집 중
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                대한민국 가요계와 버추얼 씬의 역사를 다시 쓴 6인조 버추얼 걸그룹
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Edit Mode Toggle */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    !isEditMode
                      ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>보기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(true)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    isEditMode
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>수정 모드</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors dark:text-slate-300"
                title="관리자 로그인 후 소개 정보 수정하기"
              >
                <Lock className="w-3 h-3" />
                <span>관리자 수정</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer dark:text-slate-300"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('group')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'group'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-102'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>🌟 그룹 소개 (About Group)</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 scale-102'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>👑 6인 공주들 소개 & 사진 (Members)</span>
            </button>
          </div>

          {/* If in edit mode, show quick Save and Reset buttons in top bar */}
          {isEditMode && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer dark:text-slate-300"
                title="기본값으로 되돌리기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">초기화</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAboutData}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>저장 완료</span>
              </button>
            </div>
          )}
        </div>

        {/* Active YouTube Video Player Embed Viewport */}
        {activePlayingVideo && (
          <div className="bg-slate-950 p-4 border-b border-slate-800 shrink-0 animate-in slide-in-from-top-4 duration-200">
            <div className="max-w-2xl mx-auto space-y-2">
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-bold truncate">{activePlayingVideo.title}</span>
                  {activePlayingVideo.type && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-600 font-bold shrink-0">
                      {activePlayingVideo.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activePlayingVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-white text-[11px] flex items-center gap-0.5 hover:underline dark:text-slate-300"
                  >
                    <span>YouTube에서 보기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setActivePlayingVideo(null)}
                    className="p-1 text-slate-600 hover:text-white rounded-md hover:bg-white/10 dark:text-slate-300"
                    title="영상 닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Responsive 16:9 Video Embed */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                <iframe
                  src={getYouTubeEmbedUrl(activePlayingVideo.url) || ''}
                  title={activePlayingVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: 그룹 소개 */}
          {activeTab === 'group' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Group Hero Banner with Original Image Colors */}
              <div className="p-6 rounded-2xl bg-slate-950 text-white shadow-xl relative overflow-hidden min-h-[200px] sm:min-h-[220px] flex flex-col justify-end">
                {aboutData.groupBannerUrl && (
                  <>
                    <img
                      src={aboutData.groupBannerUrl}
                      alt="banner"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* Natural soft readability gradient that preserves original photo colors */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/55 to-slate-950/20 sm:bg-gradient-to-r sm:from-slate-950/90 sm:via-slate-950/55 sm:to-black/15 pointer-events-none" />
                  </>
                )}
                {!aboutData.groupBannerUrl && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                )}
                <div className="relative z-10 space-y-3 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    왁엔터테인먼트 소속 대한민국 대표 버추얼 걸그룹
                  </span>

                  {isEditMode ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-white block">그룹 메인 슬로건 / 헤드라인</label>
                      <input
                        type="text"
                        value={aboutData.groupHeadline || ''}
                        onChange={(e) => setAboutData((prev) => ({ ...prev, groupHeadline: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/30 text-white text-base font-black focus:outline-none focus:ring-1 focus:ring-white"
                        placeholder="가상과 현실을 잇는 여섯 공주들의 찬란한 기적"
                      />
                      <label className="text-[11px] font-bold text-white block pt-1">그룹 상세 소개 문구</label>
                      <textarea
                        rows={3}
                        value={aboutData.groupDescription || ''}
                        onChange={(e) => setAboutData((prev) => ({ ...prev, groupDescription: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/30 text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-white"
                        placeholder="이세계아이돌에 관한 소개글을 적어주세요."
                      />
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <input
                          ref={groupBannerFileRef}
                          type="file"
                          accept="image/*"
                          onChange={handleGroupBannerUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => groupBannerFileRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors backdrop-blur-xs"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>내 PC에서 배너 사진 올리기</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAboutData((prev) => ({ ...prev, groupBannerUrl: '/bg-isegye.jpg' }));
                            onShowToast('사이트 원본 배경 사진이 배너로 적용되었습니다.', 'info');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors backdrop-blur-xs"
                        >
                          <span>원본 배경 사진 적용</span>
                        </button>
                        <input
                          type="text"
                          value={aboutData.groupBannerUrl || ''}
                          onChange={(e) => setAboutData((prev) => ({ ...prev, groupBannerUrl: e.target.value }))}
                          placeholder="배너 사진 URL 직접 입력 (https://...)"
                          className="flex-1 min-w-[200px] px-2.5 py-1 text-[11px] font-mono rounded-lg bg-black/60 border border-white/30 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                        "{renderCustomText(aboutData.groupHeadline || '가상과 현실을 잇는 여섯 공주들의 찬란한 기적')}"
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed pt-1">
                        {renderCustomText(aboutData.groupDescription ||
                          "이세계아이돌(아이네, 징버거, 릴파, 주르르, 고세구, 비챤)은 2021년 12월 17일 데뷔곡 'RE:WIND'로 가요계에 혜성처럼 등장한 대한민국 대표 6인조 버추얼 걸그룹입니다.")}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Group Key Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>데뷔일</span>
                  </div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={aboutData.debutDate || ''}
                      onChange={(e) => setAboutData((prev) => ({ ...prev, debutDate: e.target.value }))}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {aboutData.debutDate || '2021.12.17'}
                      </p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300">데뷔곡 RE:WIND</p>
                    </>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-sky-500" />
                    {isEditMode ? (
                      <input
                        type="text"
                        value={aboutData.agencyLabel !== undefined ? aboutData.agencyLabel : '소속사'}
                        onChange={(e) => setAboutData((prev) => ({ ...prev, agencyLabel: e.target.value }))}
                        placeholder="소속사"
                        className="px-1.5 py-0.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold max-w-[100px]"
                      />
                    ) : (
                      <span>{aboutData.agencyLabel !== undefined ? aboutData.agencyLabel : '소속사'}</span>
                    )}
                  </div>
                  {isEditMode ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={aboutData.agency || ''}
                        onChange={(e) => setAboutData((prev) => ({ ...prev, agency: e.target.value }))}
                        placeholder="소속사명 (예: 왁엔터테인먼트)"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {aboutData.agency || '왁엔터테인먼트'}
                      </p>
                    </>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1 dark:text-slate-300">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>공식 팬덤</span>
                  </div>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={aboutData.fandomName || ''}
                      onChange={(e) => setAboutData((prev) => ({ ...prev, fandomName: e.target.value }))}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {aboutData.fandomName || '이세돌 팬덤'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* YouTube Video Section for Group */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-rose-600" />
                    <span>🎬 이세계아이돌 대표 유튜브 영상 & MV (클릭하여 시청)</span>
                  </h4>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setIsAddingGroupVideo(!isAddingGroupVideo)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>유튜브 영상 추가</span>
                    </button>
                  )}
                </div>

                {/* Add Video Form */}
                {isEditMode && isAddingGroupVideo && (
                  <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                      + 새로운 유튜브 영상 링크 추가
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newGroupVideoTitle}
                        onChange={(e) => setNewGroupVideoTitle(e.target.value)}
                        placeholder="영상 제목 (예: 'RE:WIND' Official MV)"
                        className="px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 sm:col-span-2"
                      />
                      <input
                        type="text"
                        value={newGroupVideoType}
                        onChange={(e) => setNewGroupVideoType(e.target.value)}
                        placeholder="구분 (예: 공식 MV, 라이브)"
                        className="px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGroupVideoUrl}
                        onChange={(e) => setNewGroupVideoUrl(e.target.value)}
                        placeholder="유튜브 URL (예: https://www.youtube.com/watch?v=fgSXAKsq-Vo)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddGroupVideo}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                      >
                        추가하기
                      </button>
                    </div>
                  </div>
                )}

                {/* Video Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(aboutData.youtubeVideos || []).map((vid) => {
                    const thumb = getYouTubeThumbnail(vid.url);
                    return (
                      <div
                        key={vid.id}
                        className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                      >
                        {/* Thumbnail with Play Overlay */}
                        <div
                          onClick={() => setActivePlayingVideo(vid)}
                          className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={thumb}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-rose-600 group-hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          {vid.type && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                              {vid.type}
                            </span>
                          )}
                        </div>

                        {/* Title & Actions */}
                        <div className="p-3 flex items-start justify-between gap-2 flex-1">
                          <button
                            type="button"
                            onClick={() => setActivePlayingVideo(vid)}
                            className="text-left text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                          >
                            {vid.title}
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={vid.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300"
                              title="YouTube에서 직접 열기"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => handleDeleteGroupVideo(vid.id)}
                                className="p-1 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer dark:text-slate-300"
                                title="영상 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official & Useful URL Addresses for Group */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-600" />
                    <span>🔗 공식 채널 & 바로가기 URL 주소</span>
                  </h4>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setIsAddingGroupLink(!isAddingGroupLink)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>URL 링크 추가</span>
                    </button>
                  )}
                </div>

                {/* Add Link Form */}
                {isEditMode && isAddingGroupLink && (
                  <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-sky-800 dark:text-sky-300 block">
                      + 새로운 URL 주소 링크 추가
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newGroupLinkTitle}
                        onChange={(e) => setNewGroupLinkTitle(e.target.value)}
                        placeholder="링크 이름 (예: 왁물원 공식 팬카페)"
                        className="px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={newGroupLinkDesc}
                        onChange={(e) => setNewGroupLinkDesc(e.target.value)}
                        placeholder="간단한 설명 (선택사항)"
                        className="px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGroupLinkUrl}
                        onChange={(e) => setNewGroupLinkUrl(e.target.value)}
                        placeholder="URL 주소 (https://...)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddGroupLink}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                      >
                        추가하기
                      </button>
                    </div>
                  </div>
                )}

                {/* Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(aboutData.customLinks || []).map((lnk) => (
                    <div
                      key={lnk.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2"
                    >
                      <a
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 truncate flex-1 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                          <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="truncate text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                            {lnk.title}
                          </p>
                          <p className="text-[10px] text-slate-600 truncate font-mono dark:text-slate-300">
                            {lnk.description || lnk.url.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                      </a>
                      {isEditMode && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGroupLink(lnk.id)}
                          className="p-1 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer dark:text-slate-300"
                          title="링크 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 멤버별 소개 & 사진 */}
          {activeTab === 'members' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Member Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {memberKeys.map((mid) => {
                  const m = MEMBERS[mid];
                  const mData = aboutData.members[mid] || DEFAULT_ABOUT_ISEGYE.members[mid];
                  const isSelected = selectedMemberId === mid;
                  return (
                    <button
                      key={mid}
                      onClick={() => {
                        setSelectedMemberId(mid);
                        setIsAddingMemberVideo(false);
                        setIsAddingMemberLink(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'ring-2 shadow-sm font-bold scale-102'
                          : 'opacity-75 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? m.bgDark
                            : m.bgLight
                          : undefined,
                        borderColor: isSelected
                          ? isDarkMode
                            ? m.accentColor
                            : m.color
                          : isDarkMode
                          ? '#334155'
                          : '#E2E8F0',
                        color: isSelected ? (isDarkMode ? m.accentColor : m.color) : undefined,
                      }}
                    >
                      {/* Mini Avatar in Selector */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 shadow-xs bg-slate-100 dark:bg-slate-800">
                        <img
                          src={mData?.photoUrl || currentMemberStatic.symbol}
                          alt={m.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold">{m.name}</span>
                      <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">({m.fanClub})</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Member Showcase Card with Editable Photo and Info */}
              <div
                className="p-5 sm:p-6 rounded-2xl border transition-all space-y-5"
                style={{
                  backgroundColor: isDarkMode ? currentMemberStatic.bgDark : currentMemberStatic.bgLight,
                  borderColor: currentMemberStatic.borderColor,
                }}
              >
                {/* Header Profile Section with Member Photo */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full xl:w-auto">
                    {/* Big Member Photo Card */}
                    <div className="relative group shrink-0">
                      <div
                        className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-3 shadow-lg bg-white dark:bg-slate-850"
                        style={{ borderColor: currentMemberStatic.color }}
                      >
                        <img
                          src={currentMemberData.photoUrl}
                          alt={currentMemberStatic.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>

                      {/* Photo Upload/Change Action in Admin Mode */}
                      {isEditMode && (
                        <>
                          <input
                            ref={memberPhotoFileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleMemberPhotoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => memberPhotoFileRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 cursor-pointer"
                            title="공주 사진 파일 업로드 (JPG, PNG, WebP)"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Member Name and Identity */}
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h3
                          className="text-2xl sm:text-3xl font-black tracking-tight"
                          style={{
                            color: isDarkMode ? currentMemberStatic.accentColor : currentMemberStatic.color,
                          }}
                        >
                          {currentMemberStatic.name}
                        </h3>
                        <span className="text-xs text-slate-600 font-mono font-bold dark:text-slate-300">
                          {currentMemberStatic.nameEn}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: currentMemberStatic.color }}
                        >
                          팬덤: {currentMemberStatic.fanClub}
                        </span>
                      </div>

                      {/* Role & Basic Specs */}
                      {isEditMode ? (
                        <div className="space-y-2 pt-2">
                          <input
                            type="text"
                            value={currentMemberData.role || ''}
                            onChange={(e) =>
                              setAboutData((prev) => ({
                                ...prev,
                                members: {
                                  ...prev.members,
                                  [selectedMemberId]: { ...currentMemberData, role: e.target.value },
                                },
                              }))
                            }
                            placeholder="포지션 및 역할 (예: 맏언니 · 메인보컬)"
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={currentMemberData.photoUrl || ''}
                              onChange={(e) =>
                                setAboutData((prev) => ({
                                  ...prev,
                                  members: {
                                    ...prev.members,
                                    [selectedMemberId]: { ...currentMemberData, photoUrl: e.target.value },
                                  },
                                }))
                              }
                              placeholder="또는 사진 URL 직접 입력 (https://...jpg, png)"
                              className="w-full px-2.5 py-1 text-[11px] font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {currentMemberData.role}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-600 pt-1 dark:text-slate-300">
                        <span>생일: {currentMemberData.birthday}</span>
                        <span>•</span>
                        <span>키: {currentMemberData.height}</span>
                        <span>•</span>
                        <span>MBTI: {currentMemberData.mbti}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Button: Navigate to member's goods */}
                  <button
                    onClick={() => handleGoToMemberGoods(selectedMemberId)}
                    className="w-full xl:w-auto px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-102 transition-all shrink-0 cursor-pointer"
                    title={`${currentMemberStatic.name} 관련 굿즈 도감 바로보기`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{currentMemberStatic.name} 관련 굿즈 보러가기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quote Box */}
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 italic shadow-2xs">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={currentMemberData.quote || ''}
                      onChange={(e) =>
                        setAboutData((prev) => ({
                          ...prev,
                          members: {
                            ...prev.members,
                            [selectedMemberId]: { ...currentMemberData, quote: e.target.value },
                          },
                        }))
                      }
                      placeholder="대표 명언 / 한 줄 소개"
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    />
                  ) : (
                    <span>💬 "{currentMemberData.quote || currentMemberStatic.quote}"</span>
                  )}
                </div>

                {/* Strengths & Songs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white block">💎 핵심 매력 포인트</span>
                    {isEditMode ? (
                      <textarea
                        rows={3}
                        value={(currentMemberData.strengths || []).join('\n')}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(Boolean);
                          setAboutData((prev) => ({
                            ...prev,
                            members: {
                              ...prev.members,
                              [selectedMemberId]: { ...currentMemberData, strengths: lines },
                            },
                          }));
                        }}
                        placeholder="한 줄에 하나씩 입력"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    ) : (
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                        {(currentMemberData.strengths || []).map((s, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: currentMemberStatic.color }}
                            />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white block">🎶 추천 대표 곡 / 커버곡</span>
                    {isEditMode ? (
                      <textarea
                        rows={3}
                        value={(currentMemberData.signatureSongs || []).join('\n')}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(Boolean);
                          setAboutData((prev) => ({
                            ...prev,
                            members: {
                              ...prev.members,
                              [selectedMemberId]: { ...currentMemberData, signatureSongs: lines },
                            },
                          }));
                        }}
                        placeholder="한 줄에 하나씩 입력"
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    ) : (
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                        {(currentMemberData.signatureSongs || []).map((song, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Music className="w-3 h-3 text-purple-500 shrink-0" />
                            <span>{song}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Member Lore Narrative */}
                <div className="p-4 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    📖 {currentMemberStatic.name} 공주 아카이브 스토리
                  </span>
                  {isEditMode ? (
                    <textarea
                      rows={3}
                      value={currentMemberData.lore || ''}
                      onChange={(e) =>
                        setAboutData((prev) => ({
                          ...prev,
                          members: {
                            ...prev.members,
                            [selectedMemberId]: { ...currentMemberData, lore: e.target.value },
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 leading-relaxed"
                    />
                  ) : (
                    <p>{currentMemberData.lore}</p>
                  )}
                </div>

                {/* Member YouTube Videos Section */}
                <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-rose-600" />
                      <span>{currentMemberStatic.name} 추천 영상 & 커버곡 (클릭하여 시청)</span>
                    </h4>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => setIsAddingMemberVideo(!isAddingMemberVideo)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>영상 추가</span>
                      </button>
                    )}
                  </div>

                  {/* Add Video Form for Member */}
                  {isEditMode && isAddingMemberVideo && (
                    <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                        + {currentMemberStatic.name} 유튜브 영상 링크 추가
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newMemberVideoTitle}
                          onChange={(e) => setNewMemberVideoTitle(e.target.value)}
                          placeholder="영상 제목 (예: '취기를 빌려' 커버)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 sm:col-span-2"
                        />
                        <input
                          type="text"
                          value={newMemberVideoType}
                          onChange={(e) => setNewMemberVideoType(e.target.value)}
                          placeholder="구분 (예: 보컬 커버, 라이브)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMemberVideoUrl}
                          onChange={(e) => setNewMemberVideoUrl(e.target.value)}
                          placeholder="유튜브 URL (https://...)"
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddMemberVideo}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                        >
                          추가하기
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Member Videos Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(currentMemberData.youtubeVideos || []).map((vid) => {
                      const thumb = getYouTubeThumbnail(vid.url);
                      return (
                        <div
                          key={vid.id}
                          className="group rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                        >
                          <div
                            onClick={() => setActivePlayingVideo(vid)}
                            className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer"
                          >
                            <img
                              src={thumb}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-9 h-9 rounded-full bg-rose-600 group-hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                            </div>
                            {vid.type && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs">
                                {vid.type}
                              </span>
                            )}
                          </div>

                          <div className="p-2.5 flex items-start justify-between gap-2 flex-1">
                            <button
                              type="button"
                              onClick={() => setActivePlayingVideo(vid)}
                              className="text-left text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                            >
                              {vid.title}
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={vid.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-600 hover:text-rose-600 transition-colors dark:text-slate-300"
                                title="YouTube에서 열기"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              {isEditMode && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMemberVideo(vid.id)}
                                  className="p-1 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer dark:text-slate-300"
                                  title="영상 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Member Custom URL Links Section */}
                <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-600" />
                      <span>{currentMemberStatic.name} 공식 방송국 & 채널 URL</span>
                    </h4>
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={() => setIsAddingMemberLink(!isAddingMemberLink)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>URL 추가</span>
                      </button>
                    )}
                  </div>

                  {/* Add Link Form for Member */}
                  {isEditMode && isAddingMemberLink && (
                    <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-sky-800 dark:text-sky-300 block">
                        + {currentMemberStatic.name} URL 주소 추가
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={newMemberLinkTitle}
                          onChange={(e) => setNewMemberLinkTitle(e.target.value)}
                          placeholder="링크 이름 (예: 아이네 치지직 방송국)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={newMemberLinkDesc}
                          onChange={(e) => setNewMemberLinkDesc(e.target.value)}
                          placeholder="간단한 설명 (선택사항)"
                          className="px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMemberLinkUrl}
                          onChange={(e) => setNewMemberLinkUrl(e.target.value)}
                          placeholder="URL 주소 (https://...)"
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddMemberLink}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                        >
                          추가하기
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Member Links List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(currentMemberData.customLinks || []).map((lnk) => (
                      <div
                        key={lnk.id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850/80 hover:bg-white dark:hover:bg-slate-850 transition-colors flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <a
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 truncate flex-1 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="truncate text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                              {lnk.title}
                            </p>
                            <p className="text-[10px] text-slate-600 truncate font-mono dark:text-slate-300">
                              {lnk.description || lnk.url.replace(/^https?:\/\//, '')}
                            </p>
                          </div>
                        </a>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMemberLink(lnk.id)}
                            className="p-1 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer dark:text-slate-300"
                            title="링크 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-2">
            <span>공식 팬카페:</span>
            <a
              href="https://cafe.naver.com/steamindiegame"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              <span>왁물원 바로가기</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleSaveAboutData}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>변경사항 저장하기</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
