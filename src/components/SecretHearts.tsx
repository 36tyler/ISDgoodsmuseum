import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const HEARTS = ['💜', '💛', '💙', '🩷', '🩵', '💚'];
const SECRET_SEQUENCE = [0, 0, 1, 2, 3, 3, 4, 5, 5, 5, 5, 5, 5, 5];
const GRADIENTS = [
  'linear-gradient(145deg, #faf5ff, #c084fc)',
  'linear-gradient(145deg, #fefce8, #facc15)',
  'linear-gradient(145deg, #eff6ff, #60a5fa)',
  'linear-gradient(145deg, #fdf2f8, #f472b6)',
  'linear-gradient(145deg, #ecfeff, #67e8f9)',
  'linear-gradient(145deg, #f0fdf4, #4ade80)',
];

export function SecretHearts() {
  const [index, setIndex] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; heart: string; x: number; y: number }[]>([]);
  const burstId = useRef(0);
  const sequenceStep = useRef(0);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex(value => (value + 1) % HEARTS.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger.current?.focus();
    };
  }, [open]);

  const collectHeart = () => {
    const bounds = trigger.current?.getBoundingClientRect();
    if (bounds) {
      const burst = { id: ++burstId.current, heart: HEARTS[index], x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      setBursts(previous => [...previous, burst]);
    }
    sequenceStep.current = index === SECRET_SEQUENCE[sequenceStep.current]
      ? sequenceStep.current + 1
      : index === SECRET_SEQUENCE[0] ? 1 : 0;
    if (sequenceStep.current === SECRET_SEQUENCE.length) {
      sequenceStep.current = 0;
      setOpen(true);
    }
  };

  return <>
    <button
      ref={trigger}
      type="button"
      aria-label={`${HEARTS[index]} 하트`}
      onClick={collectHeart}
      className="relative overflow-hidden w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-black bg-white text-black shadow-sm shrink-0 flex items-center justify-center text-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 active:scale-95"
    >
      {GRADIENTS.map((background, i) => <span key={i} aria-hidden="true" className="absolute inset-0 transition-opacity duration-700" style={{ background, opacity: index === i ? 1 : 0 }} />)}
      <span className="relative" aria-hidden="true">{HEARTS[index]}</span>
    </button>
    {bursts.length > 0 && createPortal(
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
        {bursts.map(burst => <div key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
          {[-26, -13, 0, 13, 26].map((drift, i) => <span
            key={i}
            className="secret-heart-particle absolute text-sm"
            style={{ '--heart-drift': `${drift}px`, '--heart-rise': `${56 + (2 - Math.abs(i - 2)) * 12}px` } as React.CSSProperties}
            onAnimationEnd={() => setBursts(previous => previous.filter(item => item.id !== burst.id))}
          >{burst.heart}</span>)}
        </div>)}
      </div>, document.body
    )}
    {open && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 sm:p-8" onClick={() => setOpen(false)}>
        <div role="dialog" aria-modal="true" aria-label="여섯 하트의 비밀 사진" className="relative w-full max-w-6xl rounded-2xl border-2 border-black bg-white p-2 pt-12 shadow-2xl" onClick={event => event.stopPropagation()}>
          <button ref={closeButton} type="button" aria-label="비밀 사진 닫기" onClick={() => setOpen(false)} className="absolute right-3 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl text-black hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-purple-600">×</button>
          <img src="/assets/secret-hearts.png" alt="풀밭에서 함께 웃으며 사진을 찍는 이세계아이돌 여섯 멤버" className="mx-auto max-h-[80dvh] w-full rounded-lg object-contain" />
        </div>
      </div>, document.body
    )}
  </>;
}
