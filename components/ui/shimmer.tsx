'use client';

import React from 'react';

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className = '', children }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <div className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

export function ShimmerBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#efedf0] rounded-lg ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#efedf0] shadow-xs relative overflow-hidden">
      <div className="flex items-center gap-4">
        <ShimmerBlock className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <ShimmerBlock className="h-3 w-20 rounded" />
          <ShimmerBlock className="h-6 w-16 rounded" />
          <ShimmerBlock className="h-2.5 w-24 rounded" />
        </div>
      </div>
      <div className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

export function OfficialCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#efedf0] p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <ShimmerBlock className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <ShimmerBlock className="h-4 w-20 rounded-full" />
          <ShimmerBlock className="h-5 w-36 rounded" />
          <ShimmerBlock className="h-3 w-24 rounded" />
        </div>
      </div>

      <div className="space-y-2 mt-5 pt-4 border-t border-[#efedf0]">
        <ShimmerBlock className="h-3.5 w-full rounded" />
        <ShimmerBlock className="h-3.5 w-3/4 rounded" />
      </div>

      <div className="mt-5 pt-3 border-t border-[#efedf0] flex justify-between items-center">
        <ShimmerBlock className="h-3 w-24 rounded" />
        <ShimmerBlock className="h-3 w-16 rounded" />
      </div>

      <div className="absolute inset-0 -translate-x-full animate-shimmer pointer-events-none bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

