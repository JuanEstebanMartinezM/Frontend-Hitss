import React from 'react';
import hitssLogoSrc from '../assets/hitss_logo.jpg';

interface HitssLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export const HitssLogo: React.FC<HitssLogoProps> = ({ className = 'h-8', variant = 'light' }) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logo oficial Global Hitss */}
      <div className="w-9 h-9 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <img
          src={hitssLogoSrc}
          alt="Global Hitss"
          className="w-8 h-8 object-contain"
        />
      </div>

      {/* Tipografía de Marca */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-extrabold text-sm tracking-widest uppercase ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
          >
            Global
          </span>
          <span className="font-black text-sm tracking-widest text-[#E31837] uppercase">
            Hitss
          </span>
        </div>
        <span
          className={`text-[9px] font-medium uppercase tracking-widest mt-0.5 ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          A Global Digital Company
        </span>
      </div>
    </div>
  );
};

