import React from 'react';

type BrandMarkProps = {
  size?: number;
  showWordmark?: boolean;
  compact?: boolean;
};

export default function BrandMark({ size = 34, showWordmark = true, compact = false }: BrandMarkProps) {
  return (
    <div className={`${compact ? 'ulab-brand-compact' : ''} ulab-brand`} aria-label="ULAB">
      <svg className="ulab-brand-mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="ulab-brand-a" x1="8" y1="10" x2="55" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset=".5" stopColor="#6366F1" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="ulab-brand-b" x1="14" y1="52" x2="56" y2="15" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06B6D4" />
            <stop offset=".55" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#C084FC" />
          </linearGradient>
        </defs>
        <path d="M14 11v25.5c0 5.6 2.6 9.3 8.2 11.3l8 2.9V35.3L24.4 33c-1.8-.7-2.6-1.8-2.6-3.8V11H14Z" fill="url(#ulab-brand-a)"/>
        <path d="M30.2 52.7V37.5l7.6 2.9c2.3.9 3.9.1 3.9-2.5V12.2L49.8 9v30.2c0 7.1-4.7 11.7-11.2 9.3l-8.4-3.1v7.3Z" fill="url(#ulab-brand-b)"/>
        <path d="M27.6 13.7h8.1v20.5l-8.1-3.1V13.7Z" fill="#EEF2FF" fillOpacity=".9"/>
      </svg>
      {showWordmark && <span className="ulab-brand-word">ULAB</span>}
    </div>
  );
}
