'use client';

import React from 'react';

interface CivicLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function CivicLoader({
  size = 'md',
  label,
  sublabel,
  className = '',
}: CivicLoaderProps) {
  const sizeMap = {
    sm: {
      container: 'w-10 h-10',
      badge: 'w-6 h-6 text-[9px]',
      stroke: 'border-2',
    },
    md: {
      container: 'w-16 h-16',
      badge: 'w-9 h-9 text-xs',
      stroke: 'border-[2.5px]',
    },
    lg: {
      container: 'w-20 h-20',
      badge: 'w-12 h-12 text-sm',
      stroke: 'border-3',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3.5 ${className}`}>
      {/* Concentric Dual-Ring Orbital Spinner */}
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Outer Ring: Taguig Crimson Clockwise */}
        <div
          className={`absolute inset-0 rounded-full ${currentSize.stroke} border-t-[#ba0c00] border-r-transparent border-b-[#ba0c00]/30 border-l-transparent animate-spin`}
        />

        {/* Inner Ring: Taguig Horizon Gold Counter-Clockwise */}
        <div
          className={`absolute inset-1.5 rounded-full ${currentSize.stroke} border-t-transparent border-r-[#eebd90] border-b-transparent border-l-[#eebd90]/40 animate-spin-reverse`}
        />

        {/* Civic Center Badge */}
        <div
          className={`${currentSize.badge} rounded-full bg-[#242424] text-[#eebd90] flex items-center justify-center font-extrabold font-['Poppins'] shadow-md border border-white/10 select-none`}
        >
          SK
        </div>
      </div>

      {/* Optional Civic Status Readout */}
      {(label || sublabel) && (
        <div className="text-center space-y-1">
          {label && (
            <p className="text-xs sm:text-sm font-bold text-[#0e0f0f] tracking-tight">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[11px] text-[#74777e] tracking-wide">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

