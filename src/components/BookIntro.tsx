import React, { useEffect, useRef, useState } from 'react';
import './BookIntro.css';

export const BOOK_INTRO_SEEN_KEY = 'isegye-book-intro-seen-v4';

export function BookIntro({ onBegin, onComplete }: { onBegin: () => void; onComplete: () => void }) {
  const [opening, setOpening] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const orb = useRef<HTMLButtonElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const finish = useRef(onComplete);
  finish.current = onComplete;

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    orb.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = overflow; clearTimeout(timer.current); };
  }, []);

  const enter = () => {
    if (started.current) return;
    started.current = true;
    const rect = orb.current?.getBoundingClientRect();
    setOrigin({ x: rect ? rect.left + rect.width / 2 : innerWidth / 2, y: rect ? rect.top + rect.height / 2 : innerHeight / 2 });
    setOpening(true);
    onBegin();
    timer.current = setTimeout(() => finish.current(), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 2700);
  };

  return <section className={`book-intro${opening ? ' book-intro--opening' : ''}`} role="dialog" aria-modal="true" aria-labelledby="book-intro-title"
    onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); finish.current(); }
      if (event.key === 'Tab') {
        event.preventDefault();
        if (document.activeElement === orb.current) skip.current?.focus(); else orb.current?.focus();
      }
    }}>
    <header className="book-intro__heading sr-only">
      <p>ISEGYE IDOL · GOODS ARCHIVE</p>
      <h2 id="book-intro-title">여섯 빛의 기록을 펼쳐보세요</h2>
    </header>
    <div className="book-intro__atmosphere" aria-hidden="true" />
    <div className="book-intro__stage">
      <div className="book-intro__shadow" aria-hidden="true" />
      <div className="book-intro__levitation">
        <div className="book-intro__camera">
          <div className="book-intro__spread" aria-hidden="true">
            <div className="book-intro__left-page"><div className="book-intro__page-frame"><span>✧</span><p>여섯 빛이 모여<br />하나의 이야기가 되다</p><span>💜 💛 💙<br />🩷 🩵 💚</span></div></div>
            <div className="book-intro__right-page"><div className="book-intro__page-frame"><span className="book-intro__page-title">여섯 빛의 기록</span><div className="book-intro__inner-orb"><i /><i /><span>✦</span></div><span className="book-intro__page-caption">ISEGYE IDOL<br />GOODS ARCHIVE</span></div></div>
            <div className="book-intro__binding" />
          </div>
          {!imageFailed && <div className="book-intro__bookmark" aria-hidden="true"><img src="/assets/archive-intro-book.png" alt="" draggable={false} /></div>}
          {!imageFailed && <img className="book-intro__structure" src="/assets/archive-intro-book.png" alt="" aria-hidden="true" draggable={false} />}
          {!imageFailed ? <img className="book-intro__art" src="/assets/archive-intro-book.png" alt="보랏빛 우주와 여섯 색 보석으로 장식된 수집의 책" onError={() => setImageFailed(true)} draggable={false} /> :
            <div className="book-intro__fallback" aria-hidden="true"><span>✦</span><p>ISEGYE IDOL<br />COLLECTION</p><span>✧</span></div>}
          <div className="book-intro__cover" aria-hidden="true">
            <div className="book-intro__cover-front">{!imageFailed && <img src="/assets/archive-intro-book.png" alt="" draggable={false} />}</div>
            <div className="book-intro__cover-back"><div>✧<br /><span>ISEGYE IDOL</span><br />✧</div></div>
          </div>

        </div>
      </div>
          <button ref={orb} type="button" className="book-intro__orb" aria-label="수집 시작, 박물관 입장" aria-disabled={opening} onClick={enter}>
            <span className="book-intro__orb-light" aria-hidden="true" />
            {imageFailed && <span className="book-intro__orb-label">수집 시작</span>}
          </button>
    </div>
    <button ref={skip} type="button" className="book-intro__skip" onClick={() => finish.current()}>바로 입장</button>
    {opening && <div className="book-intro__portal" style={{ left: origin.x, top: origin.y }} aria-hidden="true" />}
  </section>;
}
