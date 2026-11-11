import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Type,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Trash2,
  Eraser,
  Wand2,
  Paintbrush
} from 'lucide-react';
import { SiteConfig, MemberId, CustomGradientConfig, SiteTexts } from '../types';
import { MEMBERS } from '../data/members';
import {
  GRADIENT_PRESETS,
  SOLID_COLOR_PRESETS,
  DEFAULT_CUSTOM_GRADIENT,
  getGradientCss
} from '../utils/gradientUtils';
import { DEFAULT_SITE_CONFIG, DEFAULT_SITE_TEXTS } from '../data/initialGoods';
import {
  renderCustomText,
  stripCustomTextTags,
  applyFormattingToSelection
} from '../utils/textFormatter';

interface LiveVisualCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onUpdateConfig: (newConfig: Partial<SiteConfig>) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'heart' | 'bookmark') => void;
  isDarkMode?: boolean;
}

interface RichFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  onChange: (val: string) => void;
  onShowToast?: (text: string, type?: 'info' | 'success') => void;
}

/**
 * Reusable Rich Input with Selection Colorizer, Erase/Clear button, and Live Preview
 */
const RichFieldEditor: React.FC<RichFieldProps> = ({
  label,
  value,
  placeholder,
  multiline = false,
  rows = 2,
  onChange,
  onShowToast,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [customSolidColor, setCustomSolidColor] = useState('#8A2BE2');
  const [showToolbar, setShowToolbar] = useState(false);

  const quickSolidColors = [
    { name: '바이올렛', hex: '#8A2BE2' },
    { name: '퍼플', hex: '#7C3AED' },
    { name: '옐로우', hex: '#F59E0B' },
    { name: '블루', hex: '#2563EB' },
    { name: '마젠타', hex: '#DB2777' },
    { name: '민트', hex: '#059669' },
    { name: '블랙', hex: '#0F172A' },
    { name: '화이트', hex: '#FFFFFF' },
    { name: '레드', hex: '#DC2626' },
    { name: '골드', hex: '#EAB308' },
  ];

  const handleApplyColor = (colorHex: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const { newText, newCursorStart, newCursorEnd } = applyFormattingToSelection(
      value,
      start,
      end,
      {
        type: 'solid',
        color: colorHex,
      }
    );
    onChange(newText);
    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newCursorStart, newCursorEnd);
      }
    }, 10);
    if (onShowToast) {
      onShowToast(
        start === end
          ? `전체 글자에 단색(${colorHex})이 적용되었습니다.`
          : `선택한 글자에 단색(${colorHex})이 적용되었습니다.`,
        'info'
      );
    }
  };

  const handleApplyRainbow = () => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const { newText, newCursorStart, newCursorEnd } = applyFormattingToSelection(
      value,
      start,
      end,
      { type: 'rainbow' }
    );
    onChange(newText);
    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newCursorStart, newCursorEnd);
      }
    }, 10);
    if (onShowToast) {
      onShowToast(
        start === end ? '전체 글자에 무지개색이 적용되었습니다.' : '선택한 글자에 무지개색이 적용되었습니다.',
        'info'
      );
    }
  };

  const handleApplyGradient = (from: string, to: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const { newText, newCursorStart, newCursorEnd } = applyFormattingToSelection(
      value,
      start,
      end,
      {
        type: 'gradient',
        gradientColors: { from, to },
      }
    );
    onChange(newText);
    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newCursorStart, newCursorEnd);
      }
    }, 10);
    if (onShowToast) {
      onShowToast('선택한 글자에 그라데이션이 적용되었습니다.', 'info');
    }
  };

  const handleClearSelectionOnly = () => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) {
      // Clear entire text
      onChange('');
      if (onShowToast) onShowToast('글자를 모두 지웠습니다.', 'info');
      return;
    }
    const { newText, newCursorStart } = applyFormattingToSelection(value, start, end, {
      type: 'clear-selection',
    });
    onChange(newText);
    setTimeout(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newCursorStart, newCursorStart);
      }
    }, 10);
    if (onShowToast) onShowToast('선택한 글자를 지웠습니다.', 'info');
  };

  const handleEraseFormatting = () => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const { newText } = applyFormattingToSelection(value, start, end, {
      type: 'erase-formatting',
    });
    onChange(newText);
    if (onShowToast) onShowToast('글자의 색상 서식을 초기화했습니다.', 'info');
  };

  const handleClearAll = () => {
    onChange('');
    if (onShowToast) onShowToast('글자를 완전히 지웠습니다.', 'info');
  };

  const hasTags =
    value.includes('[color:') ||
    value.includes('[solid:') ||
    value.includes('[gradient:') ||
    value.includes('[rainbow]');

  return (
    <div className="space-y-1.5 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>{label}</span>
          {hasTags && (
            <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded text-[9px] font-mono">
              색상 서식 적용됨
            </span>
          )}
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowToolbar(!showToolbar)}
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors ${
              showToolbar
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
            }`}
            title="선택 글자 색상 입히기 도구 열기/닫기"
          >
            <Paintbrush className="w-3 h-3" />
            <span>선택 글자 색상</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors flex items-center gap-0.5"
            title="전체 글자 지우기"
          >
            <Trash2 className="w-3 h-3" />
            <span>지우기</span>
          </button>
        </div>
      </div>

      {/* Selected Text Coloring Toolbar */}
      {showToolbar && (
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-800/60 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
            <span className="font-bold flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>글자를 드래그(선택) 후 색상을 누르면 해당 글자만 채색됩니다:</span>
            </span>
          </div>

          {/* Quick Solid Color Palette */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-bold text-slate-600 mr-0.5 dark:text-slate-300">단색:</span>
            {quickSolidColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => handleApplyColor(c.hex)}
                className="w-5 h-5 rounded-full border border-black/20 hover:scale-120 transition-transform shadow-2xs"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} (${c.hex}) 입히기`}
              />
            ))}

            {/* Custom Solid Color Picker */}
            <div className="flex items-center gap-1 ml-1 bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={customSolidColor}
                onChange={(e) => setCustomSolidColor(e.target.value)}
                className="w-4 h-4 rounded border-none cursor-pointer bg-transparent"
                title="단색 직접 선택"
              />
              <button
                type="button"
                onClick={() => handleApplyColor(customSolidColor)}
                className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                단색입히기
              </button>
            </div>
          </div>

          {/* Gradient & Rainbow & Clear options */}
          <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[9px] font-bold text-slate-600 mr-0.5 dark:text-slate-300">그라데이션:</span>
            <button
              type="button"
              onClick={handleApplyRainbow}
              className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r from-purple-500 via-emerald-400 to-pink-500 text-white shadow-2xs hover:opacity-90"
            >
              🌈 무지개
            </button>
            <button
              type="button"
              onClick={() => handleApplyGradient('#8A2BE2', '#EC4899')}
              className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-2xs hover:opacity-90"
            >
              🌌 오로라
            </button>
            <button
              type="button"
              onClick={() => handleApplyGradient('#2563EB', '#38BDF8')}
              className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-2xs hover:opacity-90"
            >
              🌊 네온블루
            </button>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={handleEraseFormatting}
                className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded flex items-center gap-0.5"
                title="색상 서식 제거"
              >
                <Eraser className="w-2.5 h-2.5" />
                <span>색상제거</span>
              </button>
              <button
                type="button"
                onClick={handleClearSelectionOnly}
                className="px-1.5 py-0.5 text-[9px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded flex items-center gap-0.5"
                title="선택된 글자 지우기"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>선택글자지우기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input or Textarea */}
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-850 text-slate-900 dark:text-white leading-relaxed focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none"
          />
        )}
      </div>

      {/* Live Formatted Output Preview */}
      {value && hasTags && (
        <div className="pt-1 border-t border-dashed border-slate-200 dark:border-slate-700/60">
          <div className="text-[9px] text-slate-600 mb-0.5 font-semibold dark:text-slate-300">실시간 채색 미리보기:</div>
          <div className="px-2 py-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-md text-xs font-bold text-slate-900 dark:text-white break-words">
            {renderCustomText(value)}
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveVisualCustomizer: React.FC<LiveVisualCustomizerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onShowToast,
  isDarkMode = false,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'gradient' | 'text'>('gradient');
  const [colorStudioSubTab, setColorStudioSubTab] = useState<'gradient' | 'solid'>('gradient');
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedStoryMember, setSelectedStoryMember] = useState<MemberId>('all');
  const [useViaColor, setUseViaColor] = useState(Boolean(config.customGradient?.viaColor));

  // Current gradient state with defaults
  const gradientConfig: CustomGradientConfig = config.customGradient || DEFAULT_CUSTOM_GRADIENT;

  const handleUpdateGradient = (updates: Partial<CustomGradientConfig>) => {
    const updated: CustomGradientConfig = {
      ...gradientConfig,
      ...updates,
    };
    onUpdateConfig({ customGradient: updated });
  };

  const handleSelectGradientPreset = (presetId: string) => {
    const preset = GRADIENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setUseViaColor(Boolean(preset.via));
    const newGradient: CustomGradientConfig = {
      ...gradientConfig,
      enabled: true,
      colorMode: 'gradient',
      presetId: preset.id,
      name: preset.name,
      angle: preset.angle,
      fromColor: preset.from,
      viaColor: preset.via || '',
      toColor: preset.to,
    };
    onUpdateConfig({ customGradient: newGradient });
    onShowToast(`'${preset.name}' 그라데이션이 적용되었습니다.`, 'info');
  };

  const handleSelectSolidPreset = (presetHex: string, presetName: string) => {
    const newConfig: CustomGradientConfig = {
      ...gradientConfig,
      enabled: true,
      colorMode: 'solid',
      name: presetName,
      solidColor: presetHex,
      textSolidColor: presetHex,
      bgSolidColor: presetHex,
    };
    onUpdateConfig({ customGradient: newConfig });
    onShowToast(`단색 '${presetName} (${presetHex})'이 적용되었습니다.`, 'info');
  };

  const handleUpdateSiteTextKey = (key: keyof SiteTexts, value: string) => {
    const updatedTexts: SiteTexts = {
      ...(config.siteTexts || DEFAULT_SITE_TEXTS),
      [key]: value,
    };
    onUpdateConfig({ siteTexts: updatedTexts });
  };

  const handleMemberStoryFieldChange = (
    key: 'quote' | 'storyTitle' | 'storySubtitle' | 'storyContent' | 'storyNotice',
    val: string
  ) => {
    const currentStories = config.memberStories || {};
    const currentStory = currentStories[selectedStoryMember] || {};
    const updatedStories = {
      ...currentStories,
      [selectedStoryMember]: {
        ...currentStory,
        [key]: val,
      },
    };

    const globalUpdates: Partial<SiteConfig> = {
      memberStories: updatedStories,
    };

    if (selectedStoryMember === 'all') {
      if (key === 'quote') globalUpdates.heroDescription = val;
      if (key === 'storyTitle') globalUpdates.storyTitle = val;
      if (key === 'storySubtitle') globalUpdates.storySubtitle = val;
      if (key === 'storyContent') globalUpdates.storyContent = val;
      if (key === 'storyNotice') globalUpdates.storyNotice = val;
    }

    onUpdateConfig(globalUpdates);
  };

  const handleResetToDefault = () => {
    if (!window.confirm('모든 글자와 색상/그라데이션 설정을 초기 기본값으로 복원하시겠습니까?')) return;
    onUpdateConfig({
      siteTitle: DEFAULT_SITE_CONFIG.siteTitle,
      siteSubtitle: DEFAULT_SITE_CONFIG.siteSubtitle,
      heroHeadline: DEFAULT_SITE_CONFIG.heroHeadline,
      heroDescription: DEFAULT_SITE_CONFIG.heroDescription,
      siteTexts: DEFAULT_SITE_TEXTS,
      customGradient: DEFAULT_CUSTOM_GRADIENT,
    });
    onShowToast('모든 설정이 기본값으로 복원되었습니다.', 'info');
  };

  const currentPreviewCss = getGradientCss(gradientConfig);
  const isSolidMode = gradientConfig.colorMode === 'solid';

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-2xl ${
        isMinimized
          ? 'bottom-6 right-6 w-auto'
          : 'bottom-4 sm:bottom-6 right-2 sm:right-6 w-[96vw] sm:w-[500px] md:w-[560px] max-h-[85vh] flex flex-col'
      } bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/40 dark:border-indigo-500/60 rounded-3xl overflow-hidden`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold tracking-tight flex items-center gap-1.5">
              <span>실시간 비주얼 수정 스튜디오</span>
              <span className="px-1.5 py-0.2 bg-white/25 text-[10px] rounded-full font-mono">
                LIVE
              </span>
            </h3>
            {!isMinimized && (
              <p className="text-[10px] text-white/80">
                모든 제목·본문 수정 및 지우기, 선택 글자 채색, 단색 & 그라데이션 커스텀
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title={isMinimized ? '창 키우기' : '창 최소화'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="수정 모드 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Minimized View */}
      {isMinimized ? (
        <div
          onClick={() => setIsMinimized(false)}
          className="p-3 bg-white dark:bg-slate-900 cursor-pointer flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div
            className="w-5 h-5 rounded-full border border-white shadow-xs"
            style={{
              backgroundColor: isSolidMode ? gradientConfig.solidColor || '#8A2BE2' : undefined,
              backgroundImage: !isSolidMode ? currentPreviewCss : undefined,
            }}
          />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            🎨 수정 스튜디오 열기
          </span>
        </div>
      ) : (
        <>
          {/* Main Tabs Navigation */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 px-4 pt-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('gradient')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'gradient'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>🎨 색상 커스텀 (단색 & 그라데이션)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>✍️ 글 수정·지우기·선택글자 채색</span>
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 max-h-[62vh]">
            {/* TAB 1: 🎨 COLOR & GRADIENT STUDIO */}
            {activeTab === 'gradient' && (
              <div className="space-y-4">
                {/* Master Switch & Mode Selector */}
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        커스텀 색상 효과 켜기/끄기
                      </span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300">
                        {gradientConfig.enabled ? '사이트에 활성화됨' : '현재 꺼짐'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gradientConfig.enabled}
                        onChange={(e) => handleUpdateGradient({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Mode Toggle: 단색 vs 그라데이션 */}
                  <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setColorStudioSubTab('solid');
                        handleUpdateGradient({ colorMode: 'solid' });
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        gradientConfig.colorMode === 'solid' || colorStudioSubTab === 'solid'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>🎨 단색 (솔리드) 모드</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setColorStudioSubTab('gradient');
                        handleUpdateGradient({ colorMode: 'gradient' });
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        gradientConfig.colorMode !== 'solid' && colorStudioSubTab === 'gradient'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>🌈 그라데이션 모드</span>
                    </button>
                  </div>

                  {/* Live Preview Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                      <span>실시간 미리보기</span>
                      <span className="font-mono">
                        {isSolidMode ? '단색 적용' : `${gradientConfig.angle}° 각도`}
                      </span>
                    </div>
                    <div
                      className="w-full h-9 rounded-xl shadow-inner border border-black/10 flex items-center justify-center text-xs font-extrabold text-white drop-shadow-sm transition-all"
                      style={{
                        backgroundColor: isSolidMode ? gradientConfig.solidColor || '#8A2BE2' : undefined,
                        backgroundImage: !isSolidMode ? currentPreviewCss : undefined,
                      }}
                    >
                      {isSolidMode
                        ? `단색: ${gradientConfig.name || gradientConfig.solidColor || '#8A2BE2'}`
                        : gradientConfig.name || '커스텀 그라데이션'}
                    </div>
                  </div>
                </div>

                {/* --- SUBVIEW A: 🎨 단색 (솔리드) 모드 --- */}
                {isSolidMode && (
                  <div className="space-y-3.5">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        👑 시그니처 단색 프리셋 (16종)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SOLID_COLOR_PRESETS.map((preset) => {
                          const isSel = gradientConfig.solidColor?.toLowerCase() === preset.hex.toLowerCase();
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectSolidPreset(preset.hex, preset.name)}
                              className={`p-2 rounded-xl text-left border transition-all relative overflow-hidden group ${
                                isSel
                                  ? 'border-indigo-600 ring-2 ring-indigo-400/50 shadow-sm bg-indigo-50/40 dark:bg-indigo-950/30'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-900'
                              }`}
                            >
                              <div
                                className="w-full h-5 rounded-md mb-1 border border-black/10 shadow-2xs"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">
                                {preset.name}
                              </p>
                              <span className="text-[9px] font-mono text-slate-600 block truncate dark:text-slate-300">
                                {preset.hex}
                              </span>
                              {isSel && (
                                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xs">
                                  <Check className="w-2 h-2" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Solid Color Input */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          임의의 단색 직접 지정 (HEX):
                        </span>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          <input
                            type="color"
                            value={gradientConfig.solidColor || '#8A2BE2'}
                            onChange={(e) =>
                              handleUpdateGradient({
                                solidColor: e.target.value,
                                textSolidColor: e.target.value,
                                bgSolidColor: e.target.value,
                                colorMode: 'solid',
                              })
                            }
                            className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={gradientConfig.solidColor || '#8A2BE2'}
                            onChange={(e) =>
                              handleUpdateGradient({
                                solidColor: e.target.value,
                                textSolidColor: e.target.value,
                                bgSolidColor: e.target.value,
                                colorMode: 'solid',
                              })
                            }
                            className="w-20 text-[11px] font-mono text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- SUBVIEW B: 🌈 그라데이션 모드 --- */}
                {!isSolidMode && (
                  <div className="space-y-3.5">
                    {/* 12 Presets */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>원클릭 시그니처 그라데이션 프리셋 (12종)</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {GRADIENT_PRESETS.map((preset) => {
                          const isSelected =
                            gradientConfig.colorMode !== 'solid' && gradientConfig.presetId === preset.id;
                          const presetCss = `linear-gradient(${preset.angle}deg, ${preset.from} 0%, ${
                            preset.via ? preset.via + ' 50%, ' : ''
                          }${preset.to} 100%)`;

                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectGradientPreset(preset.id)}
                              className={`p-2 rounded-xl text-left border transition-all relative overflow-hidden group ${
                                isSelected
                                  ? 'border-indigo-600 ring-2 ring-indigo-400/50 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                              }`}
                            >
                              <div
                                className="w-full h-6 rounded-lg mb-1.5 shadow-2xs border border-black/10"
                                style={{ backgroundImage: presetCss }}
                              />
                              <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                {preset.name}
                              </p>
                              <span className="text-[9px] text-slate-600 block truncate dark:text-slate-300">
                                {preset.category}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fine-Tuning */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        🎨 정밀 컬러 피커 (3-Stop)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* From */}
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-1 dark:text-slate-300">시작 색상 (From)</span>
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <input
                              type="color"
                              value={gradientConfig.fromColor}
                              onChange={(e) =>
                                handleUpdateGradient({ fromColor: e.target.value, presetId: 'custom' })
                              }
                              className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={gradientConfig.fromColor}
                              onChange={(e) =>
                                handleUpdateGradient({ fromColor: e.target.value, presetId: 'custom' })
                              }
                              className="w-full text-[11px] font-mono text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                            />
                          </div>
                        </div>

                        {/* Via */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-600 dark:text-slate-300">중간 색상 (Via)</span>
                            <label className="text-[9px] text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center gap-0.5">
                              <input
                                type="checkbox"
                                checked={useViaColor}
                                onChange={(e) => {
                                  setUseViaColor(e.target.checked);
                                  handleUpdateGradient({
                                    viaColor: e.target.checked ? '#EC4899' : '',
                                    presetId: 'custom',
                                  });
                                }}
                                className="w-3 h-3 rounded"
                              />
                              <span>사용</span>
                            </label>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 ${
                              !useViaColor ? 'opacity-40 pointer-events-none' : ''
                            }`}
                          >
                            <input
                              type="color"
                              value={gradientConfig.viaColor || '#EC4899'}
                              onChange={(e) =>
                                handleUpdateGradient({ viaColor: e.target.value, presetId: 'custom' })
                              }
                              className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={gradientConfig.viaColor || ''}
                              placeholder="#선택"
                              onChange={(e) =>
                                handleUpdateGradient({ viaColor: e.target.value, presetId: 'custom' })
                              }
                              className="w-full text-[11px] font-mono text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                            />
                          </div>
                        </div>

                        {/* To */}
                        <div>
                          <span className="text-[10px] text-slate-600 block mb-1 dark:text-slate-300">끝 색상 (To)</span>
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            <input
                              type="color"
                              value={gradientConfig.toColor}
                              onChange={(e) =>
                                handleUpdateGradient({ toColor: e.target.value, presetId: 'custom' })
                              }
                              className="w-7 h-7 rounded border-none cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={gradientConfig.toColor}
                              onChange={(e) =>
                                handleUpdateGradient({ toColor: e.target.value, presetId: 'custom' })
                              }
                              className="w-full text-[11px] font-mono text-slate-800 dark:text-slate-200 uppercase bg-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Angle Slider */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            방향 및 회전 각도
                          </span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {gradientConfig.angle}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={gradientConfig.angle}
                          onChange={(e) =>
                            handleUpdateGradient({ angle: Number(e.target.value), presetId: 'custom' })
                          }
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Application Checklist */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    🎯 {isSolidMode ? '단색' : '그라데이션'} 적용 영역 선택
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={gradientConfig.textGradientEnabled}
                        onChange={(e) =>
                          handleUpdateGradient({ textGradientEnabled: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          🔤 메인 타이틀 & 제목 텍스트
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">
                          {isSolidMode ? '제목에 선명한 단색 채색' : '글자에 그라데이션 광채 클리핑 적용'}
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={gradientConfig.bgGradientEnabled}
                        onChange={(e) =>
                          handleUpdateGradient({ bgGradientEnabled: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          🌌 사이트 전체 배경 앰비언트
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">
                          {isSolidMode ? '전체 배경에 은은한 단색 틴트' : '신비롭고 몽환적인 오로라 오버레이'}
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={gradientConfig.headerGradientEnabled}
                        onChange={(e) =>
                          handleUpdateGradient({ headerGradientEnabled: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          🖼️ 상단 헤더 & 히어로 박스
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">
                          헤더 및 히어로 영역에 하이라이트 배경
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={gradientConfig.buttonGradientEnabled}
                        onChange={(e) =>
                          handleUpdateGradient({ buttonGradientEnabled: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-indigo-600"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          🌟 액션 버튼 & 배지 포인트
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">
                          {isSolidMode ? '포인트 버튼에 단색 채색' : '포인트 버튼에 화려한 그라데이션'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ✍️ ALL TEXT & WRITINGS CMS WITH INLINE COLORIZER & ERASE */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                {/* Notice banner */}
                <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>선택 글자 채색 & 지우기 안내</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    각 필드 우측의 <strong>[선택 글자 색상]</strong> 버튼을 누르고 원하는 글자만 드래그하면, 특정 글자만 단색이나 그라데이션으로 화려하게 꾸밀 수 있습니다. <strong>[지우기]</strong> 버튼으로 글자를 한번에 비울 수도 있습니다.
                  </p>
                </div>

                {/* 1. Header & Branding Texts */}
                <div className="space-y-2.5">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block">
                    🏛️ 1. 상단 브랜딩 & 탭 메뉴 글
                  </span>

                  <RichFieldEditor
                    label="사이트 메인 타이틀 (로고 옆 큰 제목)"
                    value={config.siteTitle}
                    onChange={(val) => onUpdateConfig({ siteTitle: val })}
                    onShowToast={onShowToast}
                  />

                  <RichFieldEditor
                    label="영문 서브타이틀"
                    value={config.siteSubtitle}
                    onChange={(val) => onUpdateConfig({ siteSubtitle: val })}
                    onShowToast={onShowToast}
                  />

                  <RichFieldEditor
                    label="상단 버전 배지 문구"
                    value={config.siteTexts?.headerBadge || ''}
                    placeholder="ARCHIVE V2.5"
                    onChange={(val) => handleUpdateSiteTextKey('headerBadge', val)}
                    onShowToast={onShowToast}
                  />

                  <RichFieldEditor
                    label="'이세계아이돌이란?' 버튼명"
                    value={config.siteTexts?.aboutButtonLabel || ''}
                    placeholder="이세계아이돌이란?"
                    onChange={(val) => handleUpdateSiteTextKey('aboutButtonLabel', val)}
                    onShowToast={onShowToast}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <RichFieldEditor
                      label="도감 탭 이름"
                      value={config.siteTexts?.tabAllLabel || ''}
                      placeholder="도감"
                      onChange={(val) => handleUpdateSiteTextKey('tabAllLabel', val)}
                      onShowToast={onShowToast}
                    />
                    <RichFieldEditor
                      label="소장함 탭 이름"
                      value={config.siteTexts?.tabOwnedLabel || ''}
                      placeholder="소장함"
                      onChange={(val) => handleUpdateSiteTextKey('tabOwnedLabel', val)}
                      onShowToast={onShowToast}
                    />
                    <RichFieldEditor
                      label="위시 탭 이름"
                      value={config.siteTexts?.tabWishlistLabel || ''}
                      placeholder="위시"
                      onChange={(val) => handleUpdateSiteTextKey('tabWishlistLabel', val)}
                      onShowToast={onShowToast}
                    />
                  </div>

                  <RichFieldEditor
                    label="검색창 안내문구 (Placeholder)"
                    value={config.siteTexts?.searchPlaceholder || ''}
                    placeholder="굿즈 이름, 멤버, 태그 검색... ('KIDDING', 'LP')"
                    onChange={(val) => handleUpdateSiteTextKey('searchPlaceholder', val)}
                    onShowToast={onShowToast}
                  />
                </div>

                {/* 2. Hero Headline & Description */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 block">
                    🌟 2. 상단 히어로 헤드라인 & 소개글
                  </span>

                  <RichFieldEditor
                    label="상단 메인 대형 헤드라인 (타이틀)"
                    value={config.heroHeadline}
                    placeholder="여섯 공주들의 소중한 보물들을 기록하는 박물관"
                    onChange={(val) => onUpdateConfig({ heroHeadline: val })}
                    onShowToast={onShowToast}
                  />

                  <RichFieldEditor
                    label="상단 대표 소개 본문"
                    multiline
                    rows={3}
                    value={config.heroDescription}
                    onChange={(val) => onUpdateConfig({ heroDescription: val })}
                    onShowToast={onShowToast}
                  />
                </div>

                {/* 3. Dashboard Stats Cards */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    📊 3. 대시보드 통계 카드 명칭
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <RichFieldEditor
                      label="전체 굿즈 라벨"
                      value={config.siteTexts?.statsTotalGoodsLabel || ''}
                      placeholder="전체 굿즈"
                      onChange={(val) => handleUpdateSiteTextKey('statsTotalGoodsLabel', val)}
                      onShowToast={onShowToast}
                    />
                    <RichFieldEditor
                      label="수집률 라벨"
                      value={config.siteTexts?.statsCollectionRateLabel || ''}
                      placeholder="나의 수집률"
                      onChange={(val) => handleUpdateSiteTextKey('statsCollectionRateLabel', val)}
                      onShowToast={onShowToast}
                    />
                    <RichFieldEditor
                      label="위시리스트 라벨"
                      value={config.siteTexts?.statsWishlistLabel || ''}
                      placeholder="위시리스트"
                      onChange={(val) => handleUpdateSiteTextKey('statsWishlistLabel', val)}
                      onShowToast={onShowToast}
                    />
                  </div>
                </div>

                {/* 4. Member Stories */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                      📖 4. 멤버별 스토리 & 어록 문구
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono dark:text-slate-300">
                      {MEMBERS[selectedStoryMember]?.name} 선택됨
                    </span>
                  </div>

                  {/* Member Selector chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {(['all', 'ine', 'jingburger', 'lilpa', 'jururu', 'gosegu', 'viichan', 'group'] as MemberId[]).map(
                      (mid) => {
                        const m = MEMBERS[mid];
                        const isCur = selectedStoryMember === mid;
                        return (
                          <button
                            key={mid}
                            type="button"
                            onClick={() => setSelectedStoryMember(mid)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                              isCur
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span>{m?.name || mid}</span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {(() => {
                    const currentStory = config.memberStories?.[selectedStoryMember] || {};
                    const quoteVal =
                      currentStory.quote !== undefined
                        ? currentStory.quote
                        : selectedStoryMember === 'all'
                        ? config.heroDescription
                        : MEMBERS[selectedStoryMember]?.quote || '';
                    const titleVal =
                      currentStory.storyTitle !== undefined
                        ? currentStory.storyTitle
                        : selectedStoryMember === 'all'
                        ? config.storyTitle || ''
                        : `🏛️ [${MEMBERS[selectedStoryMember]?.name}] 특별 소장품관`;
                    const subtitleVal =
                      currentStory.storySubtitle !== undefined
                        ? currentStory.storySubtitle
                        : selectedStoryMember === 'all'
                        ? config.storySubtitle || ''
                        : `👑 "${MEMBERS[selectedStoryMember]?.name}과 팬들이 함께 써 내려간 기적의 기록"`;
                    const contentVal =
                      currentStory.storyContent !== undefined
                        ? currentStory.storyContent
                        : selectedStoryMember === 'all'
                        ? config.storyContent || ''
                        : config.aboutIsegye?.members?.[selectedStoryMember]?.lore || '';

                    return (
                      <div className="space-y-2">
                        <RichFieldEditor
                          label={`[${MEMBERS[selectedStoryMember]?.name}] 상단 대표 어록/소개`}
                          value={quoteVal}
                          onChange={(val) => handleMemberStoryFieldChange('quote', val)}
                          onShowToast={onShowToast}
                        />
                        <RichFieldEditor
                          label="스토리 제목"
                          value={titleVal}
                          onChange={(val) => handleMemberStoryFieldChange('storyTitle', val)}
                          onShowToast={onShowToast}
                        />
                        <RichFieldEditor
                          label="스토리 인용구"
                          value={subtitleVal}
                          onChange={(val) => handleMemberStoryFieldChange('storySubtitle', val)}
                          onShowToast={onShowToast}
                        />
                        <RichFieldEditor
                          label="스토리 본문"
                          multiline
                          rows={3}
                          value={contentVal}
                          onChange={(val) => handleMemberStoryFieldChange('storyContent', val)}
                          onShowToast={onShowToast}
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* 5. Footer & Copyright */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block">
                    📜 5. 하단 푸터 & 저작권 문구
                  </span>

                  <RichFieldEditor
                    label="푸터 소개문"
                    value={config.siteTexts?.footerDesc || ''}
                    placeholder="이세계아이돌의 모든 소중한 순간들을 기록합니다."
                    onChange={(val) => handleUpdateSiteTextKey('footerDesc', val)}
                    onShowToast={onShowToast}
                  />

                  <RichFieldEditor
                    label="비공식 아카이브 면책 안내문"
                    value={config.siteTexts?.footerDisclaimer || ''}
                    placeholder="본 아카이빙 웹사이트는 팬 큐레이션 목적으로 제작된 비공식 아카이브입니다."
                    onChange={(val) => handleUpdateSiteTextKey('footerDisclaimer', val)}
                    onShowToast={onShowToast}
                  />

                  <RichFieldEditor
                    label="카피라이트 (Copyright)"
                    value={config.siteTexts?.footerCopyright || ''}
                    placeholder="© 2024 ISEGYE IDOL GOODS ARCHIVE PROJECT. All Rights Reserved."
                    onChange={(val) => handleUpdateSiteTextKey('footerCopyright', val)}
                    onShowToast={onShowToast}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar Actions */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본값 초기화</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              완료 및 닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
};
