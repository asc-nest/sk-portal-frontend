'use client';

import React from 'react';
import Link from 'next/link';
import useAuth from '@/hooks/use-auth';

interface NavAuthButtonProps {
  className?: string;
}

export default function NavAuthButton({ className = '' }: NavAuthButtonProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className={`h-9 w-28 rounded-lg bg-[#efedf0] animate-pulse ${className}`} />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#242424] text-white hover:bg-[#ba0c00] transition-all text-xs font-bold shadow-sm ${className}`}
      >
        <span className="material-symbols-outlined text-[16px]">lock</span>
        Council Sign In
      </Link>
    );
  }

  const displayName = user.name || user.username || 'Hon. Official';
  const roleTitle = user.roles?.[0]?.replace('sk_', '').replace('_', ' ').toUpperCase() || 'OFFICIAL';
  const avatarUrl = user.profile?.avatar_url;
  const initials = displayName
    .split(' ')
    .filter((w) => !w.includes('.'))
    .slice(0, 2)
    .map((n) => n[0])
    .join('') || 'SK';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#ba0c00] text-white transition-all text-xs font-bold shadow-sm group border border-transparent hover:border-white/10"
        title="Open Council Desk & Passes"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden bg-[#ba0c00] group-hover:bg-white text-white group-hover:text-[#ba0c00] flex items-center justify-center text-[10px] font-extrabold shrink-0 border border-white/20 transition-colors">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="max-w-[120px] sm:max-w-[160px] truncate text-[12px] font-bold text-white">
            {displayName}
          </span>
          <span className="text-[9px] text-[#eebd90] font-semibold tracking-wider uppercase">
            {roleTitle}
          </span>
        </div>
        <span className="material-symbols-outlined text-[15px] text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all">
          arrow_forward
        </span>
      </Link>

      <button
        onClick={() => logout()}
        className="p-1.5 text-[#74777e] hover:text-[#ba0c00] hover:bg-[#efedf0] rounded-lg transition-colors cursor-pointer"
        title="Sign Out"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
      </button>
    </div>
  );
}

