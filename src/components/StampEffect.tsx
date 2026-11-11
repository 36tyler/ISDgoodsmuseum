import React from 'react';

interface StampSealProps {
  isStamping?: boolean;
  size?: 'sm' | 'md' | 'lg';
  date?: string;
  className?: string;
}

export const StampSeal: React.FC<StampSealProps> = ({
  isStamping = false,
  size = 'md',
  date = '소장성공',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24',
    md: 'w-32 h-32 sm:w-40 sm:h-40',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
  };

  const fontSizes = {
    sm: {
      top: 'text-[8px] sm:text-[9px]',
      main: 'text-sm sm:text-base tracking-widest',
      bottom: 'text-[7px] sm:text-[8px]',
      star: 'text-[8px]',
      borderOuter: 'border-[2.5px]',
      borderInner: 'border-[2px]',
      padding: 'p-1',
    },
    md: {
      top: 'text-[10px] sm:text-[11px]',
      main: 'text-xl sm:text-2xl font-black tracking-widest',
      bottom: 'text-[9px] sm:text-[10px]',
      star: 'text-xs',
      borderOuter: 'border-[3.5px]',
      borderInner: 'border-[2.5px]',
      padding: 'p-1.5',
    },
    lg: {
      top: 'text-xs sm:text-sm font-bold',
      main: 'text-3xl sm:text-4xl font-black tracking-widest',
      bottom: 'text-[11px] sm:text-xs',
      star: 'text-sm',
      borderOuter: 'border-[4.5px]',
      borderInner: 'border-[3px]',
      padding: 'p-2',
    },
  };

  const f = fontSizes[size];

  return (
    <div
      className={`relative select-none pointer-events-none rounded-full flex items-center justify-center font-bold tracking-widest text-rose-800 dark:text-rose-200 border-dashed border-rose-600/90 dark:border-rose-500/90 shadow-lg backdrop-blur-2xs transition-transform ${sizeClasses[size]} ${f.borderOuter} ${f.padding} ${
        isStamping ? 'animate-stamp-slam' : '-rotate-12'
      } ${className}`}
      style={{
        boxShadow: 'inset 0 0 16px rgba(225, 29, 72, 0.22), 0 6px 18px rgba(225, 29, 72, 0.2)',
      }}
    >
      {/* Inner double border with textured ink background */}
      <div className={`w-full h-full rounded-full border-rose-600/90 dark:border-rose-500/90 flex flex-col items-center justify-center relative overflow-hidden bg-rose-50/40 dark:bg-rose-950/40 p-1.5 ${f.borderInner}`}>
        <span className={`${f.top} uppercase font-extrabold tracking-wider opacity-90 leading-none`}>
          ISEGYE IDOL
        </span>

        {/* Big center stamp mark */}
        <div className="my-1 border-y-2 border-rose-600/80 dark:border-rose-500/80 py-0.5 sm:py-1 w-full text-center bg-rose-600/15 dark:bg-rose-500/20">
          <span className={`${f.main} block leading-tight text-rose-800 dark:text-rose-200 drop-shadow-xs`}>
            소장완료
          </span>
        </div>

        <span className={`${f.bottom} font-mono font-bold opacity-90 leading-none tracking-normal`}>
          {date}
        </span>

        {/* Vintage stamp stars */}
        <span className={`absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 ${f.star} text-rose-500`}>★</span>
        <span className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 ${f.star} text-rose-500`}>★</span>
      </div>
    </div>
  );
};
