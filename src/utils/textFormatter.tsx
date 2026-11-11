import React from 'react';

/**
 * Strips formatting tags ([color:...], [solid:...], [gradient:...], [rainbow], etc.)
 * returning pure text for search matching, HTML title tags, and plain labels.
 */
export function stripCustomTextTags(text?: string): string {
  if (!text) return '';
  return text
    .replace(/\[color:[^\]]+\]([\s\S]*?)\[\/color\]/gi, '$1')
    .replace(/\[solid:[^\]]+\]([\s\S]*?)\[\/solid\]/gi, '$1')
    .replace(/\[gradient:[^\]]+\]([\s\S]*?)\[\/gradient\]/gi, '$1')
    .replace(/\[rainbow\]([\s\S]*?)\[\/rainbow\]/gi, '$1')
    .replace(/\[bg:[^\]]+\]([\s\S]*?)\[\/bg\]/gi, '$1')
    .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
}

/**
 * Parses and renders text with customizable colored letters, solid colors, and gradients.
 * Supports:
 * - [color:#HEX]선택된 글자[/color]
 * - [solid:#HEX]단색 글자[/solid]
 * - [gradient:#from,#to]그라데이션 글자[/gradient]
 * - [rainbow]무지개 글자[/rainbow]
 * - [bg:#HEX]형광펜/배경 글자[/bg]
 */
export function renderCustomText(
  rawText?: string,
  options?: {
    defaultStyle?: React.CSSProperties;
    className?: string;
  }
): React.ReactNode {
  if (rawText === undefined || rawText === null) return null;
  const text = String(rawText);

  // If text doesn't contain any tags, render directly
  if (
    !text.includes('[color:') &&
    !text.includes('[solid:') &&
    !text.includes('[gradient:') &&
    !text.includes('[rainbow]') &&
    !text.includes('[bg:') &&
    !text.includes('<span')
  ) {
    return (
      <span style={options?.defaultStyle} className={options?.className}>
        {text}
      </span>
    );
  }

  // Tokenize and parse tags
  // Regex to match our tags
  const tagRegex =
    /\[(color|solid|gradient|rainbow|bg)(?::([^\]]+))?\]([\s\S]*?)\[\/\1\]|<span style="([^"]+)">([\s\S]*?)<\/span>/gi;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = tagRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = tagRegex.lastIndex;

    // Plain text segment before the match
    if (matchStart > lastIndex) {
      elements.push(
        <span key={`plain-${keyIndex++}`} style={options?.defaultStyle}>
          {text.substring(lastIndex, matchStart)}
        </span>
      );
    }

    if (match[0].startsWith('<span')) {
      // HTML style span
      const styleString = match[4];
      const innerContent = match[5];
      const styleObj: React.CSSProperties = {};
      styleString.split(';').forEach((rule) => {
        const [prop, val] = rule.split(':').map((s) => s.trim());
        if (prop && val) {
          if (prop === 'color') styleObj.color = val;
          if (prop === 'background-color' || prop === 'background') styleObj.background = val;
          if (prop === 'font-weight') styleObj.fontWeight = val as any;
        }
      });
      elements.push(
        <span key={`html-span-${keyIndex++}`} style={{ ...options?.defaultStyle, ...styleObj }}>
          {innerContent}
        </span>
      );
    } else {
      const tagType = match[1]?.toLowerCase();
      const tagParam = match[2]?.trim();
      const innerContent = match[3];

      if (tagType === 'color' || tagType === 'solid') {
        const colorVal = tagParam || '#8A2BE2';
        elements.push(
          <span
            key={`color-${keyIndex++}`}
            style={{
              ...options?.defaultStyle,
              color: colorVal,
              fontWeight: 'inherit',
            }}
          >
            {innerContent}
          </span>
        );
      } else if (tagType === 'gradient') {
        const parts = (tagParam || '#8A2BE2,#EC4899').split(',').map((p) => p.trim());
        const from = parts[0] || '#8A2BE2';
        const via = parts.length > 2 ? parts[1] : undefined;
        const to = parts.length > 2 ? parts[2] : parts[1] || '#EC4899';
        const gradCss = via
          ? `linear-gradient(135deg, ${from} 0%, ${via} 50%, ${to} 100%)`
          : `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;

        elements.push(
          <span
            key={`grad-${keyIndex++}`}
            style={{
              ...options?.defaultStyle,
              backgroundImage: gradCss,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            }}
          >
            {innerContent}
          </span>
        );
      } else if (tagType === 'rainbow') {
        elements.push(
          <span
            key={`rainbow-${keyIndex++}`}
            style={{
              ...options?.defaultStyle,
              backgroundImage:
                'linear-gradient(90deg, #8A2BE2, #2563EB, #10B981, #F59E0B, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              fontWeight: 'bold',
            }}
          >
            {innerContent}
          </span>
        );
      } else if (tagType === 'bg') {
        elements.push(
          <span
            key={`bg-${keyIndex++}`}
            style={{
              ...options?.defaultStyle,
              backgroundColor: tagParam || 'rgba(138, 43, 226, 0.2)',
              borderRadius: '4px',
              padding: '1px 4px',
            }}
          >
            {innerContent}
          </span>
        );
      }
    }

    lastIndex = matchEnd;
  }

  // Trailing plain text
  if (lastIndex < text.length) {
    elements.push(
      <span key={`plain-${keyIndex++}`} style={options?.defaultStyle}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <span className={options?.className}>{elements}</span>;
}

/**
 * Applies color formatting to selected text within an input or textarea.
 */
export function applyFormattingToSelection(
  fullText: string,
  selectionStart: number,
  selectionEnd: number,
  format: {
    type: 'solid' | 'gradient' | 'rainbow' | 'erase-formatting' | 'clear-selection';
    color?: string; // hex
    gradientColors?: { from: string; via?: string; to: string };
  }
): { newText: string; newCursorStart: number; newCursorEnd: number } {
  // If nothing is selected or start === end, and it's not clear-selection
  if (selectionStart === selectionEnd) {
    // If no selection, apply to entire string or return as is
    if (format.type === 'clear-selection') {
      return { newText: '', newCursorStart: 0, newCursorEnd: 0 };
    }
    // If entire text should be formatted
    const selected = fullText;
    let tag = '';
    if (format.type === 'solid') {
      tag = `[color:${format.color || '#8A2BE2'}]${selected}[/color]`;
    } else if (format.type === 'gradient') {
      const g = format.gradientColors || { from: '#8A2BE2', to: '#EC4899' };
      const param = g.via ? `${g.from},${g.via},${g.to}` : `${g.from},${g.to}`;
      tag = `[gradient:${param}]${selected}[/gradient]`;
    } else if (format.type === 'rainbow') {
      tag = `[rainbow]${selected}[/rainbow]`;
    } else if (format.type === 'erase-formatting') {
      tag = stripCustomTextTags(selected);
    }
    return { newText: tag, newCursorStart: 0, newCursorEnd: tag.length };
  }

  const before = fullText.slice(0, selectionStart);
  const selected = fullText.slice(selectionStart, selectionEnd);
  const after = fullText.slice(selectionEnd);

  if (format.type === 'clear-selection') {
    // Erase the selected letters completely
    return {
      newText: before + after,
      newCursorStart: selectionStart,
      newCursorEnd: selectionStart,
    };
  }

  if (format.type === 'erase-formatting') {
    const unformatted = stripCustomTextTags(selected);
    return {
      newText: before + unformatted + after,
      newCursorStart: selectionStart,
      newCursorEnd: selectionStart + unformatted.length,
    };
  }

  let formattedSegment = '';
  if (format.type === 'solid') {
    formattedSegment = `[color:${format.color || '#8A2BE2'}]${selected}[/color]`;
  } else if (format.type === 'gradient') {
    const g = format.gradientColors || { from: '#8A2BE2', to: '#EC4899' };
    const param = g.via ? `${g.from},${g.via},${g.to}` : `${g.from},${g.to}`;
    formattedSegment = `[gradient:${param}]${selected}[/gradient]`;
  } else if (format.type === 'rainbow') {
    formattedSegment = `[rainbow]${selected}[/rainbow]`;
  }

  const newText = before + formattedSegment + after;
  return {
    newText,
    newCursorStart: selectionStart,
    newCursorEnd: selectionStart + formattedSegment.length,
  };
}
